"use strict";

var family = require("./family.js");
[
    require("./dead_or_alive_arrows.js"),
    require("./twin_detector.js"),
    require("./eliminate.js"),
    require("./point_to_next.js"),
    require("./point_to_previous.js"),
    require("./biggest_neighbours.js"),
    require("./smallest_neighbours.js"),
    require("./quad_max.js"),
    require("./quad_min.js"),
    require("./search_nine.js"),
    require("./sum_detector.js"),
    require("./detection.js")
].forEach(function(install) {
    install(family);
});

module.exports = function installDirectionalMarks(csp) {
    family.install(csp);
};
