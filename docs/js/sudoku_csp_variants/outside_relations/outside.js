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

            var assignedOutside = values.filter(Boolean);
            return (clue.clues || []).every(function(value) {
                return assignedOutside.indexOf(value) !== -1 || assignedOutside.length < values.length;
            }) && (assignedOutside.length < values.length || clue.clues.every(function(value) {
                return assignedOutside.indexOf(value) !== -1;
            }));
        }

        ["outside","outside234"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
