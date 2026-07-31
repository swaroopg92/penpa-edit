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
