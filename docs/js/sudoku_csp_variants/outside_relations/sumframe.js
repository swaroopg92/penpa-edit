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

            var frameSum = values.reduce(function(total, value) { return total + (board.isZeroEight ? value - 1 : value); }, 0);
            var frameBlanks = values.filter(function(value) { return !value; }).length;
            return frameSum <= clue.value && frameSum + frameBlanks * helpers.size >= clue.value &&
                (frameBlanks > 0 || frameSum === clue.value);
        }

        ["sumframe","framediagonal"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
