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

            var digits = String(clue.value).split("").map(Number).filter(function(d) { return d >= 1 && d <= helpers.size; });
            for (var miss_i = 0; miss_i < 3; miss_i++) {
                if (digits.indexOf(values[miss_i]) !== -1) return false;
            }
            return true;
        }

        family.register("missingdigit", validate);
    };
});
