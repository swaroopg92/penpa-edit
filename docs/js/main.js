onload = function() {

    boot();

    document.addEventListener("beforeunload", function(eve) {
        eve.returnValue = "Move page.";
    }, { passive: false });

    var ua = navigator.userAgent;
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

    var checkms = 0; // Temporary variable for hover event

    //canvas
    canvas.addEventListener("touchend", onUp, { passive: false });
    canvas.addEventListener("mouseup", onUp, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    canvas.addEventListener("mousemove", onMove, { passive: false });
    canvas.addEventListener("mouseout", onOut, { passive: false });
    canvas.addEventListener("contextmenu", onContextmenu, { passive: false });
    document.addEventListener("keydown", onKeyDown, { passive: false });

    function onDown(e) {
        if (e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
            e.preventDefault(); // When both mouse and touch start, only touch
        }
        var obj = coord_point(event);
        var x = obj.x,
            y = obj.y,
            num = obj.num;
        if (pu.point[num].use === 1) {
            if (event.button === 2) { // right click
                pu.mouse_mode = "down_right";
                pu.mouseevent(x, y, num);
            } else { // Left click or tap
                pu.mouse_mode = "down_left";
                pu.mouseevent(x, y, num);
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
        var obj = coord_point(event);
        var x = obj.x,
            y = obj.y,
            num = obj.num;
        pu.mouse_mode = "up";
        pu.mouseevent(x, y, num);
    }

    function onMove(e) {
        if (e.type === "mousemove") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }
        e.preventDefault();
        var obj = coord_point(event);
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
        pu.mouseevent(0, 0, 0);
        return;
    }

    function onContextmenu(e) { //右クリック
        e.preventDefault();
    }

    // Variables for Tab selector
    let modes = ["Surface", "Wall",
        "Line Normal", "Line Helper",
        "Edge Normal", "Edge Helper",
        "Number Normal", "Number L", "Number M", "Number S", "Candidates", "Number 1/4", "Number Side"
    ];
    let modes_mapping = ["surface", "wall",
        "sub_line1", "sub_line4",
        "sub_lineE1", "sub_lineE4",
        "sub_number1", "sub_number10", "sub_number6", "sub_number5", "sub_number7", "sub_number3", "sub_number9",
    ];
    let previous_mode = "surface";
    let previous_submode = 1;
    let previous_length = 2;
    let counter_index = 0;

    function onKeyDown(e) {
        if (e.target.type === "number" || e.target.type === "text" || e.target.id == "savetextarea_pp" || e.target.id == "inputtext") {
            // For input form
        } else {
            var key = e.key;
            var shift_key = e.shiftKey;
            var ctrl_key = e.ctrlKey;
            var alt_key = e.altKey;

            var str_num = "1234567890";
            var str_alph_low = "abcdefghijklmnopqrstuvwxyz";
            var str_alph_up = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            var str_sym = "!\"#$%&\'()-=^~|@[];+:*,.<>/?_";

            if (key === "F2") { //function_key
                pu.mode_qa("pu_q");
                event.returnValue = false;
            } else if (key === "F3") {
                pu.mode_qa("pu_a");
                event.returnValue = false;
            }

            if (key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown") { //arrow
                pu.key_arrow(key);
                event.returnValue = false;
            }

            if (!ctrl_key && !alt_key) {
                if (shift_key && key === " ") {
                    pu.key_number(key);
                    event.returnValue = false;
                } else if (str_num.indexOf(key) != -1 || str_alph_low.indexOf(key) != -1 || str_alph_up.indexOf(key) != -1 || str_sym.indexOf(key) != -1) {
                    pu.key_number(key);
                } else if (key === " ") {
                    pu.key_space();
                    event.returnValue = false;
                } else if (key === "Backspace") {
                    pu.key_backspace();
                    event.returnValue = false;
                }
            }

            if (ctrl_key) {
                switch (key) {
                    case "d": //Ctrl+d
                    case "D":
                        duplicate();
                        event.returnValue = false;
                        break;
                    case "y": //Ctrl+y
                    case "Y":
                        pu.redo();
                        event.returnValue = false;
                        break;
                    case "z": //Ctrl+z
                    case "Z":
                        pu.undo();
                        event.returnValue = false;
                        break;
                    case " ": //Ctrl+space
                        pu.key_shiftspace();
                        event.returnValue = false;
                        break;
                }
            }

            if (alt_key) {
                switch (key) {
                    case "x":
                    case "X":
                        var present_mode = document.getElementById("mo_surface").checked;
                        if (!present_mode) {
                            pu.mode_set("surface");
                            e.preventDefault();
                        }
                        event.returnValue = false;
                        break;
                    case "c":
                    case "C":
                        var present_mode = document.getElementById("mo_line").checked;
                        if (!present_mode) {
                            pu.mode_set("line");
                            e.preventDefault();
                        }
                        event.returnValue = false;
                        break;
                    case "v":
                    case "V":
                        var present_mode = document.getElementById("mo_lineE").checked;
                        if (!present_mode) {
                            pu.mode_set("lineE");
                            e.preventDefault();
                        }
                        event.returnValue = false;
                        break;
                    case "a":
                    case "A":
                        var present_mode = document.getElementById("mo_number").checked;
                        if (!present_mode) {
                            pu.mode_set("number");
                            e.preventDefault();
                        }
                        event.returnValue = false;
                        break;
                }
            }

            if (key === "Tab") {
                let user_choices = getValues('mode_choices');
                if (previous_length != user_choices.length) {
                    previous_length = user_choices.length;
                    counter_index = 0; // reset the counter
                } else if (counter_index < (previous_length - 1)) {
                    counter_index++;
                } else {
                    counter_index = 0; // reset the counter
                }
                let mode_loc = modes.indexOf(user_choices[counter_index]);
                if (mode_loc < 2) { // Hard coded, '2' since we have only Surface and Wall Modes, remaining choices are related to submodes
                    pu.mode_set(modes_mapping[mode_loc])
                    e.preventDefault();
                } else {
                    if (modes_mapping[mode_loc].includes("number")) {
                        pu.mode_set('number')
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

    function coord_point(e) {
        var x = e.pageX - canvas.offsetLeft;
        var y = e.pageY - canvas.offsetTop;
        var min0, min = 10e6;
        var num = 0;
        //const startTime = performance.now();
        for (var i = 0; i < pu.point.length; i++) {
            if (pu.point[i] && pu.type.indexOf(pu.point[i].type) != -1) {
                min0 = (x - pu.point[i].x) ** 2 + (y - pu.point[i].y) ** 2;
                if (min0 < min) {
                    min = min0;
                    num = i;
                }
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
            if (count_undo > 5) {
                pu.undo();
            }
        }, 80);
        if (new_timer !== timer) {
            clearInterval(timer);
            count = 0;
        }
        timer = new_timer;
    }

    function undoUp(e) {
        e.preventDefault();
        undo_button.classList.remove('active');
        if (count_undo) {
            clearInterval(timer);
            count_undo = 0;
        }
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
            if (count_redo > 5) {
                pu.redo();
            }
        }, 80);
        if (new_timer !== timer) {
            clearInterval(timer);
            count = 0;
        }
        timer = new_timer;
    }

    function redoUp(e) {
        e.preventDefault();
        if (count_redo) {
            redo_button.classList.remove('active');
            clearInterval(timer);
            count_redo = 0;
        }
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
        //modalwindow
        if (e.target.className === "modal") {
            document.getElementById(e.target.id).style.display = 'none';
            e.preventDefault();
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
                //case "duplicate":
                //duplicate();
                //  break;
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
                break;
            case "tb_delete":
                DeleteCheck();
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
            case "closeBtn_save1":
                savetext_copy();
                e.preventDefault();
                break;
            case "closeBtn_save2":
                savetext_download();
                e.preventDefault();
                break;
                //case "closeBtn_save3":
                //  savetext_window();
                //  break;
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
                e.preventDefault();
                break;
            case "rt_left":
                pu.rotate_left();
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
                //case "closeBtn_image1":
                //  saveimage_window();
                //  break;
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
            case "pu_q_label":
                pu.mode_qa("pu_q");
                e.preventDefault();
                break;
            case "pu_a_label":
                pu.mode_qa("pu_a");
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
        if (i == 0 || i == 6) { // Default selection Surface and Number-Normal Mode
            option.setAttribute("selected", true);
        }
        select.appendChild(option);
    }
    selectBox = new vanillaSelectBox("#mode_choices", {
        "maxHeight": 110,
        "search": true
    }); //"placeHolder": "Surface" translations: { "items": "tab" } "maxWidth": 140

    window.addEventListener('beforeunload', function(e) {
        // Cancel the event
        e.preventDefault(); // If you prevent default behavior in Mozilla Firefox prompt will always be shown
        // Chrome requires returnValue to be set
        e.returnValue = '';
    });
};