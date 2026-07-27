# cspuz WebAssembly solver investigation

## Decision

Do **not** replace `SudokuCSP` wholesale with the supplied files. Use cspuz as an
optional, worker-hosted fast path for **candidate / irrefutable-fact analysis**
when every active rule can be translated to its schema, and retain the current
solver for unsupported variants, solve-one, conflict reporting, cancellation,
and answer enumeration.

This is worth prototyping: the checked-in benchmark shows cspuz candidate
analysis is about 16× faster on AI Escargot and 12× faster on an empty grid.
It is not universally faster: on the easy case it is slightly slower, while
the current solve-one operation remains much faster in all three cases.

## What the supplied artifacts are

- [`docs/cspuz.js`](../docs/cspuz.js) is a 1,921,181-byte bundled **complete
  React application**, not a reusable solver module. It initializes React and
  renders into `#root` at [`docs/cspuz.js:34405`](../docs/cspuz.js#L34405).
  It exposes no browser global or ES-module export.
- The bundle already runs WebAssembly. Its Emscripten-style factory starts at
  [`docs/cspuz.js:10988`](../docs/cspuz.js#L10988), embeds a `\0asm` payload at
  [`docs/cspuz.js:11031`](../docs/cspuz.js#L11031), and instantiates it at
  [`docs/cspuz.js:14770`](../docs/cspuz.js#L14770).
- `docs/cspuz.wasm` (645,428 bytes) and the inline payload are byte-for-byte
  identical: both have SHA-256
  `06a721cfe6c0ff1698cc3771aa07c16ef157444f5f46690b2d4c40ca2a9d1bde`.
  Nothing in the repository refers to the separate `.wasm`. Therefore,
  changing from the inline bytes to this file can improve download size,
  JavaScript parsing, and independent caching, but **cannot improve solve
  speed**.
- Raw WASM imports are 21 minified functions (`a.a` through `a.u`), so the
  `.wasm` cannot be instantiated alone. The matching glue maps its exports to
  `_solve_problem`, `_free`, `_malloc`, memory, and the indirect-call table at
  [`docs/cspuz.js:15012`](../docs/cspuz.js#L15012).
- Module initialization is asynchronous (`await Tb()`) at
  [`docs/cspuz.js:15125`](../docs/cspuz.js#L15125), but `_solve_problem` itself
  is synchronous.

The binary contains Rust source paths for `cspuz_rs` and `cspuz_core`, Emscripten
runtime paths, and Glucose sources at [`docs/cspuz.js:14556`](../docs/cspuz.js#L14556).
The bundled UI also links back to cspuz_core at
[`docs/cspuz.js:30927`](../docs/cspuz.js#L30927). This agrees with the
[upstream cspuz_core repository](https://github.com/semiexp/cspuz_core/tree/f9ebf47eb1db9c012860b84c74f46d9220a438cd).

## API and semantic mismatch

The only high-level bridge in the bundle is `WE(problem)` at
[`docs/cspuz.js:15126`](../docs/cspuz.js#L15126). It:

1. serializes `{ size, ...enabledRuleData }` to UTF-8 JSON;
2. allocates and copies the input into WASM memory;
3. calls `_solve_problem(pointer, length)`; and
4. decodes length-prefixed JSON into either `null` or
   `{ decidedNumbers, candidates }`.

This matches the first-party
[`solver.js`](https://github.com/semiexp/puzzle-webapp/blob/01d35cc132792dc43a56ea41985ad02e155a89f3/packages/sudoku-editor/src/solver.js)
wrapper and
[`lib.rs`](https://github.com/semiexp/puzzle-webapp/blob/01d35cc132792dc43a56ea41985ad02e155a89f3/packages/sudoku-editor/solver/src/lib.rs):
the native function computes irrefutable facts, not a general solve/enumerate
API. The returned buffer is a reused Rust static vector, but the wrapper never
frees its `_malloc`-allocated input. An integration wrapper should call
`_free(inputPointer)` after `_solve_problem` returns and must not free the
static output pointer.

By contrast, the current solver:

- registers handlers through `validatePartial` at
  [`docs/js/sudoku_csp.js:275`](../docs/js/sudoku_csp.js#L275);
- performs recursive solution search at
  [`docs/js/sudoku_csp.js:560`](../docs/js/sudoku_csp.js#L560);
- derives candidate sets by repeated assumption solves at
  [`docs/js/sudoku_csp.js:617`](../docs/js/sudoku_csp.js#L617); and
- exposes `createProblem`, candidate analysis, async candidate analysis,
  conflict discovery, solve-one, and answer enumeration at
  [`docs/js/sudoku_csp.js:846`](../docs/js/sudoku_csp.js#L846) and
  [`docs/js/sudoku_csp.js:5045`](../docs/js/sudoku_csp.js#L5045).

The current public result shapes also differ: cspuz candidates are boolean
vectors and `decidedNumbers` uses `null`; `SudokuCSP` candidates are digit
lists, forced cells use `0`, and failures carry structured conflict details.

## Coverage

`SudokuCSP.registeredConstraints()` reports **105 unique constraint names**.
The supplied cspuz app has 19 rule records at
[`docs/cspuz.js:10967`](../docs/cspuz.js#L10967): answer, givens, blocks, and
only 16 actual variant families:

`oddEven`, `nonConsecutive`, `xv`, `diagonal`, `arrow`, `thermo`, `killer`,
`consecutive`, `skyscrapers`, `xSums`, `extraRegions`, `palindrome`,
`forbiddenCandidates`, `antiKnight`, `noTouch`, and `kropki`.

The upstream Rust
[`add_constraints`](https://github.com/semiexp/puzzle-webapp/blob/01d35cc132792dc43a56ea41985ad02e155a89f3/packages/sudoku-editor/solver/src/solver.rs)
confirms that finite list. A wholesale replacement would therefore require
porting roughly 89 additional Penpa constraint families, plus compatibility
for conflict explanations, cancellation/progress, solve-one, and enumeration.

## Benchmark

Run:

```powershell
node scripts/benchmark_cspuz.mjs
```

The harness at [`scripts/benchmark_cspuz.mjs`](../scripts/benchmark_cspuz.mjs)
extracts the private Emscripten factory from the supplied bundle, injects the
separate (identical) WASM bytes, warms both solvers, checks equivalent forced
digits, and reports ten-run timing distributions. A representative isolated
run on this workspace produced:

| 9×9 case | Current `getCandidates` | cspuz irrefutable facts | Current `solve` |
|---|---:|---:|---:|
| Easy, unique | ~24 ms | ~31 ms | ~0.34 ms |
| AI Escargot, unique | ~804 ms | ~50 ms | ~1.95 ms |
| Empty, non-unique | ~738 ms | ~62 ms | ~3.77 ms |

Timings are machine- and run-dependent; a second run showed the same direction
(~29/891/841 ms current candidates versus ~50/43/69 ms cspuz). The harness
verified equivalent forced/decided digits for all three cases. These are
microbenchmarks of classic Sudoku only, not evidence for the 16 variant
families, startup on target browsers, or end-to-end UI latency. WASM
initialization was about 9.5 ms in the second run.

Asset trade-off from the same harness:

| Asset | Raw | gzip |
|---|---:|---:|
| Current solver | 231,860 B | 35,373 B |
| Supplied full JS app | 1,921,181 B | 506,724 B |
| Supplied WASM | 645,428 B | 249,407 B |

The full `cspuz.js` bundle should not be shipped as the adapter; rebuild or
extract minimal generated glue around an external WASM asset.

## Recommended hybrid integration

1. Build the upstream Sudoku solver from pinned source, producing minimal
   Emscripten glue plus an external `.wasm`; do not vendor the full UI bundle.
   Its first-party build script compiles Rust for
   `wasm32-unknown-emscripten` and exports exactly
   `_solve_problem`, `_malloc`, and `_free`
   ([package script](https://github.com/semiexp/puzzle-webapp/blob/01d35cc132792dc43a56ea41985ad02e155a89f3/packages/sudoku-editor/package.json),
   [emcc wrapper](https://github.com/semiexp/puzzle-webapp/blob/01d35cc132792dc43a56ea41985ad02e155a89f3/packages/sudoku-editor/solver/util/emcc)).
2. Load and retain one module instance inside a Web Worker. The application
   already uses a worker to keep recursive analysis off the UI thread at
   [`docs/js/sudoku_solver_worker.js:1`](../docs/js/sudoku_solver_worker.js#L1)
   and creates/terminates workers at
   [`docs/js/sudoku_solver.js:268`](../docs/js/sudoku_solver.js#L268).
3. Add a strict capability gate and schema adapter. Use cspuz only when every
   active constraint has a proven mapping to one of the 16 supported families;
   otherwise use `SudokuCSP`. Never silently omit an unsupported rule.
4. Adapt `{decidedNumbers, boolean candidates}` into the existing
   `{forced, digit-list candidates, satisfiable, unique}` contract. Preserve
   the current solver for detailed conflict reporting.
5. Keep the current solve-one path; it is already far faster. Keep the current
   `enumerateAnswers(limit)` path used by generation and uniqueness workflows.
6. Add differential tests for every supported family, including satisfiable,
   unsatisfiable, unique, multiple-solution, negative-constraint/all-shown, and
   non-9×9 cases, followed by browser benchmarks on representative puzzles.

This provides the demonstrated acceleration where it matters without reducing
the solver's current feature coverage.

## Licensing and provenance

The two supplied artifacts have no license header, source map, or useful WASM
custom sections. The bundled UI links to `licenses.txt` at
[`docs/cspuz.js:30951`](../docs/cspuz.js#L30951), but that file was not supplied.

Upstream `puzzle-webapp` is
[MIT-licensed](https://github.com/semiexp/puzzle-webapp/blob/01d35cc132792dc43a56ea41985ad02e155a89f3/LICENSE).
Upstream `cspuz_core` is also MIT-licensed, but its
[LICENSE](https://github.com/semiexp/cspuz_core/blob/f9ebf47eb1db9c012860b84c74f46d9220a438cd/LICENSE)
contains additional Glucose and MiniSat copyright/license notices that must be
retained when distributing a Glucose-backed build. A production integration
should pin both source revisions, reproduce the build, and ship all required
notices rather than relying on these provenance-poor binary drops.
