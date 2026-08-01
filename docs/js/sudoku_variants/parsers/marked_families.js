(function(root, factory) {
    var parsers = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = parsers;
    else root.SudokuVariantMarkedFamilyParsers = parsers;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    function edgeKey(cells, size) {
        var first = cells[0].row * size + cells[0].col;
        var second = cells[1].row * size + cells[1].col;
        return Math.min(first, second) + ":" + Math.max(first, second);
    }
    function orthogonalPairs(evidence) { return evidence.pairs([[0,1],[1,0]]); }
    function arrowDirections(entry) {
        if (!entry) return [];
        if (Array.isArray(entry[0])) return entry[0].map(function(enabled, index) {
            return enabled === 1 ? index : -1;
        }).filter(function(index) { return index >= 0; });
        var direction = parseInt(entry[0], 10) - 1;
        return direction >= 0 && direction < 8 ? [direction] : [];
    }
    function canonical(value) {
        return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }
    function sortedCells(value) {
        return value.slice().sort(function(a, b) { return a.row - b.row || a.col - b.col; });
    }
    function quadSignature(cells) {
        return sortedCells(cells).map(function(cell) { return cell.row + ":" + cell.col; }).join("|");
    }
    function ownsMark(mark, variant) {
        return !mark.entry || !mark.entry[3] || canonical(mark.entry[3]) === canonical(variant);
    }
    function quadParser(variant) {
        return function(evidence, emit) {
            var marked = Object.create(null);
            var numberVariants = ["exclusion", "groupsum", "determinant", "mathrax"];
            if (numberVariants.indexOf(variant) !== -1) {
                evidence.numberMarks().forEach(function(mark) {
                    if (mark.neighbors.length !== 4 || !ownsMark(mark, variant)) return;
                    var cells = sortedCells(mark.neighbors);
                    var text = String(mark.entry && mark.entry[0] || "").trim();
                    if (variant === "mathrax") {
                        emit("quadRelations", { cells: cells, relation: variant, text: text });
                        return;
                    }
                    var digits = text.split("").map(Number).filter(function(value) {
                        return value >= 1 && value <= evidence.size;
                    });
                    var total = parseInt(text, 10);
                    if ((variant === "groupsum" || variant === "determinant") && Number.isFinite(total)) {
                        emit("quadRelations", { cells: cells, relation: variant, total: total });
                    } else if (digits.length) {
                        emit("quadRelations", { cells: cells, relation: variant, digits: digits });
                    }
                });
                return;
            }
            if (variant === "quadro") {
                for (var row = 0; row < evidence.size - 1; row++) {
                    for (var col = 0; col < evidence.size - 1; col++) {
                        emit("quadRelations", { relation: "quadro", cells: [
                            evidence.cell(row, col), evidence.cell(row, col + 1),
                            evidence.cell(row + 1, col), evidence.cell(row + 1, col + 1)
                        ] });
                    }
                }
                return;
            }
            evidence.symbolMarks().forEach(function(mark) {
                if (mark.neighbors.length !== 4 || !ownsMark(mark, variant)) return;
                var symbol = mark.entry && mark.entry[1];
                if (variant === "crosssums" && symbol !== "cross") return;
                if (variant === "clockfaces" && symbol !== "circle_SS") return;
                if (variant === "fullorhalf" && ["circle_SS", "square_SS"].indexOf(symbol) === -1) return;
                var cells = sortedCells(mark.neighbors);
                marked[quadSignature(cells)] = true;
                emit("quadRelations", {
                    cells: cells, relation: variant,
                    kind: variant === "fullorhalf" ? (symbol === "circle_SS" ? "circle" : "square") :
                        (mark.entry && mark.entry[0] === 2 ? "black" : "white")
                });
            });
            if (variant === "clockfaces") {
                for (var clockRow = 0; clockRow < evidence.size - 1; clockRow++) {
                    for (var clockCol = 0; clockCol < evidence.size - 1; clockCol++) {
                        var clockCells = [evidence.cell(clockRow, clockCol), evidence.cell(clockRow, clockCol + 1),
                            evidence.cell(clockRow + 1, clockCol), evidence.cell(clockRow + 1, clockCol + 1)];
                        if (!marked[quadSignature(clockCells)]) emit("quadRelations", {
                            cells: clockCells, relation: "clockfaces", kind: "none"
                        });
                    }
                }
            }
        };
    }
    var directionOffsets = [[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]];
    var directionalOrder = ["biggestneighbours", "smallestneighbours", "eliminate", "pointtonext",
        "pointtoprevious", "quadmax", "quadmin", "search9", "sumdetector", "detection",
        "deadoralivearrows", "twindetector"];
    function expectedSymbols(variant) {
        if (["biggestneighbours", "smallestneighbours", "sumdetector", "detection", "twindetector"].indexOf(variant) !== -1) return ["arrow_eight"];
        if (variant === "quadmax" || variant === "quadmin") return ["arrow_B_B"];
        if (variant === "deadoralivearrows") return ["arrow_B_W", "arrow_B_G"];
        return ["arrow_B_G"];
    }
    function ray(evidence, origin, direction) {
        var result = [], offset = directionOffsets[direction];
        for (var distance = 1; distance < evidence.size; distance++) {
            var cell = evidence.cell(origin.row + offset[0] * distance, origin.col + offset[1] * distance);
            if (!cell) break;
            result.push(cell);
        }
        return result;
    }
    function directionalOwner(evidence, mark, variant) {
        if (mark.entry && mark.entry[3]) return canonical(mark.entry[3]) === canonical(variant);
        var requested = evidence.option("activeSudokuVariants") || [evidence.option("activeSudokuVariant")];
        var sameSymbol = directionalOrder.filter(function(id) {
            return requested.some(function(name) { return canonical(name) === id; }) &&
                expectedSymbols(id).indexOf(mark.entry[1]) !== -1;
        });
        var current = canonical(evidence.option("activeSudokuVariant"));
        return (sameSymbol.indexOf(current) !== -1 ? current : sameSymbol[0]) === variant;
    }
    function directionalParser(variant) {
        return function(evidence, emit) {
            var clues = [];
            evidence.symbolMarks().forEach(function(mark) {
                if (!mark.entry || expectedSymbols(variant).indexOf(mark.entry[1]) === -1 ||
                    !directionalOwner(evidence, mark, variant)) return;
                var directions = arrowDirections(mark.entry);
                if (!directions.length) return;
                if ((variant === "quadmax" || variant === "quadmin") && mark.neighbors.length === 4) {
                    var cornerCells = sortedCells(mark.neighbors);
                    var minRow = cornerCells[0].row;
                    var minCol = Math.min.apply(null, cornerCells.map(function(cell) { return cell.col; }));
                    var targetOffsets = { 1: [0,0], 3: [0,1], 5: [1,1], 7: [1,0] };
                    directions.forEach(function(direction) {
                        var targetOffset = targetOffsets[direction];
                        if (!targetOffset) return;
                        var target = cornerCells.find(function(cell) {
                            return cell.row === minRow + targetOffset[0] && cell.col === minCol + targetOffset[1];
                        });
                        if (target) emit("directionalMarks", { relation: variant, target: target, cells: cornerCells });
                    });
                    return;
                }
                if (!mark.cell) return;
                var rays = directions.map(function(direction) { return ray(evidence, mark.cell, direction); })
                    .filter(function(value) { return value.length; });
                var sightline = ["eliminate", "detection", "deadoralivearrows", "twindetector",
                    "pointtonext", "pointtoprevious"].indexOf(variant) !== -1;
                var targets = sightline ? [].concat.apply([], rays) : rays.map(function(value) { return value[0]; });
                if (!targets.length) return;
                var clue = { relation: variant, origin: mark.cell, targets: targets,
                    isWhite: mark.entry[1] === "arrow_B_W" };
                if (variant === "biggestneighbours" || variant === "smallestneighbours") {
                    clue.neighbors = directionOffsets.map(function(offset) {
                        return evidence.cell(mark.cell.row + offset[0], mark.cell.col + offset[1]);
                    }).filter(Boolean);
                } else if (variant === "search9") {
                    clue.searchDigit = evidence.size; clue.rays = rays;
                } else if (variant === "sumdetector") {
                    clue.rays = rays;
                } else if (variant === "twindetector") {
                    clue.rays = rays; clue.allRays = directionOffsets.map(function(_, direction) {
                        return ray(evidence, mark.cell, direction);
                    });
                } else if (variant === "detection") {
                    clue.rays = rays; clue.allDiagonalRays = [1,3,5,7].map(function(direction) {
                        return ray(evidence, mark.cell, direction);
                    });
                }
                clues.push(clue);
            });
            if (variant === "sumdetector") {
                if (clues.length) emit("sumDetectorGroups", { clues: clues });
            } else clues.forEach(function(clue) { emit("directionalMarks", clue); });
        };
    }
    return {
        xv: function(evidence, emit) {
            var marked = Object.create(null);
            evidence.numberMarks().forEach(function(mark) {
                var kind = mark.entry && String(mark.entry[0]).trim().toUpperCase();
                if (mark.neighbors.length !== 2 || (kind !== "V" && kind !== "X")) return;
                marked[edgeKey(mark.neighbors, evidence.size)] = true;
                emit("xv", { cells: mark.neighbors, kind: kind, family: "xv" });
            });
            if (evidence.option("xvNegativeConstraint") === true) {
                orthogonalPairs(evidence).forEach(function(pair) {
                    if (!marked[edgeKey(pair, evidence.size)]) emit("xv", { cells: pair, kind: "none" });
                });
            }
        },
        quadruple: function(evidence, emit) {
            evidence.numberMarks().forEach(function(mark) {
                if (mark.neighbors.length !== 4) return;
                var digits = String(mark.entry && mark.entry[0] || "").split("").map(Number)
                    .filter(function(value) { return value >= 1 && value <= evidence.size; });
                if (digits.length) emit("quadRelations", {
                    cells: mark.neighbors.slice().sort(function(a, b) { return a.row - b.row || a.col - b.col; }),
                    relation: "quadruple", digits: digits
                });
            });
        },
        pointToNext: directionalParser("pointtonext"),
        quad: quadParser,
        directional: directionalParser
    };
});
