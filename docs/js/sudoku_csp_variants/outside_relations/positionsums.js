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

            var hasFirstTwoSum = Number.isInteger(clue.firstTwoSum);
            var hasIndexedDigitsSum = Number.isInteger(clue.indexedDigitsSum);
            if ((!hasFirstTwoSum && !hasIndexedDigitsSum) || values.length < 2) return false;
            var positionA = values[0];
            var positionB = values[1];
            if (!positionA || !positionB) return true;
            if (hasFirstTwoSum && positionA + positionB !== clue.firstTwoSum) return false;
            if (!hasIndexedDigitsSum) return true;
            if (positionA > values.length || positionB > values.length) return false;
            var digitAtA = values[positionA - 1];
            var digitAtB = values[positionB - 1];
            return !digitAtA || !digitAtB || digitAtA + digitAtB === clue.indexedDigitsSum;
        }

        family.register("positionsums", validate);
    };
});
