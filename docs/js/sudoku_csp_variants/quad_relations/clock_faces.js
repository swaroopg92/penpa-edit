(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installClockFaces(family) {
        family.register("clockfaces", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            if (values.filter(Boolean).length < 4) return true;
            var clockwise = [values[0], values[1], values[3], values[2]];
            function hasOneDescent(sequence) {
                var descents = 0;
                for (var index = 0; index < sequence.length; index++) {
                    if (sequence[index] > sequence[(index + 1) % sequence.length]) descents++;
                }
                return descents === 1;
            }
            var increasesClockwise = hasOneDescent(clockwise);
            var increasesCounter = hasOneDescent(clockwise.slice().reverse());
            if (clue.kind === "white") return increasesClockwise;
            if (clue.kind === "black") return increasesCounter;
            return !increasesClockwise && !increasesCounter;
        });
    };
});
