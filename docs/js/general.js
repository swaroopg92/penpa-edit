function errorMsg(html) {
    Swal.fire({
        title: Identity.errorTitle,
        html: html,
        icon: 'error',
        confirmButtonText: Identity.okButtonText,
    })
}

function infoMsg(html) {
    Swal.fire({
        title: Identity.infoTitle,
        html: html,
        icon: 'info',
        confirmButtonText: Identity.okButtonText,
    })
}

async function boot() {
    var obj = document.getElementById("dvique");
    var canvas = document.createElement("canvas");
    canvas.id = "canvas";
    obj.appendChild(canvas);
    boot_parameters();
    init_genre_tags();
    set_answer_setting_table_to("and");
    set_input_patterns();

    var urlParam = location.search.substring(1);
    if ((!urlParam || !urlParam.includes("p=")) && location.hash) {
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


        if (paramArray.p) {
            // Decrypt puzzle data
            const hash = PenpaProgress.getHash(paramArray.p);
            let local_data = await PenpaProgress.tryLoad(hash);

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
    } else {
        create();
    }
}

function boot_parameters() {
    set_default_sudoku_board_options();
}

function set_default_sudoku_board_options() {
    UserSettings.gridtype = "sudoku";
    UserSettings.displaysize = 38;
    document.getElementById("gridtype").value = "sudoku";
    var size = Number(UserSettings.start_grid_size || 9);
    document.getElementById("nb_size1").value = size;
    document.getElementById("nb_size2").value = size;
    document.getElementById("nb_size3").value = 38;
    document.getElementById("nb_space1").value = 0;
    document.getElementById("nb_space2").value = 0;
    document.getElementById("nb_space3").value = 0;
    document.getElementById("nb_space4").value = 0;
    document.getElementById("nb_sudoku1").checked = false;
    document.getElementById("nb_sudoku2").checked = false;
    document.getElementById("nb_sudoku3").checked = false;
    document.getElementById("nb_sudoku4").checked = false;
    document.getElementById("nb_sudoku5").checked = (size === 6);
    document.getElementById("nb_sudoku6").checked = false;
    document.getElementById("nb_sudoku8").checked = false;
    changetype();
}

function create() {
    UserSettings.loadFromCookies("gridtype_size");
    set_default_sudoku_board_options();

    gridtype = UserSettings.gridtype;

    pu = make_class(gridtype);
    pu.reset_frame();

    // Drawing Panel
    panel_pu = new Panel();
    panel_pu.draw_panel();
    pu.mode_set("sudoku"); //include redraw

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
    SudokuTools.init();
    if (UserSettings.start_grid_type === "generated") {
        var size = Number(UserSettings.start_grid_size || 9);
        window.setTimeout(function() {
            if (typeof SudokuTools !== "undefined" && typeof SudokuTools.generatePuzzle === "function") {
                SudokuTools.generatePuzzle(size, ["classic"], null, null);
            }
        }, 50);
    }
}

function add_constraints() {
    let constraints = document.getElementById('constraints_settings_opt');
    let selected = constraints.value || "classic";
    constraints.innerHTML = "";
    let implemented = penpa_constraints.implemented_sudoku || ["classic"];
    let orderedGroups = [
        { label: "Available", variants: implemented },
        {
            label: "Planned",
            variants: penpa_constraints.options.sudoku.filter(function(variant) {
                return !implemented.includes(variant);
            })
        }
    ];
    orderedGroups.forEach(function(group) {
        let optgroup = document.createElement("optgroup");
        optgroup.label = group.label;
        group.variants.forEach(function(variant) {
            let opt = document.createElement("option");
            opt.value = variant;
            opt.textContent = variant.replace(/\b\w/g, function(letter) { return letter.toUpperCase(); });
            optgroup.appendChild(opt);
        });
        constraints.appendChild(optgroup);
    });
    constraints.value = penpa_constraints['options']['sudoku'].includes(selected) ? selected : "classic";
}

function init_genre_tags() {
    let genre_tags = document.getElementById('genre_tags_opt');
    genre_tags.replaceChildren();
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
        placeholder: PenpaText.get('search_area'),
        'width': "90%"
    });

    // // to access each option
    // $("#genre_tags_opt option").each(function() {
    //     console.log($(this));
    // });
}

function set_genre_tags(user_tags, callid = 'none') {
    $('#genre_tags_opt').val(user_tags);
    $('#genre_tags_opt').trigger("change", [callid]); // Update selection
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
    invisible.forEach((elem) => {
        elem.checked = false
    });

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

        // reset the penpa lite states
        advancecontrol_toggle("off");

        // update mode defaults for special grids
        if (!(gridtype === "square" || gridtype === "sudoku" || gridtype === "kakuro")) {
            pu.mode["pu_q"]["combi"] = ["linex", ""];
            pu.mode["pu_a"]["combi"] = ["linex", ""];
            pu.mode["pu_q"]["symbol"] = ["circle_L", 1];
            pu.mode["pu_a"]["symbol"] = ["circle_L", 1];
        }

        // Update mode states for grid type having unavailable sub modes
        for (let q of ["pu_q", "pu_a"]) {
            for (let mode in pu.mode[q]) {
                const submode = `${mode}${pu.mode[q][mode][0]}`;
                // A valid but unavailable sub mode
                if (penpa_modes["square"].sub.includes(submode) && !penpa_modes[pu.gridtype].sub.includes(submode)) {
                    // Replace state with first sub mode which is available for this grid type
                    let newsub = penpa_modes[pu.gridtype].sub.find(s => s.startsWith(mode));
                    if (newsub) {
                        pu.mode[q][mode][0] = newsub.substring(mode.length);
                    }
                }
            }
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
        errorMsg(PenpaText.get('display_size_warning'))
    }
    SudokuTools.resetForNewGrid();
}

function set_display_labels(gridtype) {
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
    var type6 = ["nb_penrose1_lb", "nb_penrose1", "nb_penrose2_lb", "nb_penrose2", "nb_penrose2_sl"]; // on - penrose
    var type7 = ["name_space2", "nb_space2"]; // enable for triangle cut corners

    switch (gridtype) {
        case "square":
            for (var i of [...type, ...type2, ...type3]) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of [...type4, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            break;
        case "tri":
            for (var i of [...type, ...type4, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of [...type2, ...type3, ...type7]) {
                document.getElementById(i).style.display = "inline";
            }
            break;
        case "hex":
        case "pyramid":
            for (var i of [...type, ...type4, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of [...type2, ...type3]) {
                document.getElementById(i).style.display = "inline";
            }
            break;
        case "iso":
            for (var i of [...type, ...type2, ...type4, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            break;
        case "sudoku":
            for (var i of [...type, ...type2, ...type3, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type4) {
                document.getElementById(i).style.display = "inline";
            }
            break;
        case "kakuro":
            for (var i of [...type, ...type2, ...type3, ...type4, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type5) {
                document.getElementById(i).style.display = "inline";
            }
            break;
        case "tetrakis_square":
        case "truncated_square":
        case "snub_square":
        case "cairo_pentagonal":
        case "rhombitrihexagonal":
        case "deltoidal_trihexagonal":
            for (var i of [...type, ...type2, ...type4, ...type6]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type3) {
                document.getElementById(i).style.display = "inline";
            }
            break;
        case "penrose_P3":
            for (var i of [...type, ...type2, ...type3, ...type4]) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of [...type5, ...type6]) {
                document.getElementById(i).style.display = "inline";
            }
            break;
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
        'deltoidal': 20,
        'penrose': 20
    }; // also defined in class_p.js
    set_display_labels(gridtype)
    switch (gridtype) {
        case "square":
            var nx = parseInt(document.getElementById("nb_size1").value, 10);
            var ny = parseInt(document.getElementById("nb_size2").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            var space2 = parseInt(document.getElementById("nb_space2").value, 10);
            var space3 = parseInt(document.getElementById("nb_space3").value, 10);
            var space4 = parseInt(document.getElementById("nb_space4").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku_lb_square');
            if (nx <= gridmax['square'] && nx > 0 && ny <= gridmax['square'] && ny > 0 && space1 + space2 < ny && space3 + space4 < nx) {
                pu = new Puzzle_square(nx, ny, size);
            } else {
                errorMsg(PenpaText.get('size_warning_square', gridmax['square']));
            }
            break;
        case "hex":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_hex');
            if (n0 <= gridmax['hex'] && n0 > 0 && space1 < n0) {
                pu = new Puzzle_hex(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['hex']));
            }
            break;
        case "tri":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_tri');
            if (n0 <= gridmax['tri'] && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_tri(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['tri']));
            }
            break;
        case "pyramid":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_pyramid');
            if (n0 <= gridmax['pyramid'] && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_pyramid(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['pyramid']));
            }
            break;
        case "iso":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['cube'] && n0 > 0) {
                pu = new Puzzle_iso(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['cube']));
            }
            break;
        case "sudoku":
            if (loadtype === 'new') {
                var requestedSudokuSize = Number(window.sudotokuNewGridSize);
                if ([6, 7, 8, 9].indexOf(requestedSudokuSize) === -1) {
                    requestedSudokuSize = 0;
                }
                if (document.getElementById("nb_sudoku2").checked === true) { // Outside, little killer
                    if (requestedSudokuSize) {
                        var nx = requestedSudokuSize + 2;
                        var ny = requestedSudokuSize + 2;
                    } else if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
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
                    if (requestedSudokuSize) {
                        var nx = requestedSudokuSize + 1;
                        var ny = requestedSudokuSize + 1;
                    } else if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
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
                    if (requestedSudokuSize) {
                        var nx = requestedSudokuSize;
                        var ny = requestedSudokuSize;
                    } else if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
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
                    if (requestedSudokuSize === 7) {
                        rows = [3, 4, 5, 6, 7, 8];
                        cols = [];
                    } else if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
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
                    if (requestedSudokuSize === 7) {
                        rows = [3, 4, 5, 6, 7, 8];
                        cols = [];
                    } else if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
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
                    if (requestedSudokuSize === 7) {
                        rows = [2, 3, 4, 5, 6, 7];
                        cols = [];
                    } else if (document.getElementById("nb_sudoku6").checked === true) { // 8x8 grid
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
                delete window.sudotokuNewGridSize;
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
                errorMsg(PenpaText.get('size_warning_kakuro', gridmax['kakuro']));
            }
            break;
        case "truncated_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['truncated'] && n0 > 0) {
                pu = new Puzzle_truncated_square(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['truncated']));
            }
            break;
        case "tetrakis_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['tetrakis'] && n0 > 0) {
                pu = new Puzzle_tetrakis_square(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['tetrakis']));
            }
            break;
        case "snub_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['snub'] && n0 > 0) {
                pu = new Puzzle_snub_square(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['snub']));
            }
            break;
        case "cairo_pentagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['cairo'] && n0 > 0) {
                pu = new Puzzle_cairo_pentagonal(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['cairo']));
            }
            break;
        case "rhombitrihexagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['rhombitrihex'] && n0 > 0) {
                pu = new Puzzle_rhombitrihexagonal(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['rhombitrihex']));
            }
            break;
        case "deltoidal_trihexagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= gridmax['deltoidal'] && n0 > 0) {
                pu = new Puzzle_deltoidal_trihexagonal(n0, n0, size);
            } else {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['deltoidal']));
            }
            break;
        case "penrose_P3":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var order = parseInt(document.getElementById("nb_size2").value, 10);
            var rotational = parseInt(document.getElementById("nb_penrose1").value, 10);
            var variation = parseFloat(document.getElementById("nb_penrose2").value, 10);
            if (!(n0 <= gridmax['penrose'] && n0 > 0)) {
                errorMsg(PenpaText.get('size_warning_generic', gridmax['penrose']));
                break;
            }
            if ((order < 3) || (order > 30)) {
                errorMsg(PenpaText.get('order_warning_generic', 30));
                break;
            }
            if ((rotational < 0) || (rotational >= order)) {
                errorMsg(PenpaText.get('rotational_asymmetry_warning_generic', order - 1));
                break;
            }
            pu = new Puzzle_penrose_P3(n0, order, size);
            break;
    }
    return pu;
}

function changetype() {
    UserSettings.gridtype = document.getElementById("gridtype").value;
    set_display_labels(UserSettings.gridtype)
    switch (UserSettings.gridtype) {
        case "square":
            document.getElementById("name_size1").innerHTML = PenpaText.get('columns');
            document.getElementById("name_size2").innerHTML = PenpaText.get('rows');
            document.getElementById("name_space1").innerHTML = PenpaText.get('over');
            document.getElementById("name_space2").innerHTML = PenpaText.get('under');
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_sqaure');
            document.getElementById("nb_size1").value = 10;
            document.getElementById("nb_size2").value = 10;
            document.getElementById("nb_size3").value = 38;
            document.getElementById("nb_space1").value = 0;
            document.getElementById("nb_space2").value = 0;
            document.getElementById("nb_space3").value = 0;
            document.getElementById("nb_space4").value = 0;
            break;
        case "hex":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("name_space1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_hex');
            document.getElementById("nb_size1").value = 5;
            document.getElementById("nb_size3").value = 40;
            document.getElementById("nb_space1").value = 0;
            break;
        case "tri":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("name_space1").innerHTML = PenpaText.get('border');
            document.getElementById("name_space2").innerHTML = PenpaText.get('cut_corners');
            document.getElementById("name_space2").style.display = "inline";
            document.getElementById("nb_space2").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_tri');
            document.getElementById("nb_size1").value = 6;
            document.getElementById("nb_size3").value = 60;
            document.getElementById("nb_space1").value = 0;
            document.getElementById("nb_space2").value = 0;
            break;
        case "pyramid":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("name_space1").innerHTML = PenpaText.get('border');
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_pyramid');
            document.getElementById("nb_size1").value = 6;
            document.getElementById("nb_size3").value = 50;
            document.getElementById("nb_space1").value = 0;
            break;
        case "iso":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_size1").value = 5;
            document.getElementById("nb_size3").value = 34;
            break;
        case "sudoku":
            document.getElementById("nb_sudoku3_lb").innerHTML = PenpaText.get('nb_sudoku3_lb_sudoku');
            document.getElementById("nb_sudoku7_lb").innerHTML = PenpaText.get('nb_sudoku7_lb_sudoku');
            document.getElementById("nb_sudoku1").checked = false;
            document.getElementById("nb_sudoku2").checked = false;
            document.getElementById("nb_sudoku3").checked = false;
            document.getElementById("nb_sudoku4").checked = false;
            document.getElementById("nb_sudoku5").checked = false;
            document.getElementById("nb_sudoku6").checked = false;
            document.getElementById("nb_sudoku8").checked = false;
            break;
        case "kakuro":
            document.getElementById("name_size1").innerHTML = PenpaText.get('columns');
            document.getElementById("name_size2").innerHTML = PenpaText.get('rows');
            document.getElementById("nb_size1").value = 10;
            document.getElementById("nb_size2").value = 10;
            break;
        case "truncated_square":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
        case "tetrakis_square":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "snub_square":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "cairo_pentagonal":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "rhombitrihexagonal":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "deltoidal_trihexagonal":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "penrose_P3":
            document.getElementById("name_size1").innerHTML = PenpaText.get('side');
            document.getElementById("name_size2").innerHTML = PenpaText.get('order');
            document.getElementById("nb_space_lb").style.display = "none";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size2").value = 5;
            document.getElementById("nb_penrose1").value = 0;
            document.getElementById("nb_penrose2").value = 0.1;
            document.getElementById("nb_penrose2_sl").value = 0.1;
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "<span style='color: red;'>" + PenpaText.get('alpha_warning') + "</span>";
            document.getElementById("nb_size3").value = 38;
            break;
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
        title: PenpaText.get('create_check_warning_title'),
        html: '<h4 class="warn">' + PenpaText.get('create_check_warning_main') + '</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: Color.BLUE_SKY,
        cancelButtonColor: Color.RED,
        confirmButtonText: PenpaText.get('create_check_warning_confirm'),
        cancelButtonText: PenpaText.get('cancel')
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
        title: PenpaText.get('rules_generic'),
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
                        sw_timer.start({startValues: {seconds: next_ts / 1000}});

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
                            sw_timer.start({startValues: {seconds: prev_ts / 1000}});
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
                            sw_timer.start({startValues: {seconds: prev_ts / 1000}});
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
            document.getElementById("replay_message").innerHTML = PenpaText.get('live_replay_na');
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
    sw_timer.start({startValues: {seconds: 0}});
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
    } else {
        document.getElementById('float-key').style.display = "none";
    }
    pu.redraw();
}

function can_use_lite() {
    let user_choices = getValues('mode_choices');
    return (user_choices.length > 0 || UserSettings.tab_settings.length > 0);
}

function advancecontrol_toggle() {
    let currentState = PenpaUI.liteModeButton.getAttribute('data-mode');
    if (currentState === "disable") {
        advancecontrol_onoff("off");
    } else {
        advancecontrol_onoff();
    }
}

function advancecontrol_onoff(loadtype = "new") {
    if (!can_use_lite() || loadtype === "off") {
        // Lite Version OFF, Display all the modes
        // Display the mode break line again
        document.getElementById("mode_break").classList.remove('is_hidden');
        document.getElementById("mode_txt_space").classList.remove('is_hidden');
        advancecontrol_on();
    } else {
        // Lite Version ON, so turn off extra modes
        // Remove the mode break line again
        document.getElementById("mode_break").classList.add('is_hidden');
        document.getElementById("mode_txt_space").classList.add('is_hidden');
        advancecontrol_off(loadtype);
    }
}

function advancecontrol_off(loadtype) {
    // Check for this only for first time when loading url
    var user_choices = (loadtype === "url") ? UserSettings.tab_settings : getValues('mode_choices');

    if (PenpaUI.liteModeButton) {
        PenpaUI.liteModeButton.innerText = PenpaText.get('disable_penpa_lite');
        PenpaUI.liteModeButton.setAttribute('data-mode', 'disable');
    }

    if (user_choices.indexOf("Surface") === -1) {
        document.getElementById("mo_surface_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Multicolor") === -1) {
        document.getElementById("mo_multicolor_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Line Normal") === -1 &&
        user_choices.indexOf("Line Diagonal") === -1 &&
        user_choices.indexOf("Line Free") === -1 &&
        user_choices.indexOf("Line Middle") === -1 &&
        user_choices.indexOf("Line Helper") === -1) {
        document.getElementById("mo_line_lb").classList.add('is_hidden');
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
        document.getElementById("mo_lineE_lb").classList.add('is_hidden');
    } else {
        // document.getElementById("st_lineE80_lb").style.display = "none";
        // document.getElementById("st_lineE12_lb").style.display = "none";
        // document.getElementById("st_lineE13_lb").style.display = "none";
        // document.getElementById("st_lineE21_lb").style.display = "none";
    }
    if (user_choices.indexOf("Wall") === -1) {
        document.getElementById("mo_wall_lb").classList.add('is_hidden');
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
        document.getElementById("mo_number_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Shape") === -1) {
        document.getElementById("mo_symbol_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Special") === -1 &&
        user_choices.indexOf("Thermo") === -1 &&
        user_choices.indexOf("Sudoku Arrow") === -1) {
        document.getElementById("mo_special_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Cage") === -1) {
        document.getElementById("mo_cage_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Composite") === -1) {
        document.getElementById("mo_combi_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Sudoku Normal") === -1 &&
        user_choices.indexOf("Sudoku Corner") === -1 &&
        user_choices.indexOf("Sudoku Centre") === -1) {
        document.getElementById("mo_sudoku_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Box") === -1) {
        document.getElementById("mo_board_lb").classList.add('is_hidden');
    }
    if (user_choices.indexOf("Move All") === -1 &&
        user_choices.indexOf("Move Numbers") === -1 &&
        user_choices.indexOf("Move Shapes") === -1) {
        document.getElementById("mo_move_lb").classList.add('is_hidden');
    }
}

function advancecontrol_on() {
    if (PenpaUI.liteModeButton) {
        PenpaUI.liteModeButton.innerText = PenpaText.get('enable_penpa_lite');
        PenpaUI.liteModeButton.setAttribute('data-mode', 'enable');
    }

    // pu.erase_buttons();
    PenpaUI.set_visible_modes_by_gridtype(pu.gridtype);

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
    let titleText = PenpaText.get('reset_check_title_generic', pu.mode[pu.mode.qa].edit_mode.toUpperCase());

    if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "LINE") {
        if (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === '4') {
            titleText = PenpaText.get('reset_check_title_helper');
        } else {
            titleText = PenpaText.get('reset_check_title_line');
        }
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "LINEE") {
        if (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === '4') {
            titleText = PenpaText.get('reset_check_title_edge_helper');
        } else if (pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0] === '5') {
            titleText = PenpaText.get('reset_check_title_edge_erased');
        } else {
            titleText = PenpaText.get('reset_check_title_edge');
        }
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "SYMBOL") {
        titleText = PenpaText.get('reset_check_title_shape');
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "CAGE") {
        titleText = PenpaText.get('reset_check_title_frame');
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() === "COMBI") {
        // The modal and reset code for this mode was disabled.
        return;
    }
    Swal.fire({
        title: titleText,
        html: '<h4 class="warn">' + PenpaText.get('reset_check_main') + '</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: Color.BLUE_SKY,
        cancelButtonColor: Color.RED,
        confirmButtonText: PenpaText.get('reset_check_confirm'),
        cancelButtonText: PenpaText.get('cancel')
    }).then((result) => {
        if (result.isConfirmed) {
            pu.reset_selectedmode();
        }
    })
}

function DeleteCheck() {
    var text;
    if (document.getElementById("pu_q").checked) {
        text = PenpaText.get('delete_check_problem');
    } else if (document.getElementById("pu_a").checked) {
        text = PenpaText.get('delete_check_solution');
    }
    Swal.fire({
        title: text,
        html: '<h4 class="warn">' + PenpaText.get('delete_check_main') + '</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: Color.BLUE_SKY,
        cancelButtonColor: Color.RED,
        confirmButtonText: PenpaText.get('delete_check_confirm'),
        cancelButtonText: PenpaText.get('cancel')
    }).then((result) => {
        if (result.isConfirmed) {
            pu.reset_board(); // contains reset of undo/redo
            pu.redraw();
        }
    })
}

var filename_bad_chars = /[\\/:*?"<>|]+/gu;
var filename_input_pattern = /[^\\\/:\*\?"\<\>\|]+/v;

/**
 * Update the input patterns for filename text boxes and add a title (tooltip) with
 * explanatory text to them. Called once from boot() and again in trans_text().
 */
function set_input_patterns() {
    [
        'saveimagename',
        'savetextname'
    ].forEach(inputID => {
        var inputBox = document.getElementById(inputID);
        if (inputBox) {
            inputBox.setAttribute('pattern', filename_input_pattern);
            inputBox.setAttribute('title', PenpaText.get('file_save_filename_title'))
        }
    });
}


/**
 * Use the puzzle title/author to make a default filename relevant to this puzzle
 *
 * @returns {string} Filename composed from title and author.
 */
function get_filename_base() {
    let title = document.getElementById("saveinfotitle").value;
    let author = document.getElementById("saveinfoauthor").value;
    let name = 'penpa-' + author + '-' + title;
    // Clean the filename by removing spaces and disallowed characters
    return name.replace(filename_bad_chars, '-').replace(/\s+/g, '-').replace(/-{2,}/gu, '-');
}

function saveimage() {
    document.getElementById("modal-image").style.display = 'block';
}

function syncScreenshotType(val) {
    if (document.getElementById("nb_type1")) document.getElementById("nb_type1").checked = (val === "1");
    if (document.getElementById("nb_type2")) document.getElementById("nb_type2").checked = (val === "2");
    if (document.getElementById("nb_type3")) document.getElementById("nb_type3").checked = (val === "3");
}

function syncScreenshotMargin(checked) {
    if (document.getElementById("nb_margin1")) document.getElementById("nb_margin1").checked = checked;
    if (document.getElementById("nb_margin2")) document.getElementById("nb_margin2").checked = !checked;
}

function downloadPuzzleImage(mode) {
    if (typeof pu === "undefined" || !pu) return;
    var originalQa = pu.mode ? pu.mode.qa : "pu_q";
    if (mode === "problem") {
        if (pu.mode_qa) pu.mode_qa("pu_q");
        saveimage_download();
    } else if (mode === "solution") {
        if (pu.mode_qa) pu.mode_qa("pu_a");
        saveimage_download();
    } else if (mode === "both") {
        if (pu.mode_qa) pu.mode_qa("pu_q");
        saveimage_download();
        setTimeout(function() {
            if (pu.mode_qa) pu.mode_qa("pu_a");
            saveimage_download();
            setTimeout(function() {
                if (pu.mode_qa) pu.mode_qa(originalQa);
            }, 300);
        }, 500);
    }
}

function saveimage_download() {
    var downloadLink = document.getElementById('download_link');
    var filename = get_download_filename('saveimagename');

    var fileExt;
    if (document.getElementById("nb_type1").checked) {
        fileExt = "png";
    } else if (document.getElementById("nb_type2").checked) {
        fileExt = "jpg";
    } else if (document.getElementById("nb_type3").checked) {
        fileExt = "svg";
    }

    var cleanFilename = validate_filename(filename, fileExt);

    if (cleanFilename) {
        if (fileExt === "svg") {
            var text = pu.resizecanvas();
            var downloadLink = document.getElementById('download_link');
            var blob = new Blob([text], {type: "image/svg+xml"});
            if (window.navigator.msSaveBlob) {
                // for IE
                window.navigator.msSaveBlob(blob, cleanFilename);
            } else if (URL && URL.createObjectURL) {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.target = "_blank";
                downloadLink.download = cleanFilename;
                downloadLink.click();
            } else {
                Swal.fire({
                    title: PenpaText.get('unsupported_browser_title'),
                    html: PenpaText.get('unsupported_browser_main'),
                    icon: 'error',
                    confirmButtonText: PenpaText.get('close'),
                });
            }
        } else {
            if (pu.canvas.msToBlob) { // For IE
                var blob = pu.canvas.msToBlob();
                window.navigator.msSaveBlob(blob, cleanFilename);
            } else { // Other browsers
                downloadLink.href = pu.resizecanvas();
                downloadLink.download = cleanFilename;
                downloadLink.click();
            }
        }
    }
}

function saveimage_window() {
    var win, url;
    var downloadLink = document.getElementById('download_link');
    var address = pu.resizecanvas();
    if (document.getElementById("nb_type3").checked) { //svg
        // store in a Blob
        let blob = new Blob([address], {type: "image/svg+xml"});
        if (URL && URL.createObjectURL) {
            // create an URI pointing to that blob
            url = URL.createObjectURL(blob);
            window.open(url);
        } else {
            Swal.fire({
                title: PenpaText.get('unsupported_browser_title'),
                html: PenpaText.get('unsupported_browser_main'),
                icon: 'error',
                confirmButtonText: PenpaText.get('close'),
            });
        }
    } else {
        win = window.open();
        win.document.write("<img src='" + address + "'/>");
    }
}

function generateTitle() {
    if (!pu) return "Sudoku";
    var active = Array.isArray(pu.activeSudokuVariants)
        ? pu.activeSudokuVariants.filter(v => v !== "classic")
        : [];
    if (active.length === 0) return "Classic Sudoku";
    var formatted = active.map(v => v.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")).join(" ");
    return formatted + " Sudoku";
}

function savetext() {
    document.getElementById("saveinfotitle").value = generateTitle();
    document.getElementById("modal-save").style.display = 'block';
    document.getElementById("savetextarea").value = "";
}

function io_sudoku() {
    document.getElementById("modal-input").style.display = 'block';
    document.getElementById("iostring").focus();
}

function i_url() {
    document.getElementById("modal-load").style.display = 'block';
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
    return update_textarea(text);
}

async function savetext_solve() {
    const verifyUniqueness = document.getElementById("verify_uniqueness_chk")?.checked;
    if (!verifyUniqueness) {
        var text = pu.maketext_solve();
        return update_textarea(text);
    }
    const pu = window.pu;
    const SudokuSolver = window.SudokuSolver;
    const SudokuCSP = window.SudokuCSP;
    if (!pu || !SudokuSolver || !SudokuCSP) {
        alert("Solver is not loaded.");
        return;
    }
    if (!SudokuSolver.isClassicSudoku(pu)) {
        const msg = "The solver only supports 6x6 or 9x9 Sudoku or square grids. Uniqueness cannot be verified.";
        if (typeof Swal !== "undefined") {
            Swal.fire({ icon: "warning", title: "Cannot Share", text: msg });
        } else {
            alert(msg);
        }
        return;
    }
    try {
        const board = SudokuSolver.readBoard(pu, false);
        const constraints = SudokuSolver.readConstraints(pu);
        const problem = SudokuCSP.createProblem(board, constraints);
        const solutions = problem.enumerateAnswers(2);
        if (solutions.length === 0) {
            const msg = "The puzzle has no solution.";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Cannot Share", text: msg });
            } else {
                alert(msg);
            }
            return;
        }
        if (solutions.length > 1) {
            const msg = "The puzzle does not have a unique solution (multiple solutions found).";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Cannot Share", text: msg });
            } else {
                alert(msg);
            }
            return;
        }
        const solution = solutions[0];
        const original_pu_a = JSON.parse(JSON.stringify(pu.pu_a));
        pu.pu_a = {
            number: {},
            symbol: {},
            line: {},
            freeline: {},
            edge: {},
            freeedge: {},
            wall: {},
            polygon: []
        };
        const size = SudokuSolver.puzzleSize(pu);
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const key = SudokuSolver.cellKey(pu, row, col);
                const digit = solution[row][col];
                pu.pu_a.number[key] = [digit.toString(), 9, "1"];
            }
        }
        const checkboxes = ["sol_surface_exact", "sol_surface", "sol_number", "sol_loopline_exact", "sol_loopline", "sol_ignoreloopline", "sol_loopedge_exact", "sol_loopedge", "sol_ignoreborder", "sol_wall", "sol_square", "sol_circle", "sol_cross", "sol_line", "sol_arrow", "sol_combination"];
        const original_checkbox_states = {};
        checkboxes.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                original_checkbox_states[id] = el.checked;
                el.checked = (id === "sol_number");
            }
        });
        const text = pu.maketext_solve_solution();
        const finalUrl = await update_textarea(text);
        checkboxes.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.checked = original_checkbox_states[id];
            }
        });
        pu.pu_a = original_pu_a;
        pu.redraw();
        return finalUrl;
    } catch (e) {
        const msg = "Solver error: " + e.message;
        if (typeof Swal !== "undefined") {
            Swal.fire({ icon: "error", title: "Cannot Share", text: msg });
        } else {
            alert(msg);
        }
    }
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
        return await $.get('https://tinyurl.com/api-create.php?url=' + url, function(link, status) {
            if (status === "success") {
                return link;
            }
            console.error('Error while creating tinyurl');
            return null;
        });
    } catch (error) {
        console.error('Error while creating tinyurl');
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

    const saveEl = document.getElementById("savetextarea");
    if (saveEl) saveEl.value = newText;
    if (document.getElementById("modal-save-url-wrapper")) {
        document.getElementById("modal-save-url-wrapper").style.display = "block";
    }
    return newText;
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
    const textarea = document.getElementById("savetextarea");

    textarea.classList.add('copied');
    setTimeout(() => {
        textarea.classList.remove('copied');
    }, 2500);

    if (navigator.clipboard) {
        navigator.clipboard.writeText(textarea.value);
    } else {
        textarea.select();
        let range = document.createRange();
        range.selectNodeContents(textarea);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        textarea.setSelectionRange(0, 1e5);
        document.execCommand("copy");
    }

    const btn = document.getElementById("closeBtn_save1");
    if (btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa fa-check"></i> Copied!';
        btn.classList.add("copy-success");
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.classList.remove("copy-success");
        }, 2000);
    }
}

/**
 * Gets the preferred download filename.
 *
 * @param {string} filenameInputID ID of the input field to use for the filename.
 *
 * @returns {string} Preferred filename for download
 */
function get_download_filename(filenameInputID) {
    // Get filename textbox contents to use as the download filename.
    var filename = document.getElementById(filenameInputID).value;

    // If filename textbox empty, generate a name from the title/author.
    if (!filename) {
        filename = get_filename_base();
    }

    return filename;
}

/**
 * Invokes a file download of the puzzle URL as a text file.
 *
 * If the user's filename ends in .url, it will prepend the generated
 * puzzle URL with the appropriate content to make a proper shortcut file.
 *
 * Similar with .desktop for Linux.
 *
 * @TODO Learn the xml format used on Apple?
 *
 * h/t the author of the page https://www.cyanwerks.com/formats/file-format-url.html
 * for info that helped with the .url format.
 */
function savetext_download() {
    // Get filename and check ext.
    var downloadFilename = get_download_filename("savetextname");
    var isURL = (downloadFilename.match(/\.url$/i));
    var isDesktop = (downloadFilename.match(/\.desktop$/i));

    // Get generated URL.
    var urlText = document.getElementById("savetextarea").value;
    if (!urlText) {
        errorMsg(PenpaText.get('file_save_no_contents'));
        return;
    }

    // Format blob.
    var fileContents = urlText;
    var fileExt = "txt";
    var mimeType = "text/plain";

    if (isURL) {
        fileContents = "[InternetShortcut]\nURL=" + urlText;
        fileExt = "url";
        mimeType = "application/internet-shortcut";
    } else if (isDesktop) {
        var puzTitle = document.getElementById("saveinfotitle").value;
        // NB: There's a Link type in the spec for .desktop files but I guess most Linux distros don't support it, so I have this file
        // writing those options as comments that can be changed by the user if they want.
        fileContents = "#!/usr/bin/env xdg-open\n# To make this shortcut work, you may need to set the file as executable and then right-click and \"Allow Launching\"\n[Desktop Entry]\nVersion=1.0\nTerminal=false\nName=" + puzTitle + "\nIcon=text-html\n# If your distribution supports Link type, use these:\n#Type=Link\n#URL=" + urlText + "\nType=Application\nExec=xdg-open " + urlText;
        fileExt = "desktop";
        mimeType = "application/x-desktop";
    }

    // Perform save.
    var blob = new Blob([fileContents], {type: mimeType});
    saveblob_download(blob, downloadFilename, fileExt);
}

/**
 * Validates a filename prior to using it for a download.
 *
 * @param {string} filename Filename to be used for download
 * @param {string} fileExt File extension to be used for download
 * @returns {string|null} Will return valid/fixed filename unless the name is invalid.
 */
function validate_filename(filename, fileExt) {
    var filenamePieces = filename.split(".");

    // Ensure there's a file extension, otherwise add it.
    if (filenamePieces[filenamePieces.length - 1] !== fileExt) {
        filename += "." + fileExt;
    }

    var filenameBad = filename_bad_chars.exec(filename);

    // Check for unwanted symbols.
    if (filenameBad) {
        errorMsg(PenpaText.get('unsupported_filename'));
        return null;
    }

    return filename;
}

/**
 * Saves a Blob data object as a file, assuming the filename is
 * valid and the browser supports it.
 *
 * @param {Blob} blob A blob to be saved to a file.
 * @param {string} filename Filename to use.
 * @param {string} fileext File extension to use if missing from filename.
 */
function saveblob_download(blob, filename, fileext) {
    var downloadLink = document.getElementById('download_link');
    var cleanFilename = validate_filename(filename, fileext || 'txt');

    if (cleanFilename) {
        if (window.navigator.msSaveBlob) {
            // for IE
            window.navigator.msSaveBlob(blob, cleanFilename);
        } else if (URL && URL.createObjectURL) {
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.target = "_blank";
            downloadLink.download = cleanFilename;
            downloadLink.click();
        } else {
            Swal.fire({
                title: PenpaText.get('unsupported_browser_title'),
                html: PenpaText.get('unsupported_browser_main'),
                icon: 'error',
                confirmButtonText: PenpaText.get('close'),
            });
        }
    }
}

function savetext_window() {
    var text = document.getElementById("savetextarea").value;
    if (text) {
        PenpaUrlSecurity.openHttpUrl(text);
    }
}

function shorturl_tab() {
    const textarea = document.getElementById("savetextarea");

    if (navigator.clipboard) {
        navigator.clipboard.writeText(textarea.value);
    } else {
        textarea.select();
        let range = document.createRange();
        range.selectNodeContents(textarea);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        textarea.setSelectionRange(0, 1e5);
        document.execCommand("copy");
    }

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

function duplicate(in_place = false) {
    var address = pu.maketext_duplicate();
    if (pu.mmode === "solve") {
        address = address + "&l=solvedup";
    }
    if (in_place)
        history.pushState('', '', address);
    else
        window.open(address);
}

function import_sudoku() {
    let flag, errorMsg;
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
                errorMsg = PenpaText.get('sudoku_import_minmax_error');
            }
        } else {
            errorMsg = PenpaText.get('sudoku_import_size_error');
        }
    } else {
        errorMsg = PenpaText.get('sudoku_import_square_error');
    }

    if (errorMsg) {
        Swal.fire({
            html: errorMsg,
            icon: 'error',
            confirmButtonText: PenpaText.get('close'),
        });
    }
}

function export_sudoku() {
    let flag, errorMsg;
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
                errorMsg = PenpaText.get('sudoku_import_minmax_error');
            }
        } else {
            errorMsg = PenpaText.get('sudoku_import_size_error');
        }
    } else {
        errorMsg = PenpaText.get('sudoku_import_square_error');
    }

    if (errorMsg) {
        Swal.fire({
            html: errorMsg,
            icon: 'error',
            confirmButtonText: PenpaText.get('close'),
        });
    }
}

async function import_url(urlstring) {
    urlstring = urlstring || document.getElementById("urlstring").value;
    if (urlstring !== "") {
        if (urlstring.indexOf("/penpa-edit/") !== -1 || urlstring.match(/m=(?:edit|solve)/gi)) {

            let param = urlstring.split('&');
            let paramArray = [];

            // Decompose address into elements
            for (var i = 0; i < param.length; i++) {
                let paramItem = param[i].split('=');
                paramArray[paramItem[0]] = paramItem[1];
            }

            const hash = PenpaProgress.getHash(paramArray.p);

            // Decrypt puzzle data
            let local_data = await PenpaProgress.tryLoad(hash);

            if (local_data && local_data.includes('&p=')) {
                // This is to account for old links and new links together
                var url = local_data;
                if (url.includes("#")) {
                    url = url.split('#')[1];
                } else if (url.includes("?")) {
                    url = url.split('?')[1];
                }
                load(url, type = 'localstorage', origurl = paramArray.p);
            } else {
                let paramString = urlstring;
                if (paramString.includes("/penpa-edit/#")) {
                    paramString = paramString.split("/penpa-edit/#")[1];
                } else if (paramString.includes("/penpa-edit/?")) {
                    paramString = paramString.split("/penpa-edit/?")[1];
                } else if (typeof paramString === "string" && (paramString.startsWith("?") || paramString.startsWith("#"))) {
                    paramString = paramString.slice(1);
                }
                load(paramString, 'local');
            }

            document.getElementById("modal-load").style.display = 'none';
            if (UserSettings.tab_settings > 0) {
                selectBox.setValue(UserSettings.tab_settings);
            }
        } else if (urlstring.match(/\/puzz.link\/p\?|pzprxs\.vercel\.app\/p\?|\/pzv\.jp\/p(\.html)?\?/)) {
            decode_puzzlink(urlstring);
            document.getElementById("modal-load").style.display = 'none';
        } else {
            Swal.fire({
                html: PenpaText.get('invalid_url'),
                icon: 'error',
                confirmButtonText: PenpaText.get('close'),
            });
        }
    }
}

function load_feedback() {
    Swal.fire({
        title: 'Feedback',
        html: '<h2 class="info">' + PenpaText.get('feedback_modal') + '</h2>',
        icon: 'info'
    })
}

function show_shortcuts() {
    document.getElementById("modal-keys").style.display = 'block';
}

async function load(urlParam, type = 'url', origurl = null) {
    if (!urlParam || typeof urlParam !== "string") return;
    if (urlParam.startsWith("?") || urlParam.startsWith("#")) {
        urlParam = urlParam.slice(1);
    }
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

    // Do all the compression substitutions in reverse to decompress. This is because the first entry escapes strings
    // that contain possibly-valid substitutions, and so we do all the normal substitutions before we unescape.
    for (var i = COMPRESS_SUB.length - 1; i >= 0; i--)
        rtext = rtext.split(COMPRESS_SUB[i][1]).join(COMPRESS_SUB[i][0]);

    rtext = rtext.split("\n");
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
    if (rtext_para[11] && rtext_para[11] == "1") {
        document.getElementById("nb_sudoku1").checked = true;
    }
    if (rtext_para[12] && rtext_para[12] == "1") {
        document.getElementById("nb_sudoku2").checked = true;
    }
    if (rtext_para[13] && rtext_para[13] == "1") {
        document.getElementById("nb_sudoku3").checked = true;
    }
    if (rtext_para[14] && rtext_para[14] == "1") {
        document.getElementById("nb_sudoku4").checked = true;
    }
    if (UserSettings.gridtype == "penrose_P3") {
        if (rtext_para[11]) {
            document.getElementById("nb_penrose1").value = rtext_para[11];
        }
        if (rtext_para[12]) {
            if (document.getElementById("nb_penrose2")) document.getElementById("nb_penrose2").value = rtext_para[12];
            if (document.getElementById("nb_penrose2_sl")) document.getElementById("nb_penrose2_sl").value = rtext_para[12];
        }
    }
    if (rtext_para[15]) {
        let ptitle = rtext_para[15].replace(/%2C/g, ',');
        ptitle = ptitle.replace(/^Title\:\s/, '');
        if (ptitle !== "Title: ") {
            ptitle = DOMPurify.sanitize(ptitle);
            if (document.getElementById("saveinfotitle")) document.getElementById("saveinfotitle").value = ptitle;
        }
    }
    if (rtext_para[16]) {
        let pauthor = rtext_para[16].replace(/%2C/g, ',')
        pauthor = pauthor.replace(/^Author\:\s/, '');
        if (pauthor != "") {
            pauthor = DOMPurify.sanitize(pauthor);
            if (document.getElementById("saveinfoauthor")) document.getElementById("saveinfoauthor").value = pauthor;
        }
    }
    if (rtext_para[17] && rtext_para[17] !== "") {
        psource = PenpaUrlSecurity.normalizeHttpUrl(rtext_para[17]) || "";
        const sourceLink = document.getElementById("puzzlesourcelink");
        if (sourceLink && psource) sourceLink.href = psource;
        if (sourceLink && !psource) sourceLink.removeAttribute("href");
        if (document.getElementById("puzzlesource")) document.getElementById("puzzlesource").textContent = psource ? "Source" : "";
        if (document.getElementById("saveinfosource")) document.getElementById("saveinfosource").value = psource;
    }

    update_title();

    make_class(rtext_para[0], 'url');
    panel_pu = new Panel();

    // Check if Replay exist
    var valid_replay = false;
    if (paramArray.r && !paramArray.r.includes("penpaerror")) {
        valid_replay = true;
    }

    UserSettings.loadFromCookies("others");

    if (rtext_para[18] && rtext_para[18] !== "") {
        if (document.getElementById("puzzlerules")) document.getElementById("puzzlerules").classList.add("rules-present");
        pu.rules = rtext_para[18].replace(/%2C/g, ',').replace(/%2D/g, '<br>').replace(/%2E/g, '&').replace(/%2F/g, '=');
        pu.rules = DOMPurify.sanitize(pu.rules);
        if (document.getElementById("ruletext")) document.getElementById("ruletext").innerHTML = pu.rules;
        if (document.getElementById("saveinforules")) document.getElementById("saveinforules").value = pu.rules.replace(/<br>/g, '\n');
    }

    // Border button status
    if (rtext_para[19]) {
        // to address mixed versions where the stored value was ON and OFF/ "1" and "2"
        if (rtext_para[19] === "ON" || rtext_para[19] === "1") {
            UserSettings.draw_edges = true;
        }

        if (rtext_para[19] === "OFF" || rtext_para[19] === "2") {
            UserSettings.draw_edges = false;
        }
    }

    // multisolution status
    if (rtext_para[20] && rtext_para[20] === "true") {
        pu.multisolution = true;
    }

    // Background image data
    if (rtext_para[21]) {
        let data = decrypt_data(rtext_para[21])
        pu.bg_image_data = JSON.parse(data);
        pu.load_bg_image_attrs();
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

    rtext[5] = JSON.parse(rtext[5]);

    // workaround for incorrectly encoded empty centerlist
    if (rtext[5][0] == null) {
        rtext[5] = [];
    }

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
        let title = document.getElementById("saveinfotitle")?.value || "";
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

    set_genre_tags(pu.user_tags, callid = 'load');

    if (Array.isArray(pu.user_tags) && pu.user_tags.length > 0) {
        if (!Array.isArray(pu.activeSudokuVariants)) {
            pu.activeSudokuVariants = ["classic"];
        }
        pu.user_tags.forEach(function(tag) {
            if (tag && tag !== "classic" && pu.activeSudokuVariants.indexOf(tag) === -1) {
                pu.activeSudokuVariants.push(tag);
            }
        });
    }

    // Set some genre specific settings
    if ($('#genre_tags_opt').select2("val").includes("alphabet")) {
        UserSettings.shortcuts_enabled = false;
    }

    if (paramArray.m === "edit") { //edit_mode
        var mode = JSON.parse(rtext[2]);
        for (var i in mode) {
            if (typeof mode[i] === 'object') {
                for (var j in mode[i]) {
                    pu.mode[i][j] = mode[i][j];
                }
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
        pu.mode_set("surface", 'new', true);
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
            UserSettings.custom_colors_on = true;
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

    // Save the Puzzle URL info - used as unique id for cache saving of progress
    if (origurl) {
        pu.url = origurl;
    } else {
        pu.url = paramArray.p;
    }

    if (!valid_replay && (paramArray.m === "solve" || paramArray.l === "solvedup") && (type != "localstorage")) {
        // check for local progress
        const hash = PenpaProgress.getHash(pu.url);
        let local_data = await PenpaProgress.tryLoad(hash);

        if (local_data) {
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
            `<option value=1 selected="selected">${PenpaText.get('solve_path')}</option>` +
            `<option value=2>${PenpaText.get('live_replay')}</option>` +
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
            disptext = DOMPurify.sanitize(disptext);
            document.getElementById("puzzletitle").innerHTML = disptext;
            document.getElementById("puzzletitle").style.display = '';

            // Calculate Total MS for later use
            let solvetime = qstr.stime.split(':');
            // Days, Hours, Min, Seconds, 10th Seconds
            pu.puzzleinfo.totalMS = ((+solvetime[0]) * 24 * 60 * 60 + (+solvetime[1]) * 60 * 60 + (+solvetime[2]) * 60 + (+solvetime[3]) + (+solvetime[4]) * 0.1) * 1000;
        }
    }

    // Make sure we start a new group
    pu.undoredo_counter++;

    // Make any backwards compatibility updates to the data we need for format changes
    if (paramArray.variants) {
        try {
            var decoded = decodeURIComponent(paramArray.variants).split(",");
            if (decoded.length) {
                if (decoded.indexOf("classic") === -1) {
                    decoded.unshift("classic");
                }
                pu.activeSudokuVariants = decoded;
                pu.activeSudokuVariant = decoded[decoded.length - 1];
            }
        } catch (e) {
            console.error("Failed to parse variants parameter", e);
        }
    }
    if (typeof SudokuSolver !== "undefined" && typeof SudokuSolver.readConstraints === "function") {
        try {
            var constraints = SudokuSolver.readConstraints(pu);
            if (constraints && Array.isArray(constraints.variants) && constraints.variants.length > 0) {
                if (!Array.isArray(pu.activeSudokuVariants)) pu.activeSudokuVariants = ["classic"];
                constraints.variants.forEach(function(v) {
                    if (v && pu.activeSudokuVariants.indexOf(v) === -1) {
                        pu.activeSudokuVariants.push(v);
                    }
                });
                if (pu.activeSudokuVariants.length > 1) {
                    pu.activeSudokuVariant = pu.activeSudokuVariants[pu.activeSudokuVariants.length - 1];
                }
            }
        } catch (e) {}
    }
    pu.load_compat_fixes();
    SudokuTools.init();
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
    SudokuTools.init();
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
    var titleEl = document.getElementById("title");
    if (titleEl) titleEl.innerHTML = PenpaText.get('solver_mode');
    var nbSize3 = document.getElementById("nb_size3_r");
    if (nbSize3) nbSize3.value = UserSettings.displaysize;
    var newSize = document.getElementById("newsize");
    if (newSize) newSize.style.display = "inline";
    var puA = document.getElementById("pu_a");
    if (puA) puA.checked = true;
    var editTxt = document.getElementById("edit_txt");
    if (editTxt) editTxt.style.display = "none";
    var puQ = document.getElementById("pu_q_label");
    if (puQ) puQ.style.display = "none";
    var puAL = document.getElementById("pu_a_label");
    if (puAL) puAL.style.display = "none";
    var newBoard = document.getElementById("newboard");
    if (newBoard) newBoard.style.display = "none";
    var rot = document.getElementById("rotation");
    if (rot) rot.style.display = "none";
    var moBoardLb = document.getElementById("mo_board_lb");
    if (moBoardLb) moBoardLb.classList.add('is_hidden');
    var subNum2 = document.getElementById("sub_number2_lb");
    if (subNum2) subNum2.style.display = "none";
    var subNum4 = document.getElementById("sub_number4_lb");
    if (subNum4) subNum4.style.display = "none";
    var subNum11 = document.getElementById("sub_number11_lb");
    if (subNum11) subNum11.style.display = "none";

    // Hide Visibility button
    var vis0 = document.getElementById("visibility_button0");
    if (vis0) vis0.style.display = "none";
    var vis = document.getElementById("visibility_button");
    if (vis) vis.style.display = "none";

    // Hide Load button
    var inputUrl = document.getElementById("input_url");
    if (inputUrl) inputUrl.style.display = "none";

    // Save settings
    var saveSet = document.getElementById('save_settings_lb');
    if (saveSet) saveSet.style.display = 'none';

    // Middle Button settings not applicable in Solve mode
    var mmLb = document.getElementById('mousemiddle_settings_lb');
    if (mmLb) mmLb.style.display = 'none';
    var mmOpt = document.getElementById('mousemiddle_settings_opt');
    if (mmOpt) mmOpt.style.display = 'none';

    // Hide Custom Answer Message
    var s6Title = document.getElementById('save6texttitle');
    if (s6Title) s6Title.style.display = 'none';
    var cMsg = document.getElementById('custom_message');
    if (cMsg) cMsg.style.display = 'none';

    // Hide Answer check Generate Button
    var btnSave5 = document.getElementById('closeBtn_save5');
    if (btnSave5) btnSave5.style.display = 'none';

    // Constraints
    var cStr = document.getElementById('constraints');
    if (cStr) cStr.style.display = 'none';
    if (type.includes('local')) {
        try {
            $('select').toggleSelect2(false);
        } catch (err) {
            // pass
        }
    }
    var cOpt = document.getElementById('constraints_settings_opt');
    if (cOpt) cOpt.style.display = 'none';

    // No need of Solving URL in Solver Mode, instead show replay url
    var addrSolve = document.getElementById('address_solve');
    if (addrSolve) addrSolve.style.display = 'none';
    var replayExpansion = document.getElementById('expansion_replay');
    if (replayExpansion) replayExpansion.style.display = '';
}

function set_contestmode() {
    // Disable Share, Undo/Redo buttons, IO sudoku
    document.getElementById("title").innerHTML = PenpaText.get('contest_mode');
    document.getElementById("savetext").style.display = "none";
    document.getElementById("input_sudoku").style.display = "none";
    document.getElementById("bottom_button").style.display = "none";
    document.getElementById("tb_undo").style.display = "none";
    document.getElementById("tb_redo").style.display = "none";
    document.getElementById("tb_reset").style.display = "none";
    document.getElementById("tb_delete").style.display = "none";
    document.getElementById("mo_move_lb").classList.add('is_hidden');
    document.getElementById("puzzlesourcelink").style.display = "none";
    let sourceUrl = document.getElementById("saveinfosource").value;
    document.getElementById("answer_key").innerHTML = DOMPurify.sanitize(PenpaText.get('contest_answer', sourceUrl));
    pu.undoredo_disable = true;
    pu.comp = true;
}

function set_solvemodetitle() {
    var title = document.getElementById("title");
    title.innerHTML = PenpaText.get('solver_mode_answer');
    title.addEventListener("click", display_answercheck);
    title.style.textDecoration = "underline";
    document.getElementById("header").classList.add("solving");
    document.getElementById("page_help").style.backgroundColor = Color.GREY_LIGHT;
}

function display_answercheck() {
    // Validate at least one answer check option is selected
    var answer_check_opt = pu.get_answercheck_settings();
    if (answer_check_opt.answercheck_opt.length === 0) {
        infoMsg(PenpaText.get('answer_check_empty'));
    } else {
        infoMsg(answer_check_opt.message);
    }
}

function isEmpty(obj) {
    if (obj == null) return true;
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

function update_title() {
    let title = document.getElementById("saveinfotitle")?.value || "";
    let author = document.getElementById("saveinfoauthor")?.value || "";

    if (document.getElementById('puzzletitle')) document.getElementById('puzzletitle').innerHTML = DOMPurify.sanitize(title);
    if (document.getElementById('puzzleauthor')) document.getElementById('puzzleauthor').innerHTML = DOMPurify.sanitize(author);

    let auth_str = (author ? (title ? ' by ' + author : author) : '');
    let auth_tit_str = (title ? title : (auth_str ? '' : 'Puzzle')) + auth_str;
    document.title = (auth_tit_str ? auth_tit_str + ' - Penpa+' : 'Penpa+');
}

// Polyfills
if (!String.prototype.startsWith) {
    Object.defineProperty(String.prototype, 'startsWith', {
        value: function(search, rawPos) {
            var pos = rawPos > 0 ? rawPos | 0 : 0;
            return this.substring(pos, pos + search.length) === search;
        }
    });
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = { isEmpty, encrypt_data, decrypt_data, request_shortlink, get_download_filename, 
                     get_filename_base, filename_bad_chars, validate_filename, errorMsg, infoMsg, 
                     update_textarea};
}
