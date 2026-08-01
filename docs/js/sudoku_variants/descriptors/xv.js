(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ?
        require("../parsers/marked_families.js") : root.SudokuVariantMarkedFamilyParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    return {
        id: "xv", label: "XV", constraintTypes: ["xv"], parse: parsers.xv,
        inputType: { categories: ["edge"], instructions: [] }
    };
});
