// Including meta allows CMD to work on Mac
let isCtrlKeyHeld = e => e.ctrlKey || e.metaKey;
let isCtrlKeyPressed = key => key === "Control" || key === "Meta";
let isShiftKeyHeld = e => e.shiftKey;
let isShiftKeyPressed = key => key === "Shift";
let isAltKeyHeld = e => e.altKey;
let isAltKeyPressed = key => key === "Alt";
let localStorageAvailable = false;

onload = function() {

    // Detect mobile or Ipad beforing booting
    var ua = navigator.userAgent;
    var ondown_key;
    let is_iPad = (!(ua.toLowerCase().match("iphone")) && ua.maxTouchPoints > 1);
    let is_iPad2 = (navigator.platform === "MacIntel" && typeof navigator.standalone !== "undefined");
    let is_iPad3 = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    try {
        if (window.localStorage) {
            window.localStorage.setItem('test', 123);
            localStorageAvailable = (window.localStorage.getItem('test') === "123");
            window.localStorage.removeItem('test');
        }
    } catch (e) {
        localStorageAvailable = false;
    }

    if (!localStorageAvailable) {
        document.getElementById('allow_local_storage').classList.add('is_hidden');
        document.getElementById('clear_storage_one').classList.add('is_hidden');
        document.getElementById('clear_storage_all').classList.add('is_hidden');
        document.getElementById('local_storage_browser_message').classList.remove('is_hidden');
    }

    if (ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        ondown_key = "touchstart";
    } else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0 || is_iPad || is_iPad2 || is_iPad3) {
        ondown_key = "touchstart";
    } else {
        ondown_key = "mousedown";
    }
    this.ondown_key = ondown_key;

    // Update genre tags
    $('#genre_tags_opt').on('change', () => pu.update_genre_tags());

    // Declare custom color picker
    $(colorpicker_special).spectrum({
        type: "color",
        preferredFormat: "hex",
        showInput: true,
        chooseText: "OK",
        // cancelText: "No way",
        // showAlpha: true,
        allowAlpha: true,
        allowEmpty: true,
        showInitial: true,
        togglePaletteOnly: true,
        togglePaletteMoreText: 'more',
        togglePaletteLessText: 'less',
        showPalette: true,
        // hideAfterPaletteSelect: true,
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
    $(colorpicker_special).on('change', function(e, color) { pu.update_customcolor(color ? color.toRgbString() : color); });

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

    let restrict_grids = ["square", "sudoku", "kakuro"];
    let restrict_modes = ["line", "linex", "linedir", "lineox", "yajilin", "rassisillai"];

    function restrict_mouse(num) {
        let current_mode = pu.mode[pu.mode.qa].edit_mode;
        if (current_mode == "combi") {
            current_mode = pu.mode[pu.mode.qa][current_mode][0];
        }
        if (pu &&
            restrict_grids.includes(pu.gridtype) &&
            restrict_modes.includes(current_mode) &&
            pu.cellsoutsideFrame.includes(num)) {
            return true;
        } else {
            return false;
        }
    }

    function onDown(e) {
        if ((ondown_key === "mousedown" && e.button !== 1) || (ondown_key === "touchstart")) { // Ignore Middle button
            if (e.type === "mousedown" || e.type === "dblclick") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
                e.preventDefault(); // When both mouse and touch start, only touch
            }
            if (ondown_key === "mousedown" && event.button !== 2 &&
                pu.mode[pu.mode.qa].edit_mode !== "number" &&
                pu.mode[pu.mode.qa].edit_mode !== "sudoku") { // not right click and so improve the coordinate system for certain modes
                var obj = coord_point(event, 'flex');
            } else {
                var obj = coord_point(event);
            }
            var x = obj.x,
                y = obj.y,
                num = obj.num;

            let ctrl = isCtrlKeyHeld(e) || isShiftKeyHeld(e);

            // Remember whether this cell was already in the selection so we can
            // remove instead of add cells
            pu.select_remove = ctrl && pu.selection.indexOf(num) !== -1;

            let skip_mouseevent = restrict_mouse(num);
            if (pu.point[num].use === 1 && !skip_mouseevent) {
                if (e.type === "dblclick") {
                    pu.mouse_mode = "down_left";
                    pu.mouse_click = 0;
                    pu.dblmouseevent(x, y, num, ctrl);
                } else if (event.button === 2) { // right click
                    pu.mouse_mode = "down_right";
                    pu.mouse_click = 2;
                    pu.mouse_click_last = 2;
                    pu.mouseevent(x, y, num, ctrl, e, obj);
                } else { // Left click or tap
                    pu.mouse_mode = "down_left";
                    pu.mouse_click = 0;
                    pu.mouse_click_last = 1;
                    pu.mouseevent(x, y, num, ctrl, e, obj);
                }
            }
        }
    }

    function onUp(e) {
        let edit_mode = pu.mode[pu.mode.qa].edit_mode;
        if ((ondown_key === "mousedown" && e.button !== 1) || (ondown_key === "touchstart")) { // Ignore Middle button
            if (e.type === "mouseup") {
                var event = e;
            } else {
                var event = e.changedTouches[0];
                e.preventDefault(); // When both mouse and touch start, only touch
            }
            // to handle mobile/ipad users for up events for certain modes
            if (ondown_key === "mousedown" && (edit_mode === "sudoku" || edit_mode === "number" ||
                    (edit_mode === "combi" && (pu.mode[pu.mode.qa][edit_mode][0] === "yajilin" ||
                        pu.mode[pu.mode.qa][edit_mode][0] === "akari")))) {
                var obj = coord_point(event, 'flex');
            } else {
                var obj = coord_point(event);
            }
            var x = obj.x,
                y = obj.y,
                num = obj.num;
            let skip_mouseevent = restrict_mouse(num);
            if (skip_mouseevent) {
                onOut();
            }
            if (!skip_mouseevent) {
                pu.mouse_mode = "up";
                pu.mouse_click = 0;
                pu.mouseevent(x, y, num);
            }
        }
    }

    function onMove(e) {
        let edit_mode = pu.mode[pu.mode.qa].edit_mode;
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
            } else if ((ondown_key === "touchstart" || event.buttons === 1) &&
                (edit_mode === "sudoku" || edit_mode === "number")) { // Left click/Ipad and moving in Sudoku Mode
                pu.mouse_click = 0;
                var obj = coord_point(event, 'flex');
            } else {
                if (((edit_mode === "combi") && (pu.mode[pu.mode.qa][edit_mode][0] === "yajilin" ||
                        pu.mode[pu.mode.qa][edit_mode][0] === "akari"))) {
                    var obj = coord_point(event, 'flex');
                } else {
                    var obj = coord_point(event);
                }
                pu.mouse_click = 0;
            }
            var x = obj.x,
                y = obj.y,
                num = obj.num;
            let skip_mouseevent = restrict_mouse(num);
            if (skip_mouseevent) {
                onOut();
            } else if (pu.point[num].use === 1) {
                // Handle alt+drag for rectangular selection
                if (event.buttons > 0 && pu.rect_select_base !== null) {
                    pu.selection = pu.old_selection.slice();
                    let [nx, ny, _] = obj.index;
                    let [ox, oy, __] = pu.rect_select_base;
                    let [left, right] = [Math.min(nx, ox), Math.max(nx, ox)];
                    let [top, bottom] = [Math.min(ny, oy), Math.max(ny, oy)];
                    for (let xx = left; xx <= right; xx++) {
                        for (let yy = top; yy <= bottom; yy++) {
                            let n = (pu.nx0) * yy + xx;
                            if (pu.point[n].use) {
                                let index = pu.selection.indexOf(n);
                                if (pu.select_remove) {
                                    if (index !== -1)
                                        pu.selection.splice(index, 1);
                                } else if (index === -1)
                                    pu.selection.push(n);
                            }
                        }
                    }
                    pu.redraw();
                } else {
                    pu.mouse_mode = "move";
                    pu.mouseevent(x, y, num);
                }
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

    let previous_length = 2;
    let counter_index = 0;
    let present_submode;
    let shift_counter = 0;
    let shift_numkey = false;
    let shift_release_time = -1e5;
    let shift_time_limit = 15; // milliseconds
    let ctrl_counter = 0;
    let number_release_time = -1e5;
    let number_release_limit = 300; // milliseconds
    let previousdigit1 = false;

    // Allow typing as usual when appropriate.
    const targetTypes = {
        "number": 1,
        "text": 1
    };

    const targetIDs = {
        "savetextarea_pp": 1,
        "custom_message": 1,
        "iostring": 1,
        "inputtext": 1,
        "select2_search": 1,
        "saveinforules": 1,
        "urlstring": 1
    };

    function onKeyDown(e) {
        // Allow normal typing in these cases and bail on special handling.
        if (targetTypes[e.target.type] || targetIDs[e.target.id]) {
            return;
        }

        var key = e.key;

        if (checkFunctionKeys(e, key)) {
            return;
        }

        var keycode = e.keyCode;
        var code = e.code;
        var str_num = "1234567890";
        var str_alph_low = "abcdefghijklmnopqrstuvwxyz";
        var str_alph_up = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var str_sym = "!\"#$%&\'()-=^~|@[];+:*,.<>/?_£§¤\\{}";

        // check for caps lock
        var capslock = false;
        if ((str_alph_up.indexOf(key) != -1 && !isShiftKeyHeld(e)) ||
            (str_alph_low.indexOf(key) != -1 && isShiftKeyHeld(e))) {
            capslock = true;
        }

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

        if (key === '?' &&
            pu.mode[pu.mode.qa].edit_mode !== "number" &&
            pu.mode[pu.mode.qa].edit_mode !== "sudoku") {
            show_shortcuts();
            e.returnValue = false;
            return;
        }

        // keylocation 3 indicates numlock is ON and number pad is being used
        const keylocation = e.location;

        if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") { //arrow
            if (pu.mode[pu.mode.qa].edit_mode === "sudoku" && keylocation === 3) {
                // Skip arrow behavior deliberately for sudoku numpad usage.
            } else {
                pu.key_arrow(key, isCtrlKeyHeld(e) || isShiftKeyHeld(e));
                e.returnValue = false;
            }
        }

        if (!isCtrlKeyHeld(e) && checkShortcutKeys(e, code, capslock)) {
            return false;
        }

        if (key === 'Escape') {
            // Escape out of any modal dialogs if they're open

            // Weird hack to make sure any sub-dialogs are exited first
            const sub_modals = ["modal-save-tag", "modal-save2"];
            let modals = [...document.getElementsByClassName('modal')];
            modals.sort((a, b) => !sub_modals.includes(a.id) && sub_modals.includes(b.id));

            for (var m of modals) {
                if (m.style.display && m.style.display !== 'none') {
                    e.preventDefault();
                    m.style.display = 'none';
                    return false;
                }
            }

            pu.selection = [];
            pu.redraw();
            e.returnValue = false;
            return false;
        }

        // All of this is specific to sudoku
        if (pu.mode[pu.mode.qa].edit_mode === "sudoku") {

            // For shift shortcut in Sudoku mode, modify the numpad keys
            if (keylocation === 3 && !isShiftKeyPressed(key) && !isCtrlKeyHeld(e) && !isAltKeyHeld(e)) {
                const numpadMap = {
                    45: "0",
                    35: "1",
                    40: "2",
                    34: "3",
                    37: "4",
                    12: "5",
                    39: "6",
                    36: "7",
                    38: "8",
                    33: "9"
                };
                if (numpadMap[keycode]) {
                    key = numpadMap[keycode];
                    shift_numkey = true;
                }
            }

            if (isShiftKeyPressed(key)) {
                shift_counter = shift_counter + 1;

                if (shift_counter === 1 && !isCtrlKeyHeld(e) && !isAltKeyHeld(e)) {
                    present_submode = pu.mode[pu.mode.qa]["sudoku"][0];
                    if (present_submode !== 2) {
                        pu.submode_check("sub_sudoku2");
                    }
                    e.returnValue = false;
                }
            }

            if (isCtrlKeyPressed(key)) {
                ctrl_counter = ctrl_counter + 1;

                if (ctrl_counter === 1 && !isShiftKeyHeld(e) && !isAltKeyHeld(e)) {
                    present_submode = pu.mode[pu.mode.qa]["sudoku"][0];
                    if (present_submode !== 3) {
                        pu.submode_check("sub_sudoku3");
                    }
                    e.returnValue = false;
                }
            }

            if (isCtrlKeyHeld(e) && (keycode === 46 || (keycode === 8))) {
                // 46 is for Enter, 8 is for backspace which behaves as Enter for Mac Devices. Since Penpa doesnt use backspace in
                // Sudoku mode, I have assigned it to Delete
                pu.key_space(keycode, isShiftKeyHeld(e), isCtrlKeyHeld(e));
                e.returnValue = false;
            }
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
                    if (!capslock && keycode >= 65 && keycode <= 90) {
                        keycode = keycode + 32;
                    }
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

        // Map ctrl-shift-z to ctrl-y
        if (isCtrlKeyHeld(e) && isShiftKeyHeld(e) && !isAltKeyHeld(e) && (key === "z" || key === "Z")) {
            if (!pu.undoredo_disable) {
                pu.redo();
            }
            e.returnValue = false;
            return;
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
                    case "a": //Ctrl+a
                    case "A":
                        // Don't trigger ctrl-a sequence if a target is selected (eg a textbox)
                        if (e.target.id !== "") {
                            e.returnValue = true;
                            break;
                        }
                        pu.selection = pu.centerlist.slice();
                        pu.redraw();
                        e.returnValue = false;
                        break;
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
                                    pu.key_number(panel_pu.cont[panel_select].toString(), true);
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

        const surfaceKeys = {
            "1": "st_surface1",
            "2": "st_surface8",
            "3": "st_surface3",
            "4": "st_surface4",
            "5": "st_surface2",
            "6": "st_surface5",
            "7": "st_surface6",
            "8": "st_surface7",
            "9": "st_surface9",
            "0": "st_surface10",
            "11": "st_surface11",
            "12": "st_surface12"
        };

        if (!isCtrlKeyHeld(e) && pu.mode[pu.mode.qa].edit_mode === "surface") {
            const surfaceCode = surfaceKeys[key];

            if (surfaceCode) {
                present_style = document.getElementById(surfaceCode).checked;
                if (!present_style) {
                    pu.stylemode_check(surfaceCode);
                    e.preventDefault();
                }
            }

            e.returnValue = false;
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
                counter_index %= user_choices.length;
                let mode_loc = PenpaText.modes.EN.indexOf(user_choices[counter_index]);

                // Surface, Shape, Wall, Composite Modes, remaining choices are related to submodes
                let mode_name = PenpaText.modes.mapping[mode_loc];
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
                    } else if (mode_name.includes("move")) {
                        pu.mode_set('move');
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

    const shortcutModeMap = {
        "KeyZ": ["sudoku", "sub_sudoku1"],
        "KeyX": ["sudoku", "sub_sudoku2"],
        "KeyC": ["sudoku", "sub_sudoku3"],
        "KeyV": ["surface"]
    };

    function checkShortcutKeys(e, code, capslock) {
        let mode = pu.mode[pu.mode.qa].edit_mode;
        if (mode !== "surface" && mode !== "sudoku") {
            return false;
        }

        let detected = false;

        if (!capslock && UserSettings.shortcuts_enabled) {
            let mappedCode = shortcutModeMap[code];

            if (mappedCode) {
                // Change to the main mode for this shortcut
                let m = mappedCode[0];
                let present_mode = document.getElementById("mo_" + m).checked;
                if (!present_mode) {
                    pu.mode_set(m);
                    detected = true;
                }

                // Change to the submode if needed
                if (mappedCode.length > 1) {
                    let sm = mappedCode[1];
                    let present_submode = document.getElementById(sm).checked;
                    if (!present_submode) {
                        pu.submode_check(sm);
                        detected = true;
                    }
                }
                e.returnValue = false;
            }
        }

        if (detected) {
            e.preventDefault();
        }

        return detected;
    }

    function checkFunctionKeys(e, key) {
        if (key === "F2") { //function_key
            if (pu.mode.qa != 'pu_q') {
                if (pu.mmode == 'solve') {
                    Swal.fire({
                        title: PenpaText.get('f2_title'),
                        html: PenpaText.get('f2_body'),
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: Color.BLUE_SKY,
                        cancelButtonColor: Color.RED,
                        confirmButtonText: PenpaText.get('f2_confirm')
                    }).then((result) => {
                        if (result.isConfirmed) {
                            pu.mode_qa("pu_q");
                            document.getElementById('dvique').style.borderColor = Color.BLACK_LIGHT;
                            var title = document.getElementById("title");
                            title.textContent = PenpaText.get('setter_mode_while_solving');
                        }
                    })
                } else {
                    pu.mode_qa("pu_q");
                    document.getElementById('dvique').style.borderColor = Color.BLACK_LIGHT;
                }
            }
            e.returnValue = false;
            return true;
        }

        if (key === "F3") {
            if (pu.mode.qa != 'pu_a') {
                if (pu.mmode == 'solve') {
                    Swal.fire({
                        title: PenpaText.get('f3_title'),
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: Color.BLUE_SKY,
                        cancelButtonColor: Color.RED,
                        confirmButtonText: PenpaText.get('f2_confirm')
                    }).then((result) => {
                        if (result.isConfirmed) {
                            pu.mode_qa("pu_a");
                            document.getElementById('dvique').style.borderColor = Color.GREEN_LIGHT;
                            var title = document.getElementById("title");
                            if (pu.solution) {
                                title.innerHTML = PenpaText.get('solver_mode_answer');
                            } else {
                                title.innerHTML = PenpaText.get('solver_mode');
                            }
                        }
                    })
                } else {
                    pu.mode_qa("pu_a");
                    document.getElementById('dvique').style.borderColor = Color.GREEN_LIGHT;
                }
            }
            e.returnValue = false;
            return true;
        }

        if (key === "F4") { //function_key
            if (sw_timer.isPaused()) {
                startTimer();
            } else {
                pauseTimer();
            }
            e.returnValue = false;
            return true;
        }

        if (key === "F12") {
            return true;
        }

        return false;
    }

    function onKeyUp(e) {
        // Allow normal typing in these cases and bail on special handling.
        if (targetTypes[e.target.type] || targetIDs[e.target.id]) {
            return;
        }

        var key = e.key;

        const keylocation = e.location;
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

    function coord_point(e, fittype = 'none') {
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        var min0, min = 10e6;
        var num = 0;
        var improve_modes = ["star", "yajilin", "mines", "doublemines", "akari"];
        let edit_mode = pu.mode[pu.mode.qa].edit_mode;

        let type = pu.type;

        // Improving starbattle composite mode, left click
        if (fittype === 'flex') {
            if ((edit_mode === "combi" && improve_modes.includes(pu.mode[pu.mode.qa][edit_mode][0])) ||
                edit_mode === "sudoku" || edit_mode === "number")
                type = [0];
        }

        for (var i = 0; i < pu.point.length; i++) {
            if (pu.point[i] && type.indexOf(pu.point[i].type) != -1) {
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
        obj.index = pu.point[num].index;
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
        let eventTarget = e.target;
        if (eventTarget.classList.contains('fa')) {
            eventTarget = eventTarget.parentElement;
        }

        var orientation;
        //modalwindow
        if (eventTarget.className === "modal") {
            document.getElementById(eventTarget.id).style.display = 'none';
            e.preventDefault();
        }
        if (!pu.ondown_key) {
            pu.ondown_key = ondown_key;
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

        switch (eventTarget.id) {
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
            case "closeBtn_input3":
                panel_pu.loadtext();
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
            case "saveinfogenre2":
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
            case "address_clone":
                savetext_clone();
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
            case "pp_file2":
                make_ppfile2();
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
            case "and_tmp_lb":
                set_answer_setting_table_to('and');
                e.preventDefault();
                break;
            case "or_tmp_lb":
                set_answer_setting_table_to('or');
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
            case "quick_panel_toggle":
                UserSettings.panel_shown = !UserSettings.panel_shown;
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
                        title: '<h3>' + PenpaText.get('solution_incorrect_title') + '</h3>',
                        html: '<h2>' + PenpaText.get('solution_incorrect_main') + '</h2>',
                        icon: 'error',
                        confirmButtonText: PenpaText.get('ok'),
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
                    document.getElementById("replay_message").innerHTML = PenpaText.get('preparing_download');

                    setTimeout(function() {
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
        if (eventTarget.id.slice(0, 3) === "mo_") {
            pu.mode_set(eventTarget.id.slice(3, -3));
            e.preventDefault();
        }
        // Sub mode
        if (eventTarget.id.slice(0, 4) === "sub_") {
            pu.submode_check(eventTarget.id.slice(0, -3));
            e.preventDefault();
        }
        // Style mode
        if (eventTarget.id.slice(0, 3) === "st_") {
            pu.stylemode_check(eventTarget.id.slice(0, -3));
            e.preventDefault();
        }
        // Combination mode
        if (eventTarget.id.slice(0, 9) === "combisub_") {
            pu.subcombimode(eventTarget.id.slice(9));
            e.preventDefault();
        }
        // symbol
        if (eventTarget.id.slice(0, 3) === "ms_") {
            checkms = 1;
            pu.subsymbolmode(eventTarget.id.slice(3));
            e.preventDefault();
            //Symbol hover etc
        } else if (eventTarget.id.slice(0, 2) === "ms") {
            checkms = 1;
            return;
        } else if (checkms === 1) {
            checkms = 0;
            return;
        }
    }

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

    // Double click to select all of a certain element
    document.addEventListener("dblclick", window_dblclick, { passive: false });

    function window_dblclick(e) {
        if (e.target.id === "canvas") {
            document.getElementById("inputtext").blur(); // Remove focus from text box
            onDown(e);
            if (checkms === 0) {
                e.preventDefault();
            }
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
            if (UserSettings.panel_shown && pu.onoff_symbolmode_list[pu.mode[pu.mode.qa].symbol[0]]) {
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
                pu.key_number(panel_pu.cont[n].toString(), true);
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

    PenpaUI.initPenpaLite();

    window.addEventListener('beforeunload', function(e) {
        if (UserSettings.reload_button) {
            // Cancel the event
            e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
            // Chrome requires returnValue to be set
            e.returnValue = '';
        }
        save_progress();
    });

    document.addEventListener("visibilitychange", function() {
        if (document.visibilityState === "hidden") {
            save_progress();
        }
    });

    function save_progress() {
        // Save puzzle progress
        if (localStorageAvailable &&
            pu.url.length !== 0 &&
            pu.mmode === "solve" &&
            UserSettings.save_current_puzzle &&
            !pu.replay) {
            // get md5 hash for unique id
            let hash = "penpa_" + md5(pu.url);

            // generate duplicate link
            let rstr = pu.maketext_duplicate() + "&l=solvedup";

            localStorage.setItem(hash, rstr);
        }
    }

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
        UserSettings.custom_colors_on = (parseInt(this.value, 10) === 2);
    }

    // Save Setting
    document.getElementById("mousemiddle_settings_opt").onchange = function() {
        UserSettings.mousemiddle_button = this.value;
    }

    document.getElementById("language_opt").onchange = function() {
        UserSettings.app_language = this.value;
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
        UserSettings.reload_button = parseInt(this.value, 10) === 1;
    }

    document.getElementById("allow_local_storage").onchange = function() {
        UserSettings.local_storage = (parseInt(this.value, 10) === 1);
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
                document.getElementById("mode_break").classList.remove('is_hidden');
                document.getElementById("mode_txt_space").classList.remove('is_hidden');
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

            PenpaUI.set_all_modes_hidden(false);
        } else {
            PenpaUI.set_all_modes_hidden(true);

            // Remove the mode break line
            document.getElementById("mode_break").classList.add('is_hidden');
            document.getElementById("mode_txt_space").classList.add('is_hidden');

            // Display generic ones
            for (var i of penpa_constraints["setting"]["general"]) {
                document.getElementById(i).classList.remove('is_hidden');
            }

            // Display only the selected ones
            for (var i of penpa_constraints["setting"][current_constraint]["show"]) {
                document.getElementById(i).classList.remove('is_hidden');
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
                    html: '<h2 class="info">' + PenpaText.get('border_setting_help') + '</h2>',
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
            PenpaUI.liteModeButton.disabled = false;

            // Dynamically updating the display of modes based on tab setting changes
            let currentState = PenpaUI.liteModeButton.getAttribute('data-mode');

            if (currentState === "disable") {
                advancecontrol_on(); // First display back everything
                advancecontrol_off("new"); // apply new choices for penpa lite
            }
        } else {
            // Dynamically updating the display of modes based on tab setting changes
            advancecontrol_on();

            PenpaUI.liteModeButton.disabled = true;
        }
    }

    // Panel Setting
    document.getElementById("panel_button").onchange = function() {
        panel_onoff();
    }

    // Quick Panel Toggle Setting
    document.getElementById("quick_panel_dropdown").onchange = function() {
        UserSettings.quick_panel_button = String(this.value) === "1";
    }

    // Conflict detection
    document.getElementById("conflict_detection_opt").onchange = function() {
        UserSettings.conflict_detection = this.value;
    }

    // Conflict check on pencil marks
    document.getElementById("check_pencil_marks_opt").onchange = function() {
        UserSettings.check_pencil_marks = this.value;
    }

    // Let other colors match "green" for line/edge solution check
    document.getElementById("ignore_line_style_opt").onchange = function() {
        UserSettings.ignore_line_style = this.value;
    }

    // Enable or Disable Shortcuts
    document.getElementById("enable_shortcuts_opt").onchange = function() {
        UserSettings.shortcuts_enabled = String(this.value) === '1';
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
        let hash = "penpa_" + md5(pu.url);
        localStorage.removeItem(hash);
        Swal.fire({
            html: '<h2 class="info">' + PenpaText.get('local_storage_cleared') + '</h2>',
            icon: 'info'
        });
    }

    // turn off localstorage for this puzzle
    UserSettings.save_current_puzzle = false;
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

    // turn off localstorage for current puzzle
    UserSettings.save_current_puzzle = false;

    Swal.fire({
        html: '<h2 class="info">' + PenpaText.get('local_storage_cleared') + '</h2>',
        icon: 'info'
    });
}