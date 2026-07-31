(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("disguisedPalindromes", {
        validatePartial: function(board, path, helpers) {
            if (path.length <= 1) return true;
            for (var k = 0; k < path.length; k++) {
                var isPal = true;
                var left = 0;
                var right = path.length - 1;
                while (left < right) {
                    if (left === k) left++;
                    if (right === k) right--;
                    if (left >= right) break;
                    var a = helpers.cellValue(board, path[left]);
                    var b = helpers.cellValue(board, path[right]);
                    if (a && b && a !== b) {
                        isPal = false;
                        break;
                    }
                    left++;
                    right--;
                }
                if (isPal) return true;
            }
            return false;
        },
        validateComplete: function(board, path, helpers) {
            if (path.length <= 1) return true;
            for (var k = 0; k < path.length; k++) {
                var isPal = true;
                var left = 0;
                var right = path.length - 1;
                while (left < right) {
                    if (left === k) left++;
                    if (right === k) right--;
                    if (left >= right) break;
                    var a = helpers.cellValue(board, path[left]);
                    var b = helpers.cellValue(board, path[right]);
                    if (a !== b) {
                        isPal = false;
                        break;
                    }
                    left++;
                    right--;
                }
                if (isPal) return true;
            }
            return false;
        }
    });
    };
});
