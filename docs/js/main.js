// Including meta allows CMD to work on Mac
let isCtrlKeyHeld = e => e.ctrlKey || e.metaKey;
let isCtrlKeyPressed = key => key === "Control" || key === "Meta";
let isShiftKeyHeld = e => e.shiftKey;
let isShiftKeyPressed = key => key === "Shift";
let isAltKeyHeld = e => e.altKey;
let isAltKeyPressed = key => key === "Alt";

onload = function() {

    // Detect mobile or Ipad beforing booting
    var ua = navigator.userAgent;
    var ondown_key;
    let is_iPad = (!(ua.toLowerCase().match("iphone")) && ua.maxTouchPoints > 1);
    let is_iPad2 = (navigator.platform === "MacIntel" && typeof navigator.standalone !== "undefined");
    let is_iPad3 = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        ondown_key = "touchstart";
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0 || is_iPad || is_iPad2 || is_iPad3) {
        ondown_key = "touchstart";
    } else {
        ondown_key = "mousedown";
    }
    this.ondown_key = ondown_key;

    // Declare custom color picker
    $(colorpicker_special).spectrum({
        type: "component",
        preferredFormat: "hex",
        showInput: true,
        chooseText: "OK",
        // cancelText: "No way",
        // showAlpha: true,
        // allowAlpha: true,
        // allowEmpty: true,
        togglePaletteOnly: true,
        togglePaletteMoreText: 'more',
        togglePaletteLessText: 'less',
        showPalette: true,
        hideAfterPaletteSelect: true,
        maxSelectionSize: 8,
        showSelectionPalette: true,
        palette: [
            ["#000", "#444", "#666", "#999", "#ccc", "#eee", "#f3f3f3", "#fff"],
            ["#f00", "#f90", "#ff0", "#0f0", "#0ff", "#00f", "#90f", "#f0f"],
            ["#ea9999", "#f9cb9c", "#ffe599", "#b6d7a8", "#a2c4c9", "#9fc5e8", "#b4a7d6", "#d5a6bd"],
            ["#e06666", "#f6b26b", "#ffd966", "#93c47d", "#76a5af", "#6fa8dc", "#8e7cc3", "#c27ba0"],
            ["#c00", "#e69138", "#f1c232", "#6aa84f", "#45818e", "#3d85c6", "#674ea7", "#a64d79"],
            ["#00008b", "#187bcd", "#c0e0ff", "#3085d6", "#eecab1", "#208020", "#4c9900", "#b3ffb3"],
            ["#ffcc80", "#777777", "#b3b3b3", "#ffa3a3", "#ffffa3", "#f0f0f0", "#ffb3ff", "#cc99ff"]
        ],
        localStorageKey: "spectrum.homepage", // Any Spectrum with the same string will share selection, data stored locally in the browser
    });

    boot();

    document.addEventListener("beforeunload", function(eve) {
        eve.returnValue = "Move page.";
    }, { passive: false });

    var checkms = 0; // Temporary variable for hover event

    //canvas
    canvas.addEventListener("touchend", onUp, { passive: false });
    canvas.addEventListener("mouseup", onUp, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("mousemove", onMove, { passive: false });
    canvas.addEventListener("mouseout", onOut, { passive: false });
    canvas.addEventListener("contextmenu", onContextmenu, { passive: false });
    document.addEventListener("keydown", onKeyDown, { passive: false });
    document.addEventListener("keyup", onKeyUp, { passive: false });

    function onDown(e) {
        if ((ondown_key === "mousedown" && e.button !== 1) || (ondown_key === "touchstart")) { // Ignore Middle button
            if (e.type === "mousedown") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
                e.preventDefault(); // When both mouse and touch start, only touch
            }
            if (ondown_key === "mousedown" && event.button !== 2 && pu.mode[pu.mode.qa].edit_mode !== "sudoku") { // not right click and so improve the coordinate system for certain modes
                var obj = coord_point(event, 'flex');
            } else {
                var obj = coord_point(event);
            }
            var x = obj.x,
                y = obj.y,
                num = obj.num;
            if (pu.point[num].use === 1) {
                if (event.button === 2) { // right click
                    pu.mouse_mode = "down_right";
                    pu.mouse_click = 2;
                    pu.mouseevent(x, y, num, isCtrlKeyHeld(e));
                } else { // Left click or tap
                    pu.mouse_mode = "down_left";
                    pu.mouse_click = 0;
                    pu.mouseevent(x, y, num, isCtrlKeyHeld(e));
                }
            }
        }
    }

    function onUp(e) {
        if ((ondown_key === "mousedown" && e.button !== 1) || (ondown_key === "touchstart")) { // Ignore Middle button
            if (e.type === "mouseup") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
                e.preventDefault(); // When both mouse and touch start, only touch
            }
            if (ondown_key === "mousedown" && (pu.mode[pu.mode.qa].edit_mode === "combi") && // to handle mobile/ipad users for up events for certain modes
                (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "yajilin" ||
                    pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "akari")) {
                var obj = coord_point(event, 'flex');
            } else {
                var obj = coord_point(event);
            }
            var x = obj.x,
                y = obj.y,
                num = obj.num;
            pu.mouse_mode = "up";
            pu.mouse_click = 0;
            pu.mouseevent(x, y, num);
        }
    }

    function onMove(e) {
        if ((ondown_key === "mousedown" && e.buttons !== 4) || (ondown_key === "touchstart")) { // Ignore Middle button
            if (e.type === "mousemove") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
            }
            e.preventDefault();
            if (event.buttons === 2) { // Right click and moving
                pu.mouse_click = 2;
                var obj = coord_point(event, 'flex');
            } else if ((ondown_key === "touchstart" || event.buttons === 1) && pu.mode[pu.mode.qa].edit_mode === "sudoku") { // Left click/Ipad and moving in Sudoku Mode
                pu.mouse_click = 0;
                var obj = coord_point(event, 'flex');
            } else {
                if (((pu.mode[pu.mode.qa].edit_mode === "combi") && (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "yajilin" ||
                        pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "akari"))) {
                    var obj = coord_point(event, 'flex');
                } else {
                    var obj = coord_point(event);
                }
                pu.mouse_click = 0;
            }
            var x = obj.x,
                y = obj.y,
                num = obj.num;
            if (pu.point[num].use === 1) {
                pu.mouse_mode = "move";
                pu.mouseevent(x, y, num);
            }
        }
    }

    function onOver(e) {
        return;
    }

    function onOut() {
        pu.mouse_mode = "out";
        pu.mouse_click = 0;
        pu.mouseevent(0, 0, 0);
        return;
    }

    function onContextmenu(e) { //右クリック
        e.preventDefault();
    }

    // Variables for Tab selector
    let modes = ["Surface",
        "Line Normal", "Line Diagonal", "Line Free", "Line Middle", "Line Helper",
        "Edge Normal", "Edge Diagonal", "Edge Free", "Edge Helper", "Edge Erase",
        "Wall",
        "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side", "Number Tapa",
        "Sudoku Normal", "Sudoku Corner", "Sudoku Centre",
        "Shape",
        "Special", "Thermo", "Sudoku Arrow",
        "Composite"
    ];

    let modes_text = ["Surface",
        "Line Normal", "Line Diagonal", "Line Free", "Line Middle", "Line Helper",
        "Edge Normal", "Edge Diagonal", "Edge Free", "Edge Helper", "Edge Erase",
        "Wall",
        "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side", "Number Tapa",
        "Sudoku Normal", "Sudoku Corner", "Sudoku Centre",
        "Shape",
        "Special", "Thermo", "Sudoku Arrow",
        "Composite"
    ];

    let modes_mapping = ["surface",
        "sub_line1", "sub_line2", "sub_line3", "sub_line5", "sub_line4",
        "sub_lineE1", "sub_lineE2", "sub_lineE3", "sub_lineE4", "sub_lineE5",
        "wall",
        "sub_number1", "sub_number10", "sub_number6", "sub_number5", "sub_number7", "sub_number3", "sub_number9", "sub_number4",
        "sub_sudoku1", "sub_sudoku2", "sub_sudoku3",
        "symbol",
        "special", "sub_specialthermo", "sub_specialarrows",
        "combi"
    ];
    let previous_mode = "surface";
    let previous_submode = 1;
    let previous_length = 2;
    let counter_index = 0;
    let present_submode;
    let shift_counter = 0;
    let shift_numkey = false;
    let shift_release_time = -1e5;
    let shift_time_limit = 15; // milliseconds
    let ctrl_counter = 0;
    let ctrl_numkey = false;
    let ctrl_release_time = -1e5;
    let number_release_time = -1e5;
    let number_release_limit = 300; // milliseconds
    let previousdigit1 = false;

    function onKeyDown(e) {
        if (e.target.type === "number" ||
            e.target.type === "text" ||
            e.target.id === "savetextarea_pp" ||
            e.target.id === "custom_message" ||
            e.target.id === "iostring" ||
            e.target.id === "inputtext" ||
            e.target.id === "select2_search" ||
            e.target.id === "saveinforules" ||
            e.target.id === "urlstring") {
            // For input form
        } else {
            var key = e.key;
            var keycode = e.keyCode;
            var code = e.code;
            var keylocation = e.location;
            var str_num = "1234567890";
            var str_alph_low = "abcdefghijklmnopqrstuvwxyz";
            var str_alph_up = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var str_sym = "!\"#$%&\'()-=^~|@[];+:*,.<>/?_£§¤";

            if ((Date.now() - shift_release_time) < shift_time_limit) {
                shift_counter = 1;
                pu.submode_check("sub_sudoku2");
                shift_release_time = -1e5;
            }

            // shortcut to styles in surface mode
            if (pu.mode[pu.mode.qa].edit_mode === "surface" &&
                str_num.indexOf(key) != -1 &&
                previousdigit1 &&
                ((Date.now() - number_release_time) < number_release_limit)) {
                key = 1 + key;
                number_release_time = -1e5;
            }

            // For shift shortcut in Sudoku mode, modify the numpad keys
            // keylocation 3 indicates numlock is ON and number pad is being used
            if (pu.mode[pu.mode.qa].edit_mode === "sudoku" && !isShiftKeyPressed(key) && keylocation === 3 && !isCtrlKeyHeld(e) && !isAltKeyHeld(e)) {
                switch (keycode) {
                    case 45:
                        key = "0";
                        shift_numkey = true;
                        break;
                    case 35:
                        key = "1";
                        shift_numkey = true;
                        break;
                    case 40:
                        key = "2";
                        shift_numkey = true;
                        break;
                    case 34:
                        key = "3";
                        shift_numkey = true;
                        break;
                    case 37:
                        key = "4";
                        shift_numkey = true;
                        break;
                    case 12:
                        key = "5";
                        shift_numkey = true;
                        break;
                    case 39:
                        key = "6";
                        shift_numkey = true;
                        break;
                    case 36:
                        key = "7";
                        shift_numkey = true;
                        break;
                    case 38:
                        key = "8";
                        shift_numkey = true;
                        break;
                    case 33:
                        key = "9";
                        shift_numkey = true;
                        break;
                }
            }

            if (key === "F2") { //function_key
                pu.mode_qa("pu_q");
                document.getElementById('dvique').style.borderColor = Color.BLACK_LIGHT;
                e.returnValue = false;
            } else if (key === "F3") {
                pu.mode_qa("pu_a");
                document.getElementById('dvique').style.borderColor = Color.GREEN_LIGHT;
                e.returnValue = false;
            }

            if (key === "F4") { //function_key
                if (sw_timer.isPaused()) {
                    startTimer();
                } else {
                    pauseTimer();
                }
                e.returnValue = false;
            }

            if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") { //arrow
                pu.key_arrow(key, isCtrlKeyHeld(e));
                e.returnValue = false;
            }

            if (isShiftKeyPressed(key)) {
                shift_counter = shift_counter + 1;
            }

            if (isShiftKeyPressed(key) && shift_counter === 1 && !isCtrlKeyHeld(e) && !isAltKeyHeld(e) && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                present_submode = pu.mode[pu.mode.qa]["sudoku"][0];
                if (present_submode !== 2) {
                    pu.submode_check("sub_sudoku2");
                }
                e.returnValue = false;
            }

            if (isCtrlKeyPressed(key)) {
                ctrl_counter = ctrl_counter + 1;
            }

            if (isCtrlKeyPressed(key) && ctrl_counter === 1 && !isShiftKeyHeld(e) && !isAltKeyHeld(e) && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                present_submode = pu.mode[pu.mode.qa]["sudoku"][0];
                if (present_submode !== 3) {
                    pu.submode_check("sub_sudoku3");
                }
                e.returnValue = false;
            }

            if (!isCtrlKeyHeld(e) && !isAltKeyHeld(e)) {
                if (isShiftKeyHeld(e) && key === " ") {
                    pu.key_number(key);
                    e.returnValue = false;
                } else if (str_num.indexOf(key) != -1 ||
                    str_alph_low.indexOf(key) != -1 ||
                    str_alph_up.indexOf(key) != -1 ||
                    str_sym.indexOf(key) != -1 ||
                    (keycode >= 48 && keycode <= 57)) {
                    e.preventDefault();
                    if (isShiftKeyHeld(e) && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                        pu.key_number(String.fromCharCode(keycode));
                    } else if (shift_numkey && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                        pu.key_number(key);
                        shift_numkey = false;
                    } else {
                        if (pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                            switch (code) {
                                case "Digit0":
                                    key = "0";
                                    break;
                                case "Digit1":
                                    key = "1";
                                    break;
                                case "Digit2":
                                    key = "2";
                                    break;
                                case "Digit3":
                                    key = "3";
                                    break;
                                case "Digit4":
                                    key = "4";
                                    break;
                                case "Digit5":
                                    key = "5";
                                    break;
                                case "Digit6":
                                    key = "6";
                                    break;
                                case "Digit7":
                                    key = "7";
                                    break;
                                case "Digit8":
                                    key = "8";
                                    break;
                                case "Digit9":
                                    key = "9";
                                    break;
                            }
                        }
                        pu.key_number(key);
                    }
                } else if (key === " " || keycode === 46 || (keycode === 8 && pu.mode[pu.mode.qa].edit_mode === "sudoku")) {
                    // 46 is for Enter, 8 is for backspace which behaves as Enter for Mac Devices. Since Penpa doesnt use backspace in
                    // Sudoku mode, I have assigned it to Delete
                    pu.key_space(keycode, isShiftKeyHeld(e), isCtrlKeyHeld(e));
                    e.returnValue = false;
                } else if (key === "Backspace") {
                    pu.key_backspace();
                    e.returnValue = false;
                }
            }

            if (isCtrlKeyHeld(e) && (keycode === 46 || (keycode === 8 && pu.mode[pu.mode.qa].edit_mode === "sudoku"))) {
                // 46 is for Enter, 8 is for backspace which behaves as Enter for Mac Devices. Since Penpa doesnt use backspace in
                // Sudoku mode, I have assigned it to Delete
                pu.key_space(keycode, isShiftKeyHeld(e), isCtrlKeyHeld(e));
                e.returnValue = false;
            }

            if (isCtrlKeyHeld(e) && !isShiftKeyHeld(e) && !isAltKeyHeld(e)) {
                if (!isCtrlKeyPressed(key)) {
                    if (pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                        switch (code) {
                            case "Digit0":
                                key = "0";
                                break;
                            case "Digit1":
                                key = "1";
                                break;
                            case "Digit2":
                                key = "2";
                                break;
                            case "Digit3":
                                key = "3";
                                break;
                            case "Digit4":
                                key = "4";
                                break;
                            case "Digit5":
                                key = "5";
                                break;
                            case "Digit6":
                                key = "6";
                                break;
                            case "Digit7":
                                key = "7";
                                break;
                            case "Digit8":
                                key = "8";
                                break;
                            case "Digit9":
                                key = "9";
                                break;
                        }
                    }
                    switch (key) {
                        case "d": //Ctrl+d
                        case "D":
                            duplicate();
                            e.returnValue = false;
                            break;
                        case "y": //Ctrl+y
                        case "Y":
                            if (!pu.undoredo_disable) {
                                pu.redo();
                            }
                            e.returnValue = false;
                            break;
                        case "z": //Ctrl+z
                        case "Z":
                            if (!pu.undoredo_disable) {
                                pu.undo();
                            }
                            e.returnValue = false;
                            break;
                        case " ": //Ctrl+space
                            pu.key_shiftspace();
                            e.returnValue = false;
                            break;
                        case "i": //Ctrl+i
                        case "I":
                            if ((document.getElementById('panel_button').value === "1") &&
                                (typeof panel_select !== "undefined") &&
                                (panel_select < panel_pu.cont.length) &&
                                pu.mode[pu.mode.qa].edit_mode !== "symbol") {
                                var paneletc = ["ja_K", "ja_H", "Kan", "Rome", "Greek", "Cyrillic", "europe", "Chess", "card"];

                                if (panel_pu.panelmode === "number") {
                                    if (0 <= panel_select && panel_select <= 9) {
                                        pu.key_number(panel_pu.cont[panel_select].toString());
                                    } else if (panel_select === 10) {
                                        pu.key_backspace();
                                    } else if (panel_select === 11) {
                                        pu.key_space();
                                    }
                                } else if (panel_pu.panelmode === "alphabet" || panel_pu.panelmode === "alphabet_s") {
                                    if (0 <= panel_select && panel_select <= 27) {
                                        pu.key_number(panel_pu.cont[panel_select].toString());
                                    } else if (panel_select === 28) {
                                        pu.key_number(" ");
                                    } else if (panel_select >= 29) {
                                        pu.key_space();
                                    }
                                } else if (panel_pu.panelmode === "Text") {
                                    panel_pu.inputtext();
                                } else if (panel_pu.panelmode === "key_symbol") {
                                    if (panel_pu.cont[panel_select] && panel_pu.cont[panel_select] != " ") {
                                        pu.key_number(panel_pu.cont[panel_select]);
                                    } else if (panel_pu.cont[panel_select] === " ") {
                                        pu.key_space();
                                    }
                                } else if (paneletc.indexOf(panel_pu.panelmode) != -1) {
                                    if (panel_pu.cont[panel_select] && panel_pu.cont[panel_select] != "　") {
                                        pu.key_number(panel_pu.cont[panel_select]);
                                    } else if (panel_pu.cont[panel_select] === "　") {
                                        pu.key_space();
                                    }
                                }
                            }
                            e.returnValue = false;
                            break;
                        case "0":
                        case "1":
                        case "2":
                        case "3":
                        case "4":
                        case "5":
                        case "6":
                        case "7":
                        case "8":
                        case "9":
                            if (pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                                e.preventDefault();
                            }
                            pu.key_number(key);
                            e.returnValue = false;
                            break;
                    }
                } else {
                    e.returnValue = false;
                }
            }

            if (!isCtrlKeyHeld(e) && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                switch (key) {
                    case "z":
                        // case "Z":
                        present_mode = document.getElementById("mo_sudoku").checked;
                        if (!present_mode) {
                            pu.mode_set("sudoku");
                            e.preventDefault();
                        }
                        present_submode = document.getElementById("sub_sudoku1").checked;
                        if (!present_submode) {
                            pu.submode_check("sub_sudoku1");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "x":
                        // case "X":
                        present_mode = document.getElementById("mo_sudoku").checked;
                        if (!present_mode) {
                            pu.mode_set("sudoku");
                            e.preventDefault();
                        }
                        present_submode = document.getElementById("sub_sudoku2").checked;
                        if (!present_submode) {
                            pu.submode_check("sub_sudoku2");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "c":
                        // case "C":
                        present_mode = document.getElementById("mo_sudoku").checked;
                        if (!present_mode) {
                            pu.mode_set("sudoku");
                            e.preventDefault();
                        }
                        present_submode = document.getElementById("sub_sudoku3").checked;
                        if (!present_submode) {
                            pu.submode_check("sub_sudoku3");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "v":
                        // case "V":
                        present_mode = document.getElementById("mo_surface").checked;
                        if (!present_mode) {
                            pu.mode_set("surface");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    default:
                        e.returnValue = false;
                        break;
                }
            }

            if (!isCtrlKeyHeld(e) && pu.mode[pu.mode.qa].edit_mode === "surface") {
                switch (key) {
                    case "z":
                    case "Z":
                        present_mode = document.getElementById("mo_sudoku").checked;
                        if (!present_mode) {
                            pu.mode_set("sudoku");
                            e.preventDefault();
                        }
                        present_submode = document.getElementById("sub_sudoku1").checked;
                        if (!present_submode) {
                            pu.submode_check("sub_sudoku1");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "x":
                    case "X":
                        present_mode = document.getElementById("mo_sudoku").checked;
                        if (!present_mode) {
                            pu.mode_set("sudoku");
                            e.preventDefault();
                        }
                        present_submode = document.getElementById("sub_sudoku2").checked;
                        if (!present_submode) {
                            pu.submode_check("sub_sudoku2");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "c":
                    case "C":
                        present_mode = document.getElementById("mo_sudoku").checked;
                        if (!present_mode) {
                            pu.mode_set("sudoku");
                            e.preventDefault();
                        }
                        present_submode = document.getElementById("sub_sudoku3").checked;
                        if (!present_submode) {
                            pu.submode_check("sub_sudoku3");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "v":
                    case "V":
                        present_mode = document.getElementById("mo_surface").checked;
                        if (!present_mode) {
                            pu.mode_set("surface");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "1":
                        present_style = document.getElementById("st_surface1").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface1");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "2":
                        present_style = document.getElementById("st_surface8").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface8");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "3":
                        present_style = document.getElementById("st_surface3").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface3");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "4":
                        present_style = document.getElementById("st_surface4").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface4");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "5":
                        present_style = document.getElementById("st_surface2").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface2");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "6":
                        present_style = document.getElementById("st_surface5").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface5");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "7":
                        present_style = document.getElementById("st_surface6").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface6");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "8":
                        present_style = document.getElementById("st_surface7").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface7");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "9":
                        present_style = document.getElementById("st_surface9").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface9");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "0":
                        present_style = document.getElementById("st_surface10").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface10");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "11":
                        present_style = document.getElementById("st_surface11").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface11");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    case "12":
                        present_style = document.getElementById("st_surface12").checked;
                        if (!present_style) {
                            pu.stylemode_check("st_surface12");
                            e.preventDefault();
                        }
                        e.returnValue = false;
                        break;
                    default:
                        e.returnValue = false;
                        break;
                }
            }

            if (key === "Tab" || key === "Enter") {
                let user_choices = UserSettings.tab_settings;
                if (user_choices.length !== 0) {
                    if (previous_length != user_choices.length) {
                        previous_length = user_choices.length;
                        counter_index = 0; // reset the counter
                    } else if (isShiftKeyHeld(e)) { // if SHIFT is held down cycle backward
                        counter_index += user_choices.length - 1;
                    } else {
                        counter_index++;
                    }
                    counter_index %= user_choices.length
                    let mode_loc = modes.indexOf(user_choices[counter_index]);

                    // Surface, Shape, Wall, Composite Modes, remaining choices are related to submodes
                    let mode_name = modes_mapping[mode_loc];
                    if (mode_name.includes("surface") ||
                        mode_name.includes("wall") ||
                        mode_name.includes("symbol") ||
                        mode_name.includes("combi") ||
                        mode_name === "special") {
                        pu.mode_set(mode_name)
                        e.preventDefault();
                    } else {
                        if (mode_name.includes("number")) {
                            pu.mode_set('number');
                            e.preventDefault();
                        } else if (mode_name.includes("sudoku")) {
                            pu.mode_set('sudoku');
                            e.preventDefault();
                        } else if (mode_name.includes("lineE")) {
                            pu.mode_set('lineE');
                            e.preventDefault();
                        } else if (mode_name.includes("special")) {
                            pu.mode_set('special');
                            e.preventDefault();
                        } else {
                            pu.mode_set('line');
                            e.preventDefault();
                        }
                        pu.submode_check(mode_name);
                        e.preventDefault();
                    }
                    e.returnValue = false;
                }
            }
        }
    }

    function onKeyUp(e) {
        if (e.target.type === "number" ||
            e.target.type === "text" ||
            e.target.id === "savetextarea_pp" ||
            e.target.id === "custom_message" ||
            e.target.id === "iostring" ||
            e.target.id === "inputtext" ||
            e.target.id === "saveinforules" ||
            e.target.id === "urlstring") {
            // For input form
        } else {
            var key = e.key;
            var keylocation = e.location;
            if (isShiftKeyPressed(key) && keylocation !== 3 && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                if (present_submode === "1") {
                    pu.submode_check("sub_sudoku1");
                } else if (present_submode === "2") {
                    pu.submode_check("sub_sudoku2");
                } else if (present_submode === "3") {
                    pu.submode_check("sub_sudoku3");
                }
                shift_counter = 0;
                shift_release_time = Date.now();
                e.returnValue = false;
            } else if (isCtrlKeyPressed(key) && keylocation !== 3 && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                if (present_submode === "1") {
                    pu.submode_check("sub_sudoku1");
                } else if (present_submode === "2") {
                    pu.submode_check("sub_sudoku2");
                } else if (present_submode === "3") {
                    pu.submode_check("sub_sudoku3");
                }
                ctrl_counter = 0;
                ctrl_release_time = Date.now();
                e.returnValue = false;
            } else if (pu.mode[pu.mode.qa].edit_mode === "surface") { // shortcut for styles in surface mode
                if (key === "1") {
                    number_release_time = Date.now();
                    previousdigit1 = true;
                    e.returnValue = false;
                } else {
                    previousdigit1 = false;
                    number_release_time = -1e5;
                    e.returnValue = false;
                }
            }

        }
    }

    function coord_point(e, fittype = 'none') {
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        var min0, min = 10e6;
        var num = 0;
        let type;
        var improve_modes = ["star", "yajilin", "mines", "doublemines", "akari"];

        // Improving starbattle composite mode, left click
        if (fittype === 'flex') {
            if (((pu.mode[pu.mode.qa].edit_mode === "combi") &&
                    (improve_modes.includes(pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0]))) ||
                (pu.mode[pu.mode.qa].edit_mode === "sudoku")) {
                type = pu.type;
                pu.type = [0];
            }
        }

        for (var i = 0; i < pu.point.length; i++) {
            if (pu.point[i] && pu.type.indexOf(pu.point[i].type) != -1) {
                min0 = (x - pu.point[i].x) ** 2 + (y - pu.point[i].y) ** 2;
                if (min0 < min) {
                    min = min0;
                    num = i;
                }
            }
        }

        // resetting the type for starbattle composite mode
        if (fittype === 'flex') {
            if (((pu.mode[pu.mode.qa].edit_mode === "combi") &&
                    (improve_modes.includes(pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0]))) ||
                (pu.mode[pu.mode.qa].edit_mode === "sudoku")) {
                pu.type = type;
            }
        }

        //const endTime = performance.now();
        //console.log(endTime - startTime);
        num = parseInt(num);
        var obj = new Object();
        obj.x = x;
        obj.y = y;
        obj.num = num;
        return obj;
    }

    let count_undo = 0;
    let count_redo = 0;
    let timer, new_timer;
    var undo_button = document.getElementById("tb_undo");
    var redo_button = document.getElementById("tb_redo");

    undo_button.addEventListener("touchstart", undoDown, { passive: false });
    undo_button.addEventListener("mousedown", undoDown, { passive: false });
    undo_button.addEventListener("touchend", undoUp, { passive: false });
    undo_button.addEventListener("mouseup", undoUp, { passive: false });
    undo_button.addEventListener("touchend", undoLeave, { passive: false });
    undo_button.addEventListener("mouseleave", undoLeave, { passive: false });
    undo_button.addEventListener("contextmenu", offcontext, { passive: false });

    redo_button.addEventListener("touchstart", redoDown, { passive: false });
    redo_button.addEventListener("mousedown", redoDown, { passive: false });
    redo_button.addEventListener("touchend", redoUp, { passive: false });
    redo_button.addEventListener("mouseup", redoUp, { passive: false });
    redo_button.addEventListener("touchend", redoLeave, { passive: false });
    redo_button.addEventListener("mouseleave", redoLeave, { passive: false });
    redo_button.addEventListener("contextmenu", offcontext, { passive: false });

    function offcontext(e) {
        e.preventDefault();
    }

    function undoDown(e) {
        e.preventDefault();
        undo_button.classList.add('active');
        count_redo = 0;
        new_timer = setInterval(() => {
            count_undo++;
            if (pu[pu.mode.qa].command_undo.__a.length === 0) {
                clearInterval(new_timer);
            }
            if (count_undo > 10) {
                pu.undo();
            }
        }, 80);
        if (new_timer !== timer) {
            clearInterval(timer);
        }
        timer = new_timer;
    }

    function undoUp(e) {
        e.preventDefault();
        undo_button.classList.remove('active');
        clearInterval(timer);
        count_undo = 0;
    }

    function undoLeave(e) {
        e.preventDefault();
        undo_button.classList.remove('active');
        clearInterval(timer);
        count_undo = 0;
    }

    function redoDown(e) {
        e.preventDefault();
        redo_button.classList.add('active');
        count_undo = 0;
        new_timer = setInterval(() => {
            count_redo++;
            if (pu[pu.mode.qa].command_redo.__a.length === 0) {
                clearInterval(new_timer);
            }
            if (count_redo > 10) {
                pu.redo();
            }
        }, 80);
        if (new_timer !== timer) {
            clearInterval(timer);
        }
        timer = new_timer;
    }

    function redoUp(e) {
        e.preventDefault();
        redo_button.classList.remove('active');
        clearInterval(timer);
        count_redo = 0;
    }

    function redoLeave(e) {
        e.preventDefault();
        redo_button.classList.remove('active');
        clearInterval(timer);
        count_redo = 0;
    }

    // Click event
    document.addEventListener("touchstart", window_click, { passive: false });
    document.addEventListener("mousedown", window_click, { passive: false });

    function window_click(e) {
        var orientation;
        //modalwindow
        if (e.target.className === "modal") {
            document.getElementById(e.target.id).style.display = 'none';
            e.preventDefault();
        }
        if (!pu.ondown_key) {
            pu.ondown_key = ondown_key;
        }
        if (pu.selection.length > 0 && e.target.id.indexOf("sub_sudoku") == -1 && e.target.id.indexOf("st_sudoku") == -1 &&
            e.target.id != "float-canvas" && !isCtrlKeyHeld(e)) {
            // clear selection
            pu.selection = [];
            pu.redraw();
        }
        // Middle click for switching problem and solution
        // Applicable only in setter mode
        if (document.getElementById("title").textContent.toLowerCase().includes("setter")) {
            if (UserSettings.mousemiddle_button === 2) { // If user setting is yes
                if (ondown_key === "mousedown" && e.button === 1) {
                    if (pu.mode.qa === "pu_a") {
                        pu.mode_qa("pu_q");
                        document.getElementById('dvique').style.borderColor = Color.BLACK_LIGHT;
                        e.returnValue = false;
                    } else {
                        pu.mode_qa("pu_a");
                        document.getElementById('dvique').style.borderColor = Color.GREEN_LIGHT;
                        e.returnValue = false;
                    }
                }
            }
        }

        switch (e.target.id) {
            //canvas
            case "canvas":
                document.getElementById("inputtext").blur(); // Remove focus from text box
                onDown(e);
                if (checkms === 0) {
                    e.preventDefault();
                }
                break;
                //top/bottom button
            case "newboard":
                newboard();
                e.preventDefault();
                break;
            case "rotation":
                rotation();
                e.preventDefault();
                break;
            case "newsize":
                newsize();
                e.preventDefault();
                break;
            case "saveimage":
                saveimage();
                e.preventDefault();
                break;
            case "savetext":
                savetext();
                e.preventDefault();
                break;
            case "input_sudoku":
                io_sudoku();
                e.preventDefault();
                break;
            case "input_url":
                i_url();
                e.preventDefault();
                break;
            case "page_settings":
                p_settings();
                e.preventDefault();
                break;
            case "page_help":
                help();
                e.preventDefault();
                break;
            case "tb_undo":
                pu.undo();
                break;
            case "tb_redo":
                pu.redo();
                break;
            case "tb_reset":
                ResetCheck();
                e.preventDefault();
                break;
            case "tb_delete":
                DeleteCheck();
                e.preventDefault();
                break;

                //panel_menu
            case "panel_1_lbmenu":
                panel_pu.mode_set('number');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_A_lbmenu":
                panel_pu.mode_set('alphabet');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_a_lbmenu":
                panel_pu.mode_set('alphabet_s');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_!_lbmenu":
                panel_pu.mode_set('key_symbol');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_ja_K_lbmenu":
                panel_pu.mode_set('ja_K');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_ja_H_lbmenu":
                panel_pu.mode_set('ja_H');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_Text_lbmenu":
                panel_pu.mode_set('Text');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_Kan_lbmenu":
                panel_pu.mode_set('Kan');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_Rome_lbmenu":
                panel_pu.mode_set('Rome');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_Greek_lbmenu":
                panel_pu.mode_set('Greek');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_europe_lbmenu":
                panel_pu.mode_set('europe');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_Cyrillic_lbmenu":
                panel_pu.mode_set('Cyrillic');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_Chess_lbmenu":
                panel_pu.mode_set('Chess');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_card_lbmenu":
                panel_pu.mode_set('card');
                panel_pu.select_close();
                e.preventDefault();
                break;
            case "panel_select_lbmenu":
                panel_pu.select_open();
                e.preventDefault();
                break;
            case "closeBtn_input1":
                panel_pu.inputtext();
                e.preventDefault();
                break;
            case "closeBtn_input2":
                panel_pu.cleartext();
                e.preventDefault();
                break;
            case "float-canvas":
                f_mdown(e);
                if (checkms === 0) {
                    e.preventDefault();
                }
                break;
                //savetext
            case "saveinfogenre":
                show_genretags();
                e.preventDefault();
                break;
            case "address_edit":
                savetext_edit();
                e.preventDefault();
                break;
            case "address_solve":
                savetext_solve();
                e.preventDefault();
                break;
            case "expansion":
                expansion();
                e.preventDefault();
                break;
            case "expansion_replay":
                expansion_replay();
                e.preventDefault();
                break;
            case "address_comp":
                savetext_comp();
                e.preventDefault();
                break;
            case "pp_file":
                make_ppfile();
                e.preventDefault();
                break;
            case "gmp_file":
                make_gmpfile();
                e.preventDefault();
                break;
            case "savetextarea":
                return;
            case "savetextname":
                return;
            case "savetextarea_pp":
                return;
            case "iostring":
                return;
            case "closeBtn_save1":
                savetext_copy();
                e.preventDefault();
                break;
            case "closeBtn_save2":
                savetext_download();
                e.preventDefault();
                break;
            case "closeBtn_save4":
                document.getElementById('modal-save').style.display = 'none';
                e.preventDefault();
                break;
            case "closeBtn_save5":
                savetext_withsolution();
                e.preventDefault();
                break;
            case "closeBtn_replay":
                savetext_withreplay();
                e.preventDefault();
                break;
            case "solution_open":
                solution_open();
                e.preventDefault();
                break;
            case "pp_file_open":
                pp_file_open();
                e.preventDefault();
                break;
            case "rt_right":
                pu.rotate_right();
                pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_left":
                pu.rotate_left();
                pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_LR":
                pu.rotate_LR();
                e.preventDefault();
                break;
            case "rt_UD":
                pu.rotate_UD();
                e.preventDefault();
                break;
            case "rt_center":
                pu.rotate_center();
                e.preventDefault();
                break;
            case "rt_size":
                pu.rotate_size();
                e.preventDefault();
                break;
            case "rt_reset":
                pu.rotate_reset();
                e.preventDefault();
                break;
            case "rt_addtop":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('t');
                if (pu.gridtype === "square") {
                    switch (orientation) {
                        case 0:
                            pu.resize_bottom(1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_left(1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_top(1); // original
                            break;
                        case 3:
                            pu.resize_right(1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_bottom(1, 'white');
                            break;
                        case 1:
                            pu.resize_left(1, 'white');
                            break;
                        case 2:
                            pu.resize_top(1, 'white');
                            break;
                        case 3:
                            pu.resize_right(1, 'white');
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_addbottom":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('b');
                if (pu.gridtype === "square" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_top(1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_right(1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_bottom(1); // original
                            break;
                        case 3:
                            pu.resize_left(1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku") {
                    switch (orientation) {
                        case 0:
                            pu.resize_top(1, 'white'); // rotated by 180
                            break;
                        case 1:
                            pu.resize_right(1, 'white'); // rotated by 90
                            break;
                        case 2:
                            pu.resize_bottom(1, 'white'); // original
                            break;
                        case 3:
                            pu.resize_left(1, 'white'); // rotated by 270
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_addleft":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('l');
                if (pu.gridtype === "square") {
                    switch (orientation) {
                        case 0:
                            pu.resize_right(1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_bottom(1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_left(1); // original
                            break;
                        case 3:
                            pu.resize_top(1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_right(1, 'white');
                            break;
                        case 1:
                            pu.resize_bottom(1, 'white');
                            break;
                        case 2:
                            pu.resize_left(1, 'white');
                            break;
                        case 3:
                            pu.resize_top(1, 'white');
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_addright":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('r');
                if (pu.gridtype === "square" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_left(1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_top(1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_right(1); // original
                            break;
                        case 3:
                            pu.resize_bottom(1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku") {
                    switch (orientation) {
                        case 0:
                            pu.resize_left(1, 'white'); // rotated by 180
                            break;
                        case 1:
                            pu.resize_top(1, 'white'); // rotated by 90
                            break;
                        case 2:
                            pu.resize_right(1, 'white'); // original
                            break;
                        case 3:
                            pu.resize_bottom(1, 'white'); // rotated by 270
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_subtop":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('t');
                if (pu.gridtype === "square") {
                    switch (orientation) {
                        case 0:
                            pu.resize_bottom(-1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_left(-1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_top(-1); // original
                            break;
                        case 3:
                            pu.resize_right(-1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_bottom(-1, 'white');
                            break;
                        case 1:
                            pu.resize_left(-1, 'white');
                            break;
                        case 2:
                            pu.resize_top(-1, 'white');
                            break;
                        case 3:
                            pu.resize_right(-1, 'white');
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_subbottom":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('b');
                if (pu.gridtype === "square" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_top(-1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_right(-1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_bottom(-1); // original
                            break;
                        case 3:
                            pu.resize_left(-1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku") {
                    switch (orientation) {
                        case 0:
                            pu.resize_top(-1, 'white'); // rotated by 180
                            break;
                        case 1:
                            pu.resize_right(-1, 'white'); // rotated by 90
                            break;
                        case 2:
                            pu.resize_bottom(-1, 'white'); // original
                            break;
                        case 3:
                            pu.resize_left(-1, 'white'); // rotated by 270
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_subleft":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('l');
                if (pu.gridtype === "square") {
                    switch (orientation) {
                        case 0:
                            pu.resize_right(-1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_bottom(-1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_left(-1); // original
                            break;
                        case 3:
                            pu.resize_top(-1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_right(-1, 'white');
                            break;
                        case 1:
                            pu.resize_bottom(-1, 'white');
                            break;
                        case 2:
                            pu.resize_left(-1, 'white');
                            break;
                        case 3:
                            pu.resize_top(-1, 'white');
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_subright":
                // To handle Rotation and Reflection
                orientation = pu.get_orientation('r');
                if (pu.gridtype === "square" || (pu.gridtype === "kakuro")) {
                    switch (orientation) {
                        case 0:
                            pu.resize_left(-1); // rotated by 180
                            break;
                        case 1:
                            pu.resize_top(-1); // rotated by 90
                            break;
                        case 2:
                            pu.resize_right(-1); // original
                            break;
                        case 3:
                            pu.resize_bottom(-1); // rotated by 270
                            break;
                    }
                } else if (pu.gridtype === "sudoku") {
                    switch (orientation) {
                        case 0:
                            pu.resize_left(-1, 'white'); // rotated by 180
                            break;
                        case 1:
                            pu.resize_top(-1, 'white'); // rotated by 90
                            break;
                        case 2:
                            pu.resize_right(-1, 'white'); // original
                            break;
                        case 3:
                            pu.resize_bottom(-1, 'white'); // rotated by 270
                            break;
                    }
                }
                // pu.rotate_size(); // fit board to window
                e.preventDefault();
                break;
            case "rt_addtop_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_top(1, 'white'); }
                e.preventDefault();
                break;
            case "rt_addbottom_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_bottom(1, 'white'); }
                e.preventDefault();
                break;
            case "rt_addleft_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_left(1, 'white'); }
                e.preventDefault();
                break;
            case "rt_addright_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_right(1, 'white'); }
                e.preventDefault();
                break;
            case "rt_subtop_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_top(-1, 'white'); }
                e.preventDefault();
                break;
            case "rt_subbottom_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_bottom(-1, 'white'); }
                e.preventDefault();
                break;
            case "rt_subleft_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_left(-1, 'white'); }
                e.preventDefault();
                break;
            case "rt_subright_r":
                if ((pu.gridtype === "square") || (pu.gridtype === "sudoku") || (pu.gridtype === "kakuro")) { pu.resize_right(-1, 'white'); }
                e.preventDefault();
                break;
            case "closeBtn_rotate1":
                document.getElementById('modal-rotate').style.display = 'none';
                e.preventDefault();
                break;
                //saveimage
            case "nb_margin1_lb":
                document.getElementById("nb_margin1").checked = true;
                e.preventDefault();
                break;
            case "nb_margin2_lb":
                document.getElementById("nb_margin2").checked = true;
                e.preventDefault();
                break;
            case "saveimagename":
                return;
            case "closeBtn_image2":
                saveimage_download();
                e.preventDefault();
                break;
            case "closeBtn_image3":
                document.getElementById('modal-image').style.display = 'none';
                e.preventDefault();
                break;
                //newboard
            case "nb_size1":
            case "nb_size2":
            case "nb_size3":
                return; //textbox
            case "nb_space1":
            case "nb_space2":
            case "nb_space3":
            case "nb_space4":
                return; //textbox
            case "nb_grid1_lb":
            case "nb_grid2_lb":
            case "nb_grid3_lb":
            case "nb_lat1_lb":
            case "nb_lat2_lb":
            case "nb_out1_lb":
            case "nb_out2_lb":
                pu.mode_grid(e.target.id.slice(0, -3));
                e.preventDefault();
                break;
            case "closeBtn_nb1":
                CreateCheck();
                e.preventDefault();
                break;
            case "closeBtn_nb2":
                // Save grid size setting
                if (document.getElementById("nb_size3").value != UserSettings.displaysize) {
                    UserSettings.displaysize = document.getElementById("nb_size3").value;
                }
                redraw_grid();
                document.getElementById('modal').style.display = 'none';
                e.preventDefault();
                break;
            case "closeBtn_nb3":
                // Reset display size setting since user didn't save
                document.getElementById("nb_size3").value = UserSettings.displaysize;
                document.getElementById('modal').style.display = 'none';
                e.preventDefault();
                break;
                //newsize
            case "nb_size3_r":
                return;
            case "closeBtn_size1":
                // Save grid size setting
                if (document.getElementById("nb_size3_r").value != UserSettings.displaysize) {
                    UserSettings.displaysize = document.getElementById("nb_size3_r").value;
                }
                redraw_grid();
                document.getElementById('modal-newsize').style.display = 'none';
                e.preventDefault();
                break;
            case "closeBtn_size2":
                // Reset display size setting since user didn't save
                document.getElementById("nb_size3_r").value = UserSettings.displaysize;
                document.getElementById('modal-newsize').style.display = 'none';
                e.preventDefault();
                break;
            case "float-key-header":
                mdown(e);
                e.preventDefault();
                break;
            case "float-key-header-lb":
                mdown(e);
                e.preventDefault();
                break;
            case "edge_button":
                UserSettings.draw_edges = !UserSettings.draw_edges;
                e.preventDefault();
                break;
            case "visibility_button":
                UserSettings.show_solution = !UserSettings.show_solution;
                e.preventDefault();
                break;
            case "pu_q_label":
                pu.mode_qa("pu_q");
                e.preventDefault();
                break;
            case "pu_a_label":
                // if solution exist, it means, its solve mode with answer checking
                // if user clicks on Check Solution button
                if (pu.solution && pu.sol_flag === 0) {
                    Swal.fire({
                        title: '<h3>Your solution is incorrect.</h3>',
                        html: '<h2>Keep trying 🙂</h2>',
                        icon: 'error',
                        confirmButtonText: 'ok',
                    })
                    document.getElementById("pu_a_label").style.backgroundColor = Color.RED_LIGHT;
                }
                pu.mode_qa("pu_a");
                e.preventDefault();
                break;
            case "puzzlerules":
                display_rules();
                e.preventDefault();
                break;
            case "replay_play":
            case "replay_play_btn":
                replay_play();
                e.preventDefault();
                break;
            case "replay_pause":
            case "replay_pause_btn":
                replay_pause();
                e.preventDefault();
                break;
            case "replay_reset":
            case "replay_reset_btn":
                replay_reset();
                e.preventDefault();
                break;
            case "replay_forward":
            case "replay_forward_btn":
                replay_forward();
                e.preventDefault();
                break;
            case "replay_backward":
            case "replay_backward_btn":
                replay_backward();
                e.preventDefault();
                break;
            case "replay_download":
            case "replay_download_btn":
                //generate a GIF of the solve path, with title and solve time information above it.
                if (!document.getElementById("replay_download_btn").disabled) {

                    document.getElementById("replay_download_btn").disabled = true;
                    document.getElementById("replay_message").style.display = "";
                    document.getElementById("replay_message").innerHTML = "Preparing your download";

                    setTimeout(function() {
                        function splitTextLines(ctx, text, maxWidth) {
                            var words = text.split(" ");
                            var lines = [];
                            var currentLine = words[0];

                            for (var i = 1; i < words.length; i++) {
                                var word = words[i];
                                var width = ctx.measureText(currentLine + " " + word).width;
                                if (width < maxWidth) {
                                    currentLine += " " + word;
                                } else {
                                    lines.push(currentLine);
                                    currentLine = word;
                                }
                            }
                            lines.push(currentLine);
                            return lines;
                        }

                        //put the title text on the top
                        let main_c = $('#canvas')[0];
                        let main_ctx = main_c.getContext("2d");

                        let gif_c = document.createElement('canvas');
                        let gif_ctx = gif_c.getContext("2d");

                        let fontSize = 16;
                        let fontLineSize = fontSize * 1.2;
                        gif_ctx.font = "bold " + fontSize + "px sans-serif";
                        let puzzleTitleLines = splitTextLines(gif_ctx, $('#puzzletitle').text(), main_c.offsetWidth);
                        let gif_vertical_offset = puzzleTitleLines.length * fontLineSize
                        gif_c.width = main_c.offsetWidth;
                        gif_c.height = main_c.offsetHeight + gif_vertical_offset;
                        gif_ctx.font = "bold " + fontSize + "px sans-serif";

                        //clear the gif canvas
                        gif_ctx.fillStyle = "#fff";
                        gif_ctx.fillRect(0, 0, gif_c.width, gif_c.height);

                        //draw the title text.
                        gif_ctx.fillStyle = "#0000ff";
                        let textY = fontSize;
                        for (let textLine of puzzleTitleLines) {
                            gif_ctx.fillText(textLine, (gif_c.width - gif_ctx.measureText(textLine).width) / 2, textY);
                            textY += fontLineSize;
                        }

                        //prepare to create gif frames
                        let gif = new GIF({
                            workers: 8,
                            quality: 40,
                            workerScript: './js/libs/gif.worker.js',
                            width: gif_c.width,
                            height: gif_c.height
                        });
                        let frame_ms = 500 / parseFloat(document.getElementById("replay_speed").value);
                        let original_position = pu[pu.mode.qa]["command_undo"].__a.length;

                        //go to first frame of solve
                        while (pu[pu.mode.qa]["command_undo"].__a.length !== 0) {
                            pu.undo(replay = true);
                        }

                        //advance and capture one frame at a time
                        while (pu[pu.mode.qa]["command_redo"].__a.length !== 0) {
                            gif_ctx.drawImage(main_c, 0, 0, main_c.width, main_c.height, 0, gif_vertical_offset, gif_c.width, gif_c.height - gif_vertical_offset);
                            gif.addFrame(gif_ctx, { delay: frame_ms, copy: true });

                            pu.redo(replay = true);
                        }
                        //capture final frame with longer delay
                        gif_ctx.drawImage(main_c, 0, 0, main_c.width, main_c.height, 0, gif_vertical_offset, gif_c.width, gif_c.height - gif_vertical_offset);
                        gif.addFrame(gif_ctx, { delay: 2000, copy: true });

                        gif.on('finished', function(blob) {
                            saveblob_download(blob, "my_solve.gif");
                            document.getElementById("replay_download_btn").disabled = false;
                            document.getElementById("replay_message").style.display = "none";
                            document.getElementById("replay_message").innerHTML = ""
                        });
                        gif.render();

                        //return playback position to where it was before.
                        while (pu[pu.mode.qa]["command_undo"].__a.length !== original_position) {
                            pu.undo(replay = true);
                        }
                    }, 5);
                }
                e.preventDefault();
                break;
        }
        // Main mode
        if (e.target.id.slice(0, 3) === "mo_") {
            pu.mode_set(e.target.id.slice(3, -3));
            e.preventDefault();
        }
        // Sub mode
        if (e.target.id.slice(0, 4) === "sub_") {
            pu.submode_check(e.target.id.slice(0, -3));
            e.preventDefault();
        }
        // Style mode
        if (e.target.id.slice(0, 3) === "st_") {
            pu.stylemode_check(e.target.id.slice(0, -3));
            e.preventDefault();
        }
        // Combination mode
        if (e.target.id.slice(0, 9) === "combisub_") {
            pu.subcombimode(e.target.id.slice(9));
            e.preventDefault();
        }
        // symbol
        if (e.target.id.slice(0, 3) === "ms_") {
            checkms = 1;
            pu.subsymbolmode(e.target.id.slice(3));
            e.preventDefault();
            //Symbol hover etc
        } else if (e.target.id.slice(0, 2) === "ms") {
            checkms = 1;
            return;
        } else if (checkms === 1) {
            checkms = 0;
            return;
        }
    }

    //panel(drag_window)
    var x_window;
    var y_window;

    function mdown(e) {
        var elements = document.getElementById("float-key-header");
        elements.classList.add("drag");

        if (e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

        x_window = event.pageX - elements.offsetLeft;
        y_window = event.pageY - elements.offsetTop;
        var drag = document.getElementsByClassName("drag")[0];
        document.body.addEventListener("touchmove", mmove, { passive: false });
        document.body.addEventListener("mousemove", mmove, { passive: false });
    }

    function mmove(e) {

        var drag = document.getElementsByClassName("drag")[0];
        var body = document.getElementById("float-key-body");
        if (e.type === "mousemove") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }
        e.preventDefault();

        // restrict the panel movement to not go beyond with top header
        let el_header = document.getElementById("header");
        let el_floatheader = document.getElementById("float-key-header");

        drag.style.top = event.pageY - y_window + "px";
        drag.style.left = event.pageX - x_window + "px";

        if (el_floatheader.getBoundingClientRect().top > el_header.getBoundingClientRect().bottom) {
            body.style.top = event.pageY - y_window + "px";
            body.style.left = event.pageX - x_window + "px";

            window.panel_toplast = body.style.top;
            window.panel_leftlast = body.style.left;
        } else {
            drag.style.top = body.style.top;
            drag.style.left = body.style.left;
        }

        drag.addEventListener("touchend", mup, { passive: false });
        drag.addEventListener("mouseup", mup, { passive: false });
        document.body.addEventListener("touchleave", mup, { passive: false });
        document.body.addEventListener("mouseleave", mup, { passive: false });

    }

    function mup(e) {
        var drag = document.getElementsByClassName("drag")[0];
        if (drag) {
            document.body.removeEventListener("touchmove", mmove, { passive: false });
            document.body.removeEventListener("mousemove", mmove, { passive: false });
            drag.removeEventListener("touchend", mup, { passive: false });
            drag.removeEventListener("mouseup", mup, { passive: false });
            drag.classList.remove("drag");
        }
    }

    // Panel input settings
    var float_canvas = document.getElementById("float-canvas");
    var panel_select;

    function f_mdown(e) {
        if (e.type === "mousedown") {
            var event = e;
            var xf = event.offsetX;
            var yf = event.offsetY;
        } else {
            var float_canvas = document.getElementById("float-canvas");
            var event = e.changedTouches[0];
            var xf = event.pageX - (float_canvas.getBoundingClientRect().x - document.documentElement.getBoundingClientRect().left);
            var yf = event.pageY - (float_canvas.getBoundingClientRect().y - document.documentElement.getBoundingClientRect().top);
        }
        var sizef = panel_pu.sizef;
        var numxf = Math.floor(xf / (sizef + 3));
        var numyf = Math.floor(yf / (sizef + 3));
        var n = numxf + numyf * panel_pu.nxf;
        panel_select = n;
        var paneletc = ["ja_K", "ja_H", "Kan", "Rome", "Greek", "Cyrillic", "europe", "Chess", "card"];

        if (pu.mode[pu.mode.qa].edit_mode === "symbol") {
            panel_pu.edit_num = n;
            if (document.getElementById('panel_button').value === "1" && pu.onoff_symbolmode_list[pu.mode[pu.mode.qa].symbol[0]]) {
                if (0 <= panel_pu.edit_num && panel_pu.edit_num <= 8) {
                    pu.key_number((panel_pu.edit_num + 1).toString());
                } else if (panel_pu.edit_num === 9) {
                    pu.key_number(0);
                } else if (panel_pu.edit_num === 11) {
                    pu.key_space();
                }
            }
            panel_pu.draw_panel();
        } else if (panel_pu.panelmode === "number") {
            if (0 <= n && n <= 9) {
                pu.key_number(panel_pu.cont[n].toString());
            } else if (n === 10) {
                pu.key_backspace();
            } else if (n === 11) {
                pu.key_space();
            }
        } else if (panel_pu.panelmode === "alphabet" || panel_pu.panelmode === "alphabet_s") {
            if (0 <= n && n <= 27) {
                pu.key_number(panel_pu.cont[n].toString());
            } else if (n === 28) {
                pu.key_number(" ");
            } else if (n >= 29) {
                pu.key_space();
            }
        } else if (panel_pu.panelmode === "key_symbol") {
            if (panel_pu.cont[n] && panel_pu.cont[n] != " ") {
                pu.key_number(panel_pu.cont[n]);
            } else if (panel_pu.cont[n] === " ") {
                pu.key_space();
            }
        } else if (paneletc.indexOf(panel_pu.panelmode) != -1) {
            if (panel_pu.cont[n] && panel_pu.cont[n] != "　") {
                pu.key_number(panel_pu.cont[n]);
            } else if (panel_pu.cont[n] === "　") {
                pu.key_space();
            }
        }
    }

    let select = document.getElementById("mode_choices");
    for (var i = 0; i < modes.length; i++) {
        var option = document.createElement("option");
        option.value = modes[i];
        option.text = modes_text[i];
        if (UserSettings.tab_settings) {

            // Load the author defined tab settings if any
            if (UserSettings.tab_settings.indexOf(modes[i]) > -1) {
                option.setAttribute("selected", true);
            }
        }
        select.appendChild(option);
    }

    selectBox = new vanillaSelectBox("#mode_choices", {
        "disableSelectAll": false,
        "maxHeight": 250,
        "search": true,
        "translations": { "all": "All", "items": "items", "selectAll": "Check All", "clearAll": "Clear All" }
    }); //"placeHolder": "Surface" translations: { "items": "tab" } "maxWidth": 140

    let selectContainer = document.getElementById('btn-group-#mode_choices').getElementsByClassName('vsb-menu')[0];
    let liteModeButton = document.createElement('button');
    liteModeButton.id = "tab-dropdown-lite-btn";
    liteModeButton.disabled = true;
    let tab_initial = getValues('mode_choices');
    if (tab_initial.length > 0) {
        liteModeButton.innerText = 'Disable Penpa Lite';
        liteModeButton.disabled = false;
    } else {
        liteModeButton.innerText = 'Enable Penpa Lite';
        liteModeButton.disabled = true;
    }
    liteModeButton.addEventListener('click', advancecontrol_toggle);
    selectContainer.appendChild(liteModeButton);

    window.addEventListener('beforeunload', function(e) {
        if (UserSettings.reload_button === 1) {
            // Cancel the event
            e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
            // Chrome requires returnValue to be set
            e.returnValue = '';
        }

        // Save puzzle progress
        let local_storage_setting = document.getElementById("clear_storage_opt").value;
        if (pu.url.length !== 0 &&
            pu.mmode === "solve" &&
            local_storage_setting === "1" &&
            !pu.replay) {
            // get md5 hash for unique id
            try {
                let hash = "penpa_" + md5(pu.url);
            } catch (error) {
                console.log('md5 package is being blocked, most probably by Adblock', error);
                Swal.fire({
                    html: '<h2 class="info">Most likely, md5 package is being blocked by Adblock, local storage feature is not effective. Solution: Disable Adblock on Penpa+ Site</h2>',
                    icon: 'info'
                });
                let hash = null;
            }

            // generate duplicate link
            let rstr = pu.maketext_duplicate() + "&l=solvedup";

            if (hash !== null) {
                localStorage.setItem(hash, rstr);
            }
        }
    });

    // Adding on change events for general settings
    // Theme Setting
    document.getElementById("theme_mode_opt").onchange = function() {
        UserSettings.color_theme = this.value;
    }

    // Toggle responsiveness
    document.getElementById("responsive_settings_opt").onchange = function() {
        UserSettings.responsive_mode = this.value;
    }

    // Custom Color Setting
    document.getElementById("custom_color_opt").onchange = function() {
        if (document.getElementById("custom_color_opt").value === "1") {
            document.getElementById('style_special').style.display = 'none';
            pu.redraw();
        } else if (document.getElementById("custom_color_opt").value === "2") {
            let mode = pu.mode[pu.mode.qa].edit_mode;
            if (((pu.gridtype === "square" || pu.gridtype === "sudoku" || pu.gridtype === "kakuro" || pu.gridtype === "hex")) &&
                (mode === "line" || mode === "lineE" || mode === "wall" || mode === "surface" || mode === "cage" || mode === "special" || mode === "symbol")) {
                document.getElementById('style_special').style.display = 'inline';
            }
            pu.redraw();
        }
    }

    // Save Setting
    document.getElementById("save_settings_opt").onchange = function() {
        UserSettings.save_settings = this.value;
    }

    // Save Setting
    document.getElementById("mousemiddle_settings_opt").onchange = function() {
        UserSettings.mousemiddle_button = this.value;
    }

    document.getElementById("starbattle_settings_opt").onchange = function() {
        UserSettings.starbattle_dots = this.value;
    }

    document.getElementById("secondcolor_settings_opt").onchange = function() {
        UserSettings.secondcolor = this.value;
    }

    document.getElementById("sudoku_settings_normal_opt").onchange = function() {
        UserSettings.sudoku_normal_size = this.value;
    }

    document.getElementById("sudoku_settings_opt").onchange = function() {
        UserSettings.sudoku_centre_size = this.value;
    }

    document.getElementById("reload_button").onchange = function() {
        UserSettings.reload_button = this.value;
    }

    document.getElementById("clear_storage_opt").onchange = function() {
        UserSettings.local_storage = this.value;
    }

    $(document).ready(function() {
        if (pu.mmode !== "solve" && (pu.gridtype === "square" || pu.gridtype === "sudoku" || pu.gridtype === "kakuro")) {
            $('#constraints_settings_opt').select2({
                'width': "resolve" // 25% was used before
            });
        }
    });

    $.fn.toggleSelect2 = function(state) {
        return this.each(function() {
            $.fn[state ? 'show' : 'hide'].apply($(this).next('.select2-container'));
        });
    };

    document.getElementById("constraints_settings_opt").onchange = function() {
        let current_constraint = document.getElementById("constraints_settings_opt").value;
        if (current_constraint === "all") {
            // Display the mode break line if min-width greater than 850px (defined in base-structure.css media)
            // and responsive mode is not equal to 1
            let responsive_mode = UserSettings.responsive_mode;
            if (responsive_mode === 1 || (responsive_mode > 1 && window.innerWidth < 850)) {
                document.getElementById("mode_break").style.display = "inline";
                document.getElementById("mode_txt_space").style.display = "inline";
                // document.getElementById("visibility_break").style.display = "none";
            } else if (responsive_mode > 1 && window.innerWidth >= 850) {
                // document.getElementById("visibility_break").style.display = "inline";
            }

            // set the default submode
            for (let i = 0; i < penpa_constraints["setting"][current_constraint]["modeset"].length; i++) {
                let modeset = penpa_constraints["setting"][current_constraint]["modeset"][i];
                let submodeset = penpa_constraints["setting"][current_constraint]["submodeset"][i];
                let styleset = penpa_constraints["setting"][current_constraint]["styleset"][i];
                if (submodeset !== "") {
                    pu.mode[pu.mode.qa][modeset][0] = submodeset;
                }
                if (styleset !== "") {
                    pu.mode[pu.mode.qa][modeset][1] = styleset;
                }
            }

            // Display all modes
            pu.set_allmodes("inline-block");
        } else {
            // Remove all modes, default is none
            pu.set_allmodes();

            // Display the visibility break line if min-width greater than 850px (defined in base-structure.css media)
            // and responsive mode is not equal to 1
            // let responsive_mode = UserSettings.responsive_mode;
            // if (responsive_mode === 1 || (responsive_mode > 1 && window.innerWidth < 850)) {
            //     document.getElementById("visibility_break").style.display = "none";
            // } else if (responsive_mode > 1 && window.innerWidth >= 850) {
            //     document.getElementById("visibility_break").style.display = "inline";
            // }

            // Remove the mode break line
            document.getElementById("mode_break").style.display = "none";
            document.getElementById("mode_txt_space").style.display = "none";

            // Display generic ones
            for (var i of penpa_constraints["setting"]["general"]) {
                document.getElementById(i).style.display = "inline-block";
            }

            // Display only the selected ones
            for (var i of penpa_constraints["setting"][current_constraint]["show"]) {
                document.getElementById(i).style.display = "inline-block";
            }

            // set the default submode
            for (let i = 0; i < penpa_constraints["setting"][current_constraint]["modeset"].length; i++) {
                let modeset = penpa_constraints["setting"][current_constraint]["modeset"][i];
                let submodeset = penpa_constraints["setting"][current_constraint]["submodeset"][i];
                let styleset = penpa_constraints["setting"][current_constraint]["styleset"][i];
                if (submodeset !== "") {
                    pu.mode[pu.mode.qa][modeset][0] = submodeset;
                }
                if (styleset !== "") {
                    pu.mode[pu.mode.qa][modeset][1] = styleset;
                }
            }

            // Display 1 time Info regarding border setting
            if (penpa_constraints["border"].includes(current_constraint) && pu.borderwarning) {
                pu.borderwarning = false;
                Swal.fire({
                    html: '<h2 class="info">To place clues on grid border/edges and corners:<br> Turn Border: ON</h2>',
                    timer: 8000,
                    icon: 'info'
                })
            }
        }
        pu.redraw();
    }

    document.getElementById("mode_choices").onchange = function() {
        UserSettings.tab_settings = getValues('mode_choices');

        if (can_use_lite()) {
            liteModeButton.disabled = false;

            // Dynamically updating the display of modes based on tab setting changes
            if (liteModeButton.innerText === "Disable Penpa Lite") {
                advancecontrol_on(); // First display back everything
                advancecontrol_off("new"); // apply new choices for penpa lite
            }
        } else {
            // Dynamically updating the display of modes based on tab setting changes
            liteModeButton.innerText = "Enable Penpa Lite";
            advancecontrol_on();

            liteModeButton.disabled = true;
        }
    }

    // Panel Setting
    document.getElementById("panel_button").onchange = function() {
        panel_onoff();
    }

    // Conflict detection
    document.getElementById("conflict_detection_opt").onchange = function() {
        UserSettings.conflict_detection = this.value;
        pu.redraw();
    }

    // Timer Bar Setting
    document.getElementById("timer_bar_opt").onchange = function() {
        UserSettings.timerbar_status = this.value;
    }

    // Shorten links setting
    document.getElementById("shorten_links_dropdown").onchange = function() {
        UserSettings.shorten_links = String(this.value) === "1";
    }
    document.getElementById("auto_shorten_chk").onchange = function() {
        UserSettings.shorten_links = this.checked;
    }

    // Timer pause and unpause
    document.getElementById("sw_pause").addEventListener("click", pauseTimer);
    document.getElementById("sw_start").addEventListener("click", startTimer);

    function pauseTimer() {
        pu.show_pause_layer();
        sw_timer.pause();
    }

    function startTimer() {
        pu.hide_pause_layer();
        sw_timer.start({ precision: 'secondTenths' });
    }
};

function clear_storage_one() {
    // check for local progress
    // get md5 hash for unique id
    if (typeof pu.url === 'string') {
        try {
            let hash = "penpa_" + md5(pu.url);
            localStorage.removeItem(hash);
            Swal.fire({
                html: '<h2 class="info">Local Storage is Cleared</h2>',
                icon: 'info'
            });
        } catch (error) {
            console.log('md5 package is being blocked, most probably by Adblock', error);
            Swal.fire({
                html: '<h2 class="info">Most likely, md5 package is being blocked by Adblock, local storage feature is not effective. Solution: Disable Adblock on Penpa+ Site</h2>',
                icon: 'info'
            });
        }
    }

    // turn off localstorage
    UserSettings.local_storage = 3; // not using 4 because this is temporary state
}

function clear_storage_all() {
    var keys = Object.keys(localStorage),
        i = keys.length;

    while (i--) {
        if (keys[i].includes("penpa")) {
            localStorage.removeItem(keys[i]);
        }
    }
    // localStorage.clear(); for all clear

    // turn off localstorage
    UserSettings.local_storage = 3; // not using 4 because this is temporary state

    Swal.fire({
        html: '<h2 class="info">Local Storage is Cleared</h2>',
        icon: 'info'
    });
}