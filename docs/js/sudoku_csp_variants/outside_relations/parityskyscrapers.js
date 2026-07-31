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

            if (values.indexOf(0) >= 0) return true;
            var visible = [];
            var maxVal = 0;
            for (var p_i = 0; p_i < values.length; p_i++) {
                var val = values[p_i];
                if (val > maxVal) {
                    visible.push(val);
                    maxVal = val;
                }
            }
            var oddCount = visible.filter(function(v) { return v % 2 !== 0; }).length;
            var evenCount = visible.filter(function(v) { return v % 2 === 0; }).length;
            return clue.value === oddCount || clue.value === evenCount;
        }

        family.register("parityskyscrapers", validate);
    };
});
