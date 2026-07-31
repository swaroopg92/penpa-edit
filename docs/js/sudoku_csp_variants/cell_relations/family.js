(function(root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require("../relation_family.js"));
    } else {
        root.SudokuCSPCellRelations = factory(root.SudokuCSPRelationFamily);
        root.SudokuCSPCellRelations.install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function(createRelationFamily) {
    return createRelationFamily("cellRelations");
});
