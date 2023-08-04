const penpa_constraints = {
    "options_groups": ["general", "sudoku", "puzzle"],
    "options": {
        "general": ["all"],
        "sudoku": [
            "classic",
            "odd even",
            "arrow",
            "thermo",
            "little killer",
            "killer",
            "difference",
            "kropki",
            "palindrome",
            "sandwich",
            "quadruple",
            "xv",
            "between line",
            "battenberg"
        ],
        "puzzle": [
            "slitherlink",
            "tapa",
            "star battle",
            "tents",
            // "heyawake",
            // "nurikabe",
            // "lits",
            // "battleships",
            "minesweeper",
            "akari",
            // "sun and moon",
            // "statue park",
            // "kakuro",
            // "kurotto",
            // "pentominous",
            // "yajilin",
            // "pencils",
            // "darts",
            // "anglers",
            // "hotaru beam"
        ]
    },
    "border": ["difference", "kropki", "quadruple", "xv", "battenberg"], // puzzle types that involves placing clues on edges and corners
    "setting": {
        "all": {
            "modeset": ["surface", "line", "lineE", "wall", "cage", "number", "symbol", "special", "combi", "sudoku"],
            "submodeset": ["", "1", "1", "", "1", "1", "circle_L", "thermo", "battleship", "1"],
            "styleset": [1, 2, 2, 2, 10, 1, 2, "", "", 1]
        },
        "general": ["input_sudoku", "rotation", "custom_color_lb"],
        "classic": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"
            ],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "odd even": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "li_circle_L", "li_square_L", "li_square", "li_circle"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_L"],
            "styleset": ["", ""]
        },
        "arrow": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms4", "ms_sudokumore", "li_sudokumore",
                "mo_special_lb", "sub_specialarrows_lb", "sub_specialdirection_lb"
            ],
            "modeset": ["sudoku", "symbol", "special"],
            "submodeset": ["1", "sudokumore", "arrows"],
            "styleset": ["", "", ""]
        },
        "thermo": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_special_lb", "sub_specialthermo_lb", "sub_specialnobulbthermo_lb"
            ],
            "modeset": ["sudoku", "special"],
            "submodeset": ["1", "thermo"],
            "styleset": ["", ""]
        },
        "little killer": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms3", "li_arrow_eight"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "arrow_eight"],
            "styleset": ["", ""]
        },
        "killer": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb",
                "mo_number_lb", "sub_number11_lb", "sub_number3_lb"
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "11"],
            "styleset": ["", 1]
        },
        "difference": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number5_lb"
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "5"],
            "styleset": ["", 6]
        },
        "kropki": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS", "ms1_bars", "li_circle", "li_bars", "ul_bars"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_SS"],
            "styleset": ["", ""]
        },
        "palindrome": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_line_lb", "sub_line1_lb", "sub_line2_lb", "sub_line3_lb"
            ],
            "modeset": ["sudoku", "line"],
            "submodeset": ["1", "2"],
            "styleset": ["", 5]
        },
        "sandwich": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb"
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 1]
        },
        "quadruple": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number5_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle", "li_circle_M"
            ],
            "modeset": ["sudoku", "number", "symbol"],
            "submodeset": ["1", "5", "circle_M"],
            "styleset": ["", "", ""]
        },
        "xv": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number5_lb",
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "5"],
            "styleset": ["", 6]
        },
        "between line": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L", "li_circle",
                "mo_line_lb", "sub_line1_lb", "sub_line2_lb", "sub_line3_lb"
            ],
            "modeset": ["sudoku", "symbol", "line"],
            "submodeset": ["1", "circle_L", "2"],
            "styleset": ["", "", 5],
        },
        "battenberg": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms4", "ms_sudokuetc", "li_sudokuetc"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "sudokuetc"],
            "styleset": ["", ""],
        },
        "slitherlink": {
            "show": ["mo_surface_lb",
                "mo_number_lb", "sub_number1_lb",
                "mo_lineE_lb", "sub_lineE1_lb", "sub_lineE2_lb", "sub_lineE3_lb", "sub_lineE4_lb", "sub_lineE5_lb",
                "mo_combi_lb", "subc2", "combisub_edgex", "li_edgex"
            ],
            "modeset": ["number", "combi"],
            "submodeset": ["1", "edgex"],
            "styleset": [1, ""]
        },
        "tapa": {
            "show": ["mo_surface_lb",
                "mo_number_lb", "sub_number4_lb"
            ],
            "modeset": ["number"],
            "submodeset": ["4"],
            "styleset": [1]
        },
        "star battle": {
            "show": ["mo_surface_lb",
                "mo_lineE_lb", "sub_lineE1_lb", "sub_lineE2_lb", "sub_lineE5_lb",
                "mo_combi_lb", "subc4", "combisub_star", "combili_star",
                "mo_symbol_lb", "ms4", "li_star", "ms_star"
            ],
            "modeset": ["symbol", "combi"],
            "submodeset": ["star", "star"],
            "styleset": ["", ""]
        },
        "tents": {
            "show": ["mo_surface_lb",
                "mo_number_lb", "sub_number1_lb",
                "mo_combi_lb", "subc4", "combisub_tents", "combili_tents",
                "mo_symbol_lb", "ms4", "li_tents", "ms_tents"
            ],
            "modeset": ["number", "combi", "symbol"],
            "submodeset": ["1", "tents", "tents"],
            "styleset": [1, "", ""]
        },
        "heyawake": {},
        "nurikabe": {},
        "lits": {},
        "battleships": {},
        "minesweeper": {
            "show": ["mo_surface_lb",
                "mo_number_lb", "sub_number1_lb",
                "mo_combi_lb", "subc4", "combisub_mines", "combili_mines",
                "mo_symbol_lb", "ms5", "li_sun_moon", "ms_sun_moon"
            ],
            "modeset": ["number", "symbol", "combi"],
            "submodeset": ["1", "sun_moon", "mines"],
            "styleset": [1, "", ""]
        },
        "akari": {
            "show": ["mo_surface_lb",
                "mo_lineE_lb", "sub_lineE1_lb", "sub_lineE2_lb", "sub_lineE5_lb",
                "mo_combi_lb", "subc4", "combisub_akari", "combili_akari",
                "mo_symbol_lb", "ms5", "li_sun_moon", "ms_sun_moon"
            ],
            "modeset": ["symbol", "combi"],
            "submodeset": ["sun_moon", "akari"],
            "styleset": ["", ""]
        },
        "sun and moon": {},
        "statue park": {},
        "kakuro": {},
        "kurotto": {},
        "pentominous": {},
        "yajilin": {},
        "pencils": {},
        "darts": {},
        "anglers": {},
        "hotaru beam": {}
    },
    "solving": {

    }
}