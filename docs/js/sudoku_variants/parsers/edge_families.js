(function(root, factory) {
    var parsers = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = parsers;
    else root.SudokuVariantEdgeFamilyParsers = parsers;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    function canonical(value) { return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
    function sorted(cells) { return cells.slice().sort(function(a, b) { return a.row - b.row || a.col - b.col; }); }
    function edgeKey(cells, size) {
        var first = cells[0].row * size + cells[0].col, second = cells[1].row * size + cells[1].col;
        return Math.min(first, second) + ":" + Math.max(first, second);
    }
    function owns(mark, variant) {
        return !mark.entry || !mark.entry[3] || canonical(mark.entry[3]) === canonical(variant);
    }
    function negativeRelation(variant) {
        return ({ consecutive: "notConsecutive", perfectsquares: "notPerfectSquare", fives: "notFives",
            sumnine: "notSumnine", teneleven: "notTenEleven", xydifference: "notXydifference",
            primesums: "notPrimesums", twodigitprimenumbers: "notTwodigitprimenumbers" })[variant];
    }
    function symbolAccepted(variant, entry) {
        if (!entry) return false;
        if (variant === "consecutive") return entry[1] === "circle_SS" && entry[0] === 1;
        if (["xydifference", "primesums", "twodigitprimenumbers", "fives", "sumnine"].indexOf(variant) !== -1)
            return ["diamond_L", "diamond_SS", "circle_SS"].indexOf(entry[1]) !== -1;
        if (variant === "perfectsquares") return ["diamond_SS", "circle_SS"].indexOf(entry[1]) !== -1 && entry[0] === 1;
        if (variant === "oneortwodifferencepairs") return entry[1] === "circle_SS";
        if (variant === "teneleven") return entry[1] === "bars_G";
        return true;
    }
    function catalog(variant) {
        return function(evidence, emit) {
            var marked = Object.create(null);
            var numeric = ["difference", "sum", "product", "arithmetic", "greater", "lesser", "inequality",
                "divisor", "multiples", "eitheror", "blocksumrelations", "tenspositionproducts", "ratio", "termination"];
            if (numeric.indexOf(variant) !== -1) {
                evidence.numberMarks().forEach(function(mark) {
                    if (mark.neighbors.length !== 2 || !owns(mark, variant)) return;
                    var target = parseInt(mark.entry && mark.entry[0], 10);
                    var text = String(mark.entry && mark.entry[0] || "").trim();
                    var symbolic = (variant === "inequality" || variant === "blocksumrelations") &&
                        ["<", ">", "^", "v", "V"].indexOf(text) !== -1;
                    if (!Number.isFinite(target) && !symbolic && !(variant === "ratio" && text.indexOf(":") !== -1)) return;
                    var cells = sorted(mark.neighbors), sign = text;
                    if (text === "^") sign = "<";
                    if (text === "v" || text === "V") sign = ">";
                    var clue = { cells: cells, relation: variant, target: target, sign: sign };
                    if (variant === "blocksumrelations") {
                        var dimensions = evidence.boxDimensions();
                        if (cells[0].row === cells[1].row) {
                            var startRow = Math.floor(cells[0].row / dimensions.height) * dimensions.height;
                            clue.groups = [cells[0].col, cells[1].col].map(function(col) {
                                return Array.from({ length: dimensions.height }, function(_, offset) {
                                    return { row: startRow + offset, col: col };
                                });
                            });
                        } else {
                            var startCol = Math.floor(cells[0].col / dimensions.width) * dimensions.width;
                            clue.groups = [cells[0].row, cells[1].row].map(function(row) {
                                return Array.from({ length: dimensions.width }, function(_, offset) {
                                    return { row: row, col: startCol + offset };
                                });
                            });
                        }
                    }
                    emit("edgeRelations", clue);
                });
                return;
            }
            evidence.symbolMarks().forEach(function(mark) {
                if (mark.neighbors.length !== 2 || !owns(mark, variant) || !symbolAccepted(variant, mark.entry)) return;
                var cells = sorted(mark.neighbors);
                marked[edgeKey(cells, evidence.size)] = true;
                emit("edgeRelations", { cells: cells,
                    relation: variant === "evensumpairs" ? "evenSum" : variant === "oddsumpairs" ? "oddSum" : variant,
                    reference: variant === "xydifference" ?
                        (cells[0].row === cells[1].row ? { row: cells[0].row, col: 0 } : { row: 0, col: cells[0].col }) : null
                });
            });
            var addNegative = variant === "sumnine" || variant === "perfectsquares" || variant === "fives" ||
                variant === "teneleven" || variant === "xydifference" || variant === "primesums" ||
                variant === "twodigitprimenumbers" ||
                (variant === "consecutive" && evidence.option("consecutiveNegativeConstraint") === true);
            if (!addNegative) return;
            evidence.pairs([[0,1],[1,0]]).forEach(function(pair) {
                if (marked[edgeKey(pair, evidence.size)]) return;
                var clue = { cells: pair, relation: negativeRelation(variant) };
                if (variant === "xydifference") clue.reference = pair[0].row === pair[1].row ?
                    { row: pair[0].row, col: 0 } : { row: 0, col: pair[0].col };
                emit("edgeRelations", clue);
            });
        };
    }
    function diagonal(variant) {
        return function(evidence, emit) {
            var marked = Object.create(null);
            evidence.symbolMarks().forEach(function(mark) {
                if (mark.neighbors.length !== 4 || !mark.entry || mark.entry[1] !== "diagonal_consecutive" ||
                    !Array.isArray(mark.entry[0]) || !owns(mark, variant)) return;
                var cells = sorted(mark.neighbors), row = cells[0].row, col = cells[0].col;
                if (mark.entry[0][0] === 1) marked[row + ":" + col + ":left"] = true;
                if (mark.entry[0][1] === 1) marked[row + ":" + col + ":right"] = true;
            });
            var names = {
                diagonallyconsecutive: ["diagonalConsecutive", "notDiagonalConsecutive"],
                diagonalsumisnine: ["diagonalSumIsNine", "notDiagonalSumIsNine"],
                diagonaltens: ["diagonalTens", "notDiagonalTens"]
            }[variant];
            for (var row = 0; row < evidence.size - 1; row++) for (var col = 0; col < evidence.size - 1; col++) {
                [["left", [evidence.cell(row,col), evidence.cell(row+1,col+1)]],
                    ["right", [evidence.cell(row,col+1), evidence.cell(row+1,col)]]].forEach(function(pair) {
                    emit("edgeRelations", { cells: pair[1],
                        relation: marked[row + ":" + col + ":" + pair[0]] ? names[0] : names[1] });
                });
            }
        };
    }
    return { catalog: catalog, diagonal: diagonal };
});
