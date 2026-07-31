(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPOutsideRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOutsideRelation(family) {
        function validate(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });

            if (board.length !== 8) return false;
            var val = String(clue.value).replace(/\s+/g, "");
            if (val.length !== 1 || !["O", "E", "B", "S"].includes(val.toUpperCase())) return false;
            var c = val.toUpperCase();
            for (var i = 0; i < Math.min(2, values.length); i++) {
                var v = values[i];
                if (!v) continue;
                if (c === "O" && v % 2 !== 1) return false;
                if (c === "E" && v % 2 !== 0) return false;
                if (c === "B" && v <= 4) return false;
                if (c === "S" && v > 4) return false;
            }
            return true;
        }

        family.register("oddevenbigsmall", validate);
    };
});
