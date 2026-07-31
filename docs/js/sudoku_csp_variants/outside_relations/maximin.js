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

            var extrema = values.slice(0, 3);
            if (extrema.some(function(value) { return !value; })) return true;
            var highest = Math.max.apply(null, extrema), lowest = Math.min.apply(null, extrema);
            return clue.relation === "maximin" ? highest - lowest === clue.value : highest + lowest === clue.value;
        }

        ["maximin","minimax"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
