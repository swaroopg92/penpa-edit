var SudokuCSP = (function() {
    var SIZE = 9;
    var ALL_DIGITS = 0x3FE;
    var constraintRegistry = {};
    var evaluatorCache = typeof WeakMap !== "undefined" ? new WeakMap() : null;

    function cloneBoard(board) {
        var requestedSize = board && board.length;
        if (requestedSize) {
            SIZE = requestedSize;
            ALL_DIGITS = (1 << (SIZE + 1)) - 2;
            if (helpers) {
                helpers.size = SIZE;
                helpers.allDigitsMask = ALL_DIGITS;
            }
        }
        return Array.from({ length: SIZE }, function(_, row) {
            return Array.from({ length: SIZE }, function(__, col) {
                var value = board && board[row] ? parseInt(board[row][col], 10) : 0;
                return value >= 1 && value <= SIZE ? value : 0;
            });
        });
    }

    function boxDimensions(size) {
        if (size === 6) return { height: 2, width: 3 };
        if (size === 8) return { height: 2, width: 4 };
        if (size === 9) return { height: 3, width: 3 };
        return { height: 1, width: size };
    }

    function boxIndex(row, col, size) {
        size = size || SIZE;
        var dimensions = boxDimensions(size);
        var boxHeight = dimensions.height;
        var boxWidth = dimensions.width;
        return ((row / boxHeight) | 0) * (size / boxWidth) + ((col / boxWidth) | 0);
    }

    function cloneConstraints(constraints) {
        var copy = {};
        Object.keys(constraints || {}).forEach(function(name) {
            copy[name] = Array.isArray(constraints[name]) ? constraints[name].slice() : constraints[name];
        });
        return copy;
    }

    function cellValue(board, cell) {
        return board[cell.row][cell.col];
    }

    function maskToDigits(mask) {
        var digits = [];
        for (var digit = 1; digit <= SIZE; digit++) {
            if (mask & (1 << digit)) {
                digits.push(digit);
            }
        }
        return digits;
    }

    function countBits(mask) {
        var count = 0;
        while (mask) {
            mask &= mask - 1;
            count++;
        }
        return count;
    }

    function createState(source, constraints) {
        var board = cloneBoard(source);
        var rows = new Array(SIZE).fill(0);
        var cols = new Array(SIZE).fill(0);
        var boxes = new Array(SIZE).fill(0);
        var useRows = !constraints || constraints.baseRows !== false;
        var useCols = !constraints || constraints.baseCols !== false;
        var useBoxes = !constraints || constraints.baseBoxes !== false;
        var valid = true;
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var digit = board[row][col];
                if (!digit) {
                    continue;
                }
                var bit = 1 << digit;
                var box = boxIndex(row, col, SIZE);
                if ((useRows && (rows[row] & bit)) || (useCols && (cols[col] & bit)) || (useBoxes && (boxes[box] & bit))) {
                    valid = false;
                }
                if (useRows) rows[row] |= bit;
                if (useCols) cols[col] |= bit;
                if (useBoxes) boxes[box] |= bit;
            }
        }
        return { board: board, rows: rows, cols: cols, boxes: boxes, useRows: useRows, useCols: useCols, useBoxes: useBoxes, valid: valid };
    }

    function coreMask(state, row, col) {
        var box = boxIndex(row, col, state.board.length);
        return ALL_DIGITS & ~((state.useRows ? state.rows[row] : 0) | (state.useCols ? state.cols[col] : 0) | (state.useBoxes ? state.boxes[box] : 0));
    }

    var helpers = {
        size: SIZE,
        allDigitsMask: ALL_DIGITS,
        cellValue: cellValue,
        maskToDigits: maskToDigits,
        isStarCell: function(cell, starCells) { return (starCells || []).some(function(sc) { return sc.row === cell.row && sc.col === cell.col; }); }
    };


    registerConstraint("roundOffCages", {
        validatePartial: function(board, cage) {
            if (cage.cells.length !== 2) return true;
            var tens = cellValue(board, cage.cells[0]);
            var units = cellValue(board, cage.cells[1]);

            if (tens && units) {
                var rounded = units < 5 ? tens * 10 : tens * 10 + 10;
                return rounded === cage.total;
            } else if (tens) {
                var possible1 = tens * 10;
                var possible2 = tens * 10 + 10;
                return possible1 === cage.total || possible2 === cage.total;
            } else if (units) {
                var expectedTens = units < 5 ? Math.floor(cage.total / 10) : Math.floor(cage.total / 10) - 1;
                return expectedTens >= 1 && expectedTens <= SIZE;
            }
            return true;
        }
    });

    registerConstraint("selfjoin", {
        validatePartial: function(board, shadedCells) {
            var size = board.length;
            var isShaded = {};
            for (var i = 0; i < shadedCells.length; i++) {
                isShaded[shadedCells[i].row + ":" + shadedCells[i].col] = true;
            }
            var dims = boxDimensions(size);
            var boxHeight = dims.height;
            var boxWidth = dims.width;

            for (var r = 0; r < size; r++) {
                for (var c = 0; c < size; c++) {
                    var val = cellValue(board, { row: r, col: c });
                    if (!val) continue;

                    var boxPos = (r % boxHeight) * boxWidth + (c % boxWidth) + 1;
                    var shaded = !!isShaded[r + ":" + c];

                    if (val === boxPos && !shaded) return false;
                    if (val !== boxPos && shaded) return false;
                }
            }
            return true;
        }
    });

    registerConstraint("watchtowers", {
        validatePartial: function(board, shadedCells) {
            var size = board.length;
            var isShaded = {};
            for (var i = 0; i < shadedCells.length; i++) {
                isShaded[shadedCells[i].row + ":" + shadedCells[i].col] = true;
            }
            var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (var r = 0; r < size; r++) {
                for (var c = 0; c < size; c++) {
                    var N = cellValue(board, {row: r, col: c});
                    if (!N) continue;
                    var minSeen = 1;
                    var maxSeen = 1;
                    for (var d = 0; d < 4; d++) {
                        var nr = r + dirs[d][0], nc = c + dirs[d][1];
                        var blockedMin = false, blockedMax = false;
                        while (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                            var v = cellValue(board, {row: nr, col: nc});
                            if (v) {
                                if (v >= N) {
                                    blockedMin = true;
                                    blockedMax = true;
                                    break;
                                } else {
                                    if (!blockedMin) minSeen++;
                                    if (!blockedMax) maxSeen++;
                                }
                            } else {
                                var mask = board[nr][nc].mask;
                                var canBeSmaller = false;
                                var mustBeSmaller = true;
                                var canBeLargerOrEqual = false;
                                var mustBeLargerOrEqual = true;
                                for (var bit = 1; bit <= size; bit++) {
                                    if ((mask & (1 << bit)) === 0) continue;
                                    if (bit < N) {
                                        canBeSmaller = true;
                                        mustBeLargerOrEqual = false;
                                    }
                                    if (bit >= N) {
                                        canBeLargerOrEqual = true;
                                        mustBeSmaller = false;
                                    }
                                }
                                if (mustBeSmaller && !blockedMin) minSeen++;
                                if (canBeSmaller && !blockedMax) maxSeen++;
                                if (canBeLargerOrEqual) blockedMin = true;
                                if (mustBeLargerOrEqual) blockedMax = true;
                            }
                            nr += dirs[d][0];
                            nc += dirs[d][1];
                        }
                    }
                    if (isShaded[r + ":" + c]) {
                        if (maxSeen < N || minSeen > N) return false;
                    } else {
                        if (minSeen === N && maxSeen === N) return false;
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("orderingGroups", {
        validatePartial: function(board, group) {
            var minPossibles = [];
            var maxPossibles = [];
            for (var i = 0; i < group.length; i++) {
                var min = 0, max = 0;
                for (var j = 0; j < group[i].cells.length; j++) {
                    var v = cellValue(board, group[i].cells[j]);
                    if (v) {
                        min = min * 10 + v;
                        max = max * 10 + v;
                    } else {
                        min = min * 10 + 1;
                        max = max * 10 + SIZE;
                    }
                }
                minPossibles.push(min);
                maxPossibles.push(max);
            }

            var currentMin = 0;
            for (var i = 0; i < group.length; i++) {
                currentMin = Math.max(currentMin + 1, minPossibles[i]);
                if (currentMin > maxPossibles[i]) return false;
            }

            var currentMax = Infinity;
            for (var i = group.length - 1; i >= 0; i--) {
                currentMax = Math.min(currentMax - 1, maxPossibles[i]);
                if (currentMax < minPossibles[i]) return false;
            }
            return true;
        }
    });


    registerConstraint("braille", {
        validatePartial: function(board, clue) {
            var value = cellValue(board, clue.cell);
            if (!value) return true;
            var brailleMap = { 1: [0], 2: [0, 3], 3: [0, 1], 4: [0, 1, 4], 5: [0, 4], 6: [0, 1, 3], 7: [0, 1, 3, 4], 8: [0, 3, 4], 9: [1, 3] };
            var targetDots = brailleMap[value] || [];
            for (var i = 0; i < clue.dots.length; i++) {
                if (targetDots.indexOf(clue.dots[i]) === -1) return false;
            }
            return true;
        }
    });

    function registerConstraint(name, handler) {
        if (!name || !handler || typeof handler.validatePartial !== "function") {
            throw new Error("A CSP constraint requires a name and validatePartial(board, constraint, helpers).");
        }
        constraintRegistry[name] = handler;
    }

    function registeredConstraints() {
        return Object.keys(constraintRegistry);
    }

    function compileConstraints(constraints) {
        constraints = constraints || {};
        if (evaluatorCache && evaluatorCache.has(constraints)) return evaluatorCache.get(constraints);
        var entries = [];
        var byCell = {};
        var globalEntries = [];
        registeredConstraints().forEach(function(name) {
            if (name === "outsideRelations" && constraints.starCells) {
                // inject starCells into outsideRelations clues so they can check it
                (constraints[name] || []).forEach(function(item) {
                    item.starCells = constraints.starCells;
                });
            }
            var handler = constraintRegistry[name];
            (constraints[name] || []).forEach(function(item) {
                var entry = { handler: handler, item: item };
                entries.push(entry);
                var cells = cellsInConstraint(item);
                if (!cells.length) {
                    globalEntries.push(entry);
                    return;
                }
                cells.forEach(function(cell) {
                    var key = cell.row + ":" + cell.col;
                    (byCell[key] || (byCell[key] = [])).push(entry);
                });
            });
        });
        function validate(board, selected, complete) {
            for (var index = 0; index < selected.length; index++) {
                var entry = selected[index];
                if (!entry.handler.validatePartial(board, entry.item, helpers) ||
                    (complete && entry.handler.validateComplete &&
                        !entry.handler.validateComplete(board, entry.item, helpers))) return false;
            }
            return true;
        }
        var evaluator = {
            validateAll: function(board, complete) { return validate(board, entries, complete); },
            validateCell: function(board, row, col) {
                if (!validate(board, globalEntries, false)) return false;
                return validate(board, byCell[row + ":" + col] || [], false);
            }
        };
        if (evaluatorCache && constraints && typeof constraints === "object") evaluatorCache.set(constraints, evaluator);
        return evaluator;
    }

    function constraintsValid(board, constraints, complete) {
        return compileConstraints(constraints || {}).validateAll(board, complete);
    }

    function cellName(cell) {
        return "r" + (cell.row + 1) + "c" + (cell.col + 1);
    }

    function cellsInConstraint(value, cells, seen) {
        cells = cells || [];
        seen = seen || {};
        if (!value || typeof value !== "object") return cells;
        if (Number.isInteger(value.row) && Number.isInteger(value.col) &&
            value.row >= 0 && value.row < SIZE && value.col >= 0 && value.col < SIZE) {
            var key = value.row + ":" + value.col;
            if (!seen[key]) {
                seen[key] = true;
                cells.push({ row: value.row, col: value.col });
            }
            return cells;
        }
        Object.keys(value).forEach(function(key) {
            cellsInConstraint(value[key], cells, seen);
        });
        return cells;
    }

    function duplicateConflict(board, constraints) { if (constraints && constraints.extraLargeRegions && constraints.extraLargeRegions.length) return null;
        var groups = [];
        for (var index = 0; index < SIZE; index++) {
            if (!constraints || constraints.baseRows !== false) {
                groups.push({ label: "row " + (index + 1), cells: Array.from({ length: SIZE }, function(_, col) {
                    return { row: index, col: col };
                }) });
            }
            if (!constraints || constraints.baseCols !== false) {
                groups.push({ label: "column " + (index + 1), cells: Array.from({ length: SIZE }, function(_, row) {
                    return { row: row, col: index };
                }) });
            }
        }
        if (!constraints || constraints.baseBoxes !== false) {
            var dimensions = boxDimensions(SIZE);
            var boxHeight = dimensions.height;
            var boxWidth = dimensions.width;
            for (var boxRow = 0; boxRow < SIZE; boxRow += boxHeight) {
                for (var boxCol = 0; boxCol < SIZE; boxCol += boxWidth) {
                    var boxCells = [];
                    for (var rowOffset = 0; rowOffset < boxHeight; rowOffset++) {
                        for (var colOffset = 0; colOffset < boxWidth; colOffset++) {
                            boxCells.push({ row: boxRow + rowOffset, col: boxCol + colOffset });
                        }
                    }
                    groups.push({ label: "box at r" + (boxRow + 1) + "c" + (boxCol + 1), cells: boxCells });
                }
            }
        }
        if (constraints && constraints.diagonalAllDifferent && constraints.diagonalAllDifferent.length) {
            constraints.diagonalAllDifferent.forEach(function(diagonal, i) {
                groups.push({ label: "diagonal line " + (i + 1), cells: diagonal });
            });
        }
        if (constraints && constraints.regionAllDifferent && constraints.regionAllDifferent.length) {
            constraints.regionAllDifferent.forEach(function(region, i) {
                groups.push({ label: "region " + (i + 1), cells: region });
            });
        }
        if (constraints && constraints.scatteredAllDifferent && constraints.scatteredAllDifferent.length) {
            constraints.scatteredAllDifferent.forEach(function(scattered, i) {
                groups.push({ label: "shaded group " + (i + 1), cells: scattered });
            });
        }
        for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
            var byDigit = {};
            groups[groupIndex].cells.forEach(function(cell) {
                var digit = cellValue(board, cell);
                if (digit) (byDigit[digit] || (byDigit[digit] = [])).push(cell);
            });
            var duplicate = Object.keys(byDigit).find(function(digit) { return byDigit[digit].length > 1; });
            if (duplicate) {
                var duplicateCells = byDigit[duplicate];
                return {
                    kind: "duplicate",
                    cells: duplicateCells,
                    message: "Conflicting givens: digit " + duplicate + " is repeated in " + groups[groupIndex].label + " at " +
                        duplicateCells.map(cellName).join(" and ") + "."
                };
            }
        }
        return null;
    }

    function constraintLabel(name, item) {
        if (name === "directionalMarks" && item && item.relation) {
            return item.relation.replace(/([a-z])([0-9])/g, "$1 $2").replace(/([a-z])([A-Z])/g, "$1 $2");
        }
        var labels = {
            termination: "0",
            notTermination: "none",
            antiKing: "Anti King", antiKnight: "Anti Knight", chessKings: "Chess Kings", nonConsecutive: "Non-Consecutive",
            polePosition: "Pole Position",
            edgeRelations: "edge clue", quadRelations: "quad clue", mathdoku: "mathdoku", catalogLines: "line clue",
            diagonalAllDifferent: "diagonal/region", regionAllDifferent: "region", extraLargeRegions: "extra large regions", difference2Neighbours: "difference 2 neighbours",
            regionCoverage: "region coverage", scatteredAllDifferent: "Scattered shaded cells",
            invalidRegions: "region layout", kropki: "Kropki", xv: "XV", battenburg: "Battenburg",
            selfjoin: "Self-Join",
            midpoints: "Midpoint"
        };
        return labels[name] || name.replace(/([a-z])([A-Z])/g, "$1 $2");
    }

    function findConflict(board, constraints) {
        var normalized = cloneBoard(board);
        constraints = constraints || {};
        var duplicate = duplicateConflict(normalized, constraints);
        if (duplicate) return duplicate;
        var names = registeredConstraints();
        for (var nameIndex = 0; nameIndex < names.length; nameIndex++) {
            var name = names[nameIndex];
            var items = constraints[name] || [];
            for (var itemIndex = 0; itemIndex < items.length; itemIndex++) {
                var handler = constraintRegistry[name];
                if (!handler.validatePartial(normalized, items[itemIndex], helpers)) {
                    var cells = cellsInConstraint(items[itemIndex]);
                    return {
                        kind: "constraint",
                        constraint: name,
                        cells: cells,
                        message: name === "invalidRegions" && items[itemIndex].message ? items[itemIndex].message :
                            "Constraint conflict: " + constraintLabel(name, items[itemIndex]) + " conflicts with the current digits" +
                                (cells.length ? " at " + cells.map(cellName).join(", ") : "") + "."
                    };
                }
            }
        }
        return null;
    }

    function unresolvedConflict(board) {
        var cells = [];
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (board[row][col]) cells.push({ row: row, col: col });
            }
        }
        return {
            kind: "unsatisfiable",
            cells: cells,
            message: "No complete solution exists. The highlighted givens are collectively inconsistent, but no single local rule is already violated."
        };
    }

    function place(state, row, col, digit) {
        var bit = 1 << digit;
        var box = boxIndex(row, col, state.board.length);
        state.board[row][col] = digit;
        if (state.useRows) state.rows[row] |= bit;
        if (state.useCols) state.cols[col] |= bit;
        if (state.useBoxes) state.boxes[box] |= bit;
    }

    function remove(state, row, col, digit) {
        var bit = ~(1 << digit);
        var box = boxIndex(row, col, state.board.length);
        state.board[row][col] = 0;
        if (state.useRows) state.rows[row] &= bit;
        if (state.useCols) state.cols[col] &= bit;
        if (state.useBoxes) state.boxes[box] &= bit;
    }

    function allowedMask(state, constraints, row, col, evaluator) {
        var mask = coreMask(state, row, col);
        var allowed = 0;
        evaluator = evaluator || compileConstraints(constraints || {});
        for (var digit = 1; digit <= SIZE; digit++) {
            var bit = 1 << digit;
            if (!(mask & bit)) {
                continue;
            }
            place(state, row, col, digit);
            if (evaluator.validateCell(state.board, row, col)) {
                allowed |= bit;
            }
            remove(state, row, col, digit);
        }
        return allowed;
    }

    function search(state, constraints, onSolution, limit, evaluator) {
        var found = 0;
        evaluator = evaluator || compileConstraints(constraints || {});

        function visit() {
            var bestRow = -1;
            var bestCol = -1;
            var bestMask = 0;
            var bestCount = SIZE + 1;
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    if (state.board[row][col]) {
                        continue;
                    }
                    var mask = allowedMask(state, constraints, row, col, evaluator);
                    var count = countBits(mask);
                    if (!count) {
                        return false;
                    }
                    if (count < bestCount) {
                        bestRow = row;
                        bestCol = col;
                        bestMask = mask;
                        bestCount = count;
                        if (count === 1) {
                            break;
                        }
                    }
                }
                if (bestCount === 1) {
                    break;
                }
            }

            if (bestRow === -1) {
                if (!evaluator.validateAll(state.board, true)) {
                    return false;
                }
                found++;
                return onSolution(cloneBoard(state.board)) === false || found >= limit;
            }

            var digits = maskToDigits(bestMask);
            for (var i = 0; i < digits.length; i++) {
                place(state, bestRow, bestCol, digits[i]);
                var stop = visit();
                remove(state, bestRow, bestCol, digits[i]);
                if (stop) {
                    return true;
                }
            }
            return false;
        }

        if (state.valid && evaluator.validateAll(state.board, false)) {
            visit();
        }
        return found;
    }

    function findSolutions(board, constraints, limit) {
        var solutions = [];
        var state = createState(board, constraints);
        var evaluator = compileConstraints(constraints || {});
        search(state, constraints, function(solution) {
            solutions.push(solution);
        }, limit || 1, evaluator);
        return solutions;
    }

    function solutionWithAssumption(board, constraints, row, col, digit) {
        var assumed = cloneBoard(board);
        if (assumed[row][col] && assumed[row][col] !== digit) {
            return null;
        }
        assumed[row][col] = digit;
        var solutions = findSolutions(assumed, constraints, 1);
        return solutions.length ? solutions[0] : null;
    }

    function solutionMatches(solution, source, constraints) {
        var state = createState(solution, constraints);
        if (!state.valid || !constraintsValid(state.board, constraints, true)) {
            return false;
        }
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (!state.board[row][col] || (source[row][col] && source[row][col] !== state.board[row][col])) {
                    return false;
                }
            }
        }
        return true;
    }

    function analyzeCandidates(board, constraints) {
        var source = cloneBoard(board);
        var state = createState(source, constraints);
        var candidates = Array.from({ length: SIZE }, function() {
            return Array.from({ length: SIZE }, function() { return []; });
        });
        if (!state.valid || !constraintsValid(state.board, constraints, false)) {
            return { valid: false, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: findConflict(source, constraints) };
        }

        var first = findSolutions(source, constraints, 1)[0];
        if (!first) {
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: unresolvedConflict(source) };
        }

        var possibleMasks = Array.from({ length: SIZE }, function() { return new Array(SIZE).fill(0); });
        var forced = cloneBoard(source);
        function absorb(solution) {
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    possibleMasks[row][col] |= 1 << solution[row][col];
                }
            }
        }
        absorb(first);

        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (source[row][col]) {
                    continue;
                }
                var localMask = allowedMask(state, constraints, row, col);
                var localDigits = maskToDigits(localMask);
                for (var i = 0; i < localDigits.length; i++) {
                    var digit = localDigits[i];
                    if (possibleMasks[row][col] & (1 << digit)) {
                        continue;
                    }
                    var witness = solutionWithAssumption(source, constraints, row, col, digit);
                    if (witness) {
                        absorb(witness);
                    }
                }
            }
        }

        for (var y = 0; y < SIZE; y++) {
            for (var x = 0; x < SIZE; x++) {
                if (source[y][x]) {
                    continue;
                }
                candidates[y][x] = maskToDigits(possibleMasks[y][x]);
                forced[y][x] = candidates[y][x].length === 1 ? candidates[y][x][0] : 0;
            }
        }
        return {
            valid: true,
            satisfiable: true,
            candidates: candidates,
            forced: forced,
            unique: candidates.every(function(row, y) {
                return row.every(function(values, x) { return source[y][x] || values.length === 1; });
            })
        };
    }

    function nextPaint() {
        return new Promise(function(resolve) {
            setTimeout(resolve, 0);
        });
    }

    async function analyzeCandidatesAsync(board, constraints, options) {
        options = options || {};
        var report = typeof options.onProgress === "function" ? options.onProgress : function() {};
        var cancelled = typeof options.isCancelled === "function" ? options.isCancelled : function() { return false; };
        var source = cloneBoard(board);
        var state = createState(source, constraints);
        var candidates = Array.from({ length: SIZE }, function() {
            return Array.from({ length: SIZE }, function() { return []; });
        });
        report({ type: "start", message: "Validating givens and variant constraints." });
        await nextPaint();
        if (cancelled()) {
            return { cancelled: true };
        }
        if (!state.valid || !constraintsValid(state.board, constraints, false)) {
            var invalidConflict = findConflict(source, constraints);
            report({ type: "invalid", message: invalidConflict ? invalidConflict.message :
                "The current givens or constraints conflict.", conflict: invalidConflict });
            return { valid: false, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: invalidConflict };
        }

        var seedSolutions = [];
        var seenSeeds = {};
        (options.seedSolutions || []).forEach(function(solution) {
            var normalized = cloneBoard(solution);
            var key = JSON.stringify(normalized);
            if (!seenSeeds[key] && solutionMatches(normalized, source, constraints)) {
                seenSeeds[key] = true;
                seedSolutions.push(normalized);
            }
        });
        var first = seedSolutions[0] || findSolutions(source, constraints, 1)[0];
        if (!first) {
            var unsatisfiableConflict = unresolvedConflict(source);
            report({ type: "unsatisfiable", message: unsatisfiableConflict.message,
                conflict: unsatisfiableConflict });
            return { valid: true, satisfiable: false, candidates: candidates, forced: cloneBoard(source),
                conflict: unsatisfiableConflict };
        }
        report({
            type: "solution",
            reused: seedSolutions.length,
            message: seedSolutions.length ?
                "Reused " + seedSolutions.length + " compatible solution witness" +
                    (seedSolutions.length === 1 ? "." : "es.") :
                "Found an initial complete solution."
        });
        await nextPaint();

        var possibleMasks = Array.from({ length: SIZE }, function() { return new Array(SIZE).fill(0); });
        var forced = cloneBoard(source);
        var witnessSolutions = [];
        function absorb(solution) {
            witnessSolutions.push(cloneBoard(solution));
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    possibleMasks[row][col] |= 1 << solution[row][col];
                }
            }
        }
        if (seedSolutions.length) {
            seedSolutions.forEach(absorb);
        } else {
            absorb(first);
        }

        var checks = [];
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (source[row][col]) {
                    continue;
                }
                maskToDigits(allowedMask(state, constraints, row, col)).forEach(function(digit) {
                    checks.push({ row: row, col: col, digit: digit });
                });
            }
        }
        report({
            type: "analysis",
            total: checks.length,
            message: "Testing " + checks.length + " cell/digit answer facts against complete solutions."
        });
        await nextPaint();

        var tested = 0;
        var witnessCount = witnessSolutions.length;
        var refutedCount = 0;
        for (var i = 0; i < checks.length; i++) {
            if (cancelled()) {
                report({ type: "cancelled", message: "Analysis cancelled because the puzzle changed." });
                return { cancelled: true };
            }
            var check = checks[i];
            var alreadyWitnessed = !!(possibleMasks[check.row][check.col] & (1 << check.digit));
            var witness = alreadyWitnessed ? true :
                solutionWithAssumption(source, constraints, check.row, check.col, check.digit);
            if (witness && witness !== true) {
                absorb(witness);
                witnessCount++;
            } else if (!witness) {
                refutedCount++;
            }
            tested++;
            report({
                type: alreadyWitnessed ? "covered" : witness ? "witness" : "refuted",
                row: check.row,
                col: check.col,
                digit: check.digit,
                tested: tested,
                total: checks.length,
                message: "r" + (check.row + 1) + "c" + (check.col + 1) + " = " + check.digit +
                    (alreadyWitnessed ? " already covered by a witness." :
                        witness ? " occurs in a complete solution." : " is impossible in every solution.")
            });
            if (tested % 4 === 0 || tested === checks.length) {
                await nextPaint();
            }
        }

        for (var y = 0; y < SIZE; y++) {
            for (var x = 0; x < SIZE; x++) {
                if (source[y][x]) {
                    continue;
                }
                candidates[y][x] = maskToDigits(possibleMasks[y][x]);
                forced[y][x] = candidates[y][x].length === 1 ? candidates[y][x][0] : 0;
            }
        }
        var unique = candidates.every(function(row, y) {
            return row.every(function(values, x) { return source[y][x] || values.length === 1; });
        });
        report({
            type: "done",
            tested: tested,
            total: checks.length,
            witnesses: witnessCount,
            refuted: refutedCount,
            unique: unique,
            message: "Irrefutable extraction complete: " + witnessCount + " solution witnesses, " +
                refutedCount + " impossible answer facts; answer is " + (unique ? "unique." : "not unique.")
        });
        return {
            valid: true,
            satisfiable: true,
            candidates: candidates,
            forced: forced,
            unique: unique,
            witnesses: witnessCount,
            refuted: refutedCount,
            reusedWitnesses: seedSolutions.length,
            witnessSolutions: witnessSolutions
        };
    }

    function createProblem(board, constraints) {
        if (constraints) board.isZeroEight = constraints.isZeroEight;
        var values = cloneBoard(board);
        var normalizedConstraints = cloneConstraints(constraints || {});
        var answerKeys = [];
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                answerKeys.push({ row: row, col: col });
            }
        }
        return {
            size: SIZE,
            board: values,
            constraints: normalizedConstraints,
            answerKeys: answerKeys,
            isConsistent: function() {
                var state = createState(values, normalizedConstraints);
                return state.valid && constraintsValid(values, normalizedConstraints, false);
            },
            candidates: function() {
                return analyzeCandidates(values, normalizedConstraints);
            },
            irrefutableFacts: function() {
                return analyzeCandidates(values, normalizedConstraints);
            },
            solve: function() {
                return solve(values, normalizedConstraints);
            },
            enumerateAnswers: function(limit) {
                return findSolutions(values, normalizedConstraints, Math.max(1, limit || 1));
            }
        };
    }

    function getCandidates(board, constraints) {
        return analyzeCandidates(board, constraints || {});
    }

    function solve(board, constraints) {
        var source = cloneBoard(board);
        var state = createState(source, constraints);
        if (!state.valid || !constraintsValid(source, constraints || {}, false)) {
            var conflict = findConflict(source, constraints || {});
            return { solved: false, reason: conflict ? conflict.message :
                "The grid has conflicting givens or constraints.", conflict: conflict };
        }
        var solutions = findSolutions(source, constraints || {}, 1);
        return solutions.length ?
            { solved: true, board: solutions[0] } :
            { solved: false, reason: unresolvedConflict(source).message, conflict: unresolvedConflict(source) };
    }

registerConstraint("emitters", {
        validatePartial: function(board, emitter) {
            var eVal = cellValue(board, emitter.cell);

            for (var i = 0; i < emitter.lines.length; i++) {
                var line = emitter.lines[i];
                var minSum = 0;
                var filledSum = 0;
                var allCellsFilled = true;

                for (var j = 0; j < line.cells.length; j++) {
                    var v = cellValue(board, line.cells[j]);
                    if (v) {
                        minSum += v;
                        filledSum += v;
                    } else {
                        minSum += 1; // Minimum possible digit is 1
                        allCellsFilled = false;
                    }
                }

                if (eVal && minSum > eVal) return false;
                if (!eVal && minSum > SIZE) return false; // assuming max digit is SIZE

                if (eVal && allCellsFilled && line.nextCell) {
                    var nextV = cellValue(board, line.nextCell);
                    if (nextV) {
                        if (filledSum + nextV <= eVal) return false;
                    } else {
                        // nextV is unknown, its max value is SIZE
                        if (filledSum + SIZE <= eVal) return false;
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("thermos", {
        validatePartial: function(board, path) {
            for (var i = 0; i < path.length; i++) {
                var value = cellValue(board, path[i]);
                if (!value) {
                    continue;
                }
                var minVal = board.isZeroEight ? i : i + 1;
                var maxVal = board.isZeroEight ? SIZE - 1 - (path.length - 1 - i) : SIZE - (path.length - 1 - i);
                if (value < minVal || value > maxVal) {
                    return false;
                }
                var previous = i > 0 ? cellValue(board, path[i - 1]) : 0;
                var next = i < path.length - 1 ? cellValue(board, path[i + 1]) : 0;
                if ((previous && previous >= value) || (next && value >= next)) {
                    return false;
                }
            }
            return true;
        }
    });

    registerConstraint("arrows", {
        validatePartial: function(board, arrow) {
            var circle = cellValue(board, arrow.circle);
            var sum = 0;
            var open = 0;
            for (var i = 0; i < arrow.shaft.length; i++) {
                var value = cellValue(board, arrow.shaft[i]);
                value ? sum += (board.isZeroEight ? value - 1 : value) : open++;
            }
            if (circle) {
                return sum + open <= circle && sum + (SIZE * open) >= circle && (open || sum === circle);
            }
            return open ? sum + open <= SIZE : sum >= 1 && sum <= SIZE;
        }
    });

registerConstraint("threeDigitNumbersKillers", {
        validatePartial: function(board, cage, helpers) {
            var seen = 0;
            for (var i = 0; i < cage.cells.length; i++) {
                var digit = cellValue(board, cage.cells[i]);
                if (digit) {
                    var bit = 1 << digit;
                    if (seen & bit) return false;
                    seen |= bit;
                }
            }

            if (cage.total === null || isNaN(cage.total) || !cage.lines || !cage.lines.length) return true;

            for (var i = 0; i < cage.lines.length; i++) {
                if (cage.lines[i].length !== 3) return false;
            }

            var allLineCellsFilled = true;
            for (var i = 0; i < cage.lines.length; i++) {
                for (var j = 0; j < cage.lines[i].length; j++) {
                    if (!cellValue(board, cage.lines[i][j])) {
                        allLineCellsFilled = false;
                        break;
                    }
                }
            }
            if (!allLineCellsFilled) return true;

            function checkSum(index, currentSum) {
                if (index === cage.lines.length) return currentSum === cage.total;
                var line = cage.lines[index];
                var num1 = cellValue(board, line[0]) * 100 + cellValue(board, line[1]) * 10 + cellValue(board, line[2]);
                var num2 = cellValue(board, line[2]) * 100 + cellValue(board, line[1]) * 10 + cellValue(board, line[0]);
                if (checkSum(index + 1, currentSum + num1)) return true;
                if (num1 !== num2 && checkSum(index + 1, currentSum + num2)) return true;
                return false;
            }

            return checkSum(0, 0);
        }
    });


    registerConstraint("midpoints", {
        validatePartial: function(board, clue) {
            var digits = clue.text.split("").map(Number);
            if (digits.length !== 2) return false;
            var d1 = digits[0], d2 = digits[1];

            var anyPossible = false;
            for (var i = 0; i < clue.pairs.length; i++) {
                var cell1 = clue.pairs[i][0];
                var cell2 = clue.pairs[i][1];
                var v1 = cellValue(board, cell1);
                var v2 = cellValue(board, cell2);

                var v1_vis = v1 ? (board.isZeroEight ? v1 - 1 : v1) : undefined;
                var v2_vis = v2 ? (board.isZeroEight ? v2 - 1 : v2) : undefined;

                var possible = true;
                if (v1_vis !== undefined && v1_vis !== d1 && v1_vis !== d2) possible = false;
                if (v2_vis !== undefined && v2_vis !== d1 && v2_vis !== d2) possible = false;
                if (v1_vis !== undefined && v2_vis !== undefined && v1_vis === v2_vis && d1 !== d2) possible = false;
                if (v1_vis !== undefined && v2_vis !== undefined && ((v1_vis === d1 && v2_vis === d2) || (v1_vis === d2 && v2_vis === d1))) {
                    return true;
                }

                if (possible) {
                    anyPossible = true;
                }
            }
            return anyPossible;
        }
    });

    registerConstraint("killers", {
        validatePartial: function(board, cage) {
            var seen = 0;
            var total = 0;
            var blanks = 0;
            for (var i = 0; i < cage.cells.length; i++) {
                var digit = cellValue(board, cage.cells[i]);
                if (!digit) {
                    blanks++;
                    continue;
                }
                var bit = 1 << digit;
                if (seen & bit) {
                    return false;
                }
                seen |= bit;
                total += (board.isZeroEight ? digit - 1 : digit);
            }
            if (!cage.total) {
                return true;
            }
            if (total > cage.total || (!blanks && total !== cage.total)) {
                return false;
            }
            var available = [];
            for (var value = 1; value <= SIZE; value++) {
                if (!(seen & (1 << value))) {
                    available.push(value);
                }
            }
            if (available.length < blanks) {
                return false;
            }
            var minimum = available.slice(0, blanks).reduce(function(sum, value) { return sum + value; }, 0);
            var maximum = available.slice(available.length - blanks).reduce(function(sum, value) { return sum + value; }, 0);
            return total + minimum <= cage.total && total + maximum >= cage.total;
        }
    });


    registerConstraint("zones", {
        validatePartial: function(board, cage) {
            var missing = cage.digits.slice();
            var emptyCount = 0;
            for (var i = 0; i < cage.cells.length; i++) {
                var val = cellValue(board, cage.cells[i]);
                if (val) {
                    var idx = missing.indexOf(val);
                    if (idx !== -1) {
                        missing.splice(idx, 1);
                    }
                } else {
                    emptyCount++;
                }
            }
            return emptyCount >= missing.length;
        }
    });

    registerConstraint("somewhere", {
        validatePartial: function(board, cage) {
            var emptyCount = 0;
            var found = false;
            for (var i = 0; i < cage.cells.length; i++) {
                var val = cellValue(board, cage.cells[i]);
                if (val === cage.digit) {
                    found = true;
                    break;
                } else if (!val) {
                    emptyCount++;
                }
            }
            return found || emptyCount > 0;
        }
    });



    registerConstraint("differentParity", {
        validatePartial: function(board, clue) {
            var val1 = cellValue(board, clue[0]);
            var val2 = cellValue(board, clue[1]);
            if (val1 && val2) {
                return (val1 % 2) !== (val2 % 2);
            }
            return true;
        }
    });
    registerConstraint("oddEven", {
        validatePartial: function(board, mark) {
            var value = cellValue(board, mark.cell);
            if (!value) {
                return true;
            }
            return mark.parity === "odd" ? value % 2 === 1 : value % 2 === 0;
        }
    });

    registerConstraint("battenburg", {
        validatePartial: function(board, constraint) {
            var cells = constraint.cells || constraint;
            var complete = true;
            for (var i = 0; i < cells.length; i++) {
                var first = cellValue(board, cells[i]);
                if (!first) {
                    complete = false;
                    continue;
                }
                for (var j = i + 1; j < cells.length; j++) {
                    var second = cellValue(board, cells[j]);
                    if (!second) {
                        complete = false;
                        continue;
                    }
                    var orthogonal = cells[i].row === cells[j].row || cells[i].col === cells[j].col;
                    var violatesPattern = orthogonal ? first % 2 === second % 2 : first % 2 !== second % 2;
                    if ((!constraint.kind || constraint.kind === "marked") && violatesPattern) {
                        return false;
                    }
                }
            }
            if (constraint.kind === "none" && complete) {
                var parity = cells.map(function(cell) { return cellValue(board, cell) % 2; });
                var checkerboard = parity[0] !== parity[1] && parity[0] !== parity[2] &&
                    parity[0] === parity[3] && parity[1] === parity[2];
                return !checkerboard;
            }
            return true;
        }
    });

    registerConstraint("skyscrapers", {
        validatePartial: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var tallest = 0;
            var visible = 0;
            values.forEach(function(value) {
                if (value > tallest) {
                    tallest = value;
                    visible++;
                }
            });
            return visible === sightline.clue;
        }
    });

    registerConstraint("sandwiches", {
        validatePartial: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            var low = 1;
            var high = 6;
            for (var first = 0; first < values.length; first++) {
                for (var second = first + 1; second < values.length; second++) {
                    var endpointsFit =
                        (!values[first] || values[first] === low || values[first] === high) &&
                        (!values[second] || values[second] === low || values[second] === high) &&
                        (!values[first] || !values[second] || values[first] !== values[second]);
                    if (!endpointsFit) continue;

                    var outsideHasEndpoint = values.some(function(value, index) {
                        return index !== first && index !== second && (value === low || value === high);
                    });
                    if (outsideHasEndpoint) continue;

                    var sum = 0;
                    var open = 0;
                    for (var index = first + 1; index < second; index++) {
                        if (values[index]) sum += values[index];
                        else open++;
                    }
                    if (sum <= sightline.clue && sum + (open * SIZE) >= sightline.clue) {
                        return true;
                    }
                }
            }
            return false;
        },
        validateComplete: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            var first = values.indexOf(1);
            var second = values.indexOf(6);
            if (first < 0 || second < 0) return false;
            var start = Math.min(first, second) + 1;
            var end = Math.max(first, second);
            var sum = 0;
            for (var index = start; index < end; index++) sum += values[index];
            return sum === sightline.clue;
        }
    });

    registerConstraint("uniqueRectangles", {
        validatePartial: function(board) {
            for (var firstRow = 0; firstRow < SIZE - 1; firstRow++) {
                for (var secondRow = firstRow + 1; secondRow < SIZE; secondRow++) {
                    for (var firstCol = 0; firstCol < SIZE - 1; firstCol++) {
                        for (var secondCol = firstCol + 1; secondCol < SIZE; secondCol++) {
                            var values = [
                                board[firstRow][firstCol], board[firstRow][secondCol],
                                board[secondRow][firstCol], board[secondRow][secondCol]
                            ];
                            if (values.some(function(value) { return !value; })) continue;
                            var distinct = {};
                            values.forEach(function(value) { distinct[value] = true; });
                            if (Object.keys(distinct).length === 2) return false;
                        }
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("wildcards", {
        validatePartial: function(board, clue) {
            var SIZE = board.length;
            var maxLessThan = 0;
            var minGreaterThan = SIZE + 1;
            for (var index = 0; index < clue.length; index++) {
                var value = cellValue(board, clue[index].cell);
                if (!value) continue;
                if (clue[index].sign === "<") {
                    maxLessThan = Math.max(maxLessThan, value);
                } else if (clue[index].sign === ">") {
                    minGreaterThan = Math.min(minGreaterThan, value);
                }
            }
            return maxLessThan <= minGreaterThan - 2;
        }
    });

    registerConstraint("inequalityTriples", {
        validatePartial: function(board) {
            if (SIZE !== 9) return false;
            function sameDirection(pairs) {
                var direction = 0;
                for (var index = 0; index < pairs.length; index++) {
                    var first = cellValue(board, pairs[index][0]);
                    var second = cellValue(board, pairs[index][1]);
                    if (!first || !second) continue;
                    var current = first < second ? -1 : 1;
                    if (direction && current !== direction) return false;
                    direction = current;
                }
                return true;
            }
            for (var boxRow = 0; boxRow < 3; boxRow++) {
                for (var boundaryCol = 0; boundaryCol < 2; boundaryCol++) {
                    var verticalPairs = [];
                    for (var rowOffset = 0; rowOffset < 3; rowOffset++) {
                        verticalPairs.push([
                            { row: boxRow * 3 + rowOffset, col: boundaryCol * 3 + 2 },
                            { row: boxRow * 3 + rowOffset, col: boundaryCol * 3 + 3 }
                        ]);
                    }
                    if (!sameDirection(verticalPairs)) return false;
                }
            }
            for (var boundaryRow = 0; boundaryRow < 2; boundaryRow++) {
                for (var boxCol = 0; boxCol < 3; boxCol++) {
                    var horizontalPairs = [];
                    for (var colOffset = 0; colOffset < 3; colOffset++) {
                        horizontalPairs.push([
                            { row: boundaryRow * 3 + 2, col: boxCol * 3 + colOffset },
                            { row: boundaryRow * 3 + 3, col: boxCol * 3 + colOffset }
                        ]);
                    }
                    if (!sameDirection(horizontalPairs)) return false;
                }
            }
            return true;
        }
    });

    registerConstraint("offsetStarts", {
        validatePartial: function(board, starts) {
            var SIZE = board.length;
            for (var index = 0; index < starts.length; index++) {
                var cell = starts[index];
                if (cell.row + 1 >= SIZE || cell.col + 1 >= SIZE) continue;
                var nVal = cellValue(board, { row: cell.row, col: cell.col + 1 });
                if (!nVal) continue;
                var cellVal = cellValue(board, cell);
                var targetVal = cellValue(board, { row: cell.row + 1, col: nVal - 1 });
                if (cellVal && targetVal && cellVal !== targetVal) return false;
            }
            return true;
        }
    });







    registerConstraint("oneKnightStep", {
        validatePartial: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            var SIZE = board.length;
            var knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            for (var index = 0; index < starts.length; index++) {
                var cell = starts[index];
                var cellVal = cellValue(board, cell);
                if (!cellVal) continue;
                var matchCount = 0;
                var emptyCount = 0;
                for (var i = 0; i < knightOffsets.length; i++) {
                    var r = cell.row + knightOffsets[i][0];
                    var c = cell.col + knightOffsets[i][1];
                    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
                        var kVal = cellValue(board, { row: r, col: c });
                        if (!kVal) emptyCount++;
                        else if (kVal === cellVal) matchCount++;
                    }
                }
                if (matchCount > 1) return false;
                if (matchCount === 0 && emptyCount === 0) return false;
            }
            return true;
        },
        validateComplete: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            var SIZE = board.length;
            var knightOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
            for (var index = 0; index < starts.length; index++) {
                var cell = starts[index];
                var cellVal = cellValue(board, cell);
                var matchCount = 0;
                for (var i = 0; i < knightOffsets.length; i++) {
                    var r = cell.row + knightOffsets[i][0];
                    var c = cell.col + knightOffsets[i][1];
                    if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
                        if (cellValue(board, { row: r, col: c }) === cellVal) matchCount++;
                    }
                }
                if (matchCount !== 1) return false;
            }
            return true;
        }
    });

    registerConstraint("repeatedNeighbors", {
        validatePartial: function(board, shaded) {
            if (!shaded) return true;
            if (!Array.isArray(shaded)) shaded = [shaded];
            var SIZE = board.length;
            var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var isShaded = false;
                    for (var i = 0; i < shaded.length; i++) {
                        if (shaded[i].row === r && shaded[i].col === c) {
                            isShaded = true;
                            break;
                        }
                    }
                    var counts = {};
                    var emptyCount = 0;
                    for (var i = 0; i < offsets.length; i++) {
                        var nr = r + offsets[i][0];
                        var nc = c + offsets[i][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var v = cellValue(board, {row: nr, col: nc});
                            if (!v) emptyCount++;
                            else counts[v] = (counts[v] || 0) + 1;
                        }
                    }
                    var hasDuplicate = Object.keys(counts).some(function(k) { return counts[k] > 1; });
                    if (isShaded && emptyCount === 0 && !hasDuplicate) return false;
                    if (!isShaded && hasDuplicate) return false;
                }
            }
            return true;
        },
        validateComplete: function(board, shaded) {
            if (!shaded) return true;
            if (!Array.isArray(shaded)) shaded = [shaded];
            var SIZE = board.length;
            var offsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var isShaded = false;
                    for (var i = 0; i < shaded.length; i++) {
                        if (shaded[i].row === r && shaded[i].col === c) {
                            isShaded = true;
                            break;
                        }
                    }
                    var counts = {};
                    for (var i = 0; i < offsets.length; i++) {
                        var nr = r + offsets[i][0];
                        var nc = c + offsets[i][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var v = cellValue(board, {row: nr, col: nc});
                            counts[v] = (counts[v] || 0) + 1;
                        }
                    }
                    var hasDuplicate = Object.keys(counts).some(function(k) { return counts[k] > 1; });
                    if (isShaded && !hasDuplicate) return false;
                    if (!isShaded && hasDuplicate) return false;
                }
            }
            return true;
        }
    });

    registerConstraint("escapeStarts", {
        validatePartial: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            var SIZE = board.length;
            for (var i = 0; i < starts.length; i++) {
                var startCell = starts[i];
                var startVal = cellValue(board, startCell);

                var visited = new Set();
                var queue = [{r: startCell.row, c: startCell.col, expected: startVal}];
                visited.add(startCell.row + "," + startCell.col + "," + startVal);

                var reachable = false;
                var head = 0;
                while (head < queue.length) {
                    var curr = queue[head++];

                    if (curr.expected === 1 || curr.expected === null || curr.expected === undefined) {
                        var edgeVal = cellValue(board, {row: curr.r, col: curr.c});
                        if ((!edgeVal || edgeVal === 1) &&
                            (curr.r === 0 || curr.r === SIZE - 1 || curr.c === 0 || curr.c === SIZE - 1)) {
                            reachable = true;
                            break;
                        }
                    }

                    if (curr.expected === 1) continue;

                    var nextExpected = (curr.expected !== null && curr.expected !== undefined) ? curr.expected - 1 : null;

                    var neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                    for (var j = 0; j < neighbors.length; j++) {
                        var nr = curr.r + neighbors[j][0];
                        var nc = curr.c + neighbors[j][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var nVal = cellValue(board, {row: nr, col: nc});
                            var valid = false;
                            var newExpected = null;
                            if (nextExpected !== null) {
                                if (!nVal || nVal === nextExpected) {
                                    valid = true;
                                    newExpected = nextExpected;
                                }
                            } else {
                                valid = true;
                                newExpected = nVal ? nVal : null;
                            }

                            if (valid) {
                                var key = nr + "," + nc + "," + newExpected;
                                if (!visited.has(key)) {
                                    visited.add(key);
                                    queue.push({r: nr, c: nc, expected: newExpected});
                                }
                            }
                        }
                    }
                }

                if (!reachable) return false;
            }
            return true;
        },
        validateComplete: function(board, starts) {
            if (!starts) return true;
            if (!Array.isArray(starts)) starts = [starts];
            if (!starts.length) return true;
            var SIZE = board.length;

            var allPaths = [];
            for (var i = 0; i < starts.length; i++) {
                var startCell = starts[i];
                var pathsForStart = [];

                function dfs(r, c, currentPath) {
                    currentPath.push(r + "," + c);
                    var val = cellValue(board, {row: r, col: c});

                    if (val === 1) {
                        if (r === 0 || r === SIZE - 1 || c === 0 || c === SIZE - 1) {
                            pathsForStart.push(currentPath.slice());
                        }
                    } else {
                        var neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                        for (var j = 0; j < neighbors.length; j++) {
                            var nr = r + neighbors[j][0];
                            var nc = c + neighbors[j][1];
                            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                                var nVal = cellValue(board, {row: nr, col: nc});
                                if (nVal === val - 1) {
                                    dfs(nr, nc, currentPath);
                                }
                            }
                        }
                    }
                    currentPath.pop();
                }

                dfs(startCell.row, startCell.col, []);
                if (pathsForStart.length === 0) return false;
                allPaths.push(pathsForStart);
            }

            function backtrack(index, usedCells) {
                if (index === starts.length) return true;
                var paths = allPaths[index];
                for (var i = 0; i < paths.length; i++) {
                    var path = paths[i];
                    var conflict = false;
                    for (var j = 0; j < path.length; j++) {
                        if (usedCells.has(path[j])) {
                            conflict = true;
                            break;
                        }
                    }
                    if (!conflict) {
                        for (var j = 0; j < path.length; j++) {
                            usedCells.add(path[j]);
                        }
                        if (backtrack(index + 1, usedCells)) return true;
                        for (var j = 0; j < path.length; j++) {
                            usedCells.delete(path[j]);
                        }
                    }
                }
                return false;
            }

            return backtrack(0, new Set());
        }
    });

    registerConstraint("sameSumGroups", {
        validatePartial: function(board, groups) {
            var completedSum = null;
            for (var groupIndex = 0; groupIndex < groups.length; groupIndex++) {
                var values = groups[groupIndex].map(function(cell) { return cellValue(board, cell); });
                if (values.some(function(value) { return !value; })) continue;
                var sum = values.reduce(function(total, value) { return total + (board.isZeroEight ? value - 1 : value); }, 0);
                if (completedSum !== null && sum !== completedSum) return false;
                completedSum = sum;
            }
            return true;
        }
    });

    registerConstraint("sumskyscrapers", {
        validatePartial: function(board, sightline) {
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var tallest = 0;
            var visibleSum = 0;
            values.forEach(function(value) {
                if (value > tallest) {
                    tallest = value;
                    visibleSum += value;
                }
            });
            return visibleSum === sightline.clue;
        }
    });

    function sumSandwichSequence(board, sightline) {
        var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
        var sequence = [];
        for (var index = 1; index < values.length - 1; index++) {
            if (values[index] === values[index - 1] + values[index + 1]) {
                sequence.push(values[index]);
            }
        }
        return sequence;
    }

    registerConstraint("sumsandwiches", {
        validatePartial: function(board, sightline) {
            if (!Array.isArray(sightline.sequence) || sightline.sequence.some(function(value) {
                return !Number.isInteger(value) || value < 1 || value > SIZE;
            })) return false;
            var values = sightline.cells.map(function(cell) { return cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var actual = sumSandwichSequence(board, sightline);
            return actual.length === sightline.sequence.length && actual.every(function(value, index) {
                return value === sightline.sequence[index];
            });
        }
    });

    registerConstraint("diagonalAllDifferent", {
        validatePartial: function(board, diagonal) {
            var seen = 0;
            for (var i = 0; i < diagonal.length; i++) {
                var value = cellValue(board, diagonal[i]);
                if (!value) {
                    continue;
                }
                var bit = 1 << value;
                if (seen & bit) {
                    return false;
                }
                seen |= bit;
            }
            return true;
        }
    });

    registerConstraint("antiDiagonals", {
        validatePartial: function(board, diagonal) {
            var counts = {};
            var distinct = 0;
            for (var i = 0; i < diagonal.length; i++) {
                var value = cellValue(board, diagonal[i]);
                if (!value) {
                    continue;
                }
                if (!counts[value]) {
                    counts[value] = 0;
                    distinct++;
                }
                counts[value]++;
                if (distinct > 3 || counts[value] > 3) {
                    return false;
                }
            }
            return true;
        },
        validateComplete: function(board, diagonal) {
            var counts = {};
            for (var i = 0; i < diagonal.length; i++) {
                var value = cellValue(board, diagonal[i]);
                if (!value) {
                    return false;
                }
                counts[value] = (counts[value] || 0) + 1;
            }
            var values = Object.keys(counts);
            return values.length === 3 && values.every(function(value) {
                return counts[value] === 3;
            });
        }
    });

    function pairValuesDiffer(board, pair) {
        var first = cellValue(board, pair[0]);
        var second = cellValue(board, pair[1]);
        return !first || !second || first !== second;
    }


    registerConstraint("polePosition", {
        validatePartial: function(board, clue, helpers) {
            var targetDigit = board.isZeroEight ? 2 : 1;
            for (var r = 0; r < board.length; r++) {
                var firstInRow = board[r][0];
                if (firstInRow) {
                    var targetCol = board.isZeroEight ? firstInRow : firstInRow - 1;
                    if (targetCol >= 0 && targetCol < board[r].length) {
                        if (board[r][targetCol] && board[r][targetCol] !== targetDigit) return false;
                    }
                }
                for (var c = 0; c < board[r].length; c++) {
                    if (board[r][c] === targetDigit) {
                        var expectedFirst = board.isZeroEight ? c : c + 1;
                        if (firstInRow && firstInRow !== expectedFirst) return false;
                    }
                }
            }
            for (var c = 0; c < board[0].length; c++) {
                var firstInCol = board[0][c];
                if (firstInCol) {
                    var targetRow = board.isZeroEight ? firstInCol : firstInCol - 1;
                    if (targetRow >= 0 && targetRow < board.length) {
                        if (board[targetRow][c] && board[targetRow][c] !== targetDigit) return false;
                    }
                }
                for (var r = 0; r < board.length; r++) {
                    if (board[r][c] === targetDigit) {
                        var expectedFirst = board.isZeroEight ? r : r + 1;
                        if (firstInCol && firstInCol !== expectedFirst) return false;
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("citywalk", {
        validatePartial: function(board, clue) {
            var SIZE = board.length;
            var known = [];
            var available = {};

            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var val = cellValue(board, {row: r, col: c});
                    if (val >= 3 && val <= 7) {
                        known.push({row: r, col: c});
                        available[r + "," + c] = true;
                    } else if (!val) {
                        available[r + "," + c] = true;
                    }
                }
            }

            if (known.length === 0) return true;

            var visited = {};
            var queue = [known[0]];
            visited[known[0].row + "," + known[0].col] = true;
            var reachedKnown = 1;

            var head = 0;
            while (head < queue.length) {
                var curr = queue[head++];
                var neighbors = [
                    {row: curr.row - 1, col: curr.col},
                    {row: curr.row + 1, col: curr.col},
                    {row: curr.row, col: curr.col - 1},
                    {row: curr.row, col: curr.col + 1}
                ];

                for (var i = 0; i < neighbors.length; i++) {
                    var nr = neighbors[i].row;
                    var nc = neighbors[i].col;
                    var key = nr + "," + nc;

                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                        if (available[key] && !visited[key]) {
                            visited[key] = true;
                            queue.push(neighbors[i]);
                            var nVal = cellValue(board, neighbors[i]);
                            if (nVal >= 3 && nVal <= 7) {
                                reachedKnown++;
                            }
                        }
                    }
                }
            }

            return reachedKnown === known.length;
        }
    });

    registerConstraint("antiKing", {
        validatePartial: function(board, pair) {
            return pairValuesDiffer(board, pair);
        }
    });

    registerConstraint("chessKings", {
        validatePartial: function(board, item) {
            var pairs = item.pairs;
            var invalidPairs = new Set();
            var invalidSingles = new Set();
            for (var i = 0; i < pairs.length; i++) {
                var first = cellValue(board, pairs[i][0]);
                var second = cellValue(board, pairs[i][1]);
                if (first && second) {
                    if (first === second) {
                        invalidSingles.add(first);
                    } else {
                        var min = Math.min(first, second);
                        var max = Math.max(first, second);
                        invalidPairs.add(min + "-" + max);
                    }
                }
            }
            for (var x = 1; x <= SIZE; x++) {
                if (invalidSingles.has(x)) continue;
                for (var y = x + 1; y <= SIZE; y++) {
                    if (invalidSingles.has(y)) continue;
                    if (!invalidPairs.has(x + "-" + y)) {
                        return true;
                    }
                }
            }
            return false;
        }
    });

    registerConstraint("chessKings", {
        validatePartial: function(board, item) {
            var pairs = item.pairs;
            var invalidPairs = new Set();
            var invalidSingles = new Set();
            for (var i = 0; i < pairs.length; i++) {
                var first = cellValue(board, pairs[i][0]);
                var second = cellValue(board, pairs[i][1]);
                if (first && second) {
                    if (first === second) {
                        invalidSingles.add(first);
                    } else {
                        var min = Math.min(first, second);
                        var max = Math.max(first, second);
                        invalidPairs.add(min + "-" + max);
                    }
                }
            }
            for (var x = 1; x <= SIZE; x++) {
                if (invalidSingles.has(x)) continue;
                for (var y = x + 1; y <= SIZE; y++) {
                    if (invalidSingles.has(y)) continue;
                    if (!invalidPairs.has(x + "-" + y)) {
                        return true;
                    }
                }
            }
            return false;
        }
    });

    registerConstraint("sudokuwithstars", {
        validatePartial: function(board) {
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var cell = cellValue(board, { row: r, col: c });
                    if (cell !== 8 && cell !== 9) continue;
                    var offsets = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
                    for (var i = 0; i < offsets.length; i++) {
                        var nr = r + offsets[i][0];
                        var nc = c + offsets[i][1];
                        if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                            var ncell = cellValue(board, { row: nr, col: nc });
                            if (ncell === 8 || ncell === 9) return false;
                        }
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("starCellValues", {
        validatePartial: function(board, cell) {
            var val = cellValue(board, cell);
            if (!val) return true;
            return val === 8 || val === 9;
        }
    });

    registerConstraint("antiKnight", {
        validatePartial: function(board, pair) {
            return pairValuesDiffer(board, pair);
        }
    });

    registerConstraint("knightmare", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            if (!first || !second) return true;
            return first + second !== 5 && first + second !== 15;
        }
    });

    registerConstraint("disparity", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || (first % 2) !== (second % 2);
        }
    });

    registerConstraint("nonConsecutive", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || Math.abs(first - second) !== 1;
        }
    });

    registerConstraint("diagonalNonConsecutive", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || Math.abs(first - second) !== 1;
        }
    });

    registerConstraint("noEvenNeighbours", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return !first || !second || first % 2 || second % 2;
        }
    });

    registerConstraint("oddEvenSums", {
        validatePartial: function(board, clue) {
            var sum = 0;
            for (var index = 0; index < clue.cells.length; index++) {
                var value = cellValue(board, clue.cells[index]);
                if (!value) return true;
                sum += value;
            }
            return clue.parity === "odd" ? sum % 2 === 1 : sum % 2 === 0;
        }
    });

    registerConstraint("noThreeInRow", {
        validatePartial: function(board, cells) {
            var values = cells.map(function(cell) { return cellValue(board, cell); });
            return values.some(function(value) { return !value; }) ||
                !(values[0] % 2 === values[1] % 2 && values[1] % 2 === values[2] % 2);
        }
    });

    registerConstraint("queenDigits", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            return first !== SIZE || second !== SIZE;
        }
    });

    registerConstraint("pirateCells", {
        validatePartial: function(board, pair) {
            var first = cellValue(board, pair[0]);
            var second = cellValue(board, pair[1]);
            if (!first || !second) return true;
            if (first === 5 && second >= 6 && second <= 9) return false;
            if (second === 5 && first >= 6 && first <= 9) return false;
            return true;
        }
    });

    registerConstraint("touchyCells", {
        validatePartial: function(board, item) {
            var value = cellValue(board, item.cell);
            if (!value) return true;
            var open = false;
            for (var index = 0; index < item.neighbors.length; index++) {
                var neighbor = cellValue(board, item.neighbors[index]);
                if (!neighbor) open = true;
                else if (Math.abs(value - neighbor) === 1) return true;
            }
            return open;
        }
    });

    registerConstraint("unicorn", {
        validatePartial: function(board, item) {
            var value = cellValue(board, item.cell);
            if (value !== 9) return true;
            var seen = 0;
            for (var i = 0; i < item.neighbors.length; i++) {
                var nVal = cellValue(board, item.neighbors[i]);
                if (nVal) {
                    var bit = 1 << nVal;
                    if ((seen & bit) !== 0) return false;
                    seen |= bit;
                }
            }
            return true;
        }
    });



    registerConstraint("edgeRelations", {
        validatePartial: function(board, clue) {
            var first = cellValue(board, clue.cells[0]);
            var second = cellValue(board, clue.cells[1]);
            if (!first || !second) return true;
            var sum = (board.isZeroEight ? first - 1 : first) + (board.isZeroEight ? second - 1 : second);
            var difference = Math.abs(first - second);
            var product = (board.isZeroEight ? first - 1 : first) * (board.isZeroEight ? second - 1 : second);
            switch (clue.relation) {
                case "fives": return sum === 5 || difference === 5;
                case "notFives": return sum !== 5 && difference !== 5;
                case "difference": return difference === clue.target;
                case "oneortwodifferencepairs": return difference === 1 || difference === 2;
                case "sum": return sum === clue.target;
                case "product": return product === clue.target;
                case "tenspositionproducts": return Math.floor(product / 10) === clue.target;
                case "termination": return (sum % 10 === 0) || (product % 10 === 0);
                case "notTermination": return (sum % 10 !== 0) && (product % 10 !== 0);
                case "teneleven": return sum === 10 || sum === 11;
                case "notTenEleven": return sum !== 10 && sum !== 11;
                case "greater": return Math.max(first, second) === clue.target;
                case "lesser": return Math.min(first, second) === clue.target;
                case "consecutive": return difference === 1;
                case "notConsecutive": return difference !== 1;
                case "sumnine": return sum === 9;
                case "notSumnine": return sum !== 9;
                case "evenSum": return sum % 2 === 0;
                case "oddSum": return sum % 2 === 1;
                case "inequality": return clue.sign === "<" ? first < second : first > second;
                case "divisor":
                case "multiples": return clue.target > 0 && (first * 10 + second) % clue.target === 0;
                case "eitheror": return first === clue.target || second === clue.target;
                case "ratio":
                    var parts = clue.sign.split(":");
                    var x = parseInt(parts[0], 10);
                    var y = parseInt(parts[1], 10);
                    var v1 = board.isZeroEight ? first - 1 : first;
                    var v2 = board.isZeroEight ? second - 1 : second;
                    return (v1 * y === v2 * x) || (v1 * x === v2 * y);
                case "blocksumrelations":
                    var groupValues = (clue.groups || []).map(function(group) {
                        var values = group.map(function(cell) { return cellValue(board, cell); });
                        return values.some(function(value) { return !value; }) ? null :
                            values.reduce(function(total, value) { return total + (board.isZeroEight ? value - 1 : value); }, 0);
                    });
                    return groupValues.indexOf(null) !== -1 ||
                        (clue.sign === "<" ? groupValues[0] < groupValues[1] : groupValues[0] > groupValues[1]);
                case "xydifference":
                    var reference = cellValue(board, clue.reference);
                    return !reference || difference === reference;
                case "notXydifference":
                    var reference = cellValue(board, clue.reference);
                    return !reference || difference !== reference;
                case "perfectsquares": return [16, 25, 36, 49, 64, 81].indexOf(first * 10 + second) !== -1;
                case "notPerfectSquare": return [16, 25, 36, 49, 64, 81].indexOf(first * 10 + second) === -1;
                case "primesums":
                    var sum = (board.isZeroEight ? first - 1 : first) + (board.isZeroEight ? second - 1 : second);
                    return [2, 3, 5, 7, 11, 13, 17].indexOf(sum) !== -1;
                case "notPrimesums":
                    var sum = (board.isZeroEight ? first - 1 : first) + (board.isZeroEight ? second - 1 : second);
                    return [2, 3, 5, 7, 11, 13, 17].indexOf(sum) === -1;
                case "twodigitprimenumbers":
                    var val = first * 10 + second;
                    return [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97].indexOf(val) !== -1;
                case "notTwodigitprimenumbers":
                    var val = first * 10 + second;
                    return [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97].indexOf(val) === -1;
                case "diagonalConsecutive": return difference === 1;
                case "notDiagonalConsecutive": return difference !== 1;
                case "diagonalSumIsNine": return sum === 9;
                case "notDiagonalSumIsNine": return sum !== 9;
                case "diagonalTens": return sum === 10;
                case "notDiagonalTens": return sum !== 10;
                case "arithmetic":
                    return sum === clue.target || difference === clue.target || product === clue.target ||
                        (first % second === 0 && (board.isZeroEight ? first - 1 : first) / (board.isZeroEight ? second - 1 : second) === clue.target) ||
                        (second % first === 0 && (board.isZeroEight ? second - 1 : second) / (board.isZeroEight ? first - 1 : first) === clue.target);
            }
            return true;
        }
    });

    registerConstraint("directionalMarks", {
        validatePartial: function(board, clue) {
            var relation = clue.relation;
            var origin = clue.origin ? cellValue(board, clue.origin) : 0;
            var targetValues = (clue.targets || []).map(function(cell) { return cellValue(board, cell); });
            if (relation === "deadoralivearrows") {
                if (!origin) return true;
                if (clue.isWhite) {
                    return targetValues.every(function(value) { return !value || value !== origin; });
                } else {
                    var isComplete = targetValues.every(function(value) { return !!value; });
                    var hasMatch = targetValues.some(function(value) { return value === origin; });
                    return !isComplete || hasMatch;
                }
            }
            if (relation === "twindetector") {
                if (!origin) return true;
                var markedRays = {};
                (clue.rays || []).forEach(function(ray) {
                    if (ray.length) markedRays[ray[0].row + ":" + ray[0].col] = true;
                });
                return (clue.allRays || []).every(function(ray) {
                    if (!ray.length) return true;
                    var marked = !!markedRays[ray[0].row + ":" + ray[0].col];
                    var hasMatch = false, canMatch = false, sum = 0, blanks = 0;
                    for (var i = 0; i < ray.length; i++) {
                        var value = cellValue(board, ray[i]);
                        if (value) sum += value;
                        else blanks++;

                        if (sum === origin && blanks === 0) hasMatch = true;
                        if (sum + blanks <= origin && sum + blanks * SIZE >= origin && (blanks > 0 || sum === origin)) {
                            canMatch = true;
                        }
                    }
                    return marked ? canMatch : !hasMatch;
                });
            }
            if (relation === "eliminate") {
                return !origin || targetValues.every(function(value) { return !value || value !== origin; });
            }
            if (relation === "pointtonext" || relation === "pointtoprevious") {
                if (!origin) return true;
                var wanted = origin + (relation === "pointtonext" ? 1 : -1);
                if (wanted < 1 || wanted > SIZE) return false;
                return targetValues.some(function(value) { return !value || value === wanted; });
            }
            if (relation === "biggestneighbours") {
                var neighborValues = (clue.neighbors || []).map(function(cell) { return cellValue(board, cell); })
                    .filter(Boolean);
                return targetValues.every(function(value) {
                    return !value || neighborValues.every(function(neighbor) { return value >= neighbor; });
                });
            }
            if (relation === "smallestneighbours") {
                var allNeighborValues = (clue.neighbors || []).map(function(cell) { return cellValue(board, cell); })
                    .filter(Boolean);
                return targetValues.every(function(value) {
                    return !value || allNeighborValues.every(function(neighbor) { return value <= neighbor; });
                });
            }
            if (relation === "quadmax" || relation === "quadmin") {
                var target = cellValue(board, clue.target);
                if (!target) return true;
                return clue.cells.every(function(cell) {
                    var value = cellValue(board, cell);
                    if (!value || (cell.row === clue.target.row && cell.col === clue.target.col)) return true;
                    return relation === "quadmax" ? target > value : target < value;
                });
            }
            if (relation === "search6" || relation === "search9") {
                if (!origin) return true;
                return (clue.rays || []).every(function(ray) {
                    if (origin > ray.length) return false;
                    for (var distance = 1; distance <= origin; distance++) {
                        var value = cellValue(board, ray[distance - 1]);
                        if (value === clue.searchDigit) return distance === origin;
                        if (!value) return true;
                    }
                    return false;
                });
            }
            if (relation === "sumdetector") {
                if (!origin) return true;
                return (clue.rays || []).every(function(ray) {
                    var sum = 0;
                    for (var index = 0; index < ray.length; index++) {
                        var value = cellValue(board, ray[index]);
                        if (!value) return sum < origin;
                        sum += value;
                        if (sum === origin) return true;
                        if (sum > origin) return false;
                    }
                    return false;
                });
            }
            if (relation === "detection") {
                if (!origin) return true;
                var markedRays = {};
                (clue.rays || []).forEach(function(ray) {
                    if (ray.length) markedRays[ray[0].row + ":" + ray[0].col] = true;
                });
                return (clue.allDiagonalRays || []).every(function(ray) {
                    if (!ray.length) return true;
                    var marked = !!markedRays[ray[0].row + ":" + ray[0].col];
                    var hasMatch = false, hasBlank = false;
                    ray.forEach(function(cell) {
                        var value = cellValue(board, cell);
                        if (!value) hasBlank = true;
                        else if (value === origin) hasMatch = true;
                    });
                    return marked ? hasMatch || hasBlank : !hasMatch;
                });
            }
            return true;
        }
    });

    registerConstraint("sumDetectorGroups", {
        validatePartial: function(board, group) {
            var rays = [];
            (group.clues || []).forEach(function(clue) {
                (clue.rays || []).forEach(function(ray) { rays.push({ origin: clue.origin, cells: ray }); });
            });
            if (!rays.length) return true;
            for (var n = 1; n <= SIZE; n++) {
                var commonNWorks = rays.every(function(ray) {
                    if (ray.cells.length < n) return false;
                    var target = cellValue(board, ray.origin);
                    var sum = 0, blanks = 0;
                    for (var index = 0; index < n; index++) {
                        var value = cellValue(board, ray.cells[index]);
                        if (value) sum += value;
                        else blanks++;
                    }
                    if (target) return sum + blanks <= target && sum + blanks * SIZE >= target &&
                        (blanks > 0 || sum === target);
                    return sum + blanks <= SIZE;
                });
                if (commonNWorks) return true;
            }
            return false;
        }
    });

    registerConstraint("codedGroups", {
        validatePartial: function(board, clue) {
            var used = {};
            for (var groupIndex = 0; groupIndex < clue.groups.length; groupIndex++) {
                var values = clue.groups[groupIndex].map(function(cell) { return cellValue(board, cell); }).filter(Boolean);
                if (values.some(function(value) { return value !== values[0]; })) return false;
                if (values.length) {
                    if (used[values[0]]) return false;
                    used[values[0]] = true;
                }
            }
            return true;
        }
    });

    registerConstraint("pencilmarkCells", {
        validatePartial: function(board, clue) {
            var value = cellValue(board, clue.cell);
            return !value || clue.allowed.indexOf(value) !== -1;
        }
    });

    registerConstraint("symmetricUnequal", {
        validatePartial: function(board, pair) {
            return pairValuesDiffer(board, pair);
        }
    });

    registerConstraint("stretchedThermos", {
        validatePartial: function(board, path) {
            for (var index = 1; index < path.length; index++) {
                var previous = cellValue(board, path[index - 1]);
                var current = cellValue(board, path[index]);
                if (previous && current && previous > current) return false;
            }
            return true;
        }
    });

    registerConstraint("productKillers", {
        validatePartial: function(board, cage) {
            var seen = {};
            var product = 1;
            var blanks = 0;
            for (var index = 0; index < cage.cells.length; index++) {
                var value = cellValue(board, cage.cells[index]);
                if (!value) { blanks++; continue; }
                if (seen[value]) return false;
                seen[value] = true;
                product *= value;
            }
            if (!cage.total || product > cage.total || cage.total % product !== 0) return false;
            return blanks > 0 || product === cage.total;
        },
        validateComplete: function(board, cage) {
            return cage.cells.reduce(function(product, cell) { return product * cellValue(board, cell); }, 1) === cage.total;
        }
    });

    registerConstraint("sumOrProductKillers", {
        validatePartial: function(board, cage) {
            var sum = 0;
            var product = 1;
            var blanks = 0;
            for (var index = 0; index < cage.cells.length; index++) {
                var value = cellValue(board, cage.cells[index]);
                if (!value) { blanks++; continue; }
                sum += value;
                product *= value;
            }
            if (!cage.total) return true;
            var minSum = sum + blanks * 1;
            var maxSum = sum + blanks * SIZE;
            var minProduct = product * 1;
            var maxProduct = product * Math.pow(SIZE, blanks);
            var possibleSum = cage.total >= minSum && cage.total <= maxSum;
            var possibleProduct = cage.total >= minProduct && cage.total <= maxProduct && (blanks > 0 ? cage.total % product === 0 : cage.total === product);
            return possibleSum || possibleProduct;
        },
        validateComplete: function(board, cage) {
            if (!cage.total) return true;
            var sum = 0;
            var product = 1;
            for (var index = 0; index < cage.cells.length; index++) {
                var value = cellValue(board, cage.cells[index]);
                sum += value;
                product *= value;
            }
            return sum === cage.total || product === cage.total;
        }
    });

    registerConstraint("tableauxCages", {
        validatePartial: function(board, cage) {
            var seen = {};
            for (var i = 0; i < cage.cells.length; i++) {
                var value = cellValue(board, cage.cells[i]);
                if (value) {
                    if (seen[value]) return false;
                    seen[value] = true;
                }
            }
            for (var j = 0; j < cage.cells.length; j++) {
                var cell1 = cage.cells[j];
                var val1 = cellValue(board, cell1);
                if (!val1) continue;
                for (var k = j + 1; k < cage.cells.length; k++) {
                    var cell2 = cage.cells[k];
                    var val2 = cellValue(board, cell2);
                    if (!val2) continue;
                    if (cell1.row === cell2.row && cell1.col < cell2.col) {
                        if (val1 >= val2) return false;
                    }
                    if (cell1.col === cell2.col && cell1.row < cell2.row) {
                        if (val1 >= val2) return false;
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("soloKillerGroups", {
        validatePartial: function(board, cages) {
            var target = 0;
            var summaries = cages.map(function(cage) {
                var values = cage.map(function(cell) { return cellValue(board, cell); });
                return { sum: values.reduce(function(sum, value) { return sum + value; }, 0),
                    blanks: values.filter(function(value) { return !value; }).length };
            });
            summaries.forEach(function(summary) { if (!summary.blanks) target = target || summary.sum; });
            return summaries.every(function(summary) {
                if (!target) return true;
                return summary.sum <= target && summary.sum + summary.blanks * SIZE >= target &&
                    (summary.blanks > 0 || summary.sum === target);
            });
        },
        validateComplete: function(board, cages) {
            var sums = cages.map(function(cage) {
                return cage.reduce(function(sum, cell) { return sum + cellValue(board, cell); }, 0);
            });
            return sums.every(function(sum) { return sum === sums[0]; });
        }
    });

    function checkSumsSequence(values, clueSequence, variant, axis) {
        var memo = {};

        function search(index, clueIndex, currentSum) {
            if (index === values.length) {
                if (currentSum > 0) {
                    if (clueIndex < clueSequence.length && currentSum === clueSequence[clueIndex]) {
                        clueIndex++;
                    } else {
                        return false;
                    }
                }
                return clueIndex === clueSequence.length;
            }

            var state = index + "," + clueIndex + "," + currentSum;
            if (memo[state] !== undefined) return memo[state];

            var v = values[index];
            var possibleValues = v ? [v] : [1, 2, 3, 4, 5, 6, 7, 8, 9];

            for (var i = 0; i < possibleValues.length; i++) {
                var val = possibleValues[i];
                var canBeValid = false;
                var canBeSeparator = false;

                if (variant === "oddsums") {
                    if (val % 2 === 1) canBeValid = true;
                    else canBeSeparator = true;
                } else if (variant === "japanesesums") {
                    canBeValid = true;
                    canBeSeparator = true;
                } else if (variant === "bigsmalljapanesesums") {
                    if (axis === "column") {
                        if (val >= 5 && val <= 9) canBeValid = true;
                        else if (val >= 1 && val <= 4) canBeSeparator = true;
                    } else if (axis === "row") {
                        if (val >= 1 && val <= 4) canBeValid = true;
                        else if (val >= 5 && val <= 9) canBeSeparator = true;
                    }
                }

                if (canBeSeparator) {
                    if (currentSum > 0) {
                        if (clueIndex < clueSequence.length && currentSum === clueSequence[clueIndex]) {
                            if (search(index + 1, clueIndex + 1, 0)) return memo[state] = true;
                        }
                    } else {
                        if (search(index + 1, clueIndex, 0)) return memo[state] = true;
                    }
                }

                if (canBeValid) {
                    var newSum = currentSum + val;
                    if (clueIndex < clueSequence.length && newSum <= clueSequence[clueIndex]) {
                        if (search(index + 1, clueIndex, newSum)) return memo[state] = true;
                    }
                }
            }
            return memo[state] = false;
        }

        return search(0, 0, 0);
    }
    registerConstraint("outsideRelations", {
        validatePartial: function(board, clue) {
            if (clue.relation === "mastermind") {
                var dimensions = boxDimensions(SIZE);
                var centerTriplet = clue.cells.map(function(cell) {
                    var r = cell.row, c = cell.col;
                    r = r < dimensions.height ? r + dimensions.height : (r >= SIZE - dimensions.height ? r - dimensions.height : r);
                    c = c < dimensions.width ? c + dimensions.width : (c >= SIZE - dimensions.width ? c - dimensions.width : c);
                    return { row: r, col: c };
                });
                var cornerValues = clue.cells.map(function(cell) { return cellValue(board, cell); });
                var centerValues = centerTriplet.map(function(cell) { return cellValue(board, cell); });

                if (cornerValues.some(function(v) { return !v; }) || centerValues.some(function(v) { return !v; })) {
                    return true;
                }

                var blackCount = 0, whiteCount = 0, crossCount = 0;
                clue.clues.forEach(function(c) {
                    if (c === "black") blackCount++;
                    else if (c === "white") whiteCount++;
                    else if (c === "cross") crossCount++;
                });

                var actualBlack = 0;
                var actualWhite = 0;
                var cornerCounts = {};
                var centerCounts = {};
                for (var i = 0; i < cornerValues.length; i++) {
                    if (cornerValues[i] === centerValues[i]) {
                        actualBlack++;
                    } else {
                        cornerCounts[cornerValues[i]] = (cornerCounts[cornerValues[i]] || 0) + 1;
                        centerCounts[centerValues[i]] = (centerCounts[centerValues[i]] || 0) + 1;
                    }
                }

                Object.keys(cornerCounts).forEach(function(digit) {
                    actualWhite += Math.min(cornerCounts[digit], centerCounts[digit] || 0);
                });

                if (crossCount > 0) {
                    if (actualBlack > 0 || actualWhite > 0) return false;
                } else {
                    if (actualBlack !== blackCount || actualWhite !== whiteCount) return false;
                }
                return true;
            }
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            if (clue.relation === "positionsums") {
                var hasFirstTwoSum = Number.isInteger(clue.firstTwoSum);
                var hasIndexedDigitsSum = Number.isInteger(clue.indexedDigitsSum);
                if ((!hasFirstTwoSum && !hasIndexedDigitsSum) || values.length < 2) return false;
                var positionA = values[0];
                var positionB = values[1];
                if (!positionA || !positionB) return true;
                if (hasFirstTwoSum && positionA + positionB !== clue.firstTwoSum) return false;
                if (!hasIndexedDigitsSum) return true;
                if (positionA > values.length || positionB > values.length) return false;
                var digitAtA = values[positionA - 1];
                var digitAtB = values[positionB - 1];
                return !digitAtA || !digitAtB || digitAtA + digitAtB === clue.indexedDigitsSum;
            }
            if (clue.relation === "xaverage") {
                var averageLength = values[0];
                if (!averageLength) return true;
                if (averageLength > values.length) return false;
                var averageValues = values.slice(0, averageLength);
                var averageSum = averageValues.reduce(function(total, value) { return total + value; }, 0);
                var averageBlanks = averageValues.filter(function(value) { return !value; }).length;
                var averageTarget = clue.value * averageLength;
                return averageSum + averageBlanks <= averageTarget &&
                    averageSum + averageBlanks * SIZE >= averageTarget &&
                    (averageBlanks > 0 || averageSum === averageTarget);
            }
            if (clue.relation === "triplesum") {
                if (values.some(function(value) { return !value; })) return true;
                var firstPart = Number(values.slice(0, 4).join(""));
                var secondPart = Number(values.slice(4, 7).join(""));
                var thirdPart = Number(values.slice(7, 9).join(""));
                return firstPart + secondPart + thirdPart === clue.value;
            }
            if (clue.relation === "partitionedsums") {
                function canPartitionSums(values, expectedSums) {
                    function solve(valIndex, sumIndex) {
                        if (sumIndex === expectedSums.length) {
                            return valIndex === values.length;
                        }
                        if (valIndex >= values.length) {
                            return false;
                        }
                        var currentSum = 0;
                        var hasBlanks = false;
                        var maxPossibleSum = 0;
                        for (var i = valIndex; i < values.length; i++) {
                            if (values[i] === 0) {
                                hasBlanks = true;
                                maxPossibleSum += 9;
                            } else {
                                currentSum += values[i];
                                maxPossibleSum += values[i];
                            }
                            if (!hasBlanks && currentSum > expectedSums[sumIndex]) {
                                break;
                            }
                            if (hasBlanks && maxPossibleSum >= expectedSums[sumIndex] && currentSum <= expectedSums[sumIndex]) {
                                if (solve(i + 1, sumIndex + 1)) return true;
                            } else if (!hasBlanks && currentSum === expectedSums[sumIndex]) {
                                if (solve(i + 1, sumIndex + 1)) return true;
                            }
                        }
                        return false;
                    }
                    return solve(0, 0);
                }
                return canPartitionSums(values, clue.value);
            }
            if (clue.relation === "numberedrooms") {
                var room = values[0];
                return !room || room > values.length || !values[room - 1] || values[room - 1] === clue.value;
            }
            if (clue.relation === "oddsums" || clue.relation === "japanesesums" || clue.relation === "bigsmalljapanesesums") {
                var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
                return checkSumsSequence(values, clue.value, clue.relation, clue.axis);
            }
            if (clue.relation === "sumbyx") {
                var count = clue.targetX;
                if (!count || count > values.length) return !count;
                var prefix = values.slice(0, count);
                var sum = prefix.reduce(function(total, value) { return total + value; }, 0);
                var blanks = prefix.filter(function(value) { return !value; }).length;
                return sum <= clue.value && sum + blanks * SIZE >= clue.value && (blanks > 0 || sum === clue.value);
            }
            if (clue.relation === "xsums") {
                var count = values[0];
                if (!count || count > values.length) return !count;
                var prefix = values.slice(0, count);
                var sum = prefix.reduce(function(total, value) { return total + value; }, 0);
                var blanks = prefix.filter(function(value) { return !value; }).length;
                return sum <= clue.value && sum + blanks * SIZE >= clue.value && (blanks > 0 || sum === clue.value);
            }
            if (clue.relation === "bouncing x-sums") {
                var count = values[0];
                if (!count || count > values.length) return !count;
                var prefix = values.slice(0, count);
                var sum = prefix.reduce(function(total, value) { return total + value; }, 0);
                var blanks = prefix.filter(function(value) { return !value; }).length;
                return sum <= clue.value && sum + blanks * SIZE >= clue.value && (blanks > 0 || sum === clue.value);
            }
            if (clue.relation === "czech outsider") {
                var digits = String(clue.value).split("").map(Number).filter(function(d) { return d >= 1 && d <= SIZE; });
                var counts = {};
                digits.forEach(function(d) { counts[d] = (counts[d] || 0) + 1; });
                var blanks = values.filter(function(v) { return !v; }).length;
                for (var d in counts) {
                    var targetCount = counts[d];
                    var currentCount = values.filter(function(v) { return v === Number(d); }).length;
                    if (currentCount + blanks < targetCount) return false;
                    if (blanks === 0 && currentCount < targetCount) return false;
                }
                return true;
            }
            if (clue.relation === "distances") {
                var x = clue.value.x;
                var y = clue.value.y;
                var z = clue.value.z;
                var idxX = values.indexOf(x);
                var idxY = values.indexOf(y);
                if (idxX !== -1 && idxY !== -1) {
                    if (idxX >= idxY) return false;
                    return idxY - idxX === z;
                }
                if (idxX !== -1 && idxY === -1) {
                    var expectedIdxY = idxX + z;
                    if (expectedIdxY >= values.length) return false;
                    var valAtExpected = values[expectedIdxY];
                    return !valAtExpected || valAtExpected === y;
                }
                if (idxY !== -1 && idxX === -1) {
                    var expectedIdxX = idxY - z;
                    if (expectedIdxX < 0) return false;
                    var valAtExpected = values[expectedIdxX];
                    return !valAtExpected || valAtExpected === x;
                }
                if (idxX === -1 && idxY === -1) {
                    var possible = false;
                    for (var i = 0; i < values.length - z; i++) {
                        if ((!values[i] || values[i] === x) && (!values[i + z] || values[i + z] === y)) {
                            possible = true;
                            break;
                        }
                    }
                    return possible;
                }
                return true;
            }
            if (clue.relation === "sumframe" || clue.relation === "framediagonal") {
                var frameSum = values.reduce(function(total, value) { return total + (board.isZeroEight ? value - 1 : value); }, 0);
                var frameBlanks = values.filter(function(value) { return !value; }).length;
                return frameSum <= clue.value && frameSum + frameBlanks * SIZE >= clue.value &&
                    (frameBlanks > 0 || frameSum === clue.value);
            }
            if (clue.relation === "oddevenbigsmall") {
                if (board.length !== 8) return false;
                var val = String(clue.value).replace(/\s+/g, "");
                if (val.length !== 1 || !["O", "E", "B", "S"].includes(val.toUpperCase())) return false;
                var c = val.toUpperCase();
                for (var i = 0; i < Math.min(2, values.length); i++) {
                    var v = values[i];
                    if (!v) continue;
                    if (c === "O" && v % 2 !== 1) return false;
                    if (c === "E" && v % 2 !== 0) return false;
                    if (c === "B" && v <= 4) return false;
                    if (c === "S" && v > 4) return false;
                }
                return true;
            }
            if (clue.relation === "firstseenoddeven") {
                var isOddClue = (clue.value % 2) !== 0;
                for (var i = 0; i < values.length; i++) {
                    var v = values[i];
                    if (!v) break;
                    var isOddVal = (v % 2) !== 0;
                    if (isOddVal === isOddClue) {
                        return v === clue.value;
                    }
                }
                var idxOfClue = values.indexOf(clue.value);
                if (idxOfClue !== -1) {
                    for (var i = 0; i < idxOfClue; i++) {
                        if (values[i] && ((values[i] % 2) !== 0) === isOddClue) {
                            return false;
                        }
                    }
                } else {
                    var hasMatchingParity = values.some(function(v) { return v && ((v % 2) !== 0) === isOddClue; });
                    if (hasMatchingParity) return false;
                    var noBlanks = values.every(function(v) { return v; });
                    if (noBlanks) return false;
                }
                return true;
            }
            if (clue.relation === "maxascending") {
                var maxGuaranteed = 0;
                var currentGuaranteed = 0;
                for (var i = 0; i < values.length; i++) {
                    if (i === 0 || (values[i] && values[i-1] && values[i] > values[i-1])) {
                        if (values[i]) {
                            currentGuaranteed++;
                        } else {
                            currentGuaranteed = 0;
                        }
                    } else {
                        if (currentGuaranteed > maxGuaranteed) maxGuaranteed = currentGuaranteed;
                        currentGuaranteed = values[i] ? 1 : 0;
                    }
                }
                if (currentGuaranteed > maxGuaranteed) maxGuaranteed = currentGuaranteed;
                if (maxGuaranteed > clue.value) return false;

                var maxPossible = 0;
                var currentPossible = 0;
                for (var i = 0; i < values.length; i++) {
                    if (i === 0 || !values[i] || !values[i-1] || values[i] > values[i-1]) {
                        currentPossible++;
                    } else {
                        if (currentPossible > maxPossible) maxPossible = currentPossible;
                        currentPossible = 1;
                    }
                }
                if (currentPossible > maxPossible) maxPossible = currentPossible;
                if (maxPossible < clue.value) return false;

                if (values.every(function(v) { return v; })) {
                    return maxGuaranteed === clue.value;
                }
                return true;
            }
            if (clue.relation === "bust") {
                if (clue.value < 1 || clue.value > values.length) return false;
                var running = 0;
                for (var index = 0; index < clue.value; index++) {
                    if (!values[index]) return true;
                    running += values[index];
                    if (index < clue.value - 1 && running > 21) return false;
                }
                return running > 21;
            }
            if (clue.relation === "starproduct") {
                var starValues = [];
                for (var st_i = 0; st_i < clue.cells.length; st_i++) {
                    var cell = clue.cells[st_i];
                    if (helpers.isStarCell(cell, clue.starCells)) {
                         starValues.push(values[st_i]);
                    }
                }
                var product = starValues.reduce(function(total, value) { return total * (value || 1); }, 1);
                var productOpen = starValues.filter(function(value) { return !value; }).length;
                return product <= clue.value && clue.value % product === 0 && (productOpen > 0 || product === clue.value);
            }
            if (clue.relation === "productframe") {
                var productValues = values.slice(0, 3);
                var product = productValues.reduce(function(total, value) { return total * (value || 1); }, 1);
                var productOpen = productValues.filter(function(value) { return !value; }).length;
                return product <= clue.value && clue.value % product === 0 && (productOpen > 0 || product === clue.value);
            }
            if (clue.relation === "edgedifference") {
                return !values[0] || !values[values.length - 1] ||
                    Math.abs(values[0] - values[values.length - 1]) === clue.value;
            }
            if (clue.relation === "outsideparity") {
                if (clue.value < 1 || clue.value >= values.length) return false;
                var parityPrefix = values.slice(0, clue.value);
                var assignedParity = parityPrefix.filter(Boolean);
                if (assignedParity.length > 1 && assignedParity.some(function(value) {
                    return value % 2 !== assignedParity[0] % 2;
                })) return false;
                return !values[clue.value] || !assignedParity.length ||
                    values[clue.value] % 2 !== assignedParity[0] % 2;
            }
            if (clue.relation === "parityparty") {
                function parityPrefixPossible(parity) {
                    var sum = 0;
                    for (var parityIndex = 0; parityIndex < values.length; parityIndex++) {
                        if (!values[parityIndex]) return sum < clue.value;
                        sum += values[parityIndex];
                        if (values[parityIndex] % 2 === parity) return sum === clue.value;
                        if (sum >= clue.value) return false;
                    }
                    return false;
                }
                return parityPrefixPossible(0) || parityPrefixPossible(1);
            }
            if (clue.relation === "serbianframe") {
                var serbianIndexes = clue.axis === "row" ? [1, 2] : [2, 3];
                var serbianValues = serbianIndexes.map(function(index) { return values[index]; });
                return serbianValues.some(function(value) { return !value; }) ||
                    serbianValues[0] + serbianValues[1] === clue.value;
            }
            if (clue.relation === "median") {
                var medianValues = values.slice(0, 3);
                return medianValues.some(function(value) { return !value; }) ||
                    medianValues.slice().sort(function(a, b) { return a - b; })[1] === clue.value;
            }
            if (clue.relation === "descriptivepairs") {
                var x = Math.floor(clue.value / 10), y = clue.value % 10;
                if (x < 1 || y < 1 || x > values.length || y > values.length) return false;
                var xAtY = !values[y - 1] || values[y - 1] === x;
                var yAtX = !values[x - 1] || values[x - 1] === y;
                if (!values[y - 1] || !values[x - 1]) return xAtY || yAtX;
                return values[y - 1] === x || values[x - 1] === y;
            }
            if (clue.relation === "outside" || clue.relation === "outside234") {
                var assignedOutside = values.filter(Boolean);
                return (clue.clues || []).every(function(value) {
                    return assignedOutside.indexOf(value) !== -1 || assignedOutside.length < values.length;
                }) && (assignedOutside.length < values.length || clue.clues.every(function(value) {
                    return assignedOutside.indexOf(value) !== -1;
                }));
            }
            if (clue.relation === "maximin" || clue.relation === "minimax") {
                var extrema = values.slice(0, 3);
                if (extrema.some(function(value) { return !value; })) return true;
                var highest = Math.max.apply(null, extrema), lowest = Math.min.apply(null, extrema);
                return clue.relation === "maximin" ? highest - lowest === clue.value : highest + lowest === clue.value;
            }
            if (clue.relation === "weighted little killer") {
                var wSum = 0, maxPossibleSum = 0;
                var hasBlanks = false;
                for (var i = 0; i < values.length; i++) {
                    var weight = clue.weights[i];
                    if (values[i]) {
                        wSum += values[i] * weight;
                        maxPossibleSum += values[i] * weight;
                    } else {
                        hasBlanks = true;
                        wSum += 1 * weight;
                        maxPossibleSum += SIZE * weight;
                    }
                }
                return wSum <= clue.value && maxPossibleSum >= clue.value && (hasBlanks || wSum === clue.value);
            }
            if (clue.relation === "little killer" || clue.relation === "product little killer") {
                if (clue.relation === "little killer") {
                    var littleSum = values.reduce(function(total, value) { return total + (board.isZeroEight ? value - 1 : value); }, 0);
                    var littleBlanks = values.filter(function(value) { return !value; }).length;
                    return littleSum <= clue.value && littleSum + littleBlanks * SIZE >= clue.value &&
                        (littleBlanks > 0 || littleSum === clue.value);
                }
                var littleProduct = values.reduce(function(total, value) { return total * (value || 1); }, 1);
                var productBlanks = values.filter(function(value) { return !value; }).length;
                return littleProduct <= clue.value && clue.value % littleProduct === 0 &&
                    (productBlanks > 0 || littleProduct === clue.value);
            }
            if (clue.relation === "evensandwich" || clue.relation === "oddsandwich") {
                var parity = clue.relation === "evensandwich" ? 0 : 1;
                var found = [];
                for (var sandwichIndex = 1; sandwichIndex < values.length - 1; sandwichIndex++) {
                    if (values[sandwichIndex - 1] && values[sandwichIndex] && values[sandwichIndex + 1] &&
                        values[sandwichIndex - 1] % 2 === parity && values[sandwichIndex + 1] % 2 === parity) {
                        found.push(values[sandwichIndex]);
                    }
                }
                var expected = (clue.clues || []).slice().sort(function(a, b) { return a - b; });
                found.sort(function(a, b) { return a - b; });
                for (var foundIndex = 0; foundIndex < found.length; foundIndex++) {
                    var expectedIndex = expected.indexOf(found[foundIndex]);
                    if (expectedIndex < 0) return false;
                    expected.splice(expectedIndex, 1);
                }
                return values.some(function(value) { return !value; }) || expected.length === 0;
            }
            if (clue.relation === "ascendingstarters") {
                var sum = 0;
                var prev = 0;
                var hasZero = false;
                for (var idx = 0; idx < values.length; idx++) {
                    var val = values[idx];
                    if (val === 0) {
                        hasZero = true;
                        break;
                    }
                    if (val > prev) {
                        sum += val;
                        prev = val;
                    } else {
                        break;
                    }
                }
                if (!hasZero) {
                    return sum === clue.value;
                }
                return sum <= clue.value;
            }
            if (clue.relation === "before9") {
                // Sum of all digits that appear before 9 in the row/column (left-to-right / top-to-bottom)
                var b9_idx = values.indexOf(9);
                if (b9_idx >= 0) {
                    // 9 is placed: sum everything before it exactly
                    var b9_sum = 0;
                    for (var b9_i = 0; b9_i < b9_idx; b9_i++) {
                        if (!values[b9_i]) return true; // blank before 9 – still possible
                        b9_sum += values[b9_i];
                    }
                    return b9_sum === clue.value;
                }
                // 9 not placed yet – check if any position for 9 is consistent with clue
                // When 9 is at position p, the sum of the p cells before it must equal clue.value
                for (var b9_p = 0; b9_p < values.length; b9_p++) {
                    if (values[b9_p] !== 0) continue; // only blank slots can receive 9
                    var b9_pre = 0, b9_blanks = 0;
                    for (var b9_j = 0; b9_j < b9_p; b9_j++) {
                        if (values[b9_j]) b9_pre += values[b9_j];
                        else b9_blanks++;
                    }
                    // blanks in prefix can each be 1-8 (not 9, since 9 is going to b9_p)
                    if (b9_pre + b9_blanks <= clue.value && b9_pre + b9_blanks * 8 >= clue.value) return true;
                }
                return false;
            }
            if (clue.relation === "position") {
                var pos = clue.value - 1; // 0, 1, or 2
                if (pos < 0 || pos > 2) return false;
                var other1 = (pos + 1) % 3;
                var other2 = (pos + 2) % 3;
                if (values[pos]) {
                    if (values[other1] && values[pos] <= values[other1]) return false;
                    if (values[other2] && values[pos] <= values[other2]) return false;
                } else {
                    if (values[other1] === 9 || values[other2] === 9) return false;
                }
                return true;
            }
            if (clue.relation === "sumnexttonine") {
                function isPossibleSumNextToNine(p) {
                    if (p === 0) {
                        var val = values[1];
                        if (val) return val === clue.value;
                        return clue.value >= 1 && clue.value <= 8;
                    }
                    if (p === 8) {
                        var val = values[7];
                        if (val) return val === clue.value;
                        return clue.value >= 1 && clue.value <= 8;
                    }
                    var v1 = values[p - 1];
                    var v2 = values[p + 1];
                    if (v1 && v2) return v1 + v2 === clue.value;
                    if (v1 && !v2) {
                        var needed = clue.value - v1;
                        return needed >= 1 && needed <= 8 && needed !== v1;
                    }
                    if (!v1 && v2) {
                        var needed = clue.value - v2;
                        return needed >= 1 && needed <= 8 && needed !== v2;
                    }
                    return clue.value >= 3 && clue.value <= 15;
                }
                var nine_idx = values.indexOf(9);
                if (nine_idx >= 0) {
                    return isPossibleSumNextToNine(nine_idx);
                }
                for (var p = 0; p < values.length; p++) {
                    if (values[p] !== 0) continue;
                    if (isPossibleSumNextToNine(p)) return true;
                }
                return false;
            }
            if (clue.relation === "wrongoutsidesum") {
                var prefix = values.slice(0, 3);
                var sum = prefix.reduce(function(t, v) { return t + v; }, 0);
                var blanks = prefix.filter(function(v) { return !v; }).length;
                if (blanks === 0) {
                    return Math.abs(sum - clue.value) === 1;
                }
                if (blanks === 1) {
                    var target1 = clue.value + 1 - sum;
                    var target2 = clue.value - 1 - sum;
                    function isValid(t) {
                        return t >= 1 && t <= 9 && prefix.indexOf(t) === -1;
                    }
                    return isValid(target1) || isValid(target2);
                }
                if (blanks === 2) {
                    var assignedVal = prefix.filter(Boolean)[0];
                    var targets = [clue.value + 1 - assignedVal, clue.value - 1 - assignedVal];
                    function canSumTo(t) {
                        for (var d1 = 1; d1 <= 9; d1++) {
                            if (d1 === assignedVal) continue;
                            var d2 = t - d1;
                            if (d2 >= 1 && d2 <= 9 && d2 !== d1 && d2 !== assignedVal) return true;
                        }
                        return false;
                    }
                    return canSumTo(targets[0]) || canSumTo(targets[1]);
                }
                if (blanks === 3) {
                    var targets = [clue.value + 1, clue.value - 1];
                    function canSumThree(t) {
                        for (var d1 = 1; d1 <= 9; d1++) {
                            for (var d2 = d1 + 1; d2 <= 9; d2++) {
                                var d3 = t - d1 - d2;
                                if (d3 > d2 && d3 <= 9) return true;
                            }
                        }
                        return false;
                    }
                    return canSumThree(targets[0]) || canSumThree(targets[1]);
                }
                return true;
            }
            if (clue.relation === "doublesandwich") {
                var p1_val = values.indexOf(1);
                var p5_val = values.indexOf(5);
                var p9_val = values.indexOf(9);
                var blanks = [];
                for (var i = 0; i < values.length; i++) {
                    if (values[i] === 0) blanks.push(i);
                }
                
                function checkPositions(pos1, pos5, pos9) {
                    var pos = [pos1, pos5, pos9].sort(function(a, b) { return a - b; });
                    var start = pos[0], end = pos[1];
                    var sum = 0, blankCount = 0;
                    for (var i = start + 1; i < end; i++) {
                        if (i === pos1 || i === pos5 || i === pos9) return false;
                        if (values[i] === 0) {
                            blankCount++;
                        } else {
                            sum += values[i];
                        }
                    }
                    if (blankCount === 0) return sum === clue.value;
                    return sum + blankCount * 2 <= clue.value && sum + blankCount * 8 >= clue.value;
                }

                var pos1_options = p1_val !== -1 ? [p1_val] : blanks;
                for (var i = 0; i < pos1_options.length; i++) {
                    var pos1 = pos1_options[i];
                    var pos5_options = p5_val !== -1 ? [p5_val] : blanks.filter(function(b) { return b !== pos1; });
                    for (var j = 0; j < pos5_options.length; j++) {
                        var pos5 = pos5_options[j];
                        var pos9_options = p9_val !== -1 ? [p9_val] : blanks.filter(function(b) { return b !== pos1 && b !== pos5; });
                        for (var k = 0; k < pos9_options.length; k++) {
                            var pos9 = pos9_options[k];
                            if (checkPositions(pos1, pos5, pos9)) return true;
                        }
                    }
                }
                return false;
            }
            if (clue.relation === "before1" || clue.relation === "after9") {
                var marker = clue.relation === "before1" ? 1 : 9;
                var markerIndex = values.indexOf(marker);
                if (markerIndex < 0) return true;
                var segmentStart = clue.relation === "before1" ? 0 : markerIndex + 1;
                var segmentEnd = clue.relation === "before1" ? markerIndex : values.length;
                var segmentSum = 0, segmentBlanks = 0;
                for (var segmentIndex = segmentStart; segmentIndex < segmentEnd; segmentIndex++) {
                    if (values[segmentIndex]) segmentSum += values[segmentIndex];
                    else segmentBlanks++;
                }
                if (!segmentBlanks) return segmentSum === clue.value;
                return segmentSum + segmentBlanks <= clue.value &&
                    segmentSum + segmentBlanks * SIZE >= clue.value;
            }
            if (clue.relation === "before1after9") {
                // Sum of digits BEFORE 1 OR AFTER 9, reading L→R / T→B.
                // The rule applies to whichever of {1,9} appears first in the row/col:
                //   if 1 comes first  → sum all digits before position of 1
                //   if 9 comes first  → sum all digits after  position of 9
                var b1a9_i1 = values.indexOf(1);
                var b1a9_i9 = values.indexOf(9);

                function b1a9_sumSlice(start, end) {
                    // Inclusive-exclusive slice [start,end); returns {sum, blanks}
                    var s = 0, bl = 0;
                    for (var ii = start; ii < end; ii++) {
                        if (values[ii]) s += values[ii];
                        else bl++;
                    }
                    return { sum: s, blanks: bl };
                }
                function b1a9_canEqual(s, bl) {
                    if (bl === 0) return s === clue.value;
                    return s + bl <= clue.value && s + bl * 8 >= clue.value;
                }

                if (b1a9_i1 >= 0 && b1a9_i9 >= 0) {
                    // Both placed: check whichever comes first
                    if (b1a9_i1 < b1a9_i9) {
                        var r1 = b1a9_sumSlice(0, b1a9_i1);
                        return b1a9_canEqual(r1.sum, r1.blanks);
                    } else {
                        var r9 = b1a9_sumSlice(b1a9_i9 + 1, values.length);
                        return b1a9_canEqual(r9.sum, r9.blanks);
                    }
                }
                // At least one of {1,9} is not placed – enumerate candidate positions
                var b1a9_possible = false;
                var p1_range = b1a9_i1 >= 0 ? [b1a9_i1] : values.map(function(_, ii) { return ii; }).filter(function(ii) { return values[ii] === 0; });
                var p9_range = b1a9_i9 >= 0 ? [b1a9_i9] : values.map(function(_, ii) { return ii; }).filter(function(ii) { return values[ii] === 0; });
                for (var pi = 0; pi < p1_range.length && !b1a9_possible; pi++) {
                    var pos1 = p1_range[pi];
                    for (var qi = 0; qi < p9_range.length && !b1a9_possible; qi++) {
                        var pos9 = p9_range[qi];
                        if (pos1 === pos9) continue;
                        if (pos1 < pos9) {
                            // 1 comes first: sum before pos1
                            var r = b1a9_sumSlice(0, pos1);
                            if (b1a9_canEqual(r.sum, r.blanks)) b1a9_possible = true;
                        } else {
                            // 9 comes first: sum after pos9
                            var r = b1a9_sumSlice(pos9 + 1, values.length);
                            if (b1a9_canEqual(r.sum, r.blanks)) b1a9_possible = true;
                        }
                    }
                }
                return b1a9_possible;
            }
            if (clue.relation === "innerframesum") {
                var inner_sum = 0, inner_blanks = 0;
                for (var inner_i = 1; inner_i <= 3; inner_i++) {
                    var val = values[inner_i];
                    if (val) inner_sum += val;
                    else inner_blanks++;
                }
                return inner_sum <= clue.value && inner_sum + inner_blanks * SIZE >= clue.value && (inner_blanks > 0 || inner_sum === clue.value);
            }
            if (clue.relation === "missingdigit") {
                var digits = String(clue.value).split("").map(Number).filter(function(d) { return d >= 1 && d <= SIZE; });
                for (var miss_i = 0; miss_i < 3; miss_i++) {
                    if (digits.indexOf(values[miss_i]) !== -1) return false;
                }
                return true;
            }
            if (clue.relation === "nextto9") {
                var digits = String(clue.value).split("").map(Number).filter(function(d) { return d >= 1 && d <= SIZE; });
                var nine_idx = values.indexOf(9);
                if (nine_idx >= 0) {
                    var neighborCells = [];
                    if (nine_idx > 0) neighborCells.push(values[nine_idx - 1]);
                    if (nine_idx < values.length - 1) neighborCells.push(values[nine_idx + 1]);
                    
                    var filledNeighbors = neighborCells.filter(Boolean);
                    for (var i = 0; i < filledNeighbors.length; i++) {
                        if (digits.indexOf(filledNeighbors[i]) === -1) return false;
                    }
                    
                    var uniqueFilled = [];
                    filledNeighbors.forEach(function(x) { if (uniqueFilled.indexOf(x) === -1) uniqueFilled.push(x); });
                    if (uniqueFilled.length > digits.length) return false;
                    
                    if (filledNeighbors.length === neighborCells.length) {
                        if (neighborCells.length !== digits.length) return false;
                        for (var i = 0; i < digits.length; i++) {
                            if (neighborCells.indexOf(digits[i]) === -1) return false;
                        }
                    }
                    return true;
                }
                for (var nine_p = 0; nine_p < values.length; nine_p++) {
                    if (values[nine_p] !== 0) continue;
                    var neighborCells = [];
                    if (nine_p > 0) neighborCells.push(values[nine_p - 1]);
                    if (nine_p < values.length - 1) neighborCells.push(values[nine_p + 1]);
                    if (neighborCells.length < digits.length) continue;
                    
                    var filledNeighbors = neighborCells.filter(Boolean);
                    var ok = true;
                    for (var i = 0; i < filledNeighbors.length; i++) {
                        if (digits.indexOf(filledNeighbors[i]) === -1) { ok = false; break; }
                    }
                    if (!ok) continue;
                    
                    var uniqueFilled = [];
                    filledNeighbors.forEach(function(x) { if (uniqueFilled.indexOf(x) === -1) uniqueFilled.push(x); });
                    if (uniqueFilled.length > digits.length) continue;
                    
                    if (filledNeighbors.length === neighborCells.length) {
                        if (neighborCells.length !== digits.length) continue;
                        var matchAll = true;
                        for (var i = 0; i < digits.length; i++) {
                            if (neighborCells.indexOf(digits[i]) === -1) { matchAll = false; break; }
                        }
                        if (!matchAll) continue;
                    }
                    return true;
                }
                return false;
            }
            if (clue.relation === "outsideconsecutive") {
                var min_consec = 0;
                var max_consec = 0;
                for (var c_i = 0; c_i < values.length - 1; c_i++) {
                    var a = values[c_i];
                    var b = values[c_i + 1];
                    if (a && b) {
                        if (Math.abs(a - b) === 1) {
                            min_consec++;
                            max_consec++;
                        }
                    } else {
                        max_consec++;
                    }
                }
                return clue.value >= min_consec && clue.value <= max_consec;
            }
            if (clue.relation === "outsidegreaterthan") {
                var min_greater = 0;
                var max_greater = 0;
                for (var g_i = 0; g_i < values.length - 1; g_i++) {
                    var a = values[g_i];
                    var b = values[g_i + 1];
                    if (a && b) {
                        if (a > b) {
                            min_greater++;
                            max_greater++;
                        }
                    } else {
                        max_greater++;
                    }
                }
                return clue.value >= min_greater && clue.value <= max_greater;
            }
            if (clue.relation === "outsidekiller") {
                var possible = false;
                for (var k_i = 0; k_i < values.length - 1; k_i++) {
                    var a = values[k_i];
                    var b = values[k_i + 1];
                    if (a && b) {
                        if (a + b === clue.value) { possible = true; break; }
                    } else if (a || b) {
                        var val = a || b;
                        var needed = clue.value - val;
                        if (needed >= 1 && needed <= SIZE && needed !== val) { possible = true; break; }
                    } else {
                        var minSum = 1 + 2;
                        var maxSum = SIZE + (SIZE - 1);
                        if (clue.value >= minSum && clue.value <= maxSum) { possible = true; break; }
                    }
                }
                return possible;
            }
            if (clue.relation === "parityskyscrapers") {
                if (values.indexOf(0) >= 0) return true;
                var visible = [];
                var maxVal = 0;
                for (var p_i = 0; p_i < values.length; p_i++) {
                    var val = values[p_i];
                    if (val > maxVal) {
                        visible.push(val);
                        maxVal = val;
                    }
                }
                var oddCount = visible.filter(function(v) { return v % 2 !== 0; }).length;
                var evenCount = visible.filter(function(v) { return v % 2 === 0; }).length;
                return clue.value === oddCount || clue.value === evenCount;
            }
            if (clue.relation === "pointingdifferents") {
                var uniqueVals = new Set(values.filter(Boolean));
                var blanks = values.filter(function(v) { return !v; }).length;
                return uniqueVals.size <= clue.value && uniqueVals.size + blanks >= clue.value;
            }
            return true;
        }
    });

    registerConstraint("fullRankGroups", {
        validatePartial: function(board, lines) {
            var rankedLines = lines.filter(function(line) { return line.rank !== null && line.rank !== undefined; });
            if (rankedLines.some(function(line) {
                return !Number.isInteger(line.rank) || line.rank < 1 || line.rank > lines.length;
            })) return false;
            var values = lines.map(function(line) {
                var digits = line.cells.map(function(cell) { return cellValue(board, cell); });
                return digits.some(function(value) { return !value; }) ? null : Number(digits.join(""));
            });
            if (values.some(function(value) { return value === null; })) return true;
            var ordered = values.slice().sort(function(first, second) { return first - second; });
            return rankedLines.every(function(line) {
                var index = lines.indexOf(line);
                return values[index] === ordered[line.rank - 1];
            });
        }
    });

    registerConstraint("rossiniLines", {
        validatePartial: function(board, clue) {
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            if (values.some(function(value) { return !value; })) return true;
            var ascending = values[0] < values[1] && values[1] < values[2];
            var descending = values[0] > values[1] && values[1] > values[2];
            if (clue.direction === "ascending") return ascending;
            if (clue.direction === "descending") return descending;
            return !ascending && !descending;
        }
    });

    registerConstraint("cellRelations", {
        validatePartial: function(board, clue) {
            if (clue.relation === "fortress") {
                var shaded = cellValue(board, clue.shaded), unshaded = cellValue(board, clue.unshaded);
                return !shaded || !unshaded || shaded > unshaded;
            }
            if (clue.relation === "trio") {
                var trioValue = cellValue(board, clue.cell);
                return !trioValue || (trioValue >= clue.minimum && trioValue <= clue.maximum);
            }
            if (clue.relation === "average") {
                var center = cellValue(board, clue.center);
                var ends = clue.ends.map(function(cell) { return cellValue(board, cell); });
                if (!center || !ends[0] || !ends[1]) return true;
                var isAverage = center * 2 === ends[0] + ends[1];
                return clue.marked ? isAverage : !isAverage;
            }
            if (clue.relation === "multiplication") {
                var factors = clue.top.map(function(cell) { return cellValue(board, cell); });
                var resultDigits = clue.bottom.map(function(cell) { return cellValue(board, cell); });
                if (factors.some(function(value) { return !value; }) ||
                    resultDigits.some(function(value) { return !value; })) return true;
                var product = factors.reduce(function(total, value) { return total * value; }, 1);
                return Number(resultDigits.join("")) === product;
            }
            if (clue.relation === "clonedstrands") {
                var strands = clue.strands || [];
                if (!strands.length || strands.some(function(strand) { return strand.length !== strands[0].length; })) return false;
                for (var strandIndex = 1; strandIndex < strands.length; strandIndex++) {
                    for (var strandCell = 0; strandCell < strands[0].length; strandCell++) {
                        var referenceValue = cellValue(board, strands[0][strandCell]);
                        var strandValue = cellValue(board, strands[strandIndex][strandCell]);
                        if (referenceValue && strandValue && referenceValue !== strandValue) return false;
                    }
                }
                return true;
            }
            if (clue.relation === "codedpairs") {
                var pairValues = (clue.pairs || []).map(function(pair) {
                    var values = pair.map(function(cell) { return cellValue(board, cell); });
                    return values.some(function(value) { return !value; }) ? null : values.slice().sort().join(":");
                });
                var completePairs = pairValues.filter(function(value) { return value !== null; });
                return completePairs.length < 2 || completePairs.every(function(value) { return value === completePairs[0]; });
            }
            if (clue.relation === "multipledivisor") {
                var values = clue.groups.map(function(group) {
                    if (group.some(function(cell) { return !cellValue(board, cell); })) return 0;
                    return Number(group.map(function(cell) { return cellValue(board, cell); }).join(""));
                });
                if (values.some(function(value) { return !value; })) return true;
                return values.every(function(value, index) {
                    if (!index) return true;
                    return value % values[0] === 0 || values[0] % value === 0;
                });
            }
            if (clue.relation === "clock") {
                var clockDigits = clue.cells.map(function(cell) { return cellValue(board, cell); });
                if (clockDigits.some(function(value) { return !value; })) return true;
                return clockDigits[0] * 10 + clockDigits[1] < 24 && clockDigits[2] * 10 + clockDigits[3] < 60;
            }
            if (clue.relation === "slotmachine") {
                var columns = clue.columns || [];
                if (columns.length < 2) return true;
                var reference = columns[0].map(function(cell) { return cellValue(board, cell); });
                return columns.slice(1).every(function(column) {
                    var values = column.map(function(cell) { return cellValue(board, cell); });
                    for (var shift = 0; shift < SIZE; shift++) {
                        var compatible = true;
                        for (var row = 0; row < SIZE; row++) {
                            if (reference[row] && values[(row + shift) % SIZE] &&
                                reference[row] !== values[(row + shift) % SIZE]) compatible = false;
                        }
                        if (compatible) return true;
                    }
                    return false;
                });
            }
            if (clue.relation === "pinnochio") {
                var mismatches = 0, open = 0;
                (clue.clues || []).forEach(function(item) {
                    var value = cellValue(board, item.cell);
                    if (!value) open++;
                    else if (value !== item.value) mismatches++;
                });
                return mismatches <= 1 && (mismatches === 1 || open > 0);
            }
            if (clue.relation === "countingneighbours") {
                var cellVal = cellValue(board, clue.cell);
                if (!cellVal) return true;
                var diagVals = clue.diagonals.map(function(c) { return cellValue(board, c); });
                var orthoVals = clue.orthogonals.map(function(c) { return cellValue(board, c); });
                if (diagVals.indexOf(0) !== -1 || orthoVals.indexOf(0) !== -1) return true;

                var countDistinct = function(arr) {
                    return arr.filter(function(v, i, a) { return a.indexOf(v) === i; }).length;
                };
                var diagDistinct = countDistinct(diagVals);
                var allDistinct = countDistinct(diagVals.concat(orthoVals));

                var satisfiesCircle = cellVal === allDistinct;
                var satisfiesCross = cellVal === diagDistinct;

                if (clue.kind === "circle") return satisfiesCircle;
                if (clue.kind === "cross") return satisfiesCross && !satisfiesCircle;
                if (clue.kind === "none" && !satisfiesCircle && !satisfiesCross) return true;
                // Since this validation could be called while not all digits are filled out or during setup, wait, if there's no symbol, and it's evaluated for a partial board, and the numbers DO match, it will be rejected.
                // However, `validatePartial` can reject valid partial states if we evaluate negative constraints strictly on partials. Wait, `diagVals.indexOf(0) !== -1` ensures we only evaluate this when ALL neighbors are filled!
                // Ah, what if neighbors are all filled, but the current cell value matches the circle/cross condition, but the user DID NOT place a circle/cross?
                // Then the negative constraint is violated, and we return false! That is correct.
                return !satisfiesCircle && !satisfiesCross;
            }
            if (clue.relation === "wheel") {
                var wheelValues = clue.cells.map(function(cell) { return cellValue(board, cell); });
                for (var rotation = 0; rotation < 4; rotation++) {
                    var possible = true;
                    for (var wheelIndex = 0; wheelIndex < 4; wheelIndex++) {
                        if (wheelValues[wheelIndex] && wheelValues[wheelIndex] !== clue.digits[(wheelIndex + rotation) % 4]) {
                            possible = false;
                        }
                    }
                    if (possible) return true;
                }
                return false;
            }
            return true;
        }
    });

    registerConstraint("catalogLines", {
        validatePartial: function(board, clue) {
            var values = clue.path.map(function(cell) { return cellValue(board, cell); });
            var assigned = values.filter(Boolean);
            if (clue.relation === "paritylines") {
                return assigned.length < 2 || assigned.every(function(value) {
                    return value % 2 === assigned[0] % 2;
                });
            }
            if (clue.relation === "renban") {
                if (new Set(assigned).size !== assigned.length) return false;
                return !assigned.length || Math.max.apply(null, assigned) - Math.min.apply(null, assigned) < values.length;
            }
            if (clue.relation === "consecutiveonline") {
                for (var p = 0; p < values.length - 1; p++) {
                    if (values[p] && values[p + 1]) {
                        if (Math.abs(values[p] - values[p + 1]) !== 1) return false;
                    }
                }
                return true;
            }
            if (clue.relation === "creasing") {
                var increasing = true;
                var decreasing = true;
                for (var first = 0; first < values.length; first++) {
                    if (!values[first]) continue;
                    for (var second = first + 1; second < values.length; second++) {
                        if (!values[second]) continue;
                        if (values[first] >= values[second]) increasing = false;
                        if (values[first] <= values[second]) decreasing = false;
                    }
                }
                return increasing || decreasing;
            }
            if (clue.relation === "meandering diagonals") {
                if (new Set(assigned).size !== assigned.length) return false;
                return true;
            }
            if (clue.relation === "alternatingstripes") {
                if (new Set(assigned).size !== assigned.length) return false;
                for (var stripeIndex = 1; stripeIndex < values.length - 1; stripeIndex++) {
                    if (!values[stripeIndex - 1] || !values[stripeIndex] || !values[stripeIndex + 1]) continue;
                    var firstStep = values[stripeIndex] - values[stripeIndex - 1];
                    var secondStep = values[stripeIndex + 1] - values[stripeIndex];
                    if (!firstStep || !secondStep || firstStep * secondStep >= 0) return false;
                }
                return true;
            }
            if (clue.relation === "between") {
                if (values.length < 3 || !values[0] || !values[values.length - 1]) return true;
                var low = Math.min(values[0], values[values.length - 1]);
                var high = Math.max(values[0], values[values.length - 1]);
                return values.slice(1, -1).every(function(value) { return !value || (value > low && value < high); });
            }
            if (clue.relation === "tinder") {
                var counts = {};
                assigned.forEach(function(value) { counts[value] = (counts[value] || 0) + 1; });
                var pairs = 0;
                var digits = Object.keys(counts);
                for (var tinderIndex = 0; tinderIndex < digits.length; tinderIndex++) {
                    if (counts[digits[tinderIndex]] > 2) return false;
                    if (counts[digits[tinderIndex]] === 2) pairs++;
                }
                return pairs <= 1 && (assigned.length < values.length || pairs === 1);
            }
            if (clue.relation === "equalsumline") {
                var groups = {};
                clue.path.forEach(function(cell) {
                    var box = boxIndex(cell.row, cell.col, board.length);
                    (groups[box] || (groups[box] = [])).push(cell);
                });
                var minPossible = -Infinity, maxPossible = Infinity;
                var keys = Object.keys(groups);
                for (var kIdx = 0; kIdx < keys.length; kIdx++) {
                    var box = keys[kIdx];
                    var cells = groups[box];
                    var sum = 0, blanks = 0;
                    cells.forEach(function(cell) {
                        var val = cellValue(board, cell);
                        if (val) sum += val;
                        else blanks++;
                    });
                    var minS = sum + blanks * 1;
                    var maxS = sum + blanks * board.length;
                    if (blanks === 0) {
                        minS = sum;
                        maxS = sum;
                    }
                    if (minS > minPossible) minPossible = minS;
                    if (maxS < maxPossible) maxPossible = maxS;
                }
                return minPossible <= maxPossible;
            }
            if (clue.relation === "germanwhispers") {
                for (var i = 0; i < values.length - 1; i++) {
                    if (values[i] && values[i+1] && Math.abs(values[i] - values[i+1]) < 5) return false;
                }
                return true;
            }
            if (clue.relation === "upanddown") {
                var pattern0Valid = true;
                var pattern1Valid = true;
                for (var i = 0; i < values.length - 1; i++) {
                    var a = values[i];
                    var b = values[i+1];
                    if (a && b) {
                        var diff = b - a;
                        if (Math.abs(diff) < 4) return false;
                        if (diff > 0) {
                            if (i % 2 !== 0) pattern0Valid = false;
                            if (i % 2 === 0) pattern1Valid = false;
                        } else {
                            if (i % 2 === 0) pattern0Valid = false;
                            if (i % 2 !== 0) pattern1Valid = false;
                        }
                    }
                }
                return pattern0Valid || pattern1Valid;
            }
            if (clue.relation === "factorlines") {
                for (var i = 0; i < values.length - 1; i++) {
                    if (values[i] && values[i+1] && values[i] % values[i+1] !== 0 && values[i+1] % values[i] !== 0) return false;
                }
                return true;
            }
            if (clue.relation === "24trio") {
                if (values.length !== 3) return false;
                var filled = values.filter(Boolean).sort(function(a, b) { return a - b; });
                if (filled.length === 0) return true;
                var tuples = [
                    [1, 2, 8], [1, 3, 6], [1, 3, 7], [1, 3, 8], [1, 3, 9], [1, 4, 5], [1, 4, 6], [1, 4, 7], [1, 4, 8], [1, 5, 5], [1, 5, 6],
                    [2, 2, 6], [2, 3, 4], [2, 3, 6], [2, 3, 9], [2, 4, 4], [2, 4, 8], [2, 5, 7], [2, 5, 8], [2, 6, 6], [2, 6, 8], [2, 6, 9], [2, 8, 8],
                    [3, 3, 4], [3, 3, 5], [3, 3, 7], [3, 3, 9], [3, 4, 4], [3, 4, 9], [3, 5, 9], [3, 6, 6], [3, 6, 7], [3, 6, 8], [3, 8, 9],
                    [4, 4, 5], [4, 4, 7], [4, 4, 8], [4, 6, 8], [4, 7, 8], [4, 8, 8],
                    [5, 6, 6], [5, 6, 9], [5, 8, 8],
                    [6, 8, 9], [6, 9, 9],
                    [7, 8, 9],
                    [8, 8, 8]
                ];
                return tuples.some(function(t) {
                    var match = true;
                    var tCopy = t.slice();
                    for (var i = 0; i < filled.length; i++) {
                        var idx = tCopy.indexOf(filled[i]);
                        if (idx !== -1) {
                            tCopy.splice(idx, 1);
                        } else {
                            match = false;
                            break;
                        }
                    }
                    return match;
                });
            }
            return true;
        },
        validateComplete: function(board, clue) {
            var values = clue.path.map(function(cell) { return cellValue(board, cell); });
            if (clue.relation === "sequence") {
                if (values.length < 3) return true;
                var step = values[1] - values[0];
                return values.every(function(value, index) { return index === 0 || value - values[index - 1] === step; });
            }
            if (clue.relation === "renban") {
                return Math.max.apply(null, values) - Math.min.apply(null, values) === values.length - 1;
            }
            return true;
        }
    });

    registerConstraint("quadRelations", {
        validatePartial: function(board, clue) {
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            var assigned = values.filter(Boolean);
            if (clue.relation === "quadro") {
                return assigned.length < 4 || !assigned.every(function(value) { return value % 2 === assigned[0] % 2; });
            }
            if (clue.relation === "quadruple") {
                var required = {};
                clue.digits.forEach(function(value) { required[value] = (required[value] || 0) + 1; });
                return Object.keys(required).every(function(value) {
                    var present = assigned.filter(function(digit) { return digit === Number(value); }).length;
                    var open = values.length - assigned.length;
                    return present + open >= required[value];
                });
            }
            if (clue.relation === "exclusion") {
                return clue.digits.every(function(digit) { return assigned.indexOf(digit) === -1; });
            }
            if (clue.relation === "groupsum") {
                var groupSum = assigned.reduce(function(sum, value) { return sum + value; }, 0);
                var groupOpen = values.length - assigned.length;
                return groupSum <= clue.total && groupSum + groupOpen * SIZE >= clue.total &&
                    (groupOpen > 0 || groupSum === clue.total);
            }
            if (clue.relation === "crosssums") {
                return assigned.length < 4 || values[0] + values[3] === values[1] + values[2];
            }
            if (clue.relation === "determinant") {
                return assigned.length < 4 || values[0] * values[3] - values[1] * values[2] === clue.total;
            }
            if (clue.relation === "clockfaces") {
                if (assigned.length < 4) return true;
                var clockwise = [values[0], values[1], values[3], values[2]];
                function oneDescent(sequence) {
                    var descents = 0;
                    for (var cycleIndex = 0; cycleIndex < sequence.length; cycleIndex++) {
                        if (sequence[cycleIndex] > sequence[(cycleIndex + 1) % sequence.length]) descents++;
                    }
                    return descents === 1;
                }
                var increasesClockwise = oneDescent(clockwise);
                var increasesCounter = oneDescent(clockwise.slice().reverse());
                if (clue.kind === "white") return increasesClockwise;
                if (clue.kind === "black") return increasesCounter;
                return !increasesClockwise && !increasesCounter;
            }
            if (clue.relation === "fullorhalf") {
                var oddCount = assigned.filter(function(value) { return value % 2 === 1; }).length;
                var openCount = values.length - assigned.length;
                if (clue.kind === "circle") {
                    var allOddPossible = oddCount === assigned.length;
                    var allEvenPossible = oddCount === 0;
                    return allOddPossible || allEvenPossible || openCount > 0 && (allOddPossible || allEvenPossible);
                }
                return oddCount <= 2 && oddCount + openCount >= 2;
            }
            if (clue.relation === "mathrax") {
                if (clue.text === "E") return assigned.every(function(value) { return value % 2 === 0; });
                if (clue.text === "O") return assigned.every(function(value) { return value % 2 === 1; });

                var operator = clue.text.slice(-1);
                var targetStr = clue.text.slice(0, -1);

                if (assigned.length < 4) return true;
                var first = board.isZeroEight ? values[0] - 1 : values[0];
                var second = board.isZeroEight ? values[1] - 1 : values[1];
                var third = board.isZeroEight ? values[2] - 1 : values[2];
                var fourth = board.isZeroEight ? values[3] - 1 : values[3];

                function matchOp(a, b) {
                    if (targetStr === "?") {
                        if (operator === "+") return true;
                        if (operator === "-") return Math.abs(a - b) > 0;
                        if (operator === "*") return true;
                        if (operator === "/") return a % b === 0 || b % a === 0;
                    }
                    var target = parseInt(targetStr, 10);
                    if (operator === "+") return a + b === target;
                    if (operator === "-") return Math.abs(a - b) === target;
                    if (operator === "*") return a * b === target;
                    if (operator === "/") return a / b === target || b / a === target;
                    return false;
                }

                return matchOp(first, fourth) && matchOp(second, third);
            }

            if (assigned.length < 4) return true;
            var first = values[0], second = values[1], third = values[2], fourth = values[3];
            if (clue.relation === "equalsums") return first + fourth === second + third;
            if (clue.relation === "equaldifferences") return Math.abs(first - fourth) === Math.abs(second - third);
            if (clue.relation === "equalproducts") return first * fourth === second * third;
            if (clue.relation === "equalratios") {
                return Math.max(first, fourth) * Math.min(second, third) ===
                    Math.max(second, third) * Math.min(first, fourth);
            }
            if (clue.relation === "consecutivequads") {
                var pairs = 0;
                for (var left = 0; left < values.length; left++) {
                    for (var right = left + 1; right < values.length; right++) {
                        if (Math.abs(values[left] - values[right]) === 1) pairs++;
                    }
                }
                return clue.kind === "black" ? pairs >= 2 : pairs === 1;
            }
            return true;
        }
    });

    registerConstraint("mathdoku", {
        validatePartial: function(board, box) {
            var clues = box.clues;
            var assignedEdges = [];
            for (var i = 0; i < clues.length; i++) {
                var first = cellValue(board, clues[i].cells[0]);
                var second = cellValue(board, clues[i].cells[1]);
                if (first && second) {
                    first = board.isZeroEight ? first - 1 : first;
                    second = board.isZeroEight ? second - 1 : second;
                    assignedEdges.push({ first: first, second: second, target: clues[i].target });
                } else {
                    return true;
                }
            }
            if (assignedEdges.length < 4) return true;

            function canSatisfy(edges, availableOps) {
                if (edges.length === 0) return true;
                var edge = edges[0];
                var f = edge.first;
                var s = edge.second;
                var t = edge.target;

                for (var opIdx = 0; opIdx < availableOps.length; opIdx++) {
                    var op = availableOps[opIdx];
                    var possible = false;
                    if (op === "+") possible = (f + s === t);
                    else if (op === "-") possible = (Math.abs(f - s) === t);
                    else if (op === "*") possible = (f * s === t);
                    else if (op === "/") possible = (f / s === t || s / f === t);

                    if (possible) {
                        var newOps = availableOps.slice();
                        newOps.splice(opIdx, 1);
                        if (canSatisfy(edges.slice(1), newOps)) return true;
                    }
                }
                return false;
            }

            return canSatisfy(assignedEdges, ["+", "-", "*", "/"]);
        }
    });

    registerConstraint("shadedParityGroups", {
        validatePartial: function(board, cells) {
            var parity = null;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                if (parity === null) parity = value % 2;
                else if (value % 2 !== parity) return false;
            }
            return true;
        }
    });

    registerConstraint("regionAllDifferent", {
        validatePartial: function(board, cells) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                var bit = 1 << value;
                if (seen & bit) return false;
                seen |= bit;
            }
            return true;
        }
    });

    registerConstraint("scatteredAllDifferent", {
        validatePartial: function(board, cells) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                var bit = 1 << value;
                if (seen & bit) return false;
                seen |= bit;
            }
            return true;
        }
    });

    // Region editors can describe an invalid partition. Keep that failure in
    // the CSP itself so solve, candidate analysis, and generation all stop
    // before starting an otherwise enormous Latin-square search.
    registerConstraint("invalidRegions", {
        validatePartial: function() { return false; }
    });

    registerConstraint("extraLargeRegions", {
        validatePartial: function(board, cells) {
            var counts = {};
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                counts[value] = (counts[value] || 0) + 1;
                if (counts[value] > 2) return false;
            }
            return true;
        },
        validateComplete: function(board, cells) {
            var counts = {};
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                counts[value] = (counts[value] || 0) + 1;
            }
            for (var i = 1; i <= SIZE; i++) {
                if (counts[i] !== 2) return false;
            }
            return true;
        }
    });

    registerConstraint("difference2Neighbours", {
        validatePartial: function(board, cells) {
            for (var index = 0; index < cells.length; index++) {
                var cell = cells[index];
                var value = cellValue(board, cell);
                if (!value) continue;
                var hasDiff2 = false;
                var hasBlank = false;
                var neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (var i = 0; i < neighborOffsets.length; i++) {
                    var nr = cell.row + neighborOffsets[i][0];
                    var nc = cell.col + neighborOffsets[i][1];
                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                        var nVal = cellValue(board, { row: nr, col: nc });
                        if (!nVal) {
                            hasBlank = true;
                        } else if (Math.abs(value - nVal) === 2) {
                            hasDiff2 = true;
                            break;
                        }
                    }
                }
                if (!hasDiff2 && !hasBlank) return false;
            }
            return true;
        }
    });

    registerConstraint("extraLargeRegions", {
        validatePartial: function(board, cells) {
            var counts = {};
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (!value) continue;
                counts[value] = (counts[value] || 0) + 1;
                if (counts[value] > 2) return false;
            }
            return true;
        },
        validateComplete: function(board, cells) {
            var counts = {};
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                counts[value] = (counts[value] || 0) + 1;
            }
            for (var i = 1; i <= SIZE; i++) {
                if (counts[i] !== 2) return false;
            }
            return true;
        }
    });

    registerConstraint("difference2Neighbours", {
        validatePartial: function(board, cells) {
            for (var index = 0; index < cells.length; index++) {
                var cell = cells[index];
                var value = cellValue(board, cell);
                if (!value) continue;
                var hasDiff2 = false;
                var hasBlank = false;
                var neighborOffsets = [[-1, 0], [1, 0], [0, -1], [0, 1]];
                for (var i = 0; i < neighborOffsets.length; i++) {
                    var nr = cell.row + neighborOffsets[i][0];
                    var nc = cell.col + neighborOffsets[i][1];
                    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                        var nVal = cellValue(board, { row: nr, col: nc });
                        if (!nVal) {
                            hasBlank = true;
                        } else if (Math.abs(value - nVal) === 2) {
                            hasDiff2 = true;
                            break;
                        }
                    }
                }
                if (!hasDiff2 && !hasBlank) return false;
            }
            return true;
        }
    });

    registerConstraint("regionCoverage", {
        validatePartial: function(board, cells) {
            var seen = 0;
            var blanks = 0;
            for (var index = 0; index < cells.length; index++) {
                var value = cellValue(board, cells[index]);
                if (value) seen |= 1 << value;
                else blanks++;
            }
            var missing = countBits(ALL_DIGITS & ~seen);
            return missing <= blanks;
        },
        validateComplete: function(board, cells) {
            var seen = 0;
            for (var index = 0; index < cells.length; index++) seen |= 1 << cellValue(board, cells[index]);
            return (seen & ALL_DIGITS) === ALL_DIGITS;
        }
    });

    function consecutiveSetValid(board, cells, allowEqual) {
        var values = [];
        var seen = 0;
        for (var index = 0; index < cells.length; index++) {
            var value = cellValue(board, cells[index]);
            if (!value) continue;
            var bit = 1 << value;
            if (!allowEqual && (seen & bit)) return false;
            seen |= bit;
            values.push(value);
        }
        if (values.length < 2) return true;
        return Math.max.apply(null, values) - Math.min.apply(null, values) <= cells.length - 1;
    }

    registerConstraint("renbanRegions", {
        validatePartial: function(board, cells) {
            return consecutiveSetValid(board, cells, false);
        },
        validateComplete: function(board, cells) {
            var values = cells.map(function(cell) { return cellValue(board, cell); });
            return consecutiveSetValid(board, cells, false) &&
                Math.max.apply(null, values) - Math.min.apply(null, values) === cells.length - 1;
        }
    });

    registerConstraint("cloneGroups", {
        validatePartial: function(board, cells) {
            var value = 0;
            for (var index = 0; index < cells.length; index++) {
                var current = cellValue(board, cells[index]);
                if (!current) continue;
                if (value && current !== value) return false;
                value = current;
            }
            return true;
        }
    });

    registerConstraint("consecutiveCloneGroups", {
        validatePartial: function(board, cells) {
            return consecutiveSetValid(board, cells, false);
        },
        validateComplete: function(board, cells) {
            var values = cells.map(function(cell) { return cellValue(board, cell); });
            return consecutiveSetValid(board, cells, false) &&
                Math.max.apply(null, values) - Math.min.apply(null, values) === cells.length - 1;
        }
    });


    registerConstraint("shapeMatchings", {
        validatePartial: function(board, matchings) {
            if (!matchings || matchings.length === 0) return false;
            for (var m = 0; m < matchings.length; m++) {
                var matching = matchings[m];
                var possible = true;
                for (var i = 0; i < matching.length; i++) {
                    var req = matching[i];
                    var val = cellValue(board, { row: req.row, col: req.col });
                    if (val && val !== req.digit) {
                        possible = false;
                        break;
                    }
                }
                if (possible) return true;
            }
            return false;
        }
    });

    registerConstraint("cloneShapeChecks", {
        validatePartial: function(board, check) {
            return check.valid === true;
        }
    });

    registerConstraint("hiddenCloneShapeChecks", {
        validatePartial: function() { return true; },
        validateComplete: function(board, check) {
            var component = check.component;
            var assigned = [];
            for (var i = 0; i < component.length; i++) {
                assigned.push(cellValue(board, component[i]));
            }

            for (var dr = -SIZE + 1; dr < SIZE; dr++) {
                for (var dc = -SIZE + 1; dc < SIZE; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    var match = true;
                    for (var i = 0; i < component.length; i++) {
                        var cell = component[i];
                        var tr = cell.row + dr, tc = cell.col + dc;
                        if (tr < 0 || tr >= SIZE || tc < 0 || tc >= SIZE) {
                            match = false;
                            break;
                        }
                        var tval = cellValue(board, { row: tr, col: tc });
                        if (tval !== assigned[i]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) return true;
                }
            }
            return false;
        }
    });

    registerConstraint("palindromes", {
        validatePartial: function(board, path) {
            for (var i = 0; i < Math.floor(path.length / 2); i++) {
                var first = cellValue(board, path[i]);
                var second = cellValue(board, path[path.length - 1 - i]);
                if (first && second && first !== second) {
                    return false;
                }
            }
            return true;
        }
    });


    registerConstraint("sumsetCages", {
        validatePartial: function(board, cages) {
            var sums = [];
            for (var i = 0; i < cages.length; i++) {
                var cage = cages[i];
                var sum = 0;
                var complete = true;
                for (var j = 0; j < cage.length; j++) {
                    var val = cellValue(board, cage[j]);
                    if (!val) {
                        complete = false;
                        break;
                    }
                    sum += val;
                }
                if (complete) {
                    if (sums.indexOf(sum) !== -1) return false;
                    sums.push(sum);
                }
            }
            return true;
        }
    });

    registerConstraint("upperrightheavykiller", {
        validatePartial: function(board, constraint) {
            var urCages = constraint;
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var cellVal = cellValue(board, { row: r, col: c });
                    if (!cellVal) continue;

                    if (r > 0 && c < SIZE - 1) {
                        var urVal = cellValue(board, { row: r - 1, col: c + 1 });
                        if (!urVal) continue;
                        var cageTotal = urCages[r + "," + c];

                        if (cellVal < urVal) {
                            if (cageTotal === undefined) return false;
                            if (cellVal + urVal !== cageTotal) return false;
                        } else {
                            if (cageTotal !== undefined) return false;
                        }
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("topheavy", {
        validatePartial: function(board) {
            for (var c = 0; c < SIZE; c++) {
                for (var r = 0; r < SIZE - 1; r++) {
                    var top = cellValue(board, { row: r, col: c });
                    var bottom = cellValue(board, { row: r + 1, col: c });
                    if (top && bottom && top >= 1 && top <= 7 && bottom >= 1 && bottom <= 7 && top <= bottom) {
                        return false;
                    }
                }
            }
            return true;
        }
    });

    function canDeleteOneForPalindrome(values) {
        function isPalindromeWithout(skipped) {
            var filtered = values.filter(function(_, index) { return index !== skipped; });
            for (var left = 0, right = filtered.length - 1; left < right; left++, right--) {
                if (filtered[left] !== filtered[right]) return false;
            }
            return true;
        }
        for (var skipped = 0; skipped < values.length; skipped++) {
            if (isPalindromeWithout(skipped)) return true;
        }
        return false;
    }

    // Almost Palindrome: all but a single symmetric pair is a palindrome.
    registerConstraint("almostPalindromes", {
        validatePartial: function(board, path) {
            var values = path.map(function(cell) { return cellValue(board, cell); });
            var N = values.length;
            var mismatches = 0;
            for (var i = 0; i < Math.floor(N / 2); i++) {
                var a = values[i];
                var b = values[N - 1 - i];
                if (a && b && a !== b) {
                    mismatches++;
                }
            }
            return mismatches <= 1;
        },
        validateComplete: function(board, path) {
            var values = path.map(function(cell) { return cellValue(board, cell); });
            var N = values.length;
            var mismatches = 0;
            for (var i = 0; i < Math.floor(N / 2); i++) {
                var a = values[i];
                var b = values[N - 1 - i];
                if (a !== b) {
                    mismatches++;
                }
            }
            return mismatches === 1;
        }
    });

    registerConstraint("disguisedPalindromes", {
        validatePartial: function(board, path) {
            if (path.length <= 1) return true;
            for (var k = 0; k < path.length; k++) {
                var isPal = true;
                var left = 0;
                var right = path.length - 1;
                while (left < right) {
                    if (left === k) left++;
                    if (right === k) right--;
                    if (left >= right) break;
                    var a = cellValue(board, path[left]);
                    var b = cellValue(board, path[right]);
                    if (a && b && a !== b) {
                        isPal = false;
                        break;
                    }
                    left++;
                    right--;
                }
                if (isPal) return true;
            }
            return false;
        },
        validateComplete: function(board, path) {
            if (path.length <= 1) return true;
            for (var k = 0; k < path.length; k++) {
                var isPal = true;
                var left = 0;
                var right = path.length - 1;
                while (left < right) {
                    if (left === k) left++;
                    if (right === k) right--;
                    if (left >= right) break;
                    var a = cellValue(board, path[left]);
                    var b = cellValue(board, path[right]);
                    if (a !== b) {
                        isPal = false;
                        break;
                    }
                    left++;
                    right--;
                }
                if (isPal) return true;
            }
            return false;
        }
    });

    // Anti-Consecutive: explicitly marked edges must NOT be consecutive
    registerConstraint("antiConsecutive", {
        validatePartial: function(board, pair) {
            var a = cellValue(board, pair[0]);
            var b = cellValue(board, pair[1]);
            return !a || !b || Math.abs(a - b) !== 1;
        }
    });

    // Average Arrows: circle = arithmetic mean of shaft digits
    registerConstraint("countDifferent", {
        validatePartial: function(board, arrow) {
            var circle = cellValue(board, arrow.circle);
            var shaftValues = arrow.shaft.map(function(cell) { return cellValue(board, cell); });
            var assigned = shaftValues.filter(Boolean);
            var blanks = shaftValues.length - assigned.length;
            var uniqueAssigned = new Set(assigned).size;
            if (circle) {
                return uniqueAssigned <= circle && uniqueAssigned + blanks >= circle;
            }
            return true;
        }
    });

    registerConstraint("countOdd", {
        validatePartial: function(board, arrow) {
            var circle = cellValue(board, arrow.circle);
            var shaftValues = arrow.shaft.map(function(cell) { return cellValue(board, cell); });
            var assigned = shaftValues.filter(Boolean);
            var blanks = shaftValues.length - assigned.length;
            var oddCount = assigned.filter(function(v) { return v % 2 !== 0; }).length;
            if (circle) {
                return oddCount <= circle && oddCount + blanks >= circle;
            }
            return true;
        }
    });

    registerConstraint("averageArrows", {
        validatePartial: function(board, arrow) {
            var circle = cellValue(board, arrow.circle);
            var shaftValues = arrow.shaft.map(function(cell) { return cellValue(board, cell); });
            var assigned = shaftValues.filter(Boolean);
            var blanks = shaftValues.length - assigned.length;
            var total = assigned.reduce(function(s, v) { return s + v; }, 0);
            var n = shaftValues.length;
            if (circle) {
                // circle * n must equal total of shaft (mean relationship)
                // With blanks: total + blanks*1 <= circle*n <= total + blanks*SIZE
                var target = circle * n;
                return total <= target && total + blanks * SIZE >= target && (blanks > 0 || total === target);
            }
            // Circle unknown: at least one integer from 1..SIZE could work
            if (blanks === shaftValues.length) return true; // no info yet
            for (var c = 1; c <= SIZE; c++) {
                var t = c * n;
                if (total <= t && total + blanks * SIZE >= t) return true;
            }
            return false;
        }
    });

    function xvAllows(first, second, kind, board) {
        var sum = (board.isZeroEight ? first - 1 : first) + (board.isZeroEight ? second - 1 : second);
        if (kind === "V") {
            return sum === 5;
        }
        if (kind === "X") {
            return sum === 10;
        }
        if (kind === "VI") return sum === 6;
        if (kind === "XI") return sum === 11;
        return kind === "none-xivi" ? sum !== 6 && sum !== 11 : sum !== 5 && sum !== 10;
    }

    registerConstraint("xv", {
        validatePartial: function(board, clue) {
            var first = cellValue(board, clue.cells[0]);
            var second = cellValue(board, clue.cells[1]);
            if (first && second) {
                return xvAllows(first, second, clue.kind === "none" && clue.family === "xivi" ? "none-xivi" : clue.kind, board);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && xvAllows(known, candidate,
                    clue.kind === "none" && clue.family === "xivi" ? "none-xivi" : clue.kind, board)) {
                    return true;
                }
            }
            return false;
        }
    });


    registerConstraint("lc", {
        validatePartial: function(board, clue) {
            var a = cellValue(board, clue.cells[0]);
            var b = cellValue(board, clue.cells[1]);
            var c = cellValue(board, clue.cells[2]);
            var d = cellValue(board, clue.cells[3]);
            if (a && b && c && d) {
                var sum = (a * 10 + b) + (c * 10 + d);
                if (clue.kind === "L") return sum === 50;
                if (clue.kind === "C") return sum === 100;
                return sum !== 50 && sum !== 100;
            }
            return true;
        }
    });

    function kropkiAllows(first, second, kind) {
        var consecutive = Math.abs(first - second) === 1;
        var double = first === 2 * second || second === 2 * first;
        if (kind === "white") {
            return consecutive;
        }
        if (kind === "black") {
            return double;
        }
        return !consecutive && !double;
    }

    registerConstraint("kropki", {
        validatePartial: function(board, dot) {
            var first = cellValue(board, dot.cells[0]);
            var second = cellValue(board, dot.cells[1]);
            if (first && second) {
                return kropkiAllows(first, second, dot.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && kropkiAllows(known, candidate, dot.kind)) {
                    return true;
                }
            }
            return false;
        }
    });

    function doubleKropkiAllows(first, second, kind) {
        var diff2 = Math.abs(first - second) === 2;
        var ratio4 = first === 4 * second || second === 4 * first;
        if (kind === "white") {
            return diff2;
        }
        if (kind === "black") {
            return ratio4;
        }
        return !diff2 && !ratio4;
    }

    registerConstraint("doublekropki", {
        validatePartial: function(board, dot) {
            var first = cellValue(board, dot.cells[0]);
            var second = cellValue(board, dot.cells[1]);
            if (first && second) {
                return doubleKropkiAllows(first, second, dot.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && doubleKropkiAllows(known, candidate, dot.kind)) {
                    return true;
                }
            }
            return false;
        }
    });

    function fadedKropkiAllows(first, second, kind) {
        var consecutive = Math.abs(first - second) === 1;
        var double = first === 2 * second || second === 2 * first;
        if (kind === "white") {
            return consecutive || double;
        }
        return !consecutive && !double;
    }

    registerConstraint("onefivenine", {
        validatePartial: function(board, clue, helpers) {
            for (var row = 0; row < SIZE; row++) {
                var colsToCheck = [0, 4, 8];
                var valuesToCheck = [1, 5, 9];
                for (var i = 0; i < 3; i++) {
                    var pointerCol = colsToCheck[i];
                    var expectedValue = valuesToCheck[i];

                    var pointerVal = board[row][pointerCol];
                    if (pointerVal) {
                        var targetCol = pointerVal - 1;
                        if (targetCol >= 0 && targetCol < SIZE) {
                            var targetVal = board[row][targetCol];
                            if (targetVal && targetVal !== expectedValue) {
                                return false;
                            }
                            var cellHasExpected = false;
                            for (var c = 0; c < SIZE; c++) {
                                if (board[row][c] === expectedValue) {
                                    if (c !== targetCol) return false;
                                }
                            }
                        }
                    }
                    for (var c = 0; c < SIZE; c++) {
                        var cellVal = board[row][c];
                        if (cellVal === expectedValue) {
                            if (pointerVal && pointerVal - 1 !== c) return false;
                        }
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("parityCircles", {
        validatePartial: function(board, clues, helpers) {
            var clueMap = {};
            for (var i = 0; i < clues.length; i++) {
                var clue = clues[i];
                if (clue && clue.cell) {
                    var r = clue.cell.row !== undefined ? clue.cell.row : clue.cell[0];
                    var c = clue.cell.col !== undefined ? clue.cell.col : clue.cell[1];
                    clueMap[r + "," + c] = true;
                }
            }

            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var val = board[r][c];
                    if (!val) continue;

                    var isValOdd = val % 2 !== 0;

                    var neighbors = [
                        [r-1, c-1], [r-1, c], [r-1, c+1],
                        [r, c-1],           [r, c+1],
                        [r+1, c-1], [r+1, c], [r+1, c+1]
                    ];

                    var validNeighbors = neighbors.filter(function(n) {
                        return n[0] >= 0 && n[0] < SIZE && n[1] >= 0 && n[1] < SIZE;
                    });

                    var knownParityCount = 0;
                    var unknownCount = 0;

                    for (var i = 0; i < validNeighbors.length; i++) {
                        var nCell = validNeighbors[i];
                        var nVal = board[nCell[0]][nCell[1]];
                        if (!nVal) {
                            unknownCount++;
                        } else {
                            var isNOdd = nVal % 2 !== 0;
                            if (isValOdd === isNOdd) {
                                knownParityCount++;
                            }
                        }
                    }

                    var hasCircle = clueMap[r + "," + c];
                    if (hasCircle) {
                        if (knownParityCount > val) return false;
                        if (knownParityCount + unknownCount < val) return false;
                    } else {
                        // Negative constraint: All possible circles are given
                        if (unknownCount === 0 && knownParityCount === val) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }
    });

    registerConstraint("oneTouch", {
        validatePartial: function(board, clueArrayWrapper, helpers) {
            var clueArray = (clueArrayWrapper && clueArrayWrapper.length && Array.isArray(clueArrayWrapper[0])) ? clueArrayWrapper[0] : (clueArrayWrapper || []);
            var touched = {};
            for (var r = 0; r < SIZE - 1; r++) {
                for (var c = 0; c < SIZE - 1; c++) {
                    var valTL = board[r][c];
                    var valTR = board[r][c+1];
                    var valBL = board[r+1][c];
                    var valBR = board[r+1][c+1];

                    if (valTL && valBR && valTL === valBR) {
                        if (!touched[valTL]) touched[valTL] = [];
                        touched[valTL].push([r, c]);
                    }
                    if (valTR && valBL && valTR === valBL) {
                        if (!touched[valTR]) touched[valTR] = [];
                        touched[valTR].push([r, c]);
                    }
                }
            }

            var validIntersectionsMap = {};
            for (var i = 0; i < clueArray.length; i++) {
                var cells = clueArray[i].cells || clueArray[i];
                if (!cells) continue;
                var minR = SIZE, minC = SIZE;
                for (var j = 0; j < cells.length; j++) {
                    var cr = cells[j].row !== undefined ? cells[j].row : cells[j][0];
                    var cc = cells[j].col !== undefined ? cells[j].col : cells[j][1];
                    minR = Math.min(minR, cr);
                    minC = Math.min(minC, cc);
                }
                validIntersectionsMap[minR + "," + minC] = true;
            }

            for (var val in touched) {
                var points = touched[val];
                if (points.length > 1) return false;
                if (points.length === 1) {
                    var p = points[0];
                    if (!validIntersectionsMap[p[0] + "," + p[1]]) {
                        return false; // Touching unmarked
                    }
                }
            }
            return true;
        },
        validateComplete: function(board, clueArrayWrapper, helpers) {
            var clueArray = (clueArrayWrapper && clueArrayWrapper.length && Array.isArray(clueArrayWrapper[0])) ? clueArrayWrapper[0] : (clueArrayWrapper || []);
            var validIntersectionsMap = {};
            for (var i = 0; i < clueArray.length; i++) {
                var cells = clueArray[i].cells || clueArray[i];
                if (!cells) continue;
                var minR = SIZE, minC = SIZE;
                for (var j = 0; j < cells.length; j++) {
                    var cr = cells[j].row !== undefined ? cells[j].row : cells[j][0];
                    var cc = cells[j].col !== undefined ? cells[j].col : cells[j][1];
                    minR = Math.min(minR, cr);
                    minC = Math.min(minC, cc);
                }
                validIntersectionsMap[minR + "," + minC] = true;
            }

            var touchedCounts = {};
            var intersectionHasPairMap = {};
            for (var i = 1; i <= SIZE; i++) touchedCounts[i] = 0;

            for (var r = 0; r < SIZE - 1; r++) {
                for (var c = 0; c < SIZE - 1; c++) {
                    var valTL = board[r][c];
                    var valTR = board[r][c+1];
                    var valBL = board[r+1][c];
                    var valBR = board[r+1][c+1];

                    if (valTL && valBR && valTL === valBR) {
                        touchedCounts[valTL]++;
                        intersectionHasPairMap[r + "," + c] = true;
                    }
                    if (valTR && valBL && valTR === valBL) {
                        touchedCounts[valTR]++;
                        intersectionHasPairMap[r + "," + c] = true;
                    }
                }
            }

            for (var val = 1; val <= SIZE; val++) {
                if (touchedCounts[val] !== 1) return false;
            }

            for (var k in validIntersectionsMap) {
                if (!intersectionHasPairMap[k]) return false;
            }

            return true;
        }
    });

    registerConstraint("fadedKropki", {
        validatePartial: function(board, dot) {
            var first = cellValue(board, dot.cells[0]);
            var second = cellValue(board, dot.cells[1]);
            if (first && second) {
                return fadedKropkiAllows(first, second, dot.kind);
            }
            var known = first || second;
            if (!known) {
                return true;
            }
            for (var candidate = 1; candidate <= SIZE; candidate++) {
                if (candidate !== known && fadedKropkiAllows(known, candidate, dot.kind)) {
                    return true;
                }
            }
            return false;
        }
    });

    function hasOddPath(board, size) {
        var start = { row: 0, col: 0 };
        var end = { row: size - 1, col: size - 1 };
        var visited = Array.from({ length: size }, function() { return new Uint8Array(size); });
        var startVal = cellValue(board, start);
        if (startVal !== 0 && (startVal % 2) === 0) return false;
        var endVal = cellValue(board, end);
        if (endVal !== 0 && (endVal % 2) === 0) return false;

        var queue = [start];
        visited[0][0] = 1;
        var head = 0;
        var dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
        while (head < queue.length) {
            var curr = queue[head++];
            if (curr.row === end.row && curr.col === end.col) return true;
            for (var i = 0; i < 4; i++) {
                var nr = curr.row + dr[i], nc = curr.col + dc[i];
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
                    var val = cellValue(board, { row: nr, col: nc });
                    if (val === 0 || (val % 2) !== 0) {
                        visited[nr][nc] = 1;
                        queue.push({ row: nr, col: nc });
                    }
                }
            }
        }
        return false;
    }

    function hasSequencePath(board, startValue, startRow, endValue, endRow) {
        var size = board.length;
        var step = startValue < endValue ? 1 : -1;

        var currentReach = new Uint8Array(size * size);
        var nextReach = new Uint8Array(size * size);
        var anyStart = false;

        for (var c = 0; c < size; c++) {
            var val = cellValue(board, {row: startRow, col: c});
            if (val === 0 || val === startValue) {
                currentReach[startRow * size + c] = 1;
                anyStart = true;
            }
        }
        if (!anyStart) return false;

        var dr = [-1, -1, -1, 0, 0, 1, 1, 1];
        var dc = [-1, 0, 1, -1, 1, -1, 0, 1];
        var currentDigit = startValue;

        while (currentDigit !== endValue) {
            var nextDigit = currentDigit + step;
            nextReach.fill(0);
            var anyNext = false;

            for (var r = 0; r < size; r++) {
                for (var c = 0; c < size; c++) {
                    if (currentReach[r * size + c]) {
                        for (var i = 0; i < 8; i++) {
                            var nr = r + dr[i];
                            var nc = c + dc[i];
                            if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
                                var nIdx = nr * size + nc;
                                if (!nextReach[nIdx]) {
                                    var val = cellValue(board, {row: nr, col: nc});
                                    if (val === 0 || val === nextDigit) {
                                        nextReach[nIdx] = 1;
                                        anyNext = true;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (!anyNext) return false;
            var temp = currentReach;
            currentReach = nextReach;
            nextReach = temp;
            currentDigit = nextDigit;
        }

        for (var c = 0; c < size; c++) {
            if (currentReach[endRow * size + c]) {
                return true;
            }
        }
        return false;
    }

    registerConstraint("sequenceTopBottom", {
        validatePartial: function(board) {
            var size = board.length;
            if (!hasSequencePath(board, 1, 0, size, size - 1)) return false;
            if (!hasSequencePath(board, 1, size - 1, size, 0)) return false;
            return true;
        }
    });

    function hasEvenPath(board, size) {
        var start = { row: 0, col: 0 };
        var end = { row: size - 1, col: size - 1 };
        var visited = Array.from({ length: size }, function() { return new Uint8Array(size); });
        var startVal = cellValue(board, start);
        if (startVal !== 0 && (startVal % 2) !== 0) return false;
        var endVal = cellValue(board, end);
        if (endVal !== 0 && (endVal % 2) !== 0) return false;

        var queue = [start];
        visited[0][0] = 1;
        var head = 0;
        var dr = [-1, 1, 0, 0], dc = [0, 0, -1, 1];
        while (head < queue.length) {
            var curr = queue[head++];
            if (curr.row === end.row && curr.col === end.col) return true;
            for (var i = 0; i < 4; i++) {
                var nr = curr.row + dr[i], nc = curr.col + dc[i];
                if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited[nr][nc]) {
                    var val = cellValue(board, { row: nr, col: nc });
                    if (val === 0 || (val % 2) === 0) {
                        visited[nr][nc] = 1;
                        queue.push({ row: nr, col: nc });
                    }
                }
            }
        }
        return false;
    }

    registerConstraint("oddLabyrinth", {
        validatePartial: function(board) {
            return hasOddPath(board, SIZE);
        }
    });

    registerConstraint("evenPassage", {
        validatePartial: function(board) {
            return hasEvenPath(board, SIZE);
        }
    });

    registerConstraint("equalsumlines", {
        validatePartial: function(board, clue) {
            var minPossible = -Infinity;
            var maxPossible = Infinity;
            for (var i = 0; i < clue.lines.length; i++) {
                var path = clue.lines[i];
                var sum = 0;
                var blanks = 0;
                for (var j = 0; j < path.length; j++) {
                    var val = cellValue(board, path[j]);
                    if (val) sum += val;
                    else blanks++;
                }
                var minL = sum + blanks * 1;
                var maxL = sum + blanks * 9;
                if (blanks === 0) {
                    minL = sum;
                    maxL = sum;
                }
                if (minL > minPossible) minPossible = minL;
                if (maxL < maxPossible) maxPossible = maxL;
            }
            return minPossible <= maxPossible;
        }
    });

    registerConstraint("number5isalive", {
        validatePartial: function(board, clue) {
            var values = clue.cells.map(function(cell) { return cellValue(board, cell); });
            var assigned = values.filter(Boolean);
            if (new Set(assigned).size !== assigned.length) return false;
            var sum = assigned.reduce(function(total, value) { return total + value; }, 0);
            var blanks = values.length - assigned.length;
            if (blanks === 0) {
                return sum % 10 === 5;
            }
            var available = [];
            for (var d = 1; d <= 9; d++) {
                if (assigned.indexOf(d) === -1) available.push(d);
            }
            available.sort(function(a, b) { return a - b; });
            var minBlankSum = 0;
            for (var i = 0; i < blanks; i++) minBlankSum += available[i];
            var maxBlankSum = 0;
            for (var i = available.length - blanks; i < available.length; i++) maxBlankSum += available[i];
            var minSum = sum + minBlankSum;
            var maxSum = sum + maxBlankSum;
            var possible = false;
            for (var s = 5; s <= 95; s += 10) {
                if (s >= minSum && s <= maxSum) {
                    possible = true;
                    break;
                }
            }
            return possible;
        }
    });

    registerConstraint("divisiblebythree", {
        validatePartial: function(board) {
            if (board.length !== 9) return true;
            for (var boxRow = 0; boxRow < 3; boxRow++) {
                for (var boxCol = 0; boxCol < 3; boxCol++) {
                    var startRow = boxRow * 3, startCol = boxCol * 3;
                    for (var r = startRow; r < startRow + 3; r++) {
                        var v1 = cellValue(board, { row: r, col: startCol });
                        var v2 = cellValue(board, { row: r, col: startCol + 1 });
                        var v3 = cellValue(board, { row: r, col: startCol + 2 });
                        if (v1 && v2 && v3 && (v1 + v2 + v3) % 3 !== 0) return false;
                    }
                    for (var c = startCol; c < startCol + 3; c++) {
                        var v1 = cellValue(board, { row: startRow, col: c });
                        var v2 = cellValue(board, { row: startRow + 1, col: c });
                        var v3 = cellValue(board, { row: startRow + 2, col: c });
                        if (v1 && v2 && v3 && (v1 + v2 + v3) % 3 !== 0) return false;
                    }
                }
            }
            return true;
        }
    });



    registerConstraint("oddtapa", {
        validatePartial: function(board) {
            for (var r = 0; r < board.length - 1; r++) {
                for (var c = 0; c < board[r].length - 1; c++) {
                    var v1 = cellValue(board, { row: r, col: c });
                    var v2 = cellValue(board, { row: r, col: c + 1 });
                    var v3 = cellValue(board, { row: r + 1, col: c });
                    var v4 = cellValue(board, { row: r + 1, col: c + 1 });
                    if (v1 && v2 && v3 && v4 &&
                        v1 % 2 !== 0 && v2 % 2 !== 0 && v3 % 2 !== 0 && v4 % 2 !== 0) {
                        return false;
                    }
                }
            }
            var complete = true;
            var oddCells = [];
            for (var r = 0; r < board.length; r++) {
                for (var c = 0; c < board[r].length; c++) {
                    var val = cellValue(board, { row: r, col: c });
                    if (!val) {
                        complete = false;
                    } else if (val % 2 !== 0) {
                        oddCells.push({ r: r, c: c });
                    }
                }
            }
            if (oddCells.length > 1) {
                for (var i = 0; i < oddCells.length; i++) {
                    var cell = oddCells[i];
                    var hasUnassignedOrOddNeighbor = false;
                    var neighbors = [
                        { row: cell.r - 1, col: cell.c },
                        { row: cell.r + 1, col: cell.c },
                        { row: cell.r, col: cell.c - 1 },
                        { row: cell.r, col: cell.c + 1 }
                    ];
                    for (var j = 0; j < neighbors.length; j++) {
                        var n = neighbors[j];
                        if (n.row >= 0 && n.row < board.length && n.col >= 0 && n.col < board[n.row].length) {
                            var val = cellValue(board, n);
                            if (!val || val % 2 !== 0) {
                                hasUnassignedOrOddNeighbor = true;
                                break;
                            }
                        }
                    }
                    if (!hasUnassignedOrOddNeighbor) return false;
                }
            }
            if (complete) {
                if (oddCells.length === 0) return true;
                var visited = new Set();
                var queue = [oddCells[0]];
                visited.add(oddCells[0].r + "," + oddCells[0].c);
                var head = 0;
                while (head < queue.length) {
                    var curr = queue[head++];
                    var neighbors = [
                        { r: curr.r - 1, c: curr.c },
                        { r: curr.r + 1, c: curr.c },
                        { r: curr.r, c: curr.c - 1 },
                        { r: curr.r, c: curr.c + 1 }
                    ];
                    neighbors.forEach(function(n) {
                        if (n.r >= 0 && n.r < board.length && n.c >= 0 && n.c < board[n.r].length) {
                            var val = cellValue(board, { row: n.r, col: n.c });
                            if (val && val % 2 !== 0) {
                                var key = n.r + "," + n.c;
                                if (!visited.has(key)) {
                                    visited.add(key);
                                    queue.push(n);
                                }
                            }
                        }
                    });
                }
                return visited.size === oddCells.length;
            }
            return true;
        }
    });

    registerConstraint("tictactoewinner", {
        validatePartial: function(board, constraint) {
            if (board.length !== 9) return true;
            for (var b = 0; b < 9; b++) {
                var startRow = Math.floor(b / 3) * 3;
                var startCol = (b % 3) * 3;
                var lines = [
                    [{ r: startRow, c: startCol }, { r: startRow, c: startCol + 1 }, { r: startRow, c: startCol + 2 }],
                    [{ r: startRow + 1, c: startCol }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 1, c: startCol + 2 }],
                    [{ r: startRow + 2, c: startCol }, { r: startRow + 2, c: startCol + 1 }, { r: startRow + 2, c: startCol + 2 }],
                    [{ r: startRow, c: startCol }, { r: startRow + 1, c: startCol }, { r: startRow + 2, c: startCol }],
                    [{ r: startRow, c: startCol + 1 }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 2, c: startCol + 1 }],
                    [{ r: startRow, c: startCol + 2 }, { r: startRow + 1, c: startCol + 2 }, { r: startRow + 2, c: startCol + 2 }],
                    [{ r: startRow, c: startCol }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 2, c: startCol + 2 }],
                    [{ r: startRow, c: startCol + 2 }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 2, c: startCol }]
                ];
                var grayLinePath = constraint[b] ? constraint[b][0] : undefined;
                var isGrayLineValidWinner = false;

                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];

                    var isGray = false;
                    if (grayLinePath && grayLinePath.length === 3) {
                        var m1 = line.find(function(c) { return c.r === grayLinePath[0].row && c.c === grayLinePath[0].col; });
                        var m2 = line.find(function(c) { return c.r === grayLinePath[1].row && c.c === grayLinePath[1].col; });
                        var m3 = line.find(function(c) { return c.r === grayLinePath[2].row && c.c === grayLinePath[2].col; });
                        var m1r = line.find(function(c) { return c.r === grayLinePath[2].row && c.c === grayLinePath[2].col; });
                        var m2r = line.find(function(c) { return c.r === grayLinePath[1].row && c.c === grayLinePath[1].col; });
                        var m3r = line.find(function(c) { return c.r === grayLinePath[0].row && c.c === grayLinePath[0].col; });
                        // wait, line is array of length 3, e.g. {r:0,c:0},{r:0,c:1},{r:0,c:2}.
                        // grayLinePath is {row:0, col:0},{row:0, col:1},{row:0, col:2}.
                        if ((m1 && m2 && m3) || (m1r && m2r && m3r)) {
                            isGray = true;
                        }
                    }

                    var oddCount = 0;
                    var evenCount = 0;
                    for (var j = 0; j < 3; j++) {
                        var val = cellValue(board, { row: line[j].r, col: line[j].c });
                        if (val) {
                            if (val % 2 !== 0) oddCount++;
                            else evenCount++;
                        }
                    }

                    if (isGray) {
                        // We must only fail if the line is fully populated and has mixed parity,
                        // OR if a cell is filled that breaks the possibility of 3 matching.
                        // Wait. If oddCount > 0 and evenCount > 0, then the line CAN NEVER be all odd or all even. So it's correct to return false!
                        if (oddCount > 0 && evenCount > 0) return false;
                        if (oddCount === 3 || evenCount === 3) {
                            isGrayLineValidWinner = true;
                        }
                    } else {
                        if (oddCount === 3 || evenCount === 3) return false;
                    }
                }

                if (grayLinePath && grayLinePath.length === 3) {
                    var boxComplete = true;
                    for (var r = startRow; r < startRow + 3; r++) {
                        for (var c = startCol; c < startCol + 3; c++) {
                            if (!cellValue(board, { row: r, col: c })) boxComplete = false;
                        }
                    }
                    if (boxComplete && !isGrayLineValidWinner) return false;
                } else {
                    return false;
                }
            }
            return true;
        }
    });

    registerConstraint("tictactoe", {
        validatePartial: function(board) {
            if (board.length !== 9) return true;
            for (var b = 0; b < 9; b++) {
                var startRow = Math.floor(b / 3) * 3;
                var startCol = (b % 3) * 3;
                var lines = [
                    [{ r: startRow, c: startCol }, { r: startRow, c: startCol + 1 }, { r: startRow, c: startCol + 2 }],
                    [{ r: startRow + 1, c: startCol }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 1, c: startCol + 2 }],
                    [{ r: startRow + 2, c: startCol }, { r: startRow + 2, c: startCol + 1 }, { r: startRow + 2, c: startCol + 2 }],
                    [{ r: startRow, c: startCol }, { r: startRow + 1, c: startCol }, { r: startRow + 2, c: startCol }],
                    [{ r: startRow, c: startCol + 1 }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 2, c: startCol + 1 }],
                    [{ r: startRow, c: startCol + 2 }, { r: startRow + 1, c: startCol + 2 }, { r: startRow + 2, c: startCol + 2 }],
                    [{ r: startRow, c: startCol }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 2, c: startCol + 2 }],
                    [{ r: startRow, c: startCol + 2 }, { r: startRow + 1, c: startCol + 1 }, { r: startRow + 2, c: startCol }]
                ];
                var hasCompletedOddLine = false;
                var hasCompletedEvenLine = false;
                var canFormOddLine = false;
                var canFormEvenLine = false;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    var oddCount = 0;
                    var evenCount = 0;
                    for (var j = 0; j < 3; j++) {
                        var val = cellValue(board, { row: line[j].r, col: line[j].c });
                        if (!val) {}
                        else if (val % 2 !== 0) {
                            oddCount++;
                        } else {
                            evenCount++;
                        }
                    }
                    if (oddCount === 3) hasCompletedOddLine = true;
                    if (evenCount === 3) hasCompletedEvenLine = true;
                    if (evenCount === 0) canFormOddLine = true;
                    if (oddCount === 0) canFormEvenLine = true;
                }
                if (hasCompletedOddLine && hasCompletedEvenLine) return false;
                var centerRow = 3 + Math.floor(b / 3);
                var centerCol = 3 + (b % 3);
                var centerVal = cellValue(board, { row: centerRow, col: centerCol });
                if (centerVal) {
                    var reqOdd = (centerVal % 2 !== 0);
                    if (reqOdd) {
                        if (!canFormOddLine) return false;
                        var boxComplete = true;
                        for (var r = startRow; r < startRow + 3; r++) {
                            for (var c = startCol; c < startCol + 3; c++) {
                                if (!cellValue(board, { row: r, col: c })) boxComplete = false;
                            }
                        }
                        if (boxComplete && !hasCompletedOddLine) return false;
                    } else {
                        if (!canFormEvenLine) return false;
                        var boxComplete = true;
                        for (var r = startRow; r < startRow + 3; r++) {
                            for (var c = startCol; c < startCol + 3; c++) {
                                if (!cellValue(board, { row: r, col: c })) boxComplete = false;
                            }
                        }
                        if (boxComplete && !hasCompletedEvenLine) return false;
                    }
                } else {
                    if (!canFormOddLine && !canFormEvenLine) return false;
                }
            }
            return true;
        }
    });

    return {
        SIZE: SIZE,
        registerConstraint: registerConstraint,
        registeredConstraints: registeredConstraints,
        createProblem: createProblem,
        getCandidates: getCandidates,
        getCandidatesAsync: analyzeCandidatesAsync,
        findConflict: findConflict,
        solve: solve
    };
})();

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuCSP;
}
