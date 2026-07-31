(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("cloneShapeChecks", {
        validatePartial: function(board, check, helpers) {
            return check.valid === true;
        }
    });
    };
});
