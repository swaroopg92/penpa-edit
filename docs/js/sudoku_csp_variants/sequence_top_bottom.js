(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = install;
    } else {
        install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    function hasSequencePath(board, startValue, startRow, endValue, endRow, cellValue) {
        var size = board.length;
        var step = startValue < endValue ? 1 : -1;
        var currentReach = new Uint8Array(size * size);
        var nextReach = new Uint8Array(size * size);
        var anyStart = false;

        for (var col = 0; col < size; col++) {
            var startCellValue = cellValue(board, { row: startRow, col: col });
            if (startCellValue === 0 || startCellValue === startValue) {
                currentReach[startRow * size + col] = 1;
                anyStart = true;
            }
        }
        if (!anyStart) return false;

        var rowOffsets = [-1, -1, -1, 0, 0, 1, 1, 1];
        var colOffsets = [-1, 0, 1, -1, 1, -1, 0, 1];
        var currentDigit = startValue;

        while (currentDigit !== endValue) {
            var nextDigit = currentDigit + step;
            nextReach.fill(0);
            var anyNext = false;

            for (var row = 0; row < size; row++) {
                for (var col = 0; col < size; col++) {
                    if (!currentReach[row * size + col]) continue;
                    for (var offset = 0; offset < rowOffsets.length; offset++) {
                        var nextRow = row + rowOffsets[offset];
                        var nextCol = col + colOffsets[offset];
                        if (nextRow < 0 || nextRow >= size || nextCol < 0 || nextCol >= size) continue;

                        var nextIndex = nextRow * size + nextCol;
                        if (nextReach[nextIndex]) continue;
                        var nextCellValue = cellValue(board, { row: nextRow, col: nextCol });
                        if (nextCellValue === 0 || nextCellValue === nextDigit) {
                            nextReach[nextIndex] = 1;
                            anyNext = true;
                        }
                    }
                }
            }
            if (!anyNext) return false;

            var previousReach = currentReach;
            currentReach = nextReach;
            nextReach = previousReach;
            currentDigit = nextDigit;
        }

        for (var endCol = 0; endCol < size; endCol++) {
            if (currentReach[endRow * size + endCol]) return true;
        }
        return false;
    }

    return function installSequenceTopBottom(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("sequenceTopBottom requires SudokuCSP.registerConstraint");
        }

        csp.registerConstraint("sequenceTopBottom", {
            validatePartial: function(board, unused, helpers) {
                var size = board.length;
                if (!hasSequencePath(board, 1, 0, size, size - 1, helpers.cellValue)) return false;
                return hasSequencePath(board, 1, size - 1, size, 0, helpers.cellValue);
            }
        });
    };
});
