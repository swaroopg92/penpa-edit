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
    var gridtype = document.getElementById("gridtype").value;
    pu = make_class(gridtype);
    pu.reset_frame();
    // Drawing Panel
    panel_pu = new Panel();
    panel_pu.draw_panel();
    pu.mode_set("surface"); //include redraw
}

function create_newboard() {

    var size = parseInt(document.getElementById("nb_size3").value);
    if (12 <= size && size <= 90) {
        var mode = pu.mode;
        var gridtype = document.getElementById("gridtype").value;
        pu = make_class(gridtype);
        pu.mode = mode;

        pu.reset_frame(); // Draw the board
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
        pu.mode_set(pu.mode[pu.mode.qa].edit_mode); //include redraw
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Display size must be in the range <h2 style="color:red;">12-90</h2>',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function make_class(gridtype, loadtype = 'new') {
    var size = parseInt(document.getElementById("nb_size3").value);
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
                "nb_sudoku7_lb"
            ]; // of sudoku
            for (var i of type4) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("nb_sudoku3_lb").style.display = "inline";
            document.getElementById("nb_sudoku3_lb").innerHTML = "*White space is subtracted from the row/column size";
            if (nx <= 40 && nx > 0 && ny <= 40 && ny > 0 && space1 + space2 < ny && space3 + space4 < nx) {
                pu = new Puzzle_square(nx, ny, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Rows/Columns Size must be in the range <h2 style="color:red;">1-40</h2>',
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
            if (n0 <= 20 && n0 > 0 && space1 < n0) {
                pu = new Puzzle_hex(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-20</h2>',
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
            if (n0 <= 20 && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_tri(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-20</h2>',
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
            if (n0 <= 20 && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_pyramid(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-20</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "iso":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 20 && n0 > 0) {
                pu = new Puzzle_iso(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-20</h2>',
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

            if (nx <= 40 && nx > 0 && ny <= 40 && ny > 0) {
                // Create Kakuro object
                pu = new Puzzle_kakuro(nx, ny, size);

                if (loadtype === "new") {
                    pu.draw_kakurogrid();
                }
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Rows/Columns Size must be in the range <h2 style="color:red;">1-40</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "truncated_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_truncated_square(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-10</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "tetrakis_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_tetrakis_square(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-10</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "snub_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_snub_square(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-10</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
            break;
        case "cairo_pentagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_cairo_pentagonal(n0, n0, size);
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Side Size must be in the range <h2 style="color:red;">1-10</h2>',
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
        "nb_sudoku7_lb"
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
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_size1").value = 5;
            document.getElementById("nb_size3").value = 32;
            break;
        case "tetrakis_square":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 32;
            break;
        case "snub_square":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_size1").value = 4;
            document.getElementById("nb_size3").value = 38;
            break;
        case "cairo_pentagonal":
            for (var i of type) {
                document.getElementById(i).style.display = "none";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "none";
            }
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_size1").value = 4;
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
        title: 'Are you sure want to reset the current board? To only change display size and grid lines use "Change grid" button',
        html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Reset it!'
    }).then((result) => {
        if (result.isConfirmed) {
            create_newboard();
            pu.redraw();
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
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Display Size must be in the range <h2 style="color:red;">12-90</h2>',
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
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'Display Size must be in the range <h2 style="color:red;">12-90</h2>',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function newsize() {
    document.getElementById('modal-newsize').style.display = 'block';
}

function panel_onoff() {
    if (document.getElementById('panel_button').textContent === "OFF") {
        document.getElementById('panel_button').textContent = "ON";
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
        document.getElementById('panel_button').textContent = "OFF";
        document.getElementById('float-key').style.display = "none";
    }
    pu.redraw();
}

function edge_onoff() {
    if (document.getElementById('edge_button').textContent === "OFF") {
        document.getElementById('edge_button').textContent = "ON";
    } else {
        document.getElementById('edge_button').textContent = "OFF";
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

function reloadcheck_onoff() {
    if (document.getElementById('reload_button').textContent === "ON") {
        document.getElementById('reload_button').textContent = "OFF";
    } else {
        document.getElementById('reload_button').textContent = "ON";
    }
}

function ResetCheck() {
    if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() == "LINEE") {
        Swal.fire({
            title: 'Erase/Clear all EDGE mode elements?',
            html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() == "SYMBOL") {
        Swal.fire({
            title: 'Erase/Clear all SHAPE mode elements?',
            html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() == "CAGE") {
        Swal.fire({
            title: 'Erase/Clear all FRAME mode elements?',
            html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    } else if (pu.mode[pu.mode.qa].edit_mode.toUpperCase() == "COMBI") {
        Swal.fire({
            title: 'Erase/Clear all selected COMPOSITE mode elements?',
            html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Erase it!'
        }).then((result) => {
            if (result.isConfirmed) {
                pu.reset_selectedmode();
            }
        })
    } else {
        Swal.fire({
            title: 'Erase/Clear all ' + pu.mode[pu.mode.qa].edit_mode.toUpperCase() + ' mode elements?',
            html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
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
        html: '<h4 style="color:red;">You won\'t be able to revert this!</h4>',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Erase it!'
    }).then((result) => {
        if (result.isConfirmed) {
            pu.reset_board();
            pu.redraw();
            // reset undo/redo
            pu.command_undo = new Stack();
            pu.command_redo = new Stack();
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
    }
    var str_sym = "\\/:*?\"<>|";
    var valid_name = 1;
    for (var i = 0; i < filename.length; i++) {
        if (str_sym.indexOf(filename[i]) != -1) {
            valid_name = 0;
        }
    }

    if (valid_name) {
        if (pu.canvas.msToBlob) { // For IE
            var blob = pu.canvas.msToBlob();
            window.navigator.msSaveBlob(blob, filename);
        } else { // Other browsers
            downloadLink.href = pu.resizecanvas();
            downloadLink.download = filename;
            downloadLink.click();
        }
    } else {
        Swal.fire({
            title: 'Swaroop says:',
            html: 'The characters <h2 style="color:red;">\\ / : * ? \" < > |</h2> cannot be used in filename',
            icon: 'error',
            confirmButtonText: 'ok 🙂',
        })
    }
}

function saveimage_window() {
    var downloadLink = document.getElementById('download_link');
    var win = window.open();
    var address = pu.resizecanvas();
    win.document.write("<img src='" + address + "'/>");
}

function savetext() {
    document.getElementById("modal-save").style.display = 'block';
    document.getElementById("savetextarea").value = "";
}

function io_sudoku() {
    document.getElementById("modal-input").style.display = 'block';
    document.getElementById("iostring").placeholder = "Enter digits (0-9, 0 or . for an empty cell, no spaces). The number of digits entered should be a perfect square. Default expected length is 81 digits (9x9 sudoku)";
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

function savetext_edit() {
    var text = pu.maketext();
    document.getElementById("savetextarea").value = text;
}

function savetext_solve() {
    var text = pu.maketext_solve();
    document.getElementById("savetextarea").value = text;
}

function savetext_withsolution() {
    var text = pu.maketext_solve_solution();
    document.getElementById("savetextarea").value = text;
}

function make_ppfile() {
    var text = pu.maketext_ppfile();
    document.getElementById("savetextarea").value = text;
}

function make_gmpfile() {
    var text = pu.maketext_gmpfile();
    document.getElementById("savetextarea").value = text;
}

function savetext_copy() {
    Swal.fire({
        title: 'Swaroop says:',
        html: '<h2 style="color:blue;">URL is copied to clipboard</h2>',
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
            html: 'The characters <h2 style="color:red;">\\ / : * ? \" < > |</h2> cannot be used in filename',
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

function load(urlParam) {
    //try{
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
        document.getElementById("puzzletitle").innerHTML = ptitle;
        document.getElementById("saveinfotitle").value = ptitle.slice(7); // text after "Title: "
    }
    if (rtext_para[16]) {
        let pauthor = rtext_para[16].replace(/%2C/g, ',')
        document.getElementById("puzzleauthor").innerHTML = pauthor;
        document.getElementById("saveinfoauthor").value = pauthor.slice(8); // text after "Author: "
    }
    if (rtext_para[17]) {
        document.getElementById("puzzlesourcelink").href = rtext_para[17];
        document.getElementById("puzzlesource").innerHTML = "Source";
        document.getElementById("saveinfosource").value = rtext_para[17];
    }

    make_class(rtext_para[0], 'url');

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
    }
    rtext[5] = JSON.parse(rtext[5]);
    for (var i = 1; i < rtext[5].length; i++) {
        rtext[5][i] = (rtext[5][i - 1] + rtext[5][i]);
    }

    // Tab settings
    if (rtext[6] !== 'undefined') {
        this.usertab_choices = rtext[6];
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
        if (!pu.pu_q.polygon) { pu.pu_q.polygon = []; }
        if (!pu.pu_a.polygon) { pu.pu_a.polygon = []; }
        pu.centerlist = rtext[5];

        // Because class cannot be copied, its set in different way
        for (var i of ["pu_q", "pu_a"]) {
            for (var j of ["command_redo", "command_undo"]) {
                var t = pu[i][j].__a;
                pu[i][j] = new Stack();
                pu[i][j].set(t);
            }
        }
    } else if (paramArray.m === "solve") { //solve_mode
        set_solvemode()
        pu.mode.qa = "pu_a";

        // mode initialization
        var rtext_mode = rtext[2].split('~');
        pu.mode.grid = JSON.parse(rtext_mode[0]);
        pu.mode_set("surface");
        pu.pu_q = JSON.parse(rtext[3]);
        if (!pu.pu_q.polygon) { pu.pu_q.polygon = []; }
        pu.centerlist = rtext[5];

        // Because class cannot be copied, its set in different way
        for (var i of ["pu_q"]) {
            for (var j of ["command_redo", "command_undo"]) {
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
            pu.solution = atext;
            // Visually showcase answer check is enabled
            document.getElementById("pu_a_label").style.backgroundColor = Color.GREEN_LIGHT_VERY;
        }
        sw_timer.start({ precision: 'secondTenths' });
    }

    if (paramArray.l === "solvedup") {
        set_solvemode();

        // Decrypt a
        if (paramArray.a) {
            var ab = atob(paramArray.a);
            ab = Uint8Array.from(ab.split(""), e => e.charCodeAt(0));
            var inflate = new Zlib.RawInflate(ab);
            var plain = inflate.decompress();
            var atext = new TextDecoder().decode(plain);
            pu.solution = atext;
            // Visually showcase answer check is enabled
            document.getElementById("pu_a_label").style.backgroundColor = Color.GREEN_LIGHT_VERY;
        }

        if (rtext[7] !== "undefined") {
            let starttime = rtext[7].split(":");
            sw_timer.start({
                precision: 'secondTenths',
                startValues: {
                    hours: parseInt(starttime[0]),
                    minutes: parseInt(starttime[1]),
                    seconds: parseInt(starttime[2]),
                    secondTenths: parseInt(starttime[3])
                }
            });
        } else {
            sw_timer.start({ precision: 'secondTenths' });
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
    pu.mode_set(pu.mode[pu.mode.qa].edit_mode, 'url'); //include redraw
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

function set_solvemode() {
    pu.mmode = "solve";
    pu.mode.qa = "pu_a";
    document.getElementById("title").innerHTML = "Solver mode"
    document.getElementById("nb_size3_r").value = document.getElementById("nb_size3").value;
    document.getElementById("newsize").style.display = "inline";
    document.getElementById("pu_a").checked = true;
    document.getElementById("pu_q_label").style.display = "none";
    document.getElementById("newboard").style.display = "none";
    document.getElementById("rotation").style.display = "none";
    document.getElementById("mo_cage_lb").style.display = "none";
    document.getElementById("mo_special_lb").style.display = "none";
    document.getElementById("mo_board_lb").style.display = "none";
    // document.getElementById("sub_lineE5_lb").style.display = "none"; // Edge Erase button
    document.getElementById("sub_number2_lb").style.display = "none";
    document.getElementById("sub_number4_lb").style.display = "none";
    document.getElementById("sub_number11_lb").style.display = "none";
    document.getElementById("tb_delete").value = "Delete all";

    // Hide Visibility button
    document.getElementById("visibility_button0").style.display = "none";
    document.getElementById("visibility_button").style.display = "none";
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