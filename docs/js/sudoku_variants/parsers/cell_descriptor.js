(function(root, factory) {
    var createDescriptor = factory(typeof module !== "undefined" && module.exports ?
        require("./cell_families.js") : root.SudokuVariantCellFamilyParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = createDescriptor;
    else root.createSudokuCellVariantDescriptor = createDescriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    var labels = { average: "Average", clock: "Clock", clonedstrands: "Cloned Strands",
        codedpairs: "Coded Pairs", countingneighbours: "Counting Neighbours", fortress: "Fortress",
        pinocchio: "Pinocchio", slotmachine: "Slot Machine", trio: "Trio", wheel: "Wheel" };
    var categories = { clock: "cage", codedpairs: "cage", clonedstrands: "line",
        fortress: "cell", slotmachine: "cell", average: "edge", wheel: "intersection" };
    return function(id) {
        if (!labels[id]) throw new Error("Unknown cell Variant Descriptor: " + id);
        return { id: id, label: labels[id], aliases: id === "pinocchio" ? ["pinnochio"] : [],
            constraintTypes: ["cellRelations"], parse: parsers[id],
            inputType: { categories: [categories[id] || "cell"], instructions: [] } };
    };
});
