(function(root, factory) {
    var families = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = families;
    else root.SudokuConstraintFamilySources = families;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";

    function isCell(value) {
        return !!value && Number.isInteger(value.row) && Number.isInteger(value.col) &&
            value.row >= 0 && value.col >= 0;
    }

    function cells(value) {
        return Array.isArray(value) && value.length > 0 && value.every(isCell);
    }

    function cellPair(value) {
        return Array.isArray(value) && value.length === 2 && value.every(isCell);
    }

    function cellPairs(value) {
        return Array.isArray(value) && value.every(cellPair);
    }

    function booleanMarker(value) {
        return value === true;
    }

    var pairTypes = ["antiKing", "antiKnight", "knightmare", "nonConsecutive",
        "diagonalNonConsecutive", "noEvenNeighbours", "queenDigits", "pirateCells",
        "symmetricUnequal", "cloneGroups"];
    var groupTypes = ["diagonalAllDifferent", "antiDiagonals", "noThreeInRow",
        "regionAllDifferent"];
    var markerTypes = ["sequenceTopBottom", "polePosition", "citywalk", "oddLabyrinth",
        "evenPassage", "divisiblebythree", "oddtapa", "tictactoe"];

    return [
        {
            type: "dutchFlatMates",
            version: 1,
            validatePayload: function(payload) {
                return !!payload && isCell(payload.cell) &&
                    (payload.above === null || isCell(payload.above)) &&
                    (payload.below === null || isCell(payload.below));
            }
        },
        {
            type: "killers",
            version: 1,
            validatePayload: function(payload) {
                return !!payload && cells(payload.cells) &&
                    Number.isInteger(payload.total) && payload.total >= 0;
            }
        },
        {
            type: "cellRelations",
            version: 1,
            validatePayload: function(payload) {
                return !!payload && typeof payload.relation === "string" &&
                    (payload.relation !== "multiplication" ||
                        (cells(payload.top) && cells(payload.bottom)));
            }
        },
        {
            type: "outsideRelations",
            version: 1,
            validatePayload: function(payload) {
                return !!payload && typeof payload.relation === "string" &&
                    cells(payload.cells) && (payload.axis === "row" || payload.axis === "column");
            }
        }
    ].concat(pairTypes.map(function(type) {
        return { type: type, version: 1, validatePayload: cellPair };
    }), groupTypes.map(function(type) {
        return { type: type, version: 1, validatePayload: cells };
    }), markerTypes.map(function(type) {
        return { type: type, version: 1, validatePayload: booleanMarker };
    }), [
        {
            type: "chessKings", version: 1,
            validatePayload: function(payload) { return !!payload && cellPairs(payload.pairs); }
        },
        {
            type: "touchyCells", version: 1,
            validatePayload: function(payload) { return !!payload && isCell(payload.cell) && cells(payload.neighbors); }
        },
        {
            type: "unicorn", version: 1,
            validatePayload: function(payload) { return !!payload && isCell(payload.cell) && cells(payload.neighbors); }
        },
        {
            type: "codedGroups", version: 1,
            validatePayload: function(payload) {
                return !!payload && Array.isArray(payload.groups) && payload.groups.every(cells);
            }
        },
        {
            type: "pencilmarkCells", version: 1,
            validatePayload: function(payload) {
                return !!payload && isCell(payload.cell) && Array.isArray(payload.allowed) &&
                    payload.allowed.length > 0 && payload.allowed.every(Number.isInteger);
            }
        },
        {
            type: "tictactoewinner", version: 1,
            validatePayload: function(payload) {
                return Array.isArray(payload) && payload.length === 9 && payload.every(function(box) {
                    return Array.isArray(box) && box.length === 1 && cells(box[0]);
                });
            }
        },
        {
            type: "xv", version: 1,
            validatePayload: function(payload) {
                return !!payload && cellPair(payload.cells) && typeof payload.kind === "string";
            }
        },
        {
            type: "kropki", version: 1,
            validatePayload: function(payload) {
                return !!payload && cellPair(payload.cells) && typeof payload.kind === "string";
            }
        },
        {
            type: "edgeRelations", version: 1,
            validatePayload: function(payload) {
                return !!payload && cellPair(payload.cells) && typeof payload.relation === "string";
            }
        },
        {
            type: "quadRelations", version: 1,
            validatePayload: function(payload) {
                return !!payload && cells(payload.cells) && payload.cells.length === 4 &&
                    typeof payload.relation === "string";
            }
        },
        {
            type: "directionalMarks", version: 1,
            validatePayload: function(payload) {
                return !!payload && typeof payload.relation === "string" &&
                    ((isCell(payload.origin) && cells(payload.targets)) ||
                        (isCell(payload.target) && cells(payload.cells) && payload.cells.length === 4));
            }
        },
        {
            type: "sumDetectorGroups", version: 1,
            validatePayload: function(payload) {
                return !!payload && Array.isArray(payload.clues) && payload.clues.length > 0 &&
                    payload.clues.every(function(clue) {
                        return clue && clue.relation === "sumdetector" && isCell(clue.origin) && cells(clue.targets);
                    });
            }
        }
    ]);
});
