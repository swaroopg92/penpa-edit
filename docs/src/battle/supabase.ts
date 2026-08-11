import { createClient, type RealtimeChannel, type SupabaseClient } from "@supabase/supabase-js";

export type BattleRoom = {
  id: string;
  code: string;
  status: "preparing" | "lobby" | "playing" | "finished";
  host_player_id: string;
  grid_size: 6 | 9;
  variants: string[];
  puzzle_hash: string | null;
  difficulty: "easy" | "normal" | "hard";
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  finish_reason: "solved" | "time_limit" | null;
};

export type BattlePlayer = {
  id: string;
  room_id: string;
  name: string;
  score: number;
  color: "red" | "blue" | "green" | "orange";
  joined_at: string;
};

export type ConfirmedMove = {
  room_id: string;
  player_id: string;
  row_index: number;
  col_index: number;
  digit: number;
  correct: true;
  score_delta: number;
};

const url = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        realtime: { params: { eventsPerSecond: 20 } },
      })
    : null;

export function battleConfigurationError() {
  return supabase
    ? ""
    : "Sudoku Battle needs VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
}

export function playerToken() {
  const key = "sudotoku-battle-player-token";
  let token = window.localStorage.getItem(key);
  if (!token) {
    token = crypto.randomUUID();
    window.localStorage.setItem(key, token);
  }
  return token;
}

export function normalizeRoomCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

export function boardFrameSource(puzzleHash = "") {
  const rootPath = location.pathname.includes("/battle") ? "../index.html" : "./index.html";
  const base = `${rootPath}?embed=1&hideSidebar=1&battle=1`;
  return puzzleHash ? `${base}${puzzleHash.startsWith("#") ? puzzleHash : `#${puzzleHash}`}` : base;
}

export async function leaveBattleChannel(channel: RealtimeChannel | null) {
  if (channel && supabase) await supabase.removeChannel(channel);
}
