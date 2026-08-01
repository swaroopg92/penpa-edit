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
        boxIndex: boxIndex,
        boxDimensions: boxDimensions,
        maskToDigits: maskToDigits,
        countBits: countBits,
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
        if (typeof WeakMap !== "undefined") {
            evaluatorCache = new WeakMap();
        }
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
            var digits = String(clue.text || "").match(/\d/g);
            if (!digits || digits.length === 0) return false;
            var allowed = {};
            digits.forEach(function(digit) {
                allowed[Number(digit)] = true;
            });

            var anyPossible = false;
            for (var i = 0; i < clue.pairs.length; i++) {
                var cell1 = clue.pairs[i][0];
                var cell2 = clue.pairs[i][1];
                var v1 = cellValue(board, cell1);
                var v2 = cellValue(board, cell2);

                var v1_vis = v1 ? (board.isZeroEight ? v1 - 1 : v1) : undefined;
                var v2_vis = v2 ? (board.isZeroEight ? v2 - 1 : v2) : undefined;

                var possible = true;
                if (v1_vis !== undefined && !allowed[v1_vis]) possible = false;
                if (v2_vis !== undefined && !allowed[v2_vis]) possible = false;
                if (possible && v1_vis !== undefined && v2_vis !== undefined) {
                    return true;
                }

                if (possible) {
                    anyPossible = true;
                }
            }
            return anyPossible;
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
            var high = SIZE;
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
            var second = values.indexOf(SIZE);
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

    registerConstraint("unicorn", {
        validatePartial: function(board, item) {
            var value = cellValue(board, item.cell);
            if (value !== SIZE) return true;
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
    require("./sudoku_csp_variants/index.js")(SudokuCSP);
}
