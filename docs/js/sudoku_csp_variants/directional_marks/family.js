(function(root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory(require("../relation_family.js"));
    } else {
        root.SudokuCSPDirectionalMarks = factory(root.SudokuCSPRelationFamily);
        root.SudokuCSPDirectionalMarks.install(root.SudokuCSP);
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function(createRelationFamily) {
    return createRelationFamily("directionalMarks");
});
