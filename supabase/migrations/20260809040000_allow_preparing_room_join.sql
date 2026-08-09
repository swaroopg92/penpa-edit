create or replace function public.join_battle_room(p_room_code text,p_player_name text,p_player_token uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare target_room public.battle_rooms; target_player public.battle_players; chosen_color text;
begin
  select * into target_room from public.battle_rooms where code=upper(trim(p_room_code));
  if target_room.id is null then raise exception 'Room not found.'; end if;
  select p.* into target_player from public.battle_players p join public.battle_player_secrets s on s.player_id=p.id
    where p.room_id=target_room.id and s.player_token=p_player_token limit 1;
  if target_player.id is null then
    if target_room.status not in ('preparing','lobby') then raise exception 'This battle is not open for joining.'; end if;
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

grant execute on function public.join_battle_room(text,text,uuid) to anon,authenticated;
