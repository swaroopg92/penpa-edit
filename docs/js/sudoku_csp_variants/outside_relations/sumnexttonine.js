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

            function isPossibleSumNextToNine(p) {
                if (p === 0) {
                    var val = values[1];
                    if (val) return val === clue.value;
                    return clue.value >= 1 && clue.value < helpers.size;
                }
                if (p === values.length - 1) {
                    var val = values[values.length - 2];
                    if (val) return val === clue.value;
                    return clue.value >= 1 && clue.value < helpers.size;
                }
                var v1 = values[p - 1];
                var v2 = values[p + 1];
                if (v1 && v2) return v1 + v2 === clue.value;
                if (v1 && !v2) {
                    var needed = clue.value - v1;
                    return needed >= 1 && needed < helpers.size && needed !== v1;
                }
                if (!v1 && v2) {
                    var needed = clue.value - v2;
                    return needed >= 1 && needed < helpers.size && needed !== v2;
                }
                return clue.value >= 3 && clue.value <= (2 * helpers.size - 3);
            }
            var nine_idx = values.indexOf(helpers.size);
            if (nine_idx >= 0) {
                return isPossibleSumNextToNine(nine_idx);
            }
            for (var p = 0; p < values.length; p++) {
                if (values[p] !== 0) continue;
                if (isPossibleSumNextToNine(p)) return true;
            }
            return false;
        }

        family.register("sumnexttonine", validate);
    };
});
