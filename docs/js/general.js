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
    if (12 <= size && size <= 80) {
        var mode = pu.mode;
        var gridtype = document.getElementById("gridtype").value;
        pu = make_class(gridtype);
        pu.mode = mode;

        pu.reset_frame(); // Draw the board
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
        pu.mode_set(pu.mode[pu.mode.qa].edit_mode); //include redraw
    } else {
        alert("Display size must be in the range 12-80");
    }
}

function make_class(gridtype) {
    var size = parseInt(document.getElementById("nb_size3").value);
    switch (gridtype) {
        case "square":
            var nx = parseInt(document.getElementById("nb_size1").value, 10);
            var ny = parseInt(document.getElementById("nb_size2").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            var space2 = parseInt(document.getElementById("nb_space2").value, 10);
            var space3 = parseInt(document.getElementById("nb_space3").value, 10);
            var space4 = parseInt(document.getElementById("nb_space4").value, 10);
            if (nx <= 40 && nx > 0 && ny <= 40 && ny > 0 && space1 + space2 < ny && space3 + space4 < nx) {
                pu = new Puzzle_square(nx, ny, size);
            } else {
                alert("Size must be in the range 1-40");
            }
            break;
        case "hex":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            if (n0 <= 10 && n0 > 0 && space1 < n0) {
                pu = new Puzzle_hex(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-10");
            }
            break;
        case "tri":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            if (n0 <= 20 && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_tri(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-20");
            }
            break;
        case "pyramid":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            var space1 = parseInt(document.getElementById("nb_space1").value, 10);
            if (n0 <= 20 && n0 > 0 && space1 < n0 / 3) {
                pu = new Puzzle_pyramid(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-20");
            }
            break;
        case "iso":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 15 && n0 > 0) {
                pu = new Puzzle_iso(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-15");
            }
            break;
        case "truncated_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_truncated_square(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-10");
            }
            break;
        case "tetrakis_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_tetrakis_square(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-10");
            }
            break;
        case "snub_square":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_snub_square(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-10");
            }
            break;
        case "cairo_pentagonal":
            var n0 = parseInt(document.getElementById("nb_size1").value, 10);
            if (n0 <= 10 && n0 > 0) {
                pu = new Puzzle_cairo_pentagonal(n0, n0, size);
            } else {
                alert("Sides must be in the range 1-10");
            }
            break;

    }
    return pu;
}

function changetype() {
    var gridtype = document.getElementById("gridtype").value;
    var type = ["name_size2", "nb_size2", "name_space2", "name_space3", "name_space4", "nb_space2", "nb_space3", "nb_space4"];
    var type2 = ["name_space1", "nb_space1"];
    switch (gridtype) {
        case "square":
            for (var i of type) {
                document.getElementById(i).style.display = "inline";
            }
            for (var i of type2) {
                document.getElementById(i).style.display = "inline";
            }
            document.getElementById("name_size1").innerHTML = "Columns：";
            document.getElementById("name_space1").innerHTML = "Over：";
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
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("name_space1").innerHTML = "Side: ";
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
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("name_space1").innerHTML = "Border: ";
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
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("name_space1").innerHTML = "Border：";
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
            document.getElementById("name_size1").innerHTML = "Side：";
            document.getElementById("nb_size1").value = 5;
            document.getElementById("nb_size3").value = 34;
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
    if (confirm("Are you sure want to reset the current board? To only change display size and grid lines use 'Change grid'")) {
        create_newboard();
        pu.redraw();
    }
}

function newgrid() {
    var size = parseInt(document.getElementById("nb_size3").value);
    if (15 <= size && size <= 80) {
        pu.reset_frame_newgrid();
        pu.redraw();
        panel_pu.draw_panel();
        document.getElementById('modal').style.display = 'none';
    } else {
        alert("Display size must be in the range 12-80");
    }
}

function newgrid_r() {
    var sizer = parseInt(document.getElementById("nb_size3_r").value, 10);
    document.getElementById("nb_size3").value = sizer;
    if (15 <= sizer && sizer <= 80) {
        pu.reset_frame_newgrid();
        pu.size = sizer;
        pu.redraw();
        panel_pu.draw_panel();
        document.getElementById('modal-newsize').style.display = 'none';
    } else {
        alert("Display size must be in the range 12-80");
    }
}

function newsize() {
    document.getElementById('modal-newsize').style.display = 'block';
}

function panel_onoff() {
    if (document.getElementById('panel_button').textContent === "OFF") {
        document.getElementById('panel_button').textContent = "ON";
        document.getElementById('float-key').style.display = "block";
        document.getElementById('float-key-body').style.left = 0 + "px";
        document.getElementById('float-key-body').style.top = 0 + "px";
        document.getElementById('float-key-header').style.left = 0 + "px";
        document.getElementById('float-key-header').style.top = 0 + "px";
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

function ResetCheck() {
    if (confirm("Erase the selected Mode elements?")) {
        pu.reset_selectedmode();
    }
}

function DeleteCheck() {
    var text;
    if (document.getElementById("pu_q").checked) {
        text = "problem";
    } else if (document.getElementById("pu_a").checked) {
        text = "solution";
    }
    if (confirm("Delete everything in " + text + "?")) {
        pu.reset_board();
        pu.redraw();
        // reset undo/redo
        pu.command_undo = new Stack();
        pu.command_redo = new Stack();
    }
}

function saveimage() {
    document.getElementById("modal-image").style.display = 'block';
}

function saveimage_download() {
    var downloadLink = document.getElementById('download_link');
    var filename = document.getElementById('saveimagename').value;
    if (filename.slice(-4) != ".png") {
        filename += ".png";
    }
    var str_sym = "\\/:*?\"<>|";
    var valid_name = 1;
    for (var i = 0; i < filename.length; i++) {
        if (str_sym.indexOf(filename[i]) != -1) {
            valid_name = 0;
        }
    }

    if (valid_name) {
        if (pu.canvas.msToBlob) {
            var blob = pu.canvas.msToBlob();
            window.navigator.msSaveBlob(blob, filename);
        } else {
            downloadLink.href = pu.resizecanvas();
            downloadLink.download = filename;
            downloadLink.click();
        }
    } else {
        alert("The characters \\/:*?\"<>| cannot be used in filename")
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
    //text = text.split("?")[0]+"?m=solve&"+text.split("?")[1];
    document.getElementById("savetextarea").value = text;
}

function savetext_withsolution() {
    var text = pu.maketext_solve_solution();
    //text = text.split("?")[0]+"?m=solve&"+text.split("?")[1];
    document.getElementById("savetextarea").value = text;
}

function make_ppfile() {
    var text = pu.maketext_ppfile();
    //text = text.split("?")[0]+"?m=solve&"+text.split("?")[1];
    document.getElementById("savetextarea").value = text;
}

function make_gmpfile() {
    var text = pu.maketext_gmpfile();
    //text = text.split("?")[0]+"?m=solve&"+text.split("?")[1];
    document.getElementById("savetextarea").value = text;
}

function savetext_copy() {
    var textarea = document.getElementById("savetextarea");
    textarea.select();
    var range = document.createRange();
    range.selectNodeContents(textarea);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    textarea.setSelectionRange(0, 1e5);
    alert("URL is copied to clipboard");
    document.execCommand("copy");
}

function savetext_download() {
    var text = document.getElementById("savetextarea").value;
    var downloadLink = document.getElementById('download_link');
    var filename = document.getElementById("savetextname").value;
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
        alert("The characters \\/:*?\"<>| cannot be used in filename");
    }
}

function savetext_window() {
    var text = document.getElementById("savetextarea").value;
    if (text) {
        window.open(text);
    }
}

function shorturl_tab() {
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
    var address = pu.maketext();
    if (pu.mmode === "solve") {
        address = address + "&l=solvedup";
    }
    window.open(address);
}

function load(urlParam) {
    //try{
    var param = urlParam.split('&');
    var paramArray = [];

    //アドレスを要素に分解
    for (var i = 0; i < param.length; i++) {
        var paramItem = param[i].split('=');
        paramArray[paramItem[0]] = paramItem[1];
    }

    //pを復号
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

    //初期設定を読み込み
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

    make_class(rtext_para[0]);

    pu.theta = parseInt(rtext_para[4]);
    pu.reflect[0] = parseInt(rtext_para[5]);
    pu.reflect[1] = parseInt(rtext_para[6]);

    pu.canvasx = parseInt(rtext_para[7]);
    pu.canvasy = parseInt(rtext_para[8]);
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

        //classがコピーできないので別
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
        }
    }

    if (paramArray.l === "solvedup") {
        set_solvemode();
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
    pu.mode_set(pu.mode[pu.mode.qa].edit_mode); //include redraw
}

function loadver1(paramArray, rtext) {
    //初期設定を読み込み
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
    //pu.center_n = parseInt(rtext_para[9]);
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

    //描画
    pu.create_point();
    pu.point_move((pu.canvasx * 0.5 - pu.point[pu.center_n].x + 0.5), (pu.canvasy * 0.5 - pu.point[pu.center_n].y + 0.5), pu.theta);
    pu.canvas_size_setting();
    pu.cursol = pu.centerlist[0];

    pu.centerlist = pre_centerlist;
    pu.make_frameline(); //盤面描画
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
    document.getElementById("title").innerHTML = "Answer mode"
    document.getElementById("nb_size3_r").value = document.getElementById("nb_size3").value;
    document.getElementById("newsize").style.display = "inline";
    document.getElementById("pu_a").checked = true;
    document.getElementById("pu_q_label").style.display = "none";
    //document.getElementById("savetext").style.display = "none";
    document.getElementById("newboard").style.display = "none";
    document.getElementById("rotation").style.display = "none";
    document.getElementById("mo_cage_lb").style.display = "none";
    //document.getElementById("mo_move_lb").style.display = "none";
    document.getElementById("mo_special_lb").style.display = "none";
    document.getElementById("mo_board_lb").style.display = "none";
    document.getElementById("sub_lineE5_lb").style.display = "none";
    document.getElementById("tb_delete").value = "Delete"
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

/*Copyright (c) 2017 Yuzo Matsuzawa*/

(function(target) {
    if (!target || !target.prototype)
        return;
    target.prototype.text = function(text, x, y, width = 1e4) {
        var fontsize = parseFloat(this.font.split("px")[0]);
        this.strokeText(text, x, y + 0.28 * fontsize, width);
        this.fillText(text, x, y + 0.28 * fontsize, width);
    };
    target.prototype.arrow = function(startX, startY, endX, endY, controlPoints) {
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
        var a = [];
        a.push(0, 0);
        for (var i = 0; i < controlPoints.length; i += 2) {
            var x = controlPoints[i];
            var y = controlPoints[i + 1];
            a.push(x < 0 ? len + x : x, y);
        }
        a.push(len, 0);
        for (var i = controlPoints.length; i > 0; i -= 2) {
            var x = controlPoints[i - 2];
            var y = controlPoints[i - 1];
            a.push(x < 0 ? len + x : x, -y);
        }
        a.push(0, 0);
        for (var i = 0; i < a.length; i += 2) {
            var x = a[i] * cos - a[i + 1] * sin + startX;
            var y = a[i] * sin + a[i + 1] * cos + startY;
            if (i === 0) this.moveTo(x, y);
            else this.lineTo(x, y);
        }
    };
})(CanvasRenderingContext2D);

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function() {
    'use strict';
    var n = void 0,
        u = !0,
        aa = this;

    function ba(e, d) {
        var c = e.split("."),
            f = aa;
        !(c[0] in f) && f.execScript && f.execScript("var " + c[0]);
        for (var a; c.length && (a = c.shift());) !c.length && d !== n ? f[a] = d : f = f[a] ? f[a] : f[a] = {}
    };
    var C = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;

    function K(e, d) {
        this.index = "number" === typeof d ? d : 0;
        this.d = 0;
        this.buffer = e instanceof(C ? Uint8Array : Array) ? e : new(C ? Uint8Array : Array)(32768);
        if (2 * this.buffer.length <= this.index) throw Error("invalid index");
        this.buffer.length <= this.index && ca(this)
    }

    function ca(e) {
        var d = e.buffer,
            c, f = d.length,
            a = new(C ? Uint8Array : Array)(f << 1);
        if (C) a.set(d);
        else
            for (c = 0; c < f; ++c) a[c] = d[c];
        return e.buffer = a
    }
    K.prototype.a = function(e, d, c) {
        var f = this.buffer,
            a = this.index,
            b = this.d,
            k = f[a],
            m;
        c && 1 < d && (e = 8 < d ? (L[e & 255] << 24 | L[e >>> 8 & 255] << 16 | L[e >>> 16 & 255] << 8 | L[e >>> 24 & 255]) >> 32 - d : L[e] >> 8 - d);
        if (8 > d + b) k = k << d | e, b += d;
        else
            for (m = 0; m < d; ++m) k = k << 1 | e >> d - m - 1 & 1, 8 === ++b && (b = 0, f[a++] = L[k], k = 0, a === f.length && (f = ca(this)));
        f[a] = k;
        this.buffer = f;
        this.d = b;
        this.index = a
    };
    K.prototype.finish = function() {
        var e = this.buffer,
            d = this.index,
            c;
        0 < this.d && (e[d] <<= 8 - this.d, e[d] = L[e[d]], d++);
        C ? c = e.subarray(0, d) : (e.length = d, c = e);
        return c
    };
    var ga = new(C ? Uint8Array : Array)(256),
        M;
    for (M = 0; 256 > M; ++M) {
        for (var R = M, S = R, ha = 7, R = R >>> 1; R; R >>>= 1) S <<= 1, S |= R & 1, --ha;
        ga[M] = (S << ha & 255) >>> 0
    }
    var L = ga;

    function ja(e) {
        this.buffer = new(C ? Uint16Array : Array)(2 * e);
        this.length = 0
    }
    ja.prototype.getParent = function(e) { return 2 * ((e - 2) / 4 | 0) };
    ja.prototype.push = function(e, d) {
        var c, f, a = this.buffer,
            b;
        c = this.length;
        a[this.length++] = d;
        for (a[this.length++] = e; 0 < c;)
            if (f = this.getParent(c), a[c] > a[f]) b = a[c], a[c] = a[f], a[f] = b, b = a[c + 1], a[c + 1] = a[f + 1], a[f + 1] = b, c = f;
            else break;
        return this.length
    };
    ja.prototype.pop = function() {
        var e, d, c = this.buffer,
            f, a, b;
        d = c[0];
        e = c[1];
        this.length -= 2;
        c[0] = c[this.length];
        c[1] = c[this.length + 1];
        for (b = 0;;) {
            a = 2 * b + 2;
            if (a >= this.length) break;
            a + 2 < this.length && c[a + 2] > c[a] && (a += 2);
            if (c[a] > c[b]) f = c[b], c[b] = c[a], c[a] = f, f = c[b + 1], c[b + 1] = c[a + 1], c[a + 1] = f;
            else break;
            b = a
        }
        return { index: e, value: d, length: this.length }
    };

    function ka(e, d) {
        this.e = ma;
        this.f = 0;
        this.input = C && e instanceof Array ? new Uint8Array(e) : e;
        this.c = 0;
        d && (d.lazy && (this.f = d.lazy), "number" === typeof d.compressionType && (this.e = d.compressionType), d.outputBuffer && (this.b = C && d.outputBuffer instanceof Array ? new Uint8Array(d.outputBuffer) : d.outputBuffer), "number" === typeof d.outputIndex && (this.c = d.outputIndex));
        this.b || (this.b = new(C ? Uint8Array : Array)(32768))
    }
    var ma = 2,
        T = [],
        U;
    for (U = 0; 288 > U; U++) switch (u) {
        case 143 >= U:
            T.push([U + 48, 8]);
            break;
        case 255 >= U:
            T.push([U - 144 + 400, 9]);
            break;
        case 279 >= U:
            T.push([U - 256 + 0, 7]);
            break;
        case 287 >= U:
            T.push([U - 280 + 192, 8]);
            break;
        default:
            throw "invalid literal: " + U;
    }
    ka.prototype.h = function() {
        var e, d, c, f, a = this.input;
        switch (this.e) {
            case 0:
                c = 0;
                for (f = a.length; c < f;) {
                    d = C ? a.subarray(c, c + 65535) : a.slice(c, c + 65535);
                    c += d.length;
                    var b = d,
                        k = c === f,
                        m = n,
                        g = n,
                        p = n,
                        v = n,
                        x = n,
                        l = this.b,
                        h = this.c;
                    if (C) {
                        for (l = new Uint8Array(this.b.buffer); l.length <= h + b.length + 5;) l = new Uint8Array(l.length << 1);
                        l.set(this.b)
                    }
                    m = k ? 1 : 0;
                    l[h++] = m | 0;
                    g = b.length;
                    p = ~g + 65536 & 65535;
                    l[h++] = g & 255;
                    l[h++] = g >>> 8 & 255;
                    l[h++] = p & 255;
                    l[h++] = p >>> 8 & 255;
                    if (C) l.set(b, h), h += b.length, l = l.subarray(0, h);
                    else {
                        v = 0;
                        for (x = b.length; v < x; ++v) l[h++] =
                            b[v];
                        l.length = h
                    }
                    this.c = h;
                    this.b = l
                }
                break;
            case 1:
                var q = new K(C ? new Uint8Array(this.b.buffer) : this.b, this.c);
                q.a(1, 1, u);
                q.a(1, 2, u);
                var t = na(this, a),
                    w, da, z;
                w = 0;
                for (da = t.length; w < da; w++)
                    if (z = t[w], K.prototype.a.apply(q, T[z]), 256 < z) q.a(t[++w], t[++w], u), q.a(t[++w], 5), q.a(t[++w], t[++w], u);
                    else if (256 === z) break;
                this.b = q.finish();
                this.c = this.b.length;
                break;
            case ma:
                var B = new K(C ? new Uint8Array(this.b.buffer) : this.b, this.c),
                    ra, J, N, O, P, Ia = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
                    W, sa, X, ta, ea, ia = Array(19),
                    ua, Q, fa, y, va;
                ra = ma;
                B.a(1, 1, u);
                B.a(ra, 2, u);
                J = na(this, a);
                W = oa(this.j, 15);
                sa = pa(W);
                X = oa(this.i, 7);
                ta = pa(X);
                for (N = 286; 257 < N && 0 === W[N - 1]; N--);
                for (O = 30; 1 < O && 0 === X[O - 1]; O--);
                var wa = N,
                    xa = O,
                    F = new(C ? Uint32Array : Array)(wa + xa),
                    r, G, s, Y, E = new(C ? Uint32Array : Array)(316),
                    D, A, H = new(C ? Uint8Array : Array)(19);
                for (r = G = 0; r < wa; r++) F[G++] = W[r];
                for (r = 0; r < xa; r++) F[G++] = X[r];
                if (!C) { r = 0; for (Y = H.length; r < Y; ++r) H[r] = 0 } r = D = 0;
                for (Y = F.length; r < Y; r += G) {
                    for (G = 1; r + G < Y && F[r + G] === F[r]; ++G);
                    s = G;
                    if (0 === F[r])
                        if (3 > s)
                            for (; 0 < s--;) E[D++] = 0,
                                H[0]++;
                        else
                            for (; 0 < s;) A = 138 > s ? s : 138, A > s - 3 && A < s && (A = s - 3), 10 >= A ? (E[D++] = 17, E[D++] = A - 3, H[17]++) : (E[D++] = 18, E[D++] = A - 11, H[18]++), s -= A;
                    else if (E[D++] = F[r], H[F[r]]++, s--, 3 > s)
                        for (; 0 < s--;) E[D++] = F[r], H[F[r]]++;
                    else
                        for (; 0 < s;) A = 6 > s ? s : 6, A > s - 3 && A < s && (A = s - 3), E[D++] = 16, E[D++] = A - 3, H[16]++, s -= A
                }
                e = C ? E.subarray(0, D) : E.slice(0, D);
                ea = oa(H, 7);
                for (y = 0; 19 > y; y++) ia[y] = ea[Ia[y]];
                for (P = 19; 4 < P && 0 === ia[P - 1]; P--);
                ua = pa(ea);
                B.a(N - 257, 5, u);
                B.a(O - 1, 5, u);
                B.a(P - 4, 4, u);
                for (y = 0; y < P; y++) B.a(ia[y], 3, u);
                y = 0;
                for (va = e.length; y < va; y++)
                    if (Q =
                        e[y], B.a(ua[Q], ea[Q], u), 16 <= Q) {
                        y++;
                        switch (Q) {
                            case 16:
                                fa = 2;
                                break;
                            case 17:
                                fa = 3;
                                break;
                            case 18:
                                fa = 7;
                                break;
                            default:
                                throw "invalid code: " + Q;
                        }
                        B.a(e[y], fa, u)
                    } var ya = [sa, W],
                    za = [ta, X],
                    I, Aa, Z, la, Ba, Ca, Da, Ea;
                Ba = ya[0];
                Ca = ya[1];
                Da = za[0];
                Ea = za[1];
                I = 0;
                for (Aa = J.length; I < Aa; ++I)
                    if (Z = J[I], B.a(Ba[Z], Ca[Z], u), 256 < Z) B.a(J[++I], J[++I], u), la = J[++I], B.a(Da[la], Ea[la], u), B.a(J[++I], J[++I], u);
                    else if (256 === Z) break;
                this.b = B.finish();
                this.c = this.b.length;
                break;
            default:
                throw "invalid compression type";
        }
        return this.b
    };

    function qa(e, d) {
        this.length = e;
        this.g = d
    }
    var Fa = function() {
            function e(a) {
                switch (u) {
                    case 3 === a:
                        return [257, a - 3, 0];
                    case 4 === a:
                        return [258, a - 4, 0];
                    case 5 === a:
                        return [259, a - 5, 0];
                    case 6 === a:
                        return [260, a - 6, 0];
                    case 7 === a:
                        return [261, a - 7, 0];
                    case 8 === a:
                        return [262, a - 8, 0];
                    case 9 === a:
                        return [263, a - 9, 0];
                    case 10 === a:
                        return [264, a - 10, 0];
                    case 12 >= a:
                        return [265, a - 11, 1];
                    case 14 >= a:
                        return [266, a - 13, 1];
                    case 16 >= a:
                        return [267, a - 15, 1];
                    case 18 >= a:
                        return [268, a - 17, 1];
                    case 22 >= a:
                        return [269, a - 19, 2];
                    case 26 >= a:
                        return [270, a - 23, 2];
                    case 30 >= a:
                        return [271, a - 27, 2];
                    case 34 >= a:
                        return [272,
                            a - 31, 2
                        ];
                    case 42 >= a:
                        return [273, a - 35, 3];
                    case 50 >= a:
                        return [274, a - 43, 3];
                    case 58 >= a:
                        return [275, a - 51, 3];
                    case 66 >= a:
                        return [276, a - 59, 3];
                    case 82 >= a:
                        return [277, a - 67, 4];
                    case 98 >= a:
                        return [278, a - 83, 4];
                    case 114 >= a:
                        return [279, a - 99, 4];
                    case 130 >= a:
                        return [280, a - 115, 4];
                    case 162 >= a:
                        return [281, a - 131, 5];
                    case 194 >= a:
                        return [282, a - 163, 5];
                    case 226 >= a:
                        return [283, a - 195, 5];
                    case 257 >= a:
                        return [284, a - 227, 5];
                    case 258 === a:
                        return [285, a - 258, 0];
                    default:
                        throw "invalid length: " + a;
                }
            }
            var d = [],
                c, f;
            for (c = 3; 258 >= c; c++) f = e(c), d[c] = f[2] << 24 |
                f[1] << 16 | f[0];
            return d
        }(),
        Ga = C ? new Uint32Array(Fa) : Fa;

    function na(e, d) {
        function c(a, c) {
            var b = a.g,
                d = [],
                f = 0,
                e;
            e = Ga[a.length];
            d[f++] = e & 65535;
            d[f++] = e >> 16 & 255;
            d[f++] = e >> 24;
            var g;
            switch (u) {
                case 1 === b:
                    g = [0, b - 1, 0];
                    break;
                case 2 === b:
                    g = [1, b - 2, 0];
                    break;
                case 3 === b:
                    g = [2, b - 3, 0];
                    break;
                case 4 === b:
                    g = [3, b - 4, 0];
                    break;
                case 6 >= b:
                    g = [4, b - 5, 1];
                    break;
                case 8 >= b:
                    g = [5, b - 7, 1];
                    break;
                case 12 >= b:
                    g = [6, b - 9, 2];
                    break;
                case 16 >= b:
                    g = [7, b - 13, 2];
                    break;
                case 24 >= b:
                    g = [8, b - 17, 3];
                    break;
                case 32 >= b:
                    g = [9, b - 25, 3];
                    break;
                case 48 >= b:
                    g = [10, b - 33, 4];
                    break;
                case 64 >= b:
                    g = [11, b - 49, 4];
                    break;
                case 96 >= b:
                    g = [12, b -
                        65, 5
                    ];
                    break;
                case 128 >= b:
                    g = [13, b - 97, 5];
                    break;
                case 192 >= b:
                    g = [14, b - 129, 6];
                    break;
                case 256 >= b:
                    g = [15, b - 193, 6];
                    break;
                case 384 >= b:
                    g = [16, b - 257, 7];
                    break;
                case 512 >= b:
                    g = [17, b - 385, 7];
                    break;
                case 768 >= b:
                    g = [18, b - 513, 8];
                    break;
                case 1024 >= b:
                    g = [19, b - 769, 8];
                    break;
                case 1536 >= b:
                    g = [20, b - 1025, 9];
                    break;
                case 2048 >= b:
                    g = [21, b - 1537, 9];
                    break;
                case 3072 >= b:
                    g = [22, b - 2049, 10];
                    break;
                case 4096 >= b:
                    g = [23, b - 3073, 10];
                    break;
                case 6144 >= b:
                    g = [24, b - 4097, 11];
                    break;
                case 8192 >= b:
                    g = [25, b - 6145, 11];
                    break;
                case 12288 >= b:
                    g = [26, b - 8193, 12];
                    break;
                case 16384 >=
                b:
                    g = [27, b - 12289, 12];
                    break;
                case 24576 >= b:
                    g = [28, b - 16385, 13];
                    break;
                case 32768 >= b:
                    g = [29, b - 24577, 13];
                    break;
                default:
                    throw "invalid distance";
            }
            e = g;
            d[f++] = e[0];
            d[f++] = e[1];
            d[f++] = e[2];
            var k, m;
            k = 0;
            for (m = d.length; k < m; ++k) l[h++] = d[k];
            t[d[0]]++;
            w[d[3]]++;
            q = a.length + c - 1;
            x = null
        }
        var f, a, b, k, m, g = {},
            p, v, x, l = C ? new Uint16Array(2 * d.length) : [],
            h = 0,
            q = 0,
            t = new(C ? Uint32Array : Array)(286),
            w = new(C ? Uint32Array : Array)(30),
            da = e.f,
            z;
        if (!C) { for (b = 0; 285 >= b;) t[b++] = 0; for (b = 0; 29 >= b;) w[b++] = 0 } t[256] = 1;
        f = 0;
        for (a = d.length; f < a; ++f) {
            b =
                m = 0;
            for (k = 3; b < k && f + b !== a; ++b) m = m << 8 | d[f + b];
            g[m] === n && (g[m] = []);
            p = g[m];
            if (!(0 < q--)) {
                for (; 0 < p.length && 32768 < f - p[0];) p.shift();
                if (f + 3 >= a) {
                    x && c(x, -1);
                    b = 0;
                    for (k = a - f; b < k; ++b) z = d[f + b], l[h++] = z, ++t[z];
                    break
                }
                0 < p.length ? (v = Ha(d, f, p), x ? x.length < v.length ? (z = d[f - 1], l[h++] = z, ++t[z], c(v, 0)) : c(x, -1) : v.length < da ? x = v : c(v, 0)) : x ? c(x, -1) : (z = d[f], l[h++] = z, ++t[z])
            }
            p.push(f)
        }
        l[h++] = 256;
        t[256]++;
        e.j = t;
        e.i = w;
        return C ? l.subarray(0, h) : l
    }

    function Ha(e, d, c) {
        var f, a, b = 0,
            k, m, g, p, v = e.length;
        m = 0;
        p = c.length;
        a: for (; m < p; m++) {
            f = c[p - m - 1];
            k = 3;
            if (3 < b) {
                for (g = b; 3 < g; g--)
                    if (e[f + g - 1] !== e[d + g - 1]) continue a;
                k = b
            }
            for (; 258 > k && d + k < v && e[f + k] === e[d + k];) ++k;
            k > b && (a = f, b = k);
            if (258 === k) break
        }
        return new qa(b, d - a)
    }

    function oa(e, d) {
        var c = e.length,
            f = new ja(572),
            a = new(C ? Uint8Array : Array)(c),
            b, k, m, g, p;
        if (!C)
            for (g = 0; g < c; g++) a[g] = 0;
        for (g = 0; g < c; ++g) 0 < e[g] && f.push(g, e[g]);
        b = Array(f.length / 2);
        k = new(C ? Uint32Array : Array)(f.length / 2);
        if (1 === b.length) return a[f.pop().index] = 1, a;
        g = 0;
        for (p = f.length / 2; g < p; ++g) b[g] = f.pop(), k[g] = b[g].value;
        m = Ja(k, k.length, d);
        g = 0;
        for (p = b.length; g < p; ++g) a[b[g].index] = m[g];
        return a
    }

    function Ja(e, d, c) {
        function f(a) {
            var b = g[a][p[a]];
            b === d ? (f(a + 1), f(a + 1)) : --k[b];
            ++p[a]
        }
        var a = new(C ? Uint16Array : Array)(c),
            b = new(C ? Uint8Array : Array)(c),
            k = new(C ? Uint8Array : Array)(d),
            m = Array(c),
            g = Array(c),
            p = Array(c),
            v = (1 << c) - d,
            x = 1 << c - 1,
            l, h, q, t, w;
        a[c - 1] = d;
        for (h = 0; h < c; ++h) v < x ? b[h] = 0 : (b[h] = 1, v -= x), v <<= 1, a[c - 2 - h] = (a[c - 1 - h] / 2 | 0) + d;
        a[0] = b[0];
        m[0] = Array(a[0]);
        g[0] = Array(a[0]);
        for (h = 1; h < c; ++h) a[h] > 2 * a[h - 1] + b[h] && (a[h] = 2 * a[h - 1] + b[h]), m[h] = Array(a[h]), g[h] = Array(a[h]);
        for (l = 0; l < d; ++l) k[l] = c;
        for (q = 0; q < a[c - 1]; ++q) m[c -
            1][q] = e[q], g[c - 1][q] = q;
        for (l = 0; l < c; ++l) p[l] = 0;
        1 === b[c - 1] && (--k[0], ++p[c - 1]);
        for (h = c - 2; 0 <= h; --h) {
            t = l = 0;
            w = p[h + 1];
            for (q = 0; q < a[h]; q++) t = m[h + 1][w] + m[h + 1][w + 1], t > e[l] ? (m[h][q] = t, g[h][q] = d, w += 2) : (m[h][q] = e[l], g[h][q] = l, ++l);
            p[h] = 0;
            1 === b[h] && f(h)
        }
        return k
    }

    function pa(e) {
        var d = new(C ? Uint16Array : Array)(e.length),
            c = [],
            f = [],
            a = 0,
            b, k, m, g;
        b = 0;
        for (k = e.length; b < k; b++) c[e[b]] = (c[e[b]] | 0) + 1;
        b = 1;
        for (k = 16; b <= k; b++) f[b] = a, a += c[b] | 0, a <<= 1;
        b = 0;
        for (k = e.length; b < k; b++) {
            a = f[e[b]];
            f[e[b]] += 1;
            m = d[b] = 0;
            for (g = e[b]; m < g; m++) d[b] = d[b] << 1 | a & 1, a >>>= 1
        }
        return d
    };
    ba("Zlib.RawDeflate", ka);
    ba("Zlib.RawDeflate.prototype.compress", ka.prototype.h);
    var Ka = { NONE: 0, FIXED: 1, DYNAMIC: ma },
        V, La, $, Ma;
    if (Object.keys) V = Object.keys(Ka);
    else
        for (La in V = [], $ = 0, Ka) V[$++] = La;
    $ = 0;
    for (Ma = V.length; $ < Ma; ++$) La = V[$], ba("Zlib.RawDeflate.CompressionType." + La, Ka[La]);
}).call(this);

/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function() {
    'use strict';
    var k = void 0,
        aa = this;

    function r(c, d) {
        var a = c.split("."),
            b = aa;
        !(a[0] in b) && b.execScript && b.execScript("var " + a[0]);
        for (var e; a.length && (e = a.shift());) !a.length && d !== k ? b[e] = d : b = b[e] ? b[e] : b[e] = {}
    };
    var t = "undefined" !== typeof Uint8Array && "undefined" !== typeof Uint16Array && "undefined" !== typeof Uint32Array && "undefined" !== typeof DataView;

    function u(c) {
        var d = c.length,
            a = 0,
            b = Number.POSITIVE_INFINITY,
            e, f, g, h, l, n, m, p, s, x;
        for (p = 0; p < d; ++p) c[p] > a && (a = c[p]), c[p] < b && (b = c[p]);
        e = 1 << a;
        f = new(t ? Uint32Array : Array)(e);
        g = 1;
        h = 0;
        for (l = 2; g <= a;) {
            for (p = 0; p < d; ++p)
                if (c[p] === g) {
                    n = 0;
                    m = h;
                    for (s = 0; s < g; ++s) n = n << 1 | m & 1, m >>= 1;
                    x = g << 16 | p;
                    for (s = n; s < e; s += l) f[s] = x;
                    ++h
                }++ g;
            h <<= 1;
            l <<= 1
        }
        return [f, a, b]
    };

    function w(c, d) {
        this.g = [];
        this.h = 32768;
        this.c = this.f = this.d = this.k = 0;
        this.input = t ? new Uint8Array(c) : c;
        this.l = !1;
        this.i = y;
        this.p = !1;
        if (d || !(d = {})) d.index && (this.d = d.index), d.bufferSize && (this.h = d.bufferSize), d.bufferType && (this.i = d.bufferType), d.resize && (this.p = d.resize);
        switch (this.i) {
            case A:
                this.a = 32768;
                this.b = new(t ? Uint8Array : Array)(32768 + this.h + 258);
                break;
            case y:
                this.a = 0;
                this.b = new(t ? Uint8Array : Array)(this.h);
                this.e = this.u;
                this.m = this.r;
                this.j = this.s;
                break;
            default:
                throw Error("invalid inflate mode");
        }
    }
    var A = 0,
        y = 1;
    w.prototype.t = function() {
        for (; !this.l;) {
            var c = B(this, 3);
            c & 1 && (this.l = !0);
            c >>>= 1;
            switch (c) {
                case 0:
                    var d = this.input,
                        a = this.d,
                        b = this.b,
                        e = this.a,
                        f = d.length,
                        g = k,
                        h = k,
                        l = b.length,
                        n = k;
                    this.c = this.f = 0;
                    if (a + 1 >= f) throw Error("invalid uncompressed block header: LEN");
                    g = d[a++] | d[a++] << 8;
                    if (a + 1 >= f) throw Error("invalid uncompressed block header: NLEN");
                    h = d[a++] | d[a++] << 8;
                    if (g === ~h) throw Error("invalid uncompressed block header: length verify");
                    if (a + g > d.length) throw Error("input buffer is broken");
                    switch (this.i) {
                        case A:
                            for (; e + g >
                                b.length;) {
                                n = l - e;
                                g -= n;
                                if (t) b.set(d.subarray(a, a + n), e), e += n, a += n;
                                else
                                    for (; n--;) b[e++] = d[a++];
                                this.a = e;
                                b = this.e();
                                e = this.a
                            }
                            break;
                        case y:
                            for (; e + g > b.length;) b = this.e({ o: 2 });
                            break;
                        default:
                            throw Error("invalid inflate mode");
                    }
                    if (t) b.set(d.subarray(a, a + g), e), e += g, a += g;
                    else
                        for (; g--;) b[e++] = d[a++];
                    this.d = a;
                    this.a = e;
                    this.b = b;
                    break;
                case 1:
                    this.j(ba, ca);
                    break;
                case 2:
                    for (var m = B(this, 5) + 257, p = B(this, 5) + 1, s = B(this, 4) + 4, x = new(t ? Uint8Array : Array)(C.length), Q = k, R = k, S = k, v = k, M = k, F = k, z = k, q = k, T = k, q = 0; q < s; ++q) x[C[q]] =
                        B(this, 3);
                    if (!t) { q = s; for (s = x.length; q < s; ++q) x[C[q]] = 0 } Q = u(x);
                    v = new(t ? Uint8Array : Array)(m + p);
                    q = 0;
                    for (T = m + p; q < T;) switch (M = D(this, Q), M) {
                        case 16:
                            for (z = 3 + B(this, 2); z--;) v[q++] = F;
                            break;
                        case 17:
                            for (z = 3 + B(this, 3); z--;) v[q++] = 0;
                            F = 0;
                            break;
                        case 18:
                            for (z = 11 + B(this, 7); z--;) v[q++] = 0;
                            F = 0;
                            break;
                        default:
                            F = v[q++] = M
                    }
                    R = t ? u(v.subarray(0, m)) : u(v.slice(0, m));
                    S = t ? u(v.subarray(m)) : u(v.slice(m));
                    this.j(R, S);
                    break;
                default:
                    throw Error("unknown BTYPE: " + c);
            }
        }
        return this.m()
    };
    var E = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15],
        C = t ? new Uint16Array(E) : E,
        G = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258, 258, 258],
        H = t ? new Uint16Array(G) : G,
        I = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0, 0, 0],
        J = t ? new Uint8Array(I) : I,
        K = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
        L = t ? new Uint16Array(K) : K,
        N = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13,
            13
        ],
        O = t ? new Uint8Array(N) : N,
        P = new(t ? Uint8Array : Array)(288),
        U, da;
    U = 0;
    for (da = P.length; U < da; ++U) P[U] = 143 >= U ? 8 : 255 >= U ? 9 : 279 >= U ? 7 : 8;
    var ba = u(P),
        V = new(t ? Uint8Array : Array)(30),
        W, ea;
    W = 0;
    for (ea = V.length; W < ea; ++W) V[W] = 5;
    var ca = u(V);

    function B(c, d) {
        for (var a = c.f, b = c.c, e = c.input, f = c.d, g = e.length, h; b < d;) {
            if (f >= g) throw Error("input buffer is broken");
            a |= e[f++] << b;
            b += 8
        }
        h = a & (1 << d) - 1;
        c.f = a >>> d;
        c.c = b - d;
        c.d = f;
        return h
    }

    function D(c, d) {
        for (var a = c.f, b = c.c, e = c.input, f = c.d, g = e.length, h = d[0], l = d[1], n, m; b < l && !(f >= g);) a |= e[f++] << b, b += 8;
        n = h[a & (1 << l) - 1];
        m = n >>> 16;
        if (m > b) throw Error("invalid code length: " + m);
        c.f = a >> m;
        c.c = b - m;
        c.d = f;
        return n & 65535
    }
    w.prototype.j = function(c, d) {
        var a = this.b,
            b = this.a;
        this.n = c;
        for (var e = a.length - 258, f, g, h, l; 256 !== (f = D(this, c));)
            if (256 > f) b >= e && (this.a = b, a = this.e(), b = this.a), a[b++] = f;
            else {
                g = f - 257;
                l = H[g];
                0 < J[g] && (l += B(this, J[g]));
                f = D(this, d);
                h = L[f];
                0 < O[f] && (h += B(this, O[f]));
                b >= e && (this.a = b, a = this.e(), b = this.a);
                for (; l--;) a[b] = a[b++ - h]
            } for (; 8 <= this.c;) this.c -= 8, this.d--;
        this.a = b
    };
    w.prototype.s = function(c, d) {
        var a = this.b,
            b = this.a;
        this.n = c;
        for (var e = a.length, f, g, h, l; 256 !== (f = D(this, c));)
            if (256 > f) b >= e && (a = this.e(), e = a.length), a[b++] = f;
            else {
                g = f - 257;
                l = H[g];
                0 < J[g] && (l += B(this, J[g]));
                f = D(this, d);
                h = L[f];
                0 < O[f] && (h += B(this, O[f]));
                b + l > e && (a = this.e(), e = a.length);
                for (; l--;) a[b] = a[b++ - h]
            } for (; 8 <= this.c;) this.c -= 8, this.d--;
        this.a = b
    };
    w.prototype.e = function() {
        var c = new(t ? Uint8Array : Array)(this.a - 32768),
            d = this.a - 32768,
            a, b, e = this.b;
        if (t) c.set(e.subarray(32768, c.length));
        else { a = 0; for (b = c.length; a < b; ++a) c[a] = e[a + 32768] } this.g.push(c);
        this.k += c.length;
        if (t) e.set(e.subarray(d, d + 32768));
        else
            for (a = 0; 32768 > a; ++a) e[a] = e[d + a];
        this.a = 32768;
        return e
    };
    w.prototype.u = function(c) {
        var d, a = this.input.length / this.d + 1 | 0,
            b, e, f, g = this.input,
            h = this.b;
        c && ("number" === typeof c.o && (a = c.o), "number" === typeof c.q && (a += c.q));
        2 > a ? (b = (g.length - this.d) / this.n[2], f = 258 * (b / 2) | 0, e = f < h.length ? h.length + f : h.length << 1) : e = h.length * a;
        t ? (d = new Uint8Array(e), d.set(h)) : d = h;
        return this.b = d
    };
    w.prototype.m = function() {
        var c = 0,
            d = this.b,
            a = this.g,
            b, e = new(t ? Uint8Array : Array)(this.k + (this.a - 32768)),
            f, g, h, l;
        if (0 === a.length) return t ? this.b.subarray(32768, this.a) : this.b.slice(32768, this.a);
        f = 0;
        for (g = a.length; f < g; ++f) {
            b = a[f];
            h = 0;
            for (l = b.length; h < l; ++h) e[c++] = b[h]
        }
        f = 32768;
        for (g = this.a; f < g; ++f) e[c++] = d[f];
        this.g = [];
        return this.buffer = e
    };
    w.prototype.r = function() {
        var c, d = this.a;
        t ? this.p ? (c = new Uint8Array(d), c.set(this.b.subarray(0, d))) : c = this.b.subarray(0, d) : (this.b.length > d && (this.b.length = d), c = this.b);
        return this.buffer = c
    };
    r("Zlib.RawInflate", w);
    r("Zlib.RawInflate.prototype.decompress", w.prototype.t);
    var X = { ADAPTIVE: y, BLOCK: A },
        Y, Z, $, fa;
    if (Object.keys) Y = Object.keys(X);
    else
        for (Z in Y = [], $ = 0, X) Y[$++] = Z;
    $ = 0;
    for (fa = Y.length; $ < fa; ++$) Z = Y[$], r("Zlib.RawInflate.BufferType." + Z, X[Z]);
}).call(this);