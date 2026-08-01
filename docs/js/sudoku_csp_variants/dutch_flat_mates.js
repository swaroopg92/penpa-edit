(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) {
        module.exports = install;
    } else {
        install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installDutchFlatMates(csp) {
        if (!csp || typeof csp.registerConstraint !== "function") {
            throw new Error("dutchFlatMates requires SudokuCSP.registerConstraint");
        }

        csp.registerConstraint("dutchFlatMates", {
            validatePartial: function(board, relation, helpers) {
                if (board.length !== 9) return false;
                if (helpers.cellValue(board, relation.cell) !== 5) return true;

                var above = relation.above ? helpers.cellValue(board, relation.above) : null;
                var below = relation.below ? helpers.cellValue(board, relation.below) : null;
                if (above === 1 || below === 9) return true;

                return !!((relation.above && !above) || (relation.below && !below));
            }
        });
    };
});
