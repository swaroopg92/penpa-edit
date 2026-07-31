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

            if (clue.value < 1 || clue.value > values.length) return false;
            var running = 0;
            for (var index = 0; index < clue.value; index++) {
                if (!values[index]) return true;
                running += values[index];
                if (index < clue.value - 1 && running > 21) return false;
            }
            return running > 21;
        }

        family.register("bust", validate);
    };
});
