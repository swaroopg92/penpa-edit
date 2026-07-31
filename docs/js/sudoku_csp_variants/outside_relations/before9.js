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

            // Sum of all digits before the largest grid digit.
            var b9_idx = values.indexOf(helpers.size);
            if (b9_idx >= 0) {
                // The largest digit is placed: sum everything before it exactly.
                var b9_sum = 0;
                for (var b9_i = 0; b9_i < b9_idx; b9_i++) {
                    if (!values[b9_i]) return true; // blank before 9 – still possible
                    b9_sum += values[b9_i];
                }
                return b9_sum === clue.value;
            }
            // The largest digit is not placed yet; try each available position.
            for (var b9_p = 0; b9_p < values.length; b9_p++) {
                if (values[b9_p] !== 0) continue;
                var b9_pre = 0, b9_blanks = 0;
                for (var b9_j = 0; b9_j < b9_p; b9_j++) {
                    if (values[b9_j]) b9_pre += values[b9_j];
                    else b9_blanks++;
                }
                if (b9_pre + b9_blanks <= clue.value &&
                    b9_pre + b9_blanks * (helpers.size - 1) >= clue.value) return true;
            }
            return false;
        }

        family.register("before9", validate);
    };
});
