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

            if (values.some(function(value) { return !value; })) return true;
            var firstPart = Number(values.slice(0, 4).join(""));
            var secondPart = Number(values.slice(4, 7).join(""));
            var thirdPart = Number(values.slice(7, 9).join(""));
            return firstPart + secondPart + thirdPart === clue.value;
        }

        family.register("triplesum", validate);
    };
});
