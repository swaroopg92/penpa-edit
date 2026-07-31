(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPQuadRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installMathrax(family) {
        family.register("mathrax", function(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });
            var assigned = values.filter(Boolean);
            if (clue.text === "E") {
                return assigned.every(function(value) { return value % 2 === 0; });
            }
            if (clue.text === "O") {
                return assigned.every(function(value) { return value % 2 === 1; });
            }
            var operator = clue.text.slice(-1);
            var targetText = clue.text.slice(0, -1);
            if (assigned.length < 4) return true;

            var first = board.isZeroEight ? values[0] - 1 : values[0];
            var second = board.isZeroEight ? values[1] - 1 : values[1];
            var third = board.isZeroEight ? values[2] - 1 : values[2];
            var fourth = board.isZeroEight ? values[3] - 1 : values[3];

            function matches(firstValue, secondValue) {
                if (targetText === "?") {
                    if (operator === "+") return true;
                    if (operator === "-") return Math.abs(firstValue - secondValue) > 0;
                    if (operator === "*") return true;
                    if (operator === "/") {
                        return firstValue % secondValue === 0 ||
                            secondValue % firstValue === 0;
                    }
                }
                var target = parseInt(targetText, 10);
                if (operator === "+") return firstValue + secondValue === target;
                if (operator === "-") return Math.abs(firstValue - secondValue) === target;
                if (operator === "*") return firstValue * secondValue === target;
                if (operator === "/") {
                    return firstValue / secondValue === target ||
                        secondValue / firstValue === target;
                }
                return false;
            }
            return matches(first, fourth) && matches(second, third);
        });
    };
});
