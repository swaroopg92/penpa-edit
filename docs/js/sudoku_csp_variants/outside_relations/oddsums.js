(function(root, factory) {
    var install = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = install;
    else install(root.SudokuCSPOutsideRelations);
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    return function installOutsideRelation(family) {
        function checkSumsSequence(values, clueSequence, variant, axis) {
            var memo = {};
        
            function search(index, clueIndex, currentSum) {
                if (index === values.length) {
                    if (currentSum > 0) {
                        if (clueIndex < clueSequence.length && currentSum === clueSequence[clueIndex]) {
                            clueIndex++;
                        } else {
                            return false;
                        }
                    }
                    return clueIndex === clueSequence.length;
                }
        
                var state = index + "," + clueIndex + "," + currentSum;
                if (memo[state] !== undefined) return memo[state];
        
                var v = values[index];
                var possibleValues = v ? [v] : [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
                for (var i = 0; i < possibleValues.length; i++) {
                    var val = possibleValues[i];
                    var canBeValid = false;
                    var canBeSeparator = false;
        
                    if (variant === "oddsums") {
                        if (val % 2 === 1) canBeValid = true;
                        else canBeSeparator = true;
                    } else if (variant === "japanesesums") {
                        canBeValid = true;
                        canBeSeparator = true;
                    } else if (variant === "bigsmalljapanesesums") {
                        if (axis === "column") {
                            if (val >= 5 && val <= 9) canBeValid = true;
                            else if (val >= 1 && val <= 4) canBeSeparator = true;
                        } else if (axis === "row") {
                            if (val >= 1 && val <= 4) canBeValid = true;
                            else if (val >= 5 && val <= 9) canBeSeparator = true;
                        }
                    }
        
                    if (canBeSeparator) {
                        if (currentSum > 0) {
                            if (clueIndex < clueSequence.length && currentSum === clueSequence[clueIndex]) {
                                if (search(index + 1, clueIndex + 1, 0)) return memo[state] = true;
                            }
                        } else {
                            if (search(index + 1, clueIndex, 0)) return memo[state] = true;
                        }
                    }
        
                    if (canBeValid) {
                        var newSum = currentSum + val;
                        if (clueIndex < clueSequence.length && newSum <= clueSequence[clueIndex]) {
                            if (search(index + 1, clueIndex, newSum)) return memo[state] = true;
                        }
                    }
                }
                return memo[state] = false;
            }
        
            return search(0, 0, 0);
        }

        function validate(board, clue, helpers) {
            var values = clue.cells.map(function(cell) {
                return helpers.cellValue(board, cell);
            });

            return checkSumsSequence(values, clue.value, clue.relation, clue.axis);
        }

        ["oddsums","japanesesums","bigsmalljapanesesums"].forEach(function(relation) {
            family.register(relation, validate);
        });
    };
});
