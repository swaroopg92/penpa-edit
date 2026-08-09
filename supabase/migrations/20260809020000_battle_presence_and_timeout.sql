alter table public.battle_rooms add column if not exists finish_reason text;
alter table public.battle_players add column if not exists left_at timestamptz;
alter table public.battle_rooms drop constraint if exists battle_rooms_finish_reason_check;
alter table public.battle_rooms add constraint battle_rooms_finish_reason_check
  check (finish_reason is null or finish_reason in ('solved', 'time_limit'));

create or replace function public.expire_battle_rooms()
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.battle_rooms
    set status='finished', finished_at=started_at+interval '20 minutes', finish_reason='time_limit'
    where status='playing' and started_at is not null and now()>=started_at+interval '20 minutes';
  delete from public.battle_rooms r
    where not exists (
        select 1 from public.battle_players p
        where p.room_id=r.id and p.left_at is null and p.last_seen_at>now()-interval '60 seconds'
      );
end $$;

create or replace function public.start_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if not exists(select 1 from public.battle_rooms r join public.battle_player_secrets s on s.player_id=r.host_player_id
    where r.id=p_room_id and s.player_token=p_player_token) then raise exception 'Only the host can start this battle.'; end if;
  update public.battle_rooms set status='playing',started_at=now()+interval '3 seconds',finished_at=null,finish_reason=null
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
  update public.battle_rooms set status='preparing',puzzle_hash=null,started_at=null,finished_at=null,finish_reason=null where id=p_room_id and status='finished';
end $$;

create or replace function public.touch_battle_player(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
begin
  update public.battle_players p set last_seen_at=now(),left_at=null
    from public.battle_player_secrets s
    where p.id=s.player_id and p.room_id=p_room_id and s.player_token=p_player_token;
  perform public.expire_battle_rooms();
end $$;

create or replace function public.leave_battle_room(p_room_id uuid,p_player_token uuid)
returns void language plpgsql security definer set search_path = public, pg_temp as $$
declare leaving_player uuid; next_host uuid;
begin
  select p.id into leaving_player from public.battle_players p
    join public.battle_player_secrets s on s.player_id=p.id
    where p.room_id=p_room_id and s.player_token=p_player_token limit 1;
  if leaving_player is null then return; end if;
  update public.battle_rooms set host_player_id=null where id=p_room_id and host_player_id=leaving_player;
  update public.battle_players set left_at=now() where id=leaving_player;
  if not exists(select 1 from public.battle_players where room_id=p_room_id and left_at is null) then
    delete from public.battle_rooms where id=p_room_id;
    return;
  end if;
  select id into next_host from public.battle_players where room_id=p_room_id and left_at is null order by joined_at,id limit 1;
  update public.battle_rooms set host_player_id=coalesce(host_player_id,next_host) where id=p_room_id;
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
    if (select count(*) from public.battle_players where room_id=target_room.id and left_at is null)>=4 then raise exception 'This room is full.'; end if;
    p_player_name:=left(trim(p_player_name),24);
    if char_length(p_player_name)<1 then raise exception 'Player name is required.'; end if;
    select color into chosen_color from unnest(array['red','blue','green','orange']) color
      where color not in (select p.color from public.battle_players p where p.room_id=target_room.id and p.left_at is null) limit 1;
    insert into public.battle_players(room_id,name,color,left_at) values(target_room.id,p_player_name,coalesce(chosen_color,'red'),null) returning * into target_player;
    insert into public.battle_player_secrets(player_id,player_token) values(target_player.id,p_player_token);
  else
    update public.battle_players set last_seen_at=now(),left_at=null,name=left(trim(p_player_name),24) where id=target_player.id returning * into target_player;
  end if;
  return jsonb_build_object('room',to_jsonb(target_room),'player_id',target_player.id);
end $$;

create or replace function public.submit_battle_move(p_room_id uuid,p_player_token uuid,p_row_index smallint,p_col_index smallint,p_digit smallint)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target_room public.battle_rooms; target_player public.battle_players; secret public.battle_room_secrets;
  is_correct boolean; delta smallint; blank_count int:=0; solved_count int; r int; c int;
begin
  update public.battle_players p set last_seen_at=now()
    from public.battle_player_secrets s
    where p.id=s.player_id and p.room_id=p_room_id and s.player_token=p_player_token;
  perform public.expire_battle_rooms();
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
    if solved_count>=blank_count then
      update public.battle_rooms set status='finished',finished_at=now(),finish_reason='solved' where id=p_room_id;
    end if;
  end if;
  return jsonb_build_object('correct',is_correct,'already_solved',false,'score_delta',delta,'score',target_player.score);
end $$;

grant execute on function public.expire_battle_rooms() to anon,authenticated;
grant execute on function public.touch_battle_player(uuid,uuid) to anon,authenticated;
grant execute on function public.leave_battle_room(uuid,uuid) to anon,authenticated;
