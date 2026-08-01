const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const app = fs.readFileSync(path.join(root, "docs/src/App.svelte"), "utf8");
const solver = fs.readFileSync(path.join(root, "docs/js/sudoku_solver.js"), "utf8");
const general = fs.readFileSync(path.join(root, "docs/js/general.js"), "utf8");
const puzzle = fs.readFileSync(path.join(root, "docs/js/class_p.js"), "utf8");
const square = fs.readFileSync(path.join(root, "docs/js/class_square.js"), "utf8");
const main = fs.readFileSync(path.join(root, "docs/js/main.js"), "utf8");
const metadata = JSON.parse(fs.readFileSync(path.join(root, "variant_metadata.json"), "utf8"));

test("New grid offers every supported size from 6 through 9", function() {
    assert.match(app, /let newGridSize:\s*6\s*\|\s*7\s*\|\s*8\s*\|\s*9/);
    [6, 7, 8, 9].forEach(function(size) {
        assert.match(app, new RegExp("requestNewGrid\\(" + size + "\\)"));
    });
    assert.match(general, /requestedSudokuSize\s*=\s*Number\(window\.sudotokuNewGridSize\)/);
    assert.match(general, /requestedSudokuSize\s*===\s*7[\s\S]*?rows\s*=\s*\[3,\s*4,\s*5,\s*6,\s*7,\s*8\][\s\S]*?cols\s*=\s*\[\]/);
});

test("Generate opens the existing-grid confirmation directly", function() {
    assert.doesNotMatch(app, /actionMenu:\s*[^;]*"generate"/);
    assert.match(app, /<button on:click=\{requestGenerator\}[\s\S]*?<span>✦<\/span>Generate[\s\S]*?<\/button>/);
    assert.doesNotMatch(app, /requestGenerator\("(?:new|existing)"\)/);
});

test("confirmation and About surfaces use explicit readable theme colors", function() {
    assert.match(app, /--modal-primary-background:\s*#[0-9a-f]{6}/i);
    assert.match(app, /--modal-primary-foreground:\s*#[0-9a-f]{6}/i);
    assert.match(app, /--about-background:\s*#[0-9a-f]{6}/i);
    assert.match(app, /--about-foreground:\s*#[0-9a-f]{6}/i);
    assert.match(app, /background:\s*var\(--modal-primary-background\)/);
    assert.match(app, /color:\s*var\(--modal-primary-foreground\)/);
});

test("Clear Mark and Solve record a Penpa undo transaction", function() {
    assert.match(solver, /function applySolution\([^)]*\)[\s\S]*?beginPenpaUndoTransaction\(puzzle,\s*"Solve"\)/);
    assert.match(solver, /function clearAutoSolution\([^)]*\)[\s\S]*?beginPenpaUndoTransaction\(puzzle,\s*"Clear Mark"\)/);
    assert.match(puzzle, /undo\(replay = false\)[\s\S]*?a\[0\]\s*===\s*"sudokuTransaction"/);
    assert.match(puzzle, /redo\(replay = false\)[\s\S]*?a\[0\]\s*===\s*"sudokuTransaction"/);
});

test("hideSidebar URL flag removes the desktop left sidebar", function() {
    assert.match(app, /checkUrlFlag\("hideSidebar"\)/);
    assert.match(app, /class:hide-left-sidebar=\{hideLeftSidebar\}/);
    assert.match(app, /\.studio-shell\.hide-left-sidebar \.studio-grid \.column\.controls\s*\{\s*display:\s*none !important/);
    assert.match(app, /@media \(min-width:\s*769px\)/);
});

test("Midpoint uses one direct clue mode for edges and intersections", function() {
    assert.match(solver, /pu\.sudoku_midpoint_clue_mode\s*=\s*pu\.activeSudokuVariant\s*===\s*"midpoint"/);
    assert.match(main, /pu\.sudoku_midpoint_clue_mode[\s\S]*?pu\.type\s*=\s*\[1,\s*2,\s*3\]/);
    assert.match(square, /this\.sudoku_midpoint_clue_mode[\s\S]*?type\s*=\s*\[1,\s*2,\s*3\]/);
    assert.match(puzzle, /this\.sudoku_midpoint_clue_mode[\s\S]*?return false/);
});

test("native Penpa completion uses CSP validation and Solve Once stays in Solution mode", function() {
    assert.match(puzzle, /check_solution\(\)[\s\S]*?SudokuSolver\.checkCompletion\(this\)/);
    assert.match(solver, /function handleResult\(result\)[\s\S]*?SudokuSolver\.commitSolveOnce\(pu,\s*result\.board\)/);
    assert.doesNotMatch(
        solver.match(/function handleResult\(result\) \{([\s\S]*?)\n        \}/)?.[1] || "",
        /mode_qa\("pu_q"\)/
    );
});

test("Solve Once reports Find Solution and confirms at least one solution", function() {
    assert.equal(solver.includes('"success", "Solve Once"'), false);
    assert.equal(solver.includes('"success", "Find Solution"'), true);
    assert.equal(solver.includes('generatorLog("Solved", "This puzzle has at least one solution.")'), true);
});

test("Dutch Flat Mates is a no-input variant restricted to 9x9", function() {
    const variant = metadata.variants.find((item) => item.id === "dutchflatmates");
    assert.equal(variant.name, "Dutch Flat Mates");
    assert.deepEqual(variant.inputType.categories, ["no-input"]);
    assert.deepEqual(Object.keys(variant.rules), ["9x9"]);
    assert.match(app, /value === "dutchflatmates"[\s\S]*?requires a 9/);
});

test("desktop F2-F4 shortcuts switch Set, Solve, and Misc modes", function() {
    assert.match(app, /function desktopLayerShortcut[\s\S]*?F2:\s*"problem"[\s\S]*?F3:\s*"solution"[\s\S]*?F4:\s*"modes"/);
    assert.match(app, /function desktopLayerShortcut[\s\S]*?isEmbedded[\s\S]*?matchMedia\("\(max-width: 768px\)"\)/);
    assert.match(app, /function desktopLayerShortcut[\s\S]*?preventDefault\(\)[\s\S]*?stopImmediatePropagation\(\)[\s\S]*?chooseLayer\(nextLayer\)/);
    ["F2", "F3", "F4"].forEach(function(key) {
        assert.match(app, new RegExp("<kbd>" + key + "<\\/kbd>"));
    });
});

test("Shift-number selects corner entry while Ctrl-number selects center entry", function() {
    assert.match(app, /function toolPanelNumberShortcut[\s\S]*?shiftKey[\s\S]*?chooseNoteMode\("2"\)/);
    assert.match(app, /function toolPanelNumberShortcut[\s\S]*?ctrlKey[\s\S]*?chooseNoteMode\("3"\)/);
});

test("solver settings control the saved time limit and toast preference", function() {
    assert.match(app, /id="sudoku_solver_settings"[\s\S]*?>Settings<\/button>/);
    assert.match(app, /studioModal === "solver-settings"[\s\S]*?<select[\s\S]*?>60 seconds<[\s\S]*?>120 seconds<[\s\S]*?>None<[\s\S]*?<select[\s\S]*?>On<[\s\S]*?>Off</);
    assert.match(app, /solverTimeLimitStorageKey = "sudotoku-solver-time-limit"/);
    assert.match(app, /solverToastStorageKey = "sudotoku-solver-toast"/);
    assert.match(app, /if \(!message \|\| !solverToastsEnabled\) return/);
    assert.match(solver, /function sudokuSolverTimeLimitMs\(\)[\s\S]*?SudokuSolverPreferences\.timeLimitMs/);
    assert.match(solver, /if \(runLimitMs !== null\)[\s\S]*?setTimeout/);
    assert.match(solver, /if \(solveRunLimitMs !== null\)[\s\S]*?setTimeout/);
});

test("solver controls and status use separate horizontal rows", function() {
    assert.match(app, /#sudoku_solver_settings[\s\S]*?flex-direction:\s*row !important/);
    assert.match(app, /\.studio-shell\.dark \.solver-settings-btn[\s\S]*?background:\s*#263340 !important/);
    assert.match(app, /\.log-host #sudoku-solver-status[\s\S]*?flex:\s*0 0 100% !important/);
    assert.match(app, /\.bottom-actions\s*\{[\s\S]*?grid-template-columns:\s*repeat\(3/);
});

test("solver toolbar moves every button before marking the board ready", function() {
    const mover = app.match(/function moveLegacyNodes\(\) \{([\s\S]*?)\n  \}/)?.[1] || "";
    assert.match(mover, /const solverStatus = document\.getElementById\("sudoku-solver-status"\)/);
    assert.match(mover, /logHeader\.insertBefore\([\s\S]*?autoSolver,[\s\S]*?solverStatus/);
    assert.match(mover, /solveClear[\s\S]*?logHeader\.insertBefore\(solverSettingsButton, solverStatus\)/);
    assert.match(mover, /initialized = true/);
});

test("load and settings use the Svelte modal patterns", function() {
    assert.match(app, /studioModal === "load"[\s\S]*?<h2 id="studio-modal-title">Load Puzzle<\/h2>/);
    assert.match(app, /studioModal === "solver-settings"[\s\S]*?>Save<\/button>/);
    assert.match(app, /studioModal === "settings"[\s\S]*?>Save<\/button>/);
    assert.doesNotMatch(app, /legacyPress\("input_url"\)/);
});

test("mobile action and variant drawers retain their intended state", function() {
    assert.match(app, /\.action-slot[\s\S]*?mobileActiveTab = "none"/);
    assert.match(app, /on:click=\{\(\) => \(studioModal = "solver-settings"\)\}[\s\S]*?Solver settings/);
    assert.match(app, /\.mobile-top-variant-drawer\s*\{[\s\S]*?max-height:\s*min\(78vh, 620px\)/);
    assert.match(app, /mobile-top-variant-drawer[\s\S]*?\.variant-search-control[\s\S]*?position:\s*sticky/);
    assert.match(app, /mobile-top-variant-drawer[\s\S]*?\.variant-tabs[\s\S]*?top:\s*38px/);
});
