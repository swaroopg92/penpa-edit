(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPDirectionalMarks);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installSmallestNeighbours(family) {
        family.register("smallestneighbours", function(board, clue, helpers) {
            var neighborValues = (clue.neighbors || []).map(function(cell) {
                return helpers.cellValue(board, cell);
            }).filter(Boolean);
            return (clue.targets || []).every(function(cell) {
                var value = helpers.cellValue(board, cell);
                return !value || neighborValues.every(function(neighbor) {
                    return value <= neighbor;
                });
            });
        });
    };
});
