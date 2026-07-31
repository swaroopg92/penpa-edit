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

            var sum = 0;
            var prev = 0;
            var hasZero = false;
            for (var idx = 0; idx < values.length; idx++) {
                var val = values[idx];
                if (val === 0) {
                    hasZero = true;
                    break;
                }
                if (val > prev) {
                    sum += val;
                    prev = val;
                } else {
                    break;
                }
            }
            if (!hasZero) {
                return sum === clue.value;
            }
            return sum <= clue.value;
        }

        family.register("ascendingstarters", validate);
    };
});
