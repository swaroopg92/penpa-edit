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

        family.register("wrongoutsidesum", validate);
    };
});
