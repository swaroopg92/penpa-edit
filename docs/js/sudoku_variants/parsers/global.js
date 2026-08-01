(function(root, factory) {
    var parsers = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = parsers;
    else root.SudokuVariantGlobalParsers = parsers;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";

    function diagonal(evidence, reverse) {
        return Array.from({ length: evidence.size }, function(_, index) {
            return evidence.cell(index, reverse ? evidence.size - 1 - index : index);
        });
    }
    function emitPairs(type, offsets) {
        return function(evidence, emit) {
            evidence.pairs(offsets).forEach(function(pair) { emit(type, pair); });
        };
    }
    function marker(type) { return function(_, emit) { emit(type, true); }; }
    function neighbours(evidence, cell, offsets) {
        return offsets.map(function(offset) {
            return evidence.cell(cell.row + offset[0], cell.col + offset[1]);
        }).filter(Boolean);
    }

    return {
        diagonal: function(evidence, emit) {
            emit("diagonalAllDifferent", diagonal(evidence, false));
            emit("diagonalAllDifferent", diagonal(evidence, true));
        },
        antiDiagonal: function(evidence, emit) {
            emit("antiDiagonals", diagonal(evidence, false));
            emit("antiDiagonals", diagonal(evidence, true));
        },
        argyle: function(_, emit) {
            [
                [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
                [[0,4],[1,5],[2,6],[3,7],[4,8]], [[0,4],[1,3],[2,2],[3,1],[4,0]],
                [[0,7],[1,6],[2,5],[3,4],[4,3],[5,2],[6,1],[7,0]],
                [[1,0],[2,1],[3,2],[4,3],[5,4],[6,5],[7,6],[8,7]],
                [[1,8],[2,7],[3,6],[4,5],[5,4],[6,3],[7,2],[8,1]],
                [[4,0],[5,1],[6,2],[7,3],[8,4]], [[4,8],[5,7],[6,6],[7,5],[8,4]]
            ].forEach(function(path) {
                emit("diagonalAllDifferent", path.map(function(position) {
                    return { row: position[0], col: position[1] };
                }));
            });
        },
        antiKing: emitPairs("antiKing", [[0,1],[1,-1],[1,0],[1,1]]),
        sequenceTopBottom: marker("sequenceTopBottom"),
        polePosition: marker("polePosition"),
        citywalk: marker("citywalk"),
        antiKnight: emitPairs("antiKnight", [[1,-2],[1,2],[2,-1],[2,1]]),
        chessKings: function(evidence, emit) {
            emit("chessKings", { pairs: evidence.pairs([[0,1],[1,-1],[1,0],[1,1]]) });
        },
        knightmare: emitPairs("knightmare", [[1,-2],[1,2],[2,-1],[2,1]]),
        nonConsecutive: emitPairs("nonConsecutive", [[0,1],[1,0]]),
        symmetricUnequal: function(evidence, emit) {
            evidence.cells().forEach(function(cell) {
                var opposite = evidence.cell(evidence.size - 1 - cell.row, evidence.size - 1 - cell.col);
                if (cell.row * evidence.size + cell.col < opposite.row * evidence.size + opposite.col) {
                    emit("symmetricUnequal", [cell, opposite]);
                }
            });
        },
        oddLabyrinth: marker("oddLabyrinth"), evenPassage: marker("evenPassage"),
        divisibleByThree: marker("divisiblebythree"), oddTapa: marker("oddtapa"),
        ticTacToe: marker("tictactoe"),
        mirror: function(evidence, emit) {
            var dimensions = evidence.boxDimensions();
            for (var row = 0; row < dimensions.height; row++) {
                for (var col = 0; col < dimensions.width; col++) {
                    emit("cloneGroups", [evidence.cell(row, col), evidence.cell(evidence.size - 1 - row, evidence.size - 1 - col)]);
                    emit("cloneGroups", [evidence.cell(row, evidence.size - 1 - col), evidence.cell(evidence.size - 1 - row, col)]);
                }
            }
        },
        diagonalNonConsecutive: emitPairs("diagonalNonConsecutive", [[1,-1],[1,1]]),
        noEvenNeighbours: emitPairs("noEvenNeighbours", [[0,1],[1,0]]),
        noThreeInRow: function(evidence, emit) {
            for (var index = 0; index < evidence.size; index++) {
                for (var offset = 0; offset <= evidence.size - 3; offset++) {
                    emit("noThreeInRow", [evidence.cell(index, offset), evidence.cell(index, offset + 1), evidence.cell(index, offset + 2)]);
                    emit("noThreeInRow", [evidence.cell(offset, index), evidence.cell(offset + 1, index), evidence.cell(offset + 2, index)]);
                }
            }
        },
        queen: function(evidence, emit) {
            evidence.cells().forEach(function(cell) {
                [[1,-1],[1,1]].forEach(function(offset) {
                    var row = cell.row + offset[0], col = cell.col + offset[1], target;
                    while ((target = evidence.cell(row, col))) {
                        emit("queenDigits", [cell, target]); row += offset[0]; col += offset[1];
                    }
                });
            });
        },
        pirate: emitPairs("pirateCells", [[-1,0],[1,0],[0,-1],[0,1]]),
        touchy: function(evidence, emit) {
            evidence.cells().forEach(function(cell) {
                emit("touchyCells", { cell: cell, neighbors: neighbours(evidence, cell, [[-1,0],[1,0],[0,-1],[0,1]]) });
            });
        },
        unicorn: function(evidence, emit) {
            var offsets = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
            evidence.cells().forEach(function(cell) {
                emit("unicorn", { cell: cell, neighbors: neighbours(evidence, cell, offsets) });
            });
        },
        disjoint: function(evidence, emit) {
            var dimensions = evidence.boxDimensions();
            for (var row = 0; row < dimensions.height; row++) for (var col = 0; col < dimensions.width; col++) {
                var group = [];
                for (var boxRow = 0; boxRow < evidence.size / dimensions.height; boxRow++) {
                    for (var boxCol = 0; boxCol < evidence.size / dimensions.width; boxCol++) {
                        group.push(evidence.cell(boxRow * dimensions.height + row, boxCol * dimensions.width + col));
                    }
                }
                emit("diagonalAllDifferent", group);
            }
        },
        windoku: function(evidence, emit) {
            [[1,1],[1,5],[5,1],[5,5]].forEach(function(start) {
                var group = [];
                for (var row = 0; row < 3; row++) for (var col = 0; col < 3; col++) {
                    group.push(evidence.cell(start[0] + row, start[1] + col));
                }
                emit("regionAllDifferent", group);
            });
        }
    };
});
