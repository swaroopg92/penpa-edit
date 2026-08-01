(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ?
        require("../parsers/marked_families.js") : root.SudokuVariantMarkedFamilyParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    return {
        id: "pointtonext", label: "Point to Next", constraintTypes: ["directionalMarks"], parse: parsers.pointToNext,
        inputType: { categories: ["cell"], instructions: [] }
    };
});
