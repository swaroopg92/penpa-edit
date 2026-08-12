<script lang="ts">
  import { onMount } from "svelte";
  import type { RealtimeChannel } from "@supabase/supabase-js";
  import { generateBattleName, loadBattleName, saveBattleName } from "./battle/names";
  import { variations, variationByValue } from "./variationCatalog";
  import {
    battleConfigurationError, boardFrameSource, leaveBattleChannel, normalizeRoomCode,
    playerToken, supabase, type BattlePlayer, type BattleRoom, type ConfirmedMove,
  } from "./battle/supabase";

  type Difficulty = "easy" | "normal" | "hard";
  type ActiveRoom = BattleRoom & { playerCount: number };

  // Keep these lists explicit so supported battle variants are easy to edit.
  const battleVariantIdsBySize: Record<6 | 9, string[]> = {
    6: ["classic", "diagonal", "anti king", "anti knight", "non consecutive", "kropki", "xv", "consecutive", "battenburg", "disjoint", "mirror", "symmetric unequal"],
    9: ["classic", "diagonal", "anti diagonal", "anti king", "anti knight", "non consecutive", "kropki", "xv", "consecutive", "battenburg", "disjoint", "windoku", "mirror", "symmetric unequal"],
  };
  const basicBattleVariantIds = new Set(["classic", "diagonal", "xv", "kropki", "consecutive", "anti knight", "anti king", "windoku"]);
  $: variantOptions = battleVariantIdsBySize[gridSize]
    .filter((value) => advancedVariants || basicBattleVariantIds.has(value))
    .map((value) => ({
    value,
    label: value === "classic" ? "Classic" : variationByValue.get(value)?.name || (value.charAt(0).toUpperCase() + value.slice(1)),
  })).sort((a, b) => {
    if (a.value === "classic") return -1;
    if (b.value === "classic") return 1;
    return a.label.localeCompare(b.label);
  });
  const colors: BattlePlayer["color"][] = ["blue", "red", "green", "orange"];
  const penpaColors: Record<BattlePlayer["color"], string> = {
    blue: "#0000ff", red: "#ff0000", green: "#008000", orange: "#ff8000",
  };
  const penpaShades: Record<BattlePlayer["color"], string> = {
    blue: "rgba(0,0,255,.12)", red: "rgba(255,0,0,.14)", green: "rgba(0,128,0,.14)", orange: "rgba(255,128,0,.16)",
  };

  let boardFrame: HTMLIFrameElement;
  let playerName = loadBattleName();
  let draftName = playerName;
  let editingName = false;
  let roomCode = normalizeRoomCode(new URLSearchParams(location.search).get("room") || "");
  let spectatorMode = new URLSearchParams(location.search).get("watch") === "1";
  let gridSize: 6 | 9 = 9;
  let difficulty: Difficulty = "easy";
  let selectedVariants: string[] = [];
  let selectedVariant = "classic";
  let advancedVariants = false;
  let landingMode: "create" | null = null;
  let room: BattleRoom | null = null;
  let players: BattlePlayer[] = [];
  let activeRooms: ActiveRoom[] = [];
  let myPlayerId = "";
  let error = battleConfigurationError();
  let busy = false;
  let generating = false;
  let generationStatusMessage = "";
  let generationSeconds = 0;
  let elapsedSeconds = 0;
  let countdown = 0;
  let boardLoaded = false;
  let preparingBoard = false;
  let copied = false;
  let lobbyLoading = false;
  let playersExpanded = false;
  let roomInfoOpen = false;
  let initialCellFocused = false;
  let battleToast = "";
  let noteMode: "normal" | "center" | "corner" = "normal";
  let darkMode = window.localStorage.getItem("sudotoku-battle-theme") === "dark";
  let channel: RealtimeChannel | null = null;
  let lobbyChannel: RealtimeChannel | null = null;
  let knownBoard: number[][] = [];
  let inputBusy = false;
  let applyingRemote = false;
  let botTokens: string[] = [];
  let knownSolution: number[][] = [];
  let playerMoveStats: Record<string, { correct: number; incorrect: number }> = {};
  let botClocks: number[] = [];
  let clock: number | undefined;
  let generationClock: number | undefined;
  let heartbeatClock: number | undefined;
  let toastClock: number | undefined;

  $: boardSrc = boardFrameSource(room?.puzzle_hash || "");
  $: isHost = Boolean(room && myPlayerId === room.host_player_id);
  $: boardVisible = Boolean((room?.status === "playing" || room?.status === "finished") && countdown === 0 && boardLoaded);
  $: if (room?.status === "playing") roomInfoOpen = false;
  let previousRoomStatus: string | undefined = undefined;
  $: if (room?.status === "finished" && previousRoomStatus !== "finished") {
    previousRoomStatus = "finished";
    const winMsg = winners.length
      ? `${winners.map((w) => w.name).join(" & ")} won with ${winners[0].score} pts!`
      : "Battle complete!";
    showBattleToast(`🎉 ${winMsg}`);
  } else if (room?.status) {
    previousRoomStatus = room.status;
  }
  $: if (room?.status === "playing" && isHost && botTokens.length) { if (!botClocks.length) startBotLoop(); } else if (room?.status !== "playing") { stopBotLoop(); }
  $: syncBattleReveal(boardVisible);
  $: elapsedLabel = formatTime(elapsedSeconds);
  $: myColor = players.find((player) => player.id === myPlayerId)?.color || "blue";
  $: winners = room?.status === "finished" && players.length
    ? players.filter((player) => player.score === Math.max(...players.map((entry) => entry.score)))
    : [];
  $: variantLabel = room?.variants?.filter((item) => item !== "classic").map((value) => variantOptions.find((item) => item.value === value)?.label || value).join(" + ") || "Classic";
  $: activeVariantRules = (room?.variants || [])
    .filter((v) => v !== "classic")
    .map((v) => variations.find((entry) => entry.value === v))
    .filter((item): item is typeof variations[0] => Boolean(item));

  function formatTime(seconds: number) {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  }

  function updateClock() {
    if (!room?.started_at || room.status === "lobby" || room.status === "preparing") {
      elapsedSeconds = 0; countdown = 0; return;
    }
    const start = new Date(room.started_at).getTime();
    const end = room.status === "finished" && room.finished_at ? new Date(room.finished_at).getTime() : Date.now();
    countdown = room.status === "playing" ? Math.max(0, Math.ceil((start - Date.now()) / 1000)) : 0;
    elapsedSeconds = Math.max(0, Math.floor((end - start) / 1000));
  }

  function chooseVariant(value: string) {
    selectedVariant = value;
    selectedVariants = value === "classic" ? [] : [value];
  }

  function chooseGridSize(size: 6 | 9) {
    gridSize = size;
    if (!battleVariantIdsBySize[size].includes(selectedVariant)) chooseVariant("classic");
  }

  function toggleAdvancedVariants(enabled: boolean) {
    advancedVariants = enabled;
    if (!enabled && !basicBattleVariantIds.has(selectedVariant)) chooseVariant("classic");
  }

  function syncBattleReveal(visible: boolean) {
    if (!visible) { initialCellFocused = false; return; }
    roomInfoOpen = false;
    if (spectatorMode) return;
    if (initialCellFocused) return;
    initialCellFocused = true;
    setTimeout(() => frameWindow()?.SudokuTools?.focusBattleCell?.(0, 0), 0);
  }

  function randomizeName() {
    draftName = generateBattleName();
    playerName = saveBattleName(draftName);
  }

  function showBattleToast(message: string) {
    battleToast = message;
    clearTimeout(toastClock);
    toastClock = window.setTimeout(() => battleToast = "", 2600);
  }

  function frameWindow() { return boardFrame?.contentWindow as any; }

  function applyThemeToBoard() {
    const frame = frameWindow();
    if (!frame?.document) return;
    frame.document.dispatchEvent(new frame.CustomEvent("penpa-theme-change", { detail: { dark: darkMode } }));
  }

  function toggleTheme() {
    darkMode = !darkMode;
    window.localStorage.setItem("sudotoku-battle-theme", darkMode ? "dark" : "light");
    applyThemeToBoard();
  }

  function dispatchBoardKey(key: string, code: string) {
    if (!boardVisible) return;
    const frame = frameWindow(); if (!frame?.document) return;
    const init = { key, code, bubbles: true, cancelable: true };
    frame.document.dispatchEvent(new frame.KeyboardEvent("keydown", init));
    frame.document.dispatchEvent(new frame.KeyboardEvent("keyup", init));
    setTimeout(inspectBoardInput, 0);
  }

  function chooseBattleNoteMode(mode: "normal" | "center" | "corner") {
    noteMode = mode;
    const shortcut = mode === "normal" ? ["z", "KeyZ"] : mode === "center" ? ["x", "KeyX"] : ["c", "KeyC"];
    dispatchBoardKey(shortcut[0], shortcut[1]);
  }

  function enterBattleDigit(digit: number) {
    dispatchBoardKey(String(digit), `Digit${digit}`);
  }

  async function waitForBoard() {
    for (let attempt = 0; attempt < 200; attempt += 1) {
      const frame = frameWindow();
      if (frame?.pu && frame?.SudokuTools && frame?.SudokuSolver) return frame;
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    throw new Error("The Penpa board did not finish loading.");
  }

  async function generatePuzzle() {
    const frame = frameWindow();
    if (!frame?.SudokuTools || !frame?.pu) throw new Error("Penpa frame is not ready.");
    frame.SudokuTools.prepareBattleGrid(room?.grid_size || gridSize);
    generating = true;
    generationStatusMessage = "";
    generationSeconds = 0;
    generationClock = window.setInterval(() => generationSeconds += 1, 1000);
    try {
      const roomVariants = room?.variants || ["classic", ...selectedVariants];
      const roomDifficulty = room?.difficulty || difficulty;
      const result: any = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error("Puzzle generation timed out.")), 65000);
        const generated = (event: Event) => { cleanup(); resolve((event as CustomEvent).detail); };
        const failed = (event: Event) => { cleanup(); reject(new Error((event as CustomEvent).detail || "Puzzle generation failed.")); };
        const progress = (event: Event) => {
          const detail = (event as CustomEvent).detail;
          if (detail?.message) generationStatusMessage = detail.message;
        };
        const cleanup = () => {
          clearTimeout(timeout);
          frame.document.removeEventListener("sudoku-generated", generated);
          frame.document.removeEventListener("sudoku-generation-error", failed);
          frame.document.removeEventListener("sudoku-generation-progress", progress);
        };
        frame.document.addEventListener("sudoku-generated", generated);
        frame.document.addEventListener("sudoku-generation-error", failed);
        frame.document.addEventListener("sudoku-generation-progress", progress);
        const generateFn = frame.SudokuTools.generatePuzzleFromScratch || frame.SudokuTools.generatePuzzle;
        generateFn(room?.grid_size || gridSize, roomVariants, null, Date.now(), roomDifficulty);
      });
      frame.SudokuTools.restoreGeneratedMarks?.(result);
      const duplicate = String(frame.pu.maketext_duplicate());
      const hashIndex = duplicate.indexOf("#");
      if (hashIndex < 0) throw new Error("Could not serialize the generated board.");
      const variantParam = `&variants=${encodeURIComponent(roomVariants.join(","))}`;
      const puzzleHash = duplicate.slice(hashIndex).replace(/&variants=[^&]*/g, "") + variantParam;
      return { result, puzzleHash };
    } finally {
      generating = false; clearInterval(generationClock);
    }
  }

  function resetSessionTimers() {
    generating = false;
    preparingBoard = false;
    generationStatusMessage = "";
    generationSeconds = 0;
    elapsedSeconds = 0;
    countdown = 0;
    clearInterval(generationClock);
    stopBotLoop();
  }

  function acceptRoom(data: any, watching = false) {
    resetSessionTimers();
    spectatorMode = watching;
    room = data.room as BattleRoom; myPlayerId = data.player_id; roomCode = room.code;
    difficulty = room.difficulty || "easy"; gridSize = room.grid_size;
    selectedVariants = room.variants.filter((item) => item !== "classic");
    selectedVariant = selectedVariants[0] || "classic";
    boardLoaded = false; knownBoard = [];
    history.replaceState(null, "", `${location.pathname}?room=${room.code}${watching ? "&watch=1" : ""}`);
  }

  async function createRoom() {
    if (!supabase) return;
    busy = true; error = "";
    try {
      playerName = saveBattleName(playerName);
      const { data, error: rpcError } = await supabase.rpc("create_battle_room_v2", {
        p_player_name: playerName, p_player_token: playerToken(), p_grid_size: gridSize,
        p_variants: ["classic", ...selectedVariants], p_difficulty: difficulty,
      });
      if (rpcError) throw rpcError;
      acceptRoom(data, false); await subscribeToRoom();
    } catch (cause: any) { error = cause?.message || "Could not create the room."; }
    finally { busy = false; }
  }

  async function prepareRoomBoard() {
    if (!supabase || !room || !isHost || room.status !== "preparing" || preparingBoard) return;
    preparingBoard = true; error = ""; resetSessionTimers(); generating = true;
    generationClock = window.setInterval(() => generationSeconds += 1, 1000);
    try {
      const { result, puzzleHash } = await generatePuzzle();
      if (result?.solution) knownSolution = result.solution;
      const { error: rpcError } = await supabase.rpc("prepare_battle_room", {
        p_room_id: room.id, p_player_token: playerToken(), p_puzzle_hash: puzzleHash,
        p_givens: result.board, p_solution: result.solution,
      });
      if (rpcError) throw rpcError;
      await refreshRoom();
    } catch (cause: any) {
      error = cause?.message || "Could not prepare the board.";
      try {
        await supabase.from("battle_rooms").update({ status: "lobby" }).eq("id", room.id);
        await refreshRoom();
      } catch (e) {}
    } finally {
      preparingBoard = false; generating = false; clearInterval(generationClock);
    }
  }

  async function joinRoom(code = roomCode) {
    if (!supabase) return;
    busy = true; error = "";
    try {
      playerName = saveBattleName(playerName); roomCode = normalizeRoomCode(code);
      if (roomCode.length !== 6) throw new Error("Enter the 6-character room code.");
      const { data, error: rpcError } = await supabase.rpc("join_battle_room", {
        p_room_code: roomCode, p_player_name: playerName, p_player_token: playerToken(),
      });
      if (rpcError) throw rpcError;
      acceptRoom(data, false); await subscribeToRoom();
    } catch (cause: any) { error = cause?.message || "Could not join the room."; }
    finally { busy = false; }
  }

  async function watchRoom(code = roomCode) {
    if (!supabase) return;
    busy = true; error = "";
    try {
      roomCode = normalizeRoomCode(code);
      if (roomCode.length !== 6) throw new Error("Enter the 6-character room code.");
      const { data, error: roomError } = await supabase.from("battle_rooms").select("*").eq("code", roomCode).single();
      if (roomError || !data) throw roomError || new Error("Room not found.");
      acceptRoom({ room: data, player_id: "" }, true);
      await subscribeToRoom();
    } catch (cause: any) { error = cause?.message || "Could not watch the room."; }
    finally { busy = false; }
  }

  async function refreshLobby(showLoading = true) {
    if (!supabase || room) return;
    if (showLoading) lobbyLoading = true;
    const minimum = showLoading ? new Promise((resolve) => setTimeout(resolve, 1000)) : Promise.resolve();
    try {
      await supabase.rpc("expire_battle_rooms");
      const { data: rooms } = await supabase.from("battle_rooms").select("*").in("status", ["lobby", "playing"]).order("created_at", { ascending: false }).limit(20);
      const ids = (rooms || []).map((item: any) => item.id);
      let counts: Record<string, number> = {};
      if (ids.length) {
      const { data: lobbyPlayers } = await supabase.from("battle_players").select("room_id").in("room_id", ids).is("left_at", null);
        for (const player of lobbyPlayers || []) counts[player.room_id] = (counts[player.room_id] || 0) + 1;
      }
      activeRooms = (rooms || []).map((item: any) => ({ ...item, playerCount: counts[item.id] || 0 }));
    } finally { await minimum; if (showLoading) lobbyLoading = false; }
  }

  async function refreshRoom() {
    if (!supabase || !room) return;
    const previousHash = room.puzzle_hash;
    const { data } = await supabase.from("battle_rooms").select("*").eq("id", room.id).single();
    if (data) {
      room = data as BattleRoom;
      if (room.puzzle_hash !== previousHash) { boardLoaded = false; knownBoard = []; }
      updateClock();
    }
  }

  async function refreshPlayers() {
    if (!supabase || !room) return;
    const { data } = await supabase.from("battle_players").select("id,room_id,name,score,color,joined_at")
      .eq("room_id", room.id).is("left_at", null).order("joined_at", { ascending: true });
    if (data) {
      players = data as BattlePlayer[];
      checkHumanPlayerCount();
    }
  }

  async function kickPlayer(targetPlayer: BattlePlayer) {
    if (!supabase || !room || !isHost || targetPlayer.id === myPlayerId) return;
    busy = true; error = "";
    try {
      const { error: rpcError } = await supabase.from("battle_players").update({ left_at: new Date().toISOString() }).eq("id", targetPlayer.id);
      if (rpcError) {
        await supabase.from("battle_players").delete().eq("id", targetPlayer.id);
      }
      showBattleToast(`Removed ${targetPlayer.name}`);
      await refreshPlayers();
    } catch (cause: any) { error = cause?.message || "Could not remove player."; }
    finally { busy = false; }
  }

  function checkHumanPlayerCount() {
    if (!room || !players.length || room.status === "finished") return;
    const humanCount = players.filter((p) => !p.name.startsWith("🤖")).length;
    if (humanCount === 0) {
      showBattleToast("No human players left in room. Closing room.");
      if (isHost) abortBattle();
      returnToLobby();
    }
  }

  async function handlePlayerChange() {
    const before = new Map(players.map((player) => [player.id, player.name]));
    await refreshPlayers();
    const after = new Map(players.map((player) => [player.id, player.name]));
    const joined = players.find((player) => !before.has(player.id));
    const left = [...before].find(([id]) => !after.has(id));
    if (joined && before.size) showBattleToast(`${joined.name} joined the room.`);
    else if (left) showBattleToast(`${left[1]} left the room.`);
  }

  async function loadConfirmedMoves() {
    if (!supabase || !room) return;
    const { data } = await supabase.from("battle_moves").select("room_id,player_id,row_index,col_index,digit,correct,score_delta")
      .eq("room_id", room.id);
    const stats: Record<string, { correct: number; incorrect: number }> = {};
    for (const move of (data || []) as any[]) {
      if (!stats[move.player_id]) stats[move.player_id] = { correct: 0, incorrect: 0 };
      if (move.correct) {
        stats[move.player_id].correct += 1;
        applyConfirmedMove(move as ConfirmedMove);
      } else {
        stats[move.player_id].incorrect += 1;
      }
    }
    playerMoveStats = stats;
  }

  async function subscribeToRoom() {
    if (!supabase || !room) return;
    await leaveBattleChannel(channel);
    await Promise.all([refreshPlayers(), refreshRoom()]);
    channel = supabase.channel(`battle:${room.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "battle_players", filter: `room_id=eq.${room.id}` }, handlePlayerChange)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "battle_rooms", filter: `id=eq.${room.id}` }, refreshRoom)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "battle_moves", filter: `room_id=eq.${room.id}` }, (payload) => {
        const move = payload.new as any;
        if (!playerMoveStats[move.player_id]) playerMoveStats[move.player_id] = { correct: 0, incorrect: 0 };
        if (move.correct) {
          playerMoveStats[move.player_id].correct += 1;
          applyConfirmedMove(move as ConfirmedMove);
        } else {
          playerMoveStats[move.player_id].incorrect += 1;
        }
        playerMoveStats = { ...playerMoveStats };
        refreshPlayers();
      }).subscribe();
  }

  async function startBattle() {
    if (!supabase || !room) return;
    busy = true; error = "";
    const { error: rpcError } = await supabase.rpc("start_battle_room", { p_room_id: room.id, p_player_token: playerToken() });
    if (rpcError) error = rpcError.message;
    await refreshRoom(); busy = false;
  }

  async function rematch() {
    if (!supabase || !room || !isHost) return;
    busy = true; error = ""; resetSessionTimers(); playerMoveStats = {};
    try {
      const { error: rpcError } = await supabase.rpc("begin_battle_rematch", { p_room_id: room.id, p_player_token: playerToken() });
      if (rpcError) throw rpcError;
      boardLoaded = false; knownBoard = []; knownSolution = [];
      await refreshRoom(); await refreshPlayers();
    } catch (cause: any) { error = cause?.message || "Could not start rematch."; }
    finally { busy = false; }
  }

  async function abortBattle() {
    if (!supabase || !room || !isHost) return;
    busy = true; error = "";
    try {
      const { error: rpcError } = await supabase.rpc("abort_battle_room", { p_room_id: room.id, p_player_token: playerToken() });
      if (rpcError) {
        await supabase.from("battle_rooms").update({
          status: "finished", finished_at: new Date().toISOString(), finish_reason: "aborted"
        }).eq("id", room.id);
      }
      await refreshRoom(); await refreshPlayers();
      showBattleToast("Battle aborted.");
    } catch (cause: any) { error = cause?.message || "Could not abort battle."; }
    finally { busy = false; }
  }

  async function saveName() {
    try {
      playerName = saveBattleName(draftName); editingName = false;
      if (supabase && room) {
        const { error: rpcError } = await supabase.rpc("update_battle_player_name", { p_room_id: room.id, p_player_token: playerToken(), p_name: playerName });
        if (rpcError) throw rpcError; await refreshPlayers();
      }
    } catch (cause: any) { error = cause?.message || "Could not update the name."; }
  }

  function editName() { draftName = playerName; editingName = true; }

  async function copyInvite() {
    if (!room) return;
    await navigator.clipboard.writeText(`${location.origin}${location.pathname}?room=${room.code}`);
    copied = true; setTimeout(() => copied = false, 1400);
  }

  async function returnToLobby() {
    stopBotLoop(); resetSessionTimers();
    if (supabase && room && !spectatorMode) await supabase.rpc("leave_battle_room", { p_room_id: room.id, p_player_token: playerToken() });
    await leaveBattleChannel(channel); channel = null; room = null; players = []; myPlayerId = "";
    botTokens = []; boardLoaded = false; spectatorMode = false; history.replaceState(null, "", location.pathname); await refreshLobby();
  }

  async function addBots(count: number) {
    if (!supabase || !room || !isHost) return;
    busy = true; error = "";
    try {
      const names = ["🤖 Bot Alpha", "🤖 Bot Beta", "🤖 Bot Gamma"];
      for (let i = 0; i < count; i++) {
        const token = crypto.randomUUID();
        const botName = names[botTokens.length % names.length];
        const { error: rpcError } = await supabase.rpc("join_battle_room", {
          p_room_code: room.code, p_player_name: botName, p_player_token: token,
        });
        if (rpcError) throw rpcError;
        botTokens.push(token);
      }
      await refreshPlayers();
      showBattleToast(`Added ${count} bot player${count > 1 ? "s" : ""}!`);
    } catch (cause: any) { error = cause?.message || "Could not add bot player."; }
    finally { busy = false; }
  }

  function stopBotLoop() {
    if (botClocks.length) {
      botClocks.forEach((id) => clearInterval(id));
      botClocks = [];
    }
  }

  function startBotLoop() {
    stopBotLoop();
    if (!isHost || !botTokens.length || room?.status !== "playing") return;
    botClocks = botTokens.map((token) => {
      return window.setInterval(() => {
        if (room?.status !== "playing" || !supabase || !room) { stopBotLoop(); return; }
        const randomDelay = Math.floor(1500 + Math.random() * 7000);
        setTimeout(async () => {
          if (room?.status !== "playing" || !supabase || !room) return;
          try {
            const { error: rpcError } = await supabase.rpc("submit_bot_move", {
              p_room_id: room.id, p_player_token: token,
            });
            if (rpcError) {
              const frame = frameWindow();
              if (!frame?.pu || !frame?.SudokuSolver) return;
              const currentBoard: number[][] = frame.SudokuSolver.readBoard(frame.pu, true);
              const sol: number[][] = knownSolution || frame.SudokuSolver.solution || [];
              if (!sol || !sol.length) return;
              const size = room.grid_size || 9;
              const emptyCells: Array<{ r: number; c: number }> = [];
              for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                  if (!currentBoard[r]?.[c]) emptyCells.push({ r, c });
                }
              }
              if (!emptyCells.length) return;
              const pick = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              const digit = sol[pick.r]?.[pick.c];
              if (digit) {
                await supabase.rpc("submit_battle_move", {
                  p_room_id: room.id, p_player_token: token, p_row_index: pick.r, p_col_index: pick.c, p_digit: digit,
                });
              }
            }
          } catch (e) {}
        }, randomDelay);
      }, 10000);
    });
  }

  function applyConfirmedMove(move: ConfirmedMove) {
    const frame = frameWindow(); if (!frame?.SudokuTools || !frame?.pu) return;
    const colorName = players.find((player) => player.id === move.player_id)?.color || "blue";
    const color = penpaColors[colorName];
    applyingRemote = true;
    frame.SudokuTools.setBattleDigit(move.row_index, move.col_index, move.digit, color, penpaShades[colorName]);
    knownBoard = frame.SudokuSolver.readBoard(frame.pu, true); applyingRemote = false;
  }

  async function inspectBoardInput() {
    if (spectatorMode || inputBusy || applyingRemote || room?.status !== "playing" || countdown > 0 || !supabase || !room) return;
    const frame = frameWindow(); if (!frame?.pu) return;
    const current: number[][] = frame.SudokuSolver.readBoard(frame.pu, true);
    if (!knownBoard.length) { knownBoard = current; return; }
    const changes: Array<{ row: number; col: number; digit: number }> = [];
    current.forEach((row, r) => row.forEach((digit, c) => { if (digit !== knownBoard[r]?.[c]) changes.push({ row: r, col: c, digit }); }));
    if (!changes.length) return;
    inputBusy = true;
    try {
      for (const change of changes) {
        const previous = knownBoard[change.row]?.[change.col] || 0;
        if (!change.digit || previous) { frame.SudokuTools.setBattleDigit(change.row, change.col, previous); continue; }
        // Instantly format with player's color before submitting RPC to eliminate blue text flash
        frame.SudokuTools.setBattleDigit(change.row, change.col, change.digit, penpaColors[myColor], penpaShades[myColor]);
        const { data, error: rpcError } = await supabase.rpc("submit_battle_move", {
          p_room_id: room.id, p_player_token: playerToken(), p_row_index: change.row, p_col_index: change.col, p_digit: change.digit,
        });
        if (rpcError) throw rpcError;
        if (!data.correct) frame.SudokuTools.setBattleDigit(change.row, change.col, null);
      }
      knownBoard = frame.SudokuSolver.readBoard(frame.pu, true);
    } catch (cause: any) { error = cause?.message || "Move could not be submitted."; knownBoard = frame.SudokuSolver.readBoard(frame.pu, true); }
    finally { inputBusy = false; }
  }

  function forwardBattleKeyboard(event: KeyboardEvent) {
    if (spectatorMode || !boardVisible || !boardFrame || event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    if (target?.matches("input, textarea, select, button, [contenteditable=true]")) return;
    const accepted = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Backspace", "Delete"];
    if (!accepted.includes(event.key) && !/^[0-9]$/.test(event.key)) return;
    const frame = frameWindow(); if (!frame?.document) return;
    const init = { key: event.key, code: event.code, location: event.location, shiftKey: event.shiftKey, ctrlKey: event.ctrlKey, altKey: event.altKey, metaKey: event.metaKey, bubbles: true, cancelable: true };
    frame.document.dispatchEvent(new frame.KeyboardEvent("keydown", init));
    frame.document.dispatchEvent(new frame.KeyboardEvent("keyup", init));
    event.preventDefault(); setTimeout(inspectBoardInput, 0);
  }

  async function boardReady() {
    if (!room) return;
    if (room.status === "preparing") { await prepareRoomBoard(); return; }
    boardLoaded = true;
    const frame = await waitForBoard(); knownBoard = frame.SudokuSolver.readBoard(frame.pu, true);
    applyThemeToBoard();
    if (frame?.pu?.mode?.pu_a) {
      if (frame.pu.mode.pu_a.sudoku) frame.pu.mode.pu_a.sudoku[1] = 1;
      if (frame.pu.mode.pu_a.number) frame.pu.mode.pu_a.number[1] = 1;
    }
    if (!spectatorMode) {
      frame.document.addEventListener("keyup", inspectBoardInput);
      frame.document.addEventListener("pointerup", inspectBoardInput);
    }
    await loadConfirmedMoves();
  }

  onMount(() => {
    clock = window.setInterval(updateClock, 200);
    window.addEventListener("keydown", forwardBattleKeyboard);
    const protectReload = (event: BeforeUnloadEvent) => {
      if (!room || spectatorMode) return;
      event.preventDefault(); event.returnValue = "";
    };
    window.addEventListener("beforeunload", protectReload);
    heartbeatClock = window.setInterval(async () => {
      if (!supabase || !room || spectatorMode) return;
      await supabase.rpc("touch_battle_player", { p_room_id: room.id, p_player_token: playerToken() });
      await refreshRoom();
    }, 10000);
    if (supabase) {
      lobbyChannel = supabase.channel("battle-lobby")
        .on("postgres_changes", { event: "*", schema: "public", table: "battle_rooms" }, () => refreshLobby(false))
        .on("postgres_changes", { event: "*", schema: "public", table: "battle_players" }, () => refreshLobby(false))
        .subscribe();
      refreshLobby(); if (roomCode) spectatorMode ? watchRoom(roomCode) : joinRoom(roomCode);
    }
    return () => {
      clearInterval(clock); clearInterval(generationClock); clearInterval(heartbeatClock); clearTimeout(toastClock); window.removeEventListener("keydown", forwardBattleKeyboard);
      window.removeEventListener("beforeunload", protectReload);
      leaveBattleChannel(channel); leaveBattleChannel(lobbyChannel);
    };
  });
</script>

<svelte:head><title>Sudoku Battle</title><meta name="description" content="A realtime multiplayer Sudoku battle." /></svelte:head>

<main class:in-room={Boolean(room)} class:dark={darkMode}>
  {#if !room}<header><h1>Sudoku Battle</h1><button class="theme-toggle" on:click={toggleTheme}>{darkMode ? "☀ Light" : "☾ Dark"}</button></header>{/if}
  {#if !room}
    <div class="lobby-profile card">
      <div class="identity"><span>You are</span>{#if editingName}<input maxlength="24" bind:value={draftName} on:keydown={(event) => event.key === "Enter" && saveName()} /><button class="small" on:click={saveName}>Save</button>{:else}<strong>{playerName}</strong><button class="icon-button" aria-label="Edit name" title="Edit name" on:click={editName}>✎</button><button class="icon-button" aria-label="Generate random name" title="Generate random name" on:click={randomizeName}>↻</button>{/if}</div>
    </div>
    <section class="lobby-layout">
      <div class="card create-card">
        {#if !landingMode}
          <div class="landing-choices"><button class="primary" on:click={() => landingMode = "create"}>Create room</button></div>
        {:else if landingMode === "create"}
          <div class="section-title"><h2>Create a room</h2><button class="small" on:click={() => landingMode = null}>Back</button></div>
          <div class="choice-row"><span>Grid</span><button class:active={gridSize === 6} on:click={() => chooseGridSize(6)}>6×6</button><button class:active={gridSize === 9} on:click={() => chooseGridSize(9)}>9×9</button></div>
          <div class="choice-row difficulty"><span>Difficulty</span>{#each ["easy", "normal", "hard"] as level}<button class:active={difficulty === level} on:click={() => difficulty = level as Difficulty}>{level}</button>{/each}</div>
          <label class="variant-select"><span>Variants</span><select value={selectedVariant} on:change={(event) => chooseVariant(event.currentTarget.value)}>{#each variantOptions as option}<option value={option.value}>{option.label}</option>{/each}</select></label>
          <label class="advanced-toggle"><span>Advanced</span><input type="checkbox" checked={advancedVariants} on:change={(event) => toggleAdvancedVariants(event.currentTarget.checked)} /></label>
          <button class="primary wide" disabled={busy} on:click={createRoom}>{busy ? "Creating…" : "Create room"}</button>
        {/if}
      </div>
      <div class="card active-list">
        <div class="section-title"><h2>Active rooms</h2><button class="small" on:click={() => refreshLobby()}>Refresh</button></div>
        {#if lobbyLoading}<div class="skeleton-list">{#each [1,2,3] as _}<div class="skeleton"></div>{/each}</div>
        {:else if activeRooms.length}{#each activeRooms as active}
          <div class="room-row"><span><strong>{active.code}</strong><small>{active.grid_size}×{active.grid_size} · {active.difficulty} · {active.status}</small></span><span class="room-count">{active.playerCount}/4</span><div class="room-row-actions"><button disabled={busy || active.status !== "lobby" || active.playerCount >= 4} on:click={() => joinRoom(active.code)}>Join</button><button on:click={() => watchRoom(active.code)}>Watch</button></div></div>
        {/each}{:else}<p class="muted">No rooms are active yet.</p>{/if}
      </div>
    </section>
  {:else}
    <section class="room-shell">
      <div class="mobile-room-summary">
        <div class="mobile-top-bar">
          <strong class="mobile-variant-label">{variantLabel}</strong>
          <div class="mobile-actions">
            <button class="small" on:click={returnToLobby}>← Lobby</button>
            {#if !spectatorMode}
              {#if room.status !== "playing"}
                <button class="small" on:click={copyInvite}>{copied ? "✓ Copied" : "⧉ Invite"}</button>
              {/if}
              {#if room.status === "playing" && isHost}
                <button class="small danger" disabled={busy} on:click={abortBattle}>Abort</button>
              {/if}
              {#if room.status === "finished" && isHost}
                <button class="small primary" disabled={busy} on:click={rematch}>Rematch</button>
              {/if}
            {/if}
          </div>
          <b class="timer">{elapsedLabel}</b>
          <button class="info-button" aria-label="Room information" title="Room information" on:click={() => roomInfoOpen = !roomInfoOpen}>
            {roomInfoOpen ? "×" : "ⓘ"}
          </button>
        </div>
        <div class="mobile-bottom-bar">
          <div class="summary-players">
            {#each players as player}
              <div class="player-card" class:me={player.id === myPlayerId} style={`--player-color:${penpaColors[player.color]}`}>
                <div class="player-top-row">
                  <i class="player-dot"></i>
                  <span class="player-name">{player.name}{player.id === room?.host_player_id ? " ★" : ""}</span>
                  {#if isHost && player.id !== myPlayerId && room?.status === "lobby"}
                    <button class="remove-player-btn" title="Remove player" on:click={() => kickPlayer(player)}>×</button>
                  {/if}
                </div>
                <div class="player-bottom-row">
                  <span class="player-score">{player.score} pts</span>
                  <span class="player-stats">
                    <small class="stat-correct">✓{playerMoveStats[player.id]?.correct || 0}</small>
                    <small class="stat-incorrect">✗{playerMoveStats[player.id]?.incorrect || 0}</small>
                  </span>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>
      <div class="room-layout">
        <aside class="room-sidebar" class:open={roomInfoOpen}>
          <div class="sidebar-section room-summary"><div class="sidebar-title"><strong>{variantLabel}</strong><span>{room.grid_size}×{room.grid_size} · {room.difficulty}</span></div></div>
          <hr class="sidebar-divider" />
          <div class="sidebar-section variant-rules-section">
            <small>Rules</small>
            {#if activeVariantRules.length}
              {#each activeVariantRules as v}
                <div class="variant-rule-item"><strong>{v.name}</strong><p>{v.rule}</p></div>
              {/each}
            {:else}
              <div class="variant-rule-item"><strong>Classic Sudoku</strong><p>Place digits 1 to {room?.grid_size || 9} into each row, column, and box without repeating.</p></div>
            {/if}
          </div>
          <hr class="sidebar-divider" />
          <div class="sidebar-section player-section">
            <small>Players</small>
            <div class="players">
              {#each players as player}
                <div class="player-card" class:me={player.id === myPlayerId} style={`--player-color:${penpaColors[player.color]}`}>
                  <div class="player-top-row">
                    <i class="player-dot"></i>
                    <span class="player-name">{player.name}{player.id === room.host_player_id ? " ★" : ""}</span>
                    {#if isHost && player.id !== myPlayerId && room?.status === "lobby"}
                      <button class="remove-player-btn" title="Remove player" on:click={() => kickPlayer(player)}>×</button>
                    {/if}
                  </div>
                  <div class="player-bottom-row">
                    <span class="player-score">{player.score} pts</span>
                    <span class="player-stats">
                      <small class="stat-correct">✓{playerMoveStats[player.id]?.correct || 0}</small>
                      <small class="stat-incorrect">✗{playerMoveStats[player.id]?.incorrect || 0}</small>
                    </span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
          <hr class="sidebar-divider" />
          <div class="battle-actions">{#if spectatorMode}<button on:click={returnToLobby}>← Back to lobby</button>{:else}{#if room.status !== "playing"}<button on:click={copyInvite}>{copied ? "✓ Copied!" : "⧉ Copy invite"}</button><button on:click={returnToLobby}>← Back to lobby</button>{/if}{#if room.status === "playing" && isHost}<button class="danger" disabled={busy} on:click={abortBattle}>Abort battle</button>{/if}{#if room.status === "finished" && isHost}<button class="primary" disabled={busy} on:click={rematch}>Rematch</button>{/if}{/if}</div>
        </aside>
        <div class="play-area" class:spectator={spectatorMode}>
          <div class="board-stage" class:revealed={boardVisible} class:board-complete={room?.status === "finished"}>
            {#if room.status === "preparing"}<iframe class="board hidden-board" title="Sudoku generator" bind:this={boardFrame} src={boardFrameSource()} on:load={boardReady}></iframe>{:else if room.puzzle_hash}<iframe class="board" title="Shared Sudoku board" bind:this={boardFrame} src={boardSrc} on:load={boardReady}></iframe>{/if}
            {#if !boardVisible}<div class="board-cover">{#if room.status === "preparing"}<strong>preparing a unique puzzle</strong><div class="prep-bar-container"><div class="prep-bar-fill" style={`width: ${Math.min(100, Math.max(0, (generationSeconds / 20) * 100))}%`}></div></div><span class="prep-countdown-text">{Math.max(0, 20 - generationSeconds)}s</span>{#if error || generationSeconds > 20}<div class="prep-actions"><button class="primary small" on:click={prepareRoomBoard}>↻ Retry board</button><button class="small" on:click={returnToLobby}>← Back to lobby</button></div>{/if}{:else if room.status === "lobby"}<strong>Ready in the lobby</strong><span>{boardLoaded ? "The board is loaded and hidden until battle starts." : "Loading the board…"}</span>{#if isHost}<button class="primary start-in-grid" disabled={busy || !boardLoaded} on:click={startBattle}>Start battle</button><div class="bot-buttons-row"><button class="secondary bot-btn" disabled={busy || !boardLoaded} on:click={() => addBots(1)}>🤖 1</button><button class="secondary bot-btn" disabled={busy || !boardLoaded} on:click={() => addBots(2)}>🤖 2</button><button class="secondary bot-btn" disabled={busy || !boardLoaded} on:click={() => addBots(3)}>🤖 3</button></div>{/if}{:else if countdown > 0}<strong class="countdown">{countdown}</strong><span>Get ready!</span>{:else if room.status === "finished"}<strong>{room.finish_reason === "time_limit" ? "Time limit reached" : "Battle complete"}</strong><span>{winners.length ? `${winners.map((player) => player.name).join(" & ")} ${winners.length > 1 ? "tie" : "wins"} with ${winners[0].score} points.` : "Final scores recorded."}</span>{:else}<strong>Loading the board</strong>{/if}</div>{/if}
          </div>
          {#if !spectatorMode}
            <div class="right-controls">
              <div class="sidebar-section personal-settings"><div class="identity compact">{#if editingName}<input maxlength="24" bind:value={draftName} /><button class="small" on:click={saveName}>Save</button>{:else}<strong>{playerName}</strong><button class="icon-button" aria-label="Edit name" title="Edit name" on:click={editName}>✎</button>{/if}</div></div>
              <div class="sidebar-section theme-section"><small>Appearance</small><button class="theme-toggle" on:click={toggleTheme}>{darkMode ? "☀ Light" : "☾ Dark"}</button></div>
              <div class="sidebar-section timer-section"><b class="desktop-timer">{elapsedLabel}</b></div>
              <div class="battle-input-panel" aria-label="Battle number input">
                <button class:active={noteMode === "normal"} class="mode-normal" disabled={room?.status === "finished" || !boardVisible} aria-label="Normal digits" title="Normal digits (Z)" on:click={() => chooseBattleNoteMode("normal")}><span class="note-icon"><b>1</b></span><kbd>z</kbd></button>
                <button class:active={noteMode === "center"} class="mode-center" disabled={room?.status === "finished" || !boardVisible} aria-label="Center notes" title="Center notes (X)" on:click={() => chooseBattleNoteMode("center")}><span class="note-icon"><small>23</small></span><kbd>x</kbd></button>
                <button class:active={noteMode === "corner"} class="mode-corner" disabled={room?.status === "finished" || !boardVisible} aria-label="Corner notes" title="Corner notes (C)" on:click={() => chooseBattleNoteMode("corner")}><span class="note-icon corner-numbers"><small>4</small><small>5</small><small>6</small><small>7</small></span><kbd>c</kbd></button>
                {#each [1,2,3,4,5,6,7,8,9] as digit}{#if digit <= room.grid_size}<button class={`digit digit-${digit}`} disabled={room?.status === "finished" || !boardVisible} on:click={() => enterBattleDigit(digit)}>{digit}</button>{/if}{/each}
              </div>
            </div>
          {/if}
        </div>
      </div>
    </section>
  {/if}
  {#if battleToast}<div class="battle-toast" role="status">{battleToast}</div>{/if}
  {#if error}<p class="error">{error}</p>{/if}
</main>

<style>
  :global(*){box-sizing:border-box} :global(body){margin:0;background:#f3f6f8;color:#1d2a35;font-family:Inter,system-ui,sans-serif}
  :global(button),:global(input){font:inherit} main{min-height:100vh;padding:18px} header{max-width:1120px;margin:0 auto 14px} h1{margin:0;font-size:clamp(25px,4vw,38px)} h2{margin:6px 0 16px;font-size:18px}
  header{display:flex;align-items:center;justify-content:space-between}.theme-toggle{white-space:nowrap}
  button{border:1px solid #c8d1d8;border-radius:8px;background:white;color:#23313d;padding:9px 12px;cursor:pointer} button:hover{border-color:#2582b8} button:disabled{opacity:.5;cursor:not-allowed}.primary{border-color:#1679b4;background:#1688ca;color:white}.wide{width:100%;margin-top:14px}.small{padding:5px 9px;font-size:12px}.icon-button{border:0;padding:3px 6px;background:transparent;font-size:18px}.active{border-color:#1688ca!important;background:#e8f5fc!important;color:#096698!important}
  .lobby-layout{display:grid;grid-template-columns:minmax(300px,560px) minmax(280px,420px);gap:18px;max-width:1000px;margin:auto}.card{border:1px solid #d6dee4;border-radius:14px;background:white;padding:18px;box-shadow:0 5px 24px #1b344511}.identity{display:flex;align-items:center;gap:8px;min-height:34px;margin-bottom:12px}.identity.compact{border:1px solid #cbd6de;border-radius:8px;padding:3px 5px;background:#f6f9fa}.identity span{color:#677580;font-size:13px}.identity input{min-width:0;padding:7px;border:1px solid #bdc9d2;border-radius:7px}.choice-row{display:flex;align-items:center;gap:7px;margin:10px 0}.choice-row>span{width:80px;color:#586875;font-size:13px}.choice-row button{text-transform:capitalize}.variants{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:15px}.variants>span{grid-column:1/-1;color:#586875;font-size:13px}.variants label{display:flex;gap:7px;font-size:13px}.join-code{display:flex;gap:7px;margin-top:11px}.join-code input{min-width:0;flex:1;padding:9px;border:1px solid #bdc9d2;border-radius:8px;text-transform:uppercase}.section-title{display:flex;align-items:center;justify-content:space-between}.section-title h2{margin:0}.room-row{display:flex;width:100%;justify-content:space-between;align-items:center;margin-top:9px;text-align:left}.room-row span:first-child{display:flex;flex-direction:column;gap:2px}.room-row small,.muted{color:#71808c}.skeleton{height:54px;margin-top:9px;border-radius:8px;background:linear-gradient(90deg,#edf1f4 25%,#f8fafb 50%,#edf1f4 75%);background-size:200% 100%;animation:shimmer 1s infinite}@keyframes shimmer{to{background-position:-200% 0}}
  .room-shell{display:flex;flex-direction:column;gap:10px;max-width:1400px;height:calc(100vh - 82px);margin:auto}.room-bar{display:flex;align-items:center;gap:15px;border:1px solid #d6dee4;border-radius:12px;background:white;padding:9px 12px}.room-bar>div:first-child{display:flex;gap:7px;align-items:baseline}.room-bar small{color:#74828d}.room-meta{flex:1;color:#61717d;font-size:13px}.room-bar .identity{margin:0}.timer{min-width:55px;font-variant-numeric:tabular-nums;font-weight:800}.players{display:flex;gap:7px;overflow-x:auto}.mobile-score-strip{display:none}.player{display:flex;align-items:center;gap:7px;min-width:145px;border:1px solid #d6dee4;border-left:5px solid var(--player-color);border-radius:8px;background:white;padding:7px 9px}.player i{width:9px;height:9px;border-radius:50%;background:var(--player-color)}.player span{min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.player.me{box-shadow:inset 0 0 0 1px var(--player-color)}.battle-actions{display:flex;gap:7px}.play-layout{display:grid;grid-template-columns:minmax(120px,180px) minmax(0,1fr) minmax(120px,180px);gap:10px;flex:1;min-height:0}.board-stage{position:relative;min-height:0;border:1px solid #cbd5dc;border-radius:12px;overflow:hidden;background:#e8edf1}.board{width:100%;height:100%;border:0;visibility:hidden}.board-stage.revealed .board{visibility:visible}.hidden-board{position:absolute;inset:0;opacity:0;pointer-events:none}.board-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:linear-gradient(135deg,#edf4f7,#dfe9ee);text-align:center;color:#475a68}.board-cover strong{font-size:22px;color:#20323f}.board-cover .countdown{font-size:clamp(72px,18vw,180px);line-height:1;color:#1688ca}.prep-bar-container{width:80%;max-width:280px;height:10px;background:rgba(0,0,0,0.12);border-radius:5px;overflow:hidden;margin:6px 0 2px}.prep-bar-fill{height:100%;background:linear-gradient(90deg,#1688ca,#38bdf8);transition:width .3s linear;border-radius:4px}.prep-countdown-text{font-size:14px;font-weight:700;color:#20323f;opacity:.9}.error{position:fixed;right:18px;bottom:10px;max-width:min(520px,calc(100vw - 36px));border-radius:9px;background:#b42318;color:white;padding:10px 14px;z-index:10}
  main.dark{background:#17212a;color:#e1e8ed}main.dark .card,main.dark .room-bar,main.dark .room-sidebar,main.dark .player,main.dark button,main.dark input{border-color:#435360;background:#24313c;color:#e1e8ed}main.dark .identity.compact{background:#1c2832;border-color:#435360}main.dark .room-meta,main.dark .muted,main.dark .room-row small,main.dark .sidebar-title span,main.dark .variant-rule-item p{color:#a9b7c2}main.dark .sidebar-title strong,main.dark .variant-rule-item strong{color:#e2e8f0}main.dark .board-cover{background:linear-gradient(135deg,#26343f,#1d2932);color:#b9c5ce}main.dark .board-cover strong{color:#eef3f6}
  @media(max-width:700px){main{padding:8px}header{margin-bottom:7px}h1{font-size:23px}.lobby-layout{grid-template-columns:1fr}.room-shell{height:auto;min-height:calc(100dvh - 48px);gap:6px}.room-bar{padding:6px 8px;gap:7px}.room-meta{display:none}.room-bar .identity strong{max-width:84px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.mobile-score-strip{display:flex;align-items:center;gap:8px;min-height:30px}.mobile-score-strip span{display:flex;align-items:center;gap:3px}.mobile-score-strip i{width:8px;height:8px;border-radius:50%;background:var(--player-color)}.mobile-score-strip button{margin-left:auto}.players{display:none;gap:4px}.players.mobile-expanded{display:flex}.player{min-width:0;flex:1 0 78px;max-width:120px;padding:4px 5px;border-left-width:4px;font-size:11px}.player i{display:none}.player span{max-width:70px}.battle-actions{display:grid;grid-template-columns:repeat(2,1fr)}.battle-actions button{padding:7px 5px;font-size:12px}.play-layout{display:flex;flex-direction:column;flex:1}.layout-balance{display:none}.board-stage{height:min(58dvh,620px);flex:1 1 390px;border-radius:8px}.variants{grid-template-columns:1fr}.difficulty button{padding-inline:8px}}

  .landing-choices{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:18px}.landing-choices button{min-height:54px}.variant-select{display:grid;grid-template-columns:80px 1fr;align-items:center;gap:7px;margin-top:14px;color:#586875;font-size:13px}.variant-select select{min-width:0;padding:9px 12px;border:1px solid #bdc9d2;border-radius:8px;background:#fff;color:#23313d;font-size:13px;cursor:pointer}.variant-select select:hover{border-color:#2582b8}main.dark .variant-select select{border-color:#435360;background:#1c2832;color:#e1e8ed}
  .advanced-toggle{display:grid;grid-template-columns:80px 1fr;align-items:center;gap:7px;margin-top:10px;color:#586875;font-size:13px}.advanced-toggle input{justify-self:start;margin:0;accent-color:#1688ca}
  main.in-room{height:100dvh;min-height:0;padding:10px;overflow:hidden}.room-shell{width:100%;max-width:1500px;height:100%;min-height:0}.mobile-room-summary{display:none}.room-layout{display:grid;grid-template-columns:220px minmax(0,1fr);gap:10px;height:100%;min-height:0}.room-sidebar{display:flex;flex-direction:column;gap:6px;min-height:0;padding:10px;border:1px solid #d6dee4;border-radius:12px;background:#fff;overflow:hidden}.sidebar-title,.room-code{display:flex;flex-direction:column;gap:2px}.sidebar-title small,.room-code small{color:#71808c}.room-code strong{font-size:20px;letter-spacing:.08em}.room-sidebar .identity{margin:0}.variant-rules-section{max-height:120px;overflow-y:auto;flex-shrink:1}.player-section{flex-shrink:0}.room-sidebar .players{display:flex;flex-direction:column;gap:6px;overflow-y:auto}.room-sidebar .player{width:100%;min-width:0}.desktop-timer{font-size:32px;font-weight:800;font-variant-numeric:tabular-nums;text-align:center;display:block}.battle-actions{display:flex;flex-direction:column;margin-top:auto;flex-shrink:0}.danger{border-color:#d13b32!important;background:#b42318!important;color:#fff!important}
  .sidebar-divider{border:0;border-top:1px solid #e2e8f0;margin:2px 0}main.dark .sidebar-divider{border-top-color:#334155}
  .play-area{display:grid;grid-template-columns:minmax(0,1fr) 190px;gap:10px;min-width:0;min-height:0}.board-stage{height:100%;min-width:0}.right-controls{display:flex;flex-direction:column;gap:8px;width:190px;height:100%;min-height:0}.right-controls .battle-input-panel{margin-top:auto}
  .battle-input-panel{display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:6px;width:100%}.battle-input-panel button{position:relative;width:100%;aspect-ratio:1;padding:2px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-weight:750;overflow:hidden;border-radius:8px}.battle-input-panel .digit{font-size:26px}.note-icon{position:relative;display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:1.5px solid currentColor;border-radius:3px}.note-icon b{font-size:18px}.note-icon small{font-size:10px}.corner-numbers{display:grid;grid-template-columns:1fr 1fr;line-height:1}.corner-numbers small{font-size:8px}.battle-input-panel kbd{position:absolute;right:4px;bottom:3px;font-size:9px;line-height:1;opacity:.65}.battle-toast{position:fixed;left:50%;top:16px;transform:translateX(-50%);padding:10px 15px;border-radius:9px;background:#20323f;color:#fff;box-shadow:0 8px 24px #0003;z-index:1000}  .start-in-grid{margin-top:8px;width:190px;height:44px;display:inline-flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;box-sizing:border-box}
  .player-card{display:flex;flex-direction:column;gap:2px;padding:5px 8px;border:1.5px solid var(--player-color);border-radius:8px;background:#f8fafc;color:#1e293b;font-size:11px;line-height:1.25;min-width:110px}
  .player-card.me{box-shadow:0 0 0 1px var(--player-color)}
  .player-top-row{display:flex;align-items:center;gap:5px;font-weight:700;white-space:nowrap;overflow:hidden}
  .player-dot{width:7px;height:7px;border-radius:50%;background:var(--player-color);flex-shrink:0}
  .player-name{overflow:hidden;text-overflow:ellipsis}
  .remove-player-btn{border:0;background:transparent;color:#94a3b8;font-size:14px;padding:0 4px;margin-left:auto;cursor:pointer;line-height:1}
  .remove-player-btn:hover{color:#ef4444}
  .player-bottom-row{display:flex;align-items:center;justify-content:space-between;gap:6px;font-size:11px;color:#475569}
  .player-score{font-size:13px;font-weight:800;color:#0f172a}
  .player-stats{display:flex;gap:4px}
  .stat-correct{color:#16a34a;font-weight:600}
  .stat-incorrect{color:#dc2626;font-weight:600}
  main.dark .player-card{background:#1e293b;color:#f1f5f9}
  main.dark .player-bottom-row{color:#94a3b8}
  main.dark .player-score{color:#38bdf8}
  .bot-buttons-row{display:flex;gap:6px;margin-top:6px}
  .bot-buttons-row button{flex:1;padding:6px 4px;font-size:12px}
  .board-stage.board-complete .board{filter:blur(3px);pointer-events:none;transition:filter .3s ease}

  @media(max-width:700px){:global(body){overflow:hidden}main.in-room{height:100dvh;padding:5px}.room-shell{height:100%;min-height:0;gap:5px}.mobile-room-summary{display:flex;flex-direction:column;gap:5px;padding:6px;border:1px solid #d6dee4;border-radius:8px;background:#fff;font-size:11px}.mobile-top-bar{display:flex;align-items:center;justify-content:space-between;gap:6px;width:100%}.mobile-actions{display:flex;align-items:center;gap:4px}.mobile-bottom-bar{display:flex;align-items:center;gap:8px;width:100%;overflow-x:auto}.mobile-variant-label{font-size:11px;white-space:nowrap;color:#475569;flex-shrink:0}main.dark .mobile-variant-label{color:#94a3b8}.summary-players{display:flex;gap:6px;min-width:0;overflow-x:auto}.info-button{width:30px;height:30px;padding:0;border-radius:50%;font-size:17px}.room-layout{display:block;position:relative;height:calc(100% - 75px)}.room-sidebar{display:none;position:fixed;inset:48px 6px 6px;z-index:900;overflow-y:auto}.room-sidebar.open{display:flex}.play-area{display:flex;flex-direction:column;height:100%;gap:5px}.right-controls{width:100%;height:auto;gap:5px;display:flex;flex-direction:column;align-items:center}.right-controls .sidebar-section{display:none}.right-controls .battle-input-panel{margin-top:0}.board-stage{flex:1 1 auto;height:auto;min-height:0}.battle-input-panel{flex:0 0 auto;display:grid;grid-template-columns:repeat(4,52px);grid-template-rows:repeat(3,52px);gap:5px;width:max-content}.battle-input-panel button{width:52px;height:52px;min-height:0;aspect-ratio:1}.battle-input-panel .digit{font-size:29px}.battle-input-panel kbd{display:none}.mode-normal{grid-column:4;grid-row:1}.mode-center{grid-column:4;grid-row:2}.mode-corner{grid-column:4;grid-row:3}.digit-1{grid-column:1;grid-row:1}.digit-2{grid-column:2;grid-row:1}.digit-3{grid-column:3;grid-row:1}.digit-4{grid-column:1;grid-row:2}.digit-5{grid-column:2;grid-row:2}.digit-6{grid-column:3;grid-row:2}.digit-7{grid-column:1;grid-row:3}.digit-8{grid-column:2;grid-row:3}.digit-9{grid-column:3;grid-row:3}main.dark .mobile-room-summary{border-color:#435360;background:#24313c}.battle-toast{top:48px;max-width:calc(100vw - 24px);white-space:nowrap}}
  .landing-choices{grid-template-columns:1fr}
  .room-sidebar .player{background:transparent}
  .lobby-profile{max-width:1000px;margin:0 auto 12px;padding:10px 18px}.lobby-profile .identity{margin:0}.lobby-profile .identity strong{flex:1}.lobby-profile .identity input{flex:1}
  .room-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px}.room-count{font-weight:700}.room-row-actions{display:flex;gap:5px}.room-row-actions button{padding:6px 9px}
  .personal-settings{display:block}.personal-settings .identity{width:100%;min-height:36px}.personal-settings .identity strong{flex:1}.theme-section{display:flex;align-items:center;justify-content:space-between;gap:8px}.theme-section .theme-toggle{min-height:36px;padding-block:6px}
  .play-area.spectator{grid-template-columns:minmax(0,1fr)}.play-area.spectator .board{pointer-events:none}
  @media(max-width:700px){
    .room-sidebar.open{display:flex;inset:48px 6px auto;max-height:calc(100dvh - 54px);gap:6px;padding:6px;border-color:transparent;background:rgba(20,35,45,.12);box-shadow:none}
    .room-sidebar .sidebar-section,.room-sidebar .battle-actions{flex:none;padding:7px;background:rgba(255,255,255,.88);backdrop-filter:blur(6px)}
    .room-sidebar .player{padding:4px 6px;background:transparent}
    .room-sidebar .players{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));overflow:visible}
    .room-sidebar .player-section{flex:none}
    .room-sidebar .player-section,.room-sidebar .timer-section{display:none}
    .personal-settings .identity{align-items:center;margin:0}.personal-settings .identity strong{line-height:34px}.personal-settings .identity .icon-button{height:34px;width:34px;padding:0}.theme-section .theme-toggle{height:34px;min-height:34px}
    .room-sidebar .desktop-timer{font-size:20px}
    .room-sidebar .battle-actions{display:grid;margin-top:0}
    main.dark .room-sidebar.open{background:rgba(10,18,24,.16)}
    main.dark .room-sidebar .sidebar-section,main.dark .room-sidebar .battle-actions{background:rgba(28,40,50,.9)}
  }
</style>
