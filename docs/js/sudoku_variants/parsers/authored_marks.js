(function(root, factory) {
    var parsers = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = parsers;
    else root.SudokuVariantAuthoredMarkParsers = parsers;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    return {
        coded: function(evidence, emit) {
            var groups = Object.create(null);
            evidence.cells().forEach(function(cell) {
                var label = evidence.cornerLabel(cell.row, cell.col);
                if (!label) return;
                var code = label.toUpperCase();
                (groups[code] || (groups[code] = [])).push(cell);
            });
            emit("codedGroups", { groups: Object.keys(groups).sort().map(function(code) { return groups[code]; }) });
        },
        pencilmarks: function(evidence, emit) {
            evidence.cells().forEach(function(cell) {
                var entry = evidence.cellEntry(cell.row, cell.col);
                if (!entry || entry[2] !== "7" || !Array.isArray(entry[0])) return;
                var allowed = entry[0].map(function(enabled, index) { return enabled === 1 ? index + 1 : 0; }).filter(Boolean);
                if (allowed.length) emit("pencilmarkCells", { cell: cell, allowed: allowed });
            });
        },
        ticTacToeWinner: function(evidence, emit, diagnostic) {
            var boxLines = Array.from({ length: 9 }, function() { return []; });
            evidence.connectedLinePaths(5).forEach(function(path) {
                var first = path[0];
                var box = Math.floor(first.row / 3) * 3 + Math.floor(first.col / 3);
                if (box >= 0 && box < 9) boxLines[box].push(path);
            });
            for (var index = 0; index < 9; index++) {
                if (boxLines[index].length !== 1) {
                    diagnostic({ code: "invalid-authored-evidence",
                        message: "Tic-Tac-Toe Winner requires exactly one gray line per 3x3 box." });
                    return;
                }
            }
            emit("tictactoewinner", boxLines);
        }
    };
});
