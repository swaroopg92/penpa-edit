(function(root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require("../relation_family.js"));
    } else {
        root.SudokuCSPQuadRelations = factory(root.SudokuCSPRelationFamily);
        root.SudokuCSPQuadRelations.install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function(createRelationFamily) {
    return createRelationFamily("quadRelations");
});
