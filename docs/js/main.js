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
        if (e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
            e.preventDefault(); // When both mouse and touch start, only touch
        }
        var ctrl_key = e.ctrlKey;
        if (ondown_key === "mousedown" && event.button !== 2) {
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
                pu.mouseevent(x, y, num, ctrl_key);
            } else { // Left click or tap
                pu.mouse_mode = "down_left";
                pu.mouse_click = 0;
                pu.mouseevent(x, y, num, ctrl_key);
            }
        }
    }

    function onUp(e) {
        if (e.type === "mouseup") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
            e.preventDefault(); // When both mouse and touch start, only touch
        }
        if (ondown_key === "mousedown" && (pu.mode[pu.mode.qa].edit_mode === "combi") &&
            (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "yajilin")) {
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

    function onMove(e) {
        if (e.type === "mousemove") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }
        e.preventDefault();
        if (event.buttons === 2) { // Right click and moving
            pu.mouse_click = 2;
            var obj = coord_point(event, 'flex');
        } else {
            if ((pu.mode[pu.mode.qa].edit_mode === "combi") &&
                (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "yajilin")) {
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
    let modes = ["Surface", "Wall", "Shape", "Composite",
        "Line Normal", "Line Diagonal", "Line Free", "Line Middle", "Line Helper",
        "Edge Normal", "Edge Diagonal", "Edge Free", "Edge Helper",
        "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side",
        "Sudoku Normal", "Sudoku Corner", "Sudoku Centre"
    ];

    let modes_mapping = ["surface", "wall", "symbol", "combi",
        "sub_line1", "sub_line2", "sub_line3", "sub_line5", "sub_line4",
        "sub_lineE1", "sub_lineE2", "sub_lineE3", "sub_lineE4",
        "sub_number1", "sub_number10", "sub_number6", "sub_number5", "sub_number7", "sub_number3", "sub_number9",
        "sub_sudoku1", "sub_sudoku2", "sub_sudoku3"
    ];
    let previous_mode = "surface";
    let previous_submode = 1;
    let previous_length = 2;
    let counter_index = 0;
    let present_submode;
    let shift_counter = 0;
    let shift_numkey = false;
    let shift_release_time = -1e5;
    let ctrl_counter = 0;
    let ctrl_numkey = false;
    let ctrl_release_time = -1e5;

    function onKeyDown(e) {
        if (e.target.type === "number" ||
            e.target.type === "text" ||
            e.target.id === "savetextarea_pp" ||
            e.target.id === "iostring" ||
            e.target.id === "inputtext" ||
            e.target.id === "saveinforules" ||
            e.target.id === "urlstring") {
            // For input form
        } else {
            var key = e.key;
            var keycode = e.keyCode;
            var code = e.code;
            var keylocation = e.location;
            var shift_key = e.shiftKey;
            var ctrl_key = e.ctrlKey;
            var alt_key = e.altKey;
            var str_num = "1234567890";
            var str_alph_low = "abcdefghijklmnopqrstuvwxyz";
            var str_alph_up = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var str_sym = "!\"#$%&\'()-=^~|@[];+:*,.<>/?_£§¤";

            if ((Date.now() - shift_release_time) < 15) {
                shift_counter = 1;
                pu.submode_check("sub_sudoku2");
                shift_release_time = -1e5;
            }

            // For shift shortcut in Sudoku mode, modify the numpad keys
            // keylocation 3 indicates numlock is ON and number pad is being used
            if (pu.mode[pu.mode.qa].edit_mode === "sudoku" && key !== "Shift" && keylocation === 3 && !ctrl_key && !alt_key) {
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
                event.returnValue = false;
            } else if (key === "F3") {
                pu.mode_qa("pu_a");
                event.returnValue = false;
            }

            if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") { //arrow
                pu.key_arrow(key, ctrl_key);
                event.returnValue = false;
            }

            if (key === "Shift") {
                shift_counter = shift_counter + 1;
            }

            if (key === "Shift" && shift_counter === 1 && !ctrl_key && !alt_key && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                present_submode = pu.mode[pu.mode.qa]["sudoku"][0];
                if (present_submode !== 2) {
                    pu.submode_check("sub_sudoku2");
                }
                event.returnValue = false;
            }

            if (key === "Control") {
                ctrl_counter = ctrl_counter + 1;
            }

            if (key === "Control" && ctrl_counter === 1 && !shift_key && !alt_key && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                present_submode = pu.mode[pu.mode.qa]["sudoku"][0];
                if (present_submode !== 3) {
                    pu.submode_check("sub_sudoku3");
                }
                event.returnValue = false;
            }

            if (!ctrl_key && !alt_key) {
                if (shift_key && key === " ") {
                    pu.key_number(key);
                    event.returnValue = false;
                } else if (str_num.indexOf(key) != -1 ||
                    str_alph_low.indexOf(key) != -1 ||
                    str_alph_up.indexOf(key) != -1 ||
                    str_sym.indexOf(key) != -1 ||
                    (keycode >= 48 && keycode <= 57)) {
                    event.preventDefault();
                    if (shift_key && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
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
                    pu.key_space(keycode);
                    event.returnValue = false;
                } else if (key === "Backspace") {
                    pu.key_backspace();
                    event.returnValue = false;
                }
            }

            if (ctrl_key && !shift_key && !alt_key) {
                if (key != "Control") {
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
                            event.returnValue = false;
                            break;
                        case "y": //Ctrl+y
                        case "Y":
                            if (!pu.undoredo_disable) {
                                pu.redo();
                            }
                            event.returnValue = false;
                            break;
                        case "z": //Ctrl+z
                        case "Z":
                            if (!pu.undoredo_disable) {
                                pu.undo();
                            }
                            event.returnValue = false;
                            break;
                        case " ": //Ctrl+space
                            pu.key_shiftspace();
                            event.returnValue = false;
                            break;
                        case "i": //Ctrl+i
                        case "I":
                            if ((document.getElementById('panel_button').textContent === "ON") &&
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
                            event.returnValue = false;
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
                            event.returnValue = false;
                            break;
                    }
                } else {
                    event.returnValue = false;
                }
            }

            if (!ctrl_key && (pu.mode[pu.mode.qa].edit_mode === "surface" || pu.mode[pu.mode.qa].edit_mode === "sudoku")) {
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
                        event.returnValue = false;
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
                        event.returnValue = false;
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
                        event.returnValue = false;
                        break;
                    case "v":
                    case "V":
                        present_mode = document.getElementById("mo_surface").checked;
                        if (!present_mode) {
                            pu.mode_set("surface");
                            e.preventDefault();
                        }
                        event.returnValue = false;
                        break;
                    default:
                        event.returnValue = false;
                        break;
                }
            }

            if (key === "Tab" || key === "Enter") {
                let user_choices = getValues('mode_choices');
                if (user_choices.length !== 0) {
                    if (previous_length != user_choices.length) {
                        previous_length = user_choices.length;
                        counter_index = 0; // reset the counter
                    } else if (counter_index < (previous_length - 1)) {
                        counter_index++;
                    } else {
                        counter_index = 0; // reset the counter
                    }
                    let mode_loc = modes.indexOf(user_choices[counter_index]);
                    if (mode_loc < 4) { // Hard coded, '4', Surface, Shape, Wall, Composite Modes, remaining choices are related to submodes
                        pu.mode_set(modes_mapping[mode_loc])
                        e.preventDefault();
                    } else {
                        if (modes_mapping[mode_loc].includes("number")) {
                            pu.mode_set('number')
                            e.preventDefault();
                        } else if (modes_mapping[mode_loc].includes("sudoku")) {
                            pu.mode_set('sudoku')
                            e.preventDefault();
                        } else if (modes_mapping[mode_loc].includes("lineE")) {
                            pu.mode_set('lineE')
                            e.preventDefault();
                        } else {
                            pu.mode_set('line')
                            e.preventDefault();
                        }
                        pu.submode_check(modes_mapping[mode_loc]);
                        e.preventDefault();
                    }
                    event.returnValue = false;
                }
            }
        }
    }

    function onKeyUp(e) {
        if (e.target.type === "number" ||
            e.target.type === "text" ||
            e.target.id === "savetextarea_pp" ||
            e.target.id === "iostring" ||
            e.target.id === "inputtext" ||
            e.target.id === "saveinforules" ||
            e.target.id === "urlstring") {
            // For input form
        } else {
            var key = e.key;
            var keylocation = e.location;
            if (key === "Shift" && keylocation !== 3 && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                if (present_submode === "1") {
                    pu.submode_check("sub_sudoku1");
                } else if (present_submode === "2") {
                    pu.submode_check("sub_sudoku2");
                } else if (present_submode === "3") {
                    pu.submode_check("sub_sudoku3");
                }
                shift_counter = 0;
                shift_release_time = Date.now();
                event.returnValue = false;
            } else if (key === "Control" && keylocation !== 3 && pu.mode[pu.mode.qa].edit_mode === "sudoku") {
                if (present_submode === "1") {
                    pu.submode_check("sub_sudoku1");
                } else if (present_submode === "2") {
                    pu.submode_check("sub_sudoku2");
                } else if (present_submode === "3") {
                    pu.submode_check("sub_sudoku3");
                }
                ctrl_counter = 0;
                ctrl_release_time = Date.now();
                event.returnValue = false;
            }

        }
    }

    function coord_point(e, fittype = 'none') {
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        var min0, min = 10e6;
        var num = 0;
        let type;
        //const startTime = performance.now();

        // Improving starbattle composite mode, left click
        if (fittype === 'flex') {
            if ((pu.mode[pu.mode.qa].edit_mode === "combi") &&
                ((pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "star") ||
                    (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "yajilin"))) {
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
            if ((pu.mode[pu.mode.qa].edit_mode === "combi") &&
                ((pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "star") ||
                    (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === "yajilin"))) {
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
            e.target.id != "float-canvas" && !e.ctrlKey) {
            // clear selection
            pu.selection = [];
            pu.redraw();
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
            case "tb_undo":
                pu.undo();
                e.preventDefault();
                break;
            case "tb_redo":
                pu.redo();
                e.preventDefault();
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
                // theme setting
            case "light_mode_lb":
                document.getElementById("light_mode").checked = true;
                document.getElementById("color_theme").href = "./css/light_theme.css";
                pu.set_redoundocolor();
                pu.redraw();
                e.preventDefault();
                break;
            case "dark_mode_lb":
                document.getElementById("dark_mode").checked = true;
                document.getElementById("color_theme").href = "./css/dark_theme.css";
                pu.set_redoundocolor();
                pu.redraw();
                e.preventDefault();
                break;
                // custom color
            case "custom_color_yes_lb":
                document.getElementById("custom_color_yes").checked = true;
                let mode = pu.mode[pu.mode.qa].edit_mode;
                if (((pu.gridtype === "square" || pu.gridtype === "sudoku" || pu.gridtype === "kakuro")) &&
                    (mode === "line" || mode === "lineE" || mode === "wall" || mode === "surface" || mode === "cage" || mode === "special")) {
                    document.getElementById('style_special').style.display = 'inline';
                }
                pu.redraw();
                e.preventDefault();
                break;
            case "custom_color_no_lb":
                document.getElementById("custom_color_no").checked = true;
                document.getElementById('style_special').style.display = 'none';
                pu.redraw();
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
                newgrid();
                e.preventDefault();
                break;
            case "closeBtn_nb3":
                document.getElementById('modal').style.display = 'none';
                e.preventDefault();
                break;
                //newsize
            case "nb_size3_r":
                return;
            case "closeBtn_size1":
                newgrid_r();
                e.preventDefault();
                break;
            case "closeBtn_size2":
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
                //buttons
            case "panel_button":
                panel_onoff();
                e.preventDefault();
                break;
            case "edge_button":
                edge_onoff();
                e.preventDefault();
                break;
            case "visibility_button":
                solutionvisible_onoff();
                e.preventDefault();
                break;
            case "reload_button":
                reloadcheck_onoff();
                e.preventDefault();
                break;
            case "pu_q_label":
                pu.mode_qa("pu_q");
                e.preventDefault();
                break;
            case "pu_a_label":
                pu.mode_qa("pu_a");
                e.preventDefault();
                break;
            case "puzzlerules":
                display_rules();
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

        drag.style.top = event.pageY - y_window + "px";
        drag.style.left = event.pageX - x_window + "px";
        body.style.top = event.pageY - y_window + "px";
        body.style.left = event.pageX - x_window + "px";
        window.panel_toplast = body.style.top;
        window.panel_leftlast = body.style.left;
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
            if (document.getElementById('panel_button').textContent === "ON" && pu.onoff_symbolmode_list[pu.mode[pu.mode.qa].symbol[0]]) {
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
        option.text = modes[i];
        if (this.usertab_choices) {

            // Load the author defined tab settings if any
            if (this.usertab_choices.indexOf(modes[i]) > -1) {
                option.setAttribute("selected", true);
            }
        }
        select.appendChild(option);
    }
    selectBox = new vanillaSelectBox("#mode_choices", {
        "disableSelectAll": false,
        "maxHeight": 135,
        "search": true,
        "translations": { "all": "All", "items": "items", "selectAll": "Check All", "clearAll": "Clear All" }
    }); //"placeHolder": "Surface" translations: { "items": "tab" } "maxWidth": 140

    window.addEventListener('beforeunload', function(e) {
        if (document.getElementById('reload_button').textContent === "ON") {
            // Cancel the event
            e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
            // Chrome requires returnValue to be set
            e.returnValue = '';
        }
    });

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
};