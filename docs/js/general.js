function errorMsg(html) {
    Swal.fire({
        title: Branding.errorTitle,
        html: html,
        icon: 'error',
        confirmButtonText: Branding.okButtonText,
    })
}

function infoMsg(html) {
    Swal.fire({
        title: Branding.infoTitle,
        html: html,
        icon: 'info',
        confirmButtonText: Branding.okButtonText,
    })
}

function boot() {
    var obj = document.getElementById("dvique");
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    obj.appendChild(canvas);
    boot_parameters();
    init_genre_tags();
    set_answer_setting_table_to("and");

    var urlParam = location.search.substring(1);
    if (!urlParam && location.hash) {
        urlParam = location.hash.substring(1);
    }
    if (urlParam) {

        let param = urlParam.split('&');
        let paramArray = [];

        // Decompose address into elements
        for (var i = 0; i < param.length; i++) {
            let paramItem = param[i].split('=');
            paramArray[paramItem[0]] = paramItem[1];
        }

        let hash = "penpa_" + md5(paramArray.p);

        // Decrypt puzzle data
        let local_data = localStorage.getItem(hash);
        if (local_data && local_data.includes('&p=')) {
            // This is to account for old links and new links together
            var url;
            if (local_data.includes("#")) {
                url = local_data.split('#')[1];
            } else {
                url = local_data.split('?')[1];
            }
            load(url, type = 'localstorage', origurl = paramArray.p);
        } else {
            load(urlParam);
        }
    } else {
        create();
    }
}

function boot_parameters() {
    UserSettings.gridtype = "square";
    document.getElementById("nb_size1").value = 10;
    document.getElementById("nb_size2").value = 10;
    UserSettings.displaysize = 38;
    document.getElementById("nb_space1").value = 0;
    document.getElementById("nb_space2").value = 0;
    document.getElementById("nb_space3").value = 0;
    document.getElementById("nb_space4").value = 0;
}

function create() {
    UserSettings.loadFromCookies("gridtype_size");

    gridtype = UserSettings.gridtype;

    pu = make_class(gridtype);
    pu.reset_frame();

    // Drawing Panel
    panel_pu = new Panel();
    panel_pu.draw_panel();
    pu.mode_set("surface"); //include redraw

    UserSettings.loadFromCookies("others");

    // Populate Constraints list
    if (gridtype === "square" || gridtype === "sudoku" || gridtype === "kakuro") {
        add_constraints();
    } else {
        // Constraints
        document.getElementById('constraints').style.display = 'none';
        document.getElementById('constraints_settings_opt').style.display = 'none';
    }

    // Populate genre list
    set_genre_tags(pu.user_tags);

    pu.redraw();
}

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

function init_genre_tags() {
    let genre_tags = document.getElementById('genre_tags_opt');
    for (let child of genre_tags.childNodes) {
        genre_tags.removeChild(child);
    }
    penpa_tags['options_groups'].forEach(function(element, index) {
        let optgroup = document.createElement("optgroup");
        optgroup.label = element;

        penpa_tags['options'][element].forEach(function(subelement, subindex) {
            let opt = document.createElement("option");
            opt.value = subelement;
            opt.innerHTML = subelement;
            optgroup.appendChild(opt);
        });
        genre_tags.appendChild(optgroup);
    });

    $('#genre_tags_opt').select2({
        placeholder: 'Search Area',
        'width': "90%"
    });

    // // to access each option
    // $("#genre_tags_opt option").each(function() {
    //     console.log($(this));
    // });
}

function set_genre_tags(user_tags) {
    $('#genre_tags_opt').val(user_tags);
    $('#genre_tags_opt').trigger("change"); // Update selection
}

function set_answer_setting_table_to(and_or) {
    const table = document.getElementById("answersetting");

    let display;
    let invisible;
    if (and_or === "and") {
        document.getElementById('and_tmp').checked = true;
        display = ["visible", "none"];
        invisible = [...table.getElementsByClassName("solcheck_or")];
    } else if (and_or === "or") {
        document.getElementById('or_tmp').checked = true;
        display = ["none", "visible"];
        invisible = [...table.getElementsByClassName("solcheck")];
    } else {
        return;
    }

    // Ensure there are no invisible checked boxes
    invisible.forEach((elem) => { elem.checked = false });

    // Show only the options relevant to All/Any constraints
    const ands = table.getElementsByClassName("solcheck_show_and");
    const ors = table.getElementsByClassName("solcheck_show_or");
    [...ands].forEach((elem) => elem.setAttribute("style", `display: ${display[0]};`));
    [...ors].forEach((elem) => elem.setAttribute("style", `display: ${display[1]};`));
}

function create_newboard() {

    var size = UserSettings.displaysize;
    if (12 <= size && size <= 90) {
        var mode = pu.mode;
        var gridtype = UserSettings.gridtype;
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
        if (gridtype === "square" || gridtype === "sudoku" || gridtype === "kakuro" || gridtype === "hex") {
            document.getElementById('constraints').style.display = 'inline';
            $('select').toggleSelect2(true);
        } else {
            $('select').toggleSelect2(false);
            document.getElementById('constraints').style.display = 'none';
        }
    } else {
        errorMsg('Display size must be in the range <h2 class="warn">12-90</h2>')
    }
}

function make_class(gridtype, loadtype = 'new') {
    var size = UserSettings.displaysize;
    var gridmax = {
        'square': 100,
        'hex': 20,
        'tri': 20,
        'pyramid': 20,
        'cube': 20,
        'kakuro': 100,
        'tetrakis': 20,
        'truncated': 20,
        'snub': 20,
        'cairo': 20,
        'rhombitrihex': 20,
        'deltoidal': 20
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
                errorMsg('Rows/Columns Size must be in the range <h2 class="warn">1-' + gridmax['square'] + '</h2>');
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
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['hex'] + '</h2>');
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
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['tri'] + '</h2>');
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
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['pyramid'] + '</h2>');
            }
            break;
        case "iso":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['cube'] && n0 > 0) {
                pu = new Puzzle_iso(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['iso'] + '</h2>');
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

            if (nx <= gridmax['kakuro'] && nx > 0 && ny <= gridmax['kakuro'] && ny > 0) {
                // Create Kakuro object
                pu = new Puzzle_kakuro(nx, ny, size);

                if (loadtype === "new") {
                    pu.draw_kakurogrid();
                }
            } else {
                errorMsg('Rows/Columns Size must be in the range <h2 class="warn">1-' + gridmax['kakuro'] + '</h2>');
            }
            break;
        case "truncated_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_truncated_square(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['truncated'] + '</h2>');
            }
            break;
        case "tetrakis_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_tetrakis_square(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['tetrakis'] + '</h2>');
            }
            break;
        case "snub_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_snub_square(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['snub'] + '</h2>');
            }
            break;
        case "cairo_pentagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_cairo_pentagonal(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['cairo'] + '</h2>');
            }
            break;
        case "rhombitrihexagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_rhombitrihexagonal(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['rhombitrihex'] + '</h2>');
            }
            break;
        case "deltoidal_trihexagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_deltoidal_trihexagonal(n0, n0, size);
            } else {
                errorMsg('Side Size must be in the range <h2 class="warn">1-' + gridmax['deltoidal'] + '</h2>');
            }
            break;
    }
    return pu;
}

function changetype() {
    UserSettings.gridtype = document.getElementById("gridtype").value;

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
    switch (UserSettings.gridtype) {
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
            document.getElementById("nb_sudoku3_lb").innerHTML = "Outside clues (top/left)";
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
        case "rhombitrihexagonal":
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
        case "deltoidal_trihexagonal":
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
            // Save grid size setting
            if (document.getElementById("nb_size3").value != UserSettings.displaysize) {
                UserSettings.displaysize = document.getElementById("nb_size3").value;
            }
            create_newboard();
            pu.redraw();
            if (sw_timer.isPaused()) {
                pu.show_pause_layer();
            }
        }
    })
}

function redraw_grid() {
    var sizer = UserSettings.displaysize;
    pu.reset_frame_newgrid();
    pu.size = sizer;
    pu.redraw();
    panel_pu.draw_panel();
    if (sw_timer.isPaused()) {
        pu.show_pause_layer();
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

function replay_choice() {
    if (document.getElementById("replay_choice").value == "2") {

        if (typeof pu.replay_timer != "undefined") {
            clearInterval(pu.replay_timer);
        }

        // flag to check if its first click in progress
        pu.first_click = true;

        var redo_len = pu[pu.mode.qa]["command_redo"].__a.length;
        var undo_len = pu[pu.mode.qa]["command_undo"].__a.length;

        // Live replay only if within time limit and there is timestamp data
        if ((pu.puzzleinfo.totalMS <= pu.replaycutoff) && ((redo_len > 0 && typeof pu[pu.mode.qa]["command_redo"].__a[redo_len - 1][5] != "undefined") ||
                (undo_len > 0 && typeof pu[pu.mode.qa]["command_undo"].__a[undo_len - 1][5] != "undefined"))) {

            // hide forward, backward and speed buttons
            document.getElementById("replay_forward").style.display = "none";
            document.getElementById("replay_backward").style.display = "none";
            document.getElementById("replay_forward_btn").style.display = "none";
            document.getElementById("replay_backward_btn").style.display = "none";
            document.getElementById("replay_download_btn").style.display = "none";

            // Hide play button while its playing
            document.getElementById("replay_play").style.display = "none";
            document.getElementById("replay_play_btn").style.display = "none";
            // Show pause button
            document.getElementById("replay_pause").style.display = "";
            document.getElementById("replay_pause_btn").style.display = "";

            // Enable timer for live replay
            document.getElementById("timer").style.display = "";
            document.getElementById("stop_watch").style.display = "";

            if (sw_timer.isPaused()) {
                sw_timer.start({
                    precision: 'secondTenths',
                });
            } else {
                sw_timer.reset();
                sw_timer.start({
                    precision: 'secondTenths',
                });
            }

            pu.live_replay = function() {
                // If daily puzzles then enable time for first click, not needed for regular contests
                if (undo_len === 0 && pu.first_click) {
                    // get time-stamp (ts) of next action
                    let next_ts = pu[pu.mode.qa]["command_redo"].__a[redo_len - 1][5];

                    // initiate wait only if less than 5 seconds
                    if (next_ts <= 5000) {
                        setTimeout(pu.live_replay, next_ts);
                    } else {
                        // Fast forward the timer
                        sw_timer.reset();
                        sw_timer.start({ startValues: { seconds: next_ts / 1000 } });

                        // No waiting
                        setTimeout(pu.live_replay, 0);
                    }

                    // first click is over
                    pu.first_click = false;
                } else {
                    redo_len = pu[pu.mode.qa]["command_redo"].__a.length;
                    if (redo_len != 0) {
                        pu.redo(replay = true);
                    }
                    redo_len = pu[pu.mode.qa]["command_redo"].__a.length;

                    let speed_factor = parseFloat(document.getElementById("replay_speed").value);

                    // redo is empty when redo_len reaches 1
                    if (redo_len > 0) {
                        undo_len = pu[pu.mode.qa]["command_undo"].__a.length;

                        // get time-stamp (ts) of last action
                        let prev_ts = pu[pu.mode.qa]["command_undo"].__a[undo_len - 1][5];

                        if (sw_timer.isRunning()) {
                            // Fast forward the timer
                            sw_timer.reset();
                            sw_timer.start({ startValues: { seconds: prev_ts / 1000 } });
                        }

                        // get time-stamp (ts) of next action
                        let next_ts = pu[pu.mode.qa]["command_redo"].__a[redo_len - 1][5];

                        // time difference
                        let mseconds = next_ts - prev_ts;

                        // initiate wait
                        setTimeout(pu.live_replay, mseconds * (1 / speed_factor));
                    } else {
                        undo_len = pu[pu.mode.qa]["command_undo"].__a.length;

                        // get time-stamp (ts) of last action
                        let prev_ts = pu[pu.mode.qa]["command_undo"].__a[undo_len - 1][5];

                        if (sw_timer.isRunning()) {
                            // Fast forward the timer
                            sw_timer.reset();
                            sw_timer.start({ startValues: { seconds: prev_ts / 1000 } });
                        }

                        // replay has ended and stop the timer
                        sw_timer.stop();

                        // Show play button
                        document.getElementById("replay_play").style.display = "";
                        document.getElementById("replay_play_btn").style.display = "";
                        // Hide pause button
                        document.getElementById("replay_pause").style.display = "none";
                        document.getElementById("replay_pause_btn").style.display = "none";
                    }
                }
            }
            setTimeout(pu.live_replay, 0);
        } else {
            // Disable timer if no live replay
            document.getElementById("timer").style.display = "none";
            document.getElementById("stop_watch").style.display = "none";

            // hide all buttons
            document.getElementById("replay_play").style.display = "none";
            document.getElementById("replay_pause").style.display = "none";
            document.getElementById("replay_forward").style.display = "none";
            document.getElementById("replay_backward").style.display = "none";
            document.getElementById("replay_reset").style.display = "none";
            document.getElementById("replay_play_btn").style.display = "none";
            document.getElementById("replay_pause_btn").style.display = "none";
            document.getElementById("replay_forward_btn").style.display = "none";
            document.getElementById("replay_backward_btn").style.display = "none";
            document.getElementById("replay_reset_btn").style.display = "none";
            document.getElementById("replay_speed").style.display = "none";
            document.getElementById("replay_download_btn").style.display = "none";

            // Display message - Live replay not available for this solve.
            document.getElementById("replay_message").style.display = "";
            document.getElementById("replay_message").innerHTML = "Live Replay N/A"
        }
    } else if (document.getElementById("replay_choice").value == "1") {
        // reset live_replay function
        pu.live_replay = [];

        // Disable timer if no live replay
        sw_timer.reset();
        document.getElementById("timer").style.display = "none";
        document.getElementById("stop_watch").style.display = "none";

        // show all buttons
        document.getElementById("replay_play").style.display = "";
        document.getElementById("replay_pause").style.display = "";
        document.getElementById("replay_forward").style.display = "";
        document.getElementById("replay_backward").style.display = "";
        document.getElementById("replay_reset").style.display = "";
        document.getElementById("replay_play_btn").style.display = "";
        document.getElementById("replay_pause_btn").style.display = "";
        document.getElementById("replay_forward_btn").style.display = "";
        document.getElementById("replay_backward_btn").style.display = "";
        document.getElementById("replay_reset_btn").style.display = "";
        document.getElementById("replay_speed").style.display = "";
        document.getElementById("replay_download_btn").style.display = "";

        // hide the message
        document.getElementById("replay_message").style.display = "none";
    }
}

function replay_play() {
    if (document.getElementById("replay_choice").value == "2") {
        replay_choice();
    } else {
        // hide play button
        document.getElementById("replay_play").style.display = "none";
        document.getElementById("replay_play_btn").style.display = "none";
        // show pause button
        document.getElementById("replay_pause").style.display = "";
        document.getElementById("replay_pause_btn").style.display = "";
        let speed_factor = parseFloat(document.getElementById("replay_speed").value);
        pu.replay_timer = setInterval(() => {
            if (pu[pu.mode.qa]["command_redo"].__a.length !== 0) {
                pu.redo(replay = true);
            } else {
                clearInterval(pu.replay_timer);
                // Show play button
                document.getElementById("replay_play").style.display = "";
                document.getElementById("replay_play_btn").style.display = "";
                // Hide pause button
                document.getElementById("replay_pause").style.display = "none";
                document.getElementById("replay_pause_btn").style.display = "none";
            }
        }, 500 * (1 / speed_factor));

        if (pu.replay_timer !== pu.temp_timer) {
            clearInterval(pu.temp_timer);
        }
        pu.temp_timer = pu.replay_timer;
    }
}

function replay_pause() {
    if (document.getElementById("replay_choice").value == "2") {
        pu.live_replay = [];
        sw_timer.pause();
    } else {
        clearInterval(pu.replay_timer);
    }
    // Show play button while its paused
    document.getElementById("replay_play").style.display = "";
    document.getElementById("replay_play_btn").style.display = "";
    // Hide pause button
    document.getElementById("replay_pause").style.display = "none";
    document.getElementById("replay_pause_btn").style.display = "none";
}

function replay_reset() {
    if (document.getElementById("replay_choice").value == "2") {
        pu.live_replay = [];
        // Show play button after reset
        document.getElementById("replay_play").style.display = "";
        document.getElementById("replay_play_btn").style.display = "";
    } else {
        clearInterval(pu.replay_timer);
    }
    while (pu[pu.mode.qa]["command_undo"].__a.length !== 0) {
        pu.undo(replay = true);
    }
    pu.first_click = true;
    sw_timer.start({ startValues: { seconds: 0 } });
    sw_timer.reset();
}

function replay_backward() {
    clearInterval(pu.replay_timer);
    if (pu[pu.mode.qa]["command_undo"].__a.length !== 0) {
        pu.undo(replay = true);
    } else {
        pu.first_click = true;
    }
}

function replay_forward() {
    clearInterval(pu.replay_timer);
    if (pu[pu.mode.qa]["command_redo"].__a.length !== 0) {
        pu.redo(replay = true);
    }
}

function panel_off() {
    UserSettings.panel_shown = false;
}

function panel_toggle() {
    UserSettings.panel_shown = !UserSettings.panel_shown;
}

function panel_onoff() {
    if (UserSettings.panel_shown) {
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
        // document.getElementById('toggle_panel_visibility').style.opacity = .3;
    } else {
        document.getElementById('float-key').style.display = "none";
        // document.getElementById('toggle_panel_visibility').style.opacity = 1;
    }
    pu.redraw();
}

function can_use_lite() {
    let user_choices = getValues('mode_choices');
    return (user_choices.length > 0 || UserSettings.tab_settings.length > 0);
}

function advancecontrol_toggle() {
    let currentState = document.getElementById('tab-dropdown-lite-btn').innerText;
    if (currentState === "Disable Penpa Lite") {
        advancecontrol_onoff("off");
    } else {
        advancecontrol_onoff();
    }
}

function advancecontrol_onoff(loadtype = "new") {
    if (!can_use_lite() || loadtype === "off") {
        // Lite Version OFF, Display all the modes
        // Display the mode break line again
        document.getElementById("mode_break").style.display = "inline";
        document.getElementById("mode_txt_space").style.display = "inline";
        advancecontrol_on();
    } else {
        // Lite Version ON, so turn off extra modes
        // Remove the mode break line again
        document.getElementById("mode_break").style.display = "none";
        document.getElementById("mode_txt_space").style.display = "none";
        advancecontrol_off(loadtype);
    }
}

function advancecontrol_off(loadtype) {
    // Check for this only for first time when loading url
    var user_choices = (loadtype === "url") ? UserSettings.tab_settings : getValues('mode_choices');

    if (document.getElementById('tab-dropdown-lite-btn')) {
        document.getElementById('tab-dropdown-lite-btn').innerText = "Disable Penpa Lite";
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
    if (user_choices.indexOf("Special") === -1 &&
        user_choices.indexOf("Thermo") === -1 &&
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
    if (document.getElementById('tab-dropdown-lite-btn')) {
        document.getElementById('tab-dropdown-lite-btn').innerText = "Enable Penpa Lite";
    }
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
            if (window.navigator.msSaveBlob) {
                // for IE
                window.navigator.msSaveBlob(blob, filename);
            } else if (URL && URL.createObjectURL) {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.target = "_blank";
                downloadLink.download = filename;
                downloadLink.click();
            } else {
                Swal.fire({
                    title: 'Unsupported Browser',
                    html: 'Your browser does not appear to support the needed functionality for an SVG to be made.',
                    icon: 'error',
                    confirmButtonText: 'Close',
                });
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
        errorMsg('The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename');
    }
}

function saveimage_window() {
    var win, url;
    var downloadLink = document.getElementById('download_link');
    var address = pu.resizecanvas();
    if (document.getElementById("nb_type3").checked) { //svg
        // store in a Blob
        let blob = new Blob([address], { type: "image/svg+xml" });
        if (URL && URL.createObjectURL) {
            // create an URI pointing to that blob
            url = URL.createObjectURL(blob);
            window.open(url);
        } else {
            Swal.fire({
                title: 'Unsupported Browser',
                html: 'Your browser does not appear to support the needed functionality for an SVG to be made.',
                icon: 'error',
                confirmButtonText: 'Close',
            });
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
    document.getElementById("iostring").focus();
}

function i_url() {
    document.getElementById("modal-load").style.display = 'block';
    document.getElementById("urlstring").placeholder = "In case of \"URL too long Error\". Type/Paste Penpa-edit URL here and click on Load button. You can also load puzz.link puzzles here";
    document.getElementById("urlstring").focus();
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

function expansion_replay() {
    document.getElementById("modal-replay").style.display = 'block';
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
    update_textarea(text);
}

function savetext_solve() {
    var text = pu.maketext_solve();
    update_textarea(text);
}

function savetext_clone() {
    var text = pu.maketext_duplicate();
    if (pu.mmode === "solve") {
        text = text + "&l=solvedup";
    }
    update_textarea(text);
}

function savetext_comp() {
    var text = pu.maketext_compsolve();
    update_textarea(text);
}

function savetext_withsolution() {
    var text = pu.maketext_solve_solution();
    update_textarea(text);
    document.getElementById("modal-save2").style.display = 'none';
}

function savetext_withreplay() {
    var text = pu.maketext_replay();
    pu.isReplay = true;
    update_textarea(text);
    document.getElementById("modal-replay").style.display = 'none';
}

async function request_shortlink(url) {
    // The # content cannot be sent to server, So if anyone wants to use automatic shorten, use ?
    url = url.replace("#", "?");
    try {
        return $.get('https://tinyurl.com/api-create.php?url=' + url, function(link, status) {
            if (status === "success") {
                return link;
            }
            console.log('Error while creating tinyurl');
            return null;
        });
    } catch (error) {
        console.log('Error while creating tinyurl');
        return null;
    }
}

async function update_textarea(text) {
    let newText = text;
    if (UserSettings.shorten_links) {
        let shortened = await request_shortlink(newText);
        if (shortened && pu.isReplay) {
            shortened = shortened + "#Replay";
            pu.isReplay = false;
        }
        newText = shortened || newText;
    }

    document.getElementById("savetextarea").value = newText;
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
    infoMsg('<h2 class="info">URL is copied to clipboard</h2>');
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
    var blob = new Blob([text], { type: "text/plain" });
    saveblob_download(blob, "my_puzzle.txt");
}

function saveblob_download(blob, defaultFilename) {
    var downloadLink = document.getElementById('download_link');
    var filename = document.getElementById("savetextname").value;
    if (!filename) {
        filename = defaultFilename;
    }
    if (filename.indexOf(".") === -1) {
        filename += ".txt";
    }
    var str_sym = "\\/:*?\"<>|";
    var valid_name = 1;
    for (var i = 0; i < filename.length; i++) {
        if (str_sym.indexOf(filename[i]) != -1) {
            valid_name = 0;
        }
    }

    if (valid_name) {
        if (window.navigator.msSaveBlob) {
            // for IE
            window.navigator.msSaveBlob(blob, filename);
        } else if (URL && URL.createObjectURL) {
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.target = "_blank";
            downloadLink.download = filename;
            downloadLink.click();
        } else {
            Swal.fire({
                title: 'Unsupported Browser',
                html: 'Your browser does not appear to support the needed functionality for an SVG to be made.',
                icon: 'error',
                confirmButtonText: 'Close',
            });
        }
    } else {
        errorMsg('The characters <h2 class="warn">\\ / : * ? \" < > |</h2> cannot be used in filename');
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
    window.open('https://tinyurl.com/app', '_blank');
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
    if (UserSettings.gridtype === "sudoku" || UserSettings.gridtype === "square") {
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
    if (UserSettings.gridtype === "sudoku" || UserSettings.gridtype === "square") {
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

function import_url(urlstring) {
    urlstring = urlstring || document.getElementById("urlstring").value;
    if (urlstring !== "") {
        if (urlstring.indexOf("/penpa-edit/") !== -1) {

            let param = urlstring.split('&');
            let paramArray = [];

            // Decompose address into elements
            for (var i = 0; i < param.length; i++) {
                let paramItem = param[i].split('=');
                paramArray[paramItem[0]] = paramItem[1];
            }

            let hash = "penpa_" + md5(paramArray.p);

            // Decrypt puzzle data
            let local_data = localStorage.getItem(hash);
            if (local_data && local_data.includes('&p=')) {
                // This is to account for old links and new links together
                var url;
                if (local_data.includes("#")) {
                    url = local_data.split('#')[1];
                } else {
                    url = local_data.split('?')[1];
                }
                load(url, type = 'localstorage', origurl = paramArray.p);
            } else {
                if (urlstring.includes("#")) {
                    urlstring = urlstring.split("/penpa-edit/#")[1];
                } else {
                    urlstring = urlstring.split("/penpa-edit/?")[1];
                }
                load(urlstring, 'local');
            }

            document.getElementById("modal-load").style.display = 'none';
            if (UserSettings.tab_settings > 0) {
                selectBox.setValue(UserSettings.tab_settings);
            }
        } else if (urlstring.match(/\/puzz.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p(\.html)?\?/)) {
            decode_puzzlink(urlstring);
            document.getElementById("modal-load").style.display = 'none';
        } else {
            document.getElementById("urlstring").value = "Error: Invalid URL";
        }
    } else {
        document.getElementById("urlstring").value = "Error: Invalid URL";
    }
}

function load_feedback() {
    Swal.fire({
        title: 'Feedback',
        html: '<h2 class="info">Any suggestions or improvements, send an email to <b> penpaplus@gmail.com </b> <br> or <br> Create an issue on github <a href="https://github.com/swaroopg92/penpa-edit/issues" target="_blank">here</a> <br> or <br> Join discussions in #penpa-plus channel in the Discord Server <a href="https://discord.gg/BbN89j5" target="_blank">here</a>.</h2>',
        icon: 'info'
    })
}

function show_shortcuts() {
    document.getElementById("modal-keys").style.display = 'block';
}

function load(urlParam, type = 'url', origurl = null) {
    var param = urlParam.split('&');
    var paramArray = [];

    // Decompose address into elements
    for (var i = 0; i < param.length; i++) {
        var paramItem = param[i].split('=');
        paramArray[paramItem[0]] = paramItem[1];
    }

    if (paramArray.p && paramArray.p.substring(0, 4) === 'http') {
        create();
        import_url(paramArray.p);
        return;
    }

    // Decrypt P
    var rtext = decrypt_data(paramArray.p);
    rtext = rtext.split("\n");
    rtext[0] = rtext[0].split("zO").join("null");
    rtext[1] = rtext[1].split("zO").join("null");
    if (!isNaN(rtext[0][0])) {
        loadver1(paramArray, rtext)
        return;
    }

    // load default settings
    var rtext_para = rtext[0].split(',');
    UserSettings.gridtype = rtext_para[0];
    changetype();
    document.getElementById("nb_size1").value = rtext_para[1];
    document.getElementById("nb_size2").value = rtext_para[2];
    UserSettings.displaysize = rtext_para[3];

    var parsedSpaces = JSON.parse(rtext[1]);
    document.getElementById("nb_space1").value = parsedSpaces[0];
    document.getElementById("nb_space2").value = parsedSpaces[1];
    document.getElementById("nb_space3").value = parsedSpaces[2];
    document.getElementById("nb_space4").value = parsedSpaces[3];
    if (rtext_para[11] && rtext_para[11] == "1") { document.getElementById("nb_sudoku1").checked = true; }
    if (rtext_para[12] && rtext_para[12] == "1") { document.getElementById("nb_sudoku2").checked = true; }
    if (rtext_para[13] && rtext_para[13] == "1") { document.getElementById("nb_sudoku3").checked = true; }
    if (rtext_para[14] && rtext_para[14] == "1") { document.getElementById("nb_sudoku4").checked = true; }
    if (rtext_para[15]) {
        let ptitle = rtext_para[15].replace(/%2C/g, ',');
        ptitle = ptitle.replace(/^Title\:\s/, '');
        if (ptitle !== "Title: ") {
            document.getElementById("puzzletitle").innerHTML = ptitle;
            document.getElementById("saveinfotitle").value = ptitle;
        }
    }
    if (rtext_para[16]) {
        let pauthor = rtext_para[16].replace(/%2C/g, ',')
        pauthor = pauthor.replace(/^Author\:\s/, '');
        if (pauthor != "") {
            document.getElementById("puzzleauthor").innerHTML = pauthor;
            document.getElementById("saveinfoauthor").value = pauthor;
        }
    }
    if (rtext_para[17] && rtext_para[17] !== "") {
        document.getElementById("puzzlesourcelink").href = rtext_para[17];
        document.getElementById("puzzlesource").innerHTML = "Source";
        document.getElementById("saveinfosource").value = rtext_para[17];
    }

    make_class(rtext_para[0], 'url');
    panel_pu = new Panel();

    // Check if Replay exist
    var valid_replay = false;
    if (paramArray.r && !paramArray.r.includes("penpaerror")) {
        valid_replay = true;
    }

    UserSettings.loadFromCookies("others");

    if (rtext_para[18] && rtext_para[18] !== "") {
        document.getElementById("puzzlerules").classList.add("rules-present");
        pu.rules = rtext_para[18].replace(/%2C/g, ',').replace(/%2D/g, '<br>').replace(/%2E/g, '&').replace(/%2F/g, '=');
        document.getElementById("ruletext").innerHTML = pu.rules;
        document.getElementById("saveinforules").value = pu.rules.replace(/<br>/g, '\n');
    }

    // Border button status
    if (rtext_para[19]) {
        // to address mixed versions where the stored value was ON and OFF/ "1" and "2"
        if (rtext_para[19] === "ON" || rtext_para[19] === "1") {
            UserSettings.draw_edges = true;
        }
    }

    // multisolution status
    if (rtext_para[20] && rtext_para[20] === "true") {
        pu.multisolution = true;
    }

    // version save
    if (rtext[10]) {
        pu.version = JSON.parse(rtext[10]);
    } else {
        pu.version = [0, 0, 0]; // To handle all the old links
    }

    // custom answer check message // Moving earlier to set the value before check_solution is called for first time
    if (rtext[18] && rtext[18] !== "") {
        let custom_message = rtext[18].replace(/%2C/g, ',').replace(/%2D/g, '<br>').replace(/%2E/g, '&').replace(/%2F/g, '=');
        if (custom_message != "false") {
            document.getElementById("custom_message").value = custom_message;
        }
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

    for (var i = 0; i < pu.replace.length; i++) {
        rtext[2] = rtext[2].split(pu.replace[i][1]).join(pu.replace[i][0]);
        rtext[3] = rtext[3].split(pu.replace[i][1]).join(pu.replace[i][0]);
        rtext[4] = rtext[4].split(pu.replace[i][1]).join(pu.replace[i][0]);

        // submode, style settings
        if (rtext[11]) {
            rtext[11] = rtext[11].split(pu.replace[i][1]).join(pu.replace[i][0]);
        }

        // custom colors, only checking for 14 as 14 and 15 will appear together or never
        if (rtext[14]) {
            rtext[14] = rtext[14].split(pu.replace[i][1]).join(pu.replace[i][0]);
            rtext[15] = rtext[15].split(pu.replace[i][1]).join(pu.replace[i][0]);
        }

        // genre tags
        if (rtext[17]) {
            rtext[17] = rtext[17].split(pu.replace[i][1]).join(pu.replace[i][0]);
        }
    }
    rtext[5] = JSON.parse(rtext[5]);
    for (var i = 1; i < rtext[5].length; i++) {
        rtext[5][i] = (rtext[5][i - 1] + rtext[5][i]);
    }

    // Tab settings
    if (rtext[6]) {
        UserSettings.tab_settings = JSON.parse(rtext[6]);

        // Advance Control Setting
        // Do this only for latest version 2.25.17 and above
        // if (pu.version[0] >= 2 && pu.version[1] >= 25 && pu.version[2] >= 17) {
        if (UserSettings.tab_settings.length > 0) {
            // document.getElementById('advance_button').value = "1";
            advancecontrol_onoff("url");

            if (type.includes('local')) {
                var tabSelect = document.querySelector('ul.multi');
                var tabOptions = UserSettings.tab_settings;
                if (tabSelect) {
                    for (var child of tabSelect.children) {
                        if (!child.dataset.value) {
                            continue;
                        }

                        if (tabOptions.includes(child.dataset.value)) {
                            if (!child.classList.contains('active')) {
                                child.click();
                            }
                        } else {
                            if (child.classList.contains('active')) {
                                child.click();
                            }
                        }
                    }
                }
            }
        }
    }

    // Populate and set genre tags
    if (rtext[17]) {
        pu.user_tags = JSON.parse(rtext[17]);
    }

    // Detect tag using title information if author did not define tags
    // This is to add tags for the previously created URLs
    if (pu.user_tags.length === 0) {
        let wordsRegex = /([^\x00-\x7F]|\w)+/g;
        let title = document.getElementById("saveinfotitle").value;
        let title_words = title.match(wordsRegex);
        let allow_genres = ["arrow", "thermo", "even", "consecutive", "killer", "nonconsecutive"];

        // find position of "sudoku"
        if (title_words) {
            let sudoku_index = title_words.findIndex(element => {
                return element.toLowerCase() === "sudoku";
            });

            if (sudoku_index === 0) {
                pu.user_tags[0] = "classic";
            } else if ((sudoku_index === 1 || sudoku_index === 2) &&
                (allow_genres.includes(title_words[0].toLowerCase()))) {
                switch (title_words[0].toLowerCase()) {
                    case "consecutive":
                        if (title_words[1].toLowerCase() == "pairs") {
                            pu.user_tags[0] = "consecutivepairs";
                        } else if (title_words[1].toLowerCase() == "clone") {
                            pu.user_tags[0] = "classic";
                        } else {
                            pu.user_tags[0] = "consecutive";
                        }
                        break;
                    case "nonconsecutive":
                        pu.user_tags[0] = "nonconsecutive";
                        break;
                    default:
                        pu.user_tags[0] = "classic";
                        break;
                }
            } else if (title_words[0].toLowerCase() === "star" && title_words[1].toLowerCase() === "battle") {
                pu.user_tags[0] = "starbattle";
            } else if (title_words[0].toLowerCase() === "tomtom") {
                pu.user_tags[0] = "tomtom";
            } else if (title_words[0].toLowerCase() === "fillomino") {
                pu.user_tags[0] = "fillomino";
            } else if (title_words[0].toLowerCase() === "pentominous") {
                pu.user_tags[0] = "pentominous";
            } else if (title_words[0].toLowerCase() === "spiral" && title_words[1].toLowerCase() === "galaxies") {
                pu.user_tags[0] = "spiralgalaxies";
            } else if (title_words[0].toLowerCase() === "araf") {
                pu.user_tags[0] = "araf";
            }
        }
    }

    set_genre_tags(pu.user_tags);

    // Set some genre specific settings
    if ($('#genre_tags_opt').select2("val").includes("alphabet")) {
        UserSettings.disable_shortcuts = 2;
    }

    if (paramArray.m === "edit") { //edit_mode
        var mode = JSON.parse(rtext[2]);
        for (var i in mode) {
            for (var j in mode[i]) {
                pu.mode[i][j] = mode[i][j];
            }
        }
        pu.pu_q = JSON.parse(rtext[3]);
        pu.pu_a = JSON.parse(rtext[4]);
        if (!pu.pu_q.polygon) {
            pu.pu_q.polygon = [];
        } // not sure yet, why these lines exist
        if (!pu.pu_a.polygon) {
            pu.pu_a.polygon = [];
        }

        if (rtext[14]) {
            pu.pu_q_col = JSON.parse(rtext[14]);
            pu.pu_a_col = JSON.parse(rtext[15]);
            if (!pu.pu_q_col.polygon) {
                pu.pu_q_col.polygon = [];
            } // not sure yet, why these lines exist
            if (!pu.pu_a_col.polygon) {
                pu.pu_a_col.polygon = [];
            }
        }

        pu.centerlist = rtext[5];

        // Because class cannot be copied, its set in different way
        let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
        let undo_redo = ["command_redo", "command_undo", "command_replay"];
        for (var i of pu_qa) {
            for (var j of undo_redo) {
                if (typeof pu[i][j] != "undefined") {
                    var t = pu[i][j].__a;
                    pu[i][j] = new Stack();
                    pu[i][j].set(t);
                } else {
                    pu[i][j] = new Stack();
                }
            }
        }

        if (paramArray.l === "solvedup") { // Basically clone of solve mode
            set_solvemode(type);

            // Decrypt a
            if (paramArray.a) {
                var atext = decrypt_data(paramArray.a);

                if (pu.multisolution) {
                    pu.solution = JSON.parse(atext);
                } else {
                    pu.solution = atext;
                }

                set_solvemodetitle();
            }

            if (rtext[7] !== "undefined") {
                let starttime = rtext[7].split(":");
                if (starttime.length === 4) {
                    sw_timer.stop(); // stop previously running timer and start with stored starting time
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
                    sw_timer.stop(); // stop previously running timer and start with stored starting time
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
                    sw_timer.start({
                        precision: 'secondTenths'
                    });
                }
            } else {
                sw_timer.start({
                    precision: 'secondTenths'
                });
            }

            if (rtext[8]) {
                // set the answer check settings
                var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck");
                var answersetting = JSON.parse(rtext[8]);
                for (var i = 0; i < settingstatus.length; i++) {
                    settingstatus[i].checked = answersetting[settingstatus[i].id];
                }
            }

            if (rtext[9] && rtext[9].indexOf("comp") !== -1) { // Competitive mode
                set_contestmode();
            }
        } else {
            if (rtext[7]) {
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
        if (!pu.pu_q.polygon) {
            pu.pu_q.polygon = [];
        }

        if (rtext[14]) {
            pu.pu_q_col = JSON.parse(rtext[14]);
            if (!pu.pu_q_col.polygon) {
                pu.pu_q_col.polygon = [];
            } // not sure yet, why these lines exist
        }

        pu.centerlist = rtext[5];

        // Because class cannot be copied, its set in different way
        let pu_qa = ["pu_q", "pu_q_col"];
        let undo_redo = ["command_redo", "command_undo", "command_replay"];
        for (var i of pu_qa) {
            for (var j of undo_redo) {
                if (typeof pu[i][j] != "undefined") {
                    var t = pu[i][j].__a;
                    pu[i][j] = new Stack();
                    pu[i][j].set(t);
                } else {
                    pu[i][j] = new Stack();
                }
            }
        }

        // Decrypt a
        if (paramArray.a) {
            var atext = decrypt_data(paramArray.a);
            if (pu.multisolution) {
                pu.solution = JSON.parse(atext);
            } else {
                pu.solution = atext;
            }

            set_solvemodetitle();
        }
        if (rtext[7]) {
            // set the answer check settings
            var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck");
            var answersetting = JSON.parse(rtext[7]);
            for (var i = 0; i < settingstatus.length; i++) {
                settingstatus[i].checked = answersetting[settingstatus[i].id];
            }
        }
        if (rtext[9] && rtext[9].indexOf("comp") !== -1) { // Competitive mode
            set_contestmode();
        }
        sw_timer.start({
            precision: 'secondTenths'
        });
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

    // custom color
    if (rtext[13]) {
        let parsedValue = JSON.parse(rtext[13]);
        if (parsedValue === "true" || parsedValue === 1) {
            UserSettings.custom_colors_on = 2;
        }
    }

    // submode, style settings
    if (rtext[11]) {
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
    if (rtext[12]) {
        let view_setting_string = JSON.parse(rtext[12]);
        let view_settings = view_setting_string.split("|");

        if (view_settings[0] === 'dark') {
            UserSettings.color_theme = THEME_DARK;
        }
    }

    // answerchecking settings for "OR"
    if (rtext[16] && rtext[16] !== "") { // for some reason old links had 16th entry as empty
        // set the answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck_or");
        var answersetting = JSON.parse(rtext[16]);
        for (var i = 0; i < settingstatus.length; i++) {
            settingstatus[i].checked = answersetting[settingstatus[i].id];
        }
        if (pu.multisolution) {
            set_answer_setting_table_to('or');
            document.getElementById('or_tmp').checked = true;
        }
    }

    // Save the Puzzle URL info - used as unique id for cache saving of progress
    if (origurl) {
        pu.url = origurl;
    } else {
        pu.url = paramArray.p;
    }

    if (!valid_replay && (paramArray.m === "solve" || paramArray.l === "solvedup") && (type != "localstorage")) {
        // check for local progres
        // get md5 hash for unique id

        let hash = "penpa_" + md5(pu.url);

        // Decrypt puzzle data
        let local_data = localStorage.getItem(hash);

        if (local_data !== null) {
            var local_copy = JSON.parse(decrypt_data(local_data));
            pu.pu_q = local_copy.pu_q;
            pu.pu_a = local_copy.pu_a;
            pu.pu_q_col = local_copy.pu_q_col;
            pu.pu_a_col = local_copy.pu_a_col;

            // Because class cannot be copied, its set in different way
            let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];
            let undo_redo = ["command_redo", "command_undo", "command_replay"];
            for (var i of pu_qa) {
                for (var j of undo_redo) {
                    if (typeof pu[i][j] != "undefined") {
                        var t = pu[i][j].__a;
                        pu[i][j] = new Stack();
                        pu[i][j].set(t);
                    } else {
                        pu[i][j] = new Stack();
                    }
                }
            }
            pu.redraw();

            if (local_copy.timer) {
                let starttime = local_copy.timer.split(":");
                var puzzle_solved = sw_timer.isPaused() ? true : false;
                sw_timer.stop(); // stop previously running timer and start with stored starting time
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
                if (puzzle_solved) {
                    sw_timer.pause();
                }
            }
        }
    }

    // Enable Replay Buttons
    if (valid_replay) {
        // Decrypt Replay
        var rstr = decrypt_data(paramArray.r);
        pu.replay = true; // flag used to block mouse event on the grid

        // Because class cannot be copied, its set in different way
        pu[pu.mode.qa]["command_redo"] = new Stack();
        pu[pu.mode.qa]["command_redo"].set(JSON.parse(rstr));

        // set the mode to surface, so that no cursor is shown
        pu.mode_set("surface"); //include redraw

        // Turn Panel Off if its ON
        panel_off();

        // hide everything except grid
        document.getElementById("top_button").style.display = "none";
        document.getElementById("buttons").style.display = "none";

        let contestinfo = document.getElementById("contestinfo");
        let contents_choice = `<select name ="replay_choice" id ="replay_choice" class="replay">` +
            `<option value=1 selected="selected">Solve Path</option>` +
            `<option value=2>Live Replay</option>` +
            `</select>`;
        let contents_download = `<button id="replay_download_btn" class="replay"><i id="replay_download" class="fa fa-download replay""></i></button>`;
        let contents_play = `<div><button id="replay_play_btn" class="replay"><i id="replay_play" class="fa fa-play replay""></i></button>`;
        let contents_pause = `<button id="replay_pause_btn" class="replay"><i id="replay_pause" class="fa fa-pause replay""></i></button>`;
        let contents_reset = `<button id="replay_reset_btn" class="replay"><i id="replay_reset" class="fa fa-refresh replay""></i></button>`;
        let contents_forward = `<button id="replay_forward_btn" class="replay"><i id="replay_forward" class="fa fa-forward replay""></i></button>`;
        let contents_backward = `<button id="replay_backward_btn" class="replay"><i id="replay_backward" class="fa fa-backward replay""></i></button>`;
        let contents_speed = `<select name ="replay_speed" id ="replay_speed" class="replay">` +
            `<option value=0.5>0.5x</option>` +
            `<option value=1 selected="selected">1x</option>` +
            `<option value=1.5>1.5x</option>` +
            `<option value=2>2x</option>` +
            `<option value=2.5>2.5x</option>` +
            `<option value=3>3x</option>` +
            `<option value=5>5x</option>` +
            `<option value=10>10x</option>` +
            `</select>`;
        let contents_message = `<label id="replay_message" class="replay" style="display: none;"></label></div>`;

        // still need to define speed option
        contestinfo.innerHTML = contents_choice + contents_download + contents_play + contents_pause + contents_backward + contents_forward + contents_reset + contents_speed + contents_message;
        contestinfo.style.display = "block";

        document.getElementById("replay_speed").onchange = function() {
            replay_play();
        }

        document.getElementById("replay_choice").onchange = function() {
            replay_choice();
        }

        // Hide pause button
        document.getElementById("replay_pause").style.display = "none";
        document.getElementById("replay_pause_btn").style.display = "none";

        // Disable timer buttons
        sw_timer.reset();
        document.getElementById("timer").style.display = "none";
        document.getElementById("stop_watch").style.display = "none";
        document.getElementById("sw_start").style.display = "none";
        document.getElementById("sw_pause").style.display = "none";
        document.getElementById("sw_reset").style.display = "none";
        document.getElementById("sw_stop").style.display = "none";
        document.getElementById("sw_hide").style.display = "none";

        // Disable undo redo.
        pu.undoredo_disable = true;
        document.getElementById("bottom_button").style.display = "none";
        document.getElementById("tb_undo").style.display = "none";
        document.getElementById("tb_redo").style.display = "none";
        document.getElementById("tb_reset").style.display = "none";

        // Hide title, author, rules
        document.getElementById("puzzletitle").style.display = 'none';
        document.getElementById("puzzleauthor").style.display = 'none';
        document.getElementById("puzzlerules").classList.remove("rules-present");

        // Update title
        document.getElementById("title").innerHTML = "Replay Mode"

        // Show Solver Name and his time
        if (paramArray.q) {
            var qstr = JSON.parse(decrypt_data(paramArray.q));
            pu.puzzleinfo = qstr;
            let disptext = '';
            if (document.getElementById("saveinfotitle").value) {
                disptext += document.getElementById("saveinfotitle").value + ' | ';
            }
            if (document.getElementById("saveinfoauthor").value) {
                disptext += 'Author: ' + document.getElementById("saveinfoauthor").value + ' | ';
            }
            if (qstr.sname) {
                disptext += 'Solver: ' + qstr.sname + ' | ';
            }
            if (qstr.stime) {
                disptext += 'Time: ' + qstr.stime + " (d:h:m:s:ts)";
            }
            document.getElementById("puzzletitle").innerHTML = disptext;
            document.getElementById("puzzletitle").style.display = '';

            // Calculate Total MS for later use
            let solvetime = qstr.stime.split(':');
            // Days, Hours, Min, Seconds, 10th Seconds
            pu.puzzleinfo.totalMS = ((+solvetime[0]) * 24 * 60 * 60 + (+solvetime[1]) * 60 * 60 + (+solvetime[2]) * 60 + (+solvetime[3]) + (+solvetime[4]) * 0.1) * 1000;
        }
    }
}

function loadver1(paramArray, rtext) {
    // Load initial settings
    var rtext_para = rtext[0].split(',');

    UserSettings.gridtype = "square";
    changetype();
    document.getElementById("nb_size1").value = parseInt(rtext_para[0]);
    document.getElementById("nb_size2").value = parseInt(rtext_para[1]);
    UserSettings.displaysize = parseInt(rtext_para[2]);
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
        var rtext_qa = {
            "pu_q": rtext_q,
            "pu_a": rtext_a
        };
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
        var rtext_qa = {
            "pu_q": rtext_q
        };
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
    document.getElementById("title").innerHTML = "Solver Mode"
    document.getElementById("nb_size3_r").value = UserSettings.displaysize;
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

    // Save settings
    document.getElementById('save_settings_lb').style.display = 'none';

    // Middle Button settings not applicable in Solve mode
    document.getElementById('mousemiddle_settings_lb').style.display = 'none';
    document.getElementById('mousemiddle_settings_opt').style.display = 'none';

    // Hide Custom Answer Message
    document.getElementById('save6texttitle').style.display = 'none';
    document.getElementById('custom_message').style.display = 'none';

    // Hide Answer check Generate Button
    document.getElementById('closeBtn_save5').style.display = 'none';

    // Constraints
    document.getElementById('constraints').style.display = 'none';
    if (type.includes('local')) {
        try {
            $('select').toggleSelect2(false);
        } catch (err) {
            // pass
        }
    }
    document.getElementById('constraints_settings_opt').style.display = 'none';

    // No need of Solving URL in Solver Mode, instead show replay url
    document.getElementById('address_solve').style.display = 'none';
    document.getElementById('expansion_replay').style.display = '';
}

function set_contestmode() {
    // Disable Share, Undo/Redo buttons, IO sudoku
    document.getElementById("title").innerHTML = "Contest Mode"
    document.getElementById("savetext").style.display = "none";
    document.getElementById("input_sudoku").style.display = "none";
    document.getElementById("bottom_button").style.display = "none";
    document.getElementById("tb_undo").style.display = "none";
    document.getElementById("tb_redo").style.display = "none";
    document.getElementById("tb_reset").style.display = "none";
    document.getElementById("tb_delete").style.display = "none";
    document.getElementById("mo_move_lb").style.display = "none";
    document.getElementById("puzzlesourcelink").style.display = "none";
    document.getElementById("answer_key").innerHTML = "*Note the Solution Code, go back to <a href=" + document.getElementById("saveinfosource").value + " target=\"_blank\">Source</a> and enter in the Submissions Box*";
    pu.undoredo_disable = true;
    pu.comp = true;
}

function set_solvemodetitle() {
    var title = document.getElementById("title");
    title.innerHTML = "Solver Mode (Answer Checking Enabled)";
    title.addEventListener("click", display_answercheck);
    title.style.textDecoration = "underline";
    document.getElementById("header").classList.add("solving");
    document.getElementById("page_help").style.backgroundColor = Color.GREY_LIGHT;
}

function display_answercheck() {
    // Validate at least one answer check option is selected
    var answer_check_opt = pu.get_answercheck_settings();
    if (answer_check_opt.answercheck_opt.length === 0) {
        infoMsg('No specific option selected by Author. Answer check looks for all the elements with appropriate accepted colors. Check <a href="https://github.com/swaroopg92/penpa-edit/blob/master/images/multisolution.PNG" target="_blank">this</a> for reference.');
    } else {
        infoMsg( answer_check_opt.message);
    }
}

function isEmpty(obj) {
    return !Object.keys(obj).length;
}

function isEmptycontent(pu_qa, array, num, value) {
    for (var i in pu[pu_qa][array]) {
        if (value != null) {
            if (pu[pu_qa][array][i][num] === value) {
                return false;
            }
        } else {
            if (pu[pu_qa][array][i][num]) {
                return false;
            }
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

    if ((cols > 65) || (rows > 65)) {
        errorMsg('Penpa+ does not support grid size greater than 65 rows or columns');
        return;
    }

    // create puzzlink object
    bstr = urldata[3];
    puzzlink_pu = new Puzzlink(cols, rows, bstr);
    size = UserSettings.displaysize;

    // Set border whitespace to 0 for consistency
    document.getElementById("nb_space1").value = 0;
    document.getElementById("nb_space2").value = 0;
    document.getElementById("nb_space3").value = 0;
    document.getElementById("nb_space4").value = 0;

    function setupProblem(puzzle, mode) {
        puzzle.reset_frame(); // Draw the board
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
        puzzle.mode_set(mode); //include redraw
    }

    var info_edge, info_number, info_obj, size, puzzlink_pu,
        row_ind, col_ind, cell, value, corner_cursor,
        number_style, map_genre_tag;

    switch (type) {
        // ============ https://puzz.link/p or http://pzv.jp/p.html ============
        case "cojun":
        case "hakyukoka": // ripple alias
        case "hanare":
        case "meander":
        case "nanro":
        case "putteria":
        case "renban":
        case "ripple":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "number");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();

            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1");

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal", "Sudoku Normal"];

            // Convert the abreviated type name to the long form
            map_genre_tag = {
                hakyukoka: "ripple effect",
                hanare: "hanare-gumi",
                meander: "meandering numbers",
                renban: "renban (renban-madoguchi)",
                ripple: "ripple effect",
            };
            // Set tags
            pu.user_tags = [map_genre_tag[type] || type];
            break;
        case "onsen":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // change gridlines to dashes
            setupProblem(pu, "combi");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();

            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            // 6 has a circle background
            puzzlink_pu.drawNumbers(pu, info_number, 6, "1");

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi"); //include redraw
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['onsen'];
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
                errorMsg(`Sorry, sudoku grids of size: ${cols}x${rows} are not supported`);
                break;
            }
            setupProblem(pu, "sudoku");

            // Decode URL
            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1"); // Normal submode is 1

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("sudoku"); //include redraw
            UserSettings.tab_settings = ["Surface", "Sudoku Normal"];

            // Set tags
            pu.user_tags = ['classic'];
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

            // Display the number of stars per row and column
            pu.resize_top(1, "white");
            pu.resize_right(1, "white");
            pu.resize_bottom(1, "white");
            pu.resize_left(1, "white");
            cell = pu.nx0 * 2 + cols + 1;
            pu["pu_q"].number[cell] = [urldata[3], 1, "1"];
            pu["pu_q"].symbol[cell + 1] = [2, "star", 2];

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi"); //include redraw
            pu.subcombimode("star");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['starbattle'];
            break;
        case "building": // skyscrapers alias
        case "skyscraper": // skyscrapers alias
        case "skyscrapers":
            // Add white space for skyscraper clues
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);
            setupProblem(pu, "sudoku");

            info_number = puzzlink_pu.decodeNumber16ExCell(false);
            puzzlink_pu.drawNumbersExCell(pu, info_number, 1, "1", false);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("sudoku"); //include redraw
            UserSettings.tab_settings = ["Surface", "Sudoku Normal"];

            // Set tags
            pu.user_tags = ['skyscrapers'];
            break;
        case "akari":
        case "bijutsukan": // akari alias
        case "lightup": // akari alias
        case "shakashaka":
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
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = [type === 'shakashaka' ? 'shakashaka' : 'akari'];
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
                col_ind = parseInt(i);
                cell = pu.nx0 * 2 + 2 + col_ind + 1;
                value = info_number.outer_row[i];
                if (value !== -1 && value !== 0) {
                    corner_cursor = 4 * (cell + pu.nx0 * pu.ny0) + 2;
                    pu["pu_q"].numberS[corner_cursor] = [value.toString(), 4];
                }
            }

            // Add Outer Column
            for (var i in info_number.outer_column) {
                col_ind = parseInt(i);
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
            UserSettings.tab_settings = ["Surface", "Sudoku Normal"];

            // Set tags
            pu.user_tags = ['kakuro'];
            break;
        case "aqre":
        case "ayeheya":
        case "heyawacky": // heyawake alias
        case "heyawake":
        case "shimaguni":
        case "stostone":
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
            UserSettings.tab_settings = ["Surface"];

            // Set tags
            switch (type) {
                case "aqre":
                    pu.user_tags = ['aqre'];
                    break;
                case "ayeheya":
                    pu.user_tags = ['ayeheya (ekawayeh)'];
                    break;
                case "heyawacky":
                case "heyawake":
                    pu.user_tags = ['heyawake'];
                    break;
                case "shimaguni":
                    pu.user_tags = ['shimaguni (islands)'];
                    break;
                case "stostone":
                    pu.user_tags = ['stostone'];
                    break;
            }
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
            hide_question = type !== "nurikabe" && type !== "kurochute"
            puzzlink_pu.drawNumbers(pu, info_number, number_style, "1", hide_question);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo"); // Black square and Point
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            switch (type) {
                case "kurochute":
                    pu.user_tags = ['kurochute'];
                    break;
                case "kurodoko":
                    pu.user_tags = ['kurodoko'];
                    break;
                case "kurotto":
                    pu.user_tags = ['kurotto'];
                    break;
                case "nurikabe":
                    pu.user_tags = ['nurikabe'];
                    break;
                case "nurimisaki":
                    pu.user_tags = ['nurimisaki'];
                    break;
            }
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
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['slitherlink'];
            break;
        case "country":
        case "detour":
        case "factors":
        case "juosan":
        case "maxi":
        case "nagenawa":
        case "toichika2":
        case "yajilin-regions":
        case "yajirin-regions": // yajilin-regions alias
            if (type === "yajirin-regions") {
                type = "yajilin-regions";
            }
            pu = new Puzzle_square(cols, rows, size);
            if (type === "detour" || type === "maxi" || type === "nagenawa" || type === "juosan") {
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
                // Draw small numbers in the corner
                for (var i in info_number) {
                    // Determine which row and column
                    row_ind = parseInt(i / cols);
                    col_ind = i % cols;
                    cell = 4 * (pu.ny0 * pu.nx0 + pu.nx0 * (2 + row_ind) + 2 + col_ind);
                    pu["pu_q"].numberS[cell] = [info_number[i], 1];
                }
            }

            pu.mode_qa("pu_a");
            if (type === "yajilin-regions") {
                pu.mode_set("combi");
                pu.subcombimode("linex");
                UserSettings.tab_settings = ["Surface", "Composite"];
            } else if (type === "factors" || type === "toichika2") {
                pu.mode_set("number");
                UserSettings.tab_settings = ["Surface", "Number Normal"];
            } else if (type === "juosan") {
                pu.mode_set("wall");
                UserSettings.tab_settings = ["Surface", "Wall"];
            } else {
                pu.mode_set("combi");
                pu.subcombimode("lineox");
                UserSettings.tab_settings = ["Surface", "Composite"];
            }

            // Convert the abreviated type name to the long form
            map_genre_tag = {
                country: "country road",
                maxi: "maxi loop",
                "yajilin-regions": "regional yajilin",
            }
            // Set tags
            pu.user_tags = [map_genre_tag[type] || type];
            break;
        case "moonsun":
        case "mashu": // masyu alias
        case "masyu":
        case "pearl": // masyu alias
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
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = [type === "moonsun" ? "moon or sun" : "masyu"];
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
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['haisu'];
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
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['balanceloop'];
            break;
        case "midloop":
        case "tentaisho":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeMidloop();
            puzzlink_pu.drawMidloop(pu, info_edge);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode(type === "midloop" ? "linex" : "edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = [type === "midloop" ? "midloop" : "spiralgalaxies"];
            break;
        case "castle":
        case "hebi":
        case "snakes": // hebi alias
        case "yajikazu":
        case "yajilin":
        case "yajirin": // yajilin alias
            if (type === "yajirin") {
                type = "yajilin";
            } else if (type === "snakes") {
                type = "hebi";
            }
            // Yajikazu and some Yajilin puzzles don't shade cells
            var skip_shading = type !== "castle" && type !== "hebi";

            // Yajilin changes the url format to indicate shading or not
            if (urldata[1] === "b") {
                skip_shading = false;
                cols = parseInt(urldata[2]);
                rows = parseInt(urldata[3]);
                puzzlink_pu = new Puzzlink(cols, rows, urldata[4]);
            }
            pu = new Puzzle_square(cols, rows, size);
            if (type === "yajikazu") {
                pu.mode_grid("nb_grid2");
            }
            setupProblem(pu, "combi");

            var arrows = puzzlink_pu.decodeYajilinArrows(type === "castle");

            for (var i in arrows) {
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                var number = arrows[i][1] || (skip_shading ? "?" : "");

                // Not all numbers have arrows
                if (arrows[i][0] !== 0 && number) {
                    switch (arrows[i][0]) {
                        case 1: // up
                            number += "_" + 0;
                            break;
                        case 2: // down
                            number += "_" + 3;
                            break;
                        case 3: // left
                            number += "_" + 1;
                            break;
                        case 4: // right
                            number += "_" + 2;
                            break;
                    }
                }

                if (skip_shading) {
                    pu["pu_q"].number[cell] = [number, 1, "2"];
                    continue;
                }

                // Add arrow and number
                var shading = type === "hebi" ? 2 : arrows[i][2];
                pu["pu_q"].number[cell] = [number, shading === 2 ? 7 : 1, "2"];

                // Background shading
                if (shading === 0) { // Light gray background
                    pu["pu_q"].surface[cell] = 3;
                } else if (shading === 2) { // Black background
                    pu["pu_q"].surface[cell] = 4;
                }

                var cell_edges = [
                    [pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind, pu.nx0], // Left
                    [pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 2 + col_ind, pu.nx0], // Right
                    [pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind, 1], // Above
                    [pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 1 + col_ind, 1], // Below
                ];

                // Borders
                for (var e of cell_edges) {
                    edgex = e[0];
                    edgey = e[0] + e[1];
                    var key = edgex.toString() + "," + edgey.toString();

                    if (key in pu.pu_q.lineE) {
                        if (type === "castle") {
                            // Only remove the edge if the adjacent cell is the same shading (castle only)
                            var adjacent = cell - (pu.nx0 + 1 - e[1]);
                            if (pu.pu_q.surface[cell] === pu.pu_q.surface[adjacent]) {
                                delete pu.pu_q.lineE[key];
                                pu.pu_q.deletelineE[key] = 1;
                            }
                        } else {
                            delete pu.pu_q.lineE[key];
                        }
                    } else {
                        pu.pu_q.lineE[key] = 2;
                    }
                }
            }

            pu.mode_qa("pu_a");
            if (type === "yajikazu") {
                pu.mode_set("surface");
                UserSettings.tab_settings = ["Surface"];
            } else if (type === "hebi") {
                pu.mode_set("number");
                UserSettings.tab_settings = ["Surface", "Number Normal"];
            } else {
                pu.mode_set("combi");
                pu.subcombimode("linex");
                UserSettings.tab_settings = ["Surface", "Composite"];
            }

            // Convert the abreviated type name to the long form
            map_genre_tag = {
                castle: "castlewall",
                yajikazu: "yajikazu (yajisan-kazusan)",
                hebi: "hebi-ichigo",
            }
            // Set tags
            pu.user_tags = [map_genre_tag[type] || type];
            break;
        case "tapa":
        case "tapaloop":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = type === "tapa" ?
                puzzlink_pu.decodeTapa() :
                puzzlink_pu.decodeTapaLoop();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "4", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode(type === "tapa" ? "blpo" : "lineox");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            switch (type) {
                case "tapa":
                    pu.user_tags = ['tapa'];
                    break;
                case "tapaloop":
                    pu.user_tags = ['tapalikeloop'];
                    break;
            }
            break;
        case "fillomino":
        case "fillomino01": // fillomino alias
        case "symmarea":
        case "view":
            pu = new Puzzle_square(cols, rows, size);
            if (type !== "view") {
                pu.mode_grid("nb_grid2"); // Dashed grid lines
            }
            setupProblem(pu, "number");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Edge Normal", "Number Normal"];

            // Set tags
            switch (type) {
                case "fillomino":
                case "fillomino01":
                    pu.user_tags = ['fillomino'];
                    break;
                case "symmarea":
                    pu.user_tags = ['symmetry area'];
                    break;
                case "view":
                    pu.user_tags = ['view'];
                    break;
            }
            break;
        case "araf":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 6, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Edge Normal", "Composite"];

            // Set tags
            pu.user_tags = ['araf'];
            break;
        case "compass":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawCompassNumbers(pu, info_number, 1);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Edge Normal", "Composite"];

            // Set tags
            pu.user_tags = ['compass'];
            break;
        case "nonogram":
            var max_cols_offset = Math.ceil(cols / 2);
            var max_rows_offset = Math.ceil(rows / 2);

            info_number = puzzlink_pu.decodeNumber16();
            var cols_offset = 0,
                rows_offset = 0;

            for (var i in info_number) {
                if (i < max_rows_offset * cols) {
                    rows_offset = Math.max(rows_offset, parseInt(i % max_rows_offset) + 1);
                } else {
                    cols_offset = Math.max(cols_offset, parseInt((i - max_rows_offset * cols) % max_cols_offset) + 1);
                }
            }

            document.getElementById("nb_space1").value = rows_offset;
            document.getElementById("nb_space3").value = cols_offset;

            pu = new Puzzle_square(cols + cols_offset, rows + rows_offset, size);
            setupProblem(pu, "combi");

            // Draw numbers
            for (i in info_number) {
                if (i < max_rows_offset * cols) { // Top section
                    row_ind = rows_offset - i % max_rows_offset - 1;
                    col_ind = cols_offset + parseInt(i / max_rows_offset);
                } else { // Left section
                    row_ind = rows_offset + parseInt((i - max_rows_offset * cols) / max_cols_offset);
                    col_ind = cols_offset - (i - max_rows_offset * cols) % max_cols_offset - 1;
                }
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].number[cell] = [info_number[i], 1, "1"];
            }

            // Draw vertical edges
            for (i = cols_offset - 1; i < cols + cols_offset + 5; i += 5) {
                col_ind = Math.min(cols + cols_offset - 1, i);
                var edge_style = 13; // Fat dots
                if (col_ind === cols_offset - 1 || col_ind === cols + cols_offset - 1) {
                    edge_style = 2; // Black normal
                }
                for (row_ind = 0; row_ind < rows + rows_offset; row_ind++) {
                    var edgex = pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind + 1;
                    var edgey = edgex + pu.nx0;
                    var key = edgex.toString() + "," + edgey.toString();
                    pu["pu_q"]["lineE"][key] = edge_style;
                }
            }

            // Draw horizontal edges
            for (var i = rows_offset - 1; i < rows + rows_offset + 5; i += 5) {
                row_ind = Math.min(rows + rows_offset - 1, i);
                var edge_style = 13; // Fat dots
                if (row_ind === rows_offset - 1 || row_ind === rows + rows_offset - 1) {
                    edge_style = 2; // Black normal
                }
                for (col_ind = 0; col_ind < cols + cols_offset; col_ind++) {
                    var edgex = pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 1 + col_ind;
                    var edgey = edgex + 1;
                    var key = edgex.toString() + "," + edgey.toString();
                    pu["pu_q"]["lineE"][key] = edge_style;
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['nonogram'];
            break;
        case "bag": // cave alias
        case "cave":
        case "corral": // cave alias
        case "correl": // cave alias
        case "mochikoro":
        case "mochinyoro":
        case "nuribou":
            if (type === "bag" || type === "corral" || type === "correl") {
                type = "cave";
            }
            pu = new Puzzle_square(cols, rows, size);
            if (type === "cave") {
                pu.mode_grid("nb_grid2"); // Dashed gridlines
                pu.mode_grid("nb_out2"); // No outside frame
            }
            setupProblem(pu, "surface");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = [type];
            break;
        case "lits":
        case "norinori":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            switch (type) {
                case "lits":
                    pu.user_tags = ['lits'];
                    break;
                case "norinori":
                    pu.user_tags = ['norinori'];
                    break;
            }
            break;
        case "hashikake":
        case "hashi": // hashikake alias
        case "bridges": // hashikake alias
            pu = new Puzzle_square(cols, rows, size);

            // Don't draw any of the grid
            pu.mode_grid("nb_grid3");
            pu.mode_grid("nb_lat2");
            pu.mode_grid("nb_out2");

            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 6, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("hashi");
            UserSettings.tab_settings = ["Surface", "Edge Normal", "Composite"];

            // Set tags
            pu.user_tags = ['hashiwokakero (hashi/bridges)'];
            break;
        case "pencils":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2");
            setupProblem(pu, "lineE");

            var url_index = 0,
                index = 0;
            while (url_index < bstr.length) {
                var layer_key = null;
                var value;
                var edge = false;

                var char = bstr[url_index];
                var number = puzzlink_pu.readNumber16(char, url_index);

                if (number[0] !== -1) {
                    layer_key = "number";
                    value = [number[0], 1, "1"];
                    url_index += number[1];
                } else if (char >= "k" && char <= "z") {
                    url_index++;
                    index += parseInt(char, 36) - 19;
                } else if (char >= "g" && char <= "j") {
                    layer_key = "symbol";
                    url_index++;
                    edgex = edgey = 0;
                    if (char === "g") { // Pencil points up
                        value = [2, "pencils", 1];
                        edgex = pu.nx0;
                        edgey = pu.nx0 + 1;
                    } else if (char === "h") { // Pencil points down
                        value = [4, "pencils", 1];
                        edgex = 0;
                        edgey = 1;
                    } else if (char === "i") { // Pencil points left
                        value = [1, "pencils", 1];
                        edgex = 1;
                        edgey = 1 + pu.nx0;
                    } else if (char === "j") { // Pencil points right
                        value = [3, "pencils", 1];
                        edgex = 0;
                        edgey = pu.nx0;
                    }
                    edge = true;
                } else {
                    url_index++;
                }

                if (layer_key !== null) {
                    row_ind = parseInt(index / cols);
                    col_ind = index % cols;
                    cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                    pu["pu_q"][layer_key][cell] = value;
                    index++;
                    if (edge) { // Mark edges of pencils
                        edgex += pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind;
                        edgey += pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind;
                        edge = edgex.toString() + "," + edgey.toString();
                        pu["pu_q"].lineE[edge] = 2;
                    }
                }
            }

            pu.mode_qa("pu_a");
            pu.subcombimode("linex");
            pu.subsymbolmode("pencils");
            pu.mode_set("lineE");
            UserSettings.tab_settings = ["Edge Normal", "Shape", "Composite"];

            // Set tags
            pu.user_tags = ['pencils'];
            break;
        case "easyasabc":
            // Add whitespace
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            bstr = urldata[4];
            puzzlink_pu = new Puzzlink(cols, rows, bstr);
            pu = new Puzzle_square(cols + 2, rows + 2, size);
            setupProblem(pu, "number");

            info_number = puzzlink_pu.decodeNumber16ExCell(false);
            // Turn numbers 1-5 to A-E, etc.
            var string_map = "0ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
            for (var i in info_number) {
                info_number[i] = string_map[info_number[i]] || info_number[i];
            }
            puzzlink_pu.drawNumbersExCell(pu, info_number, 1, "1", false);

            // Draw range of allowed letters
            pu.resize_top(1, "white");
            number = parseInt(urldata[3]);
            pu["pu_q"].number[pu.nx0 * 2 + cols + 2] = [`(A-${string_map[number] || number})`, 1, "8"];

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal"];

            // Set tags
            pu.user_tags = ['easy as abc'];
            break;
        case "tents":
            // Add whitespace
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16ExCell(true);
            puzzlink_pu.drawNumbersExCell(pu, info_number, 1, "1", false);

            info_number = puzzlink_pu.decodeNumber2();
            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (3 + row_ind) + 3 + col_ind;
                pu["pu_q"].symbol[cell] = [1, "tents", 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("tents");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['tents'];
            break;
        case "snake":
            // Add whitespace
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);
            setupProblem(pu, "combi");

            // Add snake ends
            info_number = puzzlink_pu.decodeNumber3(Math.ceil(cols * rows / 3));
            for (i in info_number) {
                if (info_number[i] === 0) {
                    continue;
                }
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (3 + row_ind) + 3 + col_ind;
                pu["pu_q"].symbol[cell] = [info_number[i], "circle_L", 1];
            }

            // Add outside clues
            info_number = puzzlink_pu.decodeNumber16ExCell(true);
            puzzlink_pu.drawNumbersExCell(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['snake'];
            break;
        case "geradeweg":
        case "numlin": // numberlink alias
        case "numberlink":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            var style = type === "geradeweg" ? 6 : 1;
            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, style, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            switch (type) {
                case "geradeweg":
                    pu.user_tags = ['geradeweg'];
                    break;
                case "numlin":
                case "numberlink":
                    pu.user_tags = ['numberlink'];
                    break;
            }
            break;
        case "simpleloop":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber2Binary();
            for (i in info_number) {
                if (info_number[i] === 0) {
                    continue;
                }
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 4;
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['simple loop'];
            break;
        case "nurimaze":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            info_obj = puzzlink_pu.decodeNurimaze();
            puzzlink_pu.drawNumbers(pu, info_obj.number_list, 1, "1");

            // Draw triangles and circles
            for (i in info_obj.shape_list) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                if (info_obj.shape_list[i] === "o") {
                    pu["pu_q"].symbol[cell] = [1, "circle_M", 1];
                } else {
                    pu["pu_q"].symbol[cell] = [1, "triup_M", 1];
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['nurimaze'];
            break;
        case "kropki":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "number");

            info_number = puzzlink_pu.decodeNumber3();
            for (i in info_number) {
                if (!info_number[i]) {
                    continue;
                }

                if (i < (cols - 1) * rows) {
                    row_ind = parseInt(i / (cols - 1));
                    col_ind = i % (cols - 1);
                    cell = 3 * pu.nx0 * pu.ny0 + pu.nx0 * (row_ind + 2) + col_ind + 2;
                } else {
                    var tmp = i - (cols - 1) * rows;
                    row_ind = parseInt(tmp / cols);
                    col_ind = tmp % cols;
                    cell = 2 * pu.nx0 * pu.ny0 + pu.nx0 * (row_ind + 2) + col_ind + 2;
                }
                pu["pu_q"].symbol[cell] = [info_number[i], "circle_SS", 2];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal", "Sudoku Normal"];
            pu.user_tags = ['kropki']; // Genre Tags
            break
        case "firefly":
            // Outside padding
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);

            pu.mode_grid("nb_grid2"); // Dashed gridlines
            pu.mode_grid("nb_out2"); // No grid frame
            setupProblem(pu, "combi");

            // Firefly puzzles use the same encoding as Yajilin
            var firefly = puzzlink_pu.decodeYajilinArrows();
            // But puzzlink lists the directions differently than Penpa does
            var direction_map = [5, 4, 2, 3, 1];

            for (var i in firefly) {
                row_ind = 2 + parseInt(i / cols);
                col_ind = 2 + i % cols;
                cell = pu.nx0 * pu.ny0 + pu.nx0 * row_ind + col_ind;

                pu["pu_q"].symbol[cell] = [direction_map[firefly[i][0]], "firefly", 2];
                pu["pu_q"].number[cell] = [firefly[i][1], 1, "1"];
            }

            pu.mode_qa("pu_a");
            pu.subcombimode("edgex");
            pu.mode_set("combi");
            UserSettings.tab_settings = ["Edge Normal", "Composite"];
            pu.user_tags = ['firefly (hotaru beam)']; // Genre Tags
            break
        case "gokigen":
            // Outside padding
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);

            pu.mode_grid("nb_grid2"); // Dashed gridlines
            pu.mode_grid("nb_out2"); // No grid frame
            setupProblem(pu, "lineE");

            info_number = puzzlink_pu.decodeNumber4();

            for (var i in info_number) {
                row_ind = 2 + parseInt(i / (cols + 1));
                col_ind = 2 + i % (cols + 1);
                cell = pu.nx0 * pu.ny0 + pu.nx0 * row_ind + col_ind;
                value = info_number[i] === "?" ? " " : info_number[i];
                pu["pu_q"].number[cell] = [value, 6, "1"];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("lineE");
            pu.submode_check("sub_lineE2");
            UserSettings.tab_settings = ["Edge Diagonal"];
            pu.user_tags = ['slant (gokigen)']; // Genre Tags
            break
        case "ringring":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            // RingRing encoding is very close to puzzlink_pu.decodeNumber2() but slightly different
            i = -1;
            for (char of bstr) {
                if (("0" <= char && char <= "9") ||
                    ("a" <= char && char <= "z")) {
                    i += parseInt(char, 36) + 1;
                } else if (char === ".") {
                    i += 36;
                    continue;
                }

                if (i >= cols * rows) {
                    break;
                }

                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (row_ind + 2) + (col_ind + 2);
                pu["pu_q"].surface[cell] = 4;
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Edge Normal", "Composite"];
            pu.user_tags = ['ring-ring']; // Genre Tags
            break;
        case "doubleback":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            info_number = puzzlink_pu.decodeNumber2Binary();
            for (var i in info_number) {
                if (!info_number[i]) {
                    continue;
                }
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 4;
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Edge Normal", "Composite"];
            pu.user_tags = ['double back']; // Genre Tags
            break;
        case "yinyang":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber3();
            // Draw the circles
            for (i in info_number) {
                if (info_number[i] === 0) {
                    continue;
                }
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].symbol[cell] = [info_number[i], "circle_M", 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blwh");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ['yin-yang']; // Genre Tags
            break;
        case "hitori":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            info_number = puzzlink_pu.decodeNumber36(cols * rows);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = ['hitori']; // Genre Tags
            break;
        case "aho":
        case "shikaku":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 7, "1", true);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = [type]; // Genre tags
            break;
        case "fillmat":
        case "lookair":
        case "usotatami":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber10();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            // Change to Solution Tab
            pu.mode_qa("pu_a");

            if (type === "lookair") {
                pu.mode_set("surface");
                UserSettings.tab_settings = ["Surface"];
            } else {
                pu.mode_set("combi");
                pu.subcombimode("edgesub");
                UserSettings.tab_settings = ["Surface", "Composite"];
            }

            pu.user_tags = [type]; // Genre tags
            break;
        case "paintarea":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber10();

            puzzlink_pu.drawBorder(pu, info_edge, 2);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = ["paintarea"]; // Genre tags
            break;
        case "sukoro":
        case "sukororoom":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "number");

            if (type === "sukororoom") {
                info_edge = puzzlink_pu.decodeBorder();
                puzzlink_pu.drawBorder(pu, info_edge, 2);
            }

            info_number = puzzlink_pu.decodeNumber10();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal", "Sudoku Normal"];
            pu.user_tags = [type]; // Genre tags
            break;
        case "usoone":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber4();

            puzzlink_pu.drawBorder(pu, info_edge, 2);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            pu.subcombimode("lineox"); // Allow user to circle/cross out liars
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["usoone"];
            break;
        case "scrin":
            pu = new Puzzle_square(cols, rows, size);
            // Draw grid dots only
            pu.mode_grid("nb_grid3");
            pu.mode_grid("nb_lat1");
            pu.mode_grid("nb_out2");

            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 6, "1", true);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["scrin"];
            break;
        case "tasquare":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", true);

            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].symbol[cell] = [1, "square_L", 1]; // Large square
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ['tasquare'];
            break;
        case "mines":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", true);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("mines");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = ['minesweeper']; // Set tags
            break;
        case "ichimaga":
        case "ichimagam":
        case "ichimagax":
            pu = new Puzzle_square(cols - 1, rows - 1, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            pu.mode_grid("nb_out2"); // No grid border
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber4();

            for (i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;

                cell = pu.nx0 * pu.ny0 + (pu.nx0 * (1 + row_ind) + 1 + col_ind);
                value = info_number[i] === "?" ? " " : info_number[i];
                pu["pu_q"].number[cell] = [value, 6, "1"];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Convert the abreviated type name to the long form
            map_genre_tag = {
                ichimaga: "ichimaga",
                ichimagam: "ichimagam (magnetic ichimaga)",
                ichimagax: "ichimagamx (crossing ichimaga)",
            }
            pu.user_tags = [map_genre_tag[type]]; // Set tags
            break;
        case "nawabari":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber10();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = ["territory (nawabari)"]; // Set tags
            break;
        case "dbchoco":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            pu.mode_grid("nb_lat1"); // Grid Points
            setupProblem(pu, "combi");

            // Add shading
            info_number = puzzlink_pu.decodeNumber2Binary(cols * rows);
            for (let i in info_number) {
                if (!info_number[i]) {
                    continue;
                }
                row_ind = parseInt(i / cols);
                col_ind = i % cols;

                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 3;
            }

            // Add Numbers
            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = ["double choco"]; // Set tags
            break;
        case "tateyoko":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeTateyoko();
            for (let i in info_number) {
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

                value = info_number[i];
                style = value[1] ? 4 : 1; // Use white or black text to contrast the background
                pu["pu_q"].number[cell] = [value[0], style, "1"];

                if (value[1]) {
                    pu["pu_q"].surface[cell] = 4; // Background shading
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("wall");
            UserSettings.tab_settings = ["Surface", "Wall"];

            pu.user_tags = ["tatebo-yokobo"]; // Set tags
            break;
            // ============ https://pzprxs.vercel.app/p ============
        case "canal":
        case "cbanana":
        case "tontti":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");

            // Set controls and tags
            switch (type) {
                case "canal":
                    pu.mode_set("combi");
                    pu.subcombimode("blpo");
                    UserSettings.tab_settings = ["Surface", "Composite"];
                    pu.user_tags = ["canal view"];
                    break;
                case "cbanana":
                    pu.mode_set("surface");
                    UserSettings.tab_settings = ["Surface"];
                    pu.user_tags = ["choco banana"];
                    break;
                case "tontti":
                    pu.mode_set("line");
                    pu.submode_check("sub_line5"); // Middle submode
                    UserSettings.tab_settings = ["Surface", "Line Middle"];
                    pu.user_tags = ["tonttiraja"];
                    break;
            }
            break;
        case "dotchi":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            // Draw Circles
            info_number = puzzlink_pu.decodeNumber3();
            for (i in info_number) {
                if (info_number[i] === 0) {
                    continue;
                }
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].symbol[cell] = [info_number[i], "circle_L", 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["dotchi-loop"];
            break;
        case "chainedb":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 4, "1", false);

            // Draw black behind numbers
            for (i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 4;
            }

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = ["chained block"];
            break;
        case "oneroom":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16();
            info_number = puzzlink_pu.moveNumbersToRegionCorners(info_edge, info_number);

            puzzlink_pu.drawBorder(pu, info_edge, 2);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("surface"); //include redraw
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = ["one room one door"];
            break;
        case "rassi":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            // Shade marked cells
            info_number = puzzlink_pu.decodeNumber2Binary();
            for (var i in info_number) {
                if (!info_number[i]) {
                    continue;
                }
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 4;
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("rassisillai");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["rassi silai"]; // Genre Tags
            break;
        default:
            errorMsg('It currently does not support puzzle type: ' + type);
            break;
    }

    // Set PenpaLite
    // document.getElementById('advance_button').value = "1";
    document.getElementById("mode_break").style.display = "none";
    document.getElementById("mode_txt_space").style.display = "none";
    advancecontrol_off("url");

    var tabSelect = document.querySelector('ul.multi');
    var tabOptions = UserSettings.tab_settings;
    if (tabSelect) {
        for (var child of tabSelect.children) {
            if (!child.dataset.value) {
                continue;
            }

            if (tabOptions.includes(child.dataset.value)) {
                if (!child.classList.contains('active')) {
                    child.click();
                }
            } else {
                if (child.classList.contains('active')) {
                    child.click();
                }
            }
        }
    }

    // Redraw the grid
    pu.redraw();

    // Set the Source
    document.getElementById("saveinfosource").value = url;
    // Set the tags
    set_genre_tags(pu.user_tags);
}

function encrypt_data(puzdata) {
    var u8text = new TextEncoder().encode(puzdata);
    var deflate = new Zlib.RawDeflate(u8text);
    var compressed = deflate.compress();
    var char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
    return window.btoa(char8);
}

function decrypt_data(puzdata) {
    var ab = atob(puzdata);
    ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
    var inflate = new Zlib.RawInflate(ab);
    var plain = inflate.decompress();
    let decrypted = new TextDecoder().decode(plain);
    return decrypted;
}

function hide_element_by_id(s) {
    let element = document.getElementById(s);
    element.parentElement.style.contentVisibility = 'hidden';
}