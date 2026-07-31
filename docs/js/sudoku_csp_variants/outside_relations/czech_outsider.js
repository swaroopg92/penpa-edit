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

            var digits = String(clue.value).split("").map(Number).filter(function(d) { return d >= 1 && d <= helpers.size; });
            var counts = {};
            digits.forEach(function(d) { counts[d] = (counts[d] || 0) + 1; });
            var blanks = values.filter(function(v) { return !v; }).length;
            for (var d in counts) {
                var targetCount = counts[d];
                var currentCount = values.filter(function(v) { return v === Number(d); }).length;
                if (currentCount + blanks < targetCount) return false;
                if (blanks === 0 && currentCount < targetCount) return false;
            }
            return true;
        }

        family.register("czech outsider", validate);
    };
});
