(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSP);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {

    return function installConstraint(csp) {
        csp.registerConstraint("mathdoku", {
        validatePartial: function(board, box, helpers) {
            var clues = box.clues;
            var assignedEdges = [];
            for (var i = 0; i < clues.length; i++) {
                var first = helpers.cellValue(board, clues[i].cells[0]);
                var second = helpers.cellValue(board, clues[i].cells[1]);
                if (first && second) {
                    first = board.isZeroEight ? first - 1 : first;
                    second = board.isZeroEight ? second - 1 : second;
                    assignedEdges.push({ first: first, second: second, target: clues[i].target });
                } else {
                    return true;
                }
            }
            if (assignedEdges.length < 4) return true;

            function canSatisfy(edges, availableOps) {
                if (edges.length === 0) return true;
                var edge = edges[0];
                var f = edge.first;
                var s = edge.second;
                var t = edge.target;

                for (var opIdx = 0; opIdx < availableOps.length; opIdx++) {
                    var op = availableOps[opIdx];
                    var possible = false;
                    if (op === "+") possible = (f + s === t);
                    else if (op === "-") possible = (Math.abs(f - s) === t);
                    else if (op === "*") possible = (f * s === t);
                    else if (op === "/") possible = (f / s === t || s / f === t);

                    if (possible) {
                        var newOps = availableOps.slice();
                        newOps.splice(opIdx, 1);
                        if (canSatisfy(edges.slice(1), newOps)) return true;
                    }
                }
                return false;
            }

            return canSatisfy(assignedEdges, ["+", "-", "*", "/"]);
        }
    });
    };
});
