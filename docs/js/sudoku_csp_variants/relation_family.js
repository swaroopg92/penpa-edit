(function(root, factory) {
    if (typeof module !== "undefined" && module.exports) {
        module.exports = factory;
    } else {
        root.SudokuCSPRelationFamily = factory;
    }
})(typeof globalThis !== "undefined" ? globalThis : this, function createRelationFamily(constraintName) {
    var validators = Object.create(null);

    return {
        register: function(relation, validator) {
            var handler = typeof validator === "function" ?
                { validatePartial: validator } : validator;
            if (!relation || !handler ||
                typeof handler.validatePartial !== "function" &&
                typeof handler.validateComplete !== "function") {
                throw new Error(constraintName + " relations require a name and validator.");
            }
            if (validators[relation]) {
                throw new Error(constraintName + " relation already registered: " + relation);
            }
            validators[relation] = handler;
        },
        install: function(csp) {
            if (!csp || typeof csp.registerConstraint !== "function") {
                throw new Error(constraintName + " requires SudokuCSP.registerConstraint");
            }
            csp.registerConstraint(constraintName, {
                validatePartial: function(board, clue, helpers) {
                    var handler = validators[clue.relation];
                    return handler && handler.validatePartial ?
                        handler.validatePartial(board, clue, helpers) : true;
                },
                validateComplete: function(board, clue, helpers) {
                    var handler = validators[clue.relation];
                    return handler && handler.validateComplete ?
                        handler.validateComplete(board, clue, helpers) : true;
                }
            });
        }
    };
});
