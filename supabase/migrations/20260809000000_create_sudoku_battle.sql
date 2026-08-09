create extension if not exists pgcrypto;

create table if not exists public.battle_rooms (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9]{6}$'),
  status text not null default 'lobby' check (status in ('lobby', 'playing', 'finished')),
  host_player_id uuid,
  grid_size smallint not null check (grid_size in (6, 9)),
  variants text[] not null default array['classic']::text[],
  puzzle_hash text not null check (left(puzzle_hash, 1) = '#'),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.battle_room_secrets (
  room_id uuid primary key references public.battle_rooms(id) on delete cascade,
  givens jsonb not null,
  solution jsonb not null
);

create table if not exists public.battle_players (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  score integer not null default 0,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

alter table public.battle_rooms
  drop constraint if exists battle_rooms_host_player_id_fkey;
alter table public.battle_rooms
  add constraint battle_rooms_host_player_id_fkey
  foreign key (host_player_id) references public.battle_players(id) on delete set null;

create table if not exists public.battle_player_secrets (
  player_id uuid primary key references public.battle_players(id) on delete cascade,
  player_token uuid not null
);

create index if not exists battle_player_secrets_token_idx
  on public.battle_player_secrets(player_token);

create table if not exists public.battle_moves (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.battle_rooms(id) on delete cascade,
  player_id uuid not null references public.battle_players(id) on delete cascade,
  row_index smallint not null check (row_index between 0 and 8),
  col_index smallint not null check (col_index between 0 and 8),
  digit smallint not null check (digit between 1 and 9),
  correct boolean not null,
  score_delta smallint not null check (score_delta in (-2, 1)),
  created_at timestamptz not null default now()
);

create unique index if not exists battle_one_correct_move_per_cell
  on public.battle_moves(room_id, row_index, col_index)
  where correct;

alter table public.battle_rooms enable row level security;
alter table public.battle_room_secrets enable row level security;
alter table public.battle_players enable row level security;
alter table public.battle_player_secrets enable row level security;
alter table public.battle_moves enable row level security;

drop policy if exists "battle rooms are readable" on public.battle_rooms;
create policy "battle rooms are readable" on public.battle_rooms for select using (true);
drop policy if exists "battle players are readable" on public.battle_players;
create policy "battle players are readable" on public.battle_players for select using (true);
drop policy if exists "confirmed battle moves are readable" on public.battle_moves;
create policy "confirmed battle moves are readable" on public.battle_moves for select using (correct);

revoke all on public.battle_room_secrets from anon, authenticated;
revoke all on public.battle_player_secrets from anon, authenticated;
grant select on public.battle_rooms, public.battle_players, public.battle_moves to anon, authenticated;

create or replace function public.battle_room_code()
returns text
language plpgsql
volatile
set search_path = public, pg_temp
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
begin
  loop
    select string_agg(substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1), '')
      into candidate
      from generate_series(1, 6);
    exit when not exists (select 1 from public.battle_rooms where code = candidate);
  end loop;
  return candidate;
end;
$$;

create or replace function public.create_battle_room(
  p_player_name text,
  p_player_token uuid,
  p_grid_size smallint,
  p_variants text[],
  p_puzzle_hash text,
  p_givens jsonb,
  p_solution jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  created_room public.battle_rooms;
  created_player public.battle_players;
  row_index int;
  col_index int;
  value int;
begin
  p_player_name := left(trim(p_player_name), 24);
  if char_length(p_player_name) < 1 then raise exception 'Player name is required.'; end if;
  if p_grid_size not in (6, 9) then raise exception 'Grid size must be 6 or 9.'; end if;
  if jsonb_typeof(p_givens) <> 'array' or jsonb_array_length(p_givens) <> p_grid_size or
     jsonb_typeof(p_solution) <> 'array' or jsonb_array_length(p_solution) <> p_grid_size then
    raise exception 'Puzzle dimensions do not match the grid size.';
  end if;
  for row_index in 0..p_grid_size - 1 loop
    if jsonb_array_length(p_givens -> row_index) <> p_grid_size or
       jsonb_array_length(p_solution -> row_index) <> p_grid_size then
      raise exception 'Puzzle rows do not match the grid size.';
    end if;
    for col_index in 0..p_grid_size - 1 loop
      value := (p_solution -> row_index ->> col_index)::int;
      if value < 1 or value > p_grid_size then raise exception 'Solution contains an invalid digit.'; end if;
      value := (p_givens -> row_index ->> col_index)::int;
      if value < 0 or value > p_grid_size then raise exception 'Givens contain an invalid digit.'; end if;
    end loop;
  end loop;

  insert into public.battle_rooms(code, grid_size, variants, puzzle_hash)
  values (public.battle_room_code(), p_grid_size, coalesce(p_variants, array['classic']::text[]), p_puzzle_hash)
  returning * into created_room;
  insert into public.battle_room_secrets(room_id, givens, solution)
  values (created_room.id, p_givens, p_solution);
  insert into public.battle_players(room_id, name)
  values (created_room.id, p_player_name) returning * into created_player;
  insert into public.battle_player_secrets(player_id, player_token)
  values (created_player.id, p_player_token);
  update public.battle_rooms set host_player_id = created_player.id where id = created_room.id
  returning * into created_room;
  return jsonb_build_object('room', to_jsonb(created_room), 'player_id', created_player.id);
end;
$$;

create or replace function public.join_battle_room(
  p_room_code text,
  p_player_name text,
  p_player_token uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_room public.battle_rooms;
  target_player public.battle_players;
begin
  select * into target_room from public.battle_rooms where code = upper(trim(p_room_code));
  if target_room.id is null then raise exception 'Room not found.'; end if;
  select p.* into target_player
    from public.battle_players p
    join public.battle_player_secrets s on s.player_id = p.id
    where p.room_id = target_room.id and s.player_token = p_player_token
    limit 1;
  if target_player.id is null then
    if target_room.status <> 'lobby' then raise exception 'This battle has already started.'; end if;
    p_player_name := left(trim(p_player_name), 24);
    if char_length(p_player_name) < 1 then raise exception 'Player name is required.'; end if;
    insert into public.battle_players(room_id, name)
      values (target_room.id, p_player_name) returning * into target_player;
    insert into public.battle_player_secrets(player_id, player_token)
      values (target_player.id, p_player_token);
  else
    update public.battle_players set last_seen_at = now() where id = target_player.id;
  end if;
  return jsonb_build_object('room', to_jsonb(target_room), 'player_id', target_player.id);
end;
$$;

create or replace function public.start_battle_room(p_room_id uuid, p_player_token uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not exists (
    select 1 from public.battle_rooms r
    join public.battle_player_secrets s on s.player_id = r.host_player_id
    where r.id = p_room_id and s.player_token = p_player_token
  ) then raise exception 'Only the host can start this battle.'; end if;
  update public.battle_rooms
    set status = 'playing', started_at = coalesce(started_at, now())
    where id = p_room_id and status = 'lobby';
end;
$$;

create or replace function public.submit_battle_move(
  p_room_id uuid,
  p_player_token uuid,
  p_row_index smallint,
  p_col_index smallint,
  p_digit smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  target_room public.battle_rooms;
  target_player public.battle_players;
  secret public.battle_room_secrets;
  is_correct boolean;
  delta smallint;
  blank_count int := 0;
  solved_count int;
  r int;
  c int;
begin
  select * into target_room from public.battle_rooms where id = p_room_id for update;
  if target_room.status <> 'playing' then raise exception 'The battle is not running.'; end if;
  if p_row_index < 0 or p_col_index < 0 or p_row_index >= target_room.grid_size or p_col_index >= target_room.grid_size or
     p_digit < 1 or p_digit > target_room.grid_size then raise exception 'Move is outside the grid.'; end if;
  select p.* into target_player
    from public.battle_players p
    join public.battle_player_secrets s on s.player_id = p.id
    where p.room_id = p_room_id and s.player_token = p_player_token
    limit 1;
  if target_player.id is null then raise exception 'Player session not found.'; end if;
  select * into secret from public.battle_room_secrets where room_id = p_room_id;
  if (secret.givens -> p_row_index ->> p_col_index)::int <> 0 then
    raise exception 'Given digits cannot be changed.';
  end if;
  if exists (
    select 1 from public.battle_moves
    where room_id = p_room_id and row_index = p_row_index and col_index = p_col_index and correct
  ) then
    return jsonb_build_object('correct', true, 'already_solved', true, 'score_delta', 0, 'score', target_player.score);
  end if;

  is_correct := (secret.solution -> p_row_index ->> p_col_index)::int = p_digit;
  delta := case when is_correct then 1 else -2 end;
  insert into public.battle_moves(room_id, player_id, row_index, col_index, digit, correct, score_delta)
    values (p_room_id, target_player.id, p_row_index, p_col_index, p_digit, is_correct, delta);
  update public.battle_players set score = score + delta, last_seen_at = now()
    where id = target_player.id returning * into target_player;

  if is_correct then
    for r in 0..target_room.grid_size - 1 loop
      for c in 0..target_room.grid_size - 1 loop
        if (secret.givens -> r ->> c)::int = 0 then blank_count := blank_count + 1; end if;
      end loop;
    end loop;
    select count(*) into solved_count from public.battle_moves where room_id = p_room_id and correct;
    if solved_count >= blank_count then
      update public.battle_rooms set status = 'finished', finished_at = now() where id = p_room_id;
    end if;
  end if;
  return jsonb_build_object('correct', is_correct, 'already_solved', false, 'score_delta', delta, 'score', target_player.score);
end;
$$;

revoke all on function public.battle_room_code() from public;
grant execute on function public.create_battle_room(text, uuid, smallint, text[], text, jsonb, jsonb) to anon, authenticated;
grant execute on function public.join_battle_room(text, text, uuid) to anon, authenticated;
grant execute on function public.start_battle_room(uuid, uuid) to anon, authenticated;
grant execute on function public.submit_battle_move(uuid, uuid, smallint, smallint, smallint) to anon, authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'battle_rooms') then
    alter publication supabase_realtime add table public.battle_rooms;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'battle_players') then
    alter publication supabase_realtime add table public.battle_players;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'battle_moves') then
    alter publication supabase_realtime add table public.battle_moves;
  end if;
end $$;
