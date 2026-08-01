(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ? require("../parsers/global_descriptor.js") : root.createSudokuGlobalVariantDescriptor);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(createDescriptor) {
    "use strict"; return createDescriptor("noevenneighbours");
});
