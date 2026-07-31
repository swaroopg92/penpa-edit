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

            var x = clue.value.x;
            var y = clue.value.y;
            var z = clue.value.z;
            var idxX = values.indexOf(x);
            var idxY = values.indexOf(y);
            if (idxX !== -1 && idxY !== -1) {
                if (idxX >= idxY) return false;
                return idxY - idxX === z;
            }
            if (idxX !== -1 && idxY === -1) {
                var expectedIdxY = idxX + z;
                if (expectedIdxY >= values.length) return false;
                var valAtExpected = values[expectedIdxY];
                return !valAtExpected || valAtExpected === y;
            }
            if (idxY !== -1 && idxX === -1) {
                var expectedIdxX = idxY - z;
                if (expectedIdxX < 0) return false;
                var valAtExpected = values[expectedIdxX];
                return !valAtExpected || valAtExpected === x;
            }
            if (idxX === -1 && idxY === -1) {
                var possible = false;
                for (var i = 0; i < values.length - z; i++) {
                    if ((!values[i] || values[i] === x) && (!values[i + z] || values[i + z] === y)) {
                        possible = true;
                        break;
                    }
                }
                return possible;
            }
            return true;
        }

        family.register("distances", validate);
    };
});
