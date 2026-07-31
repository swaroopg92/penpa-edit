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

            var count = values[0];
            if (!count || count > values.length) return !count;
            var prefix = values.slice(0, count);
            var sum = prefix.reduce(function(total, value) { return total + value; }, 0);
            var blanks = prefix.filter(function(value) { return !value; }).length;
            return sum <= clue.value && sum + blanks * helpers.size >= clue.value && (blanks > 0 || sum === clue.value);
        }

        family.register("xsums", validate);
    };
});
