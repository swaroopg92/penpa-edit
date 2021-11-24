function boot() {
    var obj = document.getElementById("dvique");
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    obj.appendChild(canvas);
    boot_parameters();

    var urlParam = location.search.substring(1);
    if (urlParam) {
        load(urlParam);
    } else {
        create();
    }
}

function boot_parameters() {
    document.getElementById("gridtype").value = "square";
    document.getElementById("nb_size1").value = 10;
    document.getElementById("nb_size2").value = 10;
    document.getElementById("nb_size3").value = 38;
    document.getElementById("nb_space1").value = 0;
    document.getElementById("nb_space2").value = 0;
    document.getElementById("nb_space3").value = 0;
    document.getElementById("nb_space4").value = 0;
}

function create() {
    let gridtype = getCookie("gridtype");
    if (gridtype == null) {
        gridtype = document.getElementById("gridtype").value;
    }
    let displaysize_cookie = getCookie("displaysize");
    if (displaysize_cookie !== null) {
        document.getElementById("nb_size3").value = displaysize_cookie;
    }
    pu = make_class(gridtype);
    pu.reset_frame();

    // Drawing Panel
    panel_pu = new Panel();
    panel_pu.draw_panel();
    pu.mode_set("surface"); //include redraw

    // Check cookies
    let theme_cookie = getCookie("color_theme");
    if (theme_cookie !== null && theme_cookie == 2) {
        document.getElementById("theme_mode_opt").value = 2;
        document.getElementById("color_theme").href = "./css/dark_theme.css";
        pu.set_redoundocolor();
    }
    let reload_cookie = getCookie("reload_button");
    if (reload_cookie !== null) {
        // to address old versions where the stored value was ON and OFF
        if (reload_cookie === "ON") {
            reload_cookie = "1"
        } else if (reload_cookie === "OFF") {
            reload_cookie = "2"
        }
        document.getElementById('reload_button').value = reload_cookie;
    }
    let tab_cookie = getCookie("tab_settings");
    if (tab_cookie !== null) {
        this.usertab_choices = tab_cookie;
        if (this.usertab_choices.length > 2) { // If none selected, usertab_chocies = [] (size 2)
            document.getElementById('advance_button').value = "1";
            advancecontrol_onoff("url");
        }
    }
    let sudoku_center_cookie = getCookie("sudoku_centre_size");
    if (sudoku_center_cookie !== null) {
        document.getElementById("sudoku_settings_opt").value = sudoku_center_cookie;
    }
    let sudoku_normal_cookie = getCookie("sudoku_normal_size");
    if (sudoku_normal_cookie !== null) {
        document.getElementById("sudoku_settings_normal_opt").value = sudoku_normal_cookie;
    }
    let starbattle_dots_cookie = getCookie("starbattle_dots");
    if (starbattle_dots_cookie !== null) {
        document.getElementById("starbattle_settings_opt").value = starbattle_dots_cookie;
    }
    let mousemiddle_button_cookie = getCookie("mousemiddle_button");
    if (mousemiddle_button_cookie !== null) {
        document.getElementById("mousemiddle_settings_opt").value = mousemiddle_button_cookie;
    }

    // Populate Constraints list
    if (gridtype === "square" || gridtype === "sudoku" || gridtype === "kakuro") {
        add_constraints();
    } else {
        // Constraints
        document.getElementById('constraints').style.display = 'none';
        document.getElementById('constraints_settings_opt').style.display = 'none';
    }

    // Populate genre list
    add_genre_tags(pu.user_tags);
    $('#genre_tags_opt').select2({
        placeholder: 'Search Area',
        'width': "90%"
    });

    pu.redraw();
}

function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value, days) {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
}

function deleteCookie(name) { setCookie(name, '', -1); }

function add_constraints() {
    let constraints = document.getElementById('constraints_settings_opt');
    penpa_constraints['options_groups'].forEach(function(element, index) {
        let optgroup = document.createElement("optgroup");
        optgroup.label = element;

        penpa_constraints['options'][element].forEach(function(subelement, subindex) {
            let opt = document.createElement("option");
            opt.value = subelement;
            opt.innerHTML = subelement;

            if (subelement === "all") {
                opt.setAttribute("selected", true);
            }
            optgroup.appendChild(opt);
        });
        constraints.appendChild(optgroup);
    });
}

function add_genre_tags(user_tags) {
    let genre_tags = document.getElementById('genre_tags_opt');
    penpa_tags['options_groups'].forEach(function(element, index) {
        let optgroup = document.createElement("optgroup");
        optgroup.label = element;

        penpa_tags['options'][element].forEach(function(subelement, subindex) {
            let opt = document.createElement("option");
            opt.value = subelement;
            opt.innerHTML = subelement;

            if (user_tags.includes(subelement)) {
                opt.setAttribute("selected", true);
            }
            optgroup.appendChild(opt);
        });
        genre_tags.appendChild(optgroup);
    });

    // // to access each option
    // $("#genre_tags_opt option").each(function() {
    //     console.log($(this));
    // });
}

function create_newboard() {

    var size = parseInt(document.getElementById("nb_size3").value);
    if (12 <= size && size <= 90) {
        var mode = pu.mode;
        var gridtype = document.getElementById("gridtype").value;
        pu = make_class(gridtype);
        pu.mode = mode;

        // update default composite mode for special grids
        if (!(gridtype === "square" || gridtype === "sudoku" || gridtype === "kakuro")) {
            pu.mode["pu_q"]["combi"] = ["linex", ""];
            pu.mode["pu_a"]["combi"] = ["linex", ""];
        }

        pu.reset_frame(); // Draw the board
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
        pu.mode_set(pu.mode[pu.mode.qa].edit_mode); //include redraw

        // constraints
        if (gridtype === "square" || gridtype === "sudoku" || gridtype === "kakuro") {
            document.getElementById('constraints').style.display = 'inline';
            $('select').toggleSelect2(true);
        } else {
            $('select').toggleSelect2(false);
            document.getElementById('constraints').style.display = 'none';
        }
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Display size must be in the range <h2 class="warn">12-90</h2>',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function make_class(gridtype, loadtype = 'new') {
    var size = parseInt(document.getElementById("nb_size3").value);
    var gridmax = {
        'square': 60,
        'hex': 20,
        'tri': 20,
        'pyramid': 20,
        'cube': 20,
        'kakuro': 60,
        'tetrakis': 20,
        'truncated': 20,
        'snub': 20,
        'cairo': 20
    }; // also defined in class_p.js
    switch (gridtype) {
        case "square":
            var nx = parseInt(document.getElementById("nb_size1").value, 10);
            var ny = parseInt(document.getElementById("nb_size2").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            var space2 = parseInt(document.getElementById("nb_space2").value, 10);
            var space3 = parseInt(document.getElementById("nb_space3").value, 10);
            var space4 = parseInt(document.getElementById("nb_space4").value, 10);
            var type4 = ["nb_sudoku1_lb", "nb_sudoku1",
                "nb_sudoku2_lb", "nb_sudoku2",
                "nb_sudoku3_lb", "nb_sudoku3",
                "nb_sudoku4_lb", "nb_sudoku4",
                "nb_sudoku5_lb", "nb_sudoku5",
                "nb_sudoku6_lb", "nb_sudoku6",
                "nb_sudoku7_lb",
                "nb_sudoku8_lb", "nb_sudoku8"
            ]; // of sudoku
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the row/column size";
            if (nx <= gridmax['square'] && nx > 0 && ny <= gridmax['square'] && ny > 0 && space1 + space2 < ny && space3 + space4 < nx) {
                pu = new Puzzle_square(nx, ny, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Rows/Columns Size must be in the range <h2 class="warn">1-' + gridmax['square'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "hex":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the Side size";
            if (n0 <= gridmax['hex'] && n0 > 0 && space1 < n0) {
                pu = new Puzzle_hex(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['hex'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "tri":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the Side size";
            if (n0 <= gridmax['tri'] && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_tri(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['tri'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "pyramid":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the Side size";
            if (n0 <= gridmax['pyramid'] && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_pyramid(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['pyramid'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "iso":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['cube'] && n0 > 0) {
                pu = new Puzzle_iso(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['iso'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "sudoku":
            if (loadtype === 'new') {
                if (document.getElementById("nb_sudoku2").checked === true) { // Outside, little killer
                    if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
                        var nx = 10;
                        var ny = 10;
                    } else if (document.getElementById("nb_sudoku5").checked === true) { // 6x6 grid
                        var nx = 8;
                        var ny = 8;
                    } else if (document.getElementById("nb_sudoku8").checked === true) { // 4x4 grid
                        var nx = 6;
                        var ny = 6;
                    } else { // Default 9x9 grid
                        var nx = 11;
                        var ny = 11;
                    }
                    document.getElementById("nb_space1").value = 1;
                    document.getElementById("nb_space2").value = 1;
                    document.getElementById("nb_space3").value = 1;
                    document.getElementById("nb_space4").value = 1;
                } else if (document.getElementById("nb_sudoku3").checked === true) { // sandwich
                    if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
                        var nx = 9;
                        var ny = 9;
                    } else if (document.getElementById("nb_sudoku5").checked === true) { // 6x6 grid
                        var nx = 7;
                        var ny = 7;
                    } else if (document.getElementById("nb_sudoku8").checked === true) { // 4x4 grid
                        var nx = 5;
                        var ny = 5;
                    } else { // Default 9x9 grid
                        var nx = 10;
                        var ny = 10;
                    }
                    document.getElementById("nb_space1").value = 1;
                    document.getElementById("nb_space2").value = 0;
                    document.getElementById("nb_space3").value = 1;
                    document.getElementById("nb_space4").value = 0;
                } else {
                    if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
                        var nx = 8;
                        var ny = 8;
                    } else if (document.getElementById("nb_sudoku5").checked === true) { // 6x6 grid
                        var nx = 6;
                        var ny = 6;
                    } else if (document.getElementById("nb_sudoku8").checked === true) { // 4x4 grid
                        var nx = 4;
                        var ny = 4;
                    } else { // Default 9x9 grid
                        var nx = 9;
                        var ny = 9;
                    }
                    document.getElementById("nb_space1").value = 0;
                    document.getElementById("nb_space2").value = 0;
                    document.getElementById("nb_space3").value = 0;
                    document.getElementById("nb_space4").value = 0;
                }
            } else if (loadtype === 'url') {
                var nx = parseInt(document.getElementById("nb_size1").value, 10);
                var ny = parseInt(document.getElementById("nb_size2").value, 10);
            }

            // Create Sudoku object
            pu = new Puzzle_sudoku(nx, ny, size);

            if (loadtype === 'new') {
                let rows, cols;
                if (document.getElementById("nb_sudoku2").checked === true) { // Outside, little killer
                    if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
                        rows = [4, 6, 8];
                        cols = [6];
                    } else if (document.getElementById("nb_sudoku5").checked === true) { // 6x6 grid
                        rows = [4, 6];
                        cols = [5];
                    } else if (document.getElementById("nb_sudoku8").checked === true) { // 4x4 grid
                        rows = [4];
                        cols = [4];
                    } else { // Default 9x9 grid
                        rows = [5, 8];
                        cols = [5, 8];
                    }
                    let start = 2;
                    let end = pu.nx - 1;
                    let linestyle = 2;

                    pu.draw_sudokugrid(rows, cols, start, end, linestyle);

                    if (document.getElementById("nb_sudoku1").checked === true) { // Top left to bottom right diagonal
                        linestyle = 12;
                        pu.draw_N(start, end, linestyle);
                    }

                    if (document.getElementById("nb_sudoku4").checked === true) { // Top Right to bottom left diagonal
                        linestyle = 12;
                        pu.draw_Z(start, end, end + 1, linestyle);
                    }
                } else if (document.getElementById("nb_sudoku3").checked === true) { // sandwich
                    if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
                        rows = [4, 6, 8];
                        cols = [6];
                    } else if (document.getElementById("nb_sudoku5").checked === true) { // 6x6 grid
                        rows = [4, 6];
                        cols = [5];
                    } else if (document.getElementById("nb_sudoku8").checked === true) { // 4x4 grid
                        rows = [4];
                        cols = [4];
                    } else { // Default 9x9 grid
                        rows = [5, 8];
                        cols = [5, 8];
                    }
                    let start = 2;
                    let end = pu.nx;
                    let linestyle = 2;

                    pu.draw_sudokugrid(rows, cols, start, end, linestyle);

                    if (document.getElementById("nb_sudoku1").checked === true) { // Top left to bottom right diagonal
                        linestyle = 12;
                        pu.draw_N(start, end, linestyle);
                    }

                    if (document.getElementById("nb_sudoku4").checked === true) { // Top Right to bottom left diagonal
                        linestyle = 12;
                        pu.draw_Z(start, end, end + 1, linestyle);
                    }
                } else {
                    if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
                        rows = [3, 5, 7];
                        cols = [5];
                    } else if (document.getElementById("nb_sudoku5").checked === true) { // 6x6 grid
                        rows = [3, 5];
                        cols = [4];
                    } else if (document.getElementById("nb_sudoku8").checked === true) { // 4x4 grid
                        rows = [3];
                        cols = [3];
                    } else { // Default 9x9 grid
                        rows = [4, 7];
                        cols = [4, 7];
                    }
                    let start = 1;
                    let end = pu.nx;
                    let linestyle = 2;

                    pu.draw_sudokugrid(rows, cols, start, end, linestyle);

                    if (document.getElementById("nb_sudoku1").checked === true) { // Top left to bottom right diagonal
                        linestyle = 12;
                        pu.draw_N(start, end, linestyle);
                    }

                    if (document.getElementById("nb_sudoku4").checked === true) { // Top Right to bottom left diagonal
                        linestyle = 12;
                        pu.draw_Z(start, end, end, linestyle);
                    }
                }
            }
            break;
        case "kakuro":
            var nx = parseInt(document.getElementById("nb_size1").value, 10);
            var ny = parseInt(document.getElementById("nb_size2").value, 10);

            if (nx <= gridmax['square'] && nx > 0 && ny <= 40 && ny > 0) {
                // Create Kakuro object
                pu = new Puzzle_kakuro(nx, ny, size);

                if (loadtype === "new") {
                    pu.draw_kakurogrid();
                }
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Rows/Columns Size must be in the range <h2 class="warn">1-' + gridmax['kakuro'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "truncated_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_truncated_square(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['truncated'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "tetrakis_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_tetrakis_square(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['tetrakis'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "snub_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_snub_square(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['snub'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "cairo_pentagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_cairo_pentagonal(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 class="warn">1-' + gridmax['cairo'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;

    }
    return pu;
}

function changetype() {
    var gridtype = document.getElementById("gridtype").value;
    var type = ["name_size2", "nb_size2", "name_space2", "name_space3", "name_space4", "nb_space2", "nb_space3", "nb_space4"];
    var type2 = ["name_space1", "nb_space1"];
    var type3 = ["nb_size_lb", "nb_space_lb", "name_size1", "nb_size1"]; // off - for sudoku
    var type4 = ["nb_sudoku1_lb", "nb_sudoku1",
        "nb_sudoku2_lb", "nb_sudoku2",
        "nb_sudoku3_lb", "nb_sudoku3",
        "nb_sudoku4_lb", "nb_sudoku4",
        "nb_sudoku5_lb", "nb_sudoku5",
        "nb_sudoku6_lb", "nb_sudoku6",
        "nb_sudoku7_lb",
        "nb_sudoku8_lb", "nb_sudoku8"
    ]; // on - for sudoku
    var type5 = ["name_size1", "nb_size1", "name_size2", "nb_size2", "nb_size_lb"]; // on - kakuro
    switch (gridtype) {
        case "square":
            for (var i of type) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Columns：";
            document.getElementById("name_space1").innerHTML = "Over：";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the row/column size";
            document.getElementById("nb_size1").value = 10;
            document.getElementById("nb_size2").value = 10;
            document.getElementById("nb_size3").value = 38;
            document.getElementById("nb_space1").value = 0;
            document.getElementById("nb_space2").value = 0;
            document.getElementById("nb_space3").value = 0;
            document.getElementById("nb_space4").value = 0;
            break;
        case "hex":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("name_space1").innerHTML = "Side: ";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the Side size";
            document.getElementById("nb_size1").value = 5;
            document.getElementById("nb_size3").value = 40;
            document.getElementById("nb_space1").value = 0;
            break;
        case "tri":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("name_space1").innerHTML = "Border: ";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the Side size";
            document.getElementById("nb_size1").value = 6;
            document.getElementById("nb_size3").value = 60;
            document.getElementById("nb_space1").value = 0;
            break;
        case "pyramid":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("name_space1").innerHTML = "Border：";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the Side size";
            document.getElementById("nb_size1").value = 6;
            document.getElementById("nb_size3").value = 50;
            document.getElementById("nb_space1").value = 0;
            break;
        case "iso":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_size1").value = 5;
            document.getElementById("nb_size3").value = 34;
            break;
        case "sudoku":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "inline";
            }
            document.getElementById("nb_sudoku3_lb").innerHTML = "Sandwich";
            document.getElementById("nb_sudoku7_lb").innerHTML = "*Default size is 9x9";
            document.getElementById("nb_sudoku1").checked = false;
            document.getElementById("nb_sudoku2").checked = false;
            document.getElementById("nb_sudoku3").checked = false;
            document.getElementById("nb_sudoku4").checked = false;
            document.getElementById("nb_sudoku5").checked = false;
            document.getElementById("nb_sudoku6").checked = false;
            document.getElementById("nb_sudoku8").checked = false;
            break;
        case "kakuro":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type5) {
                document.getElementById(i).style.display = "inline";
            }
            document.getElementById("name_size1").innerHTML = "Columns：";
            document.getElementById("nb_size1").value = 10;
            document.getElementById("nb_size2").value = 10;
            break;
        case "truncated_square":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>**Alpha Version - It's under development and currently has limited functionality</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
        case "tetrakis_square":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>**Alpha Version - It's under development and currently has limited functionality</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "snub_square":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>**Alpha Version - It's under development and currently has limited functionality</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
        case "cairo_pentagonal":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>**Alpha Version - It's under development and currently has limited functionality</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
    }
}

function newboard() {
    document.getElementById('modal').style.display = 'block';
}

function rotation() {
    document.getElementById('modal-rotate').style.display = 'block';
}

function CreateCheck() {
    Swal.fire({
        title: 'Are you sure want to reset the current board? To only change display size and grid lines use "Update display" button',
        html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: Color.BLUE_SKY,
        cancelButtonColor: Color.RED,
        confirmButtonText: 'Yes, Reset it!'
    }).then((result) => {
        if (result.isConfirmed) {
            create_newboard();
            pu.redraw();
            if (sw_timer.isPaused()) {
                pu.show_pause_layer();
            }
        }
    })
}

function newgrid() {
    var size = parseInt(document.getElementById("nb_size3").value);
    if (12 <= size && size <= 90) {
        pu.reset_frame_newgrid();
        pu.redraw();
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
        if (sw_timer.isPaused()) {
            pu.show_pause_layer();
        }
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Display Size must be in the range <h2 class="warn">12-90</h2>',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function newgrid_r() {
    var sizer = parseInt(document.getElementById("nb_size3_r").value, 10);
    document.getElementById("nb_size3").value = sizer;
    if (12 <= sizer && sizer <= 90) {
        pu.reset_frame_newgrid();
        pu.size = sizer;
        pu.redraw();
        panel_pu.draw_panel();
        document.getElementById('modal-newsize').style.display = 'none';
        if (sw_timer.isPaused()) {
            pu.show_pause_layer();
        }
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Display Size must be in the range <h2 class="warn">12-90</h2>',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function newsize() {
    document.getElementById('modal-newsize').style.display = 'block';
}

function display_rules() {
    Swal.fire({
        title: 'Rules:',
        html: '<h5 class="info">' + pu.rules + '</h5>'
    })
}

function panel_onoff() {
    if (document.getElementById('panel_button').value === "1") {
        document.getElementById('float-key').style.display = "block";
        if (window.panel_toplast && window.panel_leftlast) {
            document.getElementById('float-key-body').style.left = window.panel_leftlast;
            document.getElementById('float-key-body').style.top = window.panel_toplast;
            document.getElementById('float-key-header').style.left = window.panel_leftlast;
            document.getElementById('float-key-header').style.top = window.panel_toplast;
        } else {
            document.getElementById('float-key-body').style.left = 0 + "px";
            document.getElementById('float-key-body').style.top = 0 + "px";
            document.getElementById('float-key-header').style.left = 0 + "px";
            document.getElementById('float-key-header').style.top = 0 + "px";
        }
        // Show Mode info on Panel Header
        let modes_mapping = ['Surface', 'Line', 'Edge', 'Wall', 'Number', 'Shape', 'Special', 'Cage', 'Composite', 'Sudoku', 'Box', 'Move'];
        let mode_loc = penpa_modes["square"]["mode"].indexOf(pu.mode[pu.mode.qa].edit_mode);
        document.getElementById('float-key-header-lb').innerHTML = "Mode: " + modes_mapping[mode_loc];
    } else {
        document.getElementById('float-key').style.display = "none";
    }
    pu.redraw();
}

function edge_onoff() {
    if (document.getElementById('edge_button').value === "2") {
        pu.cursol = pu.centerlist[0];
    }
    pu.type = pu.type_set();
    pu.redraw();
}

function solutionvisible_onoff() {
    if (document.getElementById('visibility_button').textContent === "ON") {
        document.getElementById('visibility_button').textContent = "OFF";
    } else {
        document.getElementById('visibility_button').textContent = "ON";
    }
    pu.redraw();
}

function advancecontrol_onoff(loadtype = "new") {
    if (document.getElementById('advance_button').value === "2") {
        // Lite Version OFF, Display all the modes
        // Display the mode break line again
        document.getElementById("mode_break").style.display = "inline";
        document.getElementById("mode_txt_space").style.display = "inline";
        advancecontrol_on();
    } else {
        // Lite Version ON, so turn off extra modes
        if (loadtype === "url") {
            // Remove the mode break line again
            document.getElementById("mode_break").style.display = "none";
            document.getElementById("mode_txt_space").style.display = "none";
            advancecontrol_off(loadtype);
        } else {
            let user_choices = getValues('mode_choices');
            if (user_choices.length !== 0) {
                // Remove the mode break line again
                document.getElementById("mode_break").style.display = "none";
                document.getElementById("mode_txt_space").style.display = "none";
                advancecontrol_off(loadtype);
            } else {
                document.getElementById('advance_button').value = "2";
                Swal.fire({
                    title: 'Advance/Basic Mode',
                    html: '<h2 class="info">Currently "Tab/↵" selection is empty. Select your basic required modes under "Tab/↵". <br> Set "PenpaLite" setting to turn "ON"</h2>',
                    icon: 'info'
                })
            }
        }
    }
}

function advancecontrol_off(loadtype) {
    // Check for this only for first time when loading url
    let user_choices;
    if (loadtype === "url") {
        user_choices = this.usertab_choices;
    } else {
        user_choices = getValues('mode_choices');
    }
    if (user_choices.indexOf("Surface") === -1) {
        document.getElementById("mo_surface_lb").style.display = "none";
    }
    if (user_choices.indexOf("Line Normal") === -1 &&
        user_choices.indexOf("Line Diagonal") === -1 &&
        user_choices.indexOf("Line Free") === -1 &&
        user_choices.indexOf("Line Middle") === -1 &&
        user_choices.indexOf("Line Helper") === -1) {
        document.getElementById("mo_line_lb").style.display = "none";
    } else {
        // document.getElementById("st_line80_lb").style.display = "none";
        // document.getElementById("st_line12_lb").style.display = "none";
        // document.getElementById("st_line13_lb").style.display = "none";
        // document.getElementById("st_line40_lb").style.display = "none";
    }
    if (user_choices.indexOf("Edge Normal") === -1 &&
        user_choices.indexOf("Edge Diagonal") === -1 &&
        user_choices.indexOf("Edge Free") === -1 &&
        user_choices.indexOf("Edge Helper") === -1) {
        document.getElementById("mo_lineE_lb").style.display = "none";
    } else {
        // document.getElementById("st_lineE80_lb").style.display = "none";
        // document.getElementById("st_lineE12_lb").style.display = "none";
        // document.getElementById("st_lineE13_lb").style.display = "none";
        // document.getElementById("st_lineE21_lb").style.display = "none";
    }
    if (user_choices.indexOf("Wall") === -1) {
        document.getElementById("mo_wall_lb").style.display = "none";
    } else {
        // document.getElementById("st_wall1_lb").style.display = "none";
        // document.getElementById("st_wall12_lb").style.display = "none";
        // document.getElementById("st_wall17_lb").style.display = "none";
        // document.getElementById("st_wall14_lb").style.display = "none";
    }
    if (user_choices.indexOf("Number Normal") === -1 &&
        user_choices.indexOf("Number L") === -1 &&
        user_choices.indexOf("Number M") === -1 &&
        user_choices.indexOf("Number S") === -1 &&
        user_choices.indexOf("Number 1/4") === -1 &&
        user_choices.indexOf("Number Side") === -1 &&
        user_choices.indexOf("Candidates") === -1) {
        document.getElementById("mo_number_lb").style.display = "none";
    }
    if (user_choices.indexOf("Shape") === -1) {
        document.getElementById("mo_symbol_lb").style.display = "none";
    }
    if (user_choices.indexOf("Thermo") === -1 &&
        user_choices.indexOf("Sudoku Arrow") === -1) {
        document.getElementById("mo_special_lb").style.display = "none";
    }
    if (user_choices.indexOf("Cage") === -1) {
        document.getElementById("mo_cage_lb").style.display = "none";
    }
    if (user_choices.indexOf("Composite") === -1) {
        document.getElementById("mo_combi_lb").style.display = "none";
    }
    if (user_choices.indexOf("Sudoku Normal") === -1 &&
        user_choices.indexOf("Sudoku Corner") === -1 &&
        user_choices.indexOf("Sudoku Centre") === -1) {
        document.getElementById("mo_sudoku_lb").style.display = "none";
    }
    if (user_choices.indexOf("Box") === -1) {
        document.getElementById("mo_board_lb").style.display = "none";
    }
    if (user_choices.indexOf("Move") === -1) {
        document.getElementById("mo_move_lb").style.display = "none";
    }
}

function advancecontrol_on() {
    pu.erase_buttons();

    // Set the solve mode
    if (pu.mmode === "solve") {
        set_solvemode();

        // answer check then reset the title
        if (pu.solution !== "") {
            set_solvemodetitle();
        }

        // Set the contest mode
        if (pu.undoredo_disable) {
            set_contestmode();
        }
    }
}

function ResetCheck() {
    if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "LINE") {
        if (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === '4') {
            Swal.fire({
                title: 'Erase/Clear all Helper (x) - Crosses in Line Mode?',
                html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: Color.BLUE_SKY,
                cancelButtonColor: Color.RED,
                confirmButtonText: 'Yes, Erase it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    pu.reset_selectedmode();
                }
            })
        } else {
            Swal.fire({
                title: 'Erase/Clear all LINE mode elements?',
                html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: Color.BLUE_SKY,
                cancelButtonColor: Color.RED,
                confirmButtonText: 'Yes, Erase it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    pu.reset_selectedmode();
                }
            })
        }
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "LINEE") {
        if (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === '4') {
            Swal.fire({
                title: 'Erase/Clear all Helper (x) - Crosses in Edge Mode?',
                html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: Color.BLUE_SKY,
                cancelButtonColor: Color.RED,
                confirmButtonText: 'Yes, Erase it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    pu.reset_selectedmode();
                }
            })
        } else if (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === '5') {
            Swal.fire({
                title: 'Reset Erased Edges in Edge Mode?',
                html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: Color.BLUE_SKY,
                cancelButtonColor: Color.RED,
                confirmButtonText: 'Yes, Erase it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    pu.reset_selectedmode();
                }
            })
        } else {
            Swal.fire({
                title: 'Erase/Clear all EDGE mode elements?',
                html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: Color.BLUE_SKY,
                cancelButtonColor: Color.RED,
                confirmButtonText: 'Yes, Erase it!'
            }).then((result) => {
                if (result.isConfirmed) {
                    pu.reset_selectedmode();
                }
            })
        }
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "SYMBOL") {
        Swal.fire({
            title: 'Erase/Clear all SHAPE mode elements?',
            html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: Color.BLUE_SKY,
            cancelButtonColor: Color.RED,
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "CAGE") {
        Swal.fire({
            title: 'Erase/Clear all FRAME mode elements?',
            html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: Color.BLUE_SKY,
            cancelButtonColor: Color.RED,
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "COMBI") {
        // Swal.fire({
        //     title: 'Erase/Clear all selected COMPOSITE mode elements?',
        //     html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
        //     icon: 'warning',
        //     showCancelButton: true,
        //     confirmButtonColor: Color.BLUE_SKY,
        //     cancelButtonColor: Color.RED,
        //     confirmButtonText: 'Yes, Erase it!'
        // }).then((result) => {
        //     if (result.isConfirmed) {
        //         pu.reset_selectedmode();
        //     }
        // })
    } else {
        Swal.fire({
            title: 'Erase/Clear all ' + pu.mode[pu.mode.qa].edit_mode.toUpperCase() + ' mode elements?',
            html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: Color.BLUE_SKY,
            cancelButtonColor: Color.RED,
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    }
}

function DeleteCheck() {
    var text;
    if (document.getElementById("pu_q").checked) {
        text = "problem";
    } else if (document.getElementById("pu_a").checked) {
        text = "solution";
    }
    Swal.fire({
        title: 'Erase/Clear all the elements in ' + text.toUpperCase() + ' mode?',
        html: '<h4 class="warn">You won\'t be able to revert this!</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: Color.BLUE_SKY,
        cancelButtonColor: Color.RED,
        confirmButtonText: 'Yes, Erase it!'
    }).then((result) => {
        if (result.isConfirmed) {
            pu.reset_board(); // contains reset of undo/redo
            pu.redraw();
        }
    })
}

function saveimage() {
    document.getElementById("modal-image").style.display = 'block';
}

function saveimage_download() {
    var downloadLink = document.getElementById('download_link');
    var filename = document.getElementById('saveimagename').value;
    if (!filename) {
        filename = "my_puzzle";
    }
    if (document.getElementById("nb_type1").checked) {
        if (filename.slice(-4) != ".png") {
            filename += ".png";
        }
    } else if (document.getElementById("nb_type2").checked) {
        if (filename.slice(-4) != ".jpg") {
            filename += ".jpg";
        }
    } else if (document.getElementById("nb_type3").checked) {
        if (filename.slice(-4) != ".svg") {
            filename += ".svg";
        }
    }
    var str_sym = "\\/:*?\"<>|";
    var valid_name = 1;
    for (var i = 0; i < filename.length; i++) {
        if (str_sym.indexOf(filename[i]) != -1) {
            valid_name = 0;
        }
    }

    if (valid_name) {
        if (document.getElementById("nb_type3").checked) {
            var text = pu.resizecanvas();
            var downloadLink = document.getElementById('download_link');
            var blob = new Blob([text], { type: "image/svg+xml" });
            var ua = window.navigator.userAgent.toLowerCase();
            if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('edge') === -1) {
                //safari
                window.open('data:image/svg+xml;base64,' + window.Base64.encode(text), '_blank');
            } else if (window.navigator.msSaveBlob) {
                // for IE
                window.navigator.msSaveBlob(blob, filename);
            } else {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.target = "_blank";
                downloadLink.download = filename;
                downloadLink.click();
            }
        } else {
            if (pu.canvas.msToBlob) { // For IE
                var blob = pu.canvas.msToBlob();
                window.navigator.msSaveBlob(blob, filename);
            } else { // Other browsers
                downloadLink.href = pu.resizecanvas();
                downloadLink.download = filename;
                downloadLink.click();
            }
        }
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function saveimage_window() {
    var win, url;
    var downloadLink = document.getElementById('download_link');
    var address = pu.resizecanvas();
    if (document.getElementById("nb_type3").checked) { //svg
        // store in a Blob
        let blob = new Blob([address], { type: "image/svg+xml" });
        var ua = window.navigator.userAgent.toLowerCase();
        if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('edge') === -1) {
            //safari
            window.open('data:image/svg+xml;base64,' + window.Base64.encode(address), '_blank');
        } else {
            // create an URI pointing to that blob
            url = URL.createObjectURL(blob);
            window.open(url);
        }
    } else {
        win = window.open();
        win.document.write("<img src='" + address + "'/>");
    }
}

function savetext() {
    document.getElementById("modal-save").style.display = 'block';
    document.getElementById("savetextarea").value = "";
}

function io_sudoku() {
    document.getElementById("modal-input").style.display = 'block';
    document.getElementById("iostring").placeholder = "Enter digits (0-9, 0 or . for an empty cell, no spaces). The number of digits entered should be a perfect square. Default expected length is 81 digits (9x9 sudoku)";
}

function i_url() {
    document.getElementById("modal-load").style.display = 'block';
    document.getElementById("urlstring").placeholder = "In case of \"URL too long Error\". Type/Paste Penpa-edit URL here and click on Load button.";
}

function p_settings() {
    document.getElementById("modal-settings").style.display = 'block';
}

function help() {
    document.getElementById("modal-help").style.display = 'block';
}

function expansion() {
    document.getElementById("modal-save2").style.display = 'block';
}

function solution_open() {
    document.getElementById("modal-save2-solution").style.display = 'block';
    document.getElementById("modal-save2-pp").style.display = 'none';
}

function pp_file_open() {
    document.getElementById("modal-save2-solution").style.display = 'none';
    document.getElementById("modal-save2-pp").style.display = 'block';
}

function show_genretags() {
    document.getElementById("modal-save-tag").style.display = 'block';
}

function savetext_edit() {
    var text = pu.maketext();
    document.getElementById("savetextarea").value = text;
}

function savetext_solve() {
    var text = pu.maketext_solve();
    document.getElementById("savetextarea").value = text;
}

function savetext_comp() {
    var text = pu.maketext_compsolve();
    document.getElementById("savetextarea").value = text;
}

function savetext_withsolution() {
    var text = pu.maketext_solve_solution();
    document.getElementById("savetextarea").value = text;
    document.getElementById("modal-save2").style.display = 'none';
}

function make_ppfile() {
    var text = pu.maketext_ppfile();
    document.getElementById("savetextarea").value = text;
    document.getElementById("modal-save2").style.display = 'none';
}

function make_gmpfile() {
    var text = pu.maketext_gmpfile();
    document.getElementById("savetextarea").value = text;
    document.getElementById("modal-save2").style.display = 'none';
}

function savetext_copy() {
    Swal.fire({
        title: 'Swaroop says:',
        html: '<h2 class="info">URL is copied to clipboard</h2>',
        icon: 'info'
    })
    var textarea = document.getElementById("savetextarea");
    textarea.select();
    var range = document.createRange();
    range.selectNodeContents(textarea);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textarea.setSelectionRange(0, 1e5);
    document.execCommand("copy");
}

function savetext_download() {
    var text = document.getElementById("savetextarea").value;
    var downloadLink = document.getElementById('download_link');
    var filename = document.getElementById("savetextname").value;
    if (!filename) {
        filename = "my_puzzle.txt";
    }
    if (filename.indexOf(".") === -1) {
        filename += ".txt";
    }
    var blob = new Blob([text], { type: "text/plain" });
    var ua = window.navigator.userAgent.toLowerCase();
    var str_sym = "\\/:*?\"<>|";
    var valid_name = 1;
    for (var i = 0; i < filename.length; i++) {
        if (str_sym.indexOf(filename[i]) != -1) {
            valid_name = 0;
        }
    }
    if (valid_name) {
        if (ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1 && ua.indexOf('edge') === -1) {
            //safari
            window.open('data:text/plain;base64,' + window.Base64.encode(text), '_blank');
        } else if (window.navigator.msSaveBlob) {
            // for IE
            window.navigator.msSaveBlob(blob, filename);
        } else {
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.target = "_blank";
            downloadLink.download = filename;
            downloadLink.click();
        }
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function savetext_window() {
    var text = document.getElementById("savetextarea").value;
    if (text) {
        window.open(text);
    }
}

function shorturl_tab() {
    var textarea = document.getElementById("savetextarea");
    textarea.select();
    var range = document.createRange();
    range.selectNodeContents(textarea);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textarea.setSelectionRange(0, 1e5);
    document.execCommand("copy");
    window.open('https://git.io', '_blank');
}

function getValues(id) {
    let result = [];
    let collection = document.querySelectorAll("#" + id + " option");
    collection.forEach(function(x) {
        if (x.selected) {
            result.push(x.value);
        }
    });
    return result;
}

function duplicate() {
    var address = pu.maketext_duplicate();
    if (pu.mmode === "solve") {
        address = address + "&l=solvedup";
    }
    window.open(address);
}

function import_sudoku() {
    let flag;
    if (document.getElementById("gridtype").value === "sudoku" || document.getElementById("gridtype").value === "square") {
        let size = 9; // Default is 9x9 sudoku

        // if user has defined the sudoku grid size
        if (document.getElementById("sudokusize").value !== "") {
            size = parseInt(document.getElementById("sudokusize").value);
        }
        if (size <= pu.nx) {
            if (size > 0 && size < 10) {
                flag = pu.load_clues();
            } else {
                document.getElementById("iostring").value = "Error: Min/Max Sudoku Size allowed is 1x1 to 9x9 (Default is 9x9). Update the input parameters below.";
            }
        } else {
            document.getElementById("iostring").value = "Error: Grid size is smaller than the specified Sudoku size (Default is 9x9). Update the input parameters below.";
        }
    } else {
        document.getElementById("iostring").value = "Error: The canvas area should be a sudoku grid or square grid";
    }
}

function export_sudoku() {
    let flag;
    if (document.getElementById("gridtype").value === "sudoku" || document.getElementById("gridtype").value === "square") {
        let size = 9; // Default is 9x9 sudoku

        // if user has defined the sudoku grid size
        if (document.getElementById("sudokusize").value !== "") {
            size = parseInt(document.getElementById("sudokusize").value);
        }
        if (size <= pu.nx) {
            if (size > 0 && size < 10) {
                flag = pu.export_clues(size);
            } else {
                document.getElementById("iostring").value = "Error: Min/Max Sudoku Size allowed is 1x1 to 9x9 (Default is 9x9). Update the input parameters below.";
            }
        } else {
            document.getElementById("iostring").value = "Error: Grid size is smaller than the specified Sudoku size (Default is 9x9). Update the input parameters below.";
        }
    } else {
        document.getElementById("iostring").value = "Error: The canvas area should be a sudoku grid or square grid";
    }
}

function import_url() {
    let urlstring = document.getElementById("urlstring").value;
    if (urlstring !== "") {
        if (urlstring.indexOf("/penpa-edit/?") !== -1) {
            urlstring = urlstring.split("/penpa-edit/?")[1];
            load(urlstring, 'local');
            document.getElementById("modal-load").style.display = 'none';
            if (this.usertab_choices.length > 2) { // If none selected, usertab_chocies = [] (size 2)
                selectBox.setValue(JSON.parse(this.usertab_choices));
            }
        } else if (urlstring.indexOf("/puzz.link/p?") !== -1 || urlstring.indexOf("/pzv.jp/p?") !== -1) {
            decode_puzzlink(urlstring);
            document.getElementById("modal-load").style.display = 'none';
        } else {
            document.getElementById("urlstring").value = "Error: Invalid URL";
        }
    } else {
        document.getElementById("urlstring").value = "Error: Invalid URL";
    }
}

function load_about() {
    Swal.fire({
        title: 'About',
        html: '<h2 class="info">Welcome to Penpa+ Tool. <br> Its a web application to create and solve Sudokus and Puzzles.<br> Its a Universal pencil puzzle editor capable of drawing many different kinds of pencil puzzles. <br> You can download your puzzle as images and save the puzzle link in the form of URL to share with others.</h2>',
        icon: 'info'
    })
}

function load_youtube() {
    window.open('https://www.youtube.com/channel/UCAv0bBz7MTVJOlHzINnHhYQ/videos', '_blank');
}

function load_list() {
    window.open('https://github.com/swaroopg92/penpa-edit/blob/master/VIDEO_TUTORIALS.md', '_blank');
}

function load_readme() {
    window.open('https://github.com/swaroopg92/penpa-edit/blob/master/README.md', '_blank');
}

function load_wiki() {
    window.open('https://github.com/swaroopg92/penpa-edit/wiki/Steps-to-Create-Sudoku-or-Puzzle-in-Penpa', '_blank');
}

function load_rules() {
    Swal.fire({
        title: 'Sudoku/Puzzle Rulesets',
        html: '<h2 class="info"><a href="https://tinyurl.com/puzzlerules" target="_blank"> Eric Fox - Dictioniary of Rulesets </a> <br> <a href="https://wpcunofficial.miraheze.org/wiki/Category:Puzzle_Types" target="_blank"> Ryotaro Chiba - WPC Puzzles </a> <br> <a href="http://logicmastersindia.com/lmitests/dl.asp?attachmentid=669&v1" target="_blank"> LMI - WSC IB (Sudoku Variants)</a> <br> <a href="http://www.puzzleduel.club/archive/types" target="_blank">Puzzle Duel Club</a> <br> <a href="http://www.logic-puzzles.ropeko.ch/php/db/search.php" target="_blank">Ropeko - Logic Puzzles List</a></h2> <br> <h3>Note :- This is by no means an exhaustive list. Penpa+ is not affiliated with these sources. Please contact respective owners for any further information. If you have any additional interesting sources which I can add here, send me an email to penpaplus@gmail.com</h3>',
        icon: 'info'
    })
}

function load_faqs() {
    window.open('https://docs.google.com/document/d/12Mde0ogcpdtgM2nz6Z_nZYJnMJyUOMC5f3FUxzH9q74/edit', '_blank');
}

function load_discord() {
    window.open('https://discord.gg/BbN89j5', '_blank');
}

function load_feedback() {
    Swal.fire({
        title: 'Feedback',
        html: '<h2 class="info"><p>Any suggestions or improvements, send an email to <b> penpaplus@gmail.com </b> <br> or <br> Create an issue on github <a href="https://github.com/swaroopg92/penpa-edit/issues" target="_blank">here</a> <br> or <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.gg/BbN89j5" target="_blank">here</a>.</p></h2>',
        icon: 'info'
    })
}

function load_contribute() {
    window.open('https://github.com/swaroopg92/penpa-edit/blob/master/CONTRIBUTING.md', '_blank');
}

function load_todolist() {
    window.open('https://github.com/swaroopg92/penpa-edit/projects/1', '_blank');
}

function load_changelogs() {
    window.open('https://github.com/swaroopg92/penpa-edit/blob/master/CHANGELOG.md', '_blank');
}

function load_credits() {
    window.open('https://github.com/swaroopg92/penpa-edit/blob/master/CREDITS.md', '_blank');
}

function load_license() {
    window.open('https://github.com/swaroopg92/penpa-edit/blob/master/LICENSE', '_blank');
}

function load(urlParam, type = 'url') {
    var param = urlParam.split('&');
    var paramArray = [];

    // Decompose address into elements
    for (var i = 0; i < param.length; i++) {
        var paramItem = param[i].split('=');
        paramArray[paramItem[0]] = paramItem[1];
    }

    // Decrypt P
    var ab = atob(paramArray.p);
    ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
    var inflate = new Zlib.RawInflate(ab);
    var plain = inflate.decompress();
    var rtext = new TextDecoder().decode(plain);
    rtext = rtext.split("\n");
    rtext[0] = rtext[0].split("zO").join("null");
    rtext[1] = rtext[1].split("zO").join("null");
    if (!isNaN(rtext[0][0])) {
        loadver1(paramArray, rtext)
        return;
    }

    // load default settings
    var rtext_para = rtext[0].split(',');
    document.getElementById("gridtype").value = rtext_para[0];
    changetype();
    document.getElementById("nb_size1").value = rtext_para[1];
    document.getElementById("nb_size2").value = rtext_para[2];
    document.getElementById("nb_size3").value = rtext_para[3];

    document.getElementById("nb_space1").value = JSON.parse(rtext[1])[0];
    document.getElementById("nb_space2").value = JSON.parse(rtext[1])[1];
    document.getElementById("nb_space3").value = JSON.parse(rtext[1])[2];
    document.getElementById("nb_space4").value = JSON.parse(rtext[1])[3];
    if (!rtext_para[11] === 'undefined' && rtext_para[11] == "1") { document.getElementById("nb_sudoku1").checked = true; }
    if (!rtext_para[12] === 'undefined' && rtext_para[12] == "1") { document.getElementById("nb_sudoku2").checked = true; }
    if (!rtext_para[13] === 'undefined' && rtext_para[13] == "1") { document.getElementById("nb_sudoku3").checked = true; }
    if (!rtext_para[14] === 'undefined' && rtext_para[14] == "1") { document.getElementById("nb_sudoku4").checked = true; }
    if (rtext_para[15]) {
        let ptitle = rtext_para[15].replace(/%2C/g, ',');
        if (ptitle !== "Title: ") {
            document.getElementById("puzzletitle").innerHTML = ptitle;
            document.getElementById("saveinfotitle").value = ptitle.slice(7); // text after "Title: "
        }
    }
    if (rtext_para[16]) {
        let pauthor = rtext_para[16].replace(/%2C/g, ',')
        if (pauthor != "Author: ") {
            document.getElementById("puzzleauthor").innerHTML = pauthor;
            document.getElementById("saveinfoauthor").value = pauthor.slice(8); // text after "Author: "
        }
    }
    if (rtext_para[17] && rtext_para[17] !== "") {
        document.getElementById("puzzlesourcelink").href = rtext_para[17];
        document.getElementById("puzzlesource").innerHTML = "Source";
        document.getElementById("saveinfosource").value = rtext_para[17];
    }

    make_class(rtext_para[0], 'url');

    // Check cookies
    let theme_cookie = getCookie("color_theme");
    if (theme_cookie !== null && theme_cookie == 2) {
        document.getElementById("theme_mode_opt").value = 2;
        document.getElementById("color_theme").href = "./css/dark_theme.css";
        pu.set_redoundocolor();
    }
    let reload_cookie = getCookie("reload_button");
    if (reload_cookie !== null) {
        // to address old versions where the stored value was ON and OFF
        if (reload_cookie === "ON") {
            reload_cookie = "1"
        } else if (reload_cookie === "OFF") {
            reload_cookie = "2"
        }
        document.getElementById('reload_button').value = reload_cookie;
    }
    let sudoku_center_cookie = getCookie("sudoku_centre_size");
    if (sudoku_center_cookie !== null) {
        document.getElementById("sudoku_settings_opt").value = sudoku_center_cookie;
    }
    let sudoku_normal_cookie = getCookie("sudoku_normal_size");
    if (sudoku_normal_cookie !== null) {
        document.getElementById("sudoku_settings_normal_opt").value = sudoku_normal_cookie;
    }
    let starbattle_dots_cookie = getCookie("starbattle_dots");
    if (starbattle_dots_cookie !== null) {
        document.getElementById("starbattle_settings_opt").value = starbattle_dots_cookie;
    }
    let mousemiddle_button_cookie = getCookie("mousemiddle_button");
    if (mousemiddle_button_cookie !== null) {
        document.getElementById("mousemiddle_settings_opt").value = mousemiddle_button_cookie;
    }

    if (rtext_para[18] && rtext_para[18] !== "") {
        document.getElementById("puzzlerules").style.display = "inline";
        pu.rules = rtext_para[18].replace(/%2C/g, ',').replace(/%2D/g, '<br>').replace(/%2E/g, '&').replace(/%2F/g, '=');
        document.getElementById("saveinforules").value = rtext_para[18].replace(/%2C/g, ',').replace(/%2D/g, '\n').replace(/%2E/g, '&').replace(/%2F/g, '=');
    }

    // Border button status
    if (rtext_para[19]) {
        // to address old versions where the stored value was ON and OFF
        if (rtext_para[19] === "ON" || rtext_para[19] === "1") {
            document.getElementById('edge_button').value = "1";
        }
    }

    // multisolution status
    if (rtext_para[20] && rtext_para[20] === "true") {
        pu.multisolution = true;
    }

    // version save
    if (typeof rtext[10] !== 'undefined') {
        pu.version = JSON.parse(rtext[10]);
    } else {
        pu.version = [0, 0, 0]; // To handle all the old links
    }

    pu.theta = parseInt(rtext_para[4]);
    pu.reflect[0] = parseInt(rtext_para[5]);
    pu.reflect[1] = parseInt(rtext_para[6]);

    pu.canvasx = parseInt(rtext_para[7]);
    pu.canvasy = parseInt(rtext_para[8]);
    pu.width_c = pu.canvasx / rtext_para[3];
    pu.height_c = pu.canvasy / rtext_para[3]; // When updating newgrid, use width_c with canvasxyupdate, so record it.
    pu.center_n = parseInt(rtext_para[9]);
    pu.center_n0 = parseInt(rtext_para[10]);

    panel_pu = new Panel();

    for (var i = 0; i < pu.replace.length; i++) {
        rtext[2] = rtext[2].split(pu.replace[i][1]).join(pu.replace[i][0]);
        rtext[3] = rtext[3].split(pu.replace[i][1]).join(pu.replace[i][0]);
        rtext[4] = rtext[4].split(pu.replace[i][1]).join(pu.replace[i][0]);

        // submode, style settings
        if (typeof rtext[11] !== 'undefined') {
            rtext[11] = rtext[11].split(pu.replace[i][1]).join(pu.replace[i][0]);
        }

        // custom colors, only checking for 14 as 14 and 15 will appear together or never
        if (typeof rtext[14] !== 'undefined') {
            rtext[14] = rtext[14].split(pu.replace[i][1]).join(pu.replace[i][0]);
            rtext[15] = rtext[15].split(pu.replace[i][1]).join(pu.replace[i][0]);
        }

        // genre tags
        if (typeof rtext[17] !== 'undefined') {
            rtext[17] = rtext[17].split(pu.replace[i][1]).join(pu.replace[i][0]);
        }
    }
    rtext[5] = JSON.parse(rtext[5]);
    for (var i = 1; i < rtext[5].length; i++) {
        rtext[5][i] = (rtext[5][i - 1] + rtext[5][i]);
    }

    // Tab settings
    if (typeof rtext[6] !== 'undefined') {
        this.usertab_choices = rtext[6];

        // Advance Control Setting
        // Do this only for latest version 2.25.17 and above
        // if (pu.version[0] >= 2 && pu.version[1] >= 25 && pu.version[2] >= 17) {
        if (this.usertab_choices.length > 2) { // If none selected, usertab_chocies = [] (size 2)
            document.getElementById('advance_button').value = "1";
            advancecontrol_onoff("url");
        }
        // }
    }

    // Populate and set genre tags
    if (typeof rtext[17] !== 'undefined') {
        pu.user_tags = JSON.parse(rtext[17]);
    }
    add_genre_tags(pu.user_tags);
    $('#genre_tags_opt').select2({
        placeholder: 'Search Area',
        'width': "90%"
    });

    if (paramArray.m === "edit") { //edit_mode
        var mode = JSON.parse(rtext[2]);
        for (var i in mode) {
            for (var j in mode[i]) {
                pu.mode[i][j] = mode[i][j];
            }
        }
        pu.pu_q = JSON.parse(rtext[3]);
        pu.pu_a = JSON.parse(rtext[4]);
        if (!pu.pu_q.polygon) { pu.pu_q.polygon = []; } // not sure yet, why these lines exist
        if (!pu.pu_a.polygon) { pu.pu_a.polygon = []; }

        // custom color
        if (typeof rtext[13] !== 'undefined') {
            if (JSON.parse(rtext[13]) === "true") {
                document.getElementById("custom_color_opt").value = 2;
            }
        }
        if (typeof rtext[14] !== 'undefined') {
            pu.pu_q_col = JSON.parse(rtext[14]);
            pu.pu_a_col = JSON.parse(rtext[15]);
            if (!pu.pu_q_col.polygon) { pu.pu_q_col.polygon = []; } // not sure yet, why these lines exist
            if (!pu.pu_a_col.polygon) { pu.pu_a_col.polygon = []; }
        }

        pu.centerlist = rtext[5];

        // Because class cannot be copied, its set in different way
        let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
        let undo_redo = ["command_redo", "command_undo"];
        for (var i of pu_qa) {
            for (var j of undo_redo) {
                var t = pu[i][j].__a;
                pu[i][j] = new Stack();
                pu[i][j].set(t);
            }
        }

        if (paramArray.l === "solvedup") { // Basically clone of solve mode
            set_solvemode(type);

            // Decrypt a
            if (paramArray.a) {
                var ab = atob(paramArray.a);
                ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
                var inflate = new Zlib.RawInflate(ab);
                var plain = inflate.decompress();
                var atext = new TextDecoder().decode(plain);

                if (pu.multisolution) {
                    pu.solution = JSON.parse(atext);
                } else {
                    pu.solution = atext;
                }

                // Solution button
                // document.getElementById("pu_a_label").style.display = "inline-block";
                // document.getElementById("pu_a_label").style.marginLeft = "6px";
                // document.getElementById("pu_a_label").innerHTML = "Check Solution";
                // document.getElementById("solution_check").innerHTML = "*Automatic answer checking is enabled";
                set_solvemodetitle();
            }

            if (rtext[7] !== "undefined") {
                let starttime = rtext[7].split(":");
                if (starttime.length === 4) {
                    sw_timer.start({
                        precision: 'secondTenths',
                        startValues: {
                            hours: parseInt(starttime[0]),
                            minutes: parseInt(starttime[1]),
                            seconds: parseInt(starttime[2]),
                            secondTenths: parseInt(starttime[3])
                        }
                    });
                } else if (starttime.length === 5) { // added "days" precision in the recent update
                    sw_timer.start({
                        precision: 'secondTenths',
                        startValues: {
                            days: parseInt(starttime[0]),
                            hours: parseInt(starttime[1]),
                            minutes: parseInt(starttime[2]),
                            seconds: parseInt(starttime[3]),
                            secondTenths: parseInt(starttime[4])
                        }
                    });
                } else {
                    sw_timer.start({ precision: 'secondTenths' });
                }
            } else {
                sw_timer.start({ precision: 'secondTenths' });
            }

            if (typeof rtext[8] !== 'undefined') {
                // set the answer check settings
                var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck");
                var answersetting = JSON.parse(rtext[8]);
                for (var i = 0; i < settingstatus.length; i++) {
                    settingstatus[i].checked = answersetting[settingstatus[i].id];
                }
            }

            if (typeof rtext[9] !== 'undefined' && rtext[9].indexOf("comp") !== -1) { // Competitive mode
                set_contestmode();
            }
        } else {
            if (typeof rtext[7] !== 'undefined') {
                // set the answer check settings
                var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck");
                var answersetting = JSON.parse(rtext[7]);
                for (var i = 0; i < settingstatus.length; i++) {
                    settingstatus[i].checked = answersetting[settingstatus[i].id];
                }
            }

            // Populate Constraints list
            if (pu.gridtype === "square" || pu.gridtype === "sudoku" || pu.gridtype === "kakuro") {
                add_constraints();
            } else {
                // Constraints
                document.getElementById('constraints').style.display = 'none';
                if (type === "local") {
                    $('select').toggleSelect2(false);
                } else {
                    document.getElementById('constraints_settings_opt').style.display = 'none';
                }
            }
        }
    } else if (paramArray.m === "solve") { //solve_mode
        set_solvemode(type)
        pu.mode.qa = "pu_a";

        // mode initialization
        var rtext_mode = rtext[2].split('~');
        pu.mode.grid = JSON.parse(rtext_mode[0]);
        pu.mode_set("surface");
        pu.pu_q = JSON.parse(rtext[3]);
        if (!pu.pu_q.polygon) { pu.pu_q.polygon = []; }

        // custom color
        if (typeof rtext[13] !== 'undefined') {
            if (JSON.parse(rtext[13]) === "true") {
                document.getElementById("custom_color_opt").value = 2;
            }
        }

        if (typeof rtext[14] !== 'undefined') {
            pu.pu_q_col = JSON.parse(rtext[14]);
            if (!pu.pu_q_col.polygon) { pu.pu_q_col.polygon = []; } // not sure yet, why these lines exist
        }

        pu.centerlist = rtext[5];

        // Because class cannot be copied, its set in different way
        let pu_qa = ["pu_q", "pu_q_col"];
        let undo_redo = ["command_redo", "command_undo"];
        for (var i of pu_qa) {
            for (var j of undo_redo) {
                var t = pu[i][j].__a;
                pu[i][j] = new Stack();
                pu[i][j].set(t);
            }
        }

        // Decrypt a
        if (paramArray.a) {
            var ab = atob(paramArray.a);
            ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
            var inflate = new Zlib.RawInflate(ab);
            var plain = inflate.decompress();
            var atext = new TextDecoder().decode(plain);
            if (pu.multisolution) {
                pu.solution = JSON.parse(atext);
            } else {
                pu.solution = atext;
            }

            // Solution button
            // document.getElementById("pu_a_label").style.display = "inline-block";
            // document.getElementById("pu_a_label").style.marginLeft = "6px";
            // document.getElementById("pu_a_label").innerHTML = "Check Solution";
            // document.getElementById("solution_check").innerHTML = "*Automatic answer checking is enabled";
            set_solvemodetitle();
        }
        if (typeof rtext[7] !== 'undefined') {
            // set the answer check settings
            var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck");
            var answersetting = JSON.parse(rtext[7]);
            for (var i = 0; i < settingstatus.length; i++) {
                settingstatus[i].checked = answersetting[settingstatus[i].id];
            }
        }
        if (typeof rtext[9] !== 'undefined' && rtext[9].indexOf("comp") !== -1) { // Competitive mode
            set_contestmode();
        }
        sw_timer.start({ precision: 'secondTenths' });
    }

    document.getElementById("nb_grid" + pu.mode.grid[0]).checked = true;
    document.getElementById("nb_lat" + pu.mode.grid[1]).checked = true;
    document.getElementById("nb_out" + pu.mode.grid[2]).checked = true;

    // Drawing
    pu.create_point();
    pu.point_move((pu.canvasx * 0.5 - pu.point[pu.center_n].x + 0.5), (pu.canvasy * 0.5 - pu.point[pu.center_n].y + 0.5), pu.theta);
    pu.canvas_size_setting();
    pu.cursol = pu.centerlist[0];
    if (pu.reflect[0] === -1) {
        pu.point_reflect_LR();
    }
    if (pu.reflect[1] === -1) {
        pu.point_reflect_UD();
    }
    pu.make_frameline(); // Draw Board
    panel_pu.draw_panel();

    // submode, style settings
    if (typeof rtext[11] !== 'undefined') {
        pu.mode = JSON.parse(rtext[11]);
        if (paramArray.m === "solve") {
            pu.mode.qa = "pu_a";
        }
    }

    pu.mode_qa(pu.mode.qa); //include redraw
    if (paramArray.m === "solve") {
        // Saving the solve mode
        var rtext_mode = rtext[2].split('~');
        pu.mode.grid = JSON.parse(rtext_mode[0]);
        if (rtext_mode[1]) {
            var amode = JSON.parse(rtext_mode[1]);
            if (amode != "board" && amode != "cage" && amode != "special") { // Excluding the mode which are not part of answer mode
                pu.mode[pu.mode.qa].edit_mode = amode;
                pu.mode[pu.mode.qa][amode] = JSON.parse(rtext_mode[2]);
            }
        }
    }

    pu.mode_set(pu.mode[pu.mode.qa].edit_mode, 'url'); //includes redraw

    // Theme
    if (typeof rtext[12] !== 'undefined') {
        if (JSON.parse(rtext[12]) === 'dark') {
            document.getElementById("theme_mode_opt").value = 2;
            document.getElementById("color_theme").href = "./css/dark_theme.css";
            pu.set_redoundocolor();
            pu.redraw();
        }
    }

    // answerchecking settings for "OR"
    if (typeof rtext[16] !== 'undefined' && rtext[16] !== "") { // for some reason old links had 16th entry as empty
        // set the answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck_or");
        var answersetting = JSON.parse(rtext[16]);
        for (var i = 0; i < settingstatus.length; i++) {
            settingstatus[i].checked = answersetting[settingstatus[i].id];
        }
    }
}

function loadver1(paramArray, rtext) {
    // Load initial settings
    var rtext_para = rtext[0].split(',');

    document.getElementById("gridtype").value = "square";
    changetype();
    document.getElementById("nb_size1").value = parseInt(rtext_para[0]);
    document.getElementById("nb_size2").value = parseInt(rtext_para[1]);
    document.getElementById("nb_size3").value = parseInt(rtext_para[2]);
    document.getElementById("nb_space1").value = parseInt(rtext_para[3]);
    document.getElementById("nb_space2").value = parseInt(rtext_para[4]);
    document.getElementById("nb_space3").value = parseInt(rtext_para[5]);
    document.getElementById("nb_space4").value = parseInt(rtext_para[6]);

    make_class("square");

    pu.theta = 0;
    pu.reflect[0] = 1;
    pu.reflect[1] = 1;

    pu.canvasx = (parseInt(rtext_para[1]) + 1) * parseInt(rtext_para[3]);
    pu.canvasy = (parseInt(rtext_para[2]) + 1) * parseInt(rtext_para[3]);
    pu.search_center();
    pu.center_n0 = pu.center;

    panel_pu = new Panel();

    if (!paramArray.m) { //edit_mode
        var rtext_q = JSON.parse(rtext[1]);
        var rtext_a = JSON.parse(rtext[2]);
        var rtext_qa = { "pu_q": rtext_q, "pu_a": rtext_a };
        pu.reset_frame();

        var pre_centerlist = pu.centerlist;
        pu.centerlist = []
        for (var j = 2; j < pu.ny0 - 2; j++) {
            for (var i = 2; i < pu.nx0 - 2; i++) {
                pu.centerlist.push(i + j * (pu.nx0));
            }
        }

        loadqa_arrayver1("pu_q", rtext_qa);
        loadqa_arrayver1("pu_a", rtext_qa);

    } else if (paramArray.m === "solve") { //solve_mode
        set_solvemode()
        pu.mode.qa = "pu_a";
        pu.mode_set("surface");
        var rtext_q = JSON.parse(rtext[1]);
        var rtext_qa = { "pu_q": rtext_q };
        pu.reset_frame();

        var pre_centerlist = pu.centerlist;
        pu.centerlist = []
        for (var j = 2; j < pu.ny0 - 2; j++) {
            for (var i = 2; i < pu.nx0 - 2; i++) {
                pu.centerlist.push(i + j * (pu.nx0));
            }
        }

        loadqa_arrayver1("pu_q", rtext_qa);
    }

    if (paramArray.l === "solvedup") {
        set_solvemode();
    }

    document.getElementById(rtext_para[7]).checked = true;
    pu.mode.grid[0] = rtext_para[7].slice(-1);
    document.getElementById(rtext_para[8]).checked = true;
    pu.mode.grid[1] = rtext_para[8].slice(-1);
    document.getElementById(rtext_para[9]).checked = true;
    pu.mode.grid[2] = rtext_para[9].slice(-1);

    // Drawing
    pu.create_point();
    pu.point_move((pu.canvasx * 0.5 - pu.point[pu.center_n].x + 0.5), (pu.canvasy * 0.5 - pu.point[pu.center_n].y + 0.5), pu.theta);
    pu.canvas_size_setting();
    pu.cursol = pu.centerlist[0];

    pu.centerlist = pre_centerlist;
    pu.make_frameline(); // Board drawing
    panel_pu.draw_panel();
    pu.mode_qa(pu.mode.qa); //include redraw
    pu.mode_set(pu.mode[pu.mode.qa].edit_mode); //include redraw
}

function loadqa_arrayver1(qa, rtext_qa) {
    var key, i1, i2, p, q;
    //surface
    for (var i in rtext_qa[qa][0]) {
        pu[qa].surface[pu.centerlist[i]] = rtext_qa[qa][0][i];
    }
    //line
    for (var i in rtext_qa[qa][1]) { //lineH
        if (rtext_qa[qa][1][i] != 98) {
            i1 = i % (pu.nx - 1) + parseInt(i / (pu.nx - 1)) * pu.nx;
            i2 = i1 + 1;
            key = pu.centerlist[i1] + "," + pu.centerlist[i2]
            pu[qa].line[key] = rtext_qa[qa][1][i];
        } else {
            i1 = i % (pu.nx - 1) + parseInt(i / (pu.nx - 1)) * pu.nx;
            i2 = pu.point[pu.centerlist[i1]].neighbor[3];
            pu[qa].line[i2] = rtext_qa[qa][1][i];
        }
    }
    for (var i in rtext_qa[qa][2]) { //lineV
        if (rtext_qa[qa][2][i] != 98) {
            i1 = i % pu.nx + parseInt(i / pu.nx) * pu.nx;
            i2 = i1 + pu.nx;
            key = pu.centerlist[i1] + "," + pu.centerlist[i2];
            pu[qa].line[key] = rtext_qa[qa][2][i];
        } else {
            i1 = i % pu.nx + parseInt(i / pu.nx) * pu.nx;
            i2 = pu.point[pu.centerlist[i1]].neighbor[1];
            pu[qa].line[i2] = rtext_qa[qa][2][i];
        }
    }
    for (var i in rtext_qa[qa][3]) { //lineDa
        i1 = i % (pu.nx - 1) + parseInt(i / (pu.nx - 1)) * pu.nx;
        i2 = i1 + pu.nx + 1;
        key = pu.centerlist[i1] + "," + pu.centerlist[i2];
        pu[qa].line[key] = rtext_qa[qa][3][i];
    }
    for (var i in rtext_qa[qa][4]) { //lineDb
        i1 = i % (pu.nx - 1) + parseInt(i / (pu.nx - 1)) * pu.nx + 1;
        i2 = i1 + pu.nx - 1;
        key = pu.centerlist[i1] + "," + pu.centerlist[i2];
        pu[qa].line[key] = rtext_qa[qa][4][i];
    }

    //lineE
    for (var i in rtext_qa[qa][5]) { //lineEH
        if (rtext_qa[qa][5][i] != 98) {
            i1 = i % pu.nx + parseInt(i / pu.nx) * (pu.nx);
            if (parseInt(i / pu.nx) === pu.ny) {
                i2 = pu.centerlist[i1 - pu.nx] + pu.nx + 4;
            } else {
                i2 = pu.centerlist[i1];
            }
            key = pu.point[i2].surround[0] + "," + pu.point[i2].surround[1];
            pu[qa].lineE[key] = rtext_qa[qa][5][i];
        } else {
            i1 = i % pu.nx + parseInt(i / pu.nx) * (pu.nx);
            if (parseInt(i / pu.nx) === pu.ny) {
                i2 = pu.centerlist[i1 - pu.nx] + pu.nx + 4;
            } else {
                i2 = pu.centerlist[i1];
            }
            pu[qa].lineE[pu.point[i2].neighbor[0]] = rtext_qa[qa][5][i];
        }
    }

    for (var i in rtext_qa[qa][6]) { //lineEV
        if (rtext_qa[qa][6][i] != 98) {
            i1 = i % (pu.nx + 1) + parseInt(i / (pu.nx + 1)) * (pu.nx);
            if (i % (pu.nx + 1) === pu.nx) {
                i2 = pu.centerlist[i1 - 1] + 1;
            } else {
                i2 = pu.centerlist[i1];
            }
            key = pu.point[i2].surround[0] + "," + pu.point[i2].surround[3];
            pu[qa].lineE[key] = rtext_qa[qa][6][i];
        } else {
            i1 = i % (pu.nx + 1) + parseInt(i / (pu.nx + 1)) * (pu.nx);
            if (i % (pu.nx + 1) === pu.nx) {
                i2 = pu.centerlist[i1 - 1] + 1;
            } else {
                i2 = pu.centerlist[i1];
            }
            pu[qa].lineE[pu.point[i2].neighbor[2]] = rtext_qa[qa][6][i];
        }
    }
    for (var i in rtext_qa[qa][7]) { //lineEDa
        i1 = pu.centerlist[i];
        key = pu.point[i1].surround[0] + "," + pu.point[i1].surround[2];
        pu[qa].lineE[key] = rtext_qa[qa][7][i];
    }
    for (var i in rtext_qa[qa][8]) { //st_lineEDb
        i1 = pu.centerlist[i]
        key = pu.point[i1].surround[1] + "," + pu.point[i1].surround[3]
        pu[qa].lineE[key] = rtext_qa[qa][8][i];
    }
    for (var i in rtext_qa[qa][9]) { //st_wallH
        i1 = pu.centerlist[i]
        key = pu.point[i1].neighbor[2] + "," + pu.point[i1].neighbor[3]
        pu[qa].wall[key] = rtext_qa[qa][9][i];
    }
    for (var i in rtext_qa[qa][10]) { //st_wallH
        i1 = pu.centerlist[i]
        key = pu.point[i1].neighbor[0] + "," + pu.point[i1].neighbor[1]
        pu[qa].wall[key] = rtext_qa[qa][10][i];
    }
    for (var i in rtext_qa[qa][11]) { //number
        i1 = pu.centerlist[i]
        if (rtext_qa[qa][11][i][2] === "2") { //arrow
            if (rtext_qa[qa][11][i][0].slice(-2) === "_R") {
                rtext_qa[qa][11][i][0] = rtext_qa[qa][11][i][0].slice(0, -2) + "_2";
            } else if (rtext_qa[qa][11][i][0].slice(-2) === "_U") {
                rtext_qa[qa][11][i][0] = rtext_qa[qa][11][i][0].slice(0, -2) + "_0";
            } else if (rtext_qa[qa][11][i][0].slice(-2) === "_D") {
                rtext_qa[qa][11][i][0] = rtext_qa[qa][11][i][0].slice(0, -2) + "_3";
            } else if (rtext_qa[qa][11][i][0].slice(-2) === "_L") {
                rtext_qa[qa][11][i][0] = rtext_qa[qa][11][i][0].slice(0, -2) + "_1";
            }
        }
        pu[qa].number[i1] = rtext_qa[qa][11][i];
    }

    for (var i in rtext_qa[qa][12]) { //numberS
        i1 = (pu.nx + 4) * (pu.ny + 4) * 4 + 4 * (pu.nx + 4) * 2 + 8; //topleft
        p = i % (2 * pu.nx);
        q = parseInt(i / (2 * pu.nx));
        if (p % 2 === 0 && q % 2 === 0) {
            i1 += p * 2 + q * (pu.nx + 4) * 2;
        } else if (p % 2 === 1 && q % 2 === 0) {
            i1 += p * 2 - 1 + q * (pu.nx + 4) * 2;
        } else if (p % 2 === 0 && q % 2 === 1) {
            i1 += p * 2 + 2 + (q - 1) * (pu.nx + 4) * 2;
        } else if (p % 2 === 1 && q % 2 === 1) {
            i1 += p * 2 + 1 + (q - 1) * (pu.nx + 4) * 2;
        }
        pu[qa].numberS[i1] = rtext_qa[qa][12][i];
    }
    for (var i in rtext_qa[qa][13]) { //numberE
        p = i % (2 * pu.nx + 1);
        q = parseInt(i / (2 * pu.nx + 1));
        if (p % 2 === 0 && q % 2 === 0) {
            i1 = (pu.nx + 4) * (pu.ny + 4) + (pu.nx + 4) + 1;
            i1 += parseInt(p * 0.5 + q * 0.5 * (pu.nx + 4));
        } else if (p % 2 === 1 && q % 2 === 0) {
            i1 = (pu.nx + 4) * (pu.ny + 4) * 2 + (pu.nx + 4) + 2;
            i1 += parseInt((p - 1) * 0.5 + q * 0.5 * (pu.nx + 4));
        } else if (p % 2 === 0 && q % 2 === 1) {
            i1 = (pu.nx + 4) * (pu.ny + 4) * 3 + 2 * (pu.nx + 4) + 1;
            i1 += parseInt(p * 0.5 + (q - 1) * 0.5 * (pu.nx + 4));
        } else if (p % 2 === 1 && q % 2 === 1) {
            i1 = 2 * (pu.nx + 4) + 2;
            i1 += parseInt((p - 1) * 0.5 + (q - 1) * 0.5 * (pu.nx + 4));
            i1 += "E";
        }
        pu[qa].number[i1] = rtext_qa[qa][13][i];
    }
    for (var i in rtext_qa[qa][14]) { //cageH
        i1 = (pu.nx + 4) * (pu.ny + 4) * 4 + 4 * (pu.nx + 4) * 2 + 8; //topleft
        i2 = i % (2 * pu.nx - 1) + parseInt(i / (2 * pu.nx - 1)) * 2 * pu.nx;
        p = i2 % (2 * pu.nx);
        q = parseInt(i2 / (2 * pu.nx));
        if (p % 2 === 0 && q % 2 === 0) {
            i1 += p * 2 + q * (pu.nx + 4) * 2;
            i2 = i1 + 1;
        } else if (p % 2 === 1 && q % 2 === 0) {
            i1 += p * 2 - 1 + q * (pu.nx + 4) * 2;
            i2 = i1 + 3;
        } else if (p % 2 === 0 && q % 2 === 1) {
            i1 += p * 2 + 2 + (q - 1) * (pu.nx + 4) * 2;
            i2 = i1 + 1;
        } else if (p % 2 === 1 && q % 2 === 1) {
            i1 += p * 2 + 1 + (q - 1) * (pu.nx + 4) * 2;
            i2 = i1 + 3;
        }
        key = i1 + "," + i2;
        pu[qa].cage[key] = rtext_qa[qa][14][i];
    }
    for (var i in rtext_qa[qa][15]) { //cageV
        i1 = (pu.nx + 4) * (pu.ny + 4) * 4 + 4 * (pu.nx + 4) * 2 + 8; //topleft
        p = i % (2 * pu.nx);
        q = parseInt(i / (2 * pu.nx));
        if (p % 2 === 0 && q % 2 === 0) {
            i1 += p * 2 + q * (pu.nx + 4) * 2;
            i2 = i1 + 2;
        } else if (p % 2 === 1 && q % 2 === 0) {
            i1 += p * 2 - 1 + q * (pu.nx + 4) * 2;
            i2 = i1 + 2;
        } else if (p % 2 === 0 && q % 2 === 1) {
            i1 += p * 2 + 2 + (q - 1) * (pu.nx + 4) * 2;
            i2 = i1 + 4 * (pu.nx * 2) - 2;
        } else if (p % 2 === 1 && q % 2 === 1) {
            i1 += p * 2 + 1 + (q - 1) * (pu.nx + 4) * 2;
            i2 = i1 + 4 * (pu.nx * 2) - 2;
        }
        key = i1 + "," + i2;
        pu[qa].cage[key] = rtext_qa[qa][15][i];
    }

    var dif_symbol = [];
    for (var i in rtext_qa[qa][16]) { //symbol
        i1 = pu.centerlist[i];
        pu[qa].symbol[i1] = rtext_qa[qa][16][i];
        if (pu[qa].symbol[i1][1] === "cross") {
            dif_symbol = [0, 0, 0, 0];
            dif_symbol[0] = pu[qa].symbol[i1][0][2];
            dif_symbol[1] = pu[qa].symbol[i1][0][3];
            dif_symbol[2] = pu[qa].symbol[i1][0][0];
            dif_symbol[3] = pu[qa].symbol[i1][0][1];
            pu[qa].symbol[i1][0] = dif_symbol;
        } else if (pu[qa].symbol[i1][1] === "battleship_B" || pu[qa].symbol[i1][1] === "battleship_G" || pu[qa].symbol[i1][1] === "battleship_W") {
            if (pu[qa].symbol[i1][0] >= 7) {
                pu[qa].symbol[i1][0] = 2;
            }
        } else if (pu[qa].symbol[i1][1] === "kakuro") {
            dif_symbol = [0, 1, 1, 2, 3, 4, 5, 6];
            pu[qa].symbol[i1][0] = dif_symbol[pu[qa].symbol[i1][0]];
        } else if (pu[qa].symbol[i1][1] === "firefly") {
            dif_symbol = [0, 3, 4, 1, 2, 5];
            pu[qa].symbol[i1][0] = dif_symbol[pu[qa].symbol[i1][0]];
        }
    }
    for (var i in rtext_qa[qa][17]) { //symbolE
        p = i % (2 * pu.nx + 1);
        q = parseInt(i / (2 * pu.nx + 1));
        if (p % 2 === 0 && q % 2 === 0) {
            i1 = (pu.nx + 4) * (pu.ny + 4) + (pu.nx + 4) + 1;
            i1 += parseInt(p * 0.5 + q * 0.5 * (pu.nx + 4));
        } else if (p % 2 === 1 && q % 2 === 0) {
            i1 = (pu.nx + 4) * (pu.ny + 4) * 2 + (pu.nx + 4) + 2;
            i1 += parseInt((p - 1) * 0.5 + q * 0.5 * (pu.nx + 4));
        } else if (p % 2 === 0 && q % 2 === 1) {
            i1 = (pu.nx + 4) * (pu.ny + 4) * 3 + 2 * (pu.nx + 4) + 1;
            i1 += parseInt(p * 0.5 + (q - 1) * 0.5 * (pu.nx + 4));
        } else if (p % 2 === 1 && q % 2 === 1) {
            i1 = 2 * (pu.nx + 4) + 2;
            i1 += parseInt((p - 1) * 0.5 + (q - 1) * 0.5 * (pu.nx + 4));
            i1 += "E";
        }
        pu[qa].symbol[i1] = rtext_qa[qa][17][i];
        if (pu[qa].symbol[i1][1] === "cross") {
            dif_symbol = [0, 0, 0, 0];
            dif_symbol[0] = pu[qa].symbol[i1][0][2];
            dif_symbol[1] = pu[qa].symbol[i1][0][3];
            dif_symbol[2] = pu[qa].symbol[i1][0][0];
            dif_symbol[3] = pu[qa].symbol[i1][0][1];
            pu[qa].symbol[i1][0] = dif_symbol;
        } else if (pu[qa].symbol[i1][1] === "battleship_B" || pu[qa].symbol[i1][1] === "battleship_G" || pu[qa].symbol[i1][1] === "battleship_W") {
            if (pu[qa].symbol[i1][0] >= 7) {
                pu[qa].symbol[i1][0] = 2;
            }
        } else if (pu[qa].symbol[i1][1] === "kakuro") {
            dif_symbol = [0, 1, 1, 2, 3, 4, 5, 6];
            pu[qa].symbol[i1][0] = dif_symbol[pu[qa].symbol[i1][0]];
        } else if (pu[qa].symbol[i1][1] === "firefly") {
            dif_symbol = [0, 3, 4, 1, 2, 5];
            pu[qa].symbol[i1][0] = dif_symbol[pu[qa].symbol[i1][0]];
        } else if (pu[qa].symbol[i1][1] === "inequality") {
            dif_symbol = [0, 1, 3, 4, 2, 5, 7, 8, 6];
            pu[qa].symbol[i1][0] = dif_symbol[pu[qa].symbol[i1][0]];
        }
    }
    for (var i in rtext_qa[qa][18]) { //freeline
        i1 = i.split(",")[0];
        i2 = i.split(",")[1];
        key = pu.centerlist[i1] + "," + pu.centerlist[i2];
        pu[qa].line[key] = rtext_qa[qa][18][i];
    }
    for (var i in rtext_qa[qa][19]) { //freelineE
        i1 = i.split(",")[0];
        i2 = i.split(",")[1];

        i1 = i1 % (pu.nx + 1) + parseInt(i1 / (pu.nx + 1)) * (pu.nx);
        i1 = pu.centerlist[i1]
        if (i1 % (pu.nx + 1) === pu.nx) {
            i1 += 1;
        }
        if (parseInt(i1 / pu.nx) === pu.ny) {
            i1 += pu.nx;
        }
        i2 = i2 % (pu.nx + 1) + parseInt(i2 / (pu.nx + 1)) * (pu.nx);
        i2 = pu.centerlist[i2]
        if (i2 % (pu.nx + 1) === pu.nx) {
            i2 += 1;
        }
        if (parseInt(i1 / pu.nx) === pu.ny) {
            i2 += pu.nx;
        }
        key = pu.point[i1].surround[0] + "," + pu.point[i2].surround[0];
        pu[qa].lineE[key] = rtext_qa[qa][19][i];
    }
    for (var i of rtext_qa[qa][20]) { //thermo
        pu[qa].thermo.push([]);
        for (j of i) {
            pu[qa].thermo[pu[qa].thermo.length - 1].push(pu.centerlist[j]);
        }
    }
    for (var i of rtext_qa[qa][21]) { //arrows
        pu[qa].arrows.push([]);
        for (j of i) {
            pu[qa].arrows[pu[qa].arrows.length - 1].push(pu.centerlist[j]);
        }
    }
    for (var i of rtext_qa[qa][22]) { //direction
        pu[qa].direction.push([]);
        for (j of i) {
            pu[qa].direction[pu[qa].direction.length - 1].push(pu.centerlist[j]);
        }
    }
    if (rtext_qa[qa][23]) {
        for (var i of rtext_qa[qa][23]) { //squareframe
            pu[qa].squareframe.push([]);
            for (j of i) {
                pu[qa].squareframe[pu[qa].squareframe.length - 1].push(pu.centerlist[j]);
            }
        }
    }
    if (rtext_qa[qa][24]) {
        for (var i in rtext_qa[qa][24]) { //deletelineHE
            if (parseInt(i / pu.nx) === pu.ny) {
                i2 = pu.centerlist[i - pu.nx] + pu.nx + 4;
            } else {
                i2 = pu.centerlist[i]
            }
            key = pu.point[i2].surround[0] + "," + pu.point[i2].surround[1];
            pu[qa].deletelineE[key] = rtext_qa[qa][24][i];
        }
    }
    if (rtext_qa[qa][25]) {
        for (var i in rtext_qa[qa][25]) { //deletelineVE
            i1 = i % (pu.nx + 1) + parseInt(i / (pu.nx + 1)) * (pu.nx);
            if (i % (pu.nx + 1) === pu.nx) {
                i2 = pu.centerlist[i1 - 1] + 1;
            } else {
                i2 = pu.centerlist[i1]
            }
            key = pu.point[i2].surround[0] + "," + pu.point[i2].surround[3];
            pu[qa].deletelineE[key] = rtext_qa[qa][25][i];
        }
    }
}

function set_solvemode(type = "url") {
    pu.mmode = "solve";
    pu.mode.qa = "pu_a";
    document.getElementById("title").innerHTML = "Solver mode"
    document.getElementById("nb_size3_r").value = document.getElementById("nb_size3").value;
    document.getElementById("newsize").style.display = "inline";
    document.getElementById("pu_a").checked = true;
    document.getElementById("edit_txt").style.display = "none";
    document.getElementById("pu_q_label").style.display = "none";
    document.getElementById("pu_a_label").style.display = "none";
    document.getElementById("newboard").style.display = "none";
    document.getElementById("rotation").style.display = "none";
    document.getElementById("mo_board_lb").style.display = "none";
    document.getElementById("sub_number2_lb").style.display = "none";
    document.getElementById("sub_number4_lb").style.display = "none";
    document.getElementById("sub_number11_lb").style.display = "none";

    // Hide Visibility button
    document.getElementById("visibility_button0").style.display = "none";
    document.getElementById("visibility_button").style.display = "none";

    // Hide Load button
    document.getElementById("input_url").style.display = "none";

    // custom color
    document.getElementById('colorpicker_special').style.display = 'none';
    document.getElementById('custom_color_lb').style.display = 'none';
    document.getElementById('custom_color_opt').style.display = 'none';

    // Save settings
    document.getElementById('save_settings_lb').style.display = 'none';
    document.getElementById('save_settings_opt').style.display = 'none';

    // Middle Button settings not applicable in Solve mode
    document.getElementById('mousemiddle_settings_lb').style.display = 'none';
    document.getElementById('mousemiddle_settings_opt').style.display = 'none';

    // Constraints
    document.getElementById('constraints').style.display = 'none';
    if (type === "local") {
        $('select').toggleSelect2(false);
    } else {
        document.getElementById('constraints_settings_opt').style.display = 'none';
    }
}

function set_contestmode() {
    // Disable Share, Undo/Redo buttons, IO sudoku
    document.getElementById("title").innerHTML = "Contest mode"
    document.getElementById("savetext").style.display = "none";
    document.getElementById("input_sudoku").style.display = "none";
    document.getElementById("tb_undo").style.display = "none";
    document.getElementById("tb_redo").style.display = "none";
    document.getElementById("tb_reset").style.display = "none";
    document.getElementById("tb_delete").style.display = "none";
    document.getElementById("mo_move_lb").style.display = "none";
    document.getElementById("puzzlesourcelink").style.display = "none";
    // document.getElementById("answer_key").innerHTML = "*Note the Solution Code, go back to <a href=" + document.getElementById("saveinfosource").value + " target=\"_blank\">Source</a> and enter in the Submissions Box*";
    document.getElementById("submit_sol").style.display = "inline";
    pu.undoredo_disable = true;
    pu.comp = true;
}

function set_solvemodetitle() {
    document.getElementById("title").innerHTML = "Solver mode (*Automatic answer checking is enabled)";
    document.getElementById("title").classList.add("info");
}

function isEmpty(obj) {
    return !Object.keys(obj).length;
}

function isEmptycontent(pu_qa, array, num, value) {
    for (var i in pu[pu_qa][array]) {
        if (pu[pu_qa][array][i][num] === value) {
            return false;
        }
    }
    return true;
}

function decode_puzzlink(url) {
    var parts, urldata, type, cols, rows, bstr;

    parts = url.split("?");
    urldata = parts[1].split("/");
    if (urldata[1] === 'v:') {
        urldata.splice(1, 1); // Ignore variant rules
    }

    type = urldata[0];
    cols = parseInt(urldata[1]);
    rows = parseInt(urldata[2]);

    if ((cols > 60) || (rows > 60)) {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Penpa+ do not support grid size greater than 60 rows or columns',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
        return;
    }

    // create puzzlink object
    bstr = urldata[3];
    puzzlink_pu = new Puzzlink(cols, rows, bstr);
    size = parseInt(document.getElementById("nb_size3").value);

    function setupProblem(puzzle, mode) {
        puzzle.reset_frame(); // Draw the board
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
        puzzle.mode_set(mode); //include redraw
    }

    var info_edge, info_number, size, puzzlink_pu,
        row_ind, col_ind, cell, value, corner_cursor,
        number_style;

    switch (type) {
        case "ripple":
        case "nanro":
        case "onsen":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            if (type === "onsen") {
                pu.mode_grid("nb_grid2"); // change gridlines to dashes
                setupProblem(pu, "combi");
            } else {
                setupProblem(pu, "sudoku");
            }

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();

            // 1 is normal, 6 has a circle background
            number_style = type === "onsen" ? 6 : 1;

            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            puzzlink_pu.drawNumbers(pu, info_number, number_style, "1");

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            if (type === "onsen") {
                pu.mode_set("combi"); //include redraw
                pu.subcombimode("linex");
                this.usertab_choices = ["Surface", "Composite"];
            } else {
                pu.mode_set("sudoku"); //include redraw
                this.usertab_choices = ["Surface", "Sudoku Normal"];
            }
            break;
        case "sudoku":
            pu = new Puzzle_sudoku(cols, rows, size);
            if (cols === 9 && rows === 9) {
                pu.draw_sudokugrid([4, 7], [4, 7], 1, 9, 2);
            } else if (cols === 6 && rows === 6) {
                pu.draw_sudokugrid([3, 5], [4], 1, 6, 2);
            } else if (cols === 4 && rows === 4) {
                pu.draw_sudokugrid([3], [3], 1, 4, 2);
            } else {
                pu = new Puzzle_square(10, 10, size);
                setupProblem(pu, "surface");
                Swal.fire({
                    title: 'Swaroop says:',
                    html: `Sorry, sudoku grids of size: ${cols}x${rows} are not supported`,
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                });
                break;
            }
            setupProblem(pu, "sudoku");

            // Decode URL
            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1"); // Normal submode is 1

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("sudoku"); //include redraw
            this.usertab_choices = ["Surface", "Sudoku Normal"];
            break;
        case "starbattle":
            // starbattle is different than most
            bstr = urldata[4];
            puzzlink_pu = new Puzzlink(cols, rows, bstr);

            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // change gridlines to dashes
            setupProblem(pu, "lineE");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi"); //include redraw
            pu.subcombimode("star");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "building": // skyscrapers alias
        case "skyscrapers":
            // Add white space for skyscraper clues
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);
            setupProblem(pu, "sudoku");

            info_number = puzzlink_pu.decodeNumber16ExCell();

            // Add numbers to grid
            let side, side_ind;
            for (var i in info_number) {
                // Determine which row and column
                side = parseInt(i / cols);
                side_ind = i % cols;
                switch (side) {
                    case 0: // Top Row
                        cell = pu.nx0 * 2 + 2 + side_ind + 1;
                        break;
                    case 1: // Bottom Row
                        cell = pu.nx0 * (2 + rows + 1) + 2 + side_ind + 1;
                        break;
                    case 2: // Left Column
                        cell = pu.nx0 * (2 + side_ind + 1) + 2;
                        break;
                    case 3: // Right Column
                        cell = pu.nx0 * (2 + side_ind + 1) + 2 + cols + 1;
                        break;
                }
                pu["pu_q"].number[cell] = [info_number[i], 1, "1"]; // Normal submode is 1
            }

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("sudoku"); //include redraw
            this.usertab_choices = ["Surface", "Sudoku Normal"];
            break;
        case "shakashaka":
        case "akari":
            // Decode URL
            info_number = puzzlink_pu.decodeNumber4();

            pu = new Puzzle_square(cols, rows, size);
            if (type === 'shakashaka') {
                pu.mode_grid("nb_grid2"); // change gridlines to dashes
            }
            setupProblem(pu, "combi");
            puzzlink_pu.drawNumbers(pu, info_number, 7, "1");

            // Draw black behind numbers
            for (i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 4;
            }

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi"); //include redraw
            pu.subcombimode(type === 'shakashaka' ? 'shaka' : 'akari');
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "kakuro":
            // Decode URL
            info_number = puzzlink_pu.decodeKakuro();

            pu = new Puzzle_kakuro(cols + 1, rows + 1, size);
            pu.draw_kakurogrid();
            setupProblem(pu, "sudoku");

            // Add inner clues
            for (var i in info_number.inner_clues) {
                row_ind = parseInt(i / cols) + 1;
                col_ind = (i % cols) + 1;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

                // cell not part of grid, then 2nd element of list is undefined
                if (info_number.inner_clues[i][1] === undefined) {
                    pu["pu_q"].symbol[cell] = [1, 'kakuro', 2];
                } else {
                    pu["pu_q"].symbol[cell] = [1, 'kakuro', 2];

                    // Bottom left value
                    value = info_number.inner_clues[i][0];
                    if (value !== 0 && value !== -1) {
                        corner_cursor = 4 * (cell + pu.nx0 * pu.ny0) + 2;
                        pu["pu_q"].numberS[corner_cursor] = [value.toString(), 4];
                    }

                    // Top right value
                    value = info_number.inner_clues[i][1];
                    if (value !== 0 && value !== -1) {
                        corner_cursor = 4 * (cell + pu.nx0 * pu.ny0) + 1;
                        pu["pu_q"].numberS[corner_cursor] = [value.toString(), 4];
                    }
                }
            }

            // Add Outer row
            for (var i in info_number.outer_row) {
                col_ind = i % cols;
                cell = pu.nx0 * 2 + 2 + col_ind + 1;
                value = info_number.outer_row[i];
                if (value !== -1 && value !== 0) {
                    corner_cursor = 4 * (cell + pu.nx0 * pu.ny0) + 2;
                    pu["pu_q"].numberS[corner_cursor] = [value.toString(), 4];
                }
            }

            // Add Outer Column
            for (var i in info_number.outer_column) {
                col_ind = i % cols;
                cell = pu.nx0 * (2 + col_ind + 1) + 2;
                value = info_number.outer_column[i];
                if (value !== -1 && value !== 0) {
                    corner_cursor = 4 * (cell + pu.nx0 * pu.ny0) + 1;
                    pu["pu_q"].numberS[corner_cursor] = [value.toString(), 4];
                }
            }

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("sudoku"); //include redraw
            this.usertab_choices = ["Surface", "Sudoku Normal"];
            break;
        case "ayeheya":
        case "heyawake":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();
            info_number = puzzlink_pu.moveNumbersToRegionCorners(info_edge, info_number);

            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1") // Black Style, Normal submode is 1

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("surface"); //include redraw
            this.usertab_choices = ["Surface"];
            break;
        case "kurochute":
        case "kurodoko":
        case "kurotto":
        case "nurikabe":
        case "nurimisaki":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            if (type !== "kurochute" && type !== "nurikabe") {
                number_style = 6; // Black with White Circle
            } else {
                number_style = 1; // Black
            }

            // Decode URL
            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, number_style, "1", type !== "nurikabe");

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo"); // Black square and Point
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "slitherlink":
        case "slither": // slitherlink alias
            pu = new Puzzle_square(cols, rows, size);
            // Draw grid dots only
            pu.mode_grid("nb_grid3");
            pu.mode_grid("nb_lat1");
            pu.mode_grid("nb_out2");
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber4();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgex");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "country":
        case "detour":
        case "maxi":
            pu = new Puzzle_square(cols, rows, size);
            if (type !== "country") {
                pu.mode_grid("nb_grid2"); // Dashed gridlines
            }
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();
            info_number = puzzlink_pu.moveNumbersToRegionCorners(info_edge, info_number);

            puzzlink_pu.drawBorder(pu, info_edge, 2);

            if (type === "country") {
                puzzlink_pu.drawNumbers(pu, info_number, 1, "1");
            } else {
                // Draw numbers in the corner
                for (var i in info_number) {
                    // Determine which row and column
                    row_ind = parseInt(i / cols);
                    col_ind = i % cols;
                    cell = 4 * (pu.ny0 * pu.nx0 + pu.nx0 * (2 + row_ind) + 2 + col_ind);
                    pu["pu_q"].numberS[cell] = [info_number[i], 1];
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("lineox");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "moonsun":
        case "mashu": // masyu alias
        case "masyu":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            if (type === 'moonsun') {
                info_edge = puzzlink_pu.decodeBorder();
                puzzlink_pu.drawBorder(pu, info_edge, 2);
            }

            info_number = puzzlink_pu.decodeNumber3();

            // Add moons and suns or circles
            value = type === "moonsun" ? "sun_moon" : "circle_L";
            for (i in info_number) {
                if (info_number[i] === 0) {
                    continue;
                }
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].symbol[cell] = [info_number[i], value, 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "haisu":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            // The "S" and "G" of the puzzle are stored at the beginning of the string
            info_number = puzzlink_pu.decodeNumber16(4);
            cell = pu.nx0 * (1 + info_number[1]) + 1 + info_number[0];
            pu["pu_q"].number[cell] = ["S", 1, "1"];
            cell = pu.nx0 * (1 + info_number[3]) + 1 + info_number[2];
            pu["pu_q"].number[cell] = ["G", 1, "1"];

            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();

            puzzlink_pu.drawBorder(pu, info_edge, 2);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "balance":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();

            for (i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                number = parseInt(info_number[i] / 2) || " ";
                pu["pu_q"].symbol[cell] = [info_number[i] % 2 + 1, "circle_L", 1];
                pu["pu_q"].number[cell] = [number, info_number[i] % 2 ? 4 : 1, "1"];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        case "midloop":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeMidloop();
            puzzlink_pu.drawMidloop(pu, info_edge);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            this.usertab_choices = ["Surface", "Composite"];
            break;
        default:
            Swal.fire({
                title: 'Swaroop says:',
                html: 'It currently do not support puzzle type: ' + type,
                icon: 'error',
                confirmButtonText: 'ok 🙂',
            })
            break;
    }

    // Set PenpaLite
    document.getElementById('advance_button').value = "1";
    document.getElementById("mode_break").style.display = "none";
    document.getElementById("mode_txt_space").style.display = "none";
    advancecontrol_off("url");

    var tabSelect = document.querySelector('ul.multi');
    for (var child of tabSelect.children) {
        if (!child.dataset.value) {
            continue;
        }

        if (this.usertab_choices.includes(child.dataset.value)) {
            if (!child.classList.contains('active')) {
                child.click();
            }
        } else {
            if (child.classList.contains('active')) {
                child.click();
            }
        }
    }

    // Redraw the grid
    pu.redraw();

    // Set the Source
    document.getElementById("saveinfosource").value = url;
}