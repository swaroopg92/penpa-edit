alter table public.battle_rooms drop constraint if exists battle_rooms_status_check;
alter table public.battle_rooms add constraint battle_rooms_status_check
  check (status in ('preparing', 'lobby', 'playing', 'finished'));
alter table public.battle_rooms alter column puzzle_hash drop not null;
alter table public.battle_rooms drop constraint if exists battle_rooms_puzzle_hash_check;
alter table public.battle_rooms add constraint battle_rooms_puzzle_hash_check
  check (puzzle_hash is null or left(puzzle_hash, 1) = '#');
alter table public.battle_rooms add column if not exists difficulty text not null default 'easy';
alter table public.battle_rooms drop constraint if exists battle_rooms_difficulty_check;
alter table public.battle_rooms add constraint battle_rooms_difficulty_check
  check (difficulty in ('easy', 'normal', 'hard'));

alter table public.battle_players add column if not exists color text;
with ranked as (
  select id, row_number() over (partition by room_id order by joined_at, id) as position
  from public.battle_players
)
update public.battle_players p
set color = (array['red','blue','green','orange'])[1 + ((ranked.position - 1) % 4)]
from ranked where ranked.id = p.id and p.color is null;
alter table public.battle_players alter column color set default 'red';
alter table public.battle_players alter column color set not null;
alter table public.battle_players drop constraint if exists battle_players_color_check;
alter table public.battle_players add constraint battle_players_color_check
  check (color in ('red', 'blue', 'green', 'orange'));

create or replace function public.create_battle_room_v2(
  p_player_name text,
  p_player_token uuid,
  p_grid_size smallint,
  p_variants text[],
  p_difficulty text default 'easy'
)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare created_room public.battle_rooms; created_player public.battle_players;
begin
  p_player_name := left(trim(p_player_name), 24);
  if char_length(p_player_name) < 1 then raise exception 'Player name is required.'; end if;
  if p_grid_size not in (6, 9) then raise exception 'Grid size must be 6 or 9.'; end if;
  if p_difficulty not in ('easy','normal','hard') then raise exception 'Invalid difficulty.'; end if;
  insert into public.battle_rooms(code,status,grid_size,variants,puzzle_hash,difficulty)
    values (public.battle_room_code(),'preparing',p_grid_size,coalesce(p_variants,array['classic']::text[]),null,p_difficulty)
    returning * into created_room;
  insert into public.battle_players(room_id,name,color)
    values (created_room.id,p_player_name,'red') returning * into created_player;
  insert into public.battle_player_secrets(player_id,player_token) values (created_player.id,p_player_token);
  update public.battle_rooms set host_player_id=created_player.id where id=created_room.id returning * into created_room;
  return jsonb_build_object('room',to_jsonb(created_room),'player_id',created_player.id);
end $$;

create or replace function public.prepare_battle_room(
  p_room_id uuid, p_player_token uuid, p_puzzle_hash text, p_givens jsonb, p_solution jsonb
)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare target_room public.battle_rooms; r int; c int; value int;
begin
  select r0.* into target_room from public.battle_rooms r0
    join public.battle_player_secrets s on s.player_id=r0.host_player_id
    where r0.id=p_room_id and s.player_token=p_player_token for update of r0;
  if target_room.id is null then raise exception 'Only the host can prepare this battle.'; end if;
  if target_room.status <> 'preparing' then raise exception 'This room is not being prepared.'; end if;
  if left(p_puzzle_hash,1) <> '#' then raise exception 'Invalid puzzle link.'; end if;
  if jsonb_typeof(p_givens)<>'array' or jsonb_array_length(p_givens)<>target_room.grid_size or
     jsonb_typeof(p_solution)<>'array' or jsonb_array_length(p_solution)<>target_room.grid_size then
    raise exception 'Puzzle dimensions do not match the grid size.';
  end if;
  for r in 0..target_room.grid_size-1 loop
    if jsonb_array_length(p_givens->r)<>target_room.grid_size or jsonb_array_length(p_solution->r)<>target_room.grid_size then
      raise exception 'Puzzle rows do not match the grid size.';
    end if;
    for c in 0..target_room.grid_size-1 loop
      value := (p_solution->r->>c)::int;
      if value<1 or value>target_room.grid_size then raise exception 'Solution contains an invalid digit.'; end if;
      value := (p_givens->r->>c)::int;
      if value<0 or value>target_room.grid_size then raise exception 'Givens contain an invalid digit.'; end if;
    end loop;
  end loop;
  insert into public.battle_room_secrets(room_id,givens,solution) values (p_room_id,p_givens,p_solution)
    on conflict (room_id) do update set givens=excluded.givens,solution=excluded.solution;
  update public.battle_rooms set puzzle_hash=p_puzzle_hash,status='lobby',started_at=null,finished_at=null where id=p_room_id;
end $$;

create or replace function public.join_battle_room(p_room_code text,p_player_name text,p_player_token uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target_room public.battle_rooms; target_player public.battle_players; chosen_color text;
begin
  select * into target_room from public.battle_rooms where code=upper(trim(p_room_code));
  if target_room.id is null then raise exception 'Room not found.'; end if;
  select p.* into target_player from public.battle_players p join public.battle_player_secrets s on s.player_id=p.id
    where p.room_id=target_room.id and s.player_token=p_player_token limit 1;
  if target_player.id is null then
    if target_room.status <> 'lobby' then raise exception 'This battle is not open for joining.'; end if;
    if (select count(*) from public.battle_players where room_id=target_room.id)>=4 then raise exception 'This room is full.'; end if;
    p_player_name:=left(trim(p_player_name),24);
    if char_length(p_player_name)<1 then raise exception 'Player name is required.'; end if;
    select color into chosen_color from unnest(array['red','blue','green','orange']) color
      where color not in (select p.color from public.battle_players p where p.room_id=target_room.id) limit 1;
    insert into public.battle_players(room_id,name,color) values(target_room.id,p_player_name,coalesce(chosen_color,'red')) returning * into target_player;
    insert into public.battle_player_secrets(player_id,player_token) values(target_player.id,p_player_token);
  else
    update public.battle_players set last_seen_at=now() where id=target_player.id;
  end if;
  return jsonb_build_object('room',to_jsonb(target_room),'player_id',target_player.id);
end $$;

create or replace function public.update_battle_player_name(p_room_id uuid,p_player_token uuid,p_name text)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  p_name:=left(trim(p_name),24);
  if char_length(p_name)<1 then raise exception 'Player name is required.'; end if;
  update public.battle_players p set name=p_name,last_seen_at=now()
    from public.battle_player_secrets s where p.id=s.player_id and p.room_id=p_room_id and s.player_token=p_player_token;
  if not found then raise exception 'Player session not found.'; end if;
end $$;

create or replace function public.start_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists(select 1 from public.battle_rooms r join public.battle_player_secrets s on s.player_id=r.host_player_id
    where r.id=p_room_id and s.player_token=p_player_token) then raise exception 'Only the host can start this battle.'; end if;
  update public.battle_rooms set status='playing',started_at=now()+interval '3 seconds',finished_at=null
    where id=p_room_id and status='lobby';
end $$;

create or replace function public.begin_battle_rematch(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists(select 1 from public.battle_rooms r join public.battle_player_secrets s on s.player_id=r.host_player_id
    where r.id=p_room_id and s.player_token=p_player_token) then raise exception 'Only the host can start a rematch.'; end if;
  delete from public.battle_moves where room_id=p_room_id;
  delete from public.battle_room_secrets where room_id=p_room_id;
  update public.battle_players set score=0 where room_id=p_room_id;
  update public.battle_rooms set status='preparing',puzzle_hash=null,started_at=null,finished_at=null where id=p_room_id and status='finished';
end $$;

create or replace function public.submit_battle_move(p_room_id uuid,p_player_token uuid,p_row_index smallint,p_col_index smallint,p_digit smallint)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target_room public.battle_rooms; target_player public.battle_players; secret public.battle_room_secrets;
  is_correct boolean; delta smallint; blank_count int:=0; solved_count int; r int; c int;
begin
  select * into target_room from public.battle_rooms where id=p_room_id for update;
  if target_room.status<>'playing' or now()<target_room.started_at then raise exception 'The battle is not running.'; end if;
  if p_row_index<0 or p_col_index<0 or p_row_index>=target_room.grid_size or p_col_index>=target_room.grid_size or p_digit<1 or p_digit>target_room.grid_size then raise exception 'Move is outside the grid.'; end if;
  select p.* into target_player from public.battle_players p join public.battle_player_secrets s on s.player_id=p.id
    where p.room_id=p_room_id and s.player_token=p_player_token limit 1;
  if target_player.id is null then raise exception 'Player session not found.'; end if;
  select * into secret from public.battle_room_secrets where room_id=p_room_id;
  if (secret.givens->p_row_index->>p_col_index)::int<>0 then raise exception 'Given digits cannot be changed.'; end if;
  if exists(select 1 from public.battle_moves where room_id=p_room_id and row_index=p_row_index and col_index=p_col_index and correct) then
    return jsonb_build_object('correct',true,'already_solved',true,'score_delta',0,'score',target_player.score);
  end if;
  is_correct:=(secret.solution->p_row_index->>p_col_index)::int=p_digit;
  delta:=case when is_correct then 1 else -2 end;
  insert into public.battle_moves(room_id,player_id,row_index,col_index,digit,correct,score_delta)
    values(p_room_id,target_player.id,p_row_index,p_col_index,p_digit,is_correct,delta);
  update public.battle_players set score=score+delta,last_seen_at=now() where id=target_player.id returning * into target_player;
  if is_correct then
    for r in 0..target_room.grid_size-1 loop for c in 0..target_room.grid_size-1 loop
      if (secret.givens->r->>c)::int=0 then blank_count:=blank_count+1; end if;
    end loop; end loop;
    select count(*) into solved_count from public.battle_moves where room_id=p_room_id and correct;
    if solved_count>=blank_count then update public.battle_rooms set status='finished',finished_at=now() where id=p_room_id; end if;
  end if;
  return jsonb_build_object('correct',is_correct,'already_solved',false,'score_delta',delta,'score',target_player.score);
end $$;

grant execute on function public.create_battle_room_v2(text,uuid,smallint,text[],text) to anon,authenticated;
grant execute on function public.prepare_battle_room(uuid,uuid,text,jsonb,jsonb) to anon,authenticated;
grant execute on function public.update_battle_player_name(uuid,uuid,text) to anon,authenticated;
grant execute on function public.begin_battle_rematch(uuid,uuid) to anon,authenticated;
