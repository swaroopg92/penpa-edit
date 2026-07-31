(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPCellRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installClonedStrands(family) {
        family.register("clonedstrands", function(board, clue, helpers) {
            var strands = clue.strands || [];
            if (!strands.length ||
                strands.some(function(strand) { return strand.length !== strands[0].length; })) return false;
            for (var strandIndex = 1; strandIndex < strands.length; strandIndex++) {
                for (var cellIndex = 0; cellIndex < strands[0].length; cellIndex++) {
                    var reference = helpers.cellValue(board, strands[0][cellIndex]);
                    var value = helpers.cellValue(board, strands[strandIndex][cellIndex]);
                    if (reference && value && reference !== value) return false;
                }
            }
            return true;
        });
    };
});
