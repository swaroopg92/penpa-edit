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
            var nine_idx = values.indexOf(helpers.size);
            if (nine_idx >= 0) {
                var neighborCells = [];
                if (nine_idx > 0) neighborCells.push(values[nine_idx - 1]);
                if (nine_idx < values.length - 1) neighborCells.push(values[nine_idx + 1]);
                
                var filledNeighbors = neighborCells.filter(Boolean);
                for (var i = 0; i < filledNeighbors.length; i++) {
                    if (digits.indexOf(filledNeighbors[i]) === -1) return false;
                }
                
                var uniqueFilled = [];
                filledNeighbors.forEach(function(x) { if (uniqueFilled.indexOf(x) === -1) uniqueFilled.push(x); });
                if (uniqueFilled.length > digits.length) return false;
                
                if (filledNeighbors.length === neighborCells.length) {
                    if (neighborCells.length !== digits.length) return false;
                    for (var i = 0; i < digits.length; i++) {
                        if (neighborCells.indexOf(digits[i]) === -1) return false;
                    }
                }
                return true;
            }
            for (var nine_p = 0; nine_p < values.length; nine_p++) {
                if (values[nine_p] !== 0) continue;
                var neighborCells = [];
                if (nine_p > 0) neighborCells.push(values[nine_p - 1]);
                if (nine_p < values.length - 1) neighborCells.push(values[nine_p + 1]);
                if (neighborCells.length < digits.length) continue;
                
                var filledNeighbors = neighborCells.filter(Boolean);
                var ok = true;
                for (var i = 0; i < filledNeighbors.length; i++) {
                    if (digits.indexOf(filledNeighbors[i]) === -1) { ok = false; break; }
                }
                if (!ok) continue;
                
                var uniqueFilled = [];
                filledNeighbors.forEach(function(x) { if (uniqueFilled.indexOf(x) === -1) uniqueFilled.push(x); });
                if (uniqueFilled.length > digits.length) continue;
                
                if (filledNeighbors.length === neighborCells.length) {
                    if (neighborCells.length !== digits.length) continue;
                    var matchAll = true;
                    for (var i = 0; i < digits.length; i++) {
                        if (neighborCells.indexOf(digits[i]) === -1) { matchAll = false; break; }
                    }
                    if (!matchAll) continue;
                }
                return true;
            }
            return false;
        }

        family.register("nextto9", validate);
    };
});
