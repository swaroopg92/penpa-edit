(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("sumsetCages", {
        validatePartial: function(board, cages, helpers) {
            var sums = [];
            for (var i = 0; i < cages.length; i++) {
                var cage = cages[i];
                var sum = 0;
                var complete = true;
                for (var j = 0; j < cage.length; j++) {
                    var val = helpers.cellValue(board, cage[j]);
                    if (!val) {
                        complete = false;
                        break;
                    }
                    sum += val;
                }
                if (complete) {
                    if (sums.indexOf(sum) !== -1) return false;
                    sums.push(sum);
                }
            }
            return true;
        }
    });
    };
});
