(function(root, factory) {
    var descriptor = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    return {
        id: "killer",
        label: "Killer",
        constraintTypes: ["killers"],
        rules: {
            "9x9": "The number at the top-left of each cage is its digit sum, and digits do not repeat within a cage."
        },
        tags: ["math"],
        inputType: {
            categories: ["cage"],
            instructions: ["Drag across cells to make a cage, then enter its Killer sum."]
        },
        parse: function(evidence, emit) {
            evidence.cages().forEach(function(cage) {
                emit("killers", { cells: cage.cells, total: cage.total });
            });
        }
    };
});
