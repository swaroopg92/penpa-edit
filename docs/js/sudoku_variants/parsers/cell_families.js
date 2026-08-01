(function(root, factory) {
    var parsers = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = parsers;
    else root.SudokuVariantCellFamilyParsers = parsers;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    function emitCodedPairs(evidence, emit) {
        var groups = Object.create(null);
        evidence.cages().forEach(function(cage) {
            if (cage.cells.length === 2 && cage.label) (groups[cage.label] || (groups[cage.label] = [])).push(cage.cells);
        });
        Object.keys(groups).sort().forEach(function(label) {
            if (groups[label].length > 1) emit("cellRelations", { relation: "codedpairs", pairs: groups[label] });
        });
    }
    function emitClock(evidence, emit) {
        evidence.cages().forEach(function(cage) {
            var cells = cage.cells.slice().sort(function(a, b) { return a.col - b.col; });
            if (cells.length === 4 && cells.every(function(cell) { return cell.row === cells[0].row; }) &&
                cells.every(function(cell, index) { return !index || cell.col === cells[index - 1].col + 1; })) {
                emit("cellRelations", { relation: "clock", cells: cells });
            }
        });
    }
    function emitFortress(evidence, emit) {
        evidence.cells().forEach(function(cell) {
            [[1,0],[0,1]].forEach(function(offset) {
                var next = evidence.cell(cell.row + offset[0], cell.col + offset[1]);
                if (!next) return;
                var first = evidence.isShaded(cell.row, cell.col), second = evidence.isShaded(next.row, next.col);
                if (first === second) return;
                emit("cellRelations", { relation: "fortress", shaded: first ? cell : next, unshaded: first ? next : cell });
            });
        });
    }
    function emitTrio(evidence, emit) {
        var ranges = { circle_L: [1,3], square_L: [4,6], triup_L: [7,9], tri: [7,9] };
        evidence.symbolMarks().forEach(function(mark) {
            var range = mark.entry && ranges[mark.entry[1]];
            if (!mark.cell || !range) return;
            emit("cellRelations", { relation: "trio", cell: mark.cell,
                minimum: range[0], maximum: Math.min(evidence.size, range[1]) });
        });
    }
    function emitSlotMachine(evidence, emit) {
        var columns = [];
        for (var col = 0; col < evidence.size; col++) {
            var cells = [], shaded = true;
            for (var row = 0; row < evidence.size; row++) {
                cells.push(evidence.cell(row, col));
                if (!evidence.isShaded(row, col)) shaded = false;
            }
            if (shaded) columns.push(cells);
        }
        if (columns.length > 1) emit("cellRelations", { relation: "slotmachine", columns: columns });
    }
    function emitPinocchio(evidence, emit) {
        var clues = [];
        evidence.numberMarks().forEach(function(mark) {
            if (!mark.cell || !mark.entry || mark.entry[1] !== 0 || mark.entry[2] !== "1") return;
            var value = parseInt(mark.entry[0], 10);
            if (value) clues.push({ cell: mark.cell, value: value });
        });
        if (clues.length) emit("cellRelations", { relation: "pinnochio", clues: clues });
    }
    function emitAverage(evidence, emit) {
        var marked = Object.create(null);
        evidence.wallSegments().forEach(function(segment) {
            marked[segment.cell.row + ":" + segment.cell.col + ":" + segment.orientation] = true;
        });
        evidence.cells().forEach(function(cell) {
            [["horizontal",[0,-1],[0,1]],["vertical",[-1,0],[1,0]]].forEach(function(data) {
                var first = evidence.cell(cell.row + data[1][0], cell.col + data[1][1]);
                var second = evidence.cell(cell.row + data[2][0], cell.col + data[2][1]);
                if (!first || !second) return;
                emit("cellRelations", { relation: "average", center: cell, ends: [first, second],
                    marked: !!marked[cell.row + ":" + cell.col + ":" + data[0]] });
            });
        });
    }
    function emitClonedStrands(evidence, emit) {
        var strands = evidence.connectedLinePaths(3);
        if (strands.length) emit("cellRelations", { relation: "clonedstrands", strands: strands });
    }
    function emitWheel(evidence, emit) {
        var numbers = Object.create(null);
        evidence.numberMarks().forEach(function(mark) { numbers[mark.key] = mark; });
        evidence.symbolMarks().forEach(function(mark) {
            if (!mark.entry || mark.entry[1] !== "circle_L" || mark.neighbors.length !== 4) return;
            var number = numbers[mark.key];
            var digits = number && String(number.entry[0]).split("").map(Number)
                .filter(function(value) { return value >= 1 && value <= evidence.size; });
            var cells = mark.neighbors.slice().sort(function(a, b) { return a.row - b.row || a.col - b.col; });
            if (digits && digits.length === 4) emit("cellRelations", {
                relation: "wheel", digits: digits, cells: [cells[0], cells[1], cells[3], cells[2]]
            });
        });
    }
    function emitCountingNeighbours(evidence, emit) {
        var kinds = Object.create(null);
        evidence.symbolMarks().forEach(function(mark) {
            if (!mark.cell || !mark.entry) return;
            if (mark.entry[1] === "circle_L" || mark.entry[1] === "cross") {
                kinds[mark.cell.row + ":" + mark.cell.col] = mark.entry[1] === "circle_L" ? "circle" : "cross";
            }
        });
        evidence.cells().forEach(function(cell) {
            var diagonals = [[-1,-1],[-1,1],[1,-1],[1,1]].map(function(offset) {
                return evidence.cell(cell.row + offset[0], cell.col + offset[1]);
            }).filter(Boolean);
            var orthogonals = [[-1,0],[1,0],[0,-1],[0,1]].map(function(offset) {
                return evidence.cell(cell.row + offset[0], cell.col + offset[1]);
            }).filter(Boolean);
            emit("cellRelations", { relation: "countingneighbours", cell: cell,
                kind: kinds[cell.row + ":" + cell.col] || "none", diagonals: diagonals, orthogonals: orthogonals });
        });
    }
    return {
        codedpairs: emitCodedPairs, clock: emitClock, fortress: emitFortress, trio: emitTrio,
        slotmachine: emitSlotMachine, pinocchio: emitPinocchio, average: emitAverage,
        clonedstrands: emitClonedStrands, wheel: emitWheel, countingneighbours: emitCountingNeighbours
    };
});
