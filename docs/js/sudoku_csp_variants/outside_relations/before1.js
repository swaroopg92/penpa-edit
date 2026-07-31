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

            var marker = clue.relation === "before1" ? 1 : helpers.size;
            var markerIndex = values.indexOf(marker);
            if (markerIndex < 0) return true;
            var segmentStart = clue.relation === "before1" ? 0 : markerIndex + 1;
            var segmentEnd = clue.relation === "before1" ? markerIndex : values.length;
            var segmentSum = 0, segmentBlanks = 0;
            for (var segmentIndex = segmentStart; segmentIndex < segmentEnd; segmentIndex++) {
                if (values[segmentIndex]) segmentSum += values[segmentIndex];
                else segmentBlanks++;
            }
            if (!segmentBlanks) return segmentSum === clue.value;
            return segmentSum + segmentBlanks <= clue.value &&
                segmentSum + segmentBlanks * helpers.size >= clue.value;
        }

        ["before1","after9"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
