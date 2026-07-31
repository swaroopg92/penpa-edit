"use strict";

var family = require("./family.js");
[
    require("./mastermind.js"),
    require("./positionsums.js"),
    require("./xaverage.js"),
    require("./triplesum.js"),
    require("./partitionedsums.js"),
    require("./numberedrooms.js"),
    require("./oddsums.js"),
    require("./sumbyx.js"),
    require("./xsums.js"),
    require("./bouncing_x_sums.js"),
    require("./czech_outsider.js"),
    require("./distances.js"),
    require("./sumframe.js"),
    require("./oddevenbigsmall.js"),
    require("./firstseenoddeven.js"),
    require("./maxascending.js"),
    require("./bust.js"),
    require("./starproduct.js"),
    require("./productframe.js"),
    require("./edgedifference.js"),
    require("./outsideparity.js"),
    require("./parityparty.js"),
    require("./serbianframe.js"),
    require("./median.js"),
    require("./descriptivepairs.js"),
    require("./outside.js"),
    require("./maximin.js"),
    require("./weighted_little_killer.js"),
    require("./little_killer.js"),
    require("./evensandwich.js"),
    require("./ascendingstarters.js"),
    require("./before9.js"),
    require("./position.js"),
    require("./sumnexttonine.js"),
    require("./wrongoutsidesum.js"),
    require("./doublesandwich.js"),
    require("./before1.js"),
    require("./before1after9.js"),
    require("./innerframesum.js"),
    require("./missingdigit.js"),
    require("./nextto9.js"),
    require("./outsideconsecutive.js"),
    require("./outsidegreaterthan.js"),
    require("./outsidekiller.js"),
    require("./parityskyscrapers.js"),
    require("./pointingdifferents.js")
].forEach(function(install) {
    install(family);
});

module.exports = function installOutsideRelations(csp) {
    family.install(csp);
};
