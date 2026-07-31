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

            var x = Math.floor(clue.value / 10), y = clue.value % 10;
            if (x < 1 || y < 1 || x > values.length || y > values.length) return false;
            var xAtY = !values[y - 1] || values[y - 1] === x;
            var yAtX = !values[x - 1] || values[x - 1] === y;
            if (!values[y - 1] || !values[x - 1]) return xAtY || yAtX;
            return values[y - 1] === x || values[x - 1] === y;
        }

        family.register("descriptivepairs", validate);
    };
});
