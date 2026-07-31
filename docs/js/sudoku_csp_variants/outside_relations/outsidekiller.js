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

            var possible = false;
            for (var k_i = 0; k_i < values.length - 1; k_i++) {
                var a = values[k_i];
                var b = values[k_i + 1];
                if (a && b) {
                    if (a + b === clue.value) { possible = true; break; }
                } else if (a || b) {
                    var val = a || b;
                    var needed = clue.value - val;
                    if (needed >= 1 && needed <= helpers.size && needed !== val) { possible = true; break; }
                } else {
                    var minSum = 1 + 2;
                    var maxSum = helpers.size + (helpers.size - 1);
                    if (clue.value >= minSum && clue.value <= maxSum) { possible = true; break; }
                }
            }
            return possible;
        }

        family.register("outsidekiller", validate);
    };
});
