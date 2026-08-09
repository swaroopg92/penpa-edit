const adjectives = ["Hidden", "Logical", "Nimble", "Exact", "Patient", "Clever", "Swift", "Keen", "Pencilled", "Solved"];
const nouns = ["Digit", "Candidate", "Grid", "Box", "Cell", "Pair", "Clue", "Solver", "Sextet", "Nine"];

export const battleNameKey = "sudotoku-battle-name";

export function generateBattleName(random = Math.random) {
  const adjective = adjectives[Math.floor(random() * adjectives.length)];
  const noun = nouns[Math.floor(random() * nouns.length)];
  return `${adjective} ${noun}`;
}

export function loadBattleName() {
  const stored = window.localStorage.getItem(battleNameKey)?.trim();
  const name = stored || generateBattleName();
  window.localStorage.setItem(battleNameKey, name);
  return name;
}

export function saveBattleName(value: string) {
  const name = value.trim().slice(0, 24);
  if (!name) throw new Error("Player name is required.");
  window.localStorage.setItem(battleNameKey, name);
  return name;
}
