(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ?
        require("../parsers/marked_families.js") : root.SudokuVariantMarkedFamilyParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    return {
        id: "kropkipairs", label: "Kropki Pairs", aliases: ["kropki pairs"], constraintTypes: ["kropki"], parse: parsers.kropki,
        canGenerateFromScratch: true,
        tags: ["canGenerateFromScratch"],
        inputType: { categories: ["edge"], instructions: ["Click an edge to cycle through a black dot, a white dot, and no dot."] }
    };
});
