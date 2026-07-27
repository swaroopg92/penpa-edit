import fs from "node:fs";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import { gzipSync } from "node:zlib";

const require = createRequire(import.meta.url);
const SudokuCSP = require("../docs/js/sudoku_csp.js");

const bundleSource = fs.readFileSync(new URL("../docs/cspuz.js", import.meta.url), "utf8");
const factoryStart = bundleSource.indexOf("async function Tb(");
const factoryEnd = bundleSource.indexOf("  let Qn = await Tb();", factoryStart);
if (factoryStart < 0 || factoryEnd < 0) {
  throw new Error("Could not locate the private cspuz Emscripten factory.");
}

let factorySource = bundleSource
  .slice(factoryStart, factoryEnd)
  .replace("import.meta.url", JSON.stringify(import.meta.url))
  .replace("H ?? (H = z())", "H ?? (H = e.wasmBinary ?? z())");

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const publicField = (object, key, value) => {
  object[key] = value;
  return value;
};
const getFactory = await new AsyncFunction(
  "__publicField",
  `${factorySource}\nreturn Tb;`,
)(publicField);

const wasmBinary = fs.readFileSync(new URL("../docs/cspuz.wasm", import.meta.url));
const currentSolverSource = fs.readFileSync(
  new URL("../docs/js/sudoku_csp.js", import.meta.url),
);
const initStarted = performance.now();
const wasmModule = await getFactory({ wasmBinary });
const wasmInitMs = performance.now() - initStarted;

const horizontalBorder = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 9 }, () => (row + 1) % 3 === 0),
);
const verticalBorder = Array.from({ length: 9 }, () =>
  Array.from({ length: 8 }, (_, column) => (column + 1) % 3 === 0),
);
function toWasmProblem(puzzle) {
  const numbers = puzzle.map((row) => row.map((value) => value || null));
  return {
    size: 9,
    answer: { numbers: numbers.map((row) => row.map(() => null)) },
    givenNumbers: { numbers },
    blocks: { horizontalBorder, verticalBorder },
  };
}

function solveWithWasm(problem) {
  const encoded = new TextEncoder().encode(JSON.stringify(problem));
  const inputPointer = wasmModule._malloc(encoded.length);
  wasmModule.HEAPU8.set(encoded, inputPointer);
  const outputPointer = wasmModule._solve_problem(inputPointer, encoded.length);
  const outputLength =
    wasmModule.HEAPU8[outputPointer] |
    (wasmModule.HEAPU8[outputPointer + 1] << 8) |
    (wasmModule.HEAPU8[outputPointer + 2] << 16) |
    (wasmModule.HEAPU8[outputPointer + 3] << 24);
  const json = new TextDecoder().decode(
    wasmModule.HEAPU8.slice(outputPointer + 4, outputPointer + 4 + outputLength),
  );
  return JSON.parse(json);
}

function measure(name, operation, iterations = 10) {
  operation();
  const samples = [];
  for (let index = 0; index < iterations; index += 1) {
    const started = performance.now();
    operation();
    samples.push(performance.now() - started);
  }
  samples.sort((left, right) => left - right);
  return {
    name,
    iterations,
    medianMs: samples[Math.floor(samples.length / 2)],
    meanMs: samples.reduce((sum, value) => sum + value, 0) / samples.length,
    minMs: samples[0],
    maxMs: samples.at(-1),
  };
}

const puzzles = {
  easy: [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ],
  aiEscargot: [
    [1, 0, 0, 0, 0, 7, 0, 9, 0],
    [0, 3, 0, 0, 2, 0, 0, 0, 8],
    [0, 0, 9, 6, 0, 0, 5, 0, 0],
    [0, 0, 5, 3, 0, 0, 9, 0, 0],
    [0, 1, 0, 0, 8, 0, 0, 0, 2],
    [6, 0, 0, 0, 0, 4, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 4, 0, 0, 0, 0, 0, 0, 7],
    [0, 0, 7, 0, 0, 0, 3, 0, 0],
  ],
  empty: Array.from({ length: 9 }, () => new Array(9).fill(0)),
};

console.log(
  JSON.stringify(
    {
      wasmInitMs,
      assetBytes: {
        currentSolver: currentSolverSource.length,
        currentSolverGzip: gzipSync(currentSolverSource).length,
        suppliedBundle: Buffer.byteLength(bundleSource),
        suppliedBundleGzip: gzipSync(bundleSource).length,
        suppliedWasm: wasmBinary.length,
        suppliedWasmGzip: gzipSync(wasmBinary).length,
      },
      cases: Object.fromEntries(
        Object.entries(puzzles).map(([name, puzzle]) => {
          const wasmProblem = toWasmProblem(puzzle);
          const wasmResult = solveWithWasm(wasmProblem);
          const currentResult = SudokuCSP.getCandidates(puzzle, {});
          return [
            name,
            {
              equivalent:
                JSON.stringify(wasmResult.decidedNumbers) ===
                JSON.stringify(
                  currentResult.forced.map((row) => row.map((value) => value || null)),
                ),
              unique: currentResult.unique,
              measurements: [
                measure("current getCandidates", () =>
                  SudokuCSP.getCandidates(puzzle, {}),
                ),
                measure("current solve", () => SudokuCSP.solve(puzzle, {})),
                measure("cspuz wasm irrefutable facts", () =>
                  solveWithWasm(wasmProblem),
                ),
              ],
            },
          ];
        }),
      ),
    },
    null,
    2,
  ),
);
