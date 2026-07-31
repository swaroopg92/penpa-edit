"use strict";

var installers = [
    require("./shaded_parity_groups.js"),
    require("./region_all_different.js"),
    require("./scattered_all_different.js"),
    require("./invalid_regions.js"),
    require("./extra_large_regions.js"),
    require("./difference2_neighbours.js"),
    require("./region_coverage.js"),
    require("./renban_regions.js"),
    require("./clone_groups.js"),
    require("./consecutive_clone_groups.js"),
    require("./shape_matchings.js"),
    require("./clone_shape_checks.js"),
    require("./hidden_clone_shape_checks.js")
];

module.exports = function installConstraintCluster(csp) {
    installers.forEach(function(install) { install(csp); });
};
