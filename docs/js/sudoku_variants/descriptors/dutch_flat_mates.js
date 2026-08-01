(function(root, factory) {
    var descriptor = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    return {
        id: "dutchflatmates",
        label: "Dutch Flat Mates",
        aliases: ["dutch flat mates"],
        supportedSizes: [9],
        constraintTypes: ["dutchFlatMates"],
        rules: {
            "9x9": "Each digit 5 must have a 1 directly above it or a 9 directly below it, or both."
        },
        tags: ["neighbour", "position"],
        inputType: {
            categories: ["no-input"],
            instructions: ["This is a global rule and requires no additional marks."]
        },
        parse: function(evidence, emit) {
            evidence.cells().forEach(function(cell) {
                emit("dutchFlatMates", {
                    cell: cell,
                    above: cell.row > 0 ? { row: cell.row - 1, col: cell.col } : null,
                    below: cell.row + 1 < evidence.size ? { row: cell.row + 1, col: cell.col } : null
                });
            });
        }
    };
});
