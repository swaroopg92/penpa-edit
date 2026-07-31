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

            var p1_val = values.indexOf(1);
            var p5_val = values.indexOf(5);
            var p9_val = values.indexOf(helpers.size);
            var blanks = [];
            for (var i = 0; i < values.length; i++) {
                if (values[i] === 0) blanks.push(i);
            }
            
            function checkPositions(pos1, pos5, pos9) {
                var pos = [pos1, pos5, pos9].sort(function(a, b) { return a - b; });
                var start = pos[0], end = pos[1];
                var sum = 0, blankCount = 0;
                for (var i = start + 1; i < end; i++) {
                    if (i === pos1 || i === pos5 || i === pos9) return false;
                    if (values[i] === 0) {
                        blankCount++;
                    } else {
                        sum += values[i];
                    }
                }
                if (blankCount === 0) return sum === clue.value;
                return sum + blankCount * 2 <= clue.value &&
                    sum + blankCount * (helpers.size - 1) >= clue.value;
            }
            
            var pos1_options = p1_val !== -1 ? [p1_val] : blanks;
            for (var i = 0; i < pos1_options.length; i++) {
                var pos1 = pos1_options[i];
                var pos5_options = p5_val !== -1 ? [p5_val] : blanks.filter(function(b) { return b !== pos1; });
                for (var j = 0; j < pos5_options.length; j++) {
                    var pos5 = pos5_options[j];
                    var pos9_options = p9_val !== -1 ? [p9_val] : blanks.filter(function(b) { return b !== pos1 && b !== pos5; });
                    for (var k = 0; k < pos9_options.length; k++) {
                        var pos9 = pos9_options[k];
                        if (checkPositions(pos1, pos5, pos9)) return true;
                    }
                }
            }
            return false;
        }

        family.register("doublesandwich", validate);
    };
});
