const penpa_constraints = {
    'options_groups': ['general', 'sudoku', 'puzzle'],
    'options': {
        'general': ['all'],
        'sudoku': ['classic', 'arrow', 'thermo'],
        'puzzle': ['slitherlink', 'tapa']
    },
    'setting': {
        'all': [],
        'general': ['input_sudoku', 'rotation', 'custom_color_lb', 'custom_color_opt'],
        'classic': {
            'show': ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"
            ],
            'modeset': ["surface", "sudoku", "symbol", "special"],
            'submodeset': []
        },
        'arrow': {
            'show': ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                'mo_symbol_lb', "ms4", "ms_sudokumore", "li_sudokumore",
                'mo_special_lb'
            ],
            'modeset': ["surface", "sudoku", "symbol", "special"],
            'submodeset': []
        },
        'thermo': {
            'show': ["mo_surface_lb",
                "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
                'mo_symbol_lb', "ms4", "ms_sudokumore", "li_sudokumore",
                'mo_special_lb'
            ],
            'modeset': ["surface", "sudoku", "symbol", "special"],
            'submodeset': []
        },
    },
    'solving': {

    }
}