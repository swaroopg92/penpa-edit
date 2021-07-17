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
            "consecutive",
            "palindrome",
            "sandwich",
            "quadruple",
            "XV",
            "between line"
        ],
        "puzzle": [
            "slitherlink",
            "tapa",
            "star battle",
            "heyawake",
            "nurikabe",
            "lits",
            "battleships",
            "minesweeper",
            "akari",
            "sun and moon",
            "statue park",
            "kakuro",
            "kurotto",
            "pentominous",
            "yajilin"
        ]
    },
    "setting": {
        "all": [],
        "general": ["input_sudoku", "rotation", "custom_color_lb", "custom_color_opt"],
        "classic": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"
            ],
            "modeset": ["sudoku"],
            "submodeset": ["1"]
        },
        "odd even": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "li_circle_L", "li_square_L", "li_square", "li_circle"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_L"]
        },
        "arrow": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms4", "ms_sudokumore", "li_sudokumore",
                "mo_special_lb", "sub_specialarrows_lb", "sub_specialdirection_lb"
            ],
            "modeset": ["sudoku", "symbol", "special"],
            "submodeset": ["1", "sudokumore", "arrows"]
        },
        "thermo": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_special_lb", "sub_specialthermo_lb", "sub_specialnobulbthermo_lb"
            ],
            "modeset": ["sudoku", "special"],
            "submodeset": ["1", "thermo"]
        },
        "little killer": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms3", "li_arrow_eight"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "arrow_eight"]
        },
        "killer": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb",
                "mo_number_lb", "sub_number11_lb", "sub_number3_lb"
            ],
            "modeset": ["sudoku", "number"],
            "submodeset": ["1", "11"]
        },
        "difference": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle", "li_circle_SS"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_SS"]
        },
        "consecutive": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS", "ms1_bars", "li_circle", "li_bars", "ul_bars"
            ],
            "modeset": ["sudoku", "symbol"],
            "submodeset": ["1", "circle_SS"]
        },
        "slitherlink": {
            "show": ["mo_surface_lb",
                "mo_number_lb", "sub_number1_lb",
                "mo_lineE_lb", "sub_lineE1_lb", "sub_lineE2_lb", "sub_lineE3_lb", "sub_lineE4_lb", "sub_lineE5_lb",
                "mo_combi_lb", "subc2", "combisub_edgex", "li_edgex"
            ],
            "modeset": ["number", "combi"],
            "submodeset": ["1", "edgex"]
        },
        "tapa": {
            "show": ["mo_surface_lb",
                "mo_number_lb", "sub_number4_lb"
            ],
            "modeset": ["number"],
            "submodeset": ["4"]
        },
    },
    "solving": {

    }
}