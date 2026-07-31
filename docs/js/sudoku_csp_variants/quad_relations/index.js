"use strict";

var family = require("./family.js");
[
    require("./quadro.js"),
    require("./quadruple.js"),
    require("./exclusion.js"),
    require("./group_sum.js"),
    require("./cross_sums.js"),
    require("./determinant.js"),
    require("./clock_faces.js"),
    require("./full_or_half.js"),
    require("./mathrax.js"),
    require("./equal_sums.js"),
    require("./equal_differences.js"),
    require("./equal_products.js"),
    require("./equal_ratios.js"),
    require("./consecutive_quads.js")
].forEach(function(install) {
    install(family);
});

module.exports = function installQuadRelations(csp) {
    family.install(csp);
};
