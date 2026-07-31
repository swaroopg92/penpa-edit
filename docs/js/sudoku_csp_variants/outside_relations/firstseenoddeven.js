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

            var isOddClue = (clue.value % 2) !== 0;
            for (var i = 0; i < values.length; i++) {
                var v = values[i];
                if (!v) break;
                var isOddVal = (v % 2) !== 0;
                if (isOddVal === isOddClue) {
                    return v === clue.value;
                }
            }
            var idxOfClue = values.indexOf(clue.value);
            if (idxOfClue !== -1) {
                for (var i = 0; i < idxOfClue; i++) {
                    if (values[i] && ((values[i] % 2) !== 0) === isOddClue) {
                        return false;
                    }
                }
            } else {
                var hasMatchingParity = values.some(function(v) { return v && ((v % 2) !== 0) === isOddClue; });
                if (hasMatchingParity) return false;
                var noBlanks = values.every(function(v) { return v; });
                if (noBlanks) return false;
            }
            return true;
        }

        family.register("firstseenoddeven", validate);
    };
});
