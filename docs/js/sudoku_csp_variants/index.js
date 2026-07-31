"use strict";

var installers = [
    require("./cage_constraints/index.js"),
    require("./region_constraints/index.js"),
    require("./line_constraints/index.js"),
    require("./cell_relations/index.js"),
    require("./edge_relations/index.js"),
    require("./directional_marks/index.js"),
    require("./catalog_lines/index.js"),
    require("./quad_relations/index.js"),
    require("./outside_relations/index.js"),
    require("./anti_king.js"),
    require("./anti_knight.js"),
    require("./chess_kings.js"),
    require("./knightmare.js"),
    require("./disparity.js"),
    require("./non_consecutive.js"),
    require("./diagonal_non_consecutive.js"),
    require("./no_even_neighbours.js"),
    require("./no_three_in_row.js"),
    require("./queen_digits.js"),
    require("./pirate_cells.js"),
    require("./touchy_cells.js"),
    require("./odd_even_sums.js"),
    require("./sequence_top_bottom.js")
];

module.exports = function installSudokuCSPVariants(csp) {
    installers.forEach(function(install) {
        install(csp);
    });
    return csp;
};
