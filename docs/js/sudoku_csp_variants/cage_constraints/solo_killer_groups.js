(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("soloKillerGroups", {
        validatePartial: function(board, cages, helpers) {
            var target = 0;
            var summaries = cages.map(function(cage) {
                var values = cage.map(function(cell) { return helpers.cellValue(board, cell); });
                return { sum: values.reduce(function(sum, value) { return sum + value; }, 0),
                    blanks: values.filter(function(value) { return !value; }).length };
            });
            summaries.forEach(function(summary) { if (!summary.blanks) target = target || summary.sum; });
            return summaries.every(function(summary) {
                if (!target) return true;
                return summary.sum <= target && summary.sum + summary.blanks * helpers.size >= target &&
                    (summary.blanks > 0 || summary.sum === target);
            });
        },
        validateComplete: function(board, cages, helpers) {
            var sums = cages.map(function(cage) {
                return cage.reduce(function(sum, cell) { return sum + helpers.cellValue(board, cell); }, 0);
            });
            return sums.every(function(sum) { return sum === sums[0]; });
        }
    });
    };
});
