(function(root, factory) {
    var createDescriptor = factory(
        typeof module !== "undefined" && module.exports ? require("./global.js") : root.SudokuVariantGlobalParsers
    );
    if (typeof module !== "undefined" && module.exports) module.exports = createDescriptor;
    else root.createSudokuGlobalVariantDescriptor = createDescriptor;
})(typeof globalThis !== "undefined" ? globalThis : this, function(parsers) {
    "use strict";
    var definitions = {
        diagonal: ["Diagonal", "diagonalAllDifferent", "diagonal"],
        antidiagonal: ["Anti Diagonal", "antiDiagonals", "antiDiagonal", ["anti diagonal"]],
        argyle: ["Argyle", "diagonalAllDifferent", "argyle", [], [9]],
        antiking: ["Anti King", "antiKing", "antiKing", ["anti king"]],
        sequencetopbottom: ["Sequence Top-Bottom", "sequenceTopBottom", "sequenceTopBottom", ["sequence top-bottom"]],
        poleposition: ["Pole Position", "polePosition", "polePosition"],
        citywalk: ["City Walk", "citywalk", "citywalk"],
        antiknight: ["Anti Knight", "antiKnight", "antiKnight", ["anti knight"]],
        chesskings: ["Chess Kings", "chessKings", "chessKings", ["chess kings"]],
        knightmare: ["Knightmare", "knightmare", "knightmare"],
        nonconsecutive: ["Non Consecutive", "nonConsecutive", "nonConsecutive", ["non consecutive"]],
        symmetricunequal: ["Symmetric Unequal", "symmetricUnequal", "symmetricUnequal", ["symmetric unequal"]],
        oddlabyrinth: ["Odd Labyrinth", "oddLabyrinth", "oddLabyrinth", ["odd labyrinth"]],
        evenpassage: ["Even Passage", "evenPassage", "evenPassage", ["even passage"]],
        divisiblebythree: ["Divisible by Three", "divisiblebythree", "divisibleByThree", ["divisible by three"]],
        oddtapa: ["Odd Tapa", "oddtapa", "oddTapa", ["odd tapa"]],
        tictactoe: ["Tic-Tac-Toe", "tictactoe", "ticTacToe", ["tic-tac-toe"]],
        mirror: ["Mirror", "cloneGroups", "mirror"],
        diagonallynonconsecutive: ["Diagonally Non-Consecutive", "diagonalNonConsecutive", "diagonalNonConsecutive"],
        noevenneighbours: ["No Even Neighbours", "noEvenNeighbours", "noEvenNeighbours"],
        nothreeinarow: ["No Three in a Row", "noThreeInRow", "noThreeInRow"],
        queen: ["Queen", "queenDigits", "queen"],
        pirate: ["Pirate", "pirateCells", "pirate"],
        touchy: ["Touchy", "touchyCells", "touchy"],
        unicorn: ["Unicorn", "unicorn", "unicorn"],
        disjoint: ["Disjoint Groups", "diagonalAllDifferent", "disjoint", ["disjoint groups"]],
        windoku: ["Windoku", "regionAllDifferent", "windoku", [], [9]]
    };
    return function(id) {
        var definition = definitions[id];
        if (!definition) throw new Error("Unknown global variant descriptor: " + id);
        return {
            id: id, label: definition[0], aliases: definition[3] || [],
            supportedSizes: definition[4] || [6, 7, 8, 9],
            constraintTypes: [definition[1]], parse: parsers[definition[2]],
            tags: ["global", "canGenerateFromScratch"],
            canGenerateFromScratch: true,
            inputType: { categories: ["no-input"], instructions: ["This is a global rule and requires no additional marks."] }
        };
    };
});
