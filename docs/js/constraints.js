const penpa_constraints = {
    "options_groups": ["general", "sudoku", "puzzle"],
    "options": {
        "general": ["all"],
        "sudoku": [
            "classic",
            "even",
            "odd",
            "arrow",
            "thermo",
            "little killer",
            "killer",
            "palindrome",
            "sandwich",
            "quadruple",
            "XV",
            "between line",
            "consecutive",
            "kropki"
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
        "arrow": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_symbol_lb", "ms4", "ms_sudokumore", "li_sudokumore",
                "mo_special_lb", "sub_specialarrows_lb", "sub_specialdirection_lb"
            ],
            "modeset": ["sudoku", "symbol", "special"],
            "submodeset": ["1", "sudokumore", "arrows"]
        },
        "classic": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"
            ],
            "modeset": ["sudoku"],
            "submodeset": ["1"]
        },
        "thermo": {
            "show": ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                "mo_special_lb", "sub_specialthermo_lb", "sub_specialnobulbthermo_lb"
            ],
            "modeset": ["sudoku", "special"],
            "submodeset": ["1", "thermo"]
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