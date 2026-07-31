(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPOutsideRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOutsideRelation(family) {
        function validate(board, clue, helpers) {

            var dimensions = helpers.boxDimensions(helpers.size);
            var centerTriplet = clue.cells.map(function(cell) {
                var r = cell.row, c = cell.col;
                r = r < dimensions.height ? r + dimensions.height : (r >= helpers.size - dimensions.height ? r - dimensions.height : r);
                c = c < dimensions.width ? c + dimensions.width : (c >= helpers.size - dimensions.width ? c - dimensions.width : c);
                return { row: r, col: c };
            });
            var cornerValues = clue.cells.map(function(cell) { return helpers.cellValue(board, cell); });
            var centerValues = centerTriplet.map(function(cell) { return helpers.cellValue(board, cell); });
            
            if (cornerValues.some(function(v) { return !v; }) || centerValues.some(function(v) { return !v; })) {
                return true;
            }
            
            var blackCount = 0, whiteCount = 0, crossCount = 0;
            clue.clues.forEach(function(c) {
                if (c === "black") blackCount++;
                else if (c === "white") whiteCount++;
                else if (c === "cross") crossCount++;
            });
            
            var actualBlack = 0;
            var actualWhite = 0;
            var cornerCounts = {};
            var centerCounts = {};
            for (var i = 0; i < cornerValues.length; i++) {
                if (cornerValues[i] === centerValues[i]) {
                    actualBlack++;
                } else {
                    cornerCounts[cornerValues[i]] = (cornerCounts[cornerValues[i]] || 0) + 1;
                    centerCounts[centerValues[i]] = (centerCounts[centerValues[i]] || 0) + 1;
                }
            }
            
            Object.keys(cornerCounts).forEach(function(digit) {
                actualWhite += Math.min(cornerCounts[digit], centerCounts[digit] || 0);
            });
            
            if (crossCount > 0) {
                if (actualBlack > 0 || actualWhite > 0) return false;
            } else {
                if (actualBlack !== blackCount || actualWhite !== whiteCount) return false;
            }
            return true;
        }

        family.register("mastermind", validate);
    };
});
