(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ?
        require("../parsers/authored_marks.js") : root.SudokuVariantAuthoredMarkParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    return {
        id: "pencilmarks", label: "Pencilmarks", aliases: [],
        supportedSizes: [6,7,8,9],
        constraintTypes: ["pencilmarkCells"], parse: parsers.pencilmarks,
        inputType: { categories: ["cell"], instructions: [] }
    };
});
