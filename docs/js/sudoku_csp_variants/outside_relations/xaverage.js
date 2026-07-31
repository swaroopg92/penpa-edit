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

            var averageLength = values[0];
            if (!averageLength) return true;
            if (averageLength > values.length) return false;
            var averageValues = values.slice(0, averageLength);
            var averageSum = averageValues.reduce(function(total, value) { return total + value; }, 0);
            var averageBlanks = averageValues.filter(function(value) { return !value; }).length;
            var averageTarget = clue.value * averageLength;
            return averageSum + averageBlanks <= averageTarget &&
                averageSum + averageBlanks * helpers.size >= averageTarget &&
                (averageBlanks > 0 || averageSum === averageTarget);
        }

        family.register("xaverage", validate);
    };
});
