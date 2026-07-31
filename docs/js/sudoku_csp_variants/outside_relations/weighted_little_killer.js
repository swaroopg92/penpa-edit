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

            var wSum = 0, maxPossibleSum = 0;
            var hasBlanks = false;
            for (var i = 0; i < values.length; i++) {
                var weight = clue.weights[i];
                if (values[i]) {
                    wSum += values[i] * weight;
                    maxPossibleSum += values[i] * weight;
                } else {
                    hasBlanks = true;
                    wSum += 1 * weight;
                    maxPossibleSum += helpers.size * weight;
                }
            }
            return wSum <= clue.value && maxPossibleSum >= clue.value && (hasBlanks || wSum === clue.value);
        }

        family.register("weighted little killer", validate);
    };
});
