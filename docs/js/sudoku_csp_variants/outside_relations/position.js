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

            var pos = clue.value - 1; // 0, 1, or 2
            if (pos < 0 || pos > 2) return false;
            var other1 = (pos + 1) % 3;
            var other2 = (pos + 2) % 3;
            if (values[pos]) {
                if (values[other1] && values[pos] <= values[other1]) return false;
                if (values[other2] && values[pos] <= values[other2]) return false;
            } else {
                if (values[other1] === helpers.size || values[other2] === helpers.size) return false;
            }
            return true;
        }

        family.register("position", validate);
    };
});
