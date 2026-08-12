const penpa_constraints = {
    "options_groups": ["general", "sudoku", "puzzle"],
    "options": {
        "general": ["all"],
        "sudoku": ["classic","0 to 8","odd even","diagonal","anti diagonal","anti king","anti knight","non consecutive","arrow","thermo","little killer","killer","difference","kropki","palindrome","sandwich","quadruple","xv","between","battenburg","skyscraper","uniquerectangles","sumskyscrapers","sumsandwich","positionsums","inequalitytriples","oneortwodifferencepairs","teneleven","tenspositionproducts","fullorhalf","samesum","xaverage","triplesum","partitionedsums","oneknightstep","windoku","odd even bridge","odd even count","odd even sum",
            "zones",
            "somewhere",
            "argyle"],
        "puzzle": [
            "slitherlink",
            "tapa",
            "star battle",
            "tents",
        "mastermind",
    "mastermind",
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
    "border": ["difference", "kropki", "xv", "battenburg"], // puzzle types that involves placing clues on edges and corners
    "setting": {
        "all": {
            "modeset": ["surface", "multicolor", "line", "lineE", "wall", "cage", "number", "symbol", "special", "combi", "sudoku"],
            "submodeset": ["", "1", "1", "", "1", "1", "circle_L", "thermo", "battleship", "1"],
            "styleset": [1, 2, 2, 2, 10, 1, 2, "", "", 1]
        },
        "general": ["input_sudoku", "rotation", "custom_color_lb"],

        "0 to 8": {
            "show": ["sub_number3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": ["1"]
        },
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
        "meandering diagonals": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_line_lb", "sub_line2_lb", "st_line2_lb"],
            "modeset": ["sudoku", "line"],
            "submodeset": ["1", "2"],
            "styleset": ["", 2]
        },
        "odd even bridge": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L", "li_circle",
                "mo_line_lb", "sub_line1_lb", "sub_line2_lb", "sub_line3_lb"
            ],
            "modeset": ["sudoku", "symbol", "line"],
            "submodeset": ["1", "circle_L", "2"],
            "styleset": ["", "", 5]
        },
        "odd even count": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "li_circle_L", "li_square_L", "li_square", "li_circle"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_L"],
            "styleset": ["", ""]
        },
        "odd even sum": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb",
                "mo_number_lb", "sub_number11_lb"
            ],
            "modeset": ["sudoku", "cage", "number"],
            "submodeset": ["1", "1", "11"],
            "styleset": ["", 10, 1]
        },
        "diagonal": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "anti diagonal": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "anti king": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "anti knight": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "non consecutive": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "arrow": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms4", "ms_sudokumore", "li_sudokumore",
                "mo_special_lb", "sub_specialarrows_lb", "sub_specialdirection_lb"
            ],
            "modeset": ["sudoku", "special"],
            "submodeset": ["1", "arrows"],
            "styleset": ["", ""]
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
                "mo_number_lb", "sub_number1_lb",
                "mo_symbol_lb", "ms3", "li_arrow_eight"
            ],
            "modeset": ["sudoku", "number", "symbol"],
            "submodeset": ["1", "1", "arrow_eight"],
            "styleset": ["", 1, 2],
            "outside": true
        },
        "killer": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb",
                "mo_number_lb", "sub_number11_lb", "sub_number3_lb"
            ],
            "modeset": ["sudoku", "cage", "number"],
            "submodeset": ["1", "1", "11"],
            "styleset": ["", 10, 1]
        },
        "upperrightheavykiller": {
            "show": [
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb"
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 1]
        },

        "zones": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb",
                "mo_number_lb", "sub_number11_lb", "sub_number3_lb"
            ],
            "modeset": ["sudoku", "cage", "number"],
            "submodeset": ["1", "1", "11"],
            "styleset": ["", 10, 1]
        },

        "somewhere": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb",
                "mo_number_lb", "sub_number11_lb", "sub_number3_lb"
            ],
            "modeset": ["sudoku", "cage", "number"],
            "submodeset": ["1", "1", "11"],
            "styleset": ["", 10, 1]
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
        "kropkipairs": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS", "ms1_bars", "li_circle", "li_bars", "ul_bars"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_SS"],
            "styleset": ["", ""]
        },
        "consecutive": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_bars", "li_bars", "ul_bars"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "bars_G"],
            "styleset": ["", ""]
        },
        "consecutivepairs": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_bars", "li_bars", "ul_bars"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "bars_G"],
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
        "tictactoewinner": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_line_lb", "sub_line2_lb", "st_line5_lb"],
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
                "mo_number_lb", "sub_number5_lb"
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "5"],
            "styleset": ["", 6]
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
        "xvpairs": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number5_lb",
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "5"],
            "styleset": ["", 6]
        },
        "between": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L", "li_circle",
                "mo_line_lb", "sub_line1_lb", "sub_line2_lb", "sub_line3_lb"
            ],
            "modeset": ["sudoku", "symbol", "line"],
            "submodeset": ["1", "circle_L", "2"],
            "styleset": ["", "", 5],
        },
        "battenburg": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms4", "ms_sudokuetc", "li_sudokuetc"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "sudokuetc"],
            "styleset": ["", ""],
        },
        "skyscraper": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 1]
        },
        "uniquerectangles": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "sumskyscrapers": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 1],
            "outside": true
        },
        "partitionedsums": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 1],
            "outside": true
        },
        "oneknightstep": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb", "mo_surface_lb"],
            "modeset": ["sudoku", "surface"],
            "submodeset": ["1", ""],
            "styleset": ["", 1]
        },
        "sumsandwich": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number10_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "10"],
            "styleset": ["", 1],
            "outside": true
        },
        "positionsums": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number10_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "10"],
            "styleset": ["", 1],
            "outside": true
        },
        "pinocchio": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb", "st_number0_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 0]
        },
        "termination": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number5_lb", "st_number0_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "5"],
            "styleset": ["", 0]
        },
        "inequalitytriples": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"],
            "modeset": ["sudoku"],
            "submodeset": ["1"],
            "styleset": [""]
        },
        "oneortwodifferencepairs": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS", "li_circle"],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_SS"],
            "styleset": ["", ""]
        },
        "teneleven": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_bars", "li_bars", "ul_bars"],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "bars_G"],
            "styleset": ["", ""]
        },
        "tenspositionproducts": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number5_lb", "st_number6_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "5"],
            "styleset": ["", 6]
        },
        "fullorhalf": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "li_circle_SS", "li_square_SS", "li_circle", "li_square"],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_SS"],
            "styleset": ["", ""]
        },
        "samesum": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb", "mo_surface_lb"],
            "modeset": ["sudoku", "surface"],
            "submodeset": ["1", ""],
            "styleset": ["", 1]
        },
        "xaverage": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number1_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "1"],
            "styleset": ["", 1],
            "outside": true
        },
        "triplesum": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number6_lb"],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "6"],
            "styleset": ["", 1],
            "outside": true
        },
        "windoku": {
            "show": [],
            "modeset": [],
            "submodeset": [],
            "styleset": []
        },
        "argyle": {
            "show": [],
            "modeset": [],
            "submodeset": [],
            "styleset": []
        },
        "alternatingstripes": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_line_lb", "sub_line2_lb", "st_line5_lb"],
            "modeset": ["sudoku", "line"],
            "submodeset": ["1", "2"],
            "styleset": ["", 5]
        },
        "productframe": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number6_lb", "mo_symbol_lb", "ms3", "li_arrow_eight"],
            "modeset": ["sudoku", "number", "symbol"],
            "submodeset": ["1", "6", "arrow_eight"],
            "styleset": ["", 1, 2],
            "outside": true
        },
        "product little killer": {
            "show": ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_number_lb", "sub_number6_lb", "mo_symbol_lb", "ms3", "li_arrow_eight"],
            "modeset": ["sudoku", "number", "symbol"],
            "submodeset": ["1", "6", "arrow_eight"],
            "styleset": ["", 1, 2],
            "outside": true
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
                "mo_symbol_lb", "ms5", "ms_sun_moon"
            ],
            "modeset": ["number", "symbol", "combi"],
            "submodeset": ["1", "sun_moon", "mines"],
            "styleset": [1, "", ""]
        },
        "akari": {
            "show": ["mo_surface_lb",
                "mo_lineE_lb", "sub_lineE1_lb", "sub_lineE2_lb", "sub_lineE5_lb",
                "mo_combi_lb", "subc4", "combisub_akari", "combili_akari",
                "mo_symbol_lb", "ms5", "ms_sun_moon"
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

// Svelte runs as an ES module and cannot see top-level lexical bindings from
// legacy scripts. Expose the same registry so the variation catalog can extend
// the native selector and mode settings after Penpa initializes.
if (typeof window !== "undefined") window.penpa_constraints = penpa_constraints;
