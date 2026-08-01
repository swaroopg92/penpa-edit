(function(root, factory) {
    var createDescriptor = factory(typeof module !== "undefined" && module.exports ?
        require("./edge_families.js") : root.SudokuVariantEdgeFamilyParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = createDescriptor;
    else root.createSudokuEdgeVariantDescriptor = createDescriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    var labels = {
        arithmetic: "Arithmetic", blocksumrelations: "Block Sum Relations", consecutive: "Consecutive",
        difference: "Difference", divisor: "Divisor", eitheror: "Either Or", evensumpairs: "Even Sum Pairs",
        fives: "Fives", greater: "Greater", inequality: "Inequality", lesser: "Lesser", multiples: "Multiples",
        oddsumpairs: "Odd Sum Pairs", oneortwodifferencepairs: "One or Two Difference Pairs",
        perfectsquares: "Perfect Squares", primesums: "Prime Sums", product: "Product", ratio: "Ratio",
        sum: "Sum", sumnine: "Sum Nine", teneleven: "Ten Eleven", tenspositionproducts: "Tens Position Products",
        termination: "Termination", twodigitprimenumbers: "Two-Digit Prime Numbers", xydifference: "XY Difference",
        diagonallyconsecutive: "Diagonally Consecutive", diagonalsumisnine: "Diagonal Sum is Nine",
        diagonaltens: "Diagonal Tens"
    };
    var aliases = {
        diagonalsumisnine: ["diagonal sum is nine"], diagonaltens: ["diagonal tens"]
    };
    return function(id) {
        if (!labels[id]) throw new Error("Unknown edge Variant Descriptor: " + id);
        return {
            id: id, label: labels[id], aliases: aliases[id] || [], constraintTypes: ["edgeRelations"],
            parse: id.indexOf("diagonal") === 0 ? parsers.diagonal(id) : parsers.catalog(id),
            inputType: { categories: [id.indexOf("diagonal") === 0 ? "intersection" : "edge"], instructions: [] }
        };
    };
});
