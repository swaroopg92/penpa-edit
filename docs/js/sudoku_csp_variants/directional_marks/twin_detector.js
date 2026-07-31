(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installTwinDetector(family) {
        family.register("twindetector", function(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            if (!origin) return true;
            var markedRays = {};
            (clue.rays || []).forEach(function(ray) {
                if (ray.length) markedRays[ray[0].row + ":" + ray[0].col] = true;
            });
            return (clue.allRays || []).every(function(ray) {
                if (!ray.length) return true;
                var marked = !!markedRays[ray[0].row + ":" + ray[0].col];
                var hasMatch = false;
                var canMatch = false;
                var sum = 0;
                var blanks = 0;
                for (var index = 0; index < ray.length; index++) {
                    var value = helpers.cellValue(board, ray[index]);
                    if (value) sum += value;
                    else blanks++;
                    if (sum === origin && blanks === 0) hasMatch = true;
                    if (sum + blanks <= origin && sum + blanks * board.length >= origin &&
                        (blanks > 0 || sum === origin)) {
                        canMatch = true;
                    }
                }
                return marked ? canMatch : !hasMatch;
            });
        });
    };
});
