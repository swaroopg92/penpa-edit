(function(root, factory) {
    var createDescriptor = factory(typeof module !== "undefined" && module.exports ?
        require("./marked_families.js") : root.SudokuVariantMarkedFamilyParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = createDescriptor;
    else root.createSudokuMarkedVariantDescriptor = createDescriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    var quadLabels = {
        clockfaces: "Clock Faces", consecutivequads: "Consecutive Quads", crosssums: "Cross Sums",
        determinant: "Determinant", equaldifferences: "Equal Differences", equalproducts: "Equal Products",
        equalratios: "Equal Ratios", equalsums: "Equal Sums", exclusion: "Exclusion",
        fullorhalf: "Full or Half", groupsum: "Group Sum", mathrax: "Mathrax", quadro: "Quadro"
    };
    var directionalLabels = {
        biggestneighbours: "Biggest Neighbours", deadoralivearrows: "Dead or Alive Arrows",
        detection: "Detection", eliminate: "Eliminate", pointtoprevious: "Point to Previous",
        quadmax: "Quad Max", quadmin: "Quad Min", search9: "Search 9",
        smallestneighbours: "Smallest Neighbours", sumdetector: "Sum Detector", twindetector: "Twin Detector"
    };
    return function(id) {
        if (quadLabels[id]) return {
            id: id, label: quadLabels[id], constraintTypes: ["quadRelations"],
            parse: parsers.quad(id),
            inputType: { categories: [id === "quadro" ? "no-input" : "intersection"], instructions: [] }
        };
        if (directionalLabels[id]) return {
            id: id, label: directionalLabels[id],
            constraintTypes: [id === "sumdetector" ? "sumDetectorGroups" : "directionalMarks"],
            parse: parsers.directional(id),
            inputType: { categories: [(id === "quadmax" || id === "quadmin") ? "intersection" : "cell"], instructions: [] }
        };
        throw new Error("Unknown marked Variant Descriptor: " + id);
    };
});
