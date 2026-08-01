"use strict";

var installers = [
    require("./killer.js"),
    require("./solo_killer_groups.js"),
    require("./mathdoku.js"),
    require("./sumset_cages.js"),
    require("./upperrightheavykiller.js"),
    require("./topheavy.js")
];

module.exports = function installConstraintCluster(csp) {
    installers.forEach(function(install) { install(csp); });
};
