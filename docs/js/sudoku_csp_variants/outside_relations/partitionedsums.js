(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPOutsideRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOutsideRelation(family) {
        function validate(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });

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

        family.register("partitionedsums", validate);
    };
});
