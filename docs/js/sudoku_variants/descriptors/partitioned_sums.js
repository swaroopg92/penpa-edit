(function(root, factory) {
    var descriptor = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";
    return {
        id: "partitionedsums",
        label: "Partitioned Sums",
        aliases: ["partitioned sums"],
        constraintTypes: ["outsideRelations"],
        rules: {
            "9x9": "Outside clues give consecutive sums formed by partitioning the corresponding row or column."
        },
        tags: ["math"],
        inputType: {
            categories: ["cell"],
            instructions: []
        },
        parse: function(evidence, emit) {
            for (var index = 0; index < evidence.size; index++) {
                var columnValues = [];
                var rowValues = [];
                for (var layer = 1; layer <= 5; layer++) {
                    var top = evidence.outsideNumber("top", index, layer);
                    var left = evidence.outsideNumber("left", index, layer);
                    if (top !== null) columnValues.unshift(top);
                    if (left !== null) rowValues.unshift(left);
                }
                if (columnValues.length) {
                    emit("outsideRelations", {
                        relation: "partitionedsums",
                        value: columnValues,
                        cells: Array.from({ length: evidence.size }, function(_, row) {
                            return { row: row, col: index };
                        }),
                        axis: "column"
                    });
                }
                if (rowValues.length) {
                    emit("outsideRelations", {
                        relation: "partitionedsums",
                        value: rowValues,
                        cells: Array.from({ length: evidence.size }, function(_, col) {
                            return { row: index, col: col };
                        }),
                        axis: "row"
                    });
                }
            }
        }
    };
});
