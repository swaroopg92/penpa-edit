(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installSumDetector(family) {
        family.register("sumdetector", function(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            if (!origin) return true;
            return (clue.rays || []).every(function(ray) {
                var sum = 0;
                for (var index = 0; index < ray.length; index++) {
                    var value = helpers.cellValue(board, ray[index]);
                    if (!value) return sum < origin;
                    sum += value;
                    if (sum === origin) return true;
                    if (sum > origin) return false;
                }
                return false;
            });
        });
    };
});
