/* Uniqueness-preserving Sudoku puzzle generation built on the shared CSP. */
var SudokuGenerator = (function() {
    var CSP = typeof SudokuCSP !== "undefined" ? SudokuCSP :
        (typeof require === "function" ? require("./sudoku_csp.js") : null);

    function seededRandom(seed) {
        var state = (Number(seed) || Date.now()) >>> 0;
        return function() {
            state = (state + 0x6D2B79F5) >>> 0;
            var value = state;
            value = Math.imul(value ^ (value >>> 15), value | 1);
            value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
            return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
        };
    }

    function shuffle(values, random) {
        var copy = values.slice();
        for (var index = copy.length - 1; index > 0; index--) {
            var other = Math.floor(random() * (index + 1));
            var temporary = copy[index];
            copy[index] = copy[other];
            copy[other] = temporary;
        }
        return copy;
    }

    function emptyBoard(size) {
        return Array.from({ length: size }, function() { return Array(size).fill(0); });
    }

    function classicSolution(size, random) {
        var boxHeight = size === 6 ? 2 : 3;
        var boxWidth = size / boxHeight;
        var bands = shuffle(Array.from({ length: size / boxHeight }, function(_, value) { return value; }), random);
        var stacks = shuffle(Array.from({ length: size / boxWidth }, function(_, value) { return value; }), random);
        var rows = [];
        var cols = [];
        bands.forEach(function(band) {
            shuffle(Array.from({ length: boxHeight }, function(_, value) { return value; }), random)
                .forEach(function(row) { rows.push(band * boxHeight + row); });
        });
        stacks.forEach(function(stack) {
            shuffle(Array.from({ length: boxWidth }, function(_, value) { return value; }), random)
                .forEach(function(col) { cols.push(stack * boxWidth + col); });
        });
        var digits = shuffle(Array.from({ length: size }, function(_, value) { return value + 1; }), random);
        return rows.map(function(row) {
            return cols.map(function(col) {
                return digits[(row * boxWidth + Math.floor(row / boxHeight) + col) % size];
            });
        });
    }

    function diagonals(size) {
        return [
            Array.from({ length: size }, function(_, index) { return { row: index, col: index }; }),
            Array.from({ length: size }, function(_, index) { return { row: index, col: size - index - 1 }; })
        ];
    }

    function cellKey(cell) {
        return cell.row + ":" + cell.col;
    }

    function pairKey(cells) {
        return cells.map(cellKey).sort().join("|");
    }

    function rotateCell(cell, size) {
        return { row: size - 1 - cell.row, col: size - 1 - cell.col };
    }

    function mirrorCellH(cell, size) {
        return { row: cell.row, col: size - 1 - cell.col };
    }

    function mirrorCellV(cell, size) {
        return { row: size - 1 - cell.row, col: cell.col };
    }

    function rotateCells(cells, size) {
        return cells.map(function(cell) { return rotateCell(cell, size); });
    }

    function globalConstraints(size, variants) {
        var constraints = {};
        if (variants.indexOf("diagonal") !== -1) constraints.diagonalAllDifferent = diagonals(size);
        if (variants.indexOf("anti diagonal") !== -1) constraints.antiDiagonals = diagonals(size);
        if (variants.indexOf("windoku") !== -1) {
            constraints.regionAllDifferent = [[1, 1], [1, 5], [5, 1], [5, 5]].map(function(start) {
                var region = [];
                for (var row = 0; row < 3; row++) {
                    for (var col = 0; col < 3; col++) region.push({ row: start[0] + row, col: start[1] + col });
                }
                return region;
            });
        }
        function addPairs(name, offsets) {
            if (variants.indexOf(name.replace(/([A-Z])/g, " $1").toLowerCase()) === -1) return;
            constraints[name] = [];
            for (var row = 0; row < size; row++) {
                for (var col = 0; col < size; col++) {
                    offsets.forEach(function(offset) {
                        var other = { row: row + offset[0], col: col + offset[1] };
                        if (other.row >= 0 && other.row < size && other.col >= 0 && other.col < size) {
                            constraints[name].push([{ row: row, col: col }, other]);
                        }
                    });
                }
            }
        }
        addPairs("antiKing", [[1, -1], [1, 1]]);
        addPairs("antiKnight", [[1, -2], [1, 2], [2, -1], [2, 1]]);
        addPairs("nonConsecutive", [[1, 0], [0, 1]]);
        return constraints;
    }

    function makeSolution(size, variants, constraints, random) {
        var windokuOnly = variants.every(function(variant) {
            return variant === "classic" || variant === "windoku";
        }) && variants.indexOf("windoku") !== -1;
        if (windokuOnly && constraints.regionAllDifferent) {
            for (var windokuAttempt = 0; windokuAttempt < 2000; windokuAttempt++) {
                var windokuBase = classicSolution(size, random);
                var validWindoku = constraints.regionAllDifferent.every(function(region) {
                    var digits = region.map(function(cell) { return windokuBase[cell.row][cell.col]; });
                    return new Set(digits).size === region.length;
                });
                if (validWindoku) return windokuBase;
            }
        }
        var needsSearch = variants.some(function(variant) {
            return ["diagonal", "anti diagonal", "anti king", "anti knight", "non consecutive", "windoku"].indexOf(variant) !== -1;
        });
        var base;
        if (!needsSearch) {
            for (var classicAttempt = 0; classicAttempt < 200; classicAttempt++) {
                base = classicSolution(size, random);
                if (solutionSupportsGeneratedMarks(base, variants)) return base;
            }
        } else {
            var solved = CSP.solve(emptyBoard(size), constraints);
            if (!solved.solved) throw new Error("The selected global variants do not admit a generated solution.");
            base = solved.board;
            if (variants.indexOf("non consecutive") !== -1 && solutionSupportsGeneratedMarks(base, variants)) {
                return base;
            }
            for (var mapAttempt = 0; mapAttempt < 200; mapAttempt++) {
                var digitMap = shuffle(Array.from({ length: size }, function(_, value) { return value + 1; }), random);
                var remapped = base.map(function(row) {
                    return row.map(function(value) { return digitMap[value - 1]; });
                });
                if (solutionSupportsGeneratedMarks(remapped, variants)) return remapped;
            }
        }
        throw new Error("Could not construct a rotationally paired mark for every selected variant.");
    }

    function oddEvenMarks(solution, random) {
        var size = solution.length;
        var count = size === 6 ? 8 : 14;
        var cells = shuffle(Array.from({ length: size * size }, function(_, index) {
            return { row: Math.floor(index / size), col: index % size };
        }), random).slice(0, count);
        return cells.map(function(cell) {
            return {
                cell: cell,
                parity: solution[cell.row][cell.col] % 2 ? "odd" : "even"
            };
        });
    }

    function edgeKind(solution, cells, variant) {
        var first = solution[cells[0].row][cells[0].col];
        var second = solution[cells[1].row][cells[1].col];
        if (variant === "kropki") {
            if (first === 2 * second || second === 2 * first) return "black";
            if (Math.abs(first - second) === 1) return "white";
        } else if (variant === "xv") {
            if (first + second === 5) return "V";
            if (first + second === 10) return "X";
        }
        return null;
    }

    function symmetricEdges(solution, variant, random) {
        var size = solution.length;
        var edges = {};
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                [[1, 0], [0, 1]].forEach(function(offset) {
                    if (row + offset[0] >= size || col + offset[1] >= size) return;
                    var cells = [{ row: row, col: col }, { row: row + offset[0], col: col + offset[1] }];
                    edges[pairKey(cells)] = cells;
                });
            }
        }
        var marks = [];
        var fallback = null;
        var visited = {};
        Object.keys(edges).forEach(function(key) {
            if (visited[key]) return;
            var cells = edges[key];
            var rotated = rotateCells(cells, size);
            var rotatedKey = pairKey(rotated);
            visited[key] = visited[rotatedKey] = true;
            var firstKind = edgeKind(solution, cells, variant);
            var secondKind = edgeKind(solution, rotated, variant);
            if (!firstKind || !secondKind) return;
            var pair = [{ cells: cells, kind: firstKind }];
            if (rotatedKey !== key) pair.push({ cells: rotated, kind: secondKind });
            if (!fallback) fallback = pair;
            if (random() <= 0.42) marks.push.apply(marks, pair);
        });
        if (!marks.length && fallback) marks.push.apply(marks, fallback);
        return marks;
    }

    function symmetricOddEvenMarks(solution, random) {
        var size = solution.length;
        var marks = [];
        var fallback = null;
        var visited = {};
        for (var row = 0; row < size; row++) {
            for (var col = 0; col < size; col++) {
                var cell = { row: row, col: col };
                var rotated = rotateCell(cell, size);
                var key = cellKey(cell);
                if (visited[key]) continue;
                visited[key] = visited[cellKey(rotated)] = true;
                var pair = [{ cell: cell, parity: solution[row][col] % 2 ? "odd" : "even" }];
                if (cellKey(rotated) !== key) {
                    pair.push({ cell: rotated, parity: solution[rotated.row][rotated.col] % 2 ? "odd" : "even" });
                }
                if (!fallback) fallback = pair;
                if (random() <= 0.22) marks.push.apply(marks, pair);
            }
        }
        if (!marks.length && fallback) marks.push.apply(marks, fallback);
        return marks;
    }

    function checkerboard(solution, cells) {
        var parity = cells.map(function(cell) { return solution[cell.row][cell.col] % 2; });
        return parity[0] !== parity[1] && parity[0] !== parity[2] &&
            parity[0] === parity[3] && parity[1] === parity[2];
    }

    function symmetricBattenburg(solution, random) {
        var size = solution.length;
        var marks = [];
        var fallback = null;
        var visited = {};
        for (var row = 0; row < size - 1; row++) {
            for (var col = 0; col < size - 1; col++) {
                var cells = [{ row: row, col: col }, { row: row, col: col + 1 },
                    { row: row + 1, col: col }, { row: row + 1, col: col + 1 }];
                var key = pairKey(cells);
                if (visited[key]) continue;
                var rotated = rotateCells(cells, size);
                var rotatedKey = pairKey(rotated);
                visited[key] = visited[rotatedKey] = true;
                if (!checkerboard(solution, cells) || !checkerboard(solution, rotated)) continue;
                var pair = [{ cells: cells, kind: "marked" }];
                if (rotatedKey !== key) pair.push({ cells: rotated, kind: "marked" });
                if (!fallback) fallback = pair;
                if (random() <= 0.55) marks.push.apply(marks, pair);
            }
        }
        if (!marks.length && fallback) marks.push.apply(marks, fallback);
        return marks;
    }

    function solutionSupportsGeneratedMarks(solution, variants) {
        var always = function() { return 0; };
        return (variants.indexOf("kropki") === -1 || symmetricEdges(solution, "kropki", always).length > 0) &&
            (variants.indexOf("xv") === -1 || symmetricEdges(solution, "xv", always).length > 0) &&
            (variants.indexOf("battenburg") === -1 || symmetricBattenburg(solution, always).length > 0);
    }

    function addGeneratedMarks(constraints, solution, variants, random) {
        var marks = { oddEven: [], kropki: [], xv: [], battenburg: [] };
        if (variants.indexOf("odd even") !== -1) marks.oddEven = symmetricOddEvenMarks(solution, random);
        if (variants.indexOf("kropki") !== -1) marks.kropki = symmetricEdges(solution, "kropki", random);
        if (variants.indexOf("xv") !== -1) marks.xv = symmetricEdges(solution, "xv", random);
        if (variants.indexOf("battenburg") !== -1) marks.battenburg = symmetricBattenburg(solution, random);
        Object.keys(marks).forEach(function(name) {
            var combined = (constraints[name] || []).concat(marks[name]);
            var seen = {};
            marks[name] = combined.filter(function(mark) {
                var key = JSON.stringify(mark);
                if (seen[key]) return false;
                seen[key] = true;
                return true;
            });
            if (marks[name].length) constraints[name] = marks[name];
        });
        return marks;
    }

    function markCells(mark) {
        return mark.cells || [mark.cell];
    }

    function symmetricMarkUnits(marks, size) {
        var byKey = {};
        marks.forEach(function(mark) { byKey[pairKey(markCells(mark))] = mark; });
        var visited = {};
        var units = [];
        Object.keys(byKey).forEach(function(key) {
            if (visited[key]) return;
            var mark = byKey[key];
            var rotatedKey = pairKey(rotateCells(markCells(mark), size));
            visited[key] = visited[rotatedKey] = true;
            var unit = [mark];
            if (rotatedKey !== key && byKey[rotatedKey]) unit.push(byKey[rotatedKey]);
            units.push(unit);
        });
        return units;
    }

    function generate(options) {
        options = options || {};
        var size = options.size === 6 ? 6 : 9;
        var variants = Array.isArray(options.variants) ? options.variants.slice() : [options.variant || "classic"];
        if (variants.indexOf("classic") === -1) variants.unshift("classic");
        variants = variants.filter(function(value, index) { return variants.indexOf(value) === index; });
        var supported = ["classic", "diagonal", "anti diagonal", "anti king", "anti knight",
            "non consecutive", "odd even", "kropki", "xv", "battenburg", "windoku"];
        var unsupported = variants.filter(function(variant) { return supported.indexOf(variant) === -1; });
        if (!options.preserveExisting && unsupported.length) {
            throw new Error("Generation is not implemented for: " + unsupported.join(", ") + ".");
        }
        if (!options.preserveExisting && options.negative &&
            (options.negative.kropki || options.negative.xv || options.negative.battenburg)) {
            throw new Error("Symmetric generation with negative Kropki, XV, or Battenburg is not implemented yet.");
        }
        if (!options.preserveExisting && size === 6 && variants.indexOf("anti diagonal") !== -1) {
            throw new Error("Anti-diagonal generation currently requires a 9×9 grid.");
        }
        var random = seededRandom(options.seed);
        var constraints = options.preserveExisting ? {} : globalConstraints(size, variants);
        if (options.sourceConstraints) {
            Object.keys(options.sourceConstraints).forEach(function(name) {
                if (name === "supported" || !Array.isArray(options.sourceConstraints[name])) return;
                var existing = constraints[name] || [];
                constraints[name] = existing.concat(options.sourceConstraints[name]);
            });
        }
        var solution;
        if (Array.isArray(options.sourceBoard) && options.sourceBoard.length === size) {
            var completion = CSP.solve(options.sourceBoard, constraints);
            if (!completion.solved) throw new Error("The existing grid cannot be completed under its active clues.");
            solution = completion.board;
        } else {
            solution = makeSolution(size, variants, constraints, random);
        }
        // Existing puzzles keep their native Penpa clue objects. Their normalized
        // CSP constraints stay fixed while only the completed cell digits are
        // considered for removal; this works for every constraint read by the
        // solver without lossy clue reconstruction.
        var marks = options.preserveExisting ?
            { oddEven: [], kropki: [], xv: [], battenburg: [] } :
            addGeneratedMarks(constraints, solution, variants, random);
        var board = solution.map(function(row) { return row.slice(); });
        var units = [];
        var seenCells = {};
        var symmetry = options.symmetry || 'rotational180';
        for (var cellIndex = 0; cellIndex < size * size; cellIndex++) {
            if (seenCells[cellIndex]) continue;
            var cellRow = Math.floor(cellIndex / size);
            var cellCol = cellIndex % size;
            var rotatedIndex = (size * size - 1) - cellIndex;
            var mirrorHIndex = cellRow * size + (size - 1 - cellCol);
            var mirrorVIndex = (size - 1 - cellRow) * size + cellCol;
            var unit;
            if (symmetry === 'none') {
                seenCells[cellIndex] = true;
                unit = [cellIndex];
            } else if (symmetry === 'all_axis') {
                var indices = [cellIndex, rotatedIndex, mirrorHIndex, mirrorVIndex];
                var unique = indices.filter(function(i, pos) { return indices.indexOf(i) === pos; });
                unique.forEach(function(i) { seenCells[i] = true; });
                unit = unique;
            } else { // rotational180 (default)
                seenCells[cellIndex] = seenCells[rotatedIndex] = true;
                unit = cellIndex === rotatedIndex ? [cellIndex] : [cellIndex, rotatedIndex];
            }
            units.push(unit);
        }
        units = shuffle(units, random);
        var givens = size * size;
        var markUnits = [];
        if (!options.preserveExisting) {
            Object.keys(marks).forEach(function(name) {
                symmetricMarkUnits(marks[name], size).forEach(function(unit) {
                    markUnits.push({ name: name, marks: unit });
                });
            });
        }
        markUnits = shuffle(markUnits, random);
        var totalAttempts = units.length + markUnits.length;

        for (var attempt = 0; attempt < units.length; attempt++) {
            var unit = units[attempt];
            if (options.preserveExisting && Array.isArray(options.sourceBoard)) {
                var containsGiven = unit.some(function(index) {
                    var r = Math.floor(index / size);
                    var c = index % size;
                    return options.sourceBoard[r] && options.sourceBoard[r][c] !== 0;
                });
                if (containsGiven) continue;
            }
            var previous = unit.map(function(index) {
                var row = Math.floor(index / size);
                var col = index % size;
                var value = board[row][col];
                board[row][col] = 0;
                return value;
            });
            var answers = CSP.createProblem(board, constraints).enumerateAnswers(2);
            if (answers.length === 1) {
                givens -= unit.length;
            } else {
                unit.forEach(function(index, offset) {
                    board[Math.floor(index / size)][index % size] = previous[offset];
                });
            }
            if (typeof options.onProgress === "function") {
                options.onProgress({ attempt: attempt + 1, total: totalAttempts, givens: givens });
            }
        }

        markUnits.forEach(function(unit, markAttempt) {
            var before = (constraints[unit.name] || []).slice();
            constraints[unit.name] = before.filter(function(mark) { return unit.marks.indexOf(mark) === -1; });
            var answers = CSP.createProblem(board, constraints).enumerateAnswers(2);
            if (answers.length !== 1) constraints[unit.name] = before;
            if (typeof options.onProgress === "function") {
                options.onProgress({
                    attempt: units.length + markAttempt + 1,
                    total: totalAttempts,
                    givens: givens
                });
            }
        });
        if (!options.preserveExisting) {
            Object.keys(marks).forEach(function(name) { marks[name] = constraints[name] || []; });
        }

        // Non-minimal modes add back the requested number of stripped clues in symmetric units.
        if (options.minimal === false && !options.preserveExisting) {
            var removedUnits = [];
            var seenRemoved = {};
            var symmetry = options.symmetry || 'rotational180';
            for (var ri = 0; ri < size * size; ri++) {
                if (seenRemoved[ri]) continue;
                var rRow = Math.floor(ri / size);
                var rCol = ri % size;
                if (board[rRow][rCol] === 0) {
                    var rotIdx = (size * size - 1) - ri;
                    var mirH = rRow * size + (size - 1 - rCol);
                    var mirV = (size - 1 - rRow) * size + rCol;
                    var symUnit;
                    if (symmetry === 'none') {
                        seenRemoved[ri] = true;
                        symUnit = [ri];
                    } else if (symmetry === 'all_axis') {
                        var idxs = [ri, rotIdx, mirH, mirV];
                        var uniq = idxs.filter(function(i, pos) { return idxs.indexOf(i) === pos; });
                        uniq.forEach(function(i) { seenRemoved[i] = true; });
                        symUnit = uniq;
                    } else { // rotational180
                        seenRemoved[ri] = seenRemoved[rotIdx] = true;
                        symUnit = ri === rotIdx ? [ri] : [ri, rotIdx];
                    }
                    var allEmpty = symUnit.every(function(idx) {
                        return board[Math.floor(idx / size)][idx % size] === 0;
                    });
                    if (allEmpty) {
                        removedUnits.push(symUnit);
                    }
                }
            }
            var targetExtra = Number.isInteger(options.extraClues) ? Math.max(0, options.extraClues) : 8;
            var shuffledUnits = shuffle(removedUnits, random);
            var addedCount = 0;
            for (var ui = 0; ui < shuffledUnits.length && addedCount < targetExtra; ui++) {
                var unitToRestore = shuffledUnits[ui];
                unitToRestore.forEach(function(idx) {
                    var r = Math.floor(idx / size);
                    var c = idx % size;
                    if (board[r][c] === 0) {
                        board[r][c] = solution[r][c];
                        givens++;
                        addedCount++;
                    }
                });
            }
        }

        var finalAnswers = CSP.createProblem(board, constraints).enumerateAnswers(2);
        if (finalAnswers.length !== 1) throw new Error("Generator uniqueness verification failed.");
        return {
            size: size,
            variant: variants.length === 1 ? variants[0] : "multi variant",
            variants: variants,
            board: board,
            solution: solution,
            constraints: constraints,
            oddEvenMarks: marks.oddEven,
            kropkiMarks: marks.kropki,
            xvMarks: marks.xv,
            battenburgMarks: marks.battenburg,
            preserveExisting: options.preserveExisting === true,
            givens: givens,
            unique: true
        };
    }

    return { generate: generate, seededRandom: seededRandom };
})();

if (typeof module !== "undefined" && module.exports) module.exports = SudokuGenerator;
