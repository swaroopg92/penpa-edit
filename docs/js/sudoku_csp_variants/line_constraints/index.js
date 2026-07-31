"use strict";

var installers = [
    require("./full_rank_groups.js"),
    require("./rossini_lines.js"),
    require("./palindromes.js"),
    require("./almost_palindromes.js"),
    require("./disguised_palindromes.js")
];

module.exports = function installConstraintCluster(csp) {
    installers.forEach(function(install) { install(csp); });
};
