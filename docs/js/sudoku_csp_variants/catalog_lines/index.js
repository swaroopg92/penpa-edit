"use strict";

var family = require("./family.js");
[
    require("./parity_lines.js"),
    require("./renban.js"),
    require("./consecutive_on_line.js"),
    require("./creasing.js"),
    require("./meandering_diagonals.js"),
    require("./alternating_stripes.js"),
    require("./between.js"),
    require("./tinder.js"),
    require("./equal_sum_line.js"),
    require("./german_whispers.js"),
    require("./up_and_down.js"),
    require("./factor_lines.js"),
    require("./twenty_four_trio.js"),
    require("./sequence.js")
].forEach(function(install) {
    install(family);
});

module.exports = function installCatalogLines(csp) {
    family.install(csp);
};
