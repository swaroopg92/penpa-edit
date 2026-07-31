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

            var parity = clue.relation === "evensandwich" ? 0 : 1;
            var found = [];
            for (var sandwichIndex = 1; sandwichIndex < values.length - 1; sandwichIndex++) {
                if (values[sandwichIndex - 1] && values[sandwichIndex] && values[sandwichIndex + 1] &&
                    values[sandwichIndex - 1] % 2 === parity && values[sandwichIndex + 1] % 2 === parity) {
                    found.push(values[sandwichIndex]);
                }
            }
            var expected = (clue.clues || []).slice().sort(function(a, b) { return a - b; });
            found.sort(function(a, b) { return a - b; });
            for (var foundIndex = 0; foundIndex < found.length; foundIndex++) {
                var expectedIndex = expected.indexOf(found[foundIndex]);
                if (expectedIndex < 0) return false;
                expected.splice(expectedIndex, 1);
            }
            return values.some(function(value) { return !value; }) || expected.length === 0;
        }

        ["evensandwich","oddsandwich"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
