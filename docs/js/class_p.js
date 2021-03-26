class Point {
    constructor(x, y, type, adjacent, surround, use, neighbor = [], adjacent_dia = [], type2 = 0) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.type2 = type2;
        this.adjacent = adjacent;
        this.adjacent_dia = adjacent_dia;
        this.surround = surround;
        this.neighbor = neighbor;
        this.use = use;
    }
}

class Stack {
    constructor() {
        this.__a = [];
    }

    set(list) {
        this.__a = list;
    }

    push(o) {
        if (this.__a.length > 1000) {
            this.__a.shift();
        }
        this.__a.push(o);
    }
    pop() {
        if (this.__a.length > 0) {
            return this.__a.pop();
        }
        return null;
    }
    size() {
        return this.__a.length;
    }
    toString() {
        return '[' + this.__a.join(',') + ']';
    }
}

class Puzzle {
    constructor(gridtype) {
        this.gridtype = gridtype;
        this.resol = 2.5; //window.devicePixelRatio || 1;
        this.canvasx = 0; //predefine
        this.canvasy = 0; //predefine
        this.center_n = 0;
        this.center_n0 = 0;
        this.margin = 6;

        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.obj = document.getElementById("dvique");
        //square
        this.group1 = ["sub_line2_lb", "sub_lineE2_lb", "sub_number9_lb", "msli_triright", "msli_trileft", "ms_tri", "ms_pencils",
            "ms_slovak", "ms_arc", "ms_spans", "ms_neighbors", "ms_arrow_fourtip", "ms0_arrow_fouredge",
            "combili_shaka", "combili_battleship", "combili_arrowS", "sub_number11_lb",
            "mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb",
            "st_sudoku1_lb", "st_sudoku2_lb", "st_sudoku8_lb", "st_sudoku3_lb", "st_sudoku9_lb", "st_sudoku10_lb",
            "custom_color_lb", "custom_color_yes_lb", "custom_color_no_lb"
        ];
        //square,pyramid,hex
        this.group2 = ["mo_wall_lb", "sub_number3_lb", "sub_number10_lb", "ms4", "ms5", "subc4"];
        //square,tri,hex
        this.group3 = ["sub_line5_lb"];
        //square,hex
        this.group4 = ["mo_cage_lb"];
        //square,tri,hex,pyramid,
        this.group5 = ["sub_specialthermo_lb", "sub_specialarrows_lb", "sub_specialdirection_lb", "sub_specialsquareframe_lb"];
        // tri, cube
        this.group6 = ["sub_number10_lb"];

        // Drawing position
        this.mouse_mode = "";
        this.mouse_click = 0; // 0 for left, 2 for right
        this.selection = [];
        this.last = -1;
        this.lastx = -1;
        this.lasty = -1;
        this.first = -1;
        this.start_point = {}; //for move_redo
        this.drawing = false;
        this.drawing_mode = -1;
        this.cursol = 0;
        this.cursolS = 0;
        this.panelflag = false;
        // Drawing mode
        this.mmode = ""; // Problem mode
        this.mode = {
            "qa": "pu_q",
            "grid": ["1", "2", "1"], //grid,lattice,out
            "pu_q": {
                "edit_mode": "surface",
                "surface": ["", 1],
                "line": ["1", 3],
                "lineE": ["1", 2],
                "wall": ["", 3],
                "cage": ["", 10],
                "number": ["1", 1],
                "symbol": ["circle_L", 2],
                "special": ["thermo", ""],
                "board": ["", ""],
                "move": ["1", ""],
                "combi": ["battleship", ""],
                "sudoku": ["1", 1]
            },
            "pu_a": {
                "edit_mode": "surface",
                "surface": ["", 1],
                "line": ["1", 3],
                "lineE": ["1", 3],
                "wall": ["", 3],
                "cage": ["", 10],
                "number": ["1", 2],
                "symbol": ["circle_L", 2],
                "special": ["thermo", ""],
                "board": ["", ""],
                "move": ["1", ""],
                "combi": ["battleship", ""],
                "sudoku": ["1", 9]
            }
        };
        this.theta = 0;
        this.reflect = [1, 1];
        this.centerlist = [];
        this.solution = "";
        this.sol_flag = 0;
        this.undoredo_counter = 0;
        this.loop_counter = false;
        this.rules = "";
        this.gridmax = { 'square': 60, 'hex': 20, 'tri': 20, 'pyramid': 20, 'cube': 20, 'kakuro': 60 }; // also defined in general.js
        this.replace = [
            ["\"qa\"", "z9"],
            ["\"pu_q\"", "zQ"],
            ["\"pu_a\"", "zA"],
            ["\"grid\"", "zG"],
            ["\"edit_mode\"", "zM"],
            ["\"surface\"", "zS"],
            ["\"line\"", "zL"],
            ["\"lineE\"", "zE"],
            ["\"wall\"", "zW"],
            ["\"cage\"", "zC"],
            ["\"number\"", "zN"],
            ["\"symbol\"", "zY"],
            ["\"special\"", "zP"],
            ["\"board\"", "zB"],
            ["\"command_redo\"", "zR"],
            ["\"command_undo\"", "zU"],
            ["\"numberS\"", "z1"],
            ["\"freeline\"", "zF"],
            ["\"freelineE\"", "z2"],
            ["\"thermo\"", "zT"],
            ["\"arrows\"", "z3"],
            ["\"direction\"", "zD"],
            ["\"squareframe\"", "z0"],
            ["\"polygon\"", "z5"],
            ["\"deletelineE\"", "z4"],
            ["\"__a\"", "z_"],
            ["null", "zO"],
        ];
        this.version = [2, 25, 8];
        this.undoredo_disable = false;
        this.comp = false;
    }

    reset() {

        // Object and Array initialization
        for (var i of ["pu_q", "pu_a"]) {
            this[i] = {};
            this[i].command_redo = new Stack();
            this[i].command_undo = new Stack();
            this[i].surface = {};
            this[i].number = {};
            this[i].numberS = {};
            this[i].symbol = {};
            this[i].freeline = {};
            this[i].freelineE = {};
            this[i].thermo = [];
            this[i].arrows = [];
            this[i].direction = [];
            this[i].squareframe = [];
            this[i].polygon = [];
            this[i].line = {};
            this[i].lineE = {};
            this[i].wall = {};
            this[i].cage = {};
            this[i].deletelineE = {};
        }

        // Object and Array initialization for custom colors
        for (var i of ["pu_q_col", "pu_a_col"]) {
            this[i] = {};
            this[i].command_redo = new Stack();
            this[i].command_undo = new Stack();
            this[i].surface = {};
            this[i].number = {};
            this[i].numberS = {};
            this[i].symbol = {};
            this[i].freeline = {};
            this[i].freelineE = {};
            this[i].thermo = [];
            this[i].arrows = [];
            this[i].direction = [];
            this[i].squareframe = [];
            this[i].polygon = [];
            this[i].line = {};
            this[i].lineE = {};
            this[i].wall = {};
            this[i].cage = {};
            this[i].deletelineE = {};
        }

        this.frame = {};
        this.freelinecircle_g = [-1, -1];
        this.point = [];
    }

    reset_board() {
        this[this.mode.qa] = {};
        this[this.mode.qa].command_redo = new Stack();
        this[this.mode.qa].command_undo = new Stack();
        this[this.mode.qa].surface = {};
        this[this.mode.qa].number = {};
        this[this.mode.qa].numberS = {};
        this[this.mode.qa].symbol = {};
        this[this.mode.qa].freeline = {};
        this[this.mode.qa].freelineE = {};
        this[this.mode.qa].thermo = [];
        this[this.mode.qa].arrows = [];
        this[this.mode.qa].direction = [];
        this[this.mode.qa].squareframe = [];
        this[this.mode.qa].polygon = [];
        this[this.mode.qa].line = {};
        this[this.mode.qa].lineE = {};
        this[this.mode.qa].wall = {};
        this[this.mode.qa].cage = {};
        this[this.mode.qa].deletelineE = {};

        // Object and Array initialization for custom colors
        this[this.mode.qa + "_col"] = {};
        this[this.mode.qa + "_col"].command_redo = new Stack();
        this[this.mode.qa + "_col"].command_undo = new Stack();
        this[this.mode.qa + "_col"].surface = {};
        this[this.mode.qa + "_col"].number = {};
        this[this.mode.qa + "_col"].numberS = {};
        this[this.mode.qa + "_col"].symbol = {};
        this[this.mode.qa + "_col"].freeline = {};
        this[this.mode.qa + "_col"].freelineE = {};
        this[this.mode.qa + "_col"].thermo = [];
        this[this.mode.qa + "_col"].arrows = [];
        this[this.mode.qa + "_col"].direction = [];
        this[this.mode.qa + "_col"].squareframe = [];
        this[this.mode.qa + "_col"].polygon = [];
        this[this.mode.qa + "_col"].line = {};
        this[this.mode.qa + "_col"].lineE = {};
        this[this.mode.qa + "_col"].wall = {};
        this[this.mode.qa + "_col"].cage = {};
        this[this.mode.qa + "_col"].deletelineE = {};
    }

    reset_arr() {
        switch (this.mode[this.mode.qa].edit_mode) {
            case "surface":
                this[this.mode.qa].surface = {};
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "4") {
                    this[this.mode.qa].line = {};
                    this[this.mode.qa].freeline = {};
                } else {
                    for (var i in this[this.mode.qa].line) {
                        if (this[this.mode.qa].line[i] === 98) {
                            delete this[this.mode.qa].line[i];
                        }
                    }
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    for (var i in this[this.mode.qa].lineE) {
                        if (this[this.mode.qa].lineE[i] === 98) {
                            delete this[this.mode.qa].lineE[i];
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    this[this.mode.qa].deletelineE = {};
                } else {
                    this[this.mode.qa].lineE = {};
                    this[this.mode.qa].freelineE = {};
                }
                break;
            case "wall":
                this[this.mode.qa].wall = {};
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "3") {
                    this[this.mode.qa].number = {};
                } else {
                    this[this.mode.qa].numberS = {};
                }
                break;
            case "symbol":
                this[this.mode.qa].symbol = {};
                //this[this.mode.qa].symbol2 = {};
                break;
            case "cage":
                this[this.mode.qa].cage = {};
                break;
            case "special":
                this[this.mode.qa][this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]] = [];
                break;
        }
        this.redraw();
    }

    reset_frame_newgrid() {
        this.center_n = this.center_n0;
        this.canvasxy_update();
        this.create_point();
        // this.search_center();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
        if (this.reflect[0] === -1) {
            this.point_reflect_LR();
        }
        if (this.reflect[1] === -1) {
            this.point_reflect_UD();
        }
        this.make_frameline();
    }

    make_frameline() {
        var gr = 1; //実線
        var ot = 2; //太線
        if (this.mode.grid[0] === "2") {
            gr = 11; //点線
        } else if (this.mode.grid[0] === "3") {
            gr = 0; //線なし
        }
        if (this.mode.grid[2] === "2") { //枠なし
            ot = gr; //枠は内部と同じ線
        }
        var max, min, key, corner;
        this.frame = {};
        for (var j = 0; j < this.centerlist.length; j++) {
            corner = this.point[this.centerlist[j]].surround.length;
            for (var i = 0; i < corner; i++) {
                max = Math.max(this.point[this.centerlist[j]].surround[i], this.point[this.centerlist[j]].surround[(i + 1) % corner]);
                min = Math.min(this.point[this.centerlist[j]].surround[i], this.point[this.centerlist[j]].surround[(i + 1) % corner]);
                key = min.toString() + "," + max.toString();
                if (this.frame[key]) {
                    this.frame[key] = gr;
                } else {
                    this.frame[key] = ot;
                }
            }
        }
    }

    point_move(x, y, theta) {
        var x0 = this.canvasx * 0.5 + 0.5; // Rotate the canvas center +0.5, enter x,y +0.5 when moving in parallel
        var y0 = this.canvasy * 0.5 + 0.5;
        var x1, y1, x2, y2;
        theta = theta / 180 * Math.PI;
        for (var i in this.point) {
            x1 = this.point[i].x + x;
            y1 = this.point[i].y + y;
            x2 = (x1 - x0) * Math.cos(theta) - (y1 - y0) * Math.sin(theta) + x0;
            y2 = (x1 - x0) * Math.sin(theta) + (y1 - y0) * Math.cos(theta) + y0;
            this.point[i].x = x2;
            this.point[i].y = y2;
        }
        this.point_usecheck();
    }

    search_center() {
        var xmax = 0,
            xmin = 1e5;
        var ymax = 0,
            ymin = 1e5;
        for (var i of this.centerlist) {
            if (this.point[i].x > xmax) { xmax = this.point[i].x; }
            if (this.point[i].x < xmin) { xmin = this.point[i].x; }
            if (this.point[i].y > ymax) { ymax = this.point[i].y; }
            if (this.point[i].y < ymin) { ymin = this.point[i].y; }
        }
        var x = (xmax + xmin) / 2;
        var y = (ymax + ymin) / 2;
        this.width = (xmax - xmin) / this.size + 2;
        this.height = (ymax - ymin) / this.size + 2;

        var min0, min = 10e6;
        var num = 0;
        for (var i in this.point) {
            min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
            if (min0 < min) {
                min = min0;
                num = i;
            }
        }
        this.center_n = parseInt(num);
    }

    search_center_pixel() {
        var obj = this.gridspace_calculate();
        var yu = obj.yu,
            yd = obj.yd,
            xl = obj.xl,
            xr = obj.xr;
        var x = (xl + xr) / 2;
        var y = (yu + yd) / 2;
        this.width = (xr - xl) / this.size + 1;
        this.height = (yd - yu) / this.size + 1;

        var min0, min = 10e6;
        var num = 0;
        for (var i in this.point) {
            min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
            if (min0 < min) {
                min = min0;
                num = i;
            }
        }
        this.center_n = parseInt(num);

        var out = 1;
        if (yu <= 0 || yd >= this.canvasy || xl <= 0 || xr >= this.canvasx) {
            out = 0;
        }
        return out;
    }

    rotate_UD() {
        this.point_reflect_UD();
        this.reflect[1] *= -1;
        this.redraw();
    }

    rotate_LR() {
        this.point_reflect_LR();
        this.reflect[0] *= -1;
        this.redraw();
    }

    point_reflect_LR() {
        var x0 = this.canvasx * 0.5 + 0.5;
        for (var i in this.point) {
            this.point[i].x = 2 * x0 - this.point[i].x;
        }
        this.point_usecheck();
    }

    point_reflect_UD() {
        var y0 = this.canvasy * 0.5 + 0.5;
        for (var i in this.point) {
            this.point[i].y = 2 * y0 - this.point[i].y;
        }
        this.point_usecheck();
    }

    rotate_center() {
        var out = this.search_center_pixel(); // Calculate center coordinates from pixel data
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), 0);
        this.point_usecheck();
        this.redraw();
    }

    rotate_size() {
        var out = 0;
        var i = 0;
        while (out === 0 && i < 10) { // If the image sticks out, try again 5 times
            out = this.search_center_pixel();
            this.width_c = this.width;
            this.height_c = this.height;
            this.canvasxy_update();
            this.canvas_size_setting();
            this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), 0);
            this.point_usecheck();
            this.redraw();
            i++;
        }

    }

    resize_top(sign, celltype = 'black') {
        // reset the selection while resizing the grid
        this.selection = [];

        sign = parseInt(sign);
        if ((this.ny + 1 * sign) <= this.gridmax['square'] && (this.ny + 1 * sign) > 0) {
            let originalspace = [...this.space];
            if (celltype === 'white') {
                // Over, under, left, right
                if (sign === 1) {
                    this.space[0] = this.space[0] + 1;
                } else {
                    if (this.space[0] > 0) {
                        this.space[0] = this.space[0] - 1;
                    }
                }
            }
            if (!this.originalnx) {
                this.originalnx = this.nx;
            }
            if (!this.originalny) {
                this.originalny = this.ny;
            }
            let originalnx0 = this.nx0;
            let originalny0 = this.ny0;

            // this.nx = nx; // Columns
            this.ny = this.ny + (1 * sign); // Rows, Adding/Subtracting 1 row
            // this.nx0 = this.nx + 4;
            this.ny0 = this.ny + 4;
            // this.width0 = this.nx + 1;
            this.height0 = this.ny + 1;
            // this.width_c = this.width0;
            this.height_c = this.height0;
            // this.width = this.width_c;
            this.height = this.height_c;
            // this.canvasx = this.width_c * this.size;
            this.canvasy = this.height_c * this.size;

            // Find the missing boxes
            var old_centerlist = this.centerlist;
            var old_idealcenterlist = []; // If no box was missing
            for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
                for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
                    old_idealcenterlist.push(i + j * (originalnx0));
                }
            }
            var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);

            this.create_point();
            this.centerlist = []
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }
            this.search_center();
            this.center_n0 = this.center_n;
            this.canvasxy_update();
            this.canvas_size_setting();
            this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
            if (this.reflect[0] === -1) {
                this.point_reflect_LR();
            }
            if (this.reflect[1] === -1) {
                this.point_reflect_UD();
            }
            this.centerlist = [] //reset centerlist to match the margins
            for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
                for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }

            // Remove Box elements
            if (boxremove) {
                for (let n = 0; n < boxremove.length; n++) {
                    let num = boxremove[n];
                    let m = num + parseInt(originalnx0) * sign;
                    let index = this.centerlist.indexOf(m);
                    if (index !== -1) {
                        this.centerlist.splice(index, 1);
                    }
                }
            }

            this.make_frameline();
            this.cursol = this.centerlist[0];
            this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);

            for (var i of ["pu_q", "pu_a"]) {
                this[i].command_redo = new Stack();
                this[i].command_undo = new Stack();

                // shift Surface elements to next row
                if (this[i].surface) {
                    let temp = this[i].surface;
                    this[i].surface = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let m = parseInt(keys[k]) + parseInt(originalnx0) * sign;
                        this.record("surface", m);
                        this[i].surface[m] = temp[keys[k]];
                    }
                }

                // shift Number elements to next row
                if (this[i].number) {
                    let temp = this[i].number;
                    this[i].number = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        let m = parseInt(keys[k]) + (factor + 1) * parseInt(originalnx0) * sign;
                        this.record("number", m);
                        this[i].number[m] = temp[keys[k]];
                    }
                }

                // shift Number elements to next row
                if (this[i].numberS) {
                    let m;
                    let temp = this[i].numberS;
                    this[i].numberS = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        if (factor >= 8) {
                            m = parseInt(keys[k]) + 12 * parseInt(originalnx0) * sign;
                        } else {
                            m = parseInt(keys[k]) + 8 * parseInt(originalnx0) * sign;
                        }
                        this.record("numberS", m);
                        this[i].numberS[m] = temp[keys[k]];
                    }
                }

                // shift Symbol elements to next row
                if (this[i].symbol) {
                    let m;
                    let temp = this[i].symbol;
                    this[i].symbol = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        m = parseInt(keys[k]) + (factor + 1) * parseInt(originalnx0) * sign;
                        this.record("symbol", m);
                        this[i].symbol[m] = temp[keys[k]];
                    }
                }

                // shift Line elements to next row
                if (this[i].line) {
                    let m;
                    let temp = this[i].line;
                    this[i].line = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + (factor + 1) * parseInt(originalnx0) * sign;
                            this.record("line", m);
                            this[i].line[m] = temp[k];
                        } else {
                            let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
                            var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
                            var k2 = parseInt(k.split(",")[1]) + (factor + 1) * parseInt(originalnx0) * sign;
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("line", key);
                            this[i].line[key] = temp[k];
                        }
                    }
                }

                // shift Edge elements to next row
                if (this[i].lineE) {
                    let m;
                    let temp = this[i].lineE;
                    this[i].lineE = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + (factor + 1) * parseInt(originalnx0) * sign;
                            this.record("lineE", m);
                            this[i].lineE[m] = temp[k];
                        } else {
                            var k1 = parseInt(k.split(",")[0]) + 2 * parseInt(originalnx0) * sign;
                            var k2 = parseInt(k.split(",")[1]) + 2 * parseInt(originalnx0) * sign;
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("lineE", key);
                            this[i].lineE[key] = temp[k];
                        }
                    }
                }


                // shift DeleteEdge elements to next row            
                if (this[i].deletelineE) {
                    let temp = this[i].deletelineE;
                    this[i].deletelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + 2 * parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + 2 * parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("deletelineE", key);
                        this[i].deletelineE[key] = temp[k];
                    }
                }

                // shift FreeLine elements to next row
                if (this[i].freeline) {
                    let temp = this[i].freeline;
                    this[i].freeline = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freeline", key);
                        this[i].freeline[key] = temp[k];
                    }
                }

                // shift FreeEdge elements to next row
                if (this[i].freelineE) {
                    let temp = this[i].freelineE;
                    this[i].freelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + 2 * parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + 2 * parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freelineE", key);
                        this[i].freelineE[key] = temp[k];
                    }
                }

                // shift Thermo elements to next row
                if (this[i].thermo) {
                    let temp = this[i].thermo;
                    this[i].thermo = {};
                    this[i].thermo = new Array(temp.length);
                    for (var k in temp) {
                        this.record("thermo", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
                        }
                        this[i].thermo[k] = temp[k];
                    }
                }

                // shift Arrow elements to next row
                if (this[i].arrows) {
                    let temp = this[i].arrows;
                    this[i].arrows = {};
                    this[i].arrows = new Array(temp.length);
                    for (var k in temp) {
                        this.record("arrows", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
                        }
                        this[i].arrows[k] = temp[k];
                    }
                }

                // shift Direction elements to next row
                if (this[i].direction) {
                    let temp = this[i].direction;
                    this[i].direction = {};
                    this[i].direction = new Array(temp.length);
                    for (var k in temp) {
                        this.record("direction", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
                        }
                        this[i].direction[k] = temp[k];
                    }
                }

                // shift RectangleFrame elements to next row
                if (this[i].squareframe) {
                    let temp = this[i].squareframe;
                    this[i].squareframe = {};
                    this[i].squareframe = new Array(temp.length);
                    for (var k in temp) {
                        this.record("squareframe", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
                        }
                        this[i].squareframe[k] = temp[k];
                    }
                }

                // shift Wall elements to next row
                if (this[i].wall) {
                    let temp = this[i].wall;
                    this[i].wall = {};
                    for (var k in temp) {
                        let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                        var k1 = parseInt(k.split(",")[0]) + (factor + 1) * parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (factor + 1) * parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("wall", key);
                        this[i].wall[key] = temp[k];
                    }
                }

                // shift Cage elements to next row
                if (this[i].cage) {
                    let temp = this[i].cage;
                    this[i].cage = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + 8 * parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + 8 * parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("cage", key);
                        this[i].cage[key] = temp[k];
                    }
                }

                // shift Polygon elements to next row
                if (this[i].polygon) {
                    let temp = this[i].polygon;
                    this[i].polygon = {};
                    this[i].polygon = new Array(temp.length);
                    for (var k in temp) {
                        this.record("polygon", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + 2 * parseInt(originalnx0) * sign;
                        }
                        this[i].polygon[k] = temp[k];
                    }
                }
            }
            this.redraw();
        } else {
            if (sign === 1) {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Min row size reached <h2 class="warn">1</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
        }
    }

    resize_bottom(sign, celltype = 'black') {
        // reset the selection while resizing the grid
        this.selection = [];

        sign = parseInt(sign);
        if ((this.ny + 1 * sign) <= this.gridmax['square'] && (this.ny + 1 * sign) > 0) {
            let originalspace = [...this.space];
            if (celltype === 'white') {
                // Over, under, left, right
                if (sign === 1) {
                    this.space[1] = this.space[1] + 1;
                } else {
                    if (this.space[1] > 0) {
                        this.space[1] = this.space[1] - 1;
                    }
                }
            }
            if (!this.originalnx) {
                this.originalnx = this.nx;
            }
            if (!this.originalny) {
                this.originalny = this.ny;
            }
            let originalnx0 = this.nx0;
            let originalny0 = this.ny0;

            // this.nx = nx; // Columns
            this.ny = this.ny + (1 * sign); // Rows, Adding/Removing 1 row
            // this.nx0 = this.nx + 4;
            this.ny0 = this.ny + 4;
            // this.width0 = this.nx + 1;
            this.height0 = this.ny + 1;
            // this.width_c = this.width0;
            this.height_c = this.height0;
            // this.width = this.width_c;
            this.height = this.height_c;
            // this.canvasx = this.width_c * this.size;
            this.canvasy = this.height_c * this.size;

            // Find the missing boxes
            var old_centerlist = this.centerlist;
            var old_idealcenterlist = []; // If no box was missing
            for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
                for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
                    old_idealcenterlist.push(i + j * (originalnx0));
                }
            }
            var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);
            this.create_point();
            this.centerlist = []
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }
            this.search_center();
            this.center_n0 = this.center_n;
            this.canvasxy_update();
            this.canvas_size_setting();
            this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
            if (this.reflect[0] === -1) {
                this.point_reflect_LR();
            }
            if (this.reflect[1] === -1) {
                this.point_reflect_UD();
            }
            this.centerlist = [] //reset centerlist to match the margins
            for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
                for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }

            // Remove Box elements
            if (boxremove) {
                for (let n = 0; n < boxremove.length; n++) {
                    let num = boxremove[n];
                    let index = this.centerlist.indexOf(num);
                    if (index !== -1) {
                        this.centerlist.splice(index, 1);
                    }
                }
            }

            this.make_frameline();
            this.cursol = this.centerlist[0];
            this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);

            for (var i of ["pu_q", "pu_a"]) {

                this[i].command_redo = new Stack();
                this[i].command_undo = new Stack();

                // shift Number elements to next row
                if (this[i].number) {
                    let temp = this[i].number;
                    this[i].number = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        let m = parseInt(keys[k]) + factor * parseInt(originalnx0) * sign;
                        this.record("number", m);
                        this[i].number[m] = temp[keys[k]];
                    }
                }

                // Maintain NumberS elements to be in the same row
                if (this[i].numberS) {
                    let m;
                    let temp = this[i].numberS;
                    this[i].numberS = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        if (factor >= 8) {
                            m = parseInt(keys[k]) + 8 * parseInt(originalnx0) * sign;
                        } else {
                            m = parseInt(keys[k]) + 4 * parseInt(originalnx0) * sign;
                        }
                        this.record("numberS", m);
                        this[i].numberS[m] = temp[keys[k]];
                    }
                }

                // Maintain Symbol elements to be in the same row
                if (this[i].symbol) {
                    let m;
                    let temp = this[i].symbol;
                    this[i].symbol = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        m = parseInt(keys[k]) + factor * parseInt(originalnx0) * sign;
                        this.record("symbol", m);
                        this[i].symbol[m] = temp[keys[k]];
                    }
                }

                // Maintain cross elements to be in the same row
                if (this[i].line) {
                    let m;
                    let temp = this[i].line;
                    this[i].line = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + (factor * parseInt(originalnx0)) * sign;
                            this.record("line", m);
                            this[i].line[m] = temp[k];
                        } else {
                            let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
                            var k1 = parseInt(k.split(",")[0]);
                            var k2 = parseInt(k.split(",")[1]) + factor * parseInt(originalnx0) * sign;
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("line", key);
                            this[i].line[key] = temp[k];
                        }
                    }
                }

                // Maintain Edge elements in the same row
                if (this[i].lineE) {
                    let m;
                    let temp = this[i].lineE;
                    this[i].lineE = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + (factor * parseInt(originalnx0)) * sign;
                            this.record("lineE", m);
                            this[i].lineE[m] = temp[k];
                        } else {
                            var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
                            var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("lineE", key);
                            this[i].lineE[key] = temp[k];
                        }
                    }
                }

                // Maintain DeleteEdge elements in the same row     
                if (this[i].deletelineE) {
                    let m;
                    let temp = this[i].deletelineE;
                    this[i].deletelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("deletelineE", key);
                        this[i].deletelineE[key] = temp[k];
                    }
                }

                // Maintain FreeEdge elements in the same place
                if (this[i].freelineE) {
                    let m;
                    let temp = this[i].freelineE;
                    this[i].freelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freelineE", key);
                        this[i].freelineE[key] = temp[k];
                    }
                }

                // Maintain Wall elements in the same row
                if (this[i].wall) {
                    let temp = this[i].wall;
                    this[i].wall = {};
                    for (var k in temp) {
                        let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                        var k1 = parseInt(k.split(",")[0]) + factor * parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + factor * parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("wall", key);
                        this[i].wall[key] = temp[k];
                    }
                }

                // Maintain Cage elements in the same row
                if (this[i].cage) {
                    let temp = this[i].cage;
                    this[i].cage = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + 4 * parseInt(originalnx0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + 4 * parseInt(originalnx0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("cage", key);
                        this[i].cage[key] = temp[k];
                    }
                }

                // Maintain Polygon elements in the same row
                if (this[i].polygon) {
                    let temp = this[i].polygon;
                    this[i].polygon = {};
                    this[i].polygon = new Array(temp.length);
                    for (var k in temp) {
                        this.record("polygon", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + parseInt(originalnx0) * sign;
                        }
                        this[i].polygon[k] = temp[k];
                    }
                }
            }
            this.redraw();
        } else {
            if (sign === 1) {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Min row size reached <h2 class="warn">1</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
        }
    }

    resize_left(sign, celltype = 'black') {
        // reset the selection while resizing the grid
        this.selection = [];

        sign = parseInt(sign);
        if ((this.nx + 1 * sign) <= this.gridmax['square'] && (this.nx + 1 * sign) > 0) {
            let originalspace = [...this.space];
            if (celltype === 'white') {
                // Over, under, left, right
                if (sign === 1) {
                    this.space[2] = this.space[2] + 1;
                } else {
                    if (this.space[2] > 0) {
                        this.space[2] = this.space[2] - 1;
                    }
                }
            }
            if (!this.originalnx) {
                this.originalnx = this.nx;
            }
            if (!this.originalny) {
                this.originalny = this.ny;
            }
            let originalnx0 = this.nx0;
            let originalny0 = this.ny0;

            this.nx = this.nx + (1 * sign); // Columns, Adding/Removing 1 column
            // this.ny = this.ny; // Rows
            this.nx0 = this.nx + 4;
            // this.ny0 = this.ny + 4;
            this.width0 = this.nx + 1;
            // this.height0 = this.ny + 1;
            this.width_c = this.width0;
            // this.height_c = this.height0;
            this.width = this.width_c;
            // this.height = this.height_c;
            this.canvasx = this.width_c * this.size;
            // this.canvasy = this.height_c * this.size;

            // Find the missing boxes
            var old_centerlist = this.centerlist;
            var old_idealcenterlist = []; // If no box was missing
            for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
                for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
                    old_idealcenterlist.push(i + j * (originalnx0));
                }
            }
            var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);

            this.create_point();
            this.centerlist = []
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }
            this.search_center();
            this.center_n0 = this.center_n;
            this.canvasxy_update();
            this.canvas_size_setting();
            this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
            if (this.reflect[0] === -1) {
                this.point_reflect_LR();
            }
            if (this.reflect[1] === -1) {
                this.point_reflect_UD();
            }
            this.centerlist = [] //reset centerlist to match the margins
            for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
                for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }

            // Remove Box elements
            if (boxremove) {
                for (let n = 0; n < boxremove.length; n++) {
                    let num = boxremove[n];
                    let m = num + ((parseInt(num / originalnx0) - 2) + 3) * sign;
                    let index = this.centerlist.indexOf(m);
                    if (index !== -1) {
                        this.centerlist.splice(index, 1);
                    }
                }
            }

            this.make_frameline();
            this.cursol = this.centerlist[0];
            this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);

            for (var i of ["pu_q", "pu_a"]) {
                this[i].command_redo = new Stack();
                this[i].command_undo = new Stack();

                // shift Surface elements to next column
                if (this[i].surface) {
                    let temp = this[i].surface;
                    this[i].surface = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let m = parseInt(keys[k]) + ((parseInt(parseInt(keys[k]) / originalnx0) - 2) + 3) * sign;
                        this.record("surface", m);
                        this[i].surface[m] = temp[keys[k]];
                    }
                }

                // shift Number elements to next column
                if (this[i].number) {
                    let temp = this[i].number;
                    this[i].number = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / ((originalnx0) * (originalny0)));
                        let m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                        this.record("number", m);
                        this[i].number[m] = temp[keys[k]];
                    }
                }

                // shift NumberS elements to next column
                if (this[i].numberS) {
                    let temp = this[i].numberS;
                    this[i].numberS = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let normal_cursor = parseInt(keys[k] / 4) - (originalnx0 * originalny0);
                        let m = parseInt(keys[k]) + (4 * (parseInt(normal_cursor / originalnx0) + originalny0) + 4) * sign;
                        this.record("numberS", m);
                        this[i].numberS[m] = temp[keys[k]];
                    }
                }

                // shift Symbol elements to next column
                if (this[i].symbol) {
                    let m;
                    let temp = this[i].symbol;
                    this[i].symbol = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / (originalnx0 * originalny0));
                        m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                        this.record("symbol", m);
                        this[i].symbol[m] = temp[keys[k]];
                    }
                }

                // shift Line elements to next column
                if (this[i].line) {
                    let m;
                    let temp = this[i].line;
                    this[i].line = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                            this.record("line", m);
                            this[i].line[m] = temp[k];
                        } else {
                            let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
                            var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 3) * sign;
                            if (factor == 0) {
                                var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 3) * sign;
                            } else {
                                var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                            }
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("line", key);
                            this[i].line[key] = temp[k];
                        }
                    }
                }

                // shift Edge elements to next column
                if (this[i].lineE) {
                    let m;
                    let temp = this[i].lineE;
                    this[i].lineE = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                            this.record("lineE", m);
                            this[i].lineE[m] = temp[k];
                        } else {
                            var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                            var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("lineE", key);
                            this[i].lineE[key] = temp[k];
                        }
                    }
                }

                // shift DeleteEdge elements to next column           
                if (this[i].deletelineE) {
                    let temp = this[i].deletelineE;
                    this[i].deletelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("deletelineE", key);
                        this[i].deletelineE[key] = temp[k];
                    }
                }

                // shift FreeLine elements to next column
                if (this[i].freeline) {
                    let temp = this[i].freeline;
                    this[i].freeline = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 3) * sign;
                        var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 3) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freeline", key);
                        this[i].freeline[key] = temp[k];
                    }
                }

                // shift FreeEdge elements to next column
                if (this[i].freelineE) {
                    let temp = this[i].freelineE;
                    this[i].freelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freelineE", key);
                        this[i].freelineE[key] = temp[k];
                    }
                }

                // shift Thermo elements to next column
                if (this[i].thermo) {
                    let temp = this[i].thermo;
                    this[i].thermo = {};
                    this[i].thermo = new Array(temp.length);
                    for (var k in temp) {
                        this.record("thermo", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
                        }
                        this[i].thermo[k] = temp[k];
                    }
                }

                // shift Arrow elements to next column
                if (this[i].arrows) {
                    let temp = this[i].arrows;
                    this[i].arrows = {};
                    this[i].arrows = new Array(temp.length);
                    for (var k in temp) {
                        this.record("arrows", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
                        }
                        this[i].arrows[k] = temp[k];
                    }
                }

                // shift Direction elements to next column
                if (this[i].direction) {
                    let temp = this[i].direction;
                    this[i].direction = {};
                    this[i].direction = new Array(temp.length);
                    for (var k in temp) {
                        this.record("direction", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
                        }
                        this[i].direction[k] = temp[k];
                    }
                }

                // shift RectangleFrame elements to next column
                if (this[i].squareframe) {
                    let temp = this[i].squareframe;
                    this[i].squareframe = {};
                    this[i].squareframe = new Array(temp.length);
                    for (var k in temp) {
                        this.record("squareframe", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 3) * sign;
                        }
                        this[i].squareframe[k] = temp[k];
                    }
                }

                // shift Wall elements to next column
                if (this[i].wall) {
                    let temp = this[i].wall;
                    this[i].wall = {};
                    for (var k in temp) {
                        let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                        var k1 = parseInt(k.split(",")[0]) + ((parseInt((parseInt(k.split(",")[0]) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0)) + 1) + factor * originalny0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("wall", key);
                        this[i].wall[key] = temp[k];
                    }
                }

                // shift Cage elements to next column
                if (this[i].cage) {
                    let temp = this[i].cage;
                    this[i].cage = {};
                    for (var k in temp) {
                        let normal_cursor1 = parseInt(parseInt(k.split(",")[0]) / 4) - (originalnx0 * originalny0);
                        let normal_cursor2 = parseInt(parseInt(k.split(",")[1]) / 4) - (originalnx0 * originalny0);
                        var k1 = parseInt(k.split(",")[0]) + (4 * (parseInt(normal_cursor1 / originalnx0) + originalny0) + 4) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (4 * (parseInt(normal_cursor2 / originalnx0) + originalny0) + 4) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("cage", key);
                        this[i].cage[key] = temp[k];
                    }
                }

                // shift Polygon elements to next column
                if (this[i].polygon) {
                    let temp = this[i].polygon;
                    this[i].polygon = {};
                    this[i].polygon = new Array(temp.length);
                    for (var k in temp) {
                        this.record("polygon", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + (parseInt((parseInt(temp[k][m]) - (originalnx0 * originalny0)) / (originalnx0) + 1) + parseInt(originalny0)) * sign;
                        }
                        this[i].polygon[k] = temp[k];
                    }
                }
            }
            this.redraw();
        } else {
            if (sign === 1) {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Min column size reached <h2 class="warn">1</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
        }
    }

    resize_right(sign, celltype = 'black') {
        // reset the selection while resizing the grid
        this.selection = [];

        sign = parseInt(sign);
        if ((this.nx + 1 * sign) <= this.gridmax['square'] && (this.nx + 1 * sign) > 0) {
            let originalspace = [...this.space];
            if (celltype === 'white') {
                // Over, under, left, right
                if (sign === 1) {
                    this.space[3] = this.space[3] + 1;
                } else {
                    if (this.space[3] > 0) {
                        this.space[3] = this.space[3] - 1;
                    }
                }
            }
            if (!this.originalnx) {
                this.originalnx = this.nx;
            }
            if (!this.originalny) {
                this.originalny = this.ny;
            }
            let originalnx0 = this.nx0;
            let originalny0 = this.ny0;

            this.nx = this.nx + (1 * sign); // Columns, Adding/Removing 1 column
            // this.ny = this.ny; // Rows
            this.nx0 = this.nx + 4;
            // this.ny0 = this.ny + 4;
            this.width0 = this.nx + 1;
            // this.height0 = this.ny + 1;
            this.width_c = this.width0;
            // this.height_c = this.height0;
            this.width = this.width_c;
            // this.height = this.height_c;
            this.canvasx = this.width_c * this.size;
            // this.canvasy = this.height_c * this.size;

            // Find the missing boxes
            var old_centerlist = this.centerlist;
            var old_idealcenterlist = []; // If no box was missing
            for (var j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
                for (var i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
                    old_idealcenterlist.push(i + j * (originalnx0));
                }
            }
            var boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);

            this.create_point();
            this.centerlist = []
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }
            this.search_center();
            this.center_n0 = this.center_n;
            this.canvasxy_update();
            this.canvas_size_setting();
            this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);
            if (this.reflect[0] === -1) {
                this.point_reflect_LR();
            }
            if (this.reflect[1] === -1) {
                this.point_reflect_UD();
            }
            this.centerlist = [] //reset centerlist to match the margins
            for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
                for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
                    this.centerlist.push(i + j * (this.nx0));
                }
            }

            // Remove Box elements
            if (boxremove) {
                for (let n = 0; n < boxremove.length; n++) {
                    let num = boxremove[n];
                    let m = num + ((parseInt(num / originalnx0) - 2) + 2) * sign;
                    let index = this.centerlist.indexOf(m);
                    if (index !== -1) {
                        this.centerlist.splice(index, 1);
                    }
                }
            }

            this.make_frameline();
            this.cursol = this.centerlist[0];
            this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);

            for (var i of ["pu_q", "pu_a"]) {
                this[i].command_redo = new Stack();
                this[i].command_undo = new Stack();

                // Maintain Surface elements in the same column
                if (this[i].surface) {
                    let temp = this[i].surface;
                    this[i].surface = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let m = parseInt(keys[k]) + ((parseInt(parseInt(keys[k]) / originalnx0) - 2) + 2) * sign;
                        this.record("surface", m);
                        this[i].surface[m] = temp[keys[k]];
                    }
                }

                // Maintain Number elements in the same column
                if (this[i].number) {
                    let temp = this[i].number;
                    this[i].number = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / (originalnx0 * originalny0));
                        let m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                        this.record("number", m);
                        this[i].number[m] = temp[keys[k]];
                    }
                }

                // Maintain NumberS elements in the same column
                if (this[i].numberS) {
                    let temp = this[i].numberS;
                    this[i].numberS = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let normal_cursor = parseInt(keys[k] / 4) - (originalnx0 * originalny0);
                        let m = parseInt(keys[k]) + (4 * (parseInt(normal_cursor / originalnx0) + originalny0)) * sign;
                        this.record("numberS", m);
                        this[i].numberS[m] = temp[keys[k]];
                    }
                }

                // Maintain Symbol elements in the same column
                if (this[i].symbol) {
                    let m;
                    let temp = this[i].symbol;
                    this[i].symbol = {};
                    let keys = Object.keys(temp);
                    for (var k = 0; k < keys.length; k++) {
                        let factor = Math.floor(parseInt(keys[k]) / (originalnx0 * originalny0));
                        m = parseInt(keys[k]) + ((parseInt((keys[k] - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                        this.record("symbol", m);
                        this[i].symbol[m] = temp[keys[k]];
                    }
                }

                // Maintain Line elements in the same column
                if (this[i].line) {
                    let m;
                    let temp = this[i].line;
                    this[i].line = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                            this.record("line", m);
                            this[i].line[m] = temp[k];
                        } else {
                            let factor = Math.floor(parseInt(k.split(",")[1]) / ((originalnx0) * (originalny0)));
                            var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 2) * sign;
                            if (factor == 0) {
                                var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 2) * sign;
                            } else {
                                var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                            }
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("line", key);
                            this[i].line[key] = temp[k];
                        }
                    }
                }

                // Maintain Edge elements in the same column
                if (this[i].lineE) {
                    let m;
                    let temp = this[i].lineE;
                    this[i].lineE = {};
                    for (var k in temp) {
                        if (temp[k] === 98) {
                            let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                            m = parseInt(k) + ((parseInt((parseInt(k) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                            this.record("lineE", m);
                            this[i].lineE[m] = temp[k];
                        } else {
                            var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                            var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                            var key = (k1.toString() + "," + k2.toString());
                            this.record("lineE", key);
                            this[i].lineE[key] = temp[k];
                        }
                    }
                }

                // Maintain DeleteEdge elements in the same column           
                if (this[i].deletelineE) {
                    let temp = this[i].deletelineE;
                    this[i].deletelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("deletelineE", key);
                        this[i].deletelineE[key] = temp[k];
                    }
                }

                // Maintain FreeLine elements in the same column
                if (this[i].freeline) {
                    let temp = this[i].freeline;
                    this[i].freeline = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + ((parseInt(parseInt(k.split(",")[0]) / originalnx0) - 2) + 2) * sign;
                        var k2 = parseInt(k.split(",")[1]) + ((parseInt(parseInt(k.split(",")[1]) / originalnx0) - 2) + 2) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freeline", key);
                        this[i].freeline[key] = temp[k];
                    }
                }

                // Maintain FreeEdge elements in the same column
                if (this[i].freelineE) {
                    let temp = this[i].freelineE;
                    this[i].freelineE = {};
                    for (var k in temp) {
                        var k1 = parseInt(k.split(",")[0]) + (parseInt((parseInt(k.split(",")[0]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (parseInt((parseInt(k.split(",")[1]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("freelineE", key);
                        this[i].freelineE[key] = temp[k];
                    }
                }

                // Maintain Thermo elements in the same column
                if (this[i].thermo) {
                    let temp = this[i].thermo;
                    this[i].thermo = {};
                    this[i].thermo = new Array(temp.length);
                    for (var k in temp) {
                        this.record("thermo", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
                        }
                        this[i].thermo[k] = temp[k];
                    }
                }

                // Maintain Arrow elements in the same column
                if (this[i].arrows) {
                    let temp = this[i].arrows;
                    this[i].arrows = {};
                    this[i].arrows = new Array(temp.length);
                    for (var k in temp) {
                        this.record("arrows", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
                        }
                        this[i].arrows[k] = temp[k];
                    }
                }

                // Maintain Direction elements in the same column
                if (this[i].direction) {
                    let temp = this[i].direction;
                    this[i].direction = {};
                    this[i].direction = new Array(temp.length);
                    for (var k in temp) {
                        this.record("direction", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
                        }
                        this[i].direction[k] = temp[k];
                    }
                }

                // Maintain RectangleFrame elements in the same column
                if (this[i].squareframe) {
                    let temp = this[i].squareframe;
                    this[i].squareframe = {};
                    this[i].squareframe = new Array(temp.length);
                    for (var k in temp) {
                        this.record("squareframe", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + ((parseInt(parseInt(temp[k][m]) / originalnx0) - 2) + 2) * sign;
                        }
                        this[i].squareframe[k] = temp[k];
                    }
                }

                // Maintain Wall elements in the same column
                if (this[i].wall) {
                    let temp = this[i].wall;
                    this[i].wall = {};
                    for (var k in temp) {
                        let factor = Math.floor(parseInt(k) / ((originalnx0) * (originalny0)));
                        var k1 = parseInt(k.split(",")[0]) + ((parseInt((parseInt(k.split(",")[0]) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                        var k2 = parseInt(k.split(",")[1]) + ((parseInt((parseInt(k.split(",")[1]) - (factor * originalnx0 * originalny0)) / (originalnx0))) + factor * originalny0) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("wall", key);
                        this[i].wall[key] = temp[k];
                    }
                }

                // Maintain Cage elements in the same column
                if (this[i].cage) {
                    let temp = this[i].cage;
                    this[i].cage = {};
                    for (var k in temp) {
                        let normal_cursor1 = parseInt(parseInt(k.split(",")[0]) / 4) - (originalnx0 * originalny0);
                        let normal_cursor2 = parseInt(parseInt(k.split(",")[1]) / 4) - (originalnx0 * originalny0);
                        var k1 = parseInt(k.split(",")[0]) + (4 * (parseInt(normal_cursor1 / originalnx0) + originalny0)) * sign;
                        var k2 = parseInt(k.split(",")[1]) + (4 * (parseInt(normal_cursor2 / originalnx0) + originalny0)) * sign;
                        var key = (k1.toString() + "," + k2.toString());
                        this.record("cage", key);
                        this[i].cage[key] = temp[k];
                    }
                }

                // Maintain Polygon elements in the same column
                if (this[i].polygon) {
                    let temp = this[i].polygon;
                    this[i].polygon = {};
                    this[i].polygon = new Array(temp.length);
                    for (var k in temp) {
                        this.record("polygon", k);
                        for (var m = 0; m <= (temp[k].length - 1); m++) {
                            temp[k][m] = parseInt(temp[k][m]) + (parseInt((parseInt(temp[k][m]) - (originalnx0 * originalny0)) / (originalnx0)) + parseInt(originalny0)) * sign;
                        }
                        this[i].polygon[k] = temp[k];
                    }
                }
            }
            this.redraw();
        } else {
            if (sign === 1) {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            } else {
                Swal.fire({
                    title: 'Swaroop says:',
                    html: 'Min column size reached <h2 class="warn">1</h2>',
                    icon: 'error',
                    confirmButtonText: 'ok 🙂',
                })
            }
        }
    }

    rotate_reset() {
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.center_n = this.center_n0; //reset for maketext
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), 0);
        this.redraw();
    }

    point_usecheck() {
        for (var i in this.point) {
            if (this.point[i].use === -1) {;
            } else if (this.point[i].x < this.margin || this.point[i].x > this.canvasx - this.margin || this.point[i].y < this.margin || this.point[i].y > this.canvasy - this.margin) {
                this.point[i].use = 0;
            } else {
                this.point[i].use = 1;
            }
        }
    }

    canvasxy_update() { //space for imagesave
        this.size = parseInt(document.getElementById("nb_size3").value);
        this.canvasx = (this.width_c) * this.size;
        this.canvasy = (this.height_c) * this.size;
    }

    canvas_size_setting() {
        this.canvas.width = this.canvasx * this.resol;
        this.canvas.height = this.canvasy * this.resol;
        this.ctx.scale(this.resol, this.resol);
        this.canvas.style.width = this.canvasx.toString() + "px";
        this.canvas.style.height = this.canvasy.toString() + "px";
        this.obj.style.width = this.canvas.style.width;
        this.obj.style.height = this.canvas.style.height;
    }

    resizecanvas() {
        var resizedCanvas = document.createElement("canvas");
        var resizedContext = resizedCanvas.getContext("2d");
        var mode = this.mode[this.mode.qa].edit_mode;

        var cx = this.canvasx;
        var cy = this.canvasy;

        this.mode[this.mode.qa].edit_mode = "surface"; // For deleting selection frame
        if (document.getElementById("nb_margin2").checked) {
            var obj = this.gridspace_calculate();
            var yu = obj.yu,
                yd = obj.yd,
                xl = obj.xl,
                xr = obj.xr;
            this.canvasx = xr - xl;
            this.canvasy = yd - yu;
            this.point_move(-xl, -yu, 0);
            this.canvas_size_setting();
        }
        this.redraw();

        var qual;
        if (document.getElementById("nb_quality1").checked) {
            qual = 1;
        } else {
            qual = 1.5;
        }

        var width = this.canvas.width / qual;
        resizedCanvas.width = width.toString();
        resizedCanvas.height = (width * this.canvas.height / this.canvas.width).toString();

        resizedContext.drawImage(this.canvas, 0, 0, resizedCanvas.width, resizedCanvas.height);
        if (document.getElementById("nb_type1").checked) {
            var canvastext = resizedCanvas.toDataURL("image/png");
        } else {
            var canvastext = resizedCanvas.toDataURL("image/jpeg");
        }
        this.mode[this.mode.qa].edit_mode = mode;

        if (document.getElementById("nb_margin2").checked) {
            this.canvasx = cx;
            this.canvasy = cy;
            this.point_move(xl, yu, 0);
            this.canvas_size_setting();
        }
        this.redraw();
        return canvastext;
    }

    gridspace_calculate() {
        this.redraw();
        // ピクセルデータから計算
        var pixels = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        var data = pixels.data;
        var textHeight = 0;
        var currentRow = -1

        for (var i = 0, len = data.length; i < len; i += 4) {
            var r = data[i],
                g = data[i + 1],
                b = data[i + 2],
                alpha = data[i + 3];
            if (r != 255 || g != 255 || b != 255) {
                var yu = (Math.floor((i / 4) / this.canvas.width)) / this.resol;
                break;
            }
        };
        for (var i = data.length - 4; i > 0; i -= 4) {
            var r = data[i],
                g = data[i + 1],
                b = data[i + 2],
                alpha = data[i + 3];
            if (r != 255 || g != 255 || b != 255) {
                var yd = (Math.floor((i / 4) / this.canvas.width) + 1) / this.resol;
                break;
            }
        }
        for (var i = 0, len = data.length; i < len; i += 4) {
            var j = ((i / 4) % this.canvas.height) * this.canvas.width * 4 + Math.floor((i / 4) / this.canvas.height) * 4;
            var r = data[j],
                g = data[j + 1],
                b = data[j + 2],
                alpha = data[j + 3];
            if (r != 255 || g != 255 || b != 255) {
                var xl = (((j / 4) % this.canvas.width)) / this.resol;
                break;
            }
        };
        for (var i = data.length - 4; i > 0; i -= 4) {
            var j = ((i / 4) % this.canvas.height) * this.canvas.width * 4 + Math.floor((i / 4) / this.canvas.height) * 4;
            var r = data[j],
                g = data[j + 1],
                b = data[j + 2],
                alpha = data[j + 3];
            if (r != 255 || g != 255 || b != 255) {
                var xr = (((j / 4) % this.canvas.width) + 1) / this.resol;
                break;
            }
        }

        var obj = new Object();
        obj.yu = yu;
        obj.yd = yd;
        obj.xl = xl;
        obj.xr = xr;
        return obj;
    }

    mode_set(mode, loadtype = 'new') {
        this.mode[this.mode.qa].edit_mode = mode;
        this.submode_reset();
        if (document.getElementById('mode_' + mode)) {
            document.getElementById('mode_' + mode).style.display = 'inline-block';
        }
        if (document.getElementById('style_' + mode)) {
            document.getElementById('style_' + mode).style.display = 'inline-block';
        }
        document.getElementById('mo_' + mode).checked = true;
        this.submode_check('sub_' + mode + this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
        if (mode === "symbol" && !this.panelflag) {
            // Show the panel on the first time landing and then respect user's choice
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
            }
            this.panelflag = true;
        } else if ((mode === "number" || mode === "symbol" || mode === "sudoku") &&
            ((this.ondown_key === "touchstart") || (loadtype === "url" && window.ondown_key === "touchstart"))) {
            // Automatically show panel while in number or shape or sudoku mode on the Mobile/Ipad device
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
            }
        } else if (this.ondown_key === "touchstart") {
            // Turn off panel while switching to other modes on Mobile/Ipad
            document.getElementById('panel_button').textContent = "OFF";
            document.getElementById('float-key').style.display = "none";
        }
        if (mode === "symbol") {
            this.stylemode_check('st_' + mode + this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] % 10);
            this.stylemode_check('st_' + mode + parseInt(this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] / 10) * 10);
        } else {
            this.stylemode_check('st_' + mode + this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]);
        }
        if (this.mode[this.mode.qa].edit_mode === "symbol") {
            this.subsymbolmode(this.mode[this.mode.qa].symbol[0]);
        } else if (this.mode[this.mode.qa].edit_mode === "combi") {
            this.subcombimode(this.mode[this.mode.qa].combi[0]);
        }
        if ((document.getElementById("custom_color_yes").checked) && ((this.gridtype === "square" || this.gridtype === "sudoku" || this.gridtype === "kakuro")) &&
            (mode === "line" || mode === "lineE" || mode === "wall" || mode === "surface" || mode === "cage" || mode === "special")) {
            document.getElementById('style_special').style.display = 'inline';
        } else {
            document.getElementById('style_special').style.display = 'none';
        }
        this.redraw();
    }

    submode_check(name) {
        if (document.getElementById(name)) {
            document.getElementById(name).checked = true;
            this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] = document.getElementById(name).value;
            this.cursolcheck(); // override
            this.redraw(); // Board cursor update
        }
        this.type = this.type_set(); // Coordinate type to select

        // set the custom color to default
        switch (name) {
            case "sub_specialthermo":
                $("#colorpicker_special").spectrum("set", Color.GREY_LIGHT);
                break;
            case "sub_specialarrows":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK_LIGHT);
                break;
            case "sub_specialdirection":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK_LIGHT);
                break;
            case "sub_specialsquareframe":
                $("#colorpicker_special").spectrum("set", Color.GREY_LIGHT);
                break;
            case "sub_specialpolygon":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
        }
    }

    // override
    cursolcheck() {
        return;
    }

    stylemode_check(name) {
        if (document.getElementById(name)) {
            document.getElementById(name).checked = true;
            this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1] = parseInt(document.getElementById(name).value);
            panel_pu.draw_panel(); // Panel update
        }

        // set the custom color to default
        switch (name) {
            case "st_surface1":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK_VERY);
                break;
            case "st_surface8":
                $("#colorpicker_special").spectrum("set", Color.GREY);
                break;
            case "st_surface3":
                $("#colorpicker_special").spectrum("set", Color.GREY_LIGHT);
                break;
            case "st_surface4":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_surface2":
                $("#colorpicker_special").spectrum("set", Color.GREEN_LIGHT_VERY);
                break;
            case "st_surface5":
                $("#colorpicker_special").spectrum("set", Color.BLUE_LIGHT_VERY);
                break;
            case "st_surface6":
                $("#colorpicker_special").spectrum("set", Color.RED_LIGHT);
                break;
            case "st_surface7":
                $("#colorpicker_special").spectrum("set", Color.YELLOW);
                break;
            case "st_surface9":
                $("#colorpicker_special").spectrum("set", Color.PINK_LIGHT);
                break;
            case "st_surface10":
                $("#colorpicker_special").spectrum("set", Color.ORANGE_LIGHT);
                break;
            case "st_surface11":
                $("#colorpicker_special").spectrum("set", Color.PURPLE_LIGHT);
                break;
            case "st_surface12":
                $("#colorpicker_special").spectrum("set", Color.BROWN_LIGHT);
                break;
            case "st_line3":
                $("#colorpicker_special").spectrum("set", Color.GREEN);
                break;
            case "st_line2":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_line5":
                $("#colorpicker_special").spectrum("set", Color.GREY);
                break;
            case "st_line8":
                $("#colorpicker_special").spectrum("set", Color.RED);
                break;
            case "st_line9":
                $("#colorpicker_special").spectrum("set", Color.BLUE_LIGHT);
                break;
            case "st_line80":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_line12":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK_VERY);
                break;
            case "st_line13":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_line40":
                $("#colorpicker_special").spectrum("set", Color.GREY);
                break;
            case "st_line30":
                $("#colorpicker_special").spectrum("set", Color.GREEN);
                break;
            case "st_lineE3":
                $("#colorpicker_special").spectrum("set", Color.GREEN);
                break;
            case "st_lineE2":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_lineE5":
                $("#colorpicker_special").spectrum("set", Color.GREY);
                break;
            case "st_lineE8":
                $("#colorpicker_special").spectrum("set", Color.RED);
                break;
            case "st_lineE9":
                $("#colorpicker_special").spectrum("set", Color.BLUE_LIGHT);
                break;
            case "st_lineE21":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_lineE80":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_lineE12":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK_VERY);
                break;
            case "st_lineE13":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_lineE30":
                $("#colorpicker_special").spectrum("set", Color.GREEN);
                break;
            case "st_wall3":
                $("#colorpicker_special").spectrum("set", Color.GREEN);
                break;
            case "st_wall2":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_wall5":
                $("#colorpicker_special").spectrum("set", Color.GREY);
                break;
            case "st_wall8":
                $("#colorpicker_special").spectrum("set", Color.RED);
                break;
            case "st_wall9":
                $("#colorpicker_special").spectrum("set", Color.BLUE_LIGHT);
                break;
            case "st_wall1":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_wall12":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK_VERY);
                break;
            case "st_wall17":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_wall14":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK);
                break;
            case "st_cage10":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
            case "st_cage7":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK);
                break;
            case "st_cage15":
                $("#colorpicker_special").spectrum("set", Color.GREY_DARK);
                break;
            case "st_cage16":
                $("#colorpicker_special").spectrum("set", Color.BLACK);
                break;
        }
    }

    subsymbolmode(mode) {
        this.mode[this.mode.qa].symbol[0] = mode;
        document.getElementById("symmode_content").innerHTML = mode;
        panel_pu.draw_panel();
        this.redraw();
    }

    subcombimode(mode) {
        this.mode[this.mode.qa].combi[0] = mode;
        document.getElementById("combimode_content").innerHTML = mode;
        this.type = this.type_set();
        this.redraw();
    }

    mode_qa(mode) {
        document.getElementById(mode).checked = true;
        this.mode.qa = mode;
        this.mode_set(this.mode[this.mode.qa].edit_mode); // includes redraw
        this.redraw(); //cursol更新用
    }

    mode_grid(mode) {
        document.getElementById(mode).checked = true;
        if (mode.slice(0, -1) === "nb_grid") {
            this.mode.grid[0] = mode.slice(-1);
        } else if (mode.slice(0, -1) === "nb_lat") {
            this.mode.grid[1] = mode.slice(-1);
        } else if (mode.slice(0, -1) === "nb_out") {
            this.mode.grid[2] = mode.slice(-1);
        }
    }

    submode_reset() {
        document.getElementById('mode_line').style.display = 'none';
        document.getElementById('mode_lineE').style.display = 'none';
        document.getElementById('mode_number').style.display = 'none';
        document.getElementById('mode_symbol').style.display = 'none';
        document.getElementById('mode_special').style.display = 'none';
        document.getElementById('mode_move').style.display = 'none';
        document.getElementById('mode_combi').style.display = 'none';
        document.getElementById('mode_sudoku').style.display = 'none';

        document.getElementById('style_surface').style.display = 'none';
        document.getElementById('style_line').style.display = 'none';
        document.getElementById('style_lineE').style.display = 'none';
        document.getElementById('style_wall').style.display = 'none';
        document.getElementById('style_number').style.display = 'none';
        document.getElementById('style_symbol').style.display = 'none';
        document.getElementById('style_special').style.display = 'none';
        document.getElementById('style_cage').style.display = 'none';
        document.getElementById('style_combi').style.display = 'none';
        document.getElementById('style_sudoku').style.display = 'none';
    }

    reset_selectedmode() {
        switch (this.mode[this.mode.qa].edit_mode) {
            case "surface":
                this[this.mode.qa].surface = {};
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "4") {
                    for (var i in this[this.mode.qa].line) {
                        if (this[this.mode.qa].line[i] !== 98) {
                            delete this[this.mode.qa].line[i];
                        }
                    }
                    this[this.mode.qa].freeline = {};
                } else {
                    for (var i in this[this.mode.qa].line) {
                        if (this[this.mode.qa].line[i] === 98) {
                            delete this[this.mode.qa].line[i];
                        }
                    }
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    for (var i in this[this.mode.qa].lineE) {
                        if (this[this.mode.qa].lineE[i] === 98) {
                            delete this[this.mode.qa].lineE[i];
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    this[this.mode.qa].deletelineE = {};
                } else {
                    for (var i in this[this.mode.qa].lineE) {
                        if (this[this.mode.qa].lineE[i] !== 98) {
                            delete this[this.mode.qa].lineE[i];
                        }
                    }
                    this[this.mode.qa].freelineE = {};
                }
                break;
            case "wall":
                this[this.mode.qa].wall = {};
                break;
            case "number":
                if ((this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") ||
                    (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9")) {
                    this[this.mode.qa].numberS = {};
                } else {
                    this[this.mode.qa].number = {};
                }
                break;
            case "symbol":
                this[this.mode.qa].symbol = {};
                break;
            case "sudoku":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    if (!isEmpty(this[this.mode.qa].number)) {
                        let keys = Object.keys(this[this.mode.qa].number);
                        for (var k = 0; k < keys.length; k++) {
                            if (this[this.mode.qa].number[keys[k]][2] === "5" || this[this.mode.qa].number[keys[k]][2] === "6") { // S or M
                                delete this[this.mode.qa].number[keys[k]];
                            }
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    this[this.mode.qa].numberS = {};
                } else {
                    this[this.mode.qa].number = {};
                }
                break;
            case "cage":
                this[this.mode.qa].cage = {};
                break;
            case "special":
                this[this.mode.qa][this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]] = [];
                break;
            case "combi":
                switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                    case "tents":
                        break;
                    case "linex":
                        break;
                    case "edgex":
                        break;
                    case "edgexoi":
                        break;
                    case "blpo":
                        break;
                    case "blwh":
                        break;
                    case "battleship":
                        break;
                    case "star":
                        break;
                    case "magnets":
                        break;
                    case "lineox":
                        break;
                    case "yajilin":
                        break;
                    case "hashi":
                        break;
                    case "arrowS":
                        break;
                    case "shaka":
                        break;
                    case "numfl":
                        break;
                    case "alfl":
                        break;
                    case "edgesub":
                        break;
                }
                break;
        }
        this.redraw();
    }

    ///////SAVE/////////

    maketext() {
        var text = "";
        text = this.gridtype + "," + this.nx.toString() + "," + this.ny.toString() + "," + this.size.toString() + "," +
            this.theta.toString() + "," + this.reflect.toString() + "," + this.canvasx + "," + this.canvasy + "," + this.center_n + "," + this.center_n0 + "," +
            this.sudoku[0].toString() + "," + this.sudoku[1].toString() + "," + this.sudoku[2].toString() + "," + this.sudoku[3].toString();

        // Puzzle title
        let titleinfo = document.getElementById("saveinfotitle").value;
        text += "," + "Title: " + titleinfo.replace(/,/g, '%2C');

        // Puzzle author
        let authorinfo = document.getElementById("saveinfoauthor").value;
        text += "," + "Author: " + authorinfo.replace(/,/g, '%2C');

        // Puzzle Source
        text += "," + document.getElementById("saveinfosource").value;

        // Puzzle Rules
        let ruleinfo = document.getElementById("saveinforules").value;
        text += "," + ruleinfo.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');

        // Border button status
        text += "," + document.getElementById('edge_button').textContent + "\n";

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode) + "\n";

        if (document.getElementById("save_undo").checked === false) {
            var qr = this.pu_q.command_redo.__a;
            var qu = this.pu_q.command_undo.__a;
            var ar = this.pu_a.command_redo.__a;
            var au = this.pu_a.command_undo.__a;
            this.pu_q.command_redo.__a = [];
            this.pu_q.command_undo.__a = [];
            this.pu_a.command_redo.__a = [];
            this.pu_a.command_undo.__a = [];
        }

        text += JSON.stringify(this.pu_q) + "\n";
        text += JSON.stringify(this.pu_a) + "\n";

        if (document.getElementById("save_undo").checked === false) {
            this.pu_q.command_redo.__a = qr;
            this.pu_q.command_undo.__a = qu;
            this.pu_a.command_redo.__a = ar;
            this.pu_a.command_undo.__a = au;
        }

        var list = [this.centerlist[0]];
        for (var i = 1; i < this.centerlist.length; i++) {
            list.push(this.centerlist[i] - this.centerlist[i - 1]);
        }

        text += JSON.stringify(list) + "\n";

        // Copy the tab selector modes
        let user_choices = getValues('mode_choices');
        text += JSON.stringify(user_choices) + "\n";

        // save answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByTagName("INPUT");
        var answersetting = {};
        for (var i = 0; i < settingstatus.length; i++) {
            if (settingstatus[i].checked) {
                answersetting[settingstatus[i].id] = true;
            } else {
                answersetting[settingstatus[i].id] = false;
            }
        }
        text += JSON.stringify(answersetting) + "\n";

        text += JSON.stringify("x") + "\n"; // Dummy, to match the size of maketext_duplicate

        text += JSON.stringify("x") + "\n"; // Dummy, to match the size of maketext_duplicate

        // Version
        text += JSON.stringify(this.version) + "\n";

        // Save submode/style/combi settings
        text += JSON.stringify(this.mode) + "\n";

        // Theme Setting
        if (document.getElementById("light_mode").checked) {
            text += JSON.stringify("light") + "\n";
        } else if (document.getElementById("dark_mode").checked) {
            text += JSON.stringify("dark") + "\n";
        }

        // Custom Colors
        if (document.getElementById("custom_color_yes").checked) {
            text += JSON.stringify("true") + "\n"
        } else {
            text += JSON.stringify("false") + "\n"
        }

        if (document.getElementById("save_undo").checked === false) {
            qr = this.pu_q_col.command_redo.__a;
            qu = this.pu_q_col.command_undo.__a;
            ar = this.pu_a_col.command_redo.__a;
            au = this.pu_a_col.command_undo.__a;
            this.pu_q_col.command_redo.__a = [];
            this.pu_q_col.command_undo.__a = [];
            this.pu_a_col.command_redo.__a = [];
            this.pu_a_col.command_undo.__a = [];
        }

        text += JSON.stringify(this.pu_q_col) + "\n";
        text += JSON.stringify(this.pu_a_col);

        if (document.getElementById("save_undo").checked === false) {
            this.pu_q_col.command_redo.__a = qr;
            this.pu_q_col.command_undo.__a = qu;
            this.pu_a_col.command_redo.__a = ar;
            this.pu_a_col.command_undo.__a = au;
        }

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        var u8text = new TextEncoder().encode(text);
        var deflate = new Zlib.RawDeflate(u8text);
        var compressed = deflate.compress();
        var char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
        var ba = window.btoa(char8);
        var url = location.href.split('?')[0];
        // console.log("save",text.length,"=>",compressed.length,"=>",ba.length); //Github ba.length max 7360

        // Warning Long URL
        if (ba.length >= 7360) {
            Swal.fire({
                title: 'Warning:',
                html: '<h3 class="warn">URL too long and will not open directly in the browser. Follow the following steps: <br>1) Copy the generated URL <br> 2) Open Penpa+ site (https://swaroopg92.github.io/penpa-edit/) <br> 3) Use "Load" button to load the URL</h3>',
                icon: 'warning',
                confirmButtonText: 'ok',
            })
        }
        return url + "?m=edit&p=" + ba;
    }

    maketext_duplicate() {
        var text = "";
        text = this.gridtype + "," + this.nx.toString() + "," + this.ny.toString() + "," + this.size.toString() + "," +
            this.theta.toString() + "," + this.reflect.toString() + "," + this.canvasx + "," + this.canvasy + "," + this.center_n + "," + this.center_n0 + "," +
            this.sudoku[0].toString() + "," + this.sudoku[1].toString() + "," + this.sudoku[2].toString() + "," + this.sudoku[3].toString();

        // Puzzle title
        let titleinfo = document.getElementById("saveinfotitle").value;
        text += "," + "Title: " + titleinfo.replace(/,/g, '%2C');

        // Puzzle author
        let authorinfo = document.getElementById("saveinfoauthor").value;
        text += "," + "Author: " + authorinfo.replace(/,/g, '%2C');

        // Puzzle Source
        text += "," + document.getElementById("saveinfosource").value;

        // Puzzle Rules
        let ruleinfo = document.getElementById("saveinforules").value;
        text += "," + ruleinfo.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');

        // Border button status
        text += "," + document.getElementById('edge_button').textContent + "\n";

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode) + "\n";

        var qr = this.pu_q.command_redo.__a;
        var qu = this.pu_q.command_undo.__a;
        var ar = this.pu_a.command_redo.__a;
        var au = this.pu_a.command_undo.__a;
        this.pu_q.command_redo.__a = [];
        this.pu_q.command_undo.__a = [];
        this.pu_a.command_redo.__a = [];
        this.pu_a.command_undo.__a = [];
        text += JSON.stringify(this.pu_q) + "\n";
        text += JSON.stringify(this.pu_a) + "\n";
        this.pu_q.command_redo.__a = qr;
        this.pu_q.command_undo.__a = qu;
        this.pu_a.command_redo.__a = ar;
        this.pu_a.command_undo.__a = au;

        var list = [this.centerlist[0]];
        for (var i = 1; i < this.centerlist.length; i++) {
            list.push(this.centerlist[i] - this.centerlist[i - 1]);
        }

        text += JSON.stringify(list) + "\n";

        // Copy the tab selector modes
        let user_choices = getValues('mode_choices');
        text += JSON.stringify(user_choices) + "\n";

        // Save timer
        if (this.mmode === "solve") {
            text += sw_timer.getTimeValues().toString(['hours', 'minutes', 'seconds', 'secondTenths']) + "\n";
        }

        // save answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByTagName("INPUT");
        var answersetting = {};
        for (var i = 0; i < settingstatus.length; i++) {
            if (settingstatus[i].checked) {
                answersetting[settingstatus[i].id] = true;
            } else {
                answersetting[settingstatus[i].id] = false;
            }
        }
        text += JSON.stringify(answersetting) + "\n";

        if (this.mmode !== "solve") {
            text += JSON.stringify("x") + "\n"; // dummy to compensate time saver for non solve cloning
        }

        if (this.comp) {
            text += JSON.stringify("comp") + "\n";
        } else {
            text += JSON.stringify("x") + "\n";
        }

        // Version
        text += JSON.stringify(this.version) + "\n";

        // Save submode/style/combi settings
        text += JSON.stringify(this.mode) + "\n";

        // Theme Setting
        if (document.getElementById("light_mode").checked) {
            text += JSON.stringify("light") + "\n";
        } else if (document.getElementById("dark_mode").checked) {
            text += JSON.stringify("dark") + "\n";
        }

        // Custom Colors
        if (document.getElementById("custom_color_yes").checked) {
            text += JSON.stringify("true") + "\n"
        } else {
            text += JSON.stringify("false") + "\n"
        }

        qr = this.pu_q_col.command_redo.__a;
        qu = this.pu_q_col.command_undo.__a;
        ar = this.pu_a_col.command_redo.__a;
        au = this.pu_a_col.command_undo.__a;
        this.pu_q_col.command_redo.__a = [];
        this.pu_q_col.command_undo.__a = [];
        this.pu_a_col.command_redo.__a = [];
        this.pu_a_col.command_undo.__a = [];
        text += JSON.stringify(this.pu_q_col) + "\n";
        text += JSON.stringify(this.pu_a_col);
        this.pu_q_col.command_redo.__a = qr;
        this.pu_q_col.command_undo.__a = qu;
        this.pu_a_col.command_redo.__a = ar;
        this.pu_a_col.command_undo.__a = au;

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        var u8text = new TextEncoder().encode(text);
        var deflate = new Zlib.RawDeflate(u8text);
        var compressed = deflate.compress();
        var char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
        var ba = window.btoa(char8);
        var url = location.href.split('?')[0];
        // if solution exist then copy the solution as well
        if (this.solution) {
            u8text = new TextEncoder().encode(this.solution);
            deflate = new Zlib.RawDeflate(u8text);
            compressed = deflate.compress();
            char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
            var ba_s = window.btoa(char8);
            // Warning Long URL
            if ((ba.length + ba_s.length) >= 7360) {
                Swal.fire({
                    title: 'Warning:',
                    html: '<h3 class="warn">URL too long and will not open directly in the browser. Follow the following steps: <br>1) Copy the generated URL <br> 2) Open Penpa+ site (https://swaroopg92.github.io/penpa-edit/) <br> 3) Use "Load" button to load the URL</h3>',
                    icon: 'warning',
                    confirmButtonText: 'ok',
                })
            }
            return url + "?m=edit&p=" + ba + "&a=" + ba_s;
        } else {
            // Warning Long URL
            if (ba.length >= 7360) {
                Swal.fire({
                    title: 'Warning:',
                    html: '<h3 class="warn">URL too long and will not open directly in the browser. Follow the following steps: <br>1) Copy the generated URL <br> 2) Open Penpa+ site (https://swaroopg92.github.io/penpa-edit/) <br> 3) Use "Load" button to load the URL</h3>',
                    icon: 'warning',
                    confirmButtonText: 'ok',
                })
            }
            return url + "?m=edit&p=" + ba;
        }
    }

    maketext_solve() {
        var text = "";
        text = this.gridtype + "," + this.nx.toString() + "," + this.ny.toString() + "," + this.size.toString() + "," +
            this.theta.toString() + "," + this.reflect.toString() + "," + this.canvasx + "," + this.canvasy + "," + this.center_n + "," + this.center_n0 + "," +
            this.sudoku[0].toString() + "," + this.sudoku[1].toString() + "," + this.sudoku[2].toString() + "," + this.sudoku[3].toString();

        // Puzzle title
        let titleinfo = document.getElementById("saveinfotitle").value;
        text += "," + "Title: " + titleinfo.replace(/,/g, '%2C');

        // Puzzle author
        let authorinfo = document.getElementById("saveinfoauthor").value;
        text += "," + "Author: " + authorinfo.replace(/,/g, '%2C');

        // Puzzle Source
        text += "," + document.getElementById("saveinfosource").value;

        // Puzzle Rules
        let ruleinfo = document.getElementById("saveinforules").value;
        text += "," + ruleinfo.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');

        // Border button status
        text += "," + document.getElementById('edge_button').textContent + "\n";

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode.grid) + "~" + JSON.stringify(this.mode["pu_a"]["edit_mode"]) + "~" + JSON.stringify(this.mode["pu_a"][this.mode["pu_a"]["edit_mode"]]) + "\n";

        var qr = this.pu_q.command_redo.__a;
        var qu = this.pu_q.command_undo.__a;
        this.pu_q.command_redo.__a = [];
        this.pu_q.command_undo.__a = [];
        text += JSON.stringify(this.pu_q) + "\n" + "\n";
        this.pu_q.command_redo.__a = qr;
        this.pu_q.command_undo.__a = qu;

        var list = [this.centerlist[0]];
        for (var i = 1; i < this.centerlist.length; i++) {
            list.push(this.centerlist[i] - this.centerlist[i - 1]);
        }
        text += JSON.stringify(list) + "\n";

        // Copy the tab selector modes
        let user_choices = getValues('mode_choices');
        text += JSON.stringify(user_choices) + "\n";

        // save answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByTagName("INPUT");
        var answersetting = {};
        for (var i = 0; i < settingstatus.length; i++) {
            if (settingstatus[i].checked) {
                answersetting[settingstatus[i].id] = true;
            } else {
                answersetting[settingstatus[i].id] = false;
            }
        }
        text += JSON.stringify(answersetting) + "\n";

        text += JSON.stringify("x") + "\n"; // Dummy, to match the size of maketext_duplicate

        text += JSON.stringify("x") + "\n"; // Dummy, to match the size of maketext_duplicate

        // Version
        text += JSON.stringify(this.version) + "\n";

        // Save submode/style/combi settings
        text += JSON.stringify(this.mode) + "\n";

        // Don't save theme setting in solving as solver might want his own theme, but having this placeholder to match the size with other url modes
        text += JSON.stringify("x") + "\n";

        // Custom Colors
        if (document.getElementById("custom_color_yes").checked) {
            text += JSON.stringify("true") + "\n"
        } else {
            text += JSON.stringify("false") + "\n"
        }
        qr = this.pu_q_col.command_redo.__a;
        qu = this.pu_q_col.command_undo.__a;
        this.pu_q_col.command_redo.__a = [];
        this.pu_q_col.command_undo.__a = [];
        text += JSON.stringify(this.pu_q_col) + "\n" + "\n";
        this.pu_q_col.command_redo.__a = qr;
        this.pu_q_col.command_undo.__a = qu;

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        var u8text = new TextEncoder().encode(text);
        var deflate = new Zlib.RawDeflate(u8text);
        var compressed = deflate.compress();
        var char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
        var ba = window.btoa(char8);
        var url = location.href.split('?')[0];
        //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);

        // Warning Long URL
        if (ba.length >= 7360) {
            Swal.fire({
                title: 'Warning:',
                html: '<h3 class="warn">URL too long and will not open directly in the browser. Follow the following steps: <br>1) Copy the generated URL <br> 2) Open Penpa+ site (https://swaroopg92.github.io/penpa-edit/) <br> 3) Use "Load" button to load the URL</h3>',
                icon: 'warning',
                confirmButtonText: 'ok',
            })
        }
        return url + "?m=solve&p=" + ba;
    }

    maketext_compsolve() {
        var text = "";
        text = this.gridtype + "," + this.nx.toString() + "," + this.ny.toString() + "," + this.size.toString() + "," +
            this.theta.toString() + "," + this.reflect.toString() + "," + this.canvasx + "," + this.canvasy + "," + this.center_n + "," + this.center_n0 + "," +
            this.sudoku[0].toString() + "," + this.sudoku[1].toString() + "," + this.sudoku[2].toString() + "," + this.sudoku[3].toString();

        // Puzzle title
        let titleinfo = document.getElementById("saveinfotitle").value;
        text += "," + "Title: " + titleinfo.replace(/,/g, '%2C');

        // Puzzle author
        let authorinfo = document.getElementById("saveinfoauthor").value;
        text += "," + "Author: " + authorinfo.replace(/,/g, '%2C');

        // Puzzle Source
        text += "," + document.getElementById("saveinfosource").value;

        // Puzzle Rules
        let ruleinfo = document.getElementById("saveinforules").value;
        text += "," + ruleinfo.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');

        // Border button status
        text += "," + document.getElementById('edge_button').textContent + "\n";

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode.grid) + "~" + JSON.stringify(this.mode["pu_a"]["edit_mode"]) + "~" + JSON.stringify(this.mode["pu_a"][this.mode["pu_a"]["edit_mode"]]) + "\n";

        var qr = this.pu_q.command_redo.__a;
        var qu = this.pu_q.command_undo.__a;
        this.pu_q.command_redo.__a = [];
        this.pu_q.command_undo.__a = [];
        text += JSON.stringify(this.pu_q) + "\n" + "\n";
        this.pu_q.command_redo.__a = qr;
        this.pu_q.command_undo.__a = qu;

        var list = [this.centerlist[0]];
        for (var i = 1; i < this.centerlist.length; i++) {
            list.push(this.centerlist[i] - this.centerlist[i - 1]);
        }
        text += JSON.stringify(list) + "\n";

        // Copy the tab selector modes
        let user_choices = getValues('mode_choices');
        text += JSON.stringify(user_choices) + "\n";

        // save answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByTagName("INPUT");
        var answersetting = {};
        for (var i = 0; i < settingstatus.length; i++) {
            if (settingstatus[i].checked) {
                answersetting[settingstatus[i].id] = true;
            } else {
                answersetting[settingstatus[i].id] = false;
            }
        }
        text += JSON.stringify(answersetting) + "\n";

        text += JSON.stringify("x") + "\n"; // Dummy, to match the size of maketext_duplicate

        text += JSON.stringify("comp") + "\n";

        // Version
        text += JSON.stringify(this.version) + "\n";

        // Save submode/style/combi settings
        text += JSON.stringify(this.mode) + "\n";

        // Don't save theme setting in solving as solver might want his own theme, but having this placeholder to match the size with other url modes
        text += JSON.stringify("x") + "\n";

        // Custom Colors
        if (document.getElementById("custom_color_yes").checked) {
            text += JSON.stringify("true") + "\n"
        } else {
            text += JSON.stringify("false") + "\n"
        }
        qr = this.pu_q_col.command_redo.__a;
        qu = this.pu_q_col.command_undo.__a;
        this.pu_q_col.command_redo.__a = [];
        this.pu_q_col.command_undo.__a = [];
        text += JSON.stringify(this.pu_q_col) + "\n" + "\n";
        this.pu_q_col.command_redo.__a = qr;
        this.pu_q_col.command_undo.__a = qu;

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        var u8text = new TextEncoder().encode(text);
        var deflate = new Zlib.RawDeflate(u8text);
        var compressed = deflate.compress();
        var char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
        var ba = window.btoa(char8);
        var url = location.href.split('?')[0];
        //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);

        // Warning Long URL
        if (ba.length >= 7360) {
            Swal.fire({
                title: 'Warning:',
                html: '<h3 class="warn">URL too long and will not open directly in the browser. Follow the following steps: <br>1) Copy the generated URL <br> 2) Open Penpa+ site (https://swaroopg92.github.io/penpa-edit/) <br> 3) Use "Load" button to load the URL</h3>',
                icon: 'warning',
                confirmButtonText: 'ok',
            })
        }
        return url + "?m=solve&p=" + ba;
    }

    maketext_solve_solution() {
        var text_head = this.maketext_solve();
        var text;
        text = JSON.stringify(this.make_solution());

        var u8text = new TextEncoder().encode(text);
        var deflate = new Zlib.RawDeflate(u8text);
        var compressed = deflate.compress();
        var char8 = Array.from(compressed, e => String.fromCharCode(e)).join("");
        var ba = window.btoa(char8);
        //console.log("save",text.length,"=>",compressed.length,"=>",ba.length);

        // Warning Long URL
        if ((text_head.length + ba.length) >= 7360) {
            Swal.fire({
                title: 'Warning:',
                html: '<h3 class="warn">URL too long and will not open directly in the browser. Follow the following steps: <br>1) Copy the generated URL <br> 2) Open Penpa+ site (https://swaroopg92.github.io/penpa-edit/) <br> 3) Use "Load" button to load the URL</h3>',
                icon: 'warning',
                confirmButtonText: 'ok',
            })
        }
        return text_head + "&a=" + ba;
    }

    make_solution() {
        // 0 - shading
        // 1 - Line / FreeLine
        // 2 - Edge / FreeEdge
        // 3 - Wall
        // 4 - Number
        // 5 - Symbol
        var sol = [
            [],
            [],
            [],
            [],
            [],
            []
        ];

        var pu = "pu_a";

        // See if user selected any particular setting
        var answersetting = document.getElementById("answersetting");
        var settingstatus = answersetting.getElementsByTagName("INPUT");
        var checkall = true;

        // loop through and check if any settings are selected
        for (var i = 0; i < settingstatus.length; i++) {
            if (settingstatus[i].checked) {
                checkall = false;
                break;
            }
        }

        if (document.getElementById("sol_surface").checked === true || checkall) {
            for (var i in this[pu].surface) {
                if (this[pu].surface[i] === 1 || this[pu].surface[i] === 4) {
                    sol[0].push(i);
                }
            }
        }

        if (document.getElementById("sol_square").checked === true || checkall) {
            for (var i in this[pu].symbol) {
                if (this[pu].symbol[i][0] === 2 && this[pu].symbol[i][1] === "square_LL") {
                    if (sol[0].indexOf(i) === -1) {
                        sol[0].push(i);
                    }
                }
            }
        }

        if (document.getElementById("sol_loopline").checked === true || checkall) {
            for (var i in this[pu].line) {
                if (this[pu].line[i] === 3) {
                    sol[1].push(i + ",1");
                } else if (this[pu].line[i] === 30) {
                    sol[1].push(i + ",2");
                }
            }

            for (var i in this[pu].freeline) {
                if (this[pu].freeline[i] === 3) {
                    sol[1].push(i + ",1");
                } else if (this[pu].freeline[i] === 30) {
                    sol[1].push(i + ",2");
                }
            }
        }

        if (document.getElementById("sol_loopedge").checked === true || checkall) {
            if (document.getElementById("sol_ignoreborder").checked === true) {
                for (var i in this[pu].lineE) {
                    if ((this.frame[i] && this.frame[i] === 2) ||
                        (this["pu_q"].lineE[i] && this["pu_q"].lineE[i] === 2)) {
                        // ignore the edge if its on the border (suitable for araf, pentominous type of puzzles)
                    } else {
                        if (this[pu].lineE[i] === 3) {
                            sol[2].push(i + ",1");
                        } else if (this[pu].lineE[i] === 30) {
                            sol[2].push(i + ",2");
                        }
                    }
                }
            } else {
                for (var i in this[pu].lineE) {
                    if (this[pu].lineE[i] === 3) {
                        sol[2].push(i + ",1");
                    } else if (this[pu].lineE[i] === 30) {
                        sol[2].push(i + ",2");
                    }
                }
            }

            for (var i in this[pu].freelineE) {
                if (this[pu].freelineE[i] === 3) {
                    sol[2].push(i + ",1");
                } else if (this[pu].freelineE[i] === 30) {
                    sol[2].push(i + ",2");
                }
            }
        }

        if (document.getElementById("sol_wall").checked === true || checkall) {
            for (var i in this[pu].wall) {
                if (this[pu].wall[i] === 3) {
                    sol[3].push(i);
                }
            }
        }

        if (document.getElementById("sol_number").checked === true || checkall) {
            for (var i in this[pu].number) {
                // Sudoku only one number and multiple digits in same cell should not be considered, this is for single digit obtained from candidate submode
                if (this[pu].number[i][2] === "7") {
                    // (Green or light blue or dark blue or red)
                    if (this[pu].number[i][1] === 2 || this[pu].number[i][1] === 8 || this[pu].number[i][1] === 9 || this[pu].number[i][1] === 10) {
                        var sum = 0,
                            a;
                        for (var j = 0; j < 10; j++) {
                            if (this[pu].number[i][0][j] === 1) {
                                sum += 1;
                                a = j + 1;
                            }
                        }
                        if (sum === 1) {
                            sol[4].push(i + "," + a);
                        }
                    }
                } else if (!isNaN(this[pu].number[i][0]) || !this[pu].number[i][0].match(/[^A-Za-z]+/)) {
                    // ((Green or light blue or dark blue or red) and (Normal, M, S, L))
                    if ((this[pu].number[i][1] === 2 || this[pu].number[i][1] === 8 || this[pu].number[i][1] === 9 || this[pu].number[i][1] === 10) && (this[pu].number[i][2] === "1" || this[pu].number[i][2] === "5" || this[pu].number[i][2] === "6" || this[pu].number[i][2] === "10")) {
                        sol[4].push(i + "," + this[pu].number[i][0]);
                    }
                }
            }
        }

        for (var i in this[pu].symbol) {
            switch (this[pu].symbol[i][1]) {
                case "circle_M":
                    if (document.getElementById("sol_circle").checked === true || checkall) {
                        if (this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 2) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "A");
                        }
                    }
                    break;
                case "tri":
                    if (document.getElementById("sol_tri").checked === true || checkall) {
                        if (this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 4) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "B");
                        }
                    }
                    break;
                case "arrow_S":
                    if (document.getElementById("sol_arrow").checked === true || checkall) {
                        if (this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 8) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "C");
                        }
                    }
                    break;
                case "battleship_B":
                    if (document.getElementById("sol_battleship").checked === true || checkall) {
                        if (this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 6) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "D");
                        }
                    }
                    break;
                case "star": //any star
                    if (document.getElementById("sol_star").checked === true || checkall) {
                        if (this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 3) {
                            sol[5].push(i + "," + 1 + "E");
                        }
                    }
                    break;
                case "tents":
                    if (document.getElementById("sol_tent").checked === true || checkall) {
                        if (this[pu].symbol[i][0] === 2) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "F");
                        }
                    }
                    break;
                case "math":
                case "math_G":
                    if (document.getElementById("sol_math").checked === true || checkall) {
                        if (this[pu].symbol[i][0] === 2 || this[pu].symbol[i][0] === 3) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "G");
                        }
                    }
                    break;
                case "sun_moon":
                    if (document.getElementById("sol_akari").checked === true || checkall) {
                        if (this[pu].symbol[i][0] === 3) {
                            sol[5].push(i + "," + this[pu].symbol[i][0] + "H");
                        }
                    }
                    break;
            }
        }

        for (var i = 0; i < 6; i++) {
            sol[i] = sol[i].sort();
        }
        return sol;
    }

    maketext_ppfile() {
        var text = "";
        var gridsize = "19.842";
        var fontsize = "16";
        var header = document.getElementById("savetextarea_pp").value;

        //セット
        if (header != "") {
            if (header === "Tromino") {
                text += '#Shapes:0,True\n' +
                    '*Grid:11.9052,-11.9052\n' +
                    '*Skew:0,0\n' +
                    '*Offset:11.9052,-11.9052\n' +
                    '*Size:11.9052,-11.9052\n' +
                    '*Alignment:0,0\n' +
                    '*Fill:80\n' +
                    '*Stroke:100,0.25,0,1\n' +
                    '*Border:-1,2,0,1\n' +
                    '. . . 1\n' +
                    '1 1 . 1\n' +
                    '1 . . 1\n' +
                    '--------\n';
            } else if (header === "LITS") {

            } else if (header === "LITSO") {
                text += '#Shapes:0,True\n' +
                    '*Grid:11.9052,-11.9052\n' +
                    '*Skew:0,0\n' +
                    '*Offset:11.9052,-11.9052\n' +
                    '*Size:11.9052,-11.9052\n' +
                    '*Alignment:0,0\n' +
                    '*Fill:80\n' +
                    '*Stroke:100,0.25,0,1\n' +
                    '*Border:-1,2,0,1\n' +
                    '. 1 1 . . . 1 . .\n' +
                    '. 1 1 . . 1 1 . .\n' +
                    '. . . . . 1 . . .\n' +
                    '1 . . . . . . . .\n' +
                    '1 . . 1 1 . . 1 .\n' +
                    '1 . . 1 . . . 1 1\n' +
                    '1 . . 1 . . . 1 .\n' +
                    '--------\n';
            } else if (header === "Pentomino") {
                text += '#Shapes:0,True\n' +
                    '*Grid:11.9052,-11.9052\n' +
                    '*Skew:0,0\n' +
                    '*Offset:11.9052,-11.9052\n' +
                    '*Size:11.9052,-11.9052\n' +
                    '*Alignment:0,0\n' +
                    '*Fill:80\n' +
                    '*Stroke:100,0.25,0,1\n' +
                    '*Border:-1,2,0,1\n' +
                    '. . 1 . . . 1 . . 1 1 . . . .\n' +
                    '. 1 1 1 . . 1 . . 1 . . . . .\n' +
                    '. . 1 . . 1 1 . 1 1 . . . . .\n' +
                    '. . . . . . 1 . . . . . . . .\n' +
                    '. . . . . . . . . . . . . . .\n' +
                    '. 1 . . 1 1 1 . 1 1 1 . . 1 1\n' +
                    '. 1 . . 1 . 1 . . . 1 . 1 1 .\n' +
                    '1 1 1 . . . . . . . 1 . 1 . .\n' +
                    '. . . . 1 . . . . . . . . . .\n' +
                    '. 1 . . 1 . 1 1 . 1 . . 1 . .\n' +
                    '1 1 . . 1 . 1 . . 1 . . 1 1 .\n' +
                    '. 1 1 . 1 . 1 . . 1 1 . 1 1 .\n' +
                    '. . . . 1 . 1 . . . 1 . . . .\n' +
                    '--------\n';
            } else {
                text += '#Settings:7,True\n' +
                    '*Grid:' + gridsize + ',' + gridsize + '\n' +
                    '*Skew:0,0\n' +
                    '*Offset:' + 0 + ',' + (-gridsize) + '\n' +
                    '*Size:' + gridsize + ',' + gridsize + '\n' +
                    '*Alignment:0,0\n' +
                    '*Fill:100\n' +
                    '*Stroke:-1,0,0,1\n' +
                    '*Font:IPAGothic,Normal,Normal,Normal,' + fontsize + '\n' +
                    '*TextAlignment:0,0\n';
                text += header + '\n';
                text += "--------\n";
            }
        }

        //Board/Frame
        if (!isEmpty(this.pu_a.line)) {
            text += '#Frame:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:9.921,9.921\n' +
                '*Stroke:80,3,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_a.line) {
                i1 = Number(i.split(",")[0]);
                i2 = Number(i.split(",")[1]);
                y1 = (i1 % this.nx0) - 2;
                y2 = (i2 % this.nx0) - 2;
                x1 = parseInt(i1 / this.nx0) - 2;
                x2 = parseInt(i2 / this.nx0) - 2;
                text += x1 + ',' + y1 + ';' + x2 + ',' + y2 + '\n';
            }
            text += "--------\n";
        }

        //Line Data
        if (!isEmpty(this.pu_q.lineE)) {
            text += '#NumberData:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Stroke:100,2,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_q.lineE) {
                i1 = Number(i.split(",")[0]) - this.nx0 * this.ny0;
                i2 = Number(i.split(",")[1]) - this.nx0 * this.ny0;
                y1 = (i1 % this.nx0) - 1;
                y2 = (i2 % this.nx0) - 1;
                x1 = parseInt(i1 / this.nx0) - 1;
                x2 = parseInt(i2 / this.nx0) - 1;
                text += x1 + ',' + y1 + ';' + x2 + ',' + y2 + '\n';
            }
            text += "--------\n";
        }

        //Line Data in Answer Mode
        if (!isEmpty(this.pu_a.lineE)) {
            text += '#AnswerNumber:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Stroke:100,2,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_a.lineE) {
                i1 = Number(i.split(",")[0]) - this.nx0 * this.ny0;
                i2 = Number(i.split(",")[1]) - this.nx0 * this.ny0;
                y1 = (i1 % this.nx0) - 1;
                y2 = (i2 % this.nx0) - 1;
                x1 = parseInt(i1 / this.nx0) - 1;
                x2 = parseInt(i2 / this.nx0) - 1;
                text += x1 + ',' + y1 + ';' + x2 + ',' + y2 + '\n';
            }
            text += "--------\n";
        }

        //盤面枠
        text += '#盤面枠:0,True\n' +
            '*Grid:' + gridsize + ',' + gridsize + '\n' +
            '*Skew:0,0\n' +
            '*Offset:0,0\n' +
            '*Size:' + gridsize + ',' + gridsize + '\n' +
            '*Alignment:0,0\n' +
            '*Fill:-1\n';
        if (this.mode.grid[0] === "1") {
            text += '*Stroke:100,0.4,0,1\n'; //実線
        } else if (this.mode.grid[0] === "2") {
            text += '*Stroke:100,0.4,1.804/3.1565/0.902,1\n'; //点線
        } else if (this.mode.grid[0] === "3") {
            text += '*Stroke:-1,0,0,1\n'; //なし
        }
        if (this.mode.grid[2] === "1") {
            text += '*Border:100,2,0,1\n'; //実線
        } else if (this.mode.grid[2] === "2") {
            text += '*Border:-1,0,0,1\n'; //枠なし
        }

        text += "%%盤面マス%%\n";
        text += "--------\n";

        //Answer Digits
        if (!isEmptycontent("pu_a", "number", 2, "1")) {
            text += '#AnswerDigits:3,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                        text += this.pu_a.number[i + j * (this.nx0)][0] + " ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //解答文字
        if (!isEmptycontent("pu_a", "number", 2, "1")) {
            text += '#解答文字:7,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + fontsize + '\n' +
                '*TextAlignment:1,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                        text += this.pu_a.number[i + j * (this.nx0)][0] + " ";
                    } else {
                        text += "_ ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //問題数字
        if (!isEmptycontent("pu_q", "number", 2, "1")) {
            text += '#問題数字:3,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                        text += this.pu_q.number[i + j * (this.nx0)][0] + " ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //問題1/4数字
        if (!isEmpty(this.pu_q.numberS)) {
            text += '#問題1/4数字:3,True\n' +
                '*Grid:' + gridsize / 2 + ',' + gridsize / 2 + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize / 2 + ',' + gridsize / 2 + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n';
            var k;
            for (var j = 0; j < 2 * this.ny0 - 8; j++) {
                for (var i = 0; i < 2 * this.nx0 - 8; i++) {
                    if (j % 2 === 0 && i % 2 === 0) {
                        k = 4 * this.nx0 * this.ny0 + 4 * 2 * this.nx0 + 8 + 2 * i + 2 * j * this.nx0;
                    } else if (j % 2 === 0 && i % 2 === 1) {
                        k = 4 * this.nx0 * this.ny0 + 4 * 2 * this.nx0 + 8 + 1 + 2 * (i - 1) + 2 * j * this.nx0;
                    } else if (j % 2 === 1 && i % 2 === 0) {
                        k = 4 * this.nx0 * this.ny0 + 4 * 2 * this.nx0 + 8 + 2 + 2 * i + 2 * (j - 1) * this.nx0;
                    } else if (j % 2 === 1 && i % 2 === 1) {
                        k = 4 * this.nx0 * this.ny0 + 4 * 2 * this.nx0 + 8 + 3 + 2 * (i - 1) + 2 * (j - 1) * this.nx0;
                    }
                    if (this.pu_q.numberS[k] && !isNaN(this.pu_q.numberS[k][0])) {
                        text += this.pu_q.numberS[k][0] + " ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";

        }

        //Text related data
        if (!isEmptycontent("pu_q", "number", 2, "1")) {
            text += '#TextData:7,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + fontsize + '\n' +
                '*TextAlignment:1,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                        text += this.pu_q.number[i + j * (this.nx0)][0] + " ";
                    } else {
                        text += "_ ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //問題Tapa数字
        if (!isEmptycontent("pu_q", "number", 2, "4")) {
            text += '#問題Tapa数字:6,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "4" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                        text += this.pu_q.number[i + j * (this.nx0)][0] + " ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //問題丸
        if (!isEmptycontent("pu_q", "symbol", 1, "circle_M")) {
            text += '#問題丸:4,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + (gridsize - 2) + ',' + (gridsize - 2) + '\n' +
                '*Alignment:1,1\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 1 && this.pu_q.symbol[i + j * (this.nx0)][1] === "circle_M") {
                        text += "0 ";
                    } else if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 2 && this.pu_q.symbol[i + j * (this.nx0)][1] === "circle_M") {
                        text += "1 ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //解答丸
        if (!isEmptycontent("pu_a", "symbol", 1, "circle_M")) {
            text += '#解答丸:4,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + (gridsize - 2) + ',' + (gridsize - 2) + '\n' +
                '*Alignment:1,1\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_a.symbol[i + j * (this.nx0)] && this.pu_a.symbol[i + j * (this.nx0)][0] === 1 && this.pu_a.symbol[i + j * (this.nx0)][1] === "circle_M") {
                        text += "0 ";
                    } else if (this.pu_a.symbol[i + j * (this.nx0)] && this.pu_a.symbol[i + j * (this.nx0)][0] === 2 && this.pu_a.symbol[i + j * (this.nx0)][1] === "circle_M") {
                        text += "1 ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //Answer Shading
        if (!isEmpty(this.pu_a.surface)) {
            text += '#ShadingDataAnsMode:0,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:80\n' +
                '*Stroke:100,0.25,0,1\n' +
                '*Border:-1,0,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                        text += "1 ";
                    } else {
                        text += ". ";
                    }
                }
                text += "\n";
            }
            text += "--------\n";
        }

        //Shading related information
        if (!isEmpty(this.pu_q.surface)) {
            text += '#ShadingData:0,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Border:-1,0,0,1\n';
            for (var j = 2; j < this.ny0 - 2; j++) {
                // text += "\"";
                for (var i = 2; i < this.nx0 - 2; i++) {
                    if (this.pu_q.surface[i + j * (this.nx0)] && (this.pu_q.surface[i + j * (this.nx0)] === 1 || this.pu_q.surface[i + j * (this.nx0)] === 4)) {
                        // text += "1";
                        text += "1 ";
                    } else {
                        // text += ".";
                        text += ". ";
                    }
                }
                text += "\n";
                // text += "\"\n";
            }
            text += "--------\n";
        }

        //盤面マス
        text += '#盤面マス:0,True\n' +
            '*Grid:' + gridsize + ',' + gridsize + '\n' +
            '*Skew:0,0\n' +
            '*Offset:0,0\n' +
            '*Size:' + gridsize + ',' + gridsize + '\n' +
            '*Alignment:0,0\n' +
            '*Fill:0\n' +
            '*Stroke:-1,0,0,1\n' +
            '*Border:-1,0,0,1\n';
        for (var j = 2; j < this.ny0 - 2; j++) {
            for (var i = 2; i < this.nx0 - 2; i++) {
                if (this.centerlist.indexOf(i + j * (this.nx0)) != -1) {
                    text += "1 ";
                } else {
                    text += ". ";
                }
            }
            text += "\n";
        }
        text += "--------\n";

        return text;
    }

    getAllIndexes(arr, val) {
        var indexes = [],
            i;
        for (i = 0; i < arr.length; i++)
            if (arr[i] === val)
                indexes.push(i);
        if (!isEmpty(indexes)) {
            return indexes;
        } else {
            return -1;
        }
    }

    getloopdata(row_size, col_size, type) {
        // There is a difference of 1 in indexing between Line and LinE and hence an
        // auxillary variable subtract is used
        if (type === "balanceloop" || type === "tapalikeloop" || type === "masyu" ||
            type === "yajilin" || type === "doubleyajilin" || type === "castlewall") {
            var line_data = this.pu_a.line;
            var subtract = 1;
        } else if (type === "slitherlink") {
            var line_data = this.pu_a.lineE;
            var subtract = 0;
        }

        var matrix_local = [];
        for (var i = 0; i < parseInt(row_size); i++) {
            matrix_local[i] = new Array(parseInt(col_size)).fill('.');
        }

        if (!isEmpty(line_data)) {
            var segA = [];
            var segB = [];
            var direction = 'RD'; // RD - Right/Down, LU - Left/Up
            var loop_segments = Object.entries(line_data);
            var pointA_x, pointA_y; // x is column, y is row
            var pointB_x, pointB_y;
            var points, loop_type;

            // create lists
            for (var i = 0; i < loop_segments.length; i++) {
                loop_type = loop_segments[i][1];
                if (loop_type === 3) {
                    points = loop_segments[i][0].split(',');
                    if (type === "slitherlink") {
                        segA.push(Number(points[0]) - (this.nx0 * this.ny0));
                        segB.push(Number(points[1]) - (this.nx0 * this.ny0));
                    } else {
                        segA.push(parseInt(points[0]));
                        segB.push(parseInt(points[1]));
                    }
                }
            }

            if (!isEmpty(segA)) {
                // Find index of first starting cell
                var minA = Math.min(...segA);
                var poss_loc = this.getAllIndexes(segA, minA);
                for (var i = 0; i < poss_loc.length; i++) {
                    pointA_y = parseInt(segA[poss_loc[i]] / this.nx0) - 1;
                    pointB_y = parseInt(segB[poss_loc[i]] / this.nx0) - 1;
                    if (pointA_y - pointB_y === 0) {
                        var next_seg = poss_loc[i];
                        break;
                    }
                }
                for (var i = 0; i < segB.length; i++) {
                    pointA_x = (segA[next_seg] % (this.nx0)) - subtract;
                    pointA_y = parseInt(segA[next_seg] / this.nx0) - subtract;
                    pointB_x = (segB[next_seg] % (this.nx0)) - subtract;
                    pointB_y = parseInt(segB[next_seg] / this.nx0) - subtract;

                    if (direction === 'RD') {
                        if (pointB_x > pointA_x) {
                            matrix_local[pointA_y - 1][pointA_x - 1] = 'R';
                        } else if (pointB_y > pointA_y) {
                            matrix_local[pointA_y - 1][pointA_x - 1] = 'D';
                        }
                    } else if (direction === 'LU') {
                        if (pointB_x > pointA_x) {
                            matrix_local[pointB_y - 1][pointB_x - 1] = 'L';
                        } else if (pointB_y > pointA_y) {
                            matrix_local[pointB_y - 1][pointB_x - 1] = 'U';
                        }
                    }
                    // Choose next segment except the last turn (where the loop will close)
                    if (i !== (segB.length - 1)) {
                        if (direction === 'RD') {
                            poss_loc = this.getAllIndexes(segA, segB[next_seg]);
                            direction = 'RD';
                            if (poss_loc === -1) {
                                poss_loc = this.getAllIndexes(segB, segB[next_seg]);
                                direction = 'LU';
                            }
                        } else if (direction === 'LU') {
                            poss_loc = this.getAllIndexes(segB, segA[next_seg]);
                            direction = 'LU';
                            if (poss_loc === -1) {
                                poss_loc = this.getAllIndexes(segA, segA[next_seg]);
                                direction = 'RD';
                            }
                        }
                        if (direction === 'RD') {
                            for (var j = 0; j < poss_loc.length; j++) {
                                if (segB[poss_loc[j]] !== segB[next_seg]) {
                                    var next_seg = poss_loc[j];
                                    break;
                                }
                            }
                        } else if (direction === 'LU') {
                            for (var j = 0; j < poss_loc.length; j++) {
                                if (segA[poss_loc[j]] !== segA[next_seg]) {
                                    var next_seg = poss_loc[j];
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
        return matrix_local;
    }

    getregiondata(row_size, col_size, mode = "pu_q") {
        // Regions
        var counter = 0;
        var cell_matrix = [];
        var up_matrix = [];
        var right_matrix = [];

        for (var i = 0; i < row_size; i++) {
            cell_matrix[i] = new Array(parseInt(col_size)).fill(0);
        }
        for (var i = 0; i < (parseInt(row_size) + 1); i++) {
            up_matrix[i] = new Array(parseInt(col_size)).fill(0);
        }
        for (var i = 0; i < (row_size); i++) {
            right_matrix[i] = new Array(parseInt(col_size) + 1).fill(0);
        }

        if (mode === "pu_q") {
            var edge_elements = this.pu_q.lineE;
        } else if (mode === "pu_a") {
            var edge_elements = this.pu_a.lineE;
        }

        // Setup Edge Matrices
        var pointA, pointA_x, pointA_y, edge, points;
        for (edge in edge_elements) {
            points = edge.split(',');
            pointA = Number(points[0]) - (this.nx0 * this.ny0);
            pointA_x = (pointA % this.nx0); //column
            pointA_y = parseInt(pointA / this.nx0); //row
            if ((Number(points[1]) - Number(points[0])) === 1) {
                // data for up matrix
                up_matrix[pointA_y - 1][pointA_x - 1] = 1;
            } else {
                right_matrix[pointA_y - 1][pointA_x - 1] = 1;
            }
        }

        // Define regions using numbers
        // Loop through each cell
        for (var i = 0; i < row_size; i++) {
            for (var j = 0; j < col_size; j++) {
                // first row doesnt have up
                if (i === 0) {
                    // 0,0 is starting reference
                    if (j > 0) {
                        if (right_matrix[i][j] === 0) {
                            cell_matrix[i][j] = cell_matrix[i][j - 1];
                        } else {
                            counter++;
                            cell_matrix[i][j] = counter;
                        }
                    }
                } else {
                    // UP
                    if (up_matrix[i][j] === 0) {
                        if (j > 0) {
                            // Change all connected cells to this new value
                            for (var k = 0; k <= i; k++) {
                                for (var m = 0; m < col_size; m++) {
                                    if (cell_matrix[k][m] === cell_matrix[i][j]) {
                                        cell_matrix[k][m] = cell_matrix[i - 1][j];
                                    }
                                }
                            }
                        }
                        cell_matrix[i][j] = cell_matrix[i - 1][j];
                    } else {
                        counter++;
                        if (j > 0) {
                            // Change all connected cells to this new value
                            for (var k = 0; k <= i; k++) {
                                for (var m = 0; m < col_size; m++) {
                                    if (cell_matrix[k][m] === cell_matrix[i][j]) {
                                        cell_matrix[k][m] = counter;
                                    }
                                }
                            }
                        }
                        cell_matrix[i][j] = counter;
                    }
                    // RIGHT
                    if (j < (col_size) - 1) {
                        if (right_matrix[i][j + 1] === 0) {
                            cell_matrix[i][j + 1] = cell_matrix[i][j];
                        } else {
                            counter++;
                            cell_matrix[i][j + 1] = counter;
                        }
                    }
                }
                // console.log(JSON.parse(JSON.stringify(cell_matrix))); // To avoid passing by reference
            }
        }

        // Find unique numbers
        var unique_nums = [];
        for (var i = 0; i < row_size; i++) {
            for (var j = 0; j < col_size; j++) {
                if (unique_nums.indexOf(cell_matrix[i][j]) === -1) {
                    unique_nums.push(cell_matrix[i][j]);
                }
            }
        }
        var size_unique_nums = unique_nums.length;
        var cell_char;

        // Loop through each region to convert to Alphabet
        // Temporary solution, but later find efficient way
        for (var k = 0; k < size_unique_nums; k++) {
            cell_char = String.fromCharCode(65 + (k % 26));
            for (var i = 0; i < row_size; i++) {
                for (var j = 0; j < col_size; j++) {
                    if (cell_matrix[i][j] === unique_nums[k]) {
                        cell_matrix[i][j] = cell_char; // 26 alphabets and then cycle
                    }
                }
            }
        }
        return cell_matrix;
    }

    maketext_gmpfile() {
        var text = "";
        var header = document.getElementById("savetextarea_pp").value;

        // Puzzle Choice
        if (header != "") {
            if (header === "classicsudoku" || header === "cs") {
                text += 'Author:\n' +
                    'Genre: Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n' +
                    '9 9 1\n' +
                    'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n';

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "kurotto" || header === "kuromasu") {
                text += 'Author:\n';
                if (header === "kurotto") {
                    text += 'Genre: Kurotto\n';
                } else if (header === "kuromasu") {
                    text += 'Genre: Kuromasu\n';
                }
                text += 'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Given Digits
                // Simplified implementation
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] &&
                                this.pu_q.number[i + j * (this.nx0)][2] === "1" &&
                                this.pu_q.number[i + j * (this.nx0)][1] === 6 &&
                                !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                var digit = this.pu_q.number[i + j * (this.nx0)][0];
                                if (digit !== "") {
                                    text += digit
                                } else {
                                    text += 'x';
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Another way of implementing
                // if (!isEmptycontent("pu_q", "number", 2, "1")) {
                //     for (var j = 2; j < this.ny0 - 2; j++) {
                //         for (var i = 2; i < this.nx0 - 2; i++) {
                //             if (this.pu_q.number[i + j * (this.nx0)] &&
                //                 this.pu_q.number[i + j * (this.nx0)][2] === "1" &&
                //                 !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                //                 text += this.pu_q.number[i + j * (this.nx0)][0];
                //             } else if (this.pu_q.symbol[i + j * (this.nx0)] &&
                //                 !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                //                 this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "circle") {
                //                 text += "x";
                //             } else {
                //                 text += ".";
                //             }
                //             if (i < this.nx0 - 3) {
                //                 text += " ";
                //             }
                //         }
                //         text += "\n";
                //     }
                // }

                //Shading Solution
                if (!isEmpty(this.pu_a.surface)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                text += "X";
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }
            } else if (header === "thermosudoku" || header === "ts") {
                text += 'Author:\n' +
                    'Genre: Thermo-Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + ' 1' + '\n';

                text += 'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n';

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Thermometers
                text += 'Thermometers:\n';

                if (!isEmpty(this.pu_q.thermo)) {
                    for (var i = 0; i < this.pu_q.thermo.length; i++) {
                        for (var j = 0; j < this.pu_q.thermo[i].length; j++) {
                            var col_num = (this.pu_q.thermo[i][j] % (this.nx0)) - 1;
                            var row_num = parseInt(this.pu_q.thermo[i][j] / this.nx0) - 1;
                            text += 'R' + row_num + 'C' + col_num;
                            if (j < this.pu_q.thermo[i].length - 1) {
                                text += ',';
                            }
                        }
                        text += '\n';
                    }
                }
            } else if (header === "arrowsudoku" || header === "as") {
                text += 'Author:\n' +
                    'Genre: Arrow Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + ' 1' + '\n';

                text += 'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n';

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Arrows
                text += 'Arrows:\n';

                if (!isEmpty(this.pu_q.arrows)) {
                    for (var i = 0; i < this.pu_q.arrows.length; i++) {
                        for (var j = 0; j < this.pu_q.arrows[i].length; j++) {
                            var col_num = (this.pu_q.arrows[i][j] % (this.nx0)) - 1;
                            var row_num = parseInt(this.pu_q.arrows[i][j] / this.nx0) - 1;
                            text += 'R' + row_num + 'C' + col_num;
                            if (j < this.pu_q.arrows[i].length - 1) {
                                text += ',';
                            }
                        }
                        text += '\n';
                    }
                }
            } else if (header === "evenoddsudoku" || header === "eos") {
                text += 'Author:\n' +
                    'Genre: Even/Odd Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + ' 1' + '\n';

                text += 'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n';

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Even Odd Shapes
                if (!isEmpty(this.pu_q.symbol)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] &&
                                !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                                this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "circle") {
                                text += "O";
                            } else if (this.pu_q.symbol[i + j * (this.nx0)] &&
                                !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                                this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "square") {
                                text += "E";
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }
            } else if (header === "masyu") {
                text += 'Author:\n' +
                    'Genre: Masyu\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Black and White Circles
                if (!isEmpty(this.pu_q.symbol)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] &&
                                !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                                this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "circle") {
                                if (this.pu_q.symbol[i + j * (this.nx0)][0] === 8 ||
                                    this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                    text += "W";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 2 ||
                                    this.pu_q.symbol[i + j * (this.nx0)][0] === 9) {
                                    text += "B";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer - Loop
                var matrix = this.getloopdata(row_size, col_size, header);

                // Write Answer to Text
                for (var i = 0; i < parseInt(row_size); i++) {
                    for (var j = 0; j < parseInt(col_size); j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';

                }
            } else if (header === "balanceloop") {
                text += 'Author:\n' +
                    'Genre: Balance Loop\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Given Digits
                // Simplified implementation
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] &&
                                this.pu_q.number[i + j * (this.nx0)][2] === "1" &&
                                !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                if (this.pu_q.number[i + j * (this.nx0)][1] === 6) {
                                    text += 'W' + this.pu_q.number[i + j * (this.nx0)][0];
                                } else if (this.pu_q.number[i + j * (this.nx0)][1] === 7) {
                                    text += 'B' + this.pu_q.number[i + j * (this.nx0)][0];
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer - Loop
                var matrix = this.getloopdata(row_size, col_size, header);

                // Write Answer to Text
                for (var i = 0; i < parseInt(row_size); i++) {
                    for (var j = 0; j < parseInt(col_size); j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';

                }
            } else if (header === "tapalikeloop" || header === "tapa") {
                text += 'Author:\n';
                if (header === "tapalikeloop") {
                    text += 'Genre: Tapa-Like Loop\n';
                } else if (header === "tapa") {
                    text += 'Genre: Tapa\n';
                }
                text += 'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                //Tapa clues
                if (!isEmptycontent("pu_q", "number", 2, "4")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "4" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0].split('').sort().join('');
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                if (header === "tapalikeloop") {
                    // Answer - Loop
                    var matrix = this.getloopdata(row_size, col_size, header);

                    // Write Answer to Text
                    for (var i = 0; i < parseInt(row_size); i++) {
                        for (var j = 0; j < parseInt(col_size); j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                } else if (header === "tapa") {
                    // Answer - Shading
                    if (!isEmpty(this.pu_a.surface)) {
                        for (var j = 2; j < this.ny0 - 2; j++) {
                            for (var i = 2; i < this.nx0 - 2; i++) {
                                if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                    text += "X";
                                } else {
                                    text += ".";
                                }
                            }
                            text += "\n";
                        }
                    }
                }
            } else if (header === "slitherlink") {
                text += 'Author:\n' +
                    'Genre: Slitherlink\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Slitherlink clues
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer - Loop (As on edges, increased the row and col size by 1)
                var matrix = this.getloopdata((parseInt(row_size) + 1), (parseInt(col_size) + 1), header);

                // Write Answer to Text
                for (var i = 0; i < (parseInt(row_size) + 1); i++) {
                    for (var j = 0; j < (parseInt(col_size) + 1); j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';
                }
            } else if (header === "yajilin" || header === "doubleyajilin" || header === "castlewall") {
                if (header === "yajilin") {
                    text += 'Author:\n' +
                        'Genre: Yajilin\n' +
                        'Variation: Standard\n';
                } else if (header === "doubleyajilin") {
                    text += 'Author:\n' +
                        'Genre: Yajilin\n' +
                        'Variation: Double\n';
                } else if (header === "castlewall") {
                    text += 'Author:\n' +
                        'Genre: Castle Wall\n' +
                        'Variation: Standard\n';
                }
                text += 'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Yajilin Clues
                var direction;
                var clueshade = ''; // White/Black for Castle Wall, Grey for Yajilin
                if (!isEmptycontent("pu_q", "number", 2, "2")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            // For Castle Wall
                            if (!isEmpty(this.pu_q.symbol) &&
                                this.pu_q.symbol[i + j * (this.nx0)] &&
                                !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                                this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "square") {
                                if (this.pu_q.symbol[i + j * (this.nx0)][0] === 2 || this.pu_q.symbol[i + j * (this.nx0)][0] === 9) {
                                    clueshade = 'b';
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 8) {
                                    clueshade = 'w';
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 3 || this.pu_q.symbol[i + j * (this.nx0)][0] === 5) {
                                    clueshade = '';
                                }
                            }
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "2") {
                                var cell_data = this.pu_q.number[i + j * (this.nx0)][0].split('');
                                // 3 is down, 1 is left, 0 is up, 2 is right
                                if (cell_data[2] === "0") {
                                    direction = 'u';
                                } else if (cell_data[2] === "1") {
                                    direction = 'l';
                                } else if (cell_data[2] === "2") {
                                    direction = 'r';
                                } else if (cell_data[2] === "3") {
                                    direction = 'd';
                                }
                                text += clueshade + cell_data[0] + direction;
                            } else if (!isEmpty(this.pu_q.symbol) &&
                                this.pu_q.symbol[i + j * (this.nx0)] &&
                                !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                                this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "square") {
                                if (header !== "castlewall") {
                                    text += "x";
                                } else {
                                    text += clueshade;
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer - Loop
                var matrix = this.getloopdata(parseInt(row_size), parseInt(col_size), header);

                // Answer - shading
                if (!isEmpty(this.pu_a.surface)) {
                    for (var i in this.pu_a.surface) {
                        var pointA_x = (i % (this.nx0)) - 2;
                        var pointA_y = parseInt(i / this.nx0) - 2;
                        matrix[pointA_y][pointA_x] = 'X';
                    }
                }

                // Write Answer to Text
                for (var i = 0; i < parseInt(row_size); i++) {
                    for (var j = 0; j < parseInt(col_size); j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';
                }
            } else if (header === "nurikabe") {
                text += 'Author:\n';
                if (header === "nurikabe") {
                    text += 'Genre: Nurikabe\n';
                }
                text += 'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                //Nurikabe clues
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer - Shading
                if (!isEmpty(this.pu_a.surface)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                text += "X";
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }
            } else if (header === "cave") {
                text += 'Author:\n' +
                    'Genre: Cave\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                //Cave clues
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer - Shading
                if (!isEmpty(this.pu_a.surface)) {
                    for (var k = 2; k < this.nx0; k++) {
                        text += 'X';
                    }
                    text += "\n";
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        text += 'X';
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                text += "X";
                            } else {
                                text += ".";
                            }
                        }
                        text += 'X';
                        text += "\n";
                    }
                    for (var k = 2; k < this.nx0; k++) {
                        text += 'X';
                    }
                    text += "\n";
                }
            } else if (header === "snakepit") {
                text += 'Author:\n' +
                    'Genre: Snake Pit\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Given Digits
                // Simplified implementation
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] &&
                                this.pu_q.number[i + j * (this.nx0)][2] === "1" &&
                                !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                if (this.pu_q.number[i + j * (this.nx0)][1] === 6) {
                                    text += 'O' + this.pu_q.number[i + j * (this.nx0)][0];
                                } else if (this.pu_q.number[i + j * (this.nx0)][1] === 1) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Answer digits
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }
            } else if (header === "fillomino") {
                text += 'Author:\n' +
                    'Genre: Fillomino\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "pentominous") {
                text += 'Author:\n' +
                    'Genre: Pentominous\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                //Given Digits
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else if (!isEmpty(this.pu_q.surface) && this.pu_q.surface[i + j * (this.nx0)] && this.pu_q.surface[i + j * (this.nx0)] === 1) {
                                text += 'A';
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmpty(this.pu_a.number)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1") {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmpty(this.pu_q.number)) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1") {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else if (!isEmpty(this.pu_q.surface) && this.pu_q.surface[i + j * (this.nx0)] && this.pu_q.surface[i + j * (this.nx0)] === 1) {
                                    text += 'A';
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "statuepark" || header === "sp") {
                text += 'Author:\n' +
                    'Genre: Statue Park\n' +
                    'Variation: Standard (Pentomino Set)\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Black and White Circles
                if (!isEmpty(this.pu_q.symbol)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] &&
                                !isNaN(this.pu_q.symbol[i + j * (this.nx0)][0]) &&
                                this.pu_q.symbol[i + j * (this.nx0)][1].substring(0, 6) === "circle") {
                                if (this.pu_q.symbol[i + j * (this.nx0)][0] === 8 ||
                                    this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                    text += "W";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 2 ||
                                    this.pu_q.symbol[i + j * (this.nx0)][0] === 9) {
                                    text += "B";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                //Shading Solution
                if (!isEmpty(this.pu_a.surface)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                text += "X";
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }
            } else if (header === "minesweeper" || header === "doubleminesweeper" || header === "ms" || header === "dms") {
                if (header === "minesweeper" || header === "ms") {
                    text += 'Author:\n' +
                        'Genre: Minesweeper\n' +
                        'Variation: Standard\n';
                } else if (header === "doubleminesweeper" || header === "dms") {
                    text += 'Author:\n' +
                        'Genre: Minesweeper\n' +
                        'Variation: Double\n';
                }
                text += 'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "consecutivepairssudoku" || header === "cps") {
                text += 'Author:\n' +
                    'Genre: Consecutive Pairs Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + ' 1' + '\n';

                text += 'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'aaabbbccc\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'dddeeefff\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n' +
                    'ggghhhiii\n';

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

                // Consecutive circles
                var matrix = [];
                var new_row_size = (2 * parseInt(row_size) - 1);
                var new_col_size = (2 * parseInt(col_size) - 1);

                // initialize
                for (var i = 0; i < new_row_size; i++) {
                    matrix[i] = new Array(parseInt(new_col_size)).fill('.');
                }

                // convert odd columns to |
                for (var i = 0; i < new_row_size; i++) {
                    for (var j = 0; j < new_col_size; j++) {
                        if (i % 2 == 0) {
                            if (j % 2 != 0) {
                                matrix[i][j] = '|';
                            }
                        } else {
                            if (j % 2 == 0) {
                                matrix[i][j] = '-';
                            } else {
                                matrix[i][j] = '+';
                            }
                        }
                    }
                }
                if (!isEmpty(this.pu_q.symbol)) {
                    var pointA_x, pointA_y, greycircle;
                    for (greycircle in this.pu_q.symbol) {
                        var factor = Math.floor(greycircle / (this.nx0 * this.ny0));
                        pointA_x = ((greycircle - (factor * this.nx0 * this.ny0)) % (this.nx0)) - 1; // column
                        pointA_y = parseInt((greycircle - (factor * this.nx0 * this.ny0)) / (this.nx0)) - 1; // row
                        if (factor === 2) {
                            matrix[(2 * pointA_y) - 1][(2 * (pointA_x - 1))] = 'G';
                        } else if (factor === 3) {
                            matrix[(2 * (pointA_y - 1))][(2 * pointA_x) - 1] = 'G';
                        }
                    }
                }
                for (var i = 0; i < new_row_size; i++) {
                    for (var j = 0; j < new_col_size; j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';
                }

            } else if (header === "nanro") {
                if (header === "nanro") {
                    text += 'Author:\n' +
                        'Genre: Nanro\n' +
                        'Variation: Standard\n';
                }
                text += 'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + ' 0' + '\n';

                // Regions
                if (!isEmpty(this.pu_q.lineE)) {
                    var matrix = this.getregiondata(row_size, col_size, "pu_q");

                    // write to text
                    for (var i = 0; i < row_size; i++) {
                        for (var j = 0; j < col_size; j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                }

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }
            } else if ((header.search("starbattle") !== -1) || (header === "lits") || (header.search("sb") !== -1)) {
                if (header.search("starbattle") !== -1 || (header.search("sb") !== -1)) {
                    text += 'Author:\n' +
                        'Genre: Star Battle\n' +
                        'Variation: Standard\n';
                    var stars = header.replace(/^.*(\d+).*$/i, '$1');
                } else if (header === "lits") {
                    text += 'Author:\n' +
                        'Genre: LITS\n' +
                        'Variation: Standard\n';
                }
                text += 'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;

                if (header === "lits") {
                    text += col_size + ' ' + row_size + '\n';
                } else {
                    text += col_size + ' ' + stars + '\n';
                }

                // Regions
                if (!isEmpty(this.pu_q.lineE)) {
                    var matrix = this.getregiondata(row_size, col_size, "pu_q");

                    // write to text
                    for (var i = 0; i < row_size; i++) {
                        for (var j = 0; j < col_size; j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                }

                // Star - Shading Solution
                if (!isEmpty(this.pu_a.surface)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                text += "X";
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "araf") {
                text += 'Author:\n' +
                    'Genre: Araf\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;

                text += col_size + ' ' + row_size + '\n';

                // Given Digits
                // Simplified implementation
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] &&
                                this.pu_q.number[i + j * (this.nx0)][2] === "1" &&
                                this.pu_q.number[i + j * (this.nx0)][1] === 6 &&
                                !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                var digit = this.pu_q.number[i + j * (this.nx0)][0];
                                if (digit !== "") {
                                    text += digit
                                } else {
                                    text += 'x';
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // Regions
                if (!isEmpty(this.pu_a.lineE)) {
                    var matrix = this.getregiondata(row_size, col_size, "pu_a");

                    // write to text
                    for (var i = 0; i < row_size; i++) {
                        for (var j = 0; j < col_size; j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                }

            } else if (header === "tomtom" || header === "tt") {
                text += 'Author:\n' +
                    'Genre: TomTom\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;

                text += col_size + '\n';

                // Regions
                if (!isEmpty(this.pu_q.lineE)) {
                    var matrix = this.getregiondata(row_size, col_size, "pu_q");

                    // write to text
                    for (var i = 0; i < row_size; i++) {
                        for (var j = 0; j < col_size; j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                }

                // TomTom clues
                for (var j = 2; j < this.ny0 - 2; j++) {
                    for (var i = 2; i < this.nx0 - 2; i++) {
                        var corner_cursor = 4 * (i + j * (this.nx0) + this.nx0 * this.ny0);
                        if (this[this.mode.qa].numberS[corner_cursor]) {
                            // If there is clue in the corner
                            var tomtom_clue = this[this.mode.qa].numberS[corner_cursor][0];
                            if (tomtom_clue.includes("+")) {
                                tomtom_clue = tomtom_clue.replace("+", "\\053");
                                text += tomtom_clue;
                            } else if (tomtom_clue.includes("-")) {
                                tomtom_clue = tomtom_clue.replace("-", "\\055");
                                text += tomtom_clue;
                            } else if (tomtom_clue.includes("x")) {
                                tomtom_clue = tomtom_clue.replace("x", "\\327");
                                text += tomtom_clue;
                            } else if (tomtom_clue.includes("/")) {
                                tomtom_clue = tomtom_clue.replace("/", "\\367");
                                text += tomtom_clue;
                            } else {
                                text += tomtom_clue;
                            }
                        } else {
                            text += ".";
                        }
                        if (i < this.nx0 - 3) {
                            text += " ";
                        }
                    }
                    text += "\n";
                }

                // Range
                text += "{1-" + col_size + "}" + '\n';

                // Solution digits
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_a.number[i + j * (this.nx0)][0])) {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else if (!isEmptycontent("pu_q", "number", 2, "1")) {
                                if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] === "1" && !isNaN(this.pu_q.number[i + j * (this.nx0)][0])) {
                                    text += this.pu_q.number[i + j * (this.nx0)][0];
                                } else {
                                    text += ".";
                                }
                            } else {
                                text += ".";
                            }
                            if (i < this.nx0 - 3) {
                                text += " ";
                            }
                        }
                        text += "\n";
                    }
                }

                // unicode entries
                text += "#\\053 = plus" + "\n" + "#\\055 = minus" + "\n" + "#\\327 = times" + "\n" + "#\\367 = divide" + "\n";

            } else if (header === "skyscrapers" || header === "ss") {
                text += 'Author:\n' +
                    'Genre: Skyscrapers\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';

                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;

                text += (parseInt(col_size) - 2) + '\n';

                // Skyscraper and given clues
                var matrix = [];

                // initialize
                for (var i = 0; i < row_size; i++) {
                    matrix[i] = new Array(parseInt(col_size)).fill('-');
                }

                // Replace first/last row/column with dots
                for (var i = 0; i < row_size; i++) {
                    matrix[i][0] = '.';
                    matrix[i][col_size - 1] = '.';
                }

                for (var i = 0; i < col_size; i++) {
                    matrix[0][i] = '.';
                    matrix[row_size - 1][i] = '.';
                }

                //Given Digits
                if (!isEmptycontent("pu_q", "number", 2, "1")) {
                    for (var i in this.pu_q.number) {
                        var pointA_x = (i % (this.nx0)) - 2;
                        var pointA_y = parseInt(i / this.nx0) - 2;
                        matrix[pointA_y][pointA_x] = this.pu_q.number[i][0];
                    }
                }

                // Write given clues
                for (var i = 0; i < row_size; i++) {
                    for (var j = 0; j < col_size; j++) {
                        text += matrix[i][j];
                        if (j < col_size - 1) {
                            text += " ";
                        }
                    }
                    text += "\n";
                }

                // Solution
                if (!isEmptycontent("pu_a", "number", 2, "1")) {
                    for (var i in this.pu_a.number) {
                        var pointA_x = (i % (this.nx0)) - 2;
                        var pointA_y = parseInt(i / this.nx0) - 2;
                        matrix[pointA_y][pointA_x] = this.pu_a.number[i][0];
                    }
                }

                // Write solution
                for (var i = 1; i < row_size - 1; i++) {
                    for (var j = 1; j < col_size - 1; j++) {
                        text += matrix[i][j];
                        if (j < col_size - 2) {
                            text += " ";
                        }
                    }
                    text += "\n";
                }

            } else if (header === "spiralgalaxies" || header === "sg") {
                text += 'Author:\n' +
                    'Genre: Spiral Galaxies\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + '\n';

                // Given clues
                var matrix = [];
                var new_row_size = (2 * parseInt(row_size) - 1);
                var new_col_size = (2 * parseInt(col_size) - 1);

                // initialize
                for (var i = 0; i < new_row_size; i++) {
                    matrix[i] = new Array(parseInt(new_col_size)).fill('.');
                }

                // convert odd columns to |
                for (var i = 0; i < new_row_size; i++) {
                    for (var j = 0; j < new_col_size; j++) {
                        if (i % 2 == 0) {
                            if (j % 2 != 0) {
                                matrix[i][j] = '|';
                            }
                        } else {
                            if (j % 2 == 0) {
                                matrix[i][j] = '-';
                            } else {
                                matrix[i][j] = '+';
                            }
                        }
                    }
                }

                // read the circles
                if (!isEmpty(this.pu_q.symbol)) {
                    var pointA_x, pointA_y, greycircle;
                    for (greycircle in this.pu_q.symbol) {
                        var factor = Math.floor(greycircle / (this.nx0 * this.ny0));
                        pointA_x = ((greycircle - (factor * this.nx0 * this.ny0)) % (this.nx0)) - 1; // column
                        pointA_y = parseInt((greycircle - (factor * this.nx0 * this.ny0)) / (this.nx0)) - 1; // row
                        if (factor === 0) {
                            if (this.pu_q.symbol[greycircle][0] === 2) {
                                matrix[(2 * (pointA_y - 1))][(2 * (pointA_x - 1))] = 'B';
                            } else if (this.pu_q.symbol[greycircle][0] === 8) {
                                matrix[(2 * (pointA_y - 1))][(2 * (pointA_x - 1))] = 'W';
                            } else if (this.pu_q.symbol[greycircle][0] === 9) {
                                matrix[(2 * (pointA_y - 1))][(2 * (pointA_x - 1))] = 'G';
                            } else {
                                text = "You are using wrong symbols for galaxies, please check README.md file";
                                return text;
                            }
                        } else if (factor === 1) {
                            if (this.pu_q.symbol[greycircle][0] === 2) {
                                matrix[(2 * pointA_y) - 1][(2 * pointA_x) - 1] = 'B';
                            } else if (this.pu_q.symbol[greycircle][0] === 8) {
                                matrix[(2 * pointA_y) - 1][(2 * pointA_x) - 1] = 'W';
                            } else if (this.pu_q.symbol[greycircle][0] === 9) {
                                matrix[(2 * pointA_y) - 1][(2 * pointA_x) - 1] = 'G';
                            } else {
                                text = "You are using wrong symbols for galaxies, please check README.md file";
                                return text;
                            }
                        } else if (factor === 2) {
                            if (this.pu_q.symbol[greycircle][0] === 2) {
                                matrix[(2 * pointA_y) - 1][(2 * (pointA_x - 1))] = 'B';
                            } else if (this.pu_q.symbol[greycircle][0] === 8) {
                                matrix[(2 * pointA_y) - 1][(2 * (pointA_x - 1))] = 'W';
                            } else if (this.pu_q.symbol[greycircle][0] === 9) {
                                matrix[(2 * pointA_y) - 1][(2 * (pointA_x - 1))] = 'G';
                            } else {
                                text = "You are using wrong symbols for galaxies, please check README.md file";
                                return text;
                            }
                        } else if (factor === 3) {
                            if (this.pu_q.symbol[greycircle][0] === 2) {
                                matrix[(2 * (pointA_y - 1))][(2 * pointA_x) - 1] = 'B';
                            } else if (this.pu_q.symbol[greycircle][0] === 8) {
                                matrix[(2 * (pointA_y - 1))][(2 * pointA_x) - 1] = 'W';
                            } else if (this.pu_q.symbol[greycircle][0] === 9) {
                                matrix[(2 * (pointA_y - 1))][(2 * pointA_x) - 1] = 'G';
                            } else {
                                text = "You are using wrong symbols for galaxies, please check README.md file";
                                return text;
                            }
                        }
                    }
                }

                // Write given clues
                for (var i = 0; i < new_row_size; i++) {
                    for (var j = 0; j < new_col_size; j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';
                }

                // Regions
                if (!isEmpty(this.pu_a.lineE)) {
                    var matrix = this.getregiondata(row_size, col_size, "pu_a");

                    // write to text
                    for (var i = 0; i < row_size; i++) {
                        for (var j = 0; j < col_size; j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                }

            } else if (header === "tightfitsudoku" || header === "tfs") {
                text += 'Author:\n' +
                    'Genre: Tight Fit Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += col_size + ' ' + row_size + ' 1' + '\n';

                // Regions
                if (!isEmpty(this.pu_q.lineE)) {
                    var matrix = this.getregiondata(row_size, col_size, "pu_q");

                    // write to text
                    for (var i = 0; i < row_size; i++) {
                        for (var j = 0; j < col_size; j++) {
                            text += matrix[i][j];
                        }
                        text += '\n';
                    }
                }

                // Given Digits
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.numberS) || !isEmpty(this.pu_q.symbol)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 6) {
                                var corner_cursor = 4 * (i + j * (this.nx0) + this.nx0 * this.ny0);
                                if (this.pu_q.numberS[corner_cursor]) { // top left corner
                                    text += this.pu_q.numberS[corner_cursor][0];
                                } else {
                                    text += '.';
                                }
                                text += '/';
                                if (this.pu_q.numberS[corner_cursor + 3]) { // bottom right corner
                                    text += this.pu_q.numberS[corner_cursor + 3][0];
                                } else {
                                    text += '.';
                                }
                            } else if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += '.';
                            }
                            if (i < this.nx0 - 3) {
                                text += '\t';
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution Digits
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.numberS) || !isEmpty(this.pu_q.symbol) || !isEmpty(this.pu_a.number) || !isEmpty(this.pu_a.numberS)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 6) {
                                var corner_cursor = 4 * (i + j * (this.nx0) + this.nx0 * this.ny0);
                                if (this.pu_q.numberS[corner_cursor]) { // top left corner
                                    text += this.pu_q.numberS[corner_cursor][0];
                                } else if (this.pu_a.numberS[corner_cursor]) { // top left corner
                                    text += this.pu_a.numberS[corner_cursor][0];
                                } else {
                                    text += '.';
                                }
                                text += '/';
                                if (this.pu_q.numberS[corner_cursor + 3]) { // bottom right corner
                                    text += this.pu_q.numberS[corner_cursor + 3][0];
                                } else if (this.pu_a.numberS[corner_cursor + 3]) { // bottom right corner
                                    text += this.pu_a.numberS[corner_cursor + 3][0];
                                } else {
                                    text += '.';
                                }
                            } else if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else {
                                text += '.';
                            }
                            if (i < this.nx0 - 3) {
                                text += '\t';
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "battleships" || header === "bs") {
                text += 'Author:\n' +
                    'Genre: Battleships\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += (parseInt(col_size) - 1) + ' ' + (parseInt(row_size) - 1) + ' 4' + '\n';

                // Given clues
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.symbol)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] < 8) {
                                if (this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                    text += "C";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
                                    text += "Q";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 3) {
                                    text += "R";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 4) {
                                    text += "D";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 5) {
                                    text += "L";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 6) {
                                    text += "U";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 7) {
                                    text += "S";
                                }
                            } else if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += '.';
                            }
                        }
                        text += "\n";
                    }
                }

                // Standard Fleet
                text += 'C.C.C.C\n' +
                    'RL.RL.RL\n' +
                    'RQL.RQL\n' +
                    'RQQL\n';

                // Solution
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.symbol) || !isEmpty(this.pu_a.symbol)) {
                    for (var j = 2; j < this.ny0 - 3; j++) {
                        for (var i = 2; i < this.nx0 - 3; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] < 8) {
                                if (this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                    text += "C";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
                                    text += "Q";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 3) {
                                    text += "R";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 4) {
                                    text += "D";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 5) {
                                    text += "L";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 6) {
                                    text += "U";
                                } else if (this.pu_q.symbol[i + j * (this.nx0)][0] === 7) {
                                    text += "S";
                                }
                            } else if (this.pu_a.symbol[i + j * (this.nx0)] && this.pu_a.symbol[i + j * (this.nx0)][0] < 8) {
                                if (this.pu_a.symbol[i + j * (this.nx0)][0] === 1) {
                                    text += "C";
                                } else if (this.pu_a.symbol[i + j * (this.nx0)][0] === 2) {
                                    text += "Q";
                                } else if (this.pu_a.symbol[i + j * (this.nx0)][0] === 3) {
                                    text += "R";
                                } else if (this.pu_a.symbol[i + j * (this.nx0)][0] === 4) {
                                    text += "D";
                                } else if (this.pu_a.symbol[i + j * (this.nx0)][0] === 5) {
                                    text += "L";
                                } else if (this.pu_a.symbol[i + j * (this.nx0)][0] === 6) {
                                    text += "U";
                                } else if (this.pu_a.symbol[i + j * (this.nx0)][0] === 7) {
                                    text += "S";
                                }
                            } else {
                                text += '.';
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "crossthestreams" || header === "cts") {
                text += 'Author:\n' +
                    'Genre: Cross the Streams\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;
                var aboveclues;
                var leftclues;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                aboveclues = document.getElementById("nb_space1").value; // over space
                leftclues = document.getElementById("nb_space3").value; // left space
                text += (parseInt(col_size - leftclues)) + ' ' + (parseInt(row_size - aboveclues)) + '\n';

                // Row clues
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2 + parseInt(aboveclues); j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2 - parseInt(col_size - leftclues); i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                                if (i < this.nx0 - 2 - parseInt(col_size - leftclues) - 1) {
                                    text += ' ';
                                }
                            }
                        }
                        text += "\n";
                    }
                }

                // Col clues
                var matrix = [];

                // initialize
                for (var i = 0; i < parseInt(aboveclues); i++) {
                    matrix[i] = new Array(parseInt(col_size - leftclues)).fill(0);
                }

                // store the col clues
                if (!isEmpty(this.pu_q.number)) {
                    for (var j = 2; j < this.ny0 - 2 - parseInt(row_size - aboveclues); j++) {
                        for (var i = 2 + parseInt(leftclues); i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                matrix[j - 2][i - 2] = this.pu_q.number[i + j * (this.nx0)][0];
                            }
                        }
                    }
                }

                // Output the col clues
                for (var i = 2 + parseInt(leftclues); i < this.nx0 - 2; i++) {
                    for (var j = 2; j < this.ny0 - 2 - parseInt(row_size - aboveclues); j++) {
                        if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                            if (matrix[j - 2][i - 2] !== 0) {
                                text += matrix[j - 2][i - 2];
                                if (j < this.ny0 - 2 - parseInt(row_size - aboveclues) - 1) {
                                    text += ' ';
                                }
                            }
                        }
                    }
                    text += "\n";
                }

                //Shading Solution
                if (!isEmpty(this.pu_a.surface)) {
                    for (var j = 2 + parseInt(aboveclues); j < this.ny0 - 2; j++) {
                        for (var i = 2 + parseInt(leftclues); i < this.nx0 - 2; i++) {
                            if (this.pu_a.surface[i + j * (this.nx0)] && this.pu_a.surface[i + j * (this.nx0)] === 1) {
                                text += "X";
                            } else {
                                text += ".";
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "kakuro") {
                text += 'Author:\n' +
                    'Genre: Kakuro\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += (parseInt(col_size) - 1) + ' ' + (parseInt(row_size) - 1) + '\n';

                // Given Digits
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.numberS) || !isEmpty(this.pu_q.symbol)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                var corner_cursor = 4 * (i + j * (this.nx0) + this.nx0 * this.ny0);
                                if (this.pu_q.numberS[corner_cursor + 2]) { // bottom left corner
                                    text += this.pu_q.numberS[corner_cursor + 2][0];
                                }
                                text += '\\';
                                if (this.pu_q.numberS[corner_cursor + 1]) { // top right corner
                                    text += this.pu_q.numberS[corner_cursor + 1][0];
                                }
                            } else if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
                                text += '\\';
                            } else if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else {
                                text += '.';
                            }
                            if (i < this.nx0 - 3) {
                                text += '\t';
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution Digits
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.numberS) || !isEmpty(this.pu_q.symbol) || !isEmpty(this.pu_a.number)) {
                    for (var j = 3; j < this.ny0 - 2; j++) {
                        for (var i = 3; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                text += '.';
                            } else if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
                                text += '.';
                            } else if (this.pu_q.number[i + j * (this.nx0)] && this.pu_q.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_q.number[i + j * (this.nx0)][0];
                            } else if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else {
                                text += '.';
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "doublekakuro" || header === "dk") {
                text += 'Author:\n' +
                    'Genre: Kakuro\n' +
                    'Variation: Double\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                var row_size;
                var col_size;

                // Grid Size
                row_size = document.getElementById("nb_size2").value;
                col_size = document.getElementById("nb_size1").value;
                text += (parseInt(col_size) - 1) + ' ' + (parseInt(row_size) - 1) + '\n';

                // Given Digits
                if (!isEmpty(this.pu_q.number) || !isEmpty(this.pu_q.numberS) || !isEmpty(this.pu_q.symbol) || !isEmpty(this.pu_q.surface)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                var corner_cursor = 4 * (i + j * (this.nx0) + this.nx0 * this.ny0);
                                if (this.pu_q.numberS[corner_cursor + 2]) { // bottom left corner
                                    text += this.pu_q.numberS[corner_cursor + 2][0];
                                }
                                text += '\\';
                                if (this.pu_q.numberS[corner_cursor + 1]) { // top right corner
                                    text += this.pu_q.numberS[corner_cursor + 1][0];
                                }
                            } else if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
                                text += '\\';
                            } else if (this.pu_q.surface[i + j * (this.nx0)] === 1 || this.pu_q.surface[i + j * (this.nx0)] === 8 || this.pu_q.surface[i + j * (this.nx0)] === 3) { //Dark Grey, Grey and Light grey
                                text += 'x';
                            } else {
                                text += '.';
                            }
                            if (i < this.nx0 - 3) {
                                text += '\t';
                            }
                        }
                        text += "\n";
                    }
                }

                // Solution Digits
                if (!isEmpty(this.pu_q.symbol) || !isEmpty(this.pu_a.number) || !isEmpty(this.pu_q.surface)) {
                    for (var j = 3; j < this.ny0 - 2; j++) {
                        for (var i = 3; i < this.nx0 - 2; i++) {
                            if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 1) {
                                text += '.';
                            } else if (this.pu_q.symbol[i + j * (this.nx0)] && this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
                                text += '.';
                            } else if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] !== "7" && (this.pu_q.surface[i + j * (this.nx0)] === 1 ||
                                    this.pu_q.surface[i + j * (this.nx0)] === 8 || this.pu_q.surface[i + j * (this.nx0)] === 3)) { //Dark Grey, Grey and Light grey
                                switch (parseInt(this.pu_a.number[i + j * (this.nx0)][0])) {
                                    case 1:
                                        text += 'a';
                                        break;
                                    case 2:
                                        text += 'b';
                                        break;
                                    case 3:
                                        text += 'c';
                                        break;
                                    case 4:
                                        text += 'd';
                                        break;
                                    case 5:
                                        text += 'e';
                                        break;
                                    case 6:
                                        text += 'f';
                                        break;
                                    case 7:
                                        text += 'g';
                                        break;
                                    case 8:
                                        text += 'h';
                                        break;
                                    case 9:
                                        text += 'i';
                                        break;
                                }
                            } else if (this.pu_a.number[i + j * (this.nx0)] && this.pu_a.number[i + j * (this.nx0)][2] !== "7") {
                                text += this.pu_a.number[i + j * (this.nx0)][0];
                            } else {
                                text += '.';
                            }
                        }
                        text += "\n";
                    }
                }

            } else if (header === "testing") {
                console.log(this.pu_q);
                console.log(this.pu_a);
                console.log(this.pu_q_col);
                console.log(this.pu_a_col);
                console.log(this);
            } else {
                text += 'Error - It doesnt support puzzle type ' + header + '\n' +
                    'Please see instructions (link in the bottom) for supported puzzle types\n' +
                    'For additional genre support please submit your request to penpaplus@gmail.com';
            }
        } else {
            text += 'Error - Enter the Puzzle type in Header area\n' +
                'Please see instructions (link in the bottom) for supported puzzle types\n';
        }

        return text;
    }

    undo() {
        var pu_mode = this.mode.qa;
        var undocounter = 1;
        let groupindex;
        if (pu_mode === "pu_q") {
            while (undocounter !== 0) {
                var a = this.pu_q.command_undo.pop(); /*a[0]:list_name,a[1]:point_number, a[4]: groupindex (optional)*/
                var a_col = this.pu_q_col.command_undo.pop();
                if (a && a[4]) { // If part of group undo
                    if (!groupindex) {
                        groupindex = a[4];
                    }
                    if (a[4] != groupindex) { // If part of different group, stop
                        this.pu_q.command_undo.push(a);
                        if (a_col) {
                            this.pu_q_col.command_undo.push(a_col);
                        }
                        break;
                    }
                } else if (!groupindex) {
                    undocounter = 0;
                } else { // group undo is done, stop
                    this.pu_q.command_undo.push(a);
                    if (a_col) {
                        this.pu_q_col.command_undo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    if ((a[0] === "thermo" || a[0] === "arrows" || a[0] === "direction" || a[0] === "squareframe" || a[0] === "polygon") && a[1] === -1) {
                        if (this[pu_mode][a[0]].length > 0) {
                            this.pu_q.command_redo.push([a[0], a[1], this[pu_mode][a[0]].pop(), pu_mode]);
                            if (a_col) {
                                this.pu_q_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]].pop(), pu_mode + "_col"]);
                            }
                        }
                    } else if (a[0] === "move") { //a[0]:move a[1]:point_from a[2]:point_to
                        for (var i in a[1]) {
                            if (a[1][i] != a[2]) {
                                this[pu_mode][i][a[1][i]] = this[pu_mode][i][a[2]];
                                delete this[pu_mode][i][a[2]];
                                if (a_col) {
                                    this[pu_mode + "_col"][i][a_col[1][i]] = this[pu_mode + "_col"][i][a_col[2]];
                                    delete this[pu_mode + "_col"][i][a_col[2]];
                                }
                            }
                        }
                        this.pu_q.command_redo.push([a[0], a[1], a[2], pu_mode]);
                        if (a_col) {
                            this.pu_q_col.command_redo.push([a_col[0], a_col[1], a_col[2], pu_mode + "_col"]);
                        }
                    } else {
                        if (a[4]) {
                            if (this[pu_mode][a[0]][a[1]]) { //symbol etc
                                this.pu_q.command_redo.push([a[0], a[1], this[pu_mode][a[0]][a[1]], pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_q_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]][a_col[1]], pu_mode + "_col", a_col[4]]);
                                }
                            } else {
                                this.pu_q.command_redo.push([a[0], a[1], null, pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_q_col.command_redo.push([a_col[0], a_col[1], null, pu_mode + "_col", a_col[4]]);
                                }
                            }
                        } else {
                            if (this[pu_mode][a[0]][a[1]]) { //symbol etc
                                this.pu_q.command_redo.push([a[0], a[1], this[pu_mode][a[0]][a[1]], pu_mode]);
                                if (a_col) {
                                    this.pu_q_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]][a_col[1]], pu_mode + "_col"]);
                                }
                            } else {
                                this.pu_q.command_redo.push([a[0], a[1], null, pu_mode]);
                                if (a_col) {
                                    this.pu_q_col.command_redo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                                }
                            }
                        }
                        if (a[2]) {
                            this[pu_mode][a[0]][a[1]] = JSON.parse(a[2]); //JSON.parse with decode
                            if (a_col) {
                                this[pu_mode + "_col"][a_col[0]][a_col[1]] = JSON.parse(a_col[2]); //JSON.parse with decode
                            }
                        } else {
                            delete this[pu_mode][a[0]][a[1]];
                            if (a_col) {
                                delete this[pu_mode + "_col"][a_col[0]][a_col[1]];
                            }
                        }
                    }
                    this.redraw();
                }
            }
        } else {
            while (undocounter !== 0) {
                var a = this.pu_a.command_undo.pop(); /*a[0]:list_name,a[1]:point_number,a[2]:value, a[4]: groupindex (optional)*/
                var a_col = this.pu_a_col.command_undo.pop();
                if (a && a[4]) { // if part of group undo
                    if (!groupindex) {
                        groupindex = a[4];
                    }
                    if (a[4] != groupindex) {
                        this.pu_a.command_undo.push(a); // if part of ganother group, stop
                        if (a_col) {
                            this.pu_a_col.command_undo.push(a_col); // if part of ganother group, stop
                        }
                        break;
                    }
                } else if (!groupindex) {
                    undocounter = 0;
                } else { // group undo is done, stop
                    this.pu_a.command_undo.push(a);
                    if (a_col) {
                        this.pu_a_col.command_undo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    if ((a[0] === "thermo" || a[0] === "arrows" || a[0] === "direction" || a[0] === "squareframe" || a[0] === "polygon") && a[1] === -1) {
                        if (this[pu_mode][a[0]].length > 0) {
                            this.pu_a.command_redo.push([a[0], a[1], this[pu_mode][a[0]].pop(), pu_mode]);
                            if (a_col) {
                                this.pu_a_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]].pop(), pu_mode + "_col"]);
                            }
                        }
                    } else if (a[0] === "move") { //a[0]:move a[1]:point_from a[2]:point_to
                        for (var i in a[1]) {
                            if (a[1][i] != a[2]) {
                                this[pu_mode][i][a[1][i]] = this[pu_mode][i][a[2]];
                                delete this[pu_mode][i][a[2]];
                                if (a_col) {
                                    this[pu_mode + "_col"][i][a_col[1][i]] = this[pu_mode + "_col"][i][a_col[2]];
                                    delete this[pu_mode + "_col"][i][a_col[2]];
                                }
                            }
                        }
                        this.pu_a.command_redo.push([a[0], a[1], a[2], pu_mode]);
                        if (a_col) {
                            this.pu_a_col.command_redo.push([a_col[0], a_col[1], a_col[2], pu_mode + "_col"]);
                        }
                    } else {
                        if (a[0] === "deletelineE") {
                            pu_mode = "pu_q";
                        }
                        if (a[4]) {
                            if (this[pu_mode][a[0]][a[1]]) { //symbol etc
                                this.pu_a.command_redo.push([a[0], a[1], this[pu_mode][a[0]][a[1]], pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_a_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]][a_col[1]], pu_mode + "_col", a_col[4]]);
                                }
                            } else {
                                this.pu_a.command_redo.push([a[0], a[1], null, pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_a_col.command_redo.push([a_col[0], a_col[1], null, pu_mode + "_col", a_col[4]]);
                                }
                            }
                        } else {
                            if (this[pu_mode][a[0]][a[1]]) { //symbol etc
                                this.pu_a.command_redo.push([a[0], a[1], this[pu_mode][a[0]][a[1]], pu_mode]);
                                if (a_col) {
                                    this.pu_a_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]][a_col[1]], pu_mode + "_col"]);
                                }
                            } else {
                                this.pu_a.command_redo.push([a[0], a[1], null, pu_mode]);
                                if (a_col) {
                                    this.pu_a_col.command_redo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                                }
                            }
                        }
                        if (a[2]) {
                            this[pu_mode][a[0]][a[1]] = JSON.parse(a[2]); //JSON.parse with decode
                            if (a_col) {
                                this[pu_mode + "_col"][a_col[0]][a_col[1]] = JSON.parse(a_col[2]); //JSON.parse with decode
                            }
                        } else {
                            delete this[pu_mode][a[0]][a[1]];
                            if (a_col) {
                                delete this[pu_mode + "_col"][a_col[0]][a_col[1]];
                            }
                        }
                    }
                    this.redraw();
                }
            }
        }
    }

    redo() {
        var pu_mode = this.mode.qa;
        var redocounter = 1;
        let groupindex;
        if (pu_mode === "pu_q") {
            while (redocounter !== 0) {
                var a = this.pu_q.command_redo.pop();
                var a_col = this.pu_q_col.command_redo.pop();
                if (a && a[4]) { // if part of group redo
                    if (!groupindex) {
                        groupindex = a[4];
                    }
                    if (a[4] != groupindex) { // if part of different group, stop
                        this.pu_q.command_redo.push(a);
                        if (a_col) {
                            this.pu_q_col.command_redo.push(a_col);
                        }
                        break;
                    }
                } else if (!groupindex) {
                    redocounter = 0;
                } else { // group redo is done, stop
                    this.pu_q.command_redo.push(a);
                    if (a_col) {
                        this.pu_q_col.command_redo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    if ((a[0] === "thermo" || a[0] === "arrows" || a[0] === "direction" || a[0] === "squareframe" || a[0] === "polygon") && a[1] === -1) {
                        this.pu_q.command_undo.push([a[0], a[1], null, pu_mode]);
                        this[pu_mode][a[0]].push(a[2]);
                        if (a_col) {
                            this.pu_q_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                            this[pu_mode + "_col"][a_col[0]].push(a_col[2]);
                        }
                    } else if (a[0] === "move") { //a[0]:move a[1]:point_from a[2]:point_to
                        for (var i in a[1]) {
                            if (a[1][i] != a[2]) {
                                this[pu_mode][i][a[2]] = this[pu_mode][i][a[1][i]];
                                delete this[pu_mode][i][a[1][i]];
                                if (a_col) {
                                    this[pu_mode + "_col"][i][a_col[2]] = this[pu_mode + "_col"][i][a_col[1][i]];
                                    delete this[pu_mode + "_col"][i][a_col[1][i]];
                                }
                            }
                        }
                        this.pu_q.command_undo.push([a[0], a[1], a[2], pu_mode]);
                        if (a_col) {
                            this.pu_q_col.command_undo.push([a_col[0], a_col[1], a_col[2], pu_mode + "_col"]);
                        }
                    } else {
                        if (a[4]) {
                            if (this[pu_mode][a[0]][a[1]]) {
                                this.pu_q.command_undo.push([a[0], a[1], JSON.stringify(this[pu_mode][a[0]][a[1]]), pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_q_col.command_undo.push([a_col[0], a_col[1], JSON.stringify(this[pu_mode + "_col"][a_col[0]][a_col[1]]), pu_mode + "_col", a_col[4]]);
                                }
                            } else {
                                this.pu_q.command_undo.push([a[0], a[1], null, pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_q_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col", a_col[4]]);
                                }
                            }
                        } else {
                            if (this[pu_mode][a[0]][a[1]]) {
                                this.pu_q.command_undo.push([a[0], a[1], JSON.stringify(this[pu_mode][a[0]][a[1]]), pu_mode]);
                                if (a_col) {
                                    this.pu_q_col.command_undo.push([a_col[0], a_col[1], JSON.stringify(this[pu_mode + "_col"][a_col[0]][a_col[1]]), pu_mode + "_col"]);
                                }
                            } else {
                                this.pu_q.command_undo.push([a[0], a[1], null, pu_mode]);
                                if (a_col) {
                                    this.pu_q_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                                }
                            }
                        }
                        if (a[2]) {
                            this[pu_mode][a[0]][a[1]] = a[2];
                            if (a_col) {
                                this[pu_mode + "_col"][a_col[0]][a_col[1]] = a_col[2];
                            }
                        } else {
                            delete this[pu_mode][a[0]][a[1]];
                            if (a_col) {
                                delete this[pu_mode + "_col"][a_col[0]][a_col[1]];
                            }
                        }
                    }
                    this.redraw();
                }
            }
        } else {
            while (redocounter !== 0) {
                var a = this.pu_a.command_redo.pop();
                var a_col = this.pu_a_col.command_redo.pop();
                if (a && a[4]) { // if its part of group
                    if (!groupindex) {
                        groupindex = a[4];
                    }
                    if (a[4] != groupindex) { // if its part of another group then stop
                        this.pu_a.command_redo.push(a);
                        if (a_col) {
                            this.pu_a_col.command_redo.push(a_col);
                        }
                        break;
                    }
                } else if (!groupindex) {
                    redocounter = 0;
                } else {
                    this.pu_a.command_redo.push(a); // group redo is done, stop
                    if (a_col) {
                        this.pu_a_col.command_redo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    if ((a[0] === "thermo" || a[0] === "arrows" || a[0] === "direction" || a[0] === "squareframe" || a[0] === "polygon") && a[1] === -1) {
                        this.pu_a.command_undo.push([a[0], a[1], null, pu_mode]);
                        this[pu_mode][a[0]].push(a[2]);
                        if (a_col) {
                            this.pu_a_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                            this[pu_mode + "_col"][a_col[0]].push(a_col[2]);
                        }
                    } else if (a[0] === "move") { //a[0]:move a[1]:point_from a[2]:point_to
                        for (var i in a[1]) {
                            if (a[1][i] != a[2]) {
                                this[pu_mode][i][a[2]] = this[pu_mode][i][a[1][i]];
                                delete this[pu_mode][i][a[1][i]];
                                if (a_col) {
                                    this[pu_mode + "_col"][i][a_col[2]] = this[pu_mode + "_col"][i][a_col[1][i]];
                                    delete this[pu_mode + "_col"][i][a_col[1][i]];
                                }
                            }
                        }
                        this.pu_a.command_undo.push([a[0], a[1], a[2], pu_mode]);
                        if (a_col) {
                            this.pu_a_col.command_undo.push([a_col[0], a_col[1], a_col[2], pu_mode + "_col"]);
                        }
                    } else {
                        if (a[0] === "deletelineE") {
                            pu_mode = "pu_q";
                        }
                        if (a[4]) {
                            if (this[pu_mode][a[0]][a[1]]) {
                                this.pu_a.command_undo.push([a[0], a[1], JSON.stringify(this[pu_mode][a[0]][a[1]]), pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_a_col.command_undo.push([a_col[0], a_col[1], JSON.stringify(this[pu_mode + "_col"][a_col[0]][a_col[1]]), pu_mode + "_col", a_col[4]]);
                                }
                            } else {
                                this.pu_a.command_undo.push([a[0], a[1], null, pu_mode, a[4]]);
                                if (a_col) {
                                    this.pu_a_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col", a_col[4]]);
                                }
                            }
                        } else {
                            if (this[pu_mode][a[0]][a[1]]) {
                                this.pu_a.command_undo.push([a[0], a[1], JSON.stringify(this[pu_mode][a[0]][a[1]]), pu_mode]);
                                if (a_col) {
                                    this.pu_a_col.command_undo.push([a_col[0], a_col[1], JSON.stringify(this[pu_mode + "_col"][a_col[0]][a_col[1]]), pu_mode + "_col"]);
                                }
                            } else {
                                this.pu_a.command_undo.push([a[0], a[1], null, pu_mode]);
                                if (a_col) {
                                    this.pu_a_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                                }
                            }
                        }
                        if (a[2]) {
                            this[pu_mode][a[0]][a[1]] = a[2];
                            if (a_col) {
                                this[pu_mode + "_col"][a_col[0]][a_col[1]] = a_col[2];
                            }
                        } else {
                            delete this[pu_mode][a[0]][a[1]];
                            if (a_col) {
                                delete this[pu_mode + "_col"][a_col[0]][a_col[1]];
                            }
                        }
                    }
                    this.redraw();
                }
            }
        }
    }

    record(arr, num, groupcounter = 0) {
        if (this.mode.qa === "pu_q") {
            if ((arr === "thermo" || arr === "arrows" || arr === "direction" || arr === "squareframe") && num === -1) {
                this.pu_q.command_undo.push([arr, num, null, this.mode.qa]);
                this.pu_q_col.command_undo.push([arr, num, null, this.mode.qa + "_col"]);
            } else if (arr === "move") {
                this.pu_q.command_undo.push([arr, num[0], num[1], this.mode.qa]); //num[0]:start_point num[1]:to_point
                this.pu_q_col.command_undo.push([arr, num[0], num[1], this.mode.qa + "_col"]); //num[0]:start_point num[1]:to_point
            } else {
                if (this.pu_q[arr][num]) {
                    if (groupcounter === 0) {
                        this.pu_q.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa]); // Array is also recorded in JSON
                        if ((this.gridtype === "square" || this.gridtype === "sudoku" || this.gridtype === "kakuro") && (arr === "thermo" || arr === "arrows" || arr === "direction" || arr === "squareframe")) { // Currently only Thermo Supported, keep updating as I add other support
                            this.pu_q_col.command_undo.push([arr, num, JSON.stringify(this.pu_q_col[arr][num]), this.mode.qa + "_col"]); // Array is also recorded in JSON
                        } else {
                            this.pu_q_col.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa + "_col"]); // Array is also recorded in JSON
                        }
                    } else {
                        this.pu_q.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa, groupcounter]); // Array is also recorded in JSON
                        if ((this.gridtype === "square" || this.gridtype === "sudoku" || this.gridtype === "kakuro") && (arr === "thermo" || arr === "arrows" || arr === "direction" || arr === "squareframe")) {
                            this.pu_q_col.command_undo.push([arr, num, JSON.stringify(this.pu_q_col[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                        } else {
                            this.pu_q_col.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                        }
                    }
                } else {
                    if (groupcounter === 0) {
                        this.pu_q.command_undo.push([arr, num, null, this.mode.qa]);
                        this.pu_q_col.command_undo.push([arr, num, null, this.mode.qa + "_col"]);
                    } else {
                        this.pu_q.command_undo.push([arr, num, null, this.mode.qa, groupcounter]);
                        this.pu_q_col.command_undo.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
                    }
                }
            }
            this.pu_q.command_redo = new Stack();
            this.pu_q_col.command_redo = new Stack();
        } else {
            if ((arr === "thermo" || arr === "arrows" || arr === "direction" || arr === "squareframe") && num === -1) {
                this.pu_a.command_undo.push([arr, num, null, this.mode.qa]);
                this.pu_a_col.command_undo.push([arr, num, null, this.mode.qa + "_col"]);
            } else if (arr === "move") {
                this.pu_a.command_undo.push([arr, num[0], num[1], this.mode.qa]); //num[0]:start_point num[1]:to_point
                this.pu_a_col.command_undo.push([arr, num[0], num[1], this.mode.qa + "_col"]); //num[0]:start_point num[1]:to_point
            } else if (arr === "deletelineE") {
                if (this.pu_a[arr][num]) {
                    this.pu_a.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), "pu_q"]); // Array is also recorded in JSON
                    this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), "pu_q_col"]); // Array is also recorded in JSON
                } else {
                    this.pu_a.command_undo.push([arr, num, null, "pu_q"]);
                    this.pu_a_col.command_undo.push([arr, num, null, "pu_q_col"]);
                }
            } else {
                if (this.pu_a[arr][num]) {
                    if (groupcounter === 0) {
                        this.pu_a.command_undo.push([arr, num, JSON.stringify(this.pu_a[arr][num]), this.mode.qa]); // Array is also recorded in JSON
                        if ((this.gridtype === "square" || this.gridtype === "sudoku" || this.gridtype === "kakuro") && (arr === "thermo" || arr === "arrows" || arr === "direction" || arr === "squareframe")) {
                            this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_a_col[arr][num]), this.mode.qa + "_col"]); // Array is also recorded in JSON
                        } else {
                            this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_a[arr][num]), this.mode.qa + "_col"]); // Array is also recorded in JSON
                        }
                    } else {
                        this.pu_a.command_undo.push([arr, num, JSON.stringify(this.pu_a[arr][num]), this.mode.qa, groupcounter]); // Array is also recorded in JSON
                        if ((this.gridtype === "square" || this.gridtype === "sudoku" || this.gridtype === "kakuro") && (arr === "thermo" || arr === "arrows" || arr === "direction" || arr === "squareframe")) {
                            this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_a_col[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                        } else {
                            this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_a[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                        }
                    }
                } else {
                    if (groupcounter === 0) {
                        this.pu_a.command_undo.push([arr, num, null, this.mode.qa]);
                        this.pu_a_col.command_undo.push([arr, num, null, this.mode.qa + "_col"]);
                    } else {
                        this.pu_a.command_undo.push([arr, num, null, this.mode.qa, groupcounter]);
                        this.pu_a_col.command_undo.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
                    }
                }
            }
            this.pu_a.command_redo = new Stack();
            this.pu_a_col.command_redo = new Stack();
        }
    }

    /////////////////////////////
    // Key Event
    //
    /////////////////////////////

    key_number(key) {
        var number;
        var con, conA;
        var arrow, mode;
        var str_num = "1234567890";
        var str_num_no0 = "123456789";
        // var str_replace = ["+-=*", "＋－＝＊"];
        // if (str_replace[0].indexOf(key) != -1) { key = str_replace[1][str_replace[0].indexOf(key)]; }
        if (this.mode[this.mode.qa].edit_mode === "number") {
            switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                case "1":
                    // If the there are corner or sides present then get rid of them
                    // Only in Answer mode
                    if (this.mode.qa === "pu_a") {
                        var corner_cursor = 4 * (this.cursol + this.nx0 * this.ny0);
                        var side_cursor = 4 * (this.cursol + 2 * this.nx0 * this.ny0);

                        for (var j = 0; j < 4; j++) {
                            if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                this.record("numberS", corner_cursor + j);
                                delete this[this.mode.qa].numberS[corner_cursor + j];
                            }
                        }

                        for (var j = 0; j < 4; j++) {
                            if (this[this.mode.qa].numberS[side_cursor + j]) {
                                this.record("numberS", side_cursor + j);
                                delete this[this.mode.qa].numberS[side_cursor + j];
                            }
                        }
                    }

                    this.record("number", this.cursol);
                    if (str_num.indexOf(key) != -1 && this[this.mode.qa].number[this.cursol]) {
                        con = parseInt(this[this.mode.qa].number[this.cursol][0], 10); // Convert to number
                        if (con >= 1 && con <= 9 && this[this.mode.qa].number[this.cursol][2] != "7") { // If already 1-9 exist, go to 2nd digit
                            number = con.toString() + key;
                        } else {
                            // It enters here when the cell already contains 2 digits.
                            number = key;
                        }
                    } else {
                        // It enters for first entry in a cell and then for alphabets or special characters i.e. non numbers
                        console.log(key.codePointAt(0))
                        number = key;
                    }
                    this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    break;
                case "2": // Arrow
                    this.record("number", this.cursol);
                    if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != "7") {
                        con = this[this.mode.qa].number[this.cursol][0];
                    } else {
                        con = "";
                    }
                    if (con.slice(-2, -1) === "_") {
                        conA = parseInt(con.slice(0, -2), 10);
                        arrow = con.slice(-2);
                    } else {
                        conA = parseInt(con, 10);
                        arrow = "";
                    }
                    if (str_num.indexOf(key) != -1) {
                        if (conA >= 1 && conA <= 9) { //1~9だったら2桁目へ
                            number = conA.toString() + key;
                        } else {
                            number = key;
                        }
                    } else {
                        number = key;
                    }
                    this[this.mode.qa].number[this.cursol] = [number + arrow, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    break;
                case "3": // 1/4, corner
                case "9": // Sides
                    this.record("numberS", this.cursolS);
                    if (this[this.mode.qa].numberS[this.cursolS]) {
                        con = this[this.mode.qa].numberS[this.cursolS][0];
                    } else {
                        con = "";
                    }
                    number = con + key;
                    this[this.mode.qa].numberS[this.cursolS] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                    break;
                case "4": //tapa
                    if (key === ".") { key = " "; }
                    this.record("number", this.cursol);
                    if (this[this.mode.qa].number[this.cursol]) {
                        con = this[this.mode.qa].number[this.cursol][0];
                        mode = this[this.mode.qa].number[this.cursol][2];
                    } else {
                        con = "";
                        mode = "";
                    }
                    if (mode != 2 && mode != 7) { //arrowでなければ
                        if (con.length >= 0 && con.length <= 3) { //3文字以内なら追加
                            number = con + key;
                        } else {
                            number = con; //4文字以上ならそのまま
                        }
                    } else { //arrowなら上書き
                        number = key;
                    }
                    this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    break;
                case "5": // Small
                    if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != "2" && this[this.mode.qa].number[this.cursol][2] != "7") {
                        con = this[this.mode.qa].number[this.cursol][0];
                    } else {
                        con = "";
                    }
                    if (con.length < 10) {
                        this.record("number", this.cursol);
                        number = con + key;
                        this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    }
                    break;
                case "6": // Medium
                    if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != "2" && this[this.mode.qa].number[this.cursol][2] != "7") {
                        con = this[this.mode.qa].number[this.cursol][0];
                    } else {
                        con = "";
                    }
                    if (con.length < 10) {
                        this.record("number", this.cursol);
                        number = con + key;
                        this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    }
                    break;
                case "10": //big
                    if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != "2" && this[this.mode.qa].number[this.cursol][2] != "7") {
                        con = this[this.mode.qa].number[this.cursol][0];
                    } else {
                        con = "";
                    }
                    if (con.length < 10) {
                        this.record("number", this.cursol);
                        number = con + key;
                        this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    }
                    break;
                case "7": // Candidates
                    if (str_num_no0.indexOf(key) != -1) {
                        this.record("number", this.cursol);
                        if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] === "7") {
                            con = this[this.mode.qa].number[this.cursol][0];
                        } else {
                            con = "";
                        }
                        number = this.onofftext(9, key, con);
                        this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    }
                    break;
                case "8": // Long
                    if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != "2" && this[this.mode.qa].number[this.cursol][2] != "7") {
                        con = this[this.mode.qa].number[this.cursol][0];
                    } else {
                        con = "";
                    }
                    if (con.length < 50) {
                        this.record("number", this.cursol);
                        number = con + key;
                        this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]];
                    }
                    break;
                case "11": // Killer Sum
                    var corner_cursor = 4 * (this.cursol + this.nx0 * this.ny0);
                    this.record("numberS", corner_cursor);
                    if (this[this.mode.qa].numberS[corner_cursor]) {
                        con = " " + this[this.mode.qa].numberS[corner_cursor][0];
                    } else {
                        con = "";
                    }
                    number = con + key;
                    this[this.mode.qa].numberS[corner_cursor] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                    break;
            }
        } else if (this.mode[this.mode.qa].edit_mode === "symbol") {
            if (str_num.indexOf(key) != -1) {
                if (this[this.mode.qa].symbol[this.cursol]) {
                    if (this[this.mode.qa].symbol[this.cursol][0] === parseInt(key, 10) && this[this.mode.qa].symbol[this.cursol][1] === this.mode[this.mode.qa].symbol[0]) {
                        this.key_space(); // Delete if the contents are the same
                        return;
                    } else {
                        con = this[this.mode.qa].symbol[this.cursol][0];
                    }
                } else {
                    con = "";
                }
                this.record("symbol", this.cursol);

                if (this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]]) { // List in ON-OFF mode
                    number = this.onofftext(this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]], key, con);
                } else {
                    number = parseInt(key, 10);
                }
                this[this.mode.qa].symbol[this.cursol] = [number, this.mode[this.mode.qa].symbol[0], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
            }
        } else if (this.mode[this.mode.qa].edit_mode === "sudoku") {
            switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                case "1": // Normal mode
                    if (this.selection.length > 0 && str_num.indexOf(key) != -1) {
                        if (this.selection.length === 1) {
                            this.undoredo_counter = 0;
                        } else {
                            this.undoredo_counter = this.undoredo_counter + 1;
                        }
                        for (var k of this.selection) {
                            if (((this.mode.qa === "pu_a") && this["pu_q"].number[k] && this["pu_q"].number[k][2] === "1" && Number.isInteger(parseInt(this["pu_q"].number[k][0])))) { // if single digit is present, dont modify that cell
                                var single_digit = true;
                            } else if ((this.mode.qa === "pu_a") && this["pu_q"].number[k] && this["pu_q"].number[k][2] === "7") {
                                // This is for single digit obtained from candidate submode
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_q"].number[k][0][j] === 1) {
                                        sum += 1;
                                    }
                                }
                                if (sum === 1) {
                                    var single_digit = true;
                                } else {
                                    var single_digit = false;
                                }
                            } else {
                                var single_digit = false;
                            }
                            if (!single_digit) {
                                // If the there are corner or sides present then get rid of them
                                // Only in Answer mode
                                if (this.mode.qa === "pu_a") {
                                    var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                                    var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

                                    for (var j = 0; j < 4; j++) {
                                        if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                            this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                            delete this[this.mode.qa].numberS[corner_cursor + j];
                                        }
                                    }

                                    for (var j = 0; j < 4; j++) {
                                        if (this[this.mode.qa].numberS[side_cursor + j]) {
                                            this.record("numberS", side_cursor + j, this.undoredo_counter);
                                            delete this[this.mode.qa].numberS[side_cursor + j];
                                        }
                                    }
                                }

                                this.record("number", k, this.undoredo_counter);
                                if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] === 1 && this[this.mode.qa].number[k][0] === key) {
                                    delete this[this.mode.qa].number[k];
                                } else {
                                    this[this.mode.qa].number[k] = [key, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], "1"]; // Normal submode is 1
                                }
                            }
                        }
                    }
                    break;
                case "2": // Corner mode
                    if (this.selection.length > 0 && str_num.indexOf(key) != -1) {

                        if (this.selection.length === 1) {
                            this.undoredo_counter = 0;
                        } else {
                            this.undoredo_counter = this.undoredo_counter + 1;
                        }
                        var j_start = 0;
                        var length_limit = 8;

                        // if any element present in numberS mode then
                        // can be made more efficient if this is detected when the puzzle is loaded, for now its ok
                        if (this.mode.qa === "pu_a" && (Object.keys(this["pu_q"].numberS).length != 0)) {
                            length_limit = 6;
                            j_start = 1;
                        }

                        for (var k of this.selection) {
                            if ((this["pu_q"].number[k] && this["pu_q"].number[k][2] === "1" && Number.isInteger(parseInt(this["pu_q"].number[k][0]))) ||
                                this["pu_a"].number[k] && this["pu_a"].number[k][2] === "1") { // if single digit is present, dont modify that cell
                                var single_digit = true;
                            } else if (this["pu_q"].number[k] && this["pu_q"].number[k][2] === "7") {
                                // This is for single digit obtained from candidate submode in Problem
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_q"].number[k][0][j] === 1) {
                                        sum += 1;
                                    }
                                }
                                if (sum === 1) {
                                    var single_digit = true;
                                } else {
                                    var single_digit = false;
                                }
                            } else if (this["pu_a"].number[k] && this["pu_a"].number[k][2] === "7") {
                                // This is for digits obtained from candidate submode in Solution
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_a"].number[k][0][j] === 1) {
                                        sum += 1;
                                        con += (j + 1).toString();
                                    }
                                }
                                if (sum === 1) {
                                    var single_digit = true;
                                } else {
                                    var single_digit = false;
                                }
                            } else {
                                var single_digit = false;
                            }
                            if (!single_digit) {
                                var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                                var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);
                                con = "";

                                // Read all the existing digits from the corner and sides
                                for (var j = j_start; j < 4; j++) {
                                    if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                        con += this[this.mode.qa].numberS[corner_cursor + j][0];
                                    }
                                }
                                for (var j = j_start; j < 4; j++) {
                                    if (this[this.mode.qa].numberS[side_cursor + j]) {
                                        con += this[this.mode.qa].numberS[side_cursor + j][0];
                                    }
                                }

                                if (con.indexOf(key) != -1) { // if digit already exists
                                    con = con.replace(key, '');

                                    // remove the last digit from old location
                                    if ((con.length + 1) < (5 - j_start)) {
                                        this.record("numberS", corner_cursor + con.length + j_start, this.undoredo_counter);
                                        delete this[this.mode.qa].numberS[corner_cursor + con.length + j_start];
                                    } else {
                                        this.record("numberS", side_cursor + con.length - 4 + 2 * j_start, this.undoredo_counter);
                                        delete this[this.mode.qa].numberS[side_cursor + con.length - 4 + 2 * j_start];
                                    }

                                    if (con) {
                                        if (con.length < (5 - j_start)) {
                                            for (var j = j_start; j < (con.length + j_start); j++) {
                                                this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                                this[this.mode.qa].numberS[corner_cursor + j] = [con[j - j_start], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                                            }
                                        } else {
                                            for (var j = j_start; j < 4; j++) {
                                                this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                                this[this.mode.qa].numberS[corner_cursor + j] = [con[j - j_start], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                                            }
                                            for (var j = 4 + j_start; j < (con.length + 2 * j_start); j++) {
                                                this.record("numberS", side_cursor + j - 4, this.undoredo_counter);
                                                this[this.mode.qa].numberS[side_cursor + j - 4] = [con[j - 2 * j_start], this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                                            }
                                        }
                                    }
                                } else if (con.length < length_limit) { // If digit doesnt exist in the cell
                                    con += key;
                                    if (con.length < (5 - j_start)) {
                                        this.record("numberS", corner_cursor + con.length - 1 + j_start, this.undoredo_counter);
                                        this[this.mode.qa].numberS[corner_cursor + con.length - 1 + j_start] = [key, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                                    } else {
                                        this.record("numberS", side_cursor + con.length - 5 + 2 * j_start, this.undoredo_counter);
                                        this[this.mode.qa].numberS[side_cursor + con.length - 5 + 2 * j_start] = [key, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1]];
                                    }
                                }
                            }
                        }

                    }
                    break;
                case "3": // Centre mode
                    if (this.selection.length > 0 && str_num.indexOf(key) != -1) {
                        if (this.selection.length === 1) {
                            this.undoredo_counter = 0;
                        } else {
                            this.undoredo_counter = this.undoredo_counter + 1;
                        }
                        for (var k of this.selection) {
                            var con = "";
                            if ((this["pu_q"].number[k] && this["pu_q"].number[k][2] === "1" && Number.isInteger(parseInt(this["pu_q"].number[k][0]))) ||
                                this["pu_a"].number[k] && this["pu_a"].number[k][2] === "1") { // if single digit is present, dont modify that cell
                                var single_digit = true;
                            } else if (this["pu_q"].number[k] && this["pu_q"].number[k][2] === "7") {
                                // This is for single digit obtained from candidate submode
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_q"].number[k][0][j] === 1) {
                                        sum += 1;
                                        con += (j + 1).toString();
                                    }
                                }
                                if (sum === 1) {
                                    var single_digit = true;
                                } else {
                                    var single_digit = false;
                                }
                            } else if (this["pu_a"].number[k] && this["pu_a"].number[k][2] === "7") {
                                // This is for digits obtained from candidate submode
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_a"].number[k][0][j] === 1) {
                                        sum += 1;
                                        con += (j + 1).toString();
                                    }
                                }
                                if (sum === 1) {
                                    var single_digit = true;
                                } else {
                                    var single_digit = false;
                                }
                            } else {
                                var single_digit = false;
                            }
                            if (!single_digit) {
                                number = "";
                                if (this[this.mode.qa].number[k]) {
                                    if (con.length === 0) {
                                        con = this[this.mode.qa].number[k][0];
                                    }
                                    if (con.indexOf(key) != -1) {
                                        con = con.split("").sort();
                                        for (var m of con) {
                                            if (m != key) {
                                                number += m;
                                            }
                                        }
                                    } else {
                                        number = con + key;
                                        number = number.split("").sort().join("");
                                    }
                                } else {
                                    number += key;
                                }
                                this.record("number", k, this.undoredo_counter);
                                // S submode is 5, M submode is 6
                                if (number.length > 5) {
                                    this[this.mode.qa].number[k] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], "5"];
                                } else {
                                    this[this.mode.qa].number[k] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], "6"];
                                }
                            }
                        }
                    }
                    break;
            }
        }
        this.redraw();
    }

    onofftext(n, key, data) {
        if (data.length != n) {
            data = [];
            for (var i = 0; i < n; i++) {
                data[i] = 0;
            }
        }
        var q = "1234567890".slice(0, n);
        if (q.indexOf(key) != -1) {
            var con = parseInt(key, 10);
            if (data[con - 1] === 1) {
                data[con - 1] = 0;
            } else {
                data[con - 1] = 1;
            }
        }
        return data;
    }

    key_space(keypressed = 0) {
        if (this.mode[this.mode.qa].edit_mode === "number") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3" || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                this.record("numberS", this.cursolS);
                delete this[this.mode.qa].numberS[this.cursolS];
            } else {

                // Remove the corner and side numbers
                var corner_cursor = 4 * (this.cursol + this.nx0 * this.ny0);
                var side_cursor = 4 * (this.cursol + 2 * this.nx0 * this.ny0);

                for (var j = 0; j < 4; j++) {
                    if (this[this.mode.qa].numberS[corner_cursor + j]) {
                        this.record("numberS", corner_cursor + j);
                        delete this[this.mode.qa].numberS[corner_cursor + j];
                    }
                }

                for (var j = 0; j < 4; j++) {
                    if (this[this.mode.qa].numberS[side_cursor + j]) {
                        this.record("numberS", side_cursor + j);
                        delete this[this.mode.qa].numberS[side_cursor + j];
                    }
                }

                this.record("number", this.cursol);
                delete this[this.mode.qa].number[this.cursol];
            }
        } else if (this.mode[this.mode.qa].edit_mode === "symbol") {
            this.record("symbol", this.cursol);
            delete this[this.mode.qa].symbol[this.cursol];
        } else if (this.mode[this.mode.qa].edit_mode === "sudoku") {
            if (keypressed === 46 || keypressed === 8 || this.ondown_key === "touchstart") {
                if (this.selection.length === 1) {
                    this.undoredo_counter = 0;
                } else {
                    this.undoredo_counter = this.undoredo_counter + 1;
                }
                if (this.selection.length > 0) {
                    for (var k of this.selection) {

                        if (this[this.mode.qa].number[k]) {
                            this.record("number", k, this.undoredo_counter);
                            delete this[this.mode.qa].number[k];
                        }

                        var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                        var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

                        for (var j = 0; j < 4; j++) {
                            if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                delete this[this.mode.qa].numberS[corner_cursor + j];
                            }
                        }

                        for (var j = 0; j < 4; j++) {
                            if (this[this.mode.qa].numberS[side_cursor + j]) {
                                this.record("numberS", side_cursor + j, this.undoredo_counter);
                                delete this[this.mode.qa].numberS[side_cursor + j];
                            }
                        }
                    }
                }
            } else {
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1") {
                    if (this.selection.length > 0) {
                        for (var k of this.selection) {
                            if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] === "1") {
                                this.record("number", k, this.undoredo_counter);
                                delete this[this.mode.qa].number[k];
                            }
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    if (this.selection.length > 0) {
                        for (var k of this.selection) {
                            if (this[this.mode.qa].number[k] && (this[this.mode.qa].number[k][2] === "5" || this[this.mode.qa].number[k][2] === "6")) {
                                this.record("number", k, this.undoredo_counter);
                                delete this[this.mode.qa].number[k];
                            }
                        }
                    }
                } else {
                    if (this.selection.length > 0) {
                        for (var k of this.selection) {
                            var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                            var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

                            for (var j = 0; j < 4; j++) {
                                if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                    this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                    delete this[this.mode.qa].numberS[corner_cursor + j];
                                }
                            }

                            for (var j = 0; j < 4; j++) {
                                if (this[this.mode.qa].numberS[side_cursor + j]) {
                                    this.record("numberS", side_cursor + j, this.undoredo_counter);
                                    delete this[this.mode.qa].numberS[side_cursor + j];
                                }
                            }
                        }
                    }
                }
            }
        }
        this.redraw();
    }

    key_shiftspace() {
        if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol") {
            if (this.mode[this.mode.qa].edit_mode === "number" && (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3" || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9")) {
                this.record("numberS", this.cursolS);
                delete this[this.mode.qa].numberS[this.cursolS];
            } else {
                this.record("number", this.cursol);
                delete this[this.mode.qa].number[this.cursol];
                this.record("symbol", this.cursol);
                delete this[this.mode.qa].symbol[this.cursol];
            }
        }
        this.redraw();
    }

    key_backspace() {
        var number;
        if (this.mode[this.mode.qa].edit_mode === "number") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3" || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") { // 1/4 and side
                if (this[this.mode.qa].numberS[this.cursolS]) {
                    this.record("numberS", this.cursolS);
                    number = this[this.mode.qa].numberS[this.cursolS][0].slice(0, -1);
                    if (number) {
                        this[this.mode.qa].numberS[this.cursolS][0] = number;
                    } else {
                        delete this[this.mode.qa].numberS[this.cursolS];
                    }
                }
            } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "11") {
                var corner_cursor = 4 * (this.cursol + this.nx0 * this.ny0);
                if (this[this.mode.qa].numberS[corner_cursor]) {
                    this.record("numberS", corner_cursor);
                    number = this[this.mode.qa].numberS[corner_cursor][0].slice(1, -1);
                    if (number) {
                        this[this.mode.qa].numberS[corner_cursor][0] = number;
                    } else {
                        delete this[this.mode.qa].numberS[corner_cursor];
                    }
                }
            } else {
                if (this[this.mode.qa].number[this.cursol] && this[this.mode.qa].number[this.cursol][2] != 7) {
                    this.record("number", this.cursol);
                    number = this[this.mode.qa].number[this.cursol][0];
                    if (number) {
                        if (this[this.mode.qa].number[this.cursol][2] === "2") {
                            if (number.slice(-2, -1) === "_") {
                                number = number.slice(0, -2).slice(0, -1) + number.slice(-2);
                            } else {
                                number = number.slice(0, -1);
                            }
                        } else {
                            number = number.slice(0, -1);
                        }
                        if (number ||
                            this[this.mode.qa].number[this.cursol][1] === 6 ||
                            this[this.mode.qa].number[this.cursol][1] === 7 ||
                            this[this.mode.qa].number[this.cursol][1] === 11) {
                            this[this.mode.qa].number[this.cursol][0] = number;
                        } else {
                            delete this[this.mode.qa].number[this.cursol];
                        }
                    }
                }
            }
        }
        this.redraw();
    }

    /////////////////////////////
    // Mouse Event
    //
    /////////////////////////////
    recalculate_num(x, y, num) {
        return num;
    }

    mouseevent(x, y, num, ctrl_key = false) {
        num = this.recalculate_num(x, y, num); //for uniform tiling
        switch (this.mode[this.mode.qa].edit_mode) {
            case "surface":
                this.mouse_surface(x, y, num);
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    this.mouse_linefree(x, y, num);
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    this.mouse_lineX(x, y, num);
                } else {
                    this.mouse_line(x, y, num);
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    this.mouse_lineEfree(x, y, num);
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    this.mouse_lineEX(x, y, num);
                } else {
                    this.mouse_lineE(x, y, num);
                }
                break;
            case "wall":
                this.mouse_wall(x, y, num);
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3" || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    this.mouse_numberS(x, y, num);
                } else {
                    this.mouse_number(x, y, num);
                }
                break;
            case "symbol":
                this.mouse_symbol(x, y, num);
                break;
            case "cage":
                this.mouse_cage(x, y, num);
                break;
            case "special":
                this.mouse_special(x, y, num);
                break;
            case "board":
                this.mouse_board(x, y, num);
                break;
            case "move":
                this.mouse_move(x, y, num);
                break;
            case "combi":
                this.mouse_combi(x, y, num);
                break;
            case "sudoku":
                this.mouse_sudoku(x, y, num, ctrl_key);
                break;
        }
    }

    //////////////////////////
    // surface
    //////////////////////////

    mouse_surface(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.re_surface(num);
            this.last = num;
        } else if (this.mouse_mode === "down_right") {
            this.drawing = true;
            this.re_surfaceR(num);
            this.last = num;
        } else if (this.mouse_mode === "move") {
            this.re_surfacemove(num);
            this.last = num;
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.drawing_mode = -1;
            this.last = -1;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.drawing_mode = -1;
            this.last = -1;
        }
    }

    re_surface(num) {
        var color = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
        this.record("surface", num);
        if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === 1 && color === 1) {
            this[this.mode.qa].surface[num] = 2;
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"].surface[num] = Color.GREEN_LIGHT_VERY;
            }
            this.drawing_mode = 2;
        } else if (this[this.mode.qa].surface[num] && (this[this.mode.qa].surface[num] === color || (this[this.mode.qa].surface[num] === 2 && color === 1))) {
            delete this[this.mode.qa].surface[num];
            if (document.getElementById("custom_color_yes").checked) {
                delete this[this.mode.qa + "_col"].surface[num];
            }
            this.drawing_mode = 0;
        } else {
            this[this.mode.qa].surface[num] = color;
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"].surface[num] = this.get_customcolor();
            }
            this.drawing_mode = color;
        }
        this.redraw();
    }

    re_surfaceR(num) {
        this.record("surface", num);
        if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === 2) {
            delete this[this.mode.qa].surface[num];
            if (document.getElementById("custom_color_yes").checked) {
                delete this[this.mode.qa + "_col"].surface[num];
            }
            this.drawing_mode = 0;
        } else {
            this[this.mode.qa].surface[num] = 2;
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"].surface[num] = Color.GREEN_LIGHT_VERY;
            }
            this.drawing_mode = 2;
        }
        this.redraw();
    }

    re_surfacemove(num) {
        if (this.drawing) {
            if (this.drawing_mode === 0) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                    if (document.getElementById("custom_color_yes").checked) {
                        delete this[this.mode.qa + "_col"].surface[num];
                    }
                    this.redraw();
                }
            } else {
                if (!this[this.mode.qa].surface[num] || this[this.mode.qa].surface[num] != this.drawing_mode) {
                    this.record("surface", num);
                    this[this.mode.qa].surface[num] = this.drawing_mode;
                    if (document.getElementById("custom_color_yes").checked) {
                        if (this.drawing_mode === 2) {
                            this[this.mode.qa + "_col"].surface[num] = Color.GREEN_LIGHT_VERY;
                        } else {
                            this[this.mode.qa + "_col"].surface[num] = this.get_customcolor();
                        }
                    }
                    this.redraw();
                }
            }
        }
    }

    //////////////////////////
    // line
    //////////////////////////

    mouse_line(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.drawing_mode = 100;
            this.last = num;
        } else if (this.mouse_mode === "move") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "2" || this.point[num].type === 0) { // Not diagonal or diagonally inside
                this.re_linemove(num);
                this.last = num;
            }
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.last = -1;
            this.drawing_mode = -1;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.last = -1;
            this.drawing_mode = -1;
        }
    }

    //line,lineE,cage Drawing
    re_line(array, num, line_style) {
        if ((this[this.mode.qa][array][num] === line_style) || (this["pu_q"]["deletelineE"][num] === line_style)) {
            if (this.drawing_mode === 100) { // single line, edge
                this.record(array, num);
                if (array === "deletelineE") {
                    delete this["pu_q"][array][num];
                    if (document.getElementById("custom_color_yes").checked) {
                        delete this["pu_q_col"][array][num];
                    }
                } else {
                    delete this[this.mode.qa][array][num];
                    if (document.getElementById("custom_color_yes").checked) {
                        delete this[this.mode.qa + "_col"][array][num];
                    }
                }
                this.drawing_mode = 0;
            } else if (this.drawing_mode === 0) { // to draw in a stretch
                this.record(array, num);
                if (array === "deletelineE") {
                    delete this["pu_q"][array][num];
                    if (document.getElementById("custom_color_yes").checked) {
                        delete this["pu_q_col"][array][num];
                    }
                } else {
                    delete this[this.mode.qa][array][num];
                    if (document.getElementById("custom_color_yes").checked) {
                        delete this[this.mode.qa + "_col"][array][num];
                    }
                }
            }
        } else {
            if (this.drawing_mode === 100) { // single line, edge
                this.record(array, num);
                if (array === "deletelineE") {
                    this["pu_q"][array][num] = line_style;
                    if (document.getElementById("custom_color_yes").checked) {
                        this["pu_q_col"][array][num] = this.get_customcolor();
                    }
                } else {
                    this[this.mode.qa][array][num] = line_style;
                    if (document.getElementById("custom_color_yes").checked) {
                        this[this.mode.qa + "_col"][array][num] = this.get_customcolor();
                    }
                }
                this.drawing_mode = line_style;
            } else if (this.drawing_mode === line_style) { // to draw in a stretch
                this.record(array, num);
                if (array === "deletelineE") {
                    this["pu_q"][array][num] = line_style;
                    if (document.getElementById("custom_color_yes").checked) {
                        this["pu_q_col"][array][num] = this.get_customcolor();
                    }
                } else {
                    this[this.mode.qa][array][num] = line_style;
                    if (document.getElementById("custom_color_yes").checked) {
                        this[this.mode.qa + "_col"][array][num] = this.get_customcolor();
                    }
                }
            }
        }
    }

    re_linemove(num) {
        if (this.drawing && this.last != num) {
            var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1") {
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                    array = "line";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                }
            } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1 || this.point[num].adjacent_dia.indexOf(parseInt(this.last)) != -1) {
                    array = "line";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                }
            } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") { //centerline
                if (this.point[num].neighbor.indexOf(parseInt(this.last)) != -1) {
                    array = "line";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                }
            }
            this.redraw();
        }
    }

    mouse_linefree(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.drawing_mode = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            this.last = num;
            this.freelinecircle_g[0] = num;
            this.redraw(); // This is needed so that the circle appears for aid
        } else if (this.mouse_mode === "move") {
            if (this.drawing && this.last != num) {
                this.freelinecircle_g[1] = num;
                this.redraw(); // This is needed so that the circle appears for aid
            }
        } else if (this.mouse_mode === "up") {
            this.re_lineup_free(num);
            this.drawing = false;
            this.freelinecircle_g = [-1, -1];
            this.last = -1;
            this.drawing_mode = -1;
            this.redraw();
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.freelinecircle_g = [-1, -1];
            this.last = -1;
            this.drawing_mode = -1;
            this.redraw();
        }
    }

    re_lineup_free(num) {
        if (num != this.last && this.last != -1) {
            var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
            this.record("freeline", key);
            if (this[this.mode.qa].freeline[key]) {
                delete this[this.mode.qa].freeline[key];
                if (document.getElementById("custom_color_yes").checked) {
                    delete this[this.mode.qa + "_col"].freeline[key];
                }
            } else {
                this[this.mode.qa].freeline[key] = this.drawing_mode;
                if (document.getElementById("custom_color_yes").checked) {
                    this[this.mode.qa + "_col"].freeline[key] = this.get_customcolor();
                }
            }
        }
    }

    mouse_lineX(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.re_lineX(num);
        }
    }

    re_lineX(num) {
        if (this[this.mode.qa].line[num] && this[this.mode.qa].line[num] === 98) { // Cross mark (x)
            this.record("line", num);
            delete this[this.mode.qa].line[num];
            if (document.getElementById("custom_color_yes").checked) {
                delete this[this.mode.qa + "_col"].line[num];
            }
        } else {
            this.record("line", num);
            this[this.mode.qa].line[num] = 98;
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"].line[num] = this.get_customcolor();
            }
        }
        this.redraw();
    }

    //////////////////////////
    // lineE
    //////////////////////////

    mouse_lineE(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.drawing_mode = 100;
            this.last = num;
        } else if (this.mouse_mode === "move") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "2" || this.point[num].type === 1) { //対角線でないor対角線で内側
                this.re_linemoveE(num);
                this.last = num;
            }
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.last = -1;
            this.drawing_mode = -1;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.last = -1;
            this.drawing_mode = -1;
        }
    }

    re_linemoveE(num) {
        if (this.drawing && this.last != num) {
            var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1") {
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                    array = "lineE";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                }
            } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1 || this.point[num].adjacent_dia.indexOf(parseInt(this.last)) != -1) {
                    array = "lineE";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                }
            } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                    array = "deletelineE";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, 1);
                }
            }
            this.redraw();
        }
    }

    mouse_lineEfree(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.drawing_mode = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            this.last = num;
            this.freelinecircle_g[0] = num;
            this.redraw();
        } else if (this.mouse_mode === "move") {
            if (this.drawing && this.last != num) {
                this.freelinecircle_g[1] = num;
                this.redraw();
            }
        } else if (this.mouse_mode === "up") {
            this.re_lineEup_free(num);
            this.drawing = false;
            this.freelinecircle_g = [-1, -1];
            this.last = -1;
            this.drawing_mode = -1;
            this.redraw();
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.freelinecircle_g = [-1, -1];
            this.last = -1;
            this.drawing_mode = -1;
            this.redraw();
        }
    }

    re_lineEup_free(num) {
        if (num != this.last && this.last != -1) {
            var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
            this.record("freelineE", key);
            if (this[this.mode.qa].freelineE[key]) {
                delete this[this.mode.qa].freelineE[key];
                if (document.getElementById("custom_color_yes").checked) {
                    delete this[this.mode.qa + "_col"].freelineE[key];
                }
            } else {
                this[this.mode.qa].freelineE[key] = this.drawing_mode;
                if (document.getElementById("custom_color_yes").checked) {
                    this[this.mode.qa + "_col"].freelineE[key] = this.get_customcolor();
                }
            }
        }
    }

    mouse_lineEX(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.re_lineEX(num);
        }
    }

    re_lineEX(num) {
        if (this[this.mode.qa].lineE[num] && this[this.mode.qa].lineE[num] === 98) { //×印
            this.record("lineE", num);
            delete this[this.mode.qa].lineE[num];
            if (document.getElementById("custom_color_yes").checked) {
                delete this[this.mode.qa + "_col"].lineE[num];
            }
        } else {
            this.record("lineE", num);
            this[this.mode.qa].lineE[num] = 98;
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"].lineE[num] = this.get_customcolor();
            }
        }
        this.redraw();
    }

    //////////////////////////
    // wall
    //////////////////////////

    mouse_wall(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.drawing_mode = 100;
            this.last = num;
            this.type = this.type_set();
        } else if (this.mouse_mode === "move") {
            this.re_wallmove(num);
            this.last = num;
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.last = -1;
            this.type = this.type_set();
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.last = -1;
            this.type = this.type_set();
        }
    }

    re_wallmove(num) {
        if (this.drawing && this.last != num) {
            var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) { //隣接していたら
                array = "wall";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.redraw();
        }
    }

    //////////////////////////
    // number
    //////////////////////////

    mouse_number(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.last = num;
            this.lastx = x;
            this.lasty = y;
            this.cursol = num;
            this.redraw();
        } else if (this.mouse_mode === "down_right") {
            this.cursol = num;
            this.redraw();
        } else if (this.mouse_mode === "move") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2" && this.drawing) {
                this.re_numberarrow(x, y);
            }
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.last = -1;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.last = -1;
        }
    }

    mouse_numberS(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.cursolS = num;
            this.redraw();
        } else if (this.mouse_mode === "down_right") {
            this.cursolS = num;
            this.redraw();
        }
    }


    mouse_sudoku(x, y, num, ctrl_key = false) {
        // if (this.point[num].type === 0) {}  // Add this line, to ignore corners and allow diagonal selection, and set type = [0, 1]
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            if (!ctrl_key) {
                this.selection = [];
            }
            // find if num already exist
            let num_index = this.selection.indexOf(num);
            if (num_index === -1) {
                this.selection.push(num);
            } else if (ctrl_key) {
                this.selection.splice(num_index, 1);
            }
            this.cursol = num;
            this.redraw();
        } else if (this.mouse_mode === "move") {
            if (!this.selection.includes(num) & this.drawing) {
                this.selection.push(num);
            }
            this.redraw();
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
        }
    }

    re_numberarrow(x, y, num) {
        var arrowdirection;
        if (this.last != -1) {
            //方向取得
            if ((x - this.lastx) ** 2 + (y - this.lasty) ** 2 > (0.3 * this.size) ** 2) {
                arrowdirection = this.direction_arrow8(x, y, this.lastx, this.lasty);
            } else {
                return;
            }
            //内容取得
            var con;
            if (this[this.mode.qa].number[this.cursol]) {
                con = this[this.mode.qa].number[this.cursol][0];
            } else {
                con = "";
            }
            //上書き
            var number;
            if (arrowdirection != undefined) {
                this.record("number", this.cursol);
                if (con.slice(-2) === "_" + arrowdirection) {
                    number = con.slice(0, -2);
                } else if (con.slice(-2, -1) === "_") {
                    number = con.slice(0, -1) + arrowdirection;
                } else {
                    number = con + "_" + arrowdirection;
                }
                this[this.mode.qa].number[this.cursol] = [number, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1], "2"];

                this.drawing = false;
                this.last = -1;
                this.redraw();
            }
        }
    }

    direction_arrow8(x, y) {} //override
    direction_arrow4(x, y) {} //override
    //////////////////////////
    // symbol
    //////////////////////////
    mouse_symbol(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.cursol = num;
            if (document.getElementById('panel_button').textContent === "ON" && !this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]]) {
                if (0 <= panel_pu.edit_num && panel_pu.edit_num <= 8) {
                    this.key_number((panel_pu.edit_num + 1).toString());
                } else if (panel_pu.edit_num === 9) {
                    this.key_number((panel_pu.edit_num - 9).toString());
                } else if (panel_pu.edit_num === 11) {
                    this.key_space();
                }
            }
            this.redraw();
        } else if (this.mouse_mode === "down_right") {
            this.cursol = num;
            this.redraw();
        }
    }

    //////////////////////////
    // cage
    //////////////////////////

    mouse_cage(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.drawing_mode = 100;
            this.last = num;
        } else if (this.mouse_mode === "move") {
            this.re_linecage(num);
            this.last = num;
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.last = -1;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.last = -1;
        }
    }

    re_linecage(num) {
        if (this.drawing && this.last != num) {
            var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) { //隣接していたら
                array = "cage";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.redraw();
        }
    }

    //////////////////////////
    // special
    //////////////////////////

    mouse_special(x, y, num) {
        if (this.mouse_mode === "down_left") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "polygon") {
                this.re_polygondown(num);
            } else if (this.point[num].type === 0) {
                this.re_specialdown(num, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
            }
        } else if (this.mouse_mode === "move") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "polygon") {
                this.re_polygonmove(num);
            } else if (this.drawing && this.point[num].type === 0 && num != this.last) {
                this.re_special(num, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
            }
        } else if (this.mouse_mode === "up") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "polygon") {
                if (this.point[num].use === 1) {
                    if (this.point[num].type === 0) {
                        this.re_specialup(num, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
                    }
                }
                this.drawing = false;
                this.last = -1;
                this.redraw();
            }
        } else if (this.mouse_mode === "out") {
            this.re_specialup(this.last, this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]);
            this.drawing = false;
            this.last = -1;
            this.redraw();
        }
    }

    re_specialdown(num, arr) {
        this.record(arr, -1);
        this[this.mode.qa][arr].push([num]);
        this.drawing = true;
        this.last = num;
    }

    re_special(num, arr) {
        if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1 || this.point[num].adjacent_dia.indexOf(parseInt(this.last)) != -1) { // If they are adjacent
            if (this[this.mode.qa][arr].slice(-1)[0].slice(-2)[0] === num) {
                this[this.mode.qa][arr].slice(-1)[0].pop();
            } else {
                this[this.mode.qa][arr].slice(-1)[0].push(num);
            }
            this.last = num;
        }
        if (this[this.mode.qa][arr].slice(-1)[0] && this[this.mode.qa][arr].slice(-1)[0].length > 1) {
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"][arr][this[this.mode.qa][arr].length - 1] = this.get_customcolor();
            }
        }
        this.redraw();
    }

    re_specialup(num, arr) {
        if (this[this.mode.qa][arr].slice(-1)[0] && this[this.mode.qa][arr].slice(-1)[0].length === 1) {
            this[this.mode.qa][arr].pop();
            for (var i = this[this.mode.qa][arr].length - 1; i >= 0; i--) {
                if (this[this.mode.qa][arr][i][0] === num) {
                    this.record(arr, i);
                    this[this.mode.qa][arr][i] = [];
                    if (document.getElementById("custom_color_yes").checked) {
                        this[this.mode.qa + "_col"][arr][i] = [];
                    }
                    break;
                }
            }
        }
    }

    re_polygonmove(num) {
        var arr = "polygon";
        this.freelinecircle_g[1] = num;
        if (this.drawing) {
            this[this.mode.qa][arr].slice(-1)[0][this[this.mode.qa][arr].slice(-1)[0].length - 1] = num;
            if (document.getElementById("custom_color_yes").checked) {
                this[this.mode.qa + "_col"][arr][this[this.mode.qa][arr].length - 1] = this.get_customcolor();
            }
        }
        this.redraw();
    }

    re_polygondown(num) {
        var arr = "polygon";
        if (!this.drawing) {
            /* //1マス目をクリックすると消える機能
            for (var i=this[this.mode.qa][arr].length-1;i>=0;i--){
              if(this[this.mode.qa][arr][i][0]===num){
                this.record(arr,i);
                this[this.mode.qa][arr][i] = [];
                return;
              }
            }
            */
            this.drawing = true;
            this.record(arr, -1);
            this[this.mode.qa][arr].push([num, num]);
        } else if (this.drawing) {
            if (num != this[this.mode.qa][arr].slice(-1)[0][0] && num != this[this.mode.qa][arr].slice(-1)[0][this[this.mode.qa][arr].slice(-1)[0].length - 2]) {
                this[this.mode.qa][arr].slice(-1)[0].push(num);
            } else {
                this[this.mode.qa][arr].slice(-1)[0].pop();
                this.drawing = false;
            }
        }
    }

    //////////////////////////
    // board
    //////////////////////////

    mouse_board(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.drawing = true;
            this.re_board(num);
        } else if (this.mouse_mode === "move") {
            this.re_boardmove(num);
            this.last = num;
        } else if (this.mouse_mode === "up") {
            this.drawing = false;
            this.last = -1;
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.last = -1;
        }
    }

    re_board(num) {
        var index = this.centerlist.indexOf(num);
        if (index === -1) {
            this.centerlist.push(num);
            this.drawing_mode = 1;
        } else {
            this.centerlist.splice(index, 1);
            this.drawing_mode = 0;
        }
        this.make_frameline();
        this.redraw();
    }

    re_boardmove(num) {
        if (this.drawing && this.last != num) {
            var index = this.centerlist.indexOf(num);
            if (this.drawing_mode === 1 && index === -1) {
                this.centerlist.push(num);
            } else if (this.drawing_mode === 0 && index != -1) {
                this.centerlist.splice(index, 1);
            }
            this.make_frameline();
            this.redraw();
        }
    }

    //////////////////////////
    // move
    //////////////////////////

    mouse_move(x, y, num) {
        if (this.mouse_mode === "down_left") {
            this.re_movedown(num);
        } else if (this.mouse_mode === "move") {
            if (this.drawing) {
                this.re_movemove(num);
            }
            this.redraw();
        } else if (this.mouse_mode === "up") {
            if (this.last != -1) {
                this.record("move", [this.start_point, num]);
                this.drawing = false;
                this.start_point = {};
                this.last = -1;
            }
        } else if (this.mouse_mode === "out") {
            if (this.drawing) {
                this.record("move", [this.start_point, this.last]);
                this.drawing = false;
                this.start_point = {};
                this.last = -1;
            }
        }
    }

    re_movedown(num) {
        var array_list = {};
        if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1") {
            array_list = ["number", "symbol"];
        } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
            array_list = ["number"];
        } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
            array_list = ["symbol"];
        }

        for (var array of array_list) {
            if (this[this.mode.qa][array][num]) {
                this.drawing = true;
                this.start_point[array] = num;
                this.last = num;
                this.cursol = num;
            }
        }
    }

    re_movemove(num) {
        var array_list;
        var array_list_record = [];
        var flag = 1;

        this.cursol = num;

        if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1") {
            array_list = ["number", "symbol"];
        } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
            array_list = ["number"];
        } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
            array_list = ["symbol"];
        }
        for (var array in this.start_point) {
            if (this[this.mode.qa][array][num]) {
                flag = 0;
            }
        }
        if (flag === 1) {
            for (var array of array_list) {
                if (!this.start_point[array] && this[this.mode.qa][array][this.cursol]) {
                    this.start_point[array] = this.cursol;
                }
            }
            for (var array in this.start_point) {
                if (this[this.mode.qa][array][this.last]) {
                    this[this.mode.qa][array][this.cursol] = this[this.mode.qa][array][this.last];
                    delete this[this.mode.qa][array][this.last];
                }
            }
            this.last = this.cursol;
        }
        this.redraw();
    }

    //////////////////////////
    // combi nation
    //////////////////////////

    mouse_combi(x, y, num) {
        switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
            case "linex":
            case "edgex":
                if (this.mouse_click === 2 || this.ondown_key === "touchstart") {
                    num = this.coord_p_edgex(x, y, 0.3);
                } else {
                    num = this.coord_p_edgex(x, y, 0.01);
                }
                break;
            case "edgexoi":
            case "tents":
                if (this.mouse_mode === "down_right" || this.ondown_key === "touchstart") {
                    num = this.coord_p_edgex(x, y, 0.3);
                } else {
                    num = this.coord_p_edgex(x, y, 0.01);
                }
                break;
        }
        if (this.mouse_mode === "down_left") {
            switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                case "blpo":
                    this.re_combi_blpo(num);
                    break;
                case "blwh":
                    this.re_combi_blwh(num);
                    break;
                case "shaka":
                    this.re_combi_shaka(x, y, num);
                    break;
                case "linex":
                    if (this.ondown_key === "touchstart") {
                        this.re_combi_cross_downright(num);
                    } else {
                        this.re_combi_linex(num);
                    }
                    break;
                case "lineox":
                    this.re_combi_lineox(num);
                    break;
                case "edgex":
                    if (this.ondown_key === "touchstart") {
                        this.re_combi_cross_downright(num, "lineE");
                    } else {
                        this.re_combi_edgex(num);
                    }
                    break;
                case "edgexoi":
                    if (this.ondown_key === "touchstart") {
                        this.re_combi_cross_downright(num, "lineE");
                    } else {
                        this.re_combi_edgexoi(num);
                    }
                    break;
                case "yajilin":
                    this.re_combi_yajilin(num);
                    break;
                case "hashi":
                    this.re_combi_hashi(num);
                    break;
                case "edgesub":
                    this.re_combi_edgesub(num);
                    break;
                case "battleship":
                    this.re_combi_battleship(num);
                    break;
                case "star":
                    if (this.ondown_key === "mousedown") { // do only star when on laptop
                        this.re_combi_star_reduced(num);
                    } else {
                        this.re_combi_star(num); // Behave as normal when ipad and phone
                    }
                    break;
                case "tents":
                    if (this.ondown_key === "touchstart") {
                        this.re_combi_cross_downright(num);
                    } else {
                        this.re_combi_tents(num);
                    }
                    break;
                case "magnets":
                    this.re_combi_magnets(num);
                    break;
                case "arrowS":
                    this.re_combi_arrowS(x, y, num);
                    break;
                case "numfl":
                    this.re_combi_numfl(x, y, num);
                    break;
                case "alfl":
                    this.re_combi_alfl(x, y, num);
                    break;
            }
        } else if (this.mouse_mode === "down_right") {
            switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                case "linex":
                    this.re_combi_cross_downright(num);
                    break;
                case "edgex":
                case "edgexoi":
                    this.re_combi_cross_downright(num, "lineE");
                    break;
                case "tents":
                    this.re_combi_cross_downright(num);
                    break;
                case "yajilin":
                    this.re_combi_yajilin_downright(num);
                    break;
                case "star":
                    this.re_combi_star_downright(num);
                    break;
            }
        } else if (this.mouse_mode === "move") {
            switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                case "blpo":
                    this.re_combi_blpo_move(num);
                    break;
                case "blwh":
                    this.re_combi_blwh_move(num);
                    break;
                case "shaka":
                    this.re_combi_shaka_move(x, y, num);
                    break;
                case "linex":
                    this.re_combi_linex_move(num);
                    break;
                case "lineox":
                    this.re_combi_lineox_move(num);
                    break;
                case "edgex":
                    this.re_combi_edgex_move(num);
                    break;
                case "edgexoi":
                    this.re_combi_edgexoi_move(num);
                    break;
                case "yajilin":
                    this.re_combi_yajilin_move(num);
                    break;
                case "hashi":
                    this.re_combi_hashi_move(num);
                    break;
                case "edgesub":
                    this.re_combi_edgesub_move(num);
                    break;
                case "battleship":
                    this.re_combi_battleship_move(num);
                    break;
                case "star":
                    this.re_combi_star_move(num);
                    break;
                case "tents":
                    this.re_combi_tents_move(num);
                    break;
                case "arrowS":
                    this.re_combi_arrowS_move(x, y, num);
                    break;
                case "numfl":
                    this.re_combi_numfl_move(x, y, num);
                    break;
                case "alfl":
                    this.re_combi_alfl_move(x, y, num);
                    break;
            }
        } else if (this.mouse_mode === "up") {
            switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                case "blpo":
                case "blwh":
                case "linex":
                case "hashi":
                case "battleship":
                case "star":
                case "magnets":
                    this.drawing_mode = -1;
                    break;
                case "edgesub":
                    this.drawing_mode = -1;
                    this.drawing_move = -1;
                    this.last = -1;
                    break;
                case "lineox":
                    this.re_combi_lineox_up(num);
                    break;
                case "edgex":
                    this.re_combi_edgex_up(num);
                    break;
                case "edgexoi":
                    this.re_combi_edgexoi_up(num);
                    break;
                case "yajilin":
                    if (this.ondown_key === "mousedown") {
                        this.re_combi_yajilin_up_reduced(num); // moved the dot to right click
                    } else {
                        this.re_combi_yajilin_up(num); // on ipad/mobile behave as usual
                    }
                    break;
                case "tents":
                    this.re_combi_tents_up(num);
                    break;
                case "shaka":
                    this.re_combi_shaka_up(num);
                    break;
                case "arrowS":
                    this.re_combi_arrowS_up(num);
                    break;
                case "numfl":
                    this.re_combi_numfl_up(num);
                    break;
                case "alfl":
                    this.re_combi_alfl_up(num);
                    break;
            }
        } else if (this.mouse_mode === "out") {
            this.drawing = false;
            this.drawing_mode = -1;
            this.last = -1;
        }
    }

    re_combi_blpo(num) {
        if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
            this.record("surface", num);
            this[this.mode.qa].surface[num] = 1;
            this.drawing_mode = 1;
        } else if (this[this.mode.qa].surface[num] === 1) {
            this.record("surface", num);
            delete this[this.mode.qa].surface[num];
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
            this.drawing_mode = 2;
        } else if (this[this.mode.qa].symbol[num][0] === 8) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.drawing_mode = 0;
        }
        this.redraw();
    }

    re_combi_blpo_move(num) {
        if (num != this.last) {
            if (this.drawing_mode === 1) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                }
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 1;
            } else if (this.drawing_mode === 2) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                }
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
            } else if (this.drawing_mode === 0) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                }
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                }
            }
            this.last = num;
        }
        this.redraw();
    }

    re_combi_blwh(num) {
        if ((this.mode.qa === "pu_q") || (this.mode.qa === "pu_a" && !this["pu_q"].symbol[num])) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "circle_M", 2];
                this.drawing_mode = 1;
            } else if (this[this.mode.qa].symbol[num][0] === 1) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [2, "circle_M", 2];
                this.drawing_mode = 2;
            } else if (this[this.mode.qa].symbol[num][0] === 2) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.drawing_mode = 0;
            }
            this.redraw();
        }
    }

    re_combi_blwh_move(num) {
        if ((this.mode.qa === "pu_q") || (this.mode.qa === "pu_a" && !this["pu_q"].symbol[num])) {
            if (this.drawing_mode === 1) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "circle_M", 2];
            } else if (this.drawing_mode === 2) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [2, "circle_M", 2];
            } else if (this.drawing_mode === 0) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                }
            }
            this.redraw();
        }
    }

    re_combi_shaka(x, y, num) {
        if (this.point[num].type === 0) {
            this.last = num;
            this.lastx = x;
            this.lasty = y;
            this.drawing_mode = 1;
        }
    }

    re_combi_shaka_move(x, y, num) {
        var arrowdirection;
        if (this.drawing_mode === 1) {
            if ((x - this.lastx) ** 2 + (y - this.lasty) ** 2 > (0.3 * this.size) ** 2) {
                arrowdirection = this.direction_arrow4(x, y, this.lastx, this.lasty);
            } else {
                return;
            }
            this.record("symbol", this.last);
            if (this[this.mode.qa].symbol[this.last] && this[this.mode.qa].symbol[this.last][0] === arrowdirection && this[this.mode.qa].symbol[this.last][1] === "tri") {
                delete this[this.mode.qa].symbol[this.last];
            } else {
                this[this.mode.qa].symbol[this.last] = [arrowdirection, "tri", 1];
            }
            this.drawing_mode = -1;
            this.last = -1;
            this.redraw();
        }
    }

    re_combi_shaka_up(num) {
        if (this.point[num].type === 0 && this.last === num) {
            if (!this[this.mode.qa].symbol[num] || (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][1] === "tri")) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
            } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 8) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
            }
            this.redraw();
        }
        this.drawing_mode = -1;
        this.last = -1;
    }

    re_combi_linex(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_linex_move(num) {
        if (this.drawing_mode != -1 &&
            this.mouse_click !== 2 &&
            this.point[num].type === 0) {
            var line_style = 3;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "line";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        } else if ((this.point[num].type === 2 || this.point[num].type === 3)) {
            if (this.drawing_mode == 52) {
                if (!this[this.mode.qa].line[num]) { // Insert cross
                    this.record("line", num);
                    this[this.mode.qa].line[num] = 98;
                }
            } else if (this.drawing_mode == 50) {
                if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                    this.record("line", num);
                    delete this[this.mode.qa].line[num];
                }
            }
            this.redraw();
        }
    }

    re_combi_lineox(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
    }

    re_combi_lineox_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 0) {
            var line_style = 3;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "line";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_lineox_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "ox_E", 2];
            } else if (this[this.mode.qa].symbol[num][0] === 1) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [4, "ox_E", 2];
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_cross_downright(num, symboltype = "line") {
        if (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4) {
            if (symboltype === "line") {
                if (!this[this.mode.qa].line[num]) { // Insert cross
                    this.record(symboltype, num);
                    this[this.mode.qa].line[num] = 98;
                    this.drawing_mode = 52;
                } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                    this.record(symboltype, num);
                    delete this[this.mode.qa].line[num];
                    this.drawing_mode = 50;
                }
            } else {
                if (!this[this.mode.qa].lineE[num]) { // Insert cross
                    this.record(symboltype, num);
                    this[this.mode.qa].lineE[num] = 98;
                    this.drawing_mode = 52;
                } else if (this[this.mode.qa].lineE[num] === 98) { // Remove Cross
                    this.record(symboltype, num);
                    delete this[this.mode.qa].lineE[num];
                    this.drawing_mode = 50;
                }
            }
        } else {
            this.drawing_mode = 100;
            this.first = num;
            this.last = num;
        }
        this.redraw();
    }

    re_combi_edgexoi(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_edgexoi_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 1) {
            var line_style = 3;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "lineE";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_edgexoi_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num]) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 7;
            } else if (this[this.mode.qa].surface[num] === 7) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 2;
            } else {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_edgex(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_edgex_move(num) {
        if (this.drawing_mode != -1 &&
            this.mouse_click != 2 &&
            this.point[num].type === 1) {
            var line_style = 3;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "lineE";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        } else if ((this.point[num].type === 2 || this.point[num].type === 3)) {
            if (this.drawing_mode == 52) {
                if (!this[this.mode.qa].lineE[num]) { // Insert cross
                    this.record("lineE", num);
                    this[this.mode.qa].lineE[num] = 98;
                }
            } else if (this.drawing_mode == 50) {
                if (this[this.mode.qa].lineE[num] === 98) { // Remove Cross
                    this.record("lineE", num);
                    delete this[this.mode.qa].lineE[num];
                }
            }
            this.redraw();
        }
    }

    re_combi_edgex_up(num) {
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_yajilin(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_yajilin_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 0) {
            if (this.drawing_mode === 5 && num != this.last) {
                if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                }
            } else if (this.drawing_mode === 6 && num != this.last) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                }
            } else {
                var line_style = 3;
                var array;
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                    array = "line";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                    this.loop_counter = true; // to ignore cross feature when loop is drawn on mobile (to avoid accidental crosses)
                }
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_yajilin_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 1;
            } else if (this[this.mode.qa].surface[num] === 1) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
            }
        } else if (!this.loop_counter &&
            (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4)) {
            if (!this[this.mode.qa].line[num]) { // Insert cross
                this.record('line', num);
                this[this.mode.qa].line[num] = 98;
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record('line', num);
                delete this[this.mode.qa].line[num];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.loop_counter = false;
        this.redraw();
    }

    re_combi_yajilin_up_reduced(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 1;
            } else if (this[this.mode.qa].surface[num] === 1) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 1;
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_yajilin_downright(num) {
        if (this.point[num].type === 0) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.drawing_mode = 5; // placing dots
            } else if (this[this.mode.qa].surface[num] === 1) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.drawing_mode = 5; // placing dots
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.drawing_mode = 6; // removing dots
            }
        } else if (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4) {
            if (!this[this.mode.qa].line[num]) { // Insert cross
                this.record('line', num);
                this[this.mode.qa].line[num] = 98;
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record('line', num);
                delete this[this.mode.qa].line[num];
            }
        }
        this.last = num;
    }

    re_combi_hashi(num) {
        this.drawing_mode = 100;
        this.last = num;
    }

    re_combi_hashi_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 0) {
            var line_style;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "line";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                if (!this[this.mode.qa][array][key]) {
                    line_style = 3;
                } else if (this[this.mode.qa][array][key] === 3 || this[this.mode.qa][array][key] === 30) {
                    line_style = 30;
                } else {
                    line_style = 3;
                }
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_edgesub(num) {
        if (this.point[num].type === 0) {
            this.drawing_mode = 100;
            this.drawing_move = 0;
            this.last = num;
        } else if (this.point[num].type === 1) {
            this.drawing_mode = 100;
            this.drawing_move = 1;
            this.last = num;
        }
        this.redraw();
    }

    re_combi_edgesub_move(num) {
        if (this.drawing_mode != -1 && this.drawing_move === 0 && this.point[num].type === 0) {
            var line_style = 40;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "line";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        } else if (this.drawing_mode != -1 && this.drawing_move === 1 && this.point[num].type === 1) {
            var line_style = 3;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "lineE";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_battleship(num) {
        if (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][1] != "battleship_B") {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [2, "battleship_B", 2];
        } else if (this[this.mode.qa].symbol[num][0] === 8) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.drawing_mode = 2;
        } else {
            var adj = [0, 0, 0, 0, 0];
            for (var i = 0; i < 4; i++) {
                if (this[this.mode.qa].symbol[this.point[num].adjacent[i]] && this[this.mode.qa].symbol[this.point[num].adjacent[i]][1] === "battleship_B" && this[this.mode.qa].symbol[this.point[num].adjacent[i]][0] <= 6) { //隣がバトルシップだったら
                    adj[i] = 1;
                    adj[4] += 1;
                }
            }
            if (adj[4] === 0) {
                this.key_battleship(num, 1);
            } else if (adj[4] === 1) {
                if (adj[0] === 1) {
                    this.key_battleship(num, 6);
                } else if (adj[1] === 1) {
                    this.key_battleship(num, 5);
                } else if (adj[2] === 1) {
                    this.key_battleship(num, 3);
                } else if (adj[3] === 1) {
                    this.key_battleship(num, 4);
                }
            } else {
                this.key_battleship(num, 8);
            }
        }
        this.redraw();
    }

    key_battleship(num, n) {
        this.record("symbol", num);
        if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === n) {
            this[this.mode.qa].symbol[num] = [8, "battleship_B", 2];
            this.drawing_mode = 1;
        } else {
            this[this.mode.qa].symbol[num] = [n, "battleship_B", 2];
        }
    }

    re_combi_battleship_move(num) {
        if (this.drawing_mode === 1 && (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][0] != 8)) {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [8, "battleship_B", 2];
        } else if (this.drawing_mode === 2 && this[this.mode.qa].symbol[num]) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
        }
        this.redraw();
    }

    get_neighbors(num) {
        let col_num = (num % (this.nx0));
        let row_num = parseInt(num / this.nx0);
        let neighbors = [(row_num - 1) * this.nx0 + this.nx0 * this.ny0 + col_num - 1, // top left corner
            (row_num - 1) * this.nx0 + this.nx0 * this.ny0 + col_num, // top right corner
            row_num * this.nx0 + this.nx0 * this.ny0 + col_num - 1, // bottom left corner
            row_num * this.nx0 + this.nx0 * this.ny0 + col_num, // bottom right corner
            (row_num - 1) * this.nx0 + 2 * this.nx0 * this.ny0 + col_num, // top middle
            row_num * this.nx0 + 2 * this.nx0 * this.ny0 + col_num, // bottom middle
            row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num - 1, // left middle
            row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num // right middle
        ]
        return neighbors;
    }

    re_combi_star_reduced(num) {
        if (this.point[num].type === 0) {
            if (!this[this.mode.qa].symbol[num]) {
                if (this.undoredo_counter > 3) {
                    this.undoredo_counter = 1;
                } else {
                    this.undoredo_counter = this.undoredo_counter + 1;
                }
                let neighbors = this.get_neighbors(num);
                for (let i = 0; i < neighbors.length; i++) {
                    if (this[this.mode.qa].symbol[neighbors[i]]) {
                        this.record("symbol", neighbors[i], this.undoredo_counter);
                        delete this[this.mode.qa].symbol[neighbors[i]];
                    }
                }
                this.record("symbol", num, this.undoredo_counter);
                this[this.mode.qa].symbol[num] = [1, "star", 2];
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.drawing_mode = 2;
            }
            this.redraw();
        }
    }

    re_combi_star(num) {
        switch (this.point[num].type) {
            case 0:
                if (!this[this.mode.qa].symbol[num]) {
                    if (this.undoredo_counter > 3) {
                        this.undoredo_counter = 1;
                    } else {
                        this.undoredo_counter = this.undoredo_counter + 1;
                    }
                    let neighbors = this.get_neighbors(num);
                    for (let i = 0; i < neighbors.length; i++) {
                        if (this[this.mode.qa].symbol[neighbors[i]]) {
                            this.record("symbol", neighbors[i], this.undoredo_counter);
                            delete this[this.mode.qa].symbol[neighbors[i]];
                        }
                    }
                    this.record("symbol", num, this.undoredo_counter);
                    this[this.mode.qa].symbol[num] = [1, "star", 2];
                } else if (this[this.mode.qa].symbol[num][0] === 1) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [0, "star", 2];
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.drawing_mode = 2;
                }
                this.redraw();
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                if (!this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [12, "circle_SS", 2];
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                }
                this.redraw();
                break;
        }
    }

    re_combi_star_downright(num) {
        switch (this.point[num].type) {
            case 0:
                if (!this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [0, "star", 2];
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.drawing_mode = 2;
                }
                this.redraw();
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                if (!this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [12, "circle_SS", 2];
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                }
                this.redraw();
                break;
        }
    }

    re_combi_star_move(num) {
        if (this.point[num].type === 0) {
            if (this.drawing_mode === 1 &&
                (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][0] != 0)) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [0, "star", 2];
            } else if (this.drawing_mode === 2 && this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
            }
            this.redraw();
        }
    }

    re_combi_tents(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_tents_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 0) {
            var line_style = 3;
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "line";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_tents_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [2, "tents", 2];
            } else if (this[this.mode.qa].symbol[num][0] === 2) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_magnets(num) {
        if (!this[this.mode.qa].symbol[num] && this[this.mode.qa].surface[num] != 1) {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [2, "math_G", 2];
        } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 2) {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [3, "math_G", 2];
        } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 3) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.record("surface", num);
            this[this.mode.qa].surface[num] = 1;
        } else if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] == 1) {
            this.record("surface", num);
            delete this[this.mode.qa].surface[num];
        }
        this.redraw();
    }

    re_combi_arrowS_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (this[this.mode.qa].symbol[this.last] && this[this.mode.qa].symbol[this.last][1] === "arrow_S") {
                this.record("symbol", this.last);
                delete this[this.mode.qa].symbol[this.last];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_arrowS(x, y, num) {
        if (this.point[num].type === 0) {
            this.first = num;
            this.last = num;
            this.lastx = x;
            this.lasty = y;
            this.drawing_mode = 1;
        }
    }

    re_combi_arrowS_move(x, y, num) {
        if (this.drawing_mode === 1) {
            var arrowdirection;
            if ((x - this.lastx) ** 2 + (y - this.lasty) ** 2 > (0.3 * this.size) ** 2) {
                arrowdirection = this.direction_arrow8(x, y, this.lastx, this.lasty);
            } else {
                return;
            }
            var a = [3, 1, 5, 7, 2, 4, 8, 6];
            this.record("symbol", this.last);
            this[this.mode.qa].symbol[this.last] = [a[arrowdirection], "arrow_S", 2];
            this.drawing_mode = -1;
            this.last = -1;
            this.redraw();
        }
    }

    re_combi_numfl_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].number[this.last] || this[this.mode.qa].number[this.last][0] != "5") {
                this.record("number", this.last);
                this[this.mode.qa].number[this.last] = ["5", 2, "1"];
            } else {
                this.record("number", this.last);
                delete this[this.mode.qa].number[this.last];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_numfl(x, y, num) {
        if (this.point[num].type === 0) {
            this.first = num;
            this.last = num;
            this.lastx = x;
            this.lasty = y;
            this.drawing_mode = 1;
        }
    }

    re_combi_numfl_move(x, y, num) {
        if (this.drawing_mode === 1) {
            var arrowdirection;
            if ((x - this.lastx) ** 2 + (y - this.lasty) ** 2 > (0.3 * this.size) ** 2) {
                arrowdirection = this.direction_num8(x, y, this.lastx, this.lasty);
            } else {
                return;
            }
            var a = ["4", "1", "2", "3", "6", "9", "8", "7"];
            this.record("number", this.last);
            this[this.mode.qa].number[this.last] = [a[arrowdirection], 2, "1"];
            this.drawing_mode = -1;
            this.last = -1;
            this.redraw();
        }
    }

    re_combi_alfl_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].number[this.last] || this[this.mode.qa].number[this.last][0] != "E") {
                this.record("number", this.last);
                this[this.mode.qa].number[this.last] = ["E", 2, "1"];
            } else {
                this.record("number", this.last);
                delete this[this.mode.qa].number[this.last];
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_alfl(x, y, num) {
        if (this.point[num].type === 0) {
            this.first = num;
            this.last = num;
            this.lastx = x;
            this.lasty = y;
            this.drawing_mode = 1;
        }
    }

    re_combi_alfl_move(x, y, num) {
        if (this.drawing_mode === 1) {
            var arrowdirection;
            if ((x - this.lastx) ** 2 + (y - this.lasty) ** 2 > (0.3 * this.size) ** 2) {
                arrowdirection = this.direction_num8(x, y, this.lastx, this.lasty);
            } else {
                return;
            }
            var a = ["D", "A", "B", "C", "F", "-", "H", "G"];
            this.record("number", this.last);
            this[this.mode.qa].number[this.last] = [a[arrowdirection], 2, "1"];
            this.drawing_mode = -1;
            this.last = -1;
            this.redraw();
        }
    }

    direction_num8(x, y, x0, y0) {
        var angle = Math.atan2(y - y0, x - x0) * 360 / 2 / Math.PI;
        var a;
        if (angle < -157.5 || angle > 157.5) {
            a = 0;
        } else if (angle > -157.5 && angle < -112.5) {
            a = 1;
        } else if (angle > -112.5 && angle < -67.5) {
            a = 2;
        } else if (angle > -67.5 && angle < -22.5) {
            a = 3;
        } else if (angle > -22.5 && angle < 22.5) {
            a = 4;
        } else if (angle > 22.5 && angle < 67.5) {
            a = 5;
        } else if (angle > 67.5 && angle < 112.5) {
            a = 6;
        } else if (angle > 112.5 && angle < 157.5) {
            a = 7;
        }
        return a;
    }

    /////////////////////////////////
    //   draw
    /////////////////////////////////


    redraw() {
        this.flushcanvas();
        panel_pu.draw_panel();
        this.draw();
        this.set_redoundocolor();
        this.check_solution();
    }

    set_redoundocolor() {
        if (this.mode.qa === "pu_q") {
            if (this.pu_q.command_redo.__a.length === 0) {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_redo').style.color = Color.GREY_LIGHT;
                } else {
                    document.getElementById('tb_redo').style.color = Color.GREY_DARK_VERY;
                }
            } else {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_redo').style.color = Color.BLACK;
                } else {
                    document.getElementById('tb_redo').style.color = Color.WHITE;
                }
            }
            if (this.pu_q.command_undo.__a.length === 0) {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_undo').style.color = Color.GREY_LIGHT;
                } else {
                    document.getElementById('tb_undo').style.color = Color.GREY_DARK_VERY;
                }
            } else {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_undo').style.color = Color.BLACK;
                } else {
                    document.getElementById('tb_undo').style.color = Color.WHITE;
                }
            }
        } else {
            if (this.pu_a.command_redo.__a.length === 0) {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_redo').style.color = Color.GREY_LIGHT;
                } else {
                    document.getElementById('tb_redo').style.color = Color.GREY_DARK_VERY;
                }
            } else {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_redo').style.color = Color.BLACK;
                } else {
                    document.getElementById('tb_redo').style.color = Color.WHITE;
                }
            }
            if (this.pu_a.command_undo.__a.length === 0) {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_undo').style.color = Color.GREY_LIGHT;
                } else {
                    document.getElementById('tb_undo').style.color = Color.GREY_DARK_VERY;
                }
            } else {
                if (document.getElementById('light_mode').checked) {
                    document.getElementById('tb_undo').style.color = Color.BLACK;
                } else {
                    document.getElementById('tb_undo').style.color = Color.WHITE;
                }
            }
        }
    }

    flushcanvas() {
        this.ctx.fillStyle = Color.WHITE;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    draw() {
        return; //override
    }

    draw_frame() {
        for (var i in this.frame) {
            if (this.frame[i] && !this.pu_q.deletelineE[i]) {
                set_line_style(this.ctx, this.frame[i]);
                var i1 = i.split(",")[0];
                var i2 = i.split(",")[1];
                this.ctx.beginPath();
                this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
                this.ctx.stroke();
            }
        }
    }

    draw_frameBold() {
        /*frame-B*/
        for (var i in this.frame) {
            if (this.frame[i] === 2 && !this.pu_q.deletelineE[i]) {
                set_line_style(this.ctx, this.frame[i]);
                var i1 = i.split(",")[0];
                var i2 = i.split(",")[1];
                this.ctx.beginPath();
                this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
                this.ctx.stroke();
            }
        }
    }

    draw_polygonsp(pu) {
        for (var i = 0; i < this[pu].polygon.length; i++) {
            if (this[pu].polygon[i][0]) {
                this.ctx.setLineDash([]);
                this.ctx.lineCap = "square";
                if (document.getElementById("custom_color_yes").checked && this[pu + "_col"].polygon[i]) {
                    this.ctx.strokeStyle = this[pu + "_col"].polygon[i];
                    this.ctx.fillStyle = this[pu + "_col"].polygon[i];
                } else {
                    this.ctx.strokeStyle = Color.BLACK;
                    this.ctx.fillStyle = Color.BLACK;
                }
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(this.point[this[pu].polygon[i][0]].x, this.point[this[pu].polygon[i][0]].y);
                for (var j = 1; j < this[pu].polygon[i].length; j++) {
                    this.ctx.lineTo(this.point[this[pu].polygon[i][j]].x, this.point[this[pu].polygon[i][j]].y);
                }
                this.ctx.stroke();
                this.ctx.fill();
            }
        }
    }

    draw_freecircle() {
        /*free_circle*/
        if (((this.mode[this.mode.qa].edit_mode === "line" || this.mode[this.mode.qa].edit_mode === "lineE") && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "polygon") {
            this.ctx.setLineDash([]);
            this.ctx.fillStyle = Color.TRANSPARENTBLACK;
            this.ctx.strokeStyle = Color.BLUE_LIGHT;
            this.ctx.lineWidth = 4;
            if (this.freelinecircle_g[0] != -1) {
                this.draw_circle(this.ctx, this.point[this.freelinecircle_g[0]].x, this.point[this.freelinecircle_g[0]].y, 0.3);
            }
            if (this.freelinecircle_g[1] != -1) {
                this.draw_circle(this.ctx, this.point[this.freelinecircle_g[1]].x, this.point[this.freelinecircle_g[1]].y, 0.3);
            }
        }
    }

    draw_cursol() {
        /*cursol*/
        if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol") {
            set_line_style(this.ctx, 99);
            if (this.mode[this.mode.qa].edit_mode === "symbol" && document.getElementById('panel_button').textContent === "ON" && !pu.onoff_symbolmode_list[pu.mode[this.mode.qa].symbol[0]]) {
                this.ctx.strokeStyle = Color.BLUE_DARK_VERY;
            }
            this.ctx.fillStyle = Color.TRANSPARENTBLACK;
            if (this.mode[this.mode.qa].edit_mode === "number" && (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3" || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9")) {
                this.draw_polygon(this.ctx, this.point[this.cursolS].x, this.point[this.cursolS].y, 0.2, 4, 45);
            } else if (document.getElementById('edge_button').textContent === "ON") {
                this.draw_polygon(this.ctx, this.point[this.cursol].x, this.point[this.cursol].y, 0.2, 4, 45);
            } else {
                this.ctx.beginPath();
                this.ctx.moveTo(this.point[this.point[this.cursol].surround[0]].x, this.point[this.point[this.cursol].surround[0]].y);
                for (var j = 1; j < this.point[this.cursol].surround.length; j++) {
                    this.ctx.lineTo(this.point[this.point[this.cursol].surround[j]].x, this.point[this.point[this.cursol].surround[j]].y);
                }
                this.ctx.closePath();
                this.ctx.stroke();
                this.ctx.fill();
            }
        }
    }

    draw_selection() {
        if (this.mode[this.mode.qa].edit_mode === "sudoku") {
            if (this.selection.length === 0) {
                // check if cursor is in centerlist, to avoid border/edge case
                let cursorexist = this.centerlist.indexOf(this.cursol);
                if (cursorexist !== -1) {
                    this.selection.push(this.cursol);
                }
            }

            // Handling rotation and reflection of the grid
            var a = [0, 1, 2, 3],
                c;
            if (this.theta === 90) { a = [3, 0, 1, 2]; } else if (this.theta === 180) { a = [2, 3, 0, 1]; } else if (this.theta === 270) { a = [1, 2, 3, 0]; }
            if (this.reflect[0] === -1) {
                c = a[0];
                a[0] = a[1];
                a[1] = c;
                c = a[2];
                a[2] = a[3];
                a[3] = c;
            }
            if (this.reflect[1] === -1) {
                c = a[0];
                a[0] = a[3];
                a[3] = c;
                c = a[1];
                a[1] = a[2];
                a[2] = c;
            }

            for (var k of this.selection) {
                // Color of selected cell
                // set_surface_style(this.ctx, 13);

                // Shadow for the selected cell
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = Color.ORANGE_TRANSPARENT;

                // Border outline for the selected cell
                set_line_style(this.ctx, 101);
                let offset = 3;
                this.ctx.beginPath();

                for (var j = 0; j < this.point[k].surround.length; j++) {
                    switch (j) {
                        case 0:
                            this.ctx.moveTo(this.point[this.point[k].surround[a[0]]].x + offset, this.point[this.point[k].surround[a[0]]].y + offset);
                            break;
                        case 1:
                            this.ctx.lineTo(this.point[this.point[k].surround[a[1]]].x - offset, this.point[this.point[k].surround[a[1]]].y + offset);
                            break;
                        case 2:
                            this.ctx.lineTo(this.point[this.point[k].surround[a[2]]].x - offset, this.point[this.point[k].surround[a[2]]].y - offset);
                            break;
                        case 3:
                            this.ctx.lineTo(this.point[this.point[k].surround[a[3]]].x + offset, this.point[this.point[k].surround[a[3]]].y - offset);
                            break;
                    }
                }
                this.ctx.closePath();
                // this.ctx.fill();
                this.ctx.stroke();

                // Reset Bluring
                this.ctx.shadowBlur = 0;
                this.ctx.shadowColor = Color.TRANSPARENTBLACK;
            }
        }
    }

    check_solution() {
        if (this.solution) {
            var text = JSON.stringify(this.make_solution());
            if (text === this.solution && this.sol_flag === 0) {
                setTimeout(() => {
                    Swal.fire({
                        title: '<h3 class="wish">Your Solution Is Correct</h3>',
                        html: '<h2 class="wish">Congratulations 🙂</h2>',
                        background: 'url(js/images/new_year.jpg)',
                        icon: 'success',
                        confirmButtonText: 'Hurray!',
                        // timer: 5000
                    })
                }, 20)
                sw_timer.stop();
                // this.mouse_mode = "out";
                // this.mouseevent(0, 0, 0);
                this.sol_flag = 1;
            } else if (text != this.solution && this.sol_flag === 1) { // If the answer changes, check again
                this.sol_flag = 0;
            }
        }
    }

    load_clues() {
        let iostring = document.getElementById("iostring").value;
        let pcolor = 1; //black
        let scolor = 9; //blue, 2 for green

        // Data checking
        // Check if length is a square number
        if (Number.isInteger(Math.sqrt(iostring.length))) {

            // Replace dots with zeros
            iostring = iostring.replace(/\./g, 0);

            let digits = iostring.split("");
            let size = Math.sqrt(iostring.length);

            // check all are digits
            for (var i = 0; i < digits.length; i++) {
                if (isNaN(parseInt(digits[i], 10))) {
                    document.getElementById("iostring").value = "Error: it contains non-numeric characters";
                    return "failed";
                }
            }

            // Data check passed, proceed
            let r_start = parseInt(document.getElementById("nb_space1").value, 10); // over white space
            let c_start = parseInt(document.getElementById("nb_space3").value, 10); // left white space

            // if user has defined the starting cell then use that
            if (document.getElementById("firstcell_row").value !== "") {
                r_start = parseInt(document.getElementById("firstcell_row").value) - 1;
            }
            if (document.getElementById("firstcell_column").value !== "") {
                c_start = parseInt(document.getElementById("firstcell_column").value) - 1;
            }

            if (this.mode.qa === "pu_q") {
                for (var j = r_start; j < (size + r_start); j++) { //  row
                    for (var i = c_start; i < (size + c_start); i++) { // column
                        if (parseInt(digits[j - r_start + i - c_start + (j - r_start) * (size - 1)], 10) !== 0) {
                            this.record("number", (i + 2) + ((j + 2) * this.nx0));
                            this[this.mode.qa].number[(i + 2) + ((j + 2) * this.nx0)] = [digits[j - r_start + i - c_start + (j - r_start) * (size - 1)], pcolor, "1"];
                        }
                    }
                }
            } else if (this.mode.qa === "pu_a") {
                for (var j = r_start; j < (size + r_start); j++) { //  row
                    for (var i = c_start; i < (size + c_start); i++) { // column
                        if (parseInt(digits[j - r_start + i - c_start + (j - r_start) * (size - 1)], 10) !== 0) {
                            if (isNaN(parseInt(this["pu_q"].number[(i + 2) + ((j + 2) * this.nx0)]))) {
                                this.record("number", (i + 2) + ((j + 2) * this.nx0));
                                this[this.mode.qa].number[(i + 2) + ((j + 2) * this.nx0)] = [digits[j - r_start + i - c_start + (j - r_start) * (size - 1)], scolor, "1"];
                            }
                        }
                    }
                }
            }
        } else {
            document.getElementById("iostring").value = "Error: Number of digits is not a perfect square";
            return "failed";
        }
        this.redraw();
    }

    export_clues(size) {
        let outputstring = "";
        let r_start = parseInt(document.getElementById("nb_space1").value, 10); // over white space
        let c_start = parseInt(document.getElementById("nb_space3").value, 10); // left white space

        // if user has defined the starting cell then use that
        if (document.getElementById("firstcell_row").value !== "") {
            r_start = parseInt(document.getElementById("firstcell_row").value) - 1;
        }
        if (document.getElementById("firstcell_column").value !== "") {
            c_start = parseInt(document.getElementById("firstcell_column").value) - 1;
        }

        // If a cell has a digit in both modes, then decide the order in which its considered
        if (this.mode.qa == "pu_q") {
            var mode_order = ["pu_q", "pu_a"];
        } else {
            var mode_order = ["pu_a", "pu_q"];
        }
        for (var j = r_start; j < (size + r_start); j++) { //  row
            for (var i = c_start; i < (size + c_start); i++) { // column

                if (document.getElementById("ignore_pencilmarks").checked) {
                    var ifcondition = [this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)] &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "2") &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "4") &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "5") &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "6") &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "10"),
                        this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)] &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "2") &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "4") &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "5") &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "6") &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "10")
                    ];
                } else {
                    var ifcondition = [this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)] &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "2") &&
                        (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "4"),
                        this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)] &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "2") &&
                        (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] !== "4")
                    ];
                }

                if (ifcondition[0]) {
                    if (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][2] === "7") {
                        var sum = 0,
                            a;
                        for (var k = 0; k < 10; k++) {
                            if (this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][0][k] === 1) {
                                sum += 1;
                                a = k + 1;
                            }
                        }
                        if (sum === 1) {
                            outputstring += a.toString();
                        } else {
                            outputstring += '0';
                        }
                    } else {
                        if (isNaN(parseInt(this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][0]))) {
                            outputstring += '0';
                        } else {
                            outputstring += this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)][0];
                        }
                    }
                } else if (ifcondition[1]) {
                    if (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][2] === "7") {
                        var sum = 0,
                            a;
                        for (var k = 0; k < (size + 1); k++) {
                            if (this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][0][k] === 1) {
                                sum += 1;
                                a = k + 1;
                            }
                        }
                        if (sum === 1) {
                            outputstring += a.toString();
                        } else {
                            outputstring += '0';
                        }
                    } else {
                        if (isNaN(parseInt(this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][0]))) {
                            outputstring += '0';
                        } else {
                            outputstring += this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)][0];
                        }
                    }
                } else {
                    outputstring += '0';
                }
            }
        }

        // Sanity check
        if (outputstring.length === size * size) {
            document.getElementById("iostring").value = outputstring;
            let textarea = document.getElementById("iostring");
            textarea.select();
            let range = document.createRange();
            range.selectNodeContents(textarea);
            let sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            textarea.setSelectionRange(0, 1e5);
            document.execCommand("copy");
        } else {
            document.getElementById("iostring").value = "Error: Some cells have more than 1 digit";
        }
    }

    get_orientation(direction) {
        // direction 'r' 't' 'l' 'b' right/top/left/bottom
        // vertical reflect does not affect top/bottom orientation and horizontal reflect does not affect left/right orientation
        var b, c;
        if (this.theta === 0) {
            b = [0, 1, 2, 3];
        } else if (this.theta === 90) {
            b = [3, 0, 1, 2];
        } else if (this.theta === 180) {
            b = [2, 3, 0, 1];
        } else if (this.theta === 270) {
            b = [1, 2, 3, 0];
        }
        if (this.reflect[0] === -1 && this.reflect[1] === -1) {
            c = b[0];
            b[0] = b[2];
            b[2] = c;
        } else if (this.reflect[0] === -1 && (direction === 'l' || direction === 'r')) {
            c = b[0];
            b[0] = b[2];
            b[2] = c;
        } else if (this.reflect[1] === -1 && (direction === 't' || direction === 'b')) {
            c = b[0];
            b[0] = b[2];
            b[2] = c;
        }
        return b[2];
    }

    get_customcolor() {
        let customcolor = $("#colorpicker_special").spectrum("get");
        return "rgba(" + customcolor._r + "," + customcolor._g + "," + customcolor._b + "," + customcolor._a + ")";
    }
}