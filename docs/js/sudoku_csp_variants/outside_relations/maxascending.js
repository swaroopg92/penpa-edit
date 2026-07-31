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

            var maxGuaranteed = 0;
            var currentGuaranteed = 0;
            for (var i = 0; i < values.length; i++) {
                if (i === 0 || (values[i] && values[i-1] && values[i] > values[i-1])) {
                    if (values[i]) {
                        currentGuaranteed++;
                    } else {
                        currentGuaranteed = 0;
                    }
                } else {
                    if (currentGuaranteed > maxGuaranteed) maxGuaranteed = currentGuaranteed;
                    currentGuaranteed = values[i] ? 1 : 0;
                }
            }
            if (currentGuaranteed > maxGuaranteed) maxGuaranteed = currentGuaranteed;
            if (maxGuaranteed > clue.value) return false;
            
            var maxPossible = 0;
            var currentPossible = 0;
            for (var i = 0; i < values.length; i++) {
                if (i === 0 || !values[i] || !values[i-1] || values[i] > values[i-1]) {
                    currentPossible++;
                } else {
                    if (currentPossible > maxPossible) maxPossible = currentPossible;
                    currentPossible = 1;
                }
            }
            if (currentPossible > maxPossible) maxPossible = currentPossible;
            if (maxPossible < clue.value) return false;
            
            if (values.every(function(v) { return v; })) {
                return maxGuaranteed === clue.value;
            }
            return true;
        }

        family.register("maxascending", validate);
    };
});
