(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = install;
    } else {
        install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOddEvenSums(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("oddEvenSums requires SudokuCSP.registerConstraint");
        }

        csp.registerConstraint("oddEvenSums", {
            validatePartial: function(board, clue, helpers) {
                var sum = 0;
                for (var index = 0; index < clue.cells.length; index++) {
                    var value = helpers.cellValue(board, clue.cells[index]);
                    if (!value) return true;
                    sum += value;
                }
                return clue.parity === "odd" ? sum % 2 === 1 : sum % 2 === 0;
            }
        });
    };
});
