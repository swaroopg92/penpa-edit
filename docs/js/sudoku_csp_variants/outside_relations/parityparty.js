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

            function parityPrefixPossible(parity) {
                var sum = 0;
                for (var parityIndex = 0; parityIndex < values.length; parityIndex++) {
                    if (!values[parityIndex]) return sum < clue.value;
                    sum += values[parityIndex];
                    if (values[parityIndex] % 2 === parity) return sum === clue.value;
                    if (sum >= clue.value) return false;
                }
                return false;
            }
            return parityPrefixPossible(0) || parityPrefixPossible(1);
        }

        family.register("parityparty", validate);
    };
});
