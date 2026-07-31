(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("fullRankGroups", {
        validatePartial: function(board, lines, helpers) {
            var rankedLines = lines.filter(function(line) { return line.rank !== null && line.rank !== undefined; });
            if (rankedLines.some(function(line) {
                return !Number.isInteger(line.rank) || line.rank < 1 || line.rank > lines.length;
            })) return false;
            var values = lines.map(function(line) {
                var digits = line.cells.map(function(cell) { return helpers.cellValue(board, cell); });
                return digits.some(function(value) { return !value; }) ? null : Number(digits.join(""));
            });
            if (values.some(function(value) { return value === null; })) return true;
            var ordered = values.slice().sort(function(first, second) { return first - second; });
            return rankedLines.every(function(line) {
                var index = lines.indexOf(line);
                return values[index] === ordered[line.rank - 1];
            });
        }
    });
    };
});
