(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installDetection(family) {
        family.register("detection", function(board, clue, helpers) {
            var origin = helpers.cellValue(board, clue.origin);
            if (!origin) return true;
            var markedRays = {};
            (clue.rays || []).forEach(function(ray) {
                if (ray.length) markedRays[ray[0].row + ":" + ray[0].col] = true;
            });
            return (clue.allDiagonalRays || []).every(function(ray) {
                if (!ray.length) return true;
                var marked = !!markedRays[ray[0].row + ":" + ray[0].col];
                var hasMatch = false;
                var hasBlank = false;
                ray.forEach(function(cell) {
                    var value = helpers.cellValue(board, cell);
                    if (!value) hasBlank = true;
                    else if (value === origin) hasMatch = true;
                });
                return marked ? hasMatch || hasBlank : !hasMatch;
            });
        });
    };
});
