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

        family.register("outsideconsecutive", validate);
    };
});
