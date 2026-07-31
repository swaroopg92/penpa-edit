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

            var inner_sum = 0, inner_blanks = 0;
            for (var inner_i = 1; inner_i <= 3; inner_i++) {
                var val = values[inner_i];
                if (val) inner_sum += val;
                else inner_blanks++;
            }
            return inner_sum <= clue.value && inner_sum + inner_blanks * helpers.size >= clue.value && (inner_blanks > 0 || inner_sum === clue.value);
        }

        family.register("innerframesum", validate);
    };
});
