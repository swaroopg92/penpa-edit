"use strict";

var family = require("./family.js");
[
    require("./fortress.js"),
    require("./trio.js"),
    require("./average.js"),
    require("./multiplication.js"),
    require("./cloned_strands.js"),
    require("./coded_pairs.js"),
    require("./multiple_divisor.js"),
    require("./clock.js"),
    require("./slot_machine.js"),
    require("./pinnochio.js"),
    require("./counting_neighbours.js"),
    require("./wheel.js")
].forEach(function(install) {
    install(family);
});

module.exports = function installCellRelations(csp) {
    family.install(csp);
};
