/* Contains complete list of all the supported modes */
const penpa_types = ['mode', 'sub', 'combisub', 'ms', 'ms1', 'ms3', 'ms4', 'st', 'symmode', 'combimode', 'customcolor'];
const penpa_modes = {
    'square': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'hex': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'tri': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'pyramid': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'iso': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'tetrakis_square': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'truncated_square': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'snub_square': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
    'cairo_pentagonal': {
        //modes
        'mode': ['surface', 'line', 'lineE', 'wall', 'number', 'symbol', 'special', 'cage', 'combi', 'sudoku', 'board', 'move'],
        //submodes
        'sub': ['line1', 'line2', 'line3', 'line5', 'line4',
            'lineE1', 'lineE2', 'lineE3', 'lineE4', 'lineE5',
            'number1', 'number10', 'number6', 'number5', 'number7', 'number3', 'number9', 'number4', 'number2', 'number8', 'number11',
            'specialthermo', 'specialnobulbthermo', 'specialarrows', 'specialdirection', 'specialsquareframe', 'specialpolygon',
            'cage1', 'cage2', 'move1', 'move2', 'move3',
            'sudoku1', 'sudoku2', 'sudoku3'
        ],
        //composite modes
        'combisub': ['blpo', 'blwh', 'shaka',
            'linex', 'lineox', 'edgex', 'edgexoi', 'yajilin', 'hashi',
            'edgesub',
            'battleship', 'star', 'tents', 'magnets', 'mines', 'akari', 'arrowS',
            'numfl', 'alfl'
        ],
        // shapes
        'ms': ['cross', 'line', 'frameline', 'tri', 'inequality', 'degital_f', 'dice', 'pills',
            'arrow_Short', 'arrow_S', 'arrow_cross', 'arrow_eight', 'arrow_fourtip',
            'kakuro', 'tents', 'star', 'compass', 'sudokuetc', 'sudokumore', 'polyomino',
            'angleloop', 'firefly', 'sun_moon', 'pencils', 'slovak', 'arc', 'darts', 'spans', 'neighbors'
        ],
        'ms1': ['cirlce', 'square', 'triup', 'tridown', 'triright', 'trileft', 'diamond', 'ox', 'bars', 'degital'],
        'ms3': ['math', 'arrow_B', 'arrow_N', 'arrow_tri', 'arrow_fouredge', 'arrow_GP'],
        'ms4': ['battleship'],
        // styles
        'st': ['surface1', 'surface8', 'surface3', 'surface4', 'surface2', 'surface5', 'surface6', 'surface7', 'surface9', 'surface10', 'surface11', 'surface12',
            'line3', 'line2', 'line5', 'line8', 'line9', 'line80', 'line12', 'line13', 'line40', 'line30',
            'lineE3', 'lineE2', 'lineE5', 'lineE8', 'lineE9', 'lineE21', 'lineE80', 'lineE12', 'lineE13', 'lineE30',
            'wall3', 'wall2', 'wall5', 'wall8', 'wall9', 'wall1', 'wall12', 'wall17', 'wall14',
            'number1', 'number2', 'number8', 'number3', 'number9', 'number10', 'number4', 'number0', 'number6', 'number7', 'number11', 'number5',
            'symbol1', 'symbol2',
            'cage10', 'cage7', 'cage15', 'cage16',
            'sudoku1', 'sudoku2', 'sudoku8', 'sudoku3', 'sudoku9', 'sudoku10'
        ],
        'symmode': ['content'],
        'combimode': ['content'],
        'customcolor': ['colorpicker_special']
    },
};