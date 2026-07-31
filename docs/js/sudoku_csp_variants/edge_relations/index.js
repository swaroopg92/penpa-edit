"use strict";

var family = require("./family.js");
[
    require("./fives.js"),
    require("./difference.js"),
    require("./one_or_two_difference_pairs.js"),
    require("./sum.js"),
    require("./product.js"),
    require("./tens_position_products.js"),
    require("./termination.js"),
    require("./ten_eleven.js"),
    require("./greater.js"),
    require("./lesser.js"),
    require("./consecutive.js"),
    require("./sum_nine.js"),
    require("./even_sum_pairs.js"),
    require("./odd_sum_pairs.js"),
    require("./inequality.js"),
    require("./divisor.js"),
    require("./multiples.js"),
    require("./either_or.js"),
    require("./ratio.js"),
    require("./block_sum_relations.js"),
    require("./xy_difference.js"),
    require("./perfect_squares.js"),
    require("./prime_sums.js"),
    require("./two_digit_prime_numbers.js"),
    require("./diagonally_consecutive.js"),
    require("./diagonal_sum_is_nine.js"),
    require("./diagonal_tens.js"),
    require("./arithmetic.js")
].forEach(function(install) {
    install(family);
});

module.exports = function installEdgeRelations(csp) {
    family.install(csp);
};
