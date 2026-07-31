(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installQuadruple(family) {
        family.register("quadruple", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var assigned = values.filter(Boolean);
            var required = {};
            clue.digits.forEach(function(value) {
                required[value] = (required[value] || 0) + 1;
            });
            return Object.keys(required).every(function(value) {
                var present = assigned.filter(function(digit) {
                    return digit === Number(value);
                }).length;
                return present + values.length - assigned.length >= required[value];
            });
        });
    };
});
