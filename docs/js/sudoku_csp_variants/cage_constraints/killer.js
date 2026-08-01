(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    return function installKiller(csp) {
        csp.registerConstraint("killers", {
            validatePartial: function(board, cage, helpers) {
                var seen = 0;
                var total = 0;
                var blanks = 0;
                for (var index = 0; index < cage.cells.length; index++) {
                    var digit = helpers.cellValue(board, cage.cells[index]);
                    if (!digit) {
                        blanks++;
                        continue;
                    }
                    var bit = 1 << digit;
                    if (seen & bit) return false;
                    seen |= bit;
                    total += board.isZeroEight ? digit - 1 : digit;
                }
                if (!cage.total) return true;
                if (total > cage.total || (!blanks && total !== cage.total)) return false;

                var available = [];
                for (var value = 1; value <= helpers.size; value++) {
                    if (!(seen & (1 << value))) available.push(value);
                }
                if (available.length < blanks) return false;
                var minimum = available.slice(0, blanks).reduce(function(sum, value) {
                    return sum + value;
                }, 0);
                var maximum = available.slice(available.length - blanks).reduce(function(sum, value) {
                    return sum + value;
                }, 0);
                return total + minimum <= cage.total && total + maximum >= cage.total;
            }
        });
    };
});
