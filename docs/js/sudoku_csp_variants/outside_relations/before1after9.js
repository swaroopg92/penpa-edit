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

            // Sum of digits BEFORE 1 OR AFTER 9, reading L→R / T→B.
            // The rule applies to whichever of {1,9} appears first in the row/col:
            //   if 1 comes first  → sum all digits before position of 1
            //   if 9 comes first  → sum all digits after  position of 9
            var b1a9_i1 = values.indexOf(1);
            var b1a9_i9 = values.indexOf(helpers.size);
            
            function b1a9_sumSlice(start, end) {
                // Inclusive-exclusive slice [start,end); returns {sum, blanks}
                var s = 0, bl = 0;
                for (var ii = start; ii < end; ii++) {
                    if (values[ii]) s += values[ii];
                    else bl++;
                }
                return { sum: s, blanks: bl };
            }
            function b1a9_canEqual(s, bl) {
                if (bl === 0) return s === clue.value;
                return s + bl <= clue.value && s + bl * (helpers.size - 1) >= clue.value;
            }
            
            if (b1a9_i1 >= 0 && b1a9_i9 >= 0) {
                // Both placed: check whichever comes first
                if (b1a9_i1 < b1a9_i9) {
                    var r1 = b1a9_sumSlice(0, b1a9_i1);
                    return b1a9_canEqual(r1.sum, r1.blanks);
                } else {
                    var r9 = b1a9_sumSlice(b1a9_i9 + 1, values.length);
                    return b1a9_canEqual(r9.sum, r9.blanks);
                }
            }
            // At least one of {1,9} is not placed – enumerate candidate positions
            var b1a9_possible = false;
            var p1_range = b1a9_i1 >= 0 ? [b1a9_i1] : values.map(function(_, ii) { return ii; }).filter(function(ii) { return values[ii] === 0; });
            var p9_range = b1a9_i9 >= 0 ? [b1a9_i9] : values.map(function(_, ii) { return ii; }).filter(function(ii) { return values[ii] === 0; });
            for (var pi = 0; pi < p1_range.length && !b1a9_possible; pi++) {
                var pos1 = p1_range[pi];
                for (var qi = 0; qi < p9_range.length && !b1a9_possible; qi++) {
                    var pos9 = p9_range[qi];
                    if (pos1 === pos9) continue;
                    if (pos1 < pos9) {
                        // 1 comes first: sum before pos1
                        var r = b1a9_sumSlice(0, pos1);
                        if (b1a9_canEqual(r.sum, r.blanks)) b1a9_possible = true;
                    } else {
                        // 9 comes first: sum after pos9
                        var r = b1a9_sumSlice(pos9 + 1, values.length);
                        if (b1a9_canEqual(r.sum, r.blanks)) b1a9_possible = true;
                    }
                }
            }
            return b1a9_possible;
        }

        family.register("before1after9", validate);
    };
});
