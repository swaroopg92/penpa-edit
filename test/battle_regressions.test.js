const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const battle = fs.readFileSync(path.join(root, "docs/src/BattleApp.svelte"), "utf8");
const client = fs.readFileSync(path.join(root, "docs/src/battle/supabase.ts"), "utf8");
const solver = fs.readFileSync(path.join(root, "docs/js/sudoku_solver.js"), "utf8");
const app = fs.readFileSync(path.join(root, "docs/src/App.svelte"), "utf8");
const migration = fs.readFileSync(path.join(root, "supabase/migrations/20260809000000_create_sudoku_battle.sql"), "utf8");
const extensionMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809010000_extend_sudoku_battle.sql"), "utf8");
const presenceMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809020000_battle_presence_and_timeout.sql"), "utf8");
const abortMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809030000_abort_sudoku_battle.sql"), "utf8");
const preparingJoinMigration = fs.readFileSync(path.join(root, "supabase/migrations/20260809040000_allow_preparing_room_join.sql"), "utf8");
const names = fs.readFileSync(path.join(root, "docs/src/battle/names.ts"), "utf8");
const vite = fs.readFileSync(path.join(root, "vite.config.js"), "utf8");
const generator = fs.readFileSync(path.join(root, "docs/js/sudoku_generator.js"), "utf8");

test("battle is a production page backed by the existing Penpa board", () => {
  assert.match(vite, /envDir:\s*resolve\(process\.cwd\(\)\)/);
  assert.match(vite, /battle:\s*resolve\(process\.cwd\(\),\s*"docs\/battle\.html"\)/);
  assert.match(app, /class="battle-action"[\s\S]*?\.\/battle\.html/);
  assert.match(battle, /index\.html\?embed=1&hideSidebar=1&battle=1|boardFrameSource/);
  assert.match(solver, /prepareBattleGrid:\s*prepareBattleGrid/);
  assert.match(solver, /setBattleDigit:\s*setBattleDigit/);
  assert.match(solver, /CustomEvent\("sudoku-generated"/);
});

test("battle creation supports 6x6, 9x9, and the explicit generated variant lists", () => {
  assert.match(battle, /gridSize:\s*6\s*\|\s*9/);
  assert.match(battle, /battleVariantIdsBySize\[gridSize\]\.map/);
  assert.match(battle, /6:\s*\[[^\]]*"classic"/);
  assert.match(battle, /9:\s*\[[^\]]*"windoku"/);
  assert.match(battle, /selectedVariant = "classic"/);
  assert.match(battle, /SudokuTools\.generatePuzzle/);
});

test("Supabase owns authoritative scoring and does not expose solutions", () => {
  assert.match(migration, /create table if not exists public\.battle_room_secrets/);
  assert.match(migration, /revoke all on public\.battle_room_secrets from anon, authenticated/);
  assert.match(migration, /delta := case when is_correct then 1 else -2 end/);
  assert.match(migration, /create unique index if not exists battle_one_correct_move_per_cell/);
  assert.match(client, /createClient/);
  assert.match(battle, /postgres_changes[\s\S]*?battle_moves/);
});

test("battle keyboard events cross the iframe boundary with note modifiers", () => {
  assert.match(battle, /forwardBattleKeyboard/);
  assert.match(battle, /shiftKey:\s*event\.shiftKey/);
  assert.match(battle, /ctrlKey:\s*event\.ctrlKey/);
  assert.match(battle, /ArrowUp[\s\S]*ArrowDown[\s\S]*ArrowLeft[\s\S]*ArrowRight/);
});

test("confirmed digits retain the submitting player's Penpa color", () => {
  assert.match(solver, /setBattleDigit\(row, col, digit, color, shadingColor\)/);
  assert.match(solver, /pu\.pu_a_col\.number\[key\]\s*=\s*color/);
  assert.match(solver, /typeof UserSettings !== "undefined"[\s\S]*?UserSettings\.custom_colors_on = true/);
  assert.match(battle, /setBattleDigit\(move\.row_index, move\.col_index, move\.digit, color/);
});

test("difficulty maps to minimal, plus eight, and plus twelve clues", () => {
  assert.match(battle, /hard[\s\S]*normal[\s\S]*easy/);
  assert.match(generator, /options\.extraClues/);
  assert.match(generator, /extraClues/);
});

test("battle-specific embedded controls use a square right-side layout", () => {
  assert.match(app, /let isBattle\s*=\s*checkUrlFlag\("battle"\)/);
  assert.match(app, /class:battle=\{isBattle\}/);
  assert.match(app, /isBattle \|\| mobilePanelPosition/);
  assert.match(app, /aspect-ratio:\s*1/);
});

test("rooms prepare before lobby, countdown on the server, and support rematches", () => {
  assert.match(extensionMigration, /create_battle_room_v2/);
  assert.match(extensionMigration, /status='preparing'/);
  assert.match(extensionMigration, /prepare_battle_room/);
  assert.match(extensionMigration, /now\(\)\+interval '3 seconds'/);
  assert.match(extensionMigration, /begin_battle_rematch/);
  assert.match(extensionMigration, /now\(\)<target_room\.started_at/);
});

test("a missing local player name receives a Sudoku adjective and noun", () => {
  assert.match(names, /const adjectives = \[[\s\S]*Logical/);
  assert.match(names, /const nouns = \[[\s\S]*Digit/);
  assert.match(names, /window\.localStorage\.setItem\(battleNameKey, name\)/);
  assert.match(battle, /update_battle_player_name/);
});

test("battle uses one dedicated digit and note panel with responsive ordering", () => {
  assert.match(battle, /class="battle-input-panel"/);
  assert.match(battle, /mode-normal[\s\S]*mode-center[\s\S]*mode-corner/);
  assert.match(battle, /digit <= room\.grid_size/);
  assert.match(battle, /\.battle-input-panel\{[\s\S]*grid-template-columns:repeat\(3,1fr\)[\s\S]*grid-template-rows:repeat\(4,1fr\)/);
  assert.match(battle, /@media\(max-width:700px\)[\s\S]*\.battle-input-panel\{grid-template-columns:repeat\(4,1fr\);grid-template-rows:repeat\(3,1fr\)/);
  assert.match(app, /\{#if !isBattle\}[\s\S]*class="mobile-input-deck"/);
  assert.match(app, /\{#if !isBattle\}[\s\S]*class="column controls"/);
});

test("battle room chrome is responsive and exposes host, abort, and presence feedback", () => {
  assert.match(battle, /class="mobile-room-summary"/);
  assert.match(battle, /roomInfoOpen = !roomInfoOpen/);
  assert.match(battle, /player\.id === room\.host_player_id \? " ★" : ""/);
  assert.match(battle, /disabled=\{busy \|\| !boardLoaded\}[\s\S]*Start battle/);
  assert.match(battle, /abort_battle_room/);
  assert.match(battle, /showBattleToast\(`\$\{joined\.name\} joined the room\.`\)/);
  assert.match(battle, /showBattleToast\(`\$\{left\[1\]\} left the room\.`\)/);
  assert.match(abortMigration, /create or replace function public\.abort_battle_room/);
  assert.match(abortMigration, /status='preparing'/);
});

test("the main lobby retains active rooms and room controls are visually grouped", () => {
  assert.match(battle, /<div class="card active-list">/);
  assert.doesNotMatch(battle, /\{#if landingMode === "join"\}<div class="card active-list">/);
  assert.match(battle, /class="sidebar-section room-summary"/);
  assert.match(battle, /class="sidebar-section personal-settings"/);
  assert.match(battle, /class="sidebar-section player-section"/);
  assert.match(battle, /⧉ Copy invite/);
  assert.match(battle, /← Back to lobby/);
});

test("Windoku generation supplies four extra regions and cache-busts failed worker assets", () => {
  assert.match(generator, /variants\.indexOf\("windoku"\)[\s\S]*?constraints\.regionAllDifferent/);
  assert.match(generator, /\[\[1, 1\], \[1, 5\], \[5, 1\], \[5, 5\]\]/);
  assert.match(solver, /sudokuWorkerUrl\("sudoku_generator_worker_bundle\.js", workerRetry\)/);
});

test("battle variants are explicit per grid size", () => {
  assert.match(battle, /const battleVariantIdsBySize:\s*Record<6 \| 9, string\[]>/);
  assert.match(battle, /6:\s*\[[^\]]*"classic"[^\]]*"battenburg"/);
  assert.match(battle, /9:\s*\[[^\]]*"windoku"/);
});

test("joining and mobile room chrome use the compact battle flow", () => {
  assert.doesNotMatch(battle, />Join room<\/button>/);
  assert.match(battle, /<h2>Active rooms<\/h2>/);
  assert.match(battle, /roomInfoOpen = false/);
  assert.match(battle, /focusBattleCell\?\.\(0, 0\)/);
  assert.match(battle, /\.room-sidebar\.open\{[\s\S]*?background:rgba/);
  assert.match(battle, /\.room-sidebar \.player\{[^}]*background:transparent/);
  assert.match(preparingJoinMigration, /target_room\.status not in \('preparing','lobby'\)/);
});

test("generated Windoku boards render their shaded windows", () => {
  assert.match(solver, /generatedVariants\.indexOf\("windoku"\)[\s\S]*?ensureWindokuCages\(\)/);
});

test("presence cleanup, explicit leave, and the 20 minute limit are server authoritative", () => {
  assert.match(presenceMigration, /touch_battle_player/);
  assert.match(presenceMigration, /leave_battle_room/);
  assert.match(presenceMigration, /interval '20 minutes'/);
  assert.match(presenceMigration, /finish_reason='time_limit'/);
  assert.match(presenceMigration, /delete from public\.battle_rooms/);
  assert.match(battle, /beforeunload/);
  assert.match(battle, /touch_battle_player/);
});

test("spectators join by URL without creating a player and receive a read-only synchronized board", () => {
  assert.match(battle, /get\("watch"\) === "1"/);
  assert.match(battle, /async function watchRoom/);
  assert.match(battle, /select\("\*"\)\.eq\("code", roomCode\)\.single\(\)/);
  assert.match(battle, /watching \? "&watch=1" : ""/);
  assert.match(battle, /spectatorMode \? watchRoom\(roomCode\) : joinRoom\(roomCode\)/);
  assert.match(battle, /\{#if !spectatorMode\}<div class="battle-input-panel"/);
  assert.match(battle, /play-area\.spectator \.board\{pointer-events:none\}/);
  assert.match(battle, />Join<\/button><button on:click=\{\(\) => watchRoom\(active\.code\)\}>Watch<\/button>/);
});

test("confirmed battle digits store a custom font color and a translucent player-colored surface", () => {
  assert.match(solver, /function setBattleDigit\(row, col, digit, color, shadingColor\)/);
  assert.match(solver, /pu\.pu_a_col\.number\[key\] = color/);
  assert.match(solver, /pu\.pu_a_col\.surface\[key\] = shadingColor/);
  assert.match(battle, /penpaShades\[colorName\]/);
  assert.match(battle, /penpaShades\[myColor\]/);
});

test("mobile room information avoids duplicate scores and fits its content", () => {
  assert.match(battle, /\.room-sidebar \.player-section,\.room-sidebar \.timer-section\{display:none\}/);
  assert.match(battle, /inset:48px 6px auto/);
  assert.match(battle, /<h2>Active rooms<\/h2>/);
  assert.match(battle, /class="lobby-profile card"/);
});
