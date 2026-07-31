(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installSearchNine(family) {
        function validateSearch(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            if (!origin) return true;
            return (clue.rays || []).every(function(ray) {
                if (origin > ray.length) return false;
                for (var distance = 1; distance <= origin; distance++) {
                    var value = helpers.cellValue(board, ray[distance - 1]);
                    if (value === clue.searchDigit) return distance === origin;
                    if (!value) return true;
                }
                return false;
            });
        }
        family.register("search6", validateSearch);
        family.register("search9", validateSearch);
    };
});
