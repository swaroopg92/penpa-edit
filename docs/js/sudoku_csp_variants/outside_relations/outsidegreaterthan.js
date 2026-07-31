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

        family.register("outsidegreaterthan", validate);
    };
});
