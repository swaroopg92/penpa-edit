(function(root, factory) {
    var descriptor = factory(typeof module !== "undefined" && module.exports ?
        require("../parsers/authored_marks.js") : root.SudokuVariantAuthoredMarkParsers);
    if (typeof module !== "undefined" && module.exports) module.exports = descriptor;
    else (root.SudokuVariantDescriptorSources || (root.SudokuVariantDescriptorSources = [])).push(descriptor);
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    return {
        id: "tictactoewinner", label: "Tic-Tac-Toe Winner", aliases: ["tic-tac-toe winner"],
        supportedSizes: [9],
        constraintTypes: ["tictactoewinner"], parse: parsers.ticTacToeWinner,
        inputType: { categories: ["line"], instructions: [] }
    };
});
