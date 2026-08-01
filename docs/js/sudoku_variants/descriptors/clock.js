(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ?
        require("../parsers/cell_descriptor.js") : root.createSudokuCellVariantDescriptor);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(createDescriptor) {
    "use strict"; return createDescriptor("clock");
});
