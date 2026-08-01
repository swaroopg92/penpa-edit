(function(root, factory) {
    var descriptor = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    return {
        id: "multiplication",
        label: "Multiplication Table",
        aliases: ["multiplication table"],
        constraintTypes: ["cellRelations"],
        rules: {
            "9x9": "The bottom-row number in each cage is the product of all digits in its top row."
        },
        tags: ["math"],
        inputType: {
            categories: ["cage"],
            instructions: ["Draw each multiplication cage."]
        },
        parse: function(evidence, emit) {
            evidence.cages().forEach(function(cage) {
                var rows = cage.cells.map(function(cell) { return cell.row; });
                var topRow = Math.min.apply(null, rows);
                var bottomRow = Math.max.apply(null, rows);
                var top = cage.cells.filter(function(cell) { return cell.row === topRow; })
                    .sort(function(first, second) { return first.col - second.col; });
                var bottom = cage.cells.filter(function(cell) { return cell.row === bottomRow; })
                    .sort(function(first, second) { return first.col - second.col; });
                if (topRow !== bottomRow && top.length && bottom.length) {
                    emit("cellRelations", {
                        relation: "multiplication",
                        top: top,
                        bottom: bottom
                    });
                }
            });
        }
    };
});
