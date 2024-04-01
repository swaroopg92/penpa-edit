const MAX_EXPORT_LENGTH = 7360;

class Point {
    constructor(x, y, type, adjacent, surround, use, neighbor = [], adjacent_dia = [], type2 = 0, index = null) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.type2 = type2;
        this.adjacent = adjacent;
        this.adjacent_dia = adjacent_dia;
        this.surround = surround;
        this.neighbor = neighbor;
        this.use = use;
        this.index = index;
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
        if (this.__a.length > 5000) {
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

const COPY_PROPS = ['number', 'symbol', 'surface', 'line', 'lineE'];

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

        // Background image properties
        this.bg_image = null;
        this.bg_image_data = {
            url: null,
            x: 0,
            y: 0,
            width: undefined,
            height: undefined,
            opacity: 100,
            foreground: true,
            mask_white: true,
        };
        this.bg_image_canvas = null;

        // Drawing position
        this.mouse_mode = "";
        this.mouse_click = 0; // 0 for left, 2 for right
        this.mouse_click_last = 0; // 0 for left, 2 for right
        this.selection = [];
        this.cageselection = [];
        this.last = -1;
        this.lastx = -1;
        this.lasty = -1;
        this.first = -1;
        this.start_point = {}; //for move_redo
        this.drawing = false;
        this.drawing_mode = -1;
        this.cursol = 0;
        this.cursolS = 0;
        this.old_selection = null;
        this.rect_select_base = null;
        this.rect_surface_draw = false;
        this.select_remove = false;
        this.surface_remove = false;
        this.panelflag = false;
        this.custom_colors = {};
        // Drawing mode
        this.mmode = ""; // Problem mode
        this.mode = {
            "qa": "pu_q",
            "grid": ["1", "2", "1"], //grid,lattice,out
            "pu_q": {
                "edit_mode": "surface",
                "surface": ["", 1],
                "line": ["1", 2],
                "lineE": ["1", 2],
                "wall": ["", 2],
                "cage": ["1", 10],
                "number": ["1", 1],
                "symbol": ["circle_L", 1],
                "special": ["thermo", ""],
                "board": ["", ""],
                "move": ["1", ""],
                "combi": ["battleship", 3],
                "sudoku": ["1", 1]
            },
            "pu_a": {
                "edit_mode": "surface",
                "surface": ["", 1],
                "line": ["1", 3],
                "lineE": ["1", 3],
                "wall": ["", 3],
                "cage": ["1", 10],
                "number": ["1", 2],
                "symbol": ["circle_L", 1],
                "special": ["thermo", ""],
                "board": ["", ""],
                "move": ["1", ""],
                "combi": ["battleship", 3],
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
        this.gridmax = {
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
        }; // also defined in general.js
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
            ["\"command_replay\"", "z8"],
            ["\"numberS\"", "z1"],
            ["\"freeline\"", "zF"],
            ["\"freelineE\"", "z2"],
            ["\"thermo\"", "zT"],
            ["\"arrows\"", "z3"],
            ["\"direction\"", "zD"],
            ["\"squareframe\"", "z0"],
            ["\"polygon\"", "z5"],
            ["\"deletelineE\"", "z4"],
            ["\"killercages\"", "z6"],
            ["\"nobulbthermo\"", "z7"],
            ["\"__a\"", "z_"],
            ["null", "zO"],
        ];
        this.version = [3, 1, 3]; // Also defined in HTML Script Loading in header tag to avoid Browser Cache Problems
        this.undoredo_disable = false;
        this.comp = false;
        this.multisolution = false;
        this.borderwarning = true;
        this.user_tags = [];
        this.conflicts = new Conflicts(this);
        this.previous_sol = [];
        this.conflict_cells = [];
        this.conflict_cell_values = [];
        this.url = [];
        this.ignored_line_types = {
            2: 1, // Black color
            5: 1, // Grey Color
            80: 1, // Thin
            12: 1, // Dotted
            13: 1 // Fat dots
        };
        this.replaycutoff = 60 * 60 * 1000; // 60 minutes
        this.surface_2_edge_types = ['pentominous', 'araf', 'spiralgalaxies', 'fillomino', 'compass'];
        this.isReplay = false;

        document.addEventListener('copy', (e) => this.copy_handler(e));
        document.addEventListener('cut', (e) => this.cut_handler(e));
        document.addEventListener('paste', (e) => this.paste_handler(e));
    }

    reset_puzzle(p) {
        this[p] = {};
        this[p].command_redo = new Stack();
        this[p].command_undo = new Stack();
        this[p].command_replay = new Stack();
        this[p].surface = {};
        this[p].number = {};
        this[p].numberS = {};
        this[p].symbol = {};
        this[p].freeline = {};
        this[p].freelineE = {};
        this[p].thermo = [];
        this[p].arrows = [];
        this[p].direction = [];
        this[p].squareframe = [];
        this[p].polygon = [];
        this[p].line = {};
        this[p].lineE = {};
        this[p].wall = {};
        this[p].cage = {};
        this[p].deletelineE = {};
        this[p].killercages = [];
        this[p].nobulbthermo = [];
    }

    reset() {
        // Object and Array initialization for problem/solution mode plus their custom colors
        this.reset_puzzle("pu_q");
        this.reset_puzzle("pu_q_col");
        this.reset_puzzle("pu_a");
        this.reset_puzzle("pu_a_col");

        this.frame = {};
        this.freelinecircle_g = [-1, -1];
        this.point = [];
    }

    reset_board() {
        this.reset_puzzle(this.mode.qa);
        this.reset_puzzle(this.mode.qa + "_col");
    }

    reset_arr() {
        switch (this.mode[this.mode.qa].edit_mode) {
            case "surface":
                this[this.mode.qa].surface = {};
                this[this.mode.qa + "_col"].surface = {};
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "4") {
                    this[this.mode.qa].line = {};
                    this[this.mode.qa].freeline = {};
                    this[this.mode.qa + "_col"].line = {};
                    this[this.mode.qa + "_col"].freeline = {};
                } else {
                    for (var i in this[this.mode.qa].line) {
                        if (this[this.mode.qa].line[i] === 98) {
                            delete this[this.mode.qa].line[i];
                        }
                    }
                    for (var i in this[this.mode.qa + "_col"].line) {
                        if (this[this.mode.qa + "_col"].line[i] === 98) {
                            delete this[this.mode.qa + "_col"].line[i];
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
                    for (var i in this[this.mode.qa + "_col"].lineE) {
                        if (this[this.mode.qa + "_col"].lineE[i] === 98) {
                            delete this[this.mode.qa + "_col"].lineE[i];
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    this[this.mode.qa].deletelineE = {};
                    this[this.mode.qa + "_col"].deletelineE = {};
                } else {
                    this[this.mode.qa].lineE = {};
                    this[this.mode.qa].freelineE = {};
                    this[this.mode.qa + "_col"].lineE = {};
                    this[this.mode.qa + "_col"].freelineE = {};
                }
                break;
            case "wall":
                this[this.mode.qa].wall = {};
                this[this.mode.qa + "_col"].wall = {};
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "3") {
                    this[this.mode.qa].number = {};
                    this[this.mode.qa + "_col"].number = {};
                } else {
                    this[this.mode.qa].numberS = {};
                    this[this.mode.qa + "_col"].numberS = {};
                }
                break;
            case "symbol":
                this[this.mode.qa].symbol = {};
                this[this.mode.qa + "_col"].symbol = {};
                break;
            case "cage":
                this[this.mode.qa].cage = {};
                this[this.mode.qa + "_col"].cage = {};
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

    reset_pause_layer() {
        // pause-unpause layer
        let pause_canvas = document.getElementById("pause_canvas");
        let pause_ctx = pause_canvas.getContext("2d");
        let factor = this.resol * 4;
        pause_canvas.style.width = (this.canvasx - factor).toString() + "px";
        pause_canvas.style.height = (this.canvasy - factor).toString() + "px";
        pause_canvas.width = this.resol * this.canvasx;
        pause_canvas.height = this.resol * this.canvasy;
    }

    show_pause_layer() {
        let pause_canvas = document.getElementById("pause_canvas");
        let pause_ctx = pause_canvas.getContext("2d");
        this.reset_pause_layer();

        // set the style and font
        if (UserSettings.color_theme == 1) {
            pause_ctx.fillStyle = Color.BLUE;
        } else {
            pause_ctx.fillStyle = Color.WHITE;
        }
        let font_size = 0.09 * pause_canvas.height; // 9 % of display size/ height of canvas
        pause_ctx.font = font_size + 'px sans-serif';
        let lineheight = 1.2 * font_size;
        let textstring = "Paused\nClick on \"Start\"\nor \"F4\"";
        let lines = textstring.split('\n');
        let textwidth;

        for (var j = 0; j < lines.length; j++) {
            textwidth = pause_ctx.measureText(lines[j]).width;
            pause_ctx.fillText(lines[j], (pause_canvas.width) / 2 - (textwidth / 2), (j + 1) * (pause_canvas.height / (lines.length + 1)));
        }
        pause_canvas.style.display = "inline-block";
    }

    hide_pause_layer() {
        // Clean the pause canvas
        let pause_canvas = document.getElementById("pause_canvas");
        let pause_ctx = pause_canvas.getContext("2d");
        this.reset_pause_layer();
        pause_ctx.fillStyle = Color.TRANSPARENTWHITE;
        pause_ctx.fillRect(0, 0, this.canvasx, this.canvasy);

        pause_canvas.style.display = "none";
    }

    make_frameline() {
        var gr = 1; // Solid line
        var ot = 2; // Thick line
        if (this.mode.grid[0] === "2") {
            gr = 11; // Dotted line
        } else if (this.mode.grid[0] === "3") {
            gr = 0; // No line
        }
        if (this.mode.grid[2] === "2") { // No Frame
            ot = gr; // The line frame is the same line as the inside
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
        this.cellsoutsideFrame = [];
        if (this.grid_is_square()) {
            for (var i = 1; i < this.nx0 - 1; i++) {
                // Cell Center
                let cell_firstrow = i + 1 * this.nx0;
                let cell_lastrow = i + (this.ny0 - 2) * this.nx0;
                this.cellsoutsideFrame.push(cell_firstrow);
                this.cellsoutsideFrame.push(cell_lastrow);

                // Left and Right Edges of first row cell
                let lr_firstrow = this.point[cell_firstrow].neighbor.sort(function(a, b) {
                    return b - a; // Descending
                }).slice(0, 2);
                this.cellsoutsideFrame.push(lr_firstrow[0], lr_firstrow[1]);

                // Left and Right Edges of last row cell
                let lr_lastrow = this.point[cell_lastrow].neighbor.sort(function(a, b) {
                    return b - a; // Descending
                }).slice(0, 2);
                this.cellsoutsideFrame.push(lr_lastrow[0], lr_lastrow[1]);
            }
            for (var j = 1; j < this.ny0 - 1; j++) {
                // Cell Center
                let cell_firstcol = 1 + j * this.nx0;
                let cell_lastcol = this.nx0 - 2 + j * this.nx0;
                this.cellsoutsideFrame.push(cell_firstcol);
                this.cellsoutsideFrame.push(cell_lastcol);

                // Top and bottom Edges of first column cell
                let lr_firstcol = this.point[cell_firstcol].neighbor.sort(function(a, b) {
                    return a - b; // Ascending
                }).slice(0, 2);
                this.cellsoutsideFrame.push(lr_firstcol[0], lr_firstcol[1]);

                // Top and bottom Edges of last column cell
                let lr_lastcol = this.point[cell_lastcol].neighbor.sort(function(a, b) {
                    return a - b; // Ascending
                }).slice(0, 2);
                this.cellsoutsideFrame.push(lr_lastcol[0], lr_lastcol[1]);
            }
        }

        // Remove duplicates
        this.cellsoutsideFrame = [...new Set(this.cellsoutsideFrame.sort(function(a, b) {
            return a - b; // Ascending
        }))]
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
        sign = parseInt(sign);
        if ((this.ny + 1 * sign) <= this.gridmax['square'] && (this.ny + 1 * sign) > 0) {
            this.resize_board('t', sign, celltype);
            this.redraw();
        } else {
            if (sign === 1) {
                errorMsg('Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>');
            } else {
                errorMsg('Min row size reached <h2 class="warn">1</h2>');
            }
        }
    }

    resize_bottom(sign, celltype = 'black') {
        sign = parseInt(sign);
        if ((this.ny + 1 * sign) <= this.gridmax['square'] && (this.ny + 1 * sign) > 0) {
            this.resize_board('b', sign, celltype);
            this.redraw();
        } else {
            if (sign === 1) {
                errorMsg('Max row size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>');
            } else {
                errorMsg('Min row size reached <h2 class="warn">1</h2>');
            }
        }
    }

    resize_left(sign, celltype = 'black') {
        sign = parseInt(sign);
        if ((this.nx + 1 * sign) <= this.gridmax['square'] && (this.nx + 1 * sign) > 0) {
            this.resize_board('l', sign, celltype);
            this.redraw();
        } else {
            if (sign === 1) {
                errorMsg('Max column size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>');
            } else {
                errorMsg('Min column size reached <h2 class="warn">1</h2>');
            }
        }
    }

    resize_right(sign, celltype = 'black') {
        sign = parseInt(sign);
        if ((this.nx + 1 * sign) <= this.gridmax['square'] && (this.nx + 1 * sign) > 0) {
            this.resize_board('r', sign, celltype);
            this.redraw();
        } else {
            if (sign === 1) {
                errorMsg('Max column size reached <h2 class="warn">' + this.gridmax['square'] + '</h2>');
            } else {
                errorMsg('Min column size reached <h2 class="warn">1</h2>');
            }
        }
    }

    make_resize_point_translator(side, sign, originalnx0, originalny0) {
        const stride = originalnx0 * originalny0;
        if (side === 't') {
            // Shift point to the next row
            return (k) => {
                if (k >= 0) {
                    k = parseInt(k);
                    let band = Math.floor(k / stride);
                    let offset = [1, 2, 3, 4, 8, 8, 8, 8, 12, 12, 12, 12][band] * originalnx0 || 0;
                    return k + offset * sign;
                } else {
                    return k;
                }
            }
        }
        if (side === 'b') {
            // Maintain point in the same row
            return (k) => {
                if (k >= 0) {
                    k = parseInt(k);
                    let band = Math.floor(k / stride);
                    let offset = [0, 1, 2, 3, 4, 4, 4, 4, 8, 8, 8, 8][band] * originalnx0 || 0;
                    return k + offset * sign;
                } else {
                    return k;
                }
            }
        }
        if (side === 'l') {
            // Shift point to next column
            return (k) => {
                if (k >= 0) {
                    k = parseInt(k);
                    let factor = Math.floor(k / stride);
                    let typeOffset = [0, 1, 2, 3, 4, 4, 4, 4, 8, 8, 8, 8][factor] || 0;
                    let pointsPerType = [1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4][factor] || 1;
                    let normal_cursor = parseInt((k - typeOffset * stride) / pointsPerType);
                    let offset = (parseInt(normal_cursor / originalnx0) + 1) * pointsPerType + typeOffset * originalny0;
                    return k + offset * sign;
                } else {
                    return k;
                }
            }
        }
        if (side === 'r') {
            // Maintain point in the same column
            return (k) => {
                if (k >= 0) {
                    k = parseInt(k);
                    let factor = Math.floor(k / stride);
                    let typeOffset = [0, 1, 2, 3, 4, 4, 4, 4, 8, 8, 8, 8][factor] || 0;
                    let pointsPerType = [1, 1, 1, 1, 4, 4, 4, 4, 4, 4, 4, 4][factor] || 1;
                    let normal_cursor = parseInt((k - typeOffset * stride) / pointsPerType);
                    let offset = (parseInt(normal_cursor / originalnx0)) * pointsPerType + typeOffset * originalny0;
                    return k + offset * sign;
                } else {
                    return k;
                }
            }
        }
    }

    resize_board(side, sign, celltype = 'black') {
        let originalspace = [...this.space];
        if (celltype === 'white') {
            let spaceSide = ['t', 'b', 'l', 'r'].indexOf(side);
            // Over, under, left, right
            if (sign === 1) {
                this.space[spaceSide] = this.space[spaceSide] + 1;
            } else {
                if (this.space[spaceSide] > 0) {
                    this.space[spaceSide] = this.space[spaceSide] - 1;
                } else if (pu.mode.qa === 'pu_a') {
                    return; // Protect board content
                }
            }
        }
        let originalnx0 = parseInt(this.nx0);
        let originalny0 = parseInt(this.ny0);

        if (side === 't' || side === 'b') {
            this.ny = this.ny + (1 * sign); // Rows, Adding/Removing 1 row
            this.ny0 = this.ny + 4;
            if ((this.get_orientation('t') % 2) === 0) {
                this.height0 = this.ny + 1;
                this.height_c = this.height0;
                this.height = this.height_c;
                this.canvasy = this.height_c * this.size;
            } else {
                this.width0 = this.ny + 1;
                this.width_c = this.width0;
                this.width = this.width_c;
                this.canvasx = this.width_c * this.size;
            }
        } else {
            this.nx = this.nx + (1 * sign); // Columns, Adding/Removing 1 column
            this.nx0 = this.nx + 4;
            if ((this.get_orientation('r') % 2) === 0) {
                this.width0 = this.nx + 1;
                this.width_c = this.width0;
                this.width = this.width_c;
                this.canvasx = this.width_c * this.size;
            } else {
                this.height0 = this.nx + 1;
                this.height_c = this.height0;
                this.height = this.height_c;
                this.canvasy = this.height_c * this.size;
            }
        }

        // Find the missing boxes
        let old_centerlist = this.centerlist;
        let old_idealcenterlist = []; // If no box was missing
        for (let j = 2 + originalspace[0]; j < originalny0 - 2 - originalspace[1]; j++) {
            for (let i = 2 + originalspace[2]; i < originalnx0 - 2 - originalspace[3]; i++) { // the top and left edges are unused
                old_idealcenterlist.push(i + j * originalnx0);
            }
        }
        let boxremove = old_idealcenterlist.filter(x => old_centerlist.indexOf(x) === -1);

        this.create_point();
        this.centerlist = [];
        // Create full centerlist to allow correct board centering
        for (var j = 2; j < this.ny0 - 2; j++) {
            for (var i = 2; i < this.nx0 - 2; i++) {
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

        // Translate function
        const translate_fn = this.make_resize_point_translator(side, sign, originalnx0, originalny0);

        // Reset centerlist to match the margins
        this.centerlist = []
        for (let j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
            for (let i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
                this.centerlist.push(i + j * (this.nx0));
            }
        }
        // Remove Box elements
        for (let n = 0; n < boxremove.length; n++) {
            let num = boxremove[n];
            let m = translate_fn(num);
            let index = this.centerlist.indexOf(m);
            if (index !== -1) {
                this.centerlist.splice(index, 1);
            }
        }
        this.make_frameline();
        this.translate_puzzle_elements(translate_fn);
    }

    // Universal function to translate all elements in a puzzle:
    // - cursor
    // - selection
    // - conflicts
    // - all pu_q and pu_a puzzle elements
    // - embedded solution (single and multiple)
    // 
    // Currently used for resizing the board.
    // Or in the future to insert or delete a row/col, given the proper translate function.
    translate_puzzle_elements(translate_fn) {
        this.cursol = translate_fn(this.cursol);
        this.cursolS = translate_fn(this.cursolS);
        this.freelinecircle_g[0] = translate_fn(this.freelinecircle_g[0]);
        this.freelinecircle_g[1] = translate_fn(this.freelinecircle_g[1]);
        this.selection = this.selection.map(translate_fn);
        this.conflict_cells = this.conflict_cells.map(translate_fn);

        let pu_qa = ["pu_q", "pu_a", "pu_q_col", "pu_a_col"];

        for (let i of pu_qa) {
            // Translate redo/undo/replay buffer
            for (let commandstack of ['command_redo', 'command_undo', 'command_replay']) {
                for (let a of this[i][commandstack].__a) {
                    if (a && a.length >= 4) {
                        // ['line', '25,39', ... ]
                        if (typeof a[1] === 'string') {
                            a[1] = a[1].split(',').map(translate_fn).join(',');
                        }
                        // ['arrows', -1, [216, ... ], ...]
                        else if (a[1] === -1) {
                            if (a[2]) {
                                for (let a2 in a[2]) {
                                    a[2][a2] = translate_fn(a[2][a2]);
                                }
                            }
                        } else {
                            a[1] = translate_fn(a[1]);
                        }
                    }
                }
            }

            // Translate point features
            for (let feature of ['surface', 'number', 'numberS', 'symbol']) {
                if (this[i][feature]) {
                    let temp = this[i][feature];
                    this[i][feature] = {};
                    let keys = Object.keys(temp);
                    for (let k = 0; k < keys.length; k++) {
                        let m = translate_fn(keys[k]);
                        this[i][feature][m] = temp[keys[k]];
                    }
                }
            }

            // Translate point-pair features
            for (let feature of ['line', 'lineE', 'deletelineE', 'freeline', 'freelineE', 'wall', 'cage']) {
                if (this[i][feature]) {
                    let temp = this[i][feature];
                    this[i][feature] = {};
                    for (let k in temp) {
                        if (k.includes(',')) {
                            let k1 = translate_fn(k.split(",")[0]);
                            let k2 = translate_fn(k.split(",")[1]);
                            let key = (k1.toString() + "," + k2.toString());
                            this[i][feature][key] = temp[k];
                        } else { // Exception for 'x' mark
                            let m = translate_fn(k);
                            this[i][feature][m] = temp[k];
                        }
                    }
                }
            }

            // Translate point array features
            for (let feature of ['thermo', 'nobulbthermo', 'arrows', 'direction', 'squareframe', 'killercages', 'polygon']) {
                if (this[i][feature]) {
                    let temp = this[i][feature];
                    this[i][feature] = new Array(temp.length);
                    for (let k in temp) {
                        if (Array.isArray(temp[k])) {
                            for (let m = 0; m <= (temp[k].length - 1); m++) {
                                temp[k][m] = translate_fn(temp[k][m]);
                            }
                        }
                        this[i][feature][k] = temp[k];
                    }
                }
            }
        }

        // Translate solution
        if (this.solution) {
            let settingstatus_or = document.getElementById("answersetting").getElementsByClassName("solcheck_or");

            if (!this.multisolution) {
                let sol = JSON.parse(this.solution);
                for (let sol_count in sol) {
                    if (sol[sol_count]) {
                        switch (parseInt(sol_count)) {
                            case 0: // shading
                                for (let i in sol[sol_count]) {
                                    sol[sol_count][i] = translate_fn(sol[sol_count][i]).toString();
                                }
                                break;
                            case 1: // Line / FreeLine
                            case 2: // Edge / FreeEdge
                            case 3: // Wall
                                for (let i in sol[sol_count]) {
                                    let parts = sol[sol_count][i].split(",");
                                    parts[0] = translate_fn(parts[0]);
                                    parts[1] = translate_fn(parts[1]);
                                    sol[sol_count][i] = parts.join(",");
                                }
                                break;
                            case 4: // Number
                                for (let i in sol[sol_count]) {
                                    let parts = sol[sol_count][i].split(",");
                                    parts[0] = translate_fn(parts[0]);
                                    sol[sol_count][i] = parts.join(",");
                                }
                                break;
                            case 5: // Symbol
                                for (let i in sol[sol_count]) {
                                    sol[sol_count][i] = translate_fn(sol[sol_count][i]).toString();
                                }
                                break;
                        }
                        sol[sol_count].sort();
                    }
                }
                pu.solution = JSON.stringify(sol);
            } else {
                let sol = this.solution;
                let sol_count = -1; // as list indexing starts at 0

                // loop through and check which "OR" settings are selected
                for (let m = 0; m < settingstatus_or.length; m++) {
                    if (settingstatus_or[m].checked) {

                        // incrementing solution count by 1
                        sol_count++;

                        // Extracting the checkbox id. First 7 chracters "sol_or_" are sliced.
                        let sol_id = settingstatus_or[m].id.slice(7);
                        switch (sol_id) {
                            case "surface":
                                for (let i in sol[sol_count]) {
                                    sol[sol_count][i] = translate_fn(sol[sol_count][i]).toString();
                                }
                                break;
                            case "number":
                                for (let i in sol[sol_count]) {
                                    let parts = sol[sol_count][i].split(",");
                                    parts[0] = translate_fn(parts[0]);
                                    sol[sol_count][i] = parts.join(",");
                                }
                                break;
                            case "loopline":
                            case "loopedge":
                            case "wall":
                                for (let i in sol[sol_count]) {
                                    let parts = sol[sol_count][i].split(",");
                                    parts[0] = translate_fn(parts[0]);
                                    parts[1] = translate_fn(parts[1]);
                                    sol[sol_count][i] = parts.join(",");
                                }
                                break;
                            case "square":
                            case "circle":
                            case "tri":
                            case "arrow":
                            case "math":
                            case "battleship":
                            case "tent":
                            case "star":
                            case "akari":
                            case "mine":
                                for (let i in sol[sol_count]) {
                                    sol[sol_count][i] = translate_fn(sol[sol_count][i]).toString();
                                }
                                break;
                        }
                        sol[sol_count].sort();
                    }
                }
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
            if (this.point[i].use !== -1) {
                if (this.point[i].x < this.margin || this.point[i].x > this.canvasx - this.margin || this.point[i].y < this.margin || this.point[i].y > this.canvasy - this.margin) {
                    this.point[i].use = 0;
                } else {
                    this.point[i].use = 1;
                }
            }
        }
    }

    canvasxy_update() { //space for imagesave
        this.size = UserSettings.displaysize;
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
            if (document.getElementById("nb_title1").checked || document.getElementById("nb_rules1").checked) {
                resizedCanvas = this.canvaswithinfo();
            }
            var canvastext = resizedCanvas.toDataURL("image/png");
        } else if (document.getElementById("nb_type2").checked) {
            if (document.getElementById("nb_title1").checked || document.getElementById("nb_rules1").checked) {
                resizedCanvas = this.canvaswithinfo();
            }
            var canvastext = resizedCanvas.toDataURL("image/jpeg");
        } else if (document.getElementById("nb_type3").checked) {
            var svg_canvas = new C2S(this.canvasx, this.canvasy);
            svg_canvas.text = function(text, x, y, width = 1e4) {
                var fontsize = parseFloat(this.font.split("px")[0]);
                this.strokeText(text, x, y + 0.28 * fontsize, width);
                this.fillText(text, x, y + 0.28 * fontsize, width);
            };
            svg_canvas.arrow = function(startX, startY, endX, endY, controlPoints) {
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

            var old_canvas = this.ctx;
            this.ctx = svg_canvas;
            this.redraw(true); // Reflects SVG elements
            this.ctx = old_canvas;

            this.mode[this.mode.qa].edit_mode = mode; // retain original mode
            if (document.getElementById("nb_margin2").checked) {
                this.canvasx = cx;
                this.canvasy = cy;
                this.point_move(xl, yu, 0);
                this.canvas_size_setting();
            }
            this.redraw(); // Back to original display

            return svg_canvas.getSerializedSvg(true);
        }
        this.mode[this.mode.qa].edit_mode = mode; // retain original mode

        if (document.getElementById("nb_margin2").checked) {
            this.canvasx = cx;
            this.canvasy = cy;
            this.point_move(xl, yu, 0);
            this.canvas_size_setting();
        }
        this.redraw();
        return canvastext;
    }

    canvaswithinfo() {
        //put the title text on the top
        let main_c = $('#canvas')[0];
        let main_ctx = main_c.getContext("2d");

        let gif_c = document.createElement('canvas');
        let gif_ctx = gif_c.getContext("2d");

        let fontSize = 16;
        let fontLineSize = fontSize * 1.2;
        gif_ctx.font = "bold " + fontSize + "px sans-serif";
        let puzzleTitle = 'Title: ' + document.getElementById("saveinfotitle").value;
        let puzzleRules = document.getElementById("saveinforules").value;
        let puzzleTitleLines = this.splitTextLines(gif_ctx, puzzleTitle, main_c.offsetWidth);
        let puzzleRulesLines = this.splitTextLines(gif_ctx, puzzleRules, main_c.offsetWidth);
        let puzzleAuthor = ('Author: ' + document.getElementById("saveinfoauthor").value).split(",");
        var puzzletext;
        if (document.getElementById("nb_title1").checked && document.getElementById("nb_rules1").checked) {
            puzzletext = puzzleTitleLines.concat(puzzleAuthor.concat(puzzleRulesLines));
        } else if (document.getElementById("nb_title1").checked) {
            puzzletext = puzzleTitleLines.concat(puzzleAuthor);
        } else {
            puzzletext = puzzleRulesLines;
        }

        let gif_vertical_offset = puzzletext.length * fontLineSize;
        gif_c.width = main_c.offsetWidth;
        gif_c.height = main_c.offsetHeight + gif_vertical_offset;
        gif_ctx.font = "bold " + fontSize + "px sans-serif";

        //clear the gif canvas
        gif_ctx.fillStyle = "#fff";
        gif_ctx.fillRect(0, 0, gif_c.width, gif_c.height);

        //draw the title text.
        gif_ctx.fillStyle = "#0000ff";
        let textY = fontSize;
        for (let textLine of puzzletext) {
            gif_ctx.fillText(textLine, (gif_c.width - gif_ctx.measureText(textLine).width) / 2, textY);
            textY += fontLineSize;
        }

        gif_ctx.drawImage(main_c, 0, 0, main_c.width, main_c.height, 0, gif_vertical_offset, gif_c.width, gif_c.height - gif_vertical_offset);
        return gif_c;
    }

    splitTextLines(ctx, text, maxWidth) {
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

    grid_is_square() {
        return (this.gridtype == "square" || this.gridtype == "kakuro" || this.gridtype == "sudoku");
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
        this.submode_check('sub_' + mode + this.mode[this.mode.qa][mode][0]);
        if (mode === "symbol" && !this.panelflag) {
            // Show the panel on the first time landing and then respect user's choice
            UserSettings.panel_shown = true;
            this.panelflag = true;
        } else if ((mode === "number" || mode === "symbol" || mode === "sudoku") &&
            ((this.ondown_key === "touchstart") || (loadtype === "url" && window.ondown_key === "touchstart"))) {
            // Automatically show panel while in number or shape or sudoku mode on the Mobile/Ipad device
            UserSettings.panel_shown = true;
        } else if (this.ondown_key === "touchstart") {
            // Turn off panel while switching to other modes on Mobile/Ipad
            UserSettings.panel_shown = false;
        }
        const submode = this.mode[this.mode.qa][mode][0];
        const style = this.mode[this.mode.qa][mode][1];
        this.stylemode_check('st_' + mode + style);
        if (mode === "symbol") {
            this.subsymbolmode(submode);
        } else if (mode === "combi") {
            this.subcombimode(submode);
        }
        if (UserSettings.custom_colors_on && penpa_modes[this.gridtype].customcolor.includes(mode)) {
            let cc = this.mode[this.mode.qa][mode][2];
            if (cc) {
                $("#colorpicker_special").spectrum("set", cc);
            }
            document.getElementById('style_special').style.display = 'inline';
        } else {
            document.getElementById('style_special').style.display = 'none';
        }

        // If panel is ON, show Mode info on header
        document.getElementById('float-key-header-lb').innerHTML = "Mode: " + mode_names[mode];

        if (mode === "number") {
            // Update cursolS after mode switch, because it is not set in all modes.
            pu.cursolS = 4 * (pu.cursol + pu.nx0 * pu.ny0);
            let isNumberS = ["3", "9", "11"].includes(pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0])
            let enableLoadButton = (!isNumberS && pu[pu.mode.qa].number[pu.cursol]) || (isNumberS && pu[pu.mode.qa].numberS[pu.cursolS]);
            document.getElementById("closeBtn_input3").disabled = !enableLoadButton;
        }
        this.redraw();
    }

    number_multi_enabled() {
        let edit_mode = this.mode[this.mode.qa].edit_mode;
        let submode = this.mode[this.mode.qa][edit_mode][0];
        return (edit_mode === "number" && !["2"].includes(submode));
    }

    set_custom_color(name) {
        if (UserSettings.custom_colors_on) {
            // set the custom color to default
            let cc = this.custom_colors[name];
            if (cc === undefined)
                cc = CustomColor.default_stylemode_color(name);
            if (cc) {
                $("#colorpicker_special").spectrum("set", cc);
            }
        }
    }

    submode_check(name) {
        if (document.getElementById(name)) {
            document.getElementById(name).checked = true;
            this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] = document.getElementById(name).value;
            this.cursolcheck(); // override

            if (pu.mode[pu.mode.qa].edit_mode === "number") {
                let isNumberS = ["3", "9", "11"].includes(pu.mode[pu.mode.qa][pu.mode[pu.mode.qa].edit_mode][0])
                let enableLoadButton = (!isNumberS && pu[pu.mode.qa].number[pu.cursol]) || (isNumberS && pu[pu.mode.qa].numberS[pu.cursolS]);
                document.getElementById("closeBtn_input3").disabled = !enableLoadButton;
            }
            this.redraw(); // Board cursor update
        }
        this.type = this.type_set(); // Coordinate type to select
        this.set_custom_color(name);
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
        this.set_custom_color(name);
    }

    subsymbolmode(mode) {
        this.mode[this.mode.qa].symbol[0] = mode;
        document.getElementById("symmode_content").innerHTML = mode;
        if (UserSettings.custom_colors_on) {
            // set the custom color to default
            let cc = CustomColor.default_symbol_color(mode);
            $("#colorpicker_special").spectrum("set", cc);
        }
        panel_pu.draw_panel();
        this.redraw();
    }

    subcombimode(mode) {
        this.mode[this.mode.qa].combi[0] = mode;
        document.getElementById("combimode_content").innerHTML = mode;

        // Display line/edge style selector for appropriate modes
        let line_style = 'none', edge_style = 'none';
        if (mode === "linex" || mode === "lineox" || mode === "linedir" || mode === "yajilin" ||
                mode === "rassisillai" || mode === "tents")
            line_style = 'inline-block';
        else if (mode === "edgex" || mode === "edgexoi")
            edge_style = 'inline-block';
        document.getElementById('style_line').style.display = line_style;
        document.getElementById('style_lineE').style.display = edge_style;

        // Set default style for line/edge for older puzzle data
        if (this.mode[this.mode.qa].combi[1] === "") {
            if (line_style !== 'none') {
                this.mode[this.mode.qa].combi[1] = 3;
                this.stylemode_check('st_line3');
            } else if (edge_style !== 'none') {
                this.mode[this.mode.qa].combi[1] = 3;
                this.stylemode_check('st_edge3');
            }
        }

        if (UserSettings.custom_colors_on) {
            // set the custom color to default
            let cc = CustomColor.default_combimode_color(mode);
            $("#colorpicker_special").spectrum("set", cc);
        }
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
        document.getElementById('mode_cage').style.display = 'none';
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
                if (UserSettings.custom_colors_on) {
                    this[this.mode.qa + "_col"].surface = {};
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] != "4") {
                    for (var i in this[this.mode.qa].line) {
                        if (this[this.mode.qa].line[i] !== 98) {
                            delete this[this.mode.qa].line[i];
                            if (UserSettings.custom_colors_on) {
                                delete this[this.mode.qa + "_col"].line[i];
                            }
                        }
                    }
                    this[this.mode.qa].freeline = {};
                    if (UserSettings.custom_colors_on) {
                        this[this.mode.qa + "_col"].freeline = {};
                    }
                } else {
                    for (var i in this[this.mode.qa].line) {
                        if (this[this.mode.qa].line[i] === 98) {
                            delete this[this.mode.qa].line[i];
                            if (UserSettings.custom_colors_on) {
                                delete this[this.mode.qa + "_col"].line[i];
                            }
                        }
                    }
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    for (var i in this[this.mode.qa].lineE) {
                        if (this[this.mode.qa].lineE[i] === 98) {
                            delete this[this.mode.qa].lineE[i];
                            if (UserSettings.custom_colors_on) {
                                delete this[this.mode.qa + "_col"].lineE[i];
                            }
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    this[this.mode.qa].deletelineE = {};
                    if (UserSettings.custom_colors_on) {
                        this[this.mode.qa + "_col"].deletelineE = {};
                    }
                } else {
                    for (var i in this[this.mode.qa].lineE) {
                        if (this[this.mode.qa].lineE[i] !== 98) {
                            delete this[this.mode.qa].lineE[i];
                            if (UserSettings.custom_colors_on) {
                                delete this[this.mode.qa + "_col"].lineE[i];
                            }
                        }
                    }
                    this[this.mode.qa].freelineE = {};
                    if (UserSettings.custom_colors_on) {
                        this[this.mode.qa + "_col"].freelineE = {};
                    }
                }
                break;
            case "wall":
                this[this.mode.qa].wall = {};
                if (UserSettings.custom_colors_on) {
                    this[this.mode.qa + "_col"].wall = {};
                }
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
                if (UserSettings.custom_colors_on) {
                    this[this.mode.qa + "_col"].symbol = {};
                }
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
                this[this.mode.qa].killercages = [];
                if (UserSettings.custom_colors_on) {
                    this[this.mode.qa + "_col"].cage = {};
                }
                break;
            case "special":
                this[this.mode.qa][this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]] = [];
                if (UserSettings.custom_colors_on) {
                    this[this.mode.qa + "_col"][this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]] = [];
                }
                break;
        }
        this.redraw();
    }

    update_genre_tags() {
        this.user_tags = $('#genre_tags_opt').select2("val");
        pu.redraw();
    }

    ///////SAVE/////////

    __export_text_shared(multisolution) {
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
        let border_status = UserSettings.draw_edges ? 'ON' : 'OFF';
        text += "," + border_status;

        // Multi Solution status, it will be true only when generating solution checking
        text += "," + multisolution;

        // Background image
        text += "," + encrypt_data(JSON.stringify(this.bg_image_data));

        return text + "\n";
    }

    __export_list_tab_shared() {
        var list = [];
        if (this.centerlist.length > 0) {
            list.push(this.centerlist[0]);
            for (var i = 1; i < this.centerlist.length; i++) {
                list.push(this.centerlist[i] - this.centerlist[i - 1]);
            }
        }
        var text = JSON.stringify(list) + "\n";

        // Copy the tab selector modes
        let user_choices = UserSettings.tab_settings;
        text += JSON.stringify(user_choices) + "\n";

        return text;
    }

    __export_version_shared(options = {}) {
        var text = "";

        if (!options.skipTimerPlaceholder) {
            text += JSON.stringify("x") + "\n"; // Dummy, to match the size of maketext_duplicate
        }

        text += JSON.stringify(options.comp ? "comp" : "x") + "\n";

        // Version
        text += JSON.stringify(this.version) + "\n";

        // Save submode/style/combi settings
        text += JSON.stringify(this.mode) + "\n";

        // Don't save theme setting in solving as solver might want his own theme, but having this placeholder to match the size with other url modes
        text += JSON.stringify("x") + "\n";

        // Custom Colors
        text += (UserSettings.custom_colors_on) ? "1\n" : "0\n";

        return text;
    }

    __get_answer_settings(type) {
        type = type || ""; // blank or "_or"

        // save answer check settings
        var settingstatus = document.getElementById("answersetting").getElementsByClassName("solcheck" + type);
        var answersetting = {};
        for (var i = 0; i < settingstatus.length; i++) {
            answersetting[settingstatus[i].id] = !!(settingstatus[i].checked);
        }
        return answersetting;
    }

    __export_solcheck_shared() {
        return JSON.stringify(this.__get_answer_settings()) + "\n";
    }

    __export_checker_shared() {
        var text = JSON.stringify(this.__get_answer_settings("_or")) + "\n";

        // Save genre tags
        text += JSON.stringify($('#genre_tags_opt').select2("val"));

        return text;
    }

    __export_finalize_shared(text) {
        var puzzle_data = encrypt_data(text);
        return puzzle_data;
    }

    maketext() {
        var text = this.__export_text_shared(false);

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

        // No need to save replay information in edit link
        this.pu_a.command_replay.__a = [];
        this.pu_a_col.command_replay.__a;

        text += JSON.stringify(this.pu_q) + "\n";
        text += JSON.stringify(this.pu_a) + "\n";

        if (document.getElementById("save_undo").checked === false) {
            this.pu_q.command_redo.__a = qr;
            this.pu_q.command_undo.__a = qu;
            this.pu_a.command_redo.__a = ar;
            this.pu_a.command_undo.__a = au;
        }

        text += this.__export_list_tab_shared();
        text += this.__export_solcheck_shared();
        text += this.__export_version_shared();

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
        text += JSON.stringify(this.pu_a_col) + "\n";

        if (document.getElementById("save_undo").checked === false) {
            this.pu_q_col.command_redo.__a = qr;
            this.pu_q_col.command_undo.__a = qu;
            this.pu_a_col.command_redo.__a = ar;
            this.pu_a_col.command_undo.__a = au;
        }

        text += this.__export_checker_shared();

        // Custom Answer Message
        if (this.mmode === "solve") {
            text += "\n" + false;
        } else {
            let custom_message = document.getElementById("custom_message").value;
            text += "\n" + custom_message.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');
        }

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        // This is to account for old links and new links together
        var url;
        if (location.hash) {
            url = location.href.split('#')[0];
        } else {
            url = location.href.split('?')[0];
        }

        var ba = this.__export_finalize_shared(text);

        return url + "#m=edit&p=" + ba;
    }

    maketext_duplicate() {
        // if solution check exists, then read multisolution variable or else set to false
        let multi = this.solution ? this.multisolution : false;

        var text = this.__export_text_shared(multi);

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode) + "\n";

        var qr = this.pu_q.command_redo.__a;
        var qu = this.pu_q.command_undo.__a;
        var ar = this.pu_a.command_redo.__a;
        var au = this.pu_a.command_undo.__a;
        var are = this.pu_a.command_replay.__a;
        this.pu_q.command_redo.__a = [];
        this.pu_q.command_undo.__a = [];
        this.pu_a.command_redo.__a = [];
        if (this.mmode === "solve") {
            // Retain undo in solve mode
        } else {
            this.pu_a.command_undo.__a = [];
            this.pu_a.command_replay.__a = [];
        }
        text += JSON.stringify(this.pu_q) + "\n";
        text += JSON.stringify(this.pu_a) + "\n";
        this.pu_q.command_redo.__a = qr;
        this.pu_q.command_undo.__a = qu;
        this.pu_a.command_redo.__a = ar;
        this.pu_a.command_undo.__a = au;
        this.pu_a.command_replay.__a = are;

        text += this.__export_list_tab_shared();

        // Save timer
        if (this.mmode === "solve") {
            text += sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths']) + "\n";
        }

        text += this.__export_solcheck_shared();

        if (this.mmode !== "solve") {
            text += JSON.stringify("x") + "\n"; // dummy to compensate time saver for non solve cloning
        }

        text += this.__export_version_shared({
            skipTimerPlaceholder: true,
            comp: this.comp
        });

        qr = this.pu_q_col.command_redo.__a;
        qu = this.pu_q_col.command_undo.__a;
        ar = this.pu_a_col.command_redo.__a;
        au = this.pu_a_col.command_undo.__a;
        are = this.pu_a_col.command_replay.__a;
        this.pu_q_col.command_redo.__a = [];
        this.pu_q_col.command_undo.__a = [];
        this.pu_a_col.command_redo.__a = [];

        if (this.mmode === "solve") {
            // Retain undo in solve mode
        } else {
            this.pu_a_col.command_undo.__a = [];
            this.pu_a_col.command_replay.__a = [];
        }
        text += JSON.stringify(this.pu_q_col) + "\n";
        text += JSON.stringify(this.pu_a_col) + "\n";
        this.pu_q_col.command_redo.__a = qr;
        this.pu_q_col.command_undo.__a = qu;
        this.pu_a_col.command_redo.__a = ar;
        this.pu_a_col.command_undo.__a = au;
        this.pu_a_col.command_replay.__a = are;

        text += this.__export_checker_shared();

        // Custom Answer Message
        if (this.solution) {
            let custom_message = document.getElementById("custom_message").value;
            text += "\n" + custom_message.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');
        } else {
            text += "\n" + false;
        }

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        var ba = encrypt_data(text);

        // This is to account for old links and new links together
        var url;
        if (location.hash) {
            url = location.href.split('#')[0];
        } else {
            url = location.href.split('?')[0];
        }

        let solution_clone;
        // if solution exist then copy the solution as well
        if (this.solution) {
            if (this.multisolution) {
                solution_clone = JSON.stringify(this.solution);
            } else {
                solution_clone = this.solution;
            }
            var ba_s = encrypt_data(solution_clone);
            return url + "#m=edit&p=" + ba + "&a=" + ba_s;
        } else {
            return url + "#m=edit&p=" + ba;
        }
    }

    maketext_solve(type = "none") {
        // if solution check exists, then read multisolution variable or else set to false
        let multi = false;
        if (type === "answercheck") {
            this.checkall_status(); // this will update the multisolution status
            multi = this.multisolution;
        }

        var text = this.__export_text_shared(multi);

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode.grid) + "~" + JSON.stringify(this.mode["pu_a"]["edit_mode"]) + "~" + JSON.stringify(this.mode["pu_a"][this.mode["pu_a"]["edit_mode"]]) + "\n";

        var qr = this.pu_q.command_redo.__a;
        var qu = this.pu_q.command_undo.__a;
        this.pu_q.command_redo.__a = [];
        this.pu_q.command_undo.__a = [];
        text += JSON.stringify(this.pu_q) + "\n" + "\n";
        this.pu_q.command_redo.__a = qr;
        this.pu_q.command_undo.__a = qu;

        text += this.__export_list_tab_shared();
        text += this.__export_solcheck_shared();
        text += this.__export_version_shared();

        qr = this.pu_q_col.command_redo.__a;
        qu = this.pu_q_col.command_undo.__a;
        this.pu_q_col.command_redo.__a = [];
        this.pu_q_col.command_undo.__a = [];
        text += JSON.stringify(this.pu_q_col) + "\n" + "x" + "\n";
        this.pu_q_col.command_redo.__a = qr;
        this.pu_q_col.command_undo.__a = qu;

        text += this.__export_checker_shared();

        // Custom Answer Message
        if (type === "answercheck") {
            let custom_message = document.getElementById("custom_message").value;
            text += "\n" + custom_message.replace(/\n/g, '%2D').replace(/,/g, '%2C').replace(/&/g, '%2E').replace(/=/g, '%2F');
        } else {
            text += "\n" + false;
        }

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        // This is to account for old links and new links together
        var url;
        if (location.hash) {
            url = location.href.split('#')[0];
        } else {
            url = location.href.split('?')[0];
        }
        var ba = this.__export_finalize_shared(text);

        return url + "#m=solve&p=" + ba;
    }

    maketext_compsolve() {
        var text = this.__export_text_shared(false);

        text += JSON.stringify(this.space) + "\n";
        text += JSON.stringify(this.mode.grid) + "~" + JSON.stringify(this.mode["pu_a"]["edit_mode"]) + "~" + JSON.stringify(this.mode["pu_a"][this.mode["pu_a"]["edit_mode"]]) + "\n";

        var qr = this.pu_q.command_redo.__a;
        var qu = this.pu_q.command_undo.__a;
        this.pu_q.command_redo.__a = [];
        this.pu_q.command_undo.__a = [];
        text += JSON.stringify(this.pu_q) + "\n" + "\n";
        this.pu_q.command_redo.__a = qr;
        this.pu_q.command_undo.__a = qu;

        text += this.__export_list_tab_shared();
        text += this.__export_solcheck_shared();
        text += this.__export_version_shared({
            comp: true
        });

        qr = this.pu_q_col.command_redo.__a;
        qu = this.pu_q_col.command_undo.__a;
        this.pu_q_col.command_redo.__a = [];
        this.pu_q_col.command_undo.__a = [];
        text += JSON.stringify(this.pu_q_col) + "\n" + "x" + "\n";
        this.pu_q_col.command_redo.__a = qr;
        this.pu_q_col.command_undo.__a = qu;

        text += this.__export_checker_shared();

        // Custom Answer Message
        text += "\n" + false;

        for (var i = 0; i < this.replace.length; i++) {
            text = text.split(this.replace[i][0]).join(this.replace[i][1]);
        }

        // This is to account for old links and new links together
        var url;
        if (location.hash) {
            url = location.href.split('#')[0];
        } else {
            url = location.href.split('?')[0];
        }
        var ba = this.__export_finalize_shared(text);

        return url + "#m=solve&p=" + ba;
    }

    maketext_solve_solution() {
        var text_head = this.maketext_solve("answercheck");
        var text;
        text = JSON.stringify(this.make_solution());

        var ba = encrypt_data(text);
        return text_head + "&a=" + ba;
    }

    maketext_replay() {
        var text_head = pu.maketext_solve();

        // encrypt the data
        var replay, replay_arr;
        replay_arr = [...pu["pu_a"]["command_replay"].__a];
        try {
            replay = encrypt_data(JSON.stringify(replay_arr.reverse()));
        } catch (err) {
            replay = "penpaerror";
        }
        if (replay == null || replay == "") {
            replay = "penpaerror-replayisblank";
        }

        // puzzle info
        var puzzle_info = encrypt_data(JSON.stringify({
            'sname': document.getElementById('saveinfosolver').value,
            'stime': sw_timer.getTimeValues().toString(['days', 'hours', 'minutes', 'seconds', 'secondTenths'])
        }));

        return text_head + "&q=" + puzzle_info + "&r=" + replay;
    }

    checkall_status() {
        // See if user selected any particular setting
        let answersetting = document.getElementById("answersetting");
        let settingstatus_and = answersetting.getElementsByClassName("solcheck");
        let settingstatus_or = answersetting.getElementsByClassName("solcheck_or");
        let checkall = true;

        this.multisolution = false;

        // loop through and check if any "AND" settings are selected
        for (var i = 0; i < settingstatus_and.length; i++) {
            if (settingstatus_and[i].checked) {
                checkall = false;
                break;
            }
        }

        // If checkall is still true, it means, no "AND" option was selected
        if (checkall) {
            // loop through and check if any "OR" settings are selected
            for (var i = 0; i < settingstatus_or.length; i++) {
                if (settingstatus_or[i].checked) {
                    checkall = false;
                    this.multisolution = true;
                    break;
                }
            }
        }

        return checkall;
    }

    get_answercheck_settings() {
        let answersetting = document.getElementById("answersetting");
        let settingstatus_and = answersetting.getElementsByClassName("solcheck");
        let settingstatus_or = answersetting.getElementsByClassName("solcheck_or");
        var answercheck_opt = [],
            message = "<b style=\"color:blue\">Solution checker looks for ALL of the following:</b><ul>";

        // loop through and check if any "AND" settings are selected
        let prev_opt = "";
        for (var i = 0; i < settingstatus_and.length; i++) {
            if (settingstatus_and[i].checked) {
                // ignore initial characters "sol_"
                var opt = answercheck_opt_conversion[settingstatus_and[i].id.substring(4)];
                if (opt.length !== 0 && opt != prev_opt) {
                    answercheck_opt.push(opt);
                    message += "<li>" + answercheck_message[opt] + "</li>";
                }
                prev_opt = opt;
            }
        }
        message += "</ul>";

        // If answercheck list is 0, it means, no "AND" option was selected
        if (answercheck_opt.length === 0) {
            message = "<b style=\"color:blue\">Solution checker looks for ONE of the following:</b><ul>";
            // loop through and check if any "OR" settings are selected
            for (var i = 0; i < settingstatus_or.length; i++) {
                if (settingstatus_or[i].checked) {
                    // ignore initial characters "sol_or_"
                    let opt = answercheck_opt_conversion[settingstatus_or[i].id.substring(7)];
                    if (opt.length !== 0 && opt != prev_opt) {
                        answercheck_opt.push(opt);
                        message += "<li>" + answercheck_message[opt] + "</li>";
                    }
                    prev_opt = opt;
                }
            }
            message += "</ul>";
        }

        var obj = new Object();
        obj.answercheck_opt = answercheck_opt;
        obj.message = message;
        return obj;
    }

    get_surface_solution(surface_exact) {
        let solution = [];
        let pu = this.pu_a;
        for (var i in pu.surface) {
            // Exact surface colors
            if (surface_exact) {
                // Make the solution slightly smaller by adding multicolor directly into the parent array
                if (Array.isArray(pu.surface[i]))
                    solution.push([parseInt(i), ...pu.surface[i]]);
                else
                    solution.push([parseInt(i), pu.surface[i]]);
                continue;
            }
            if (this.pu_q.surface[i]) {
                // ignore the shading if already in problem mode
            }
            // 1 is DG, 8 is GR, 3 is LG, 4 is BL
            else if (pu.surface[i] === 1 || pu.surface[i] === 8 || pu.surface[i] === 3 || pu.surface[i] === 4) {
                solution.push(i);
            }
        }
        return solution;
    }

    get_line_solution(line_ignore, line_exact) {
        let pu = this.pu_a;
        let solution = [];

        // Make a helper function to add an individual line segment based on the options chosen
        let check_line = (i, type) => {
            let l = pu[type][i];

            if (line_exact) {
                solution.push(i + "," + l);
                return;
            }
            // Ignore "given" line segments (which means ignoring a few specific styles
            // of line and has nothing to do with given or not). [ZW] I don't understand the
            // logic of this but it should probably stay for backwards compatibility.
            if (line_ignore && l && this.ignored_line_types[l])
                return;

            // Look for green or double lines, or if the user has ignored styles,
            // double or anything-but-double (making sure that this is an actual
            // segment and not an X or something)
            if (l === 3 || (UserSettings.ignore_line_style && l !== 30 && i.includes(',')))
                solution.push(i + ",1");
            else if (l === 30)
                solution.push(i + ",2");
        };

        for (var i in pu.line) {
            // Ignoring the half cells standred line marks
            // [ZW] Not sure about the logic for this either, why is this only
            // done if "ignore given line segments" is *not* checked?
            if (!line_ignore) {
                let cells = i.split(",");
                if (this.cellsoutsideFrame.includes(parseInt(cells[0])) &&
                    this.cellsoutsideFrame.includes(parseInt(cells[1]))) {
                    continue;
                }
            }
            check_line(i, 'line');
        }

        for (var i in pu.freeline)
            check_line(i, 'freeline');

        return solution;
    }

    get_edge_solution(edge_ignore, edge_exact) {
        let pu = this.pu_a;
        let solution = [];
        // Make a helper function to add an individual line segment based on the options chosen
        let check_edge = (i, type) => {
            let l = pu[type][i];

            if (edge_exact) {
                solution.push(i + "," + l);
                return;
            }

            if (edge_ignore) {
                // ignore the edge if its on the border (suitable for araf, pentominous type of puzzles)
                if ((this.frame[i] && this.frame[i] === 2) ||
                        (this["pu_q"][type][i] && this["pu_q"][type][i] === 2))
                    return;
            }

            // Look for green or double edges, or if the user has ignored styles,
            // double or anything-but-double (making sure that this is an actual
            // segment and not an X or something)
            if (l === 3 || (UserSettings.ignore_line_style && l !== 30 && i.includes(',')))
                solution.push(i + ",1");
            else if (l === 30)
                solution.push(i + ",2");
        };

        for (var i in pu.lineE)
            check_edge(i, 'lineE');

        for (var i in pu.freelineE)
            check_edge(i, 'freelineE');

        let found = $('#genre_tags_opt').select2("val").some(r => this.surface_2_edge_types.includes(r));
        if (found && this.gridtype === 'square') {
            // find out the grid position using the frame data
            // Note this section of code will work only if thick border frame exists
            if (typeof this.row_start == "undefined") {
                // Find top left corner and bottom right corner
                let topleft = 9999,
                    bottomright = 0,
                    numbers;
                for (var i in this.frame) {
                    if (i in this.pu_q.deletelineE) {
                        continue;
                    }
                    numbers = i.split(",");
                    if (topleft >= parseInt(numbers[0])) {
                        topleft = parseInt(numbers[0]);
                    }
                    if (bottomright <= parseInt(numbers[1])) {
                        bottomright = parseInt(numbers[1]);
                    }
                }
                // finding row and column indices
                let pointA, pointB;
                pointA = topleft - (this.nx0 * this.ny0);
                this.col_start = (pointA % this.nx0) - 1; //column
                this.row_start = parseInt(pointA / this.nx0) - 1; //row
                pointB = bottomright - (this.nx0 * this.ny0);
                this.col_end = (pointB % this.nx0) - 1; //column
                this.row_end = parseInt(pointB / this.nx0) - 1; //row
            }

            let present_cell, right_cell, down_cell;
            for (var j = 2 + this.row_start; j < this.row_end + 2; j++) {
                for (var i = 2 + this.col_start; i < this.col_end + 2; i++) {
                    present_cell = i + j * (this.nx0);
                    right_cell = present_cell + 1;
                    down_cell = Math.max(...this.point[present_cell].adjacent);
                    if (i != this.col_end + 1) {
                        if (pu.surface[present_cell] &&
                            pu.surface[right_cell] &&
                            (pu.surface[present_cell] !== pu.surface[right_cell])) {
                            let imp_edge = this.point[present_cell].surround[1] + ',' + this.point[present_cell].surround[2];
                            if (this["pu_q"].lineE[imp_edge] && this["pu_q"].lineE[imp_edge] === 2) {
                                // ignore given edges
                            } else {
                                solution.push(imp_edge + ',1');
                            }
                        }
                    }
                    if (j != this.row_end + 1) {
                        if (pu.surface[present_cell] &&
                            pu.surface[down_cell] &&
                            (pu.surface[present_cell] !== pu.surface[down_cell])) {
                            let imp_edge = this.point[present_cell].surround[3] + ',' + this.point[present_cell].surround[2];
                            if (this["pu_q"].lineE[imp_edge] && this["pu_q"].lineE[imp_edge] === 2) {
                                // ignore given edges
                            } else {
                                solution.push(imp_edge + ',1');
                            }
                        }
                    }
                }
            }
        }
        // Remove duplicates
        return [...new Set(solution)];
    }

    make_solution() {
        let checkall = this.checkall_status();

        if (!this.multisolution) {
            let surface_exact = document.getElementById("sol_surface_exact").checked;
            let line_exact = document.getElementById("sol_loopline_exact").checked;
            let edge_exact = document.getElementById("sol_loopedge_exact").checked;

            let line_ignore = document.getElementById("sol_ignoreloopline").checked;
            let edge_ignore = document.getElementById("sol_ignoreborder").checked;

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

            if (document.getElementById("sol_surface").checked === true || surface_exact || checkall) {
                sol[0] = this.get_surface_solution(surface_exact);
            }

            // Why on earth is this put in the same list as the surface information?
            if (document.getElementById("sol_square").checked === true || checkall) {
                for (var i in this[pu].symbol) {
                    if (this[pu].symbol[i][0] === 2 && this[pu].symbol[i][1] === "square_LL") {
                        if (sol[0].indexOf(i) === -1) {
                            sol[0].push(i);
                        }
                    }
                }
            }

            if (document.getElementById("sol_loopline").checked === true ||
                    line_exact || line_ignore || checkall) {
                sol[1] = this.get_line_solution(line_ignore, line_exact);
            }

            if (document.getElementById("sol_loopedge").checked === true ||
                    edge_exact || edge_ignore || checkall) {
                // for newer links, if loop edge is selected, automatically ignore the given border/edge elements
                if (this.version_gt(2, 26, 20)) {
                    if (!edge_ignore && !checkall) {
                        edge_ignore = true;
                    }
                }

                sol[2] = this.get_edge_solution(edge_ignore, edge_exact);
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
                    if (this["pu_q"].number[i] && this["pu_q"].number[i][1] === 1 && (this["pu_q"].number[i][2] === "1" || this["pu_q"].number[i][2] === "10")) {
                        // (Black) and (Normal or L) in Problem mode then ignore
                    } else {
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
                            if ((this[pu].number[i][1] === 2 || this[pu].number[i][1] === 8 || this[pu].number[i][1] === 9 || this[pu].number[i][1] === 10) &&
                                (this[pu].number[i][2] === "1" || this[pu].number[i][2] === "5" || this[pu].number[i][2] === "6" || this[pu].number[i][2] === "10")) {
                                if ($('#genre_tags_opt').select2("val").includes("alphabet")) {
                                    let alphabet = this[pu].number[i][0];
                                    if (alphabet.match(/[a-zA-Z]/g)) {
                                        sol[4].push(i + "," + alphabet.toLowerCase());
                                    }
                                } else {
                                    sol[4].push(i + "," + this[pu].number[i][0]);
                                }
                            }
                        } else if ($('#genre_tags_opt').select2("val").includes("non-alphanumeric")) {
                            // ((Green or light blue or dark blue or red) and (Normal, M, S, L))
                            if ((this[pu].number[i][1] === 2 || this[pu].number[i][1] === 8 || this[pu].number[i][1] === 9 || this[pu].number[i][1] === 10) &&
                                (this[pu].number[i][2] === "1" || this[pu].number[i][2] === "5" || this[pu].number[i][2] === "6" || this[pu].number[i][2] === "10")) {
                                sol[4].push(i + "," + this[pu].number[i][0]);
                            }
                        }
                    }
                }

                // Tight Fit Sudoku
                if ($('#genre_tags_opt').select2("val").includes("tightfit")) {
                    for (var i in this[pu].numberS) {
                        if (!isNaN(this[pu].numberS[i][0]) || !this[pu].numberS[i][0].match(/[^A-Za-z]+/)) {
                            // (Green or light blue or dark blue or red)
                            if ((this[pu].numberS[i][1] === 2 || this[pu].numberS[i][1] === 8 || this[pu].numberS[i][1] === 9 || this[pu].numberS[i][1] === 10)) {
                                sol[4].push(i + "," + this[pu].numberS[i][0]);
                            }
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
                    case "battleship_B+":
                        if (document.getElementById("sol_battleship").checked === true || checkall) {
                            if (this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 4) {
                                sol[5].push(i + "," + this[pu].symbol[i][0] + "D+");
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
                        if (document.getElementById("sol_mine").checked === true || checkall) {
                            if (this[pu].symbol[i][0] === 4 || this[pu].symbol[i][0] === 5) {
                                sol[5].push(i + "," + this[pu].symbol[i][0] + "I");
                            }
                        }
                        break;
                }
            }

            for (var i = 0; i < 6; i++) {
                sol[i] = sol[i].sort();
            }
        } else {
            // store multiple solutions

            var sol = [];
            var pu = "pu_a";
            var sol_count = -1; // as list indexing starts at 0

            // Find all checkboxes in the OR mode that are checked, and get the modes for each
            // by slicing out the first 7 characters ("sol_or_")
            let settingstatus_or = [...document.getElementById("answersetting").getElementsByClassName("solcheck_or")];
            settingstatus_or = settingstatus_or.filter(c => c.checked).map(c => c.id.slice(7));

            // loop through and check which "OR" settings are selected
            for (let sol_id of settingstatus_or) {
                // incrementing solution count by 1
                sol_count++;

                let temp_sol = [];

                switch (sol_id) {
                    case "surface":
                        temp_sol = this.get_surface_solution(false);
                        sol[sol_count] = temp_sol;
                        break;
                    case "surface_exact":
                        temp_sol = this.get_surface_solution(true);
                        sol[sol_count] = temp_sol;
                        break;
                    case "number":
                        for (var i in this[pu].number) {
                            if (this["pu_q"].number[i] && this["pu_q"].number[i][1] === 1 && (this["pu_q"].number[i][2] === "1" || this["pu_q"].number[i][2] === "10")) {
                                // (Black) and (Normal or L) in Problem mode then ignore
                            } else {
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
                                            temp_sol.push(i + "," + a);
                                        }
                                    }
                                } else if (!isNaN(this[pu].number[i][0]) || !this[pu].number[i][0].match(/[^A-Za-z]+/)) {
                                    // ((Green or light blue or dark blue or red) and (Normal, M, S, L))
                                    if ((this[pu].number[i][1] === 2 || this[pu].number[i][1] === 8 || this[pu].number[i][1] === 9 || this[pu].number[i][1] === 10) &&
                                        (this[pu].number[i][2] === "1" || this[pu].number[i][2] === "5" || this[pu].number[i][2] === "6" || this[pu].number[i][2] === "10")) {
                                        if ($('#genre_tags_opt').select2("val").includes("alphabet")) {
                                            let alphabet = this[pu].number[i][0];
                                            if (alphabet.match(/[a-zA-Z]/g)) {
                                                temp_sol.push(i + "," + alphabet.toLowerCase());
                                            }
                                        } else {
                                            temp_sol.push(i + "," + this[pu].number[i][0]);
                                        }
                                    }
                                } else if ($('#genre_tags_opt').select2("val").includes("non-alphanumeric")) {
                                    // ((Green or light blue or dark blue or red) and (Normal, M, S, L))
                                    if ((this[pu].number[i][1] === 2 || this[pu].number[i][1] === 8 || this[pu].number[i][1] === 9 || this[pu].number[i][1] === 10) &&
                                        (this[pu].number[i][2] === "1" || this[pu].number[i][2] === "5" || this[pu].number[i][2] === "6" || this[pu].number[i][2] === "10")) {
                                        temp_sol.push(i + "," + this[pu].number[i][0]);
                                    }
                                }
                            }
                        }

                        // Tight Fit Sudoku
                        if ($('#genre_tags_opt').select2("val").includes("tightfit")) {
                            for (var i in this[pu].numberS) {
                                if (!isNaN(this[pu].numberS[i][0]) || !this[pu].numberS[i][0].match(/[^A-Za-z]+/)) {
                                    // (Green or light blue or dark blue or red)
                                    if ((this[pu].numberS[i][1] === 2 || this[pu].numberS[i][1] === 8 || this[pu].numberS[i][1] === 9 || this[pu].numberS[i][1] === 10)) {
                                        temp_sol.push(i + "," + this[pu].numberS[i][0]);
                                    }
                                }
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "loopline_exact":
                        sol[sol_count] = this.get_line_solution(true, true);
                        break;
                    case "loopline":
                        sol[sol_count] = this.get_line_solution(true, false);
                        break;
                    case "loopedge_exact":
                        sol[sol_count] = this.get_edge_solution(true, true);
                        break;
                    case "loopedge":
                        sol[sol_count] = this.get_edge_solution(true, false);
                        break;
                    case "wall":
                        for (var i in this[pu].wall) {
                            if (this[pu].wall[i] === 3) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "square":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "square_LL" && this[pu].symbol[i][0] === 2) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "circle":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "circle_M" &&
                                this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 2) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "tri":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "tri" &&
                                this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 4) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "arrow":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "arrow_S" &&
                                this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 8) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "math":
                        for (var i in this[pu].symbol) {
                            if ((this[pu].symbol[i][1] === "math" || this[pu].symbol[i][1] === "math_G") &&
                                (this[pu].symbol[i][0] === 2 || this[pu].symbol[i][0] === 3)) {
                                temp_sol.push(i + "," + this[pu].symbol[i][0]);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "battleship":
                        for (var i in this[pu].symbol) {
                            if ((this[pu].symbol[i][1] === "battleship_B" &&
                                    this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 6) ||
                                (this[pu].symbol[i][1] === "battleship_B+" &&
                                    this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 4)) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "tent":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "tents" &&
                                this[pu].symbol[i][0] === 2) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "star":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "star" &&
                                this[pu].symbol[i][0] >= 1 && this[pu].symbol[i][0] <= 3) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "akari":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "sun_moon" &&
                                this[pu].symbol[i][0] === 3) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                    case "mine":
                        for (var i in this[pu].symbol) {
                            if (this[pu].symbol[i][1] === "sun_moon" &&
                                (this[pu].symbol[i][0] === 4 || this[pu].symbol[i][0] === 5)) {
                                temp_sol.push(i);
                            }
                        }
                        sol[sol_count] = temp_sol;
                        break;
                }
            }

            for (var i = 0; i < sol.length; i++) {
                sol[i] = sol[i].sort();
            }
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

    maketext_ppfile2() {
        var text = "";
        var gridsize = 19.842 / this.size;
        var fontsize = 16;
        var offset_x = this.canvasx * 0.5;
        var offset_y = this.canvasy * 0.5;
        var header = document.getElementById("savetextarea_pp").value;

        if (this.mode.grid[2] === "2") {
            text += "%Margin:5,5,5,5\n";
        }

        if (!isEmpty(this.pu_a.line)) {
            text += '#解答線:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Stroke:80,3,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_a.line) {
                i1 = Number(i.split(",")[0]);
                i2 = Number(i.split(",")[1]);
                y1 = pu.point[i1].y - offset_y;
                y2 = pu.point[i2].y - offset_y;
                x1 = pu.point[i1].x - offset_x;
                x2 = pu.point[i2].x - offset_x;
                text += y1 + ',' + x1 + ';' + y2 + ',' + x2 + '\n';
            }
            text += "--------\n";
        }

        if (!isEmpty(this.pu_q.lineE)) {
            text += '#問題辺太:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Stroke:100,2,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_q.lineE) {
                if (this.pu_q.lineE[i] == 2) {
                    i1 = Number(i.split(",")[0]);
                    i2 = Number(i.split(",")[1]);
                    y1 = pu.point[i1].y - offset_y;
                    y2 = pu.point[i2].y - offset_y;
                    x1 = pu.point[i1].x - offset_x;
                    x2 = pu.point[i2].x - offset_x;
                    text += y1 + ',' + x1 + ';' + y2 + ',' + x2 + '\n';
                }
            }
            text += "--------\n";
        }

        if (!isEmpty(this.pu_q.lineE)) {
            text += '#問題辺細:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Stroke:100,0.4,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_q.lineE) {
                if (this.pu_q.lineE[i] == 80) {
                    i1 = Number(i.split(",")[0]);
                    i2 = Number(i.split(",")[1]);
                    y1 = pu.point[i1].y - offset_y;
                    y2 = pu.point[i2].y - offset_y;
                    x1 = pu.point[i1].x - offset_x;
                    x2 = pu.point[i2].x - offset_x;
                    text += y1 + ',' + x1 + ';' + y2 + ',' + x2 + '\n';
                }
            }
            text += "--------\n";
        }

        if (!isEmpty(this.pu_a.lineE)) {
            text += '#解答辺:2,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:0,0\n' +
                '*Stroke:100,2,0,1,1\n';
            var i1, i2, x1, x2, y1, y2;
            for (var i in this.pu_a.lineE) {
                i1 = Number(i.split(",")[0]);
                i2 = Number(i.split(",")[1]);
                y1 = pu.point[i1].y - offset_y;
                y2 = pu.point[i2].y - offset_y;
                x1 = pu.point[i1].x - offset_x;
                x2 = pu.point[i2].x - offset_x;
                text += y1 + ',' + x1 + ';' + y2 + ',' + x2 + '\n';
            }
            text += "--------\n";
        }

        var max, min, key, corner;
        var frameline = {};
        for (var j = 0; j < this.centerlist.length; j++) {
            corner = this.point[this.centerlist[j]].surround.length;
            for (var i = 0; i < corner; i++) {
                max = Math.max(this.point[this.centerlist[j]].surround[i], this.point[this.centerlist[j]].surround[(i + 1) % corner]);
                min = Math.min(this.point[this.centerlist[j]].surround[i], this.point[this.centerlist[j]].surround[(i + 1) % corner]);
                key = min.toString() + "," + max.toString();
                if (frameline[key]) {
                    frameline[key] = 1;
                } else {
                    frameline[key] = 2;
                }
            }
        }


        if (!isEmptycontent("pu_a", "number", 2, "1")) {
            text += '#解答文字:9,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + fontsize + '\n' +
                '*TextAlignment:1,1\n';
            text += '&toWide\n';

            for (var i in this.pu_a.number) {
                text += this.pu_a.number[i][0] + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
            }

            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "number", 2, "1")) {
            text += '#問題文字:9,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + fontsize + '\n' +
                '*TextAlignment:1,1\n';
            text += '&toWide\n';

            for (var i in this.pu_q.number) {
                if (this.pu_q.number[i][0] < 10) {
                    text += this.pu_q.number[i][0] + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
                } else {
                    text += parseInt(this.pu_q.number[i][0] / 10) + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x - this.size * 0.17) + ",0,0,0.85,1\n";
                    text += this.pu_q.number[i][0] % 10 + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x + this.size * 0.17) + ",0,0,0.85,1\n";
                }
            }

            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "number", 2, "10")) {
            text += '#問題文字大:9,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + 9 + '\n' +
                '*TextAlignment:1,1\n';
            text += '&toWide\n';

            for (var i in this.pu_q.number) {
                text += this.pu_q.number[i][0] + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
            }

            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "number", 2, "6")) {
            text += '#問題文字中:9,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + 6 + '\n' +
                '*TextAlignment:1,1\n';
            text += '&toWide\n';

            for (var i in this.pu_q.number) {
                text += this.pu_q.number[i][0] + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
            }

            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "number", 2, "4")) {
            text += '#問題文字Tapa:9,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + 12 + '\n' +
                '*TextAlignment:1,1\n';
            text += '&toWide\n';
            for (var i in this.pu_q.number) {
                if (this.pu_q.number[i][2] == '4') {
                    let values = [...this.pu_q.number[i][0]];
                    if (values.length === 1) {
                        text += values[0] + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
                    } else if (values.length === 2) {
                        text += values[0] + "@" + (this.point[i].y - offset_y - 0.19 * this.size) + "," + (this.point[i].x - offset_x - 0.21 * this.size) + ",0,0,0.75,0.75\n";
                        text += values[1] + "@" + (this.point[i].y - offset_y + 0.19 * this.size) + "," + (this.point[i].x - offset_x + 0.21 * this.size) + ",0,0,0.75,0.75\n";
                    } else if (values.length === 3) {
                        text += values[0] + "@" + (this.point[i].y - offset_y - 0.16 * this.size) + "," + (this.point[i].x - offset_x - 0.22 * this.size) + ",0,0,0.75,0.75\n";
                        text += values[1] + "@" + (this.point[i].y - offset_y - 0.21 * this.size) + "," + (this.point[i].x - offset_x + 0.23 * this.size) + ",0,0,0.75,0.75\n";
                        text += values[2] + "@" + (this.point[i].y - offset_y + 0.20 * this.size) + "," + (this.point[i].x - offset_x - 0.00 * this.size) + ",0,0,0.75,0.75\n";
                    } else if (values.length === 4) {
                        text += values[0] + "@" + (this.point[i].y - offset_y - 0.24 * this.size) + "," + (this.point[i].x - offset_x - 0.00 * this.size) + ",0,0,0.75,0.75\n";
                        text += values[1] + "@" + (this.point[i].y - offset_y - 0.00 * this.size) + "," + (this.point[i].x - offset_x - 0.26 * this.size) + ",0,0,0.75,0.75\n";
                        text += values[2] + "@" + (this.point[i].y - offset_y + 0.00 * this.size) + "," + (this.point[i].x - offset_x + 0.26 * this.size) + ",0,0,0.75,0.75\n";
                        text += values[3] + "@" + (this.point[i].y - offset_y + 0.24 * this.size) + "," + (this.point[i].x - offset_x + 0.00 * this.size) + ",0,0,0.75,0.75\n";
                    }
                }
            }
            text += "--------\n";
        }

        if (!isEmpty(this.pu_q.numberS)) {
            text += '#問題文字四隅:9,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:-1,0,0,1\n' +
                '*Font:IPAGothic,Normal,Normal,Normal,' + 6 + '\n' +
                '*TextAlignment:1,1\n';
            text += '&toWide\n';

            for (var i in this.pu_q.numberS) {
                text += this.pu_q.numberS[i][0] + "@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
            }

            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "symbol", 1, "circle_L")) {
            text += '#問題丸大:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$w:\n' +
                '0.2 w\n' +
                '1 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '----\n' +
                '$b:\n' +
                '0.2 w\n' +
                '0 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '####\n'


            for (var i in this.pu_q.symbol) {
                if (this.pu_q.symbol[i][0] === 1 && this.pu_q.symbol[i][1] === "circle_L") {
                    text += "w@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,3.5,3.5\n";
                } else if (this.pu_q.symbol[i][0] === 2 && this.pu_q.symbol[i][1] === "circle_L") {
                    text += "b@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,3.5,3.5\n";
                }
            }
            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "symbol", 1, "circle_M")) {
            text += '#問題丸:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$w:\n' +
                '0.2 w\n' +
                '1 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '----\n' +
                '$b:\n' +
                '0.2 w\n' +
                '0 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '####\n'


            for (var i in this.pu_q.symbol) {
                if (this.pu_q.symbol[i][0] === 1 && this.pu_q.symbol[i][1] === "circle_M") {
                    text += "w@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,2.5,2.5\n";
                } else if (this.pu_q.symbol[i][0] === 2 && this.pu_q.symbol[i][1] === "circle_M") {
                    text += "b@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,2.5,2.5\n";
                }
            }
            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "symbol", 1, "circle_S")) {
            text += '#問題丸小:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$w:\n' +
                '0.2 w\n' +
                '1 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '----\n' +
                '$b:\n' +
                '0.2 w\n' +
                '0 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '####\n'


            for (var i in this.pu_q.symbol) {
                if (this.pu_q.symbol[i][0] === 1 && this.pu_q.symbol[i][1] === "circle_S") {
                    text += "w@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,1.5,1.5\n";
                } else if (this.pu_q.symbol[i][0] === 2 && this.pu_q.symbol[i][1] === "circle_S") {
                    text += "b@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,1.5,1.5\n";
                }
            }
            text += "--------\n";
        }

        if (!isEmptycontent("pu_q", "symbol", 1, "circle_SS")) {
            text += '#問題丸極小:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$w:\n' +
                '0.2 w\n' +
                '1 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '----\n' +
                '$b:\n' +
                '0.2 w\n' +
                '0 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '####\n'


            for (var i in this.pu_q.symbol) {
                if (this.pu_q.symbol[i][0] === 1 && this.pu_q.symbol[i][1] === "circle_SS") {
                    text += "w@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,1,1\n";
                } else if (this.pu_q.symbol[i][0] === 2 && this.pu_q.symbol[i][1] === "circle_SS") {
                    text += "b@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,1,1\n";
                }
            }
            text += "--------\n";
        }

        if (!isEmptycontent("pu_a", "symbol", 1, "circle_M")) {
            text += '#解答丸:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$w:\n' +
                '0.2 w\n' +
                '1 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '----\n' +
                '$b:\n' +
                '0.2 w\n' +
                '0 g\n' +
                '2.5 0 m\n' +
                '2.5 1.38 1.38 2.5 0 2.5 c\n' +
                '-1.38 2.5 -2.5 1.38 -2.5 0 c\n' +
                '-2.5 -1.38 -1.38 -2.5 0 -2.5 c\n' +
                '1.38 -2.5 2.5 -1.38 2.5 0 c\n' +
                'h b\n' +
                '####\n'


            for (var i in this.pu_a.symbol) {
                if (this.pu_a.symbol[i][0] === 1 && this.pu_a.symbol[i][1] === "circle_M") {
                    text += "w@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,2.5,2.5\n";
                } else if (this.pu_a.symbol[i][0] === 2 && this.pu_a.symbol[i][1] === "circle_M") {
                    text += "b@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,2.5,2.5\n";
                }
            }
            text += "--------\n";
        }


        if (this.mode.grid[1] === "1") {
            var verticelist = [];
            for (var i = 0; i < this.centerlist.length; i++) {
                for (var j = 0; j < this.point[this.centerlist[i]].surround.length; j++) {
                    verticelist.push(this.point[this.centerlist[i]].surround[j]);
                }
            }
            verticelist = Array.from(new Set(verticelist));
            text += '#盤面格子点:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$p:\n' +
                '1.5 0 0 1.5 0 0 cm\n' +
                '0 1 m\n' +
                '0.552285 1 1 0.552285 1 0 c\n' +
                '1 -0.552285 0.552285 -1 0 -1 c\n' +
                '-0.552285 -1 -1 -0.552285 -1 0 c\n' +
                '-1 0.552285 -0.552285 1 0 1 c f\n' +
                '####\n';
            for (var i of verticelist) {
                text += "p@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + "\n";
            }
            text += "--------\n";
        }


        text += '#盤面内側:2,True\n' +
            '*Grid:' + gridsize + ',' + gridsize + '\n' +
            '*Skew:0,0\n' +
            '*Offset:0,0\n'
        if (this.mode.grid[0] === "1") {
            text += '*Stroke:100,0.4,0,1,1\n'; //実線
        } else if (this.mode.grid[0] === "2") {
            text += '*Stroke:100,0.4,1.804/3.1565/0.902,1,1\n'; //点線
        } else if (this.mode.grid[0] === "3") {
            text += '*Stroke:-1,0,0,1,1\n'; //なし
        }
        var i1, i2, x1, x2, y1, y2;
        for (var i in frameline) {
            if (frameline[i] == 1 && this.pu_q.deletelineE[i] != 1) {
                i1 = Number(i.split(",")[0]);
                i2 = Number(i.split(",")[1]);
                y1 = pu.point[i1].y - offset_y;
                y2 = pu.point[i2].y - offset_y;
                x1 = pu.point[i1].x - offset_x;
                x2 = pu.point[i2].x - offset_x;
                text += y1 + ',' + x1 + ';' + y2 + ',' + x2 + '\n';
            }
        }
        text += "--------\n";

        text += '#盤面外側:2,True\n' +
            '*Grid:' + gridsize + ',' + gridsize + '\n' +
            '*Skew:0,0\n' +
            '*Offset:0,0\n'
        if (this.mode.grid[2] === "1") {
            text += '*Stroke:100,2,0,1,1\n'; //実線
        } else if (this.mode.grid[2] === "2") {
            if (this.mode.grid[0] === "1") {
                text += '*Stroke:100,0.4,0,1,1\n'; //実線
            } else if (this.mode.grid[0] === "2") {
                text += '*Stroke:100,0.4,1.804/3.1565/0.902,1,1\n'; //点線
            } else if (this.mode.grid[0] === "3") {
                text += '*Stroke:-1,0,0,1,1\n'; //なし
            }
        }
        var i1, i2, x1, x2, y1, y2;
        for (var i in frameline) {
            if (frameline[i] == 2 && this.pu_q.deletelineE[i] != 1) {
                i1 = Number(i.split(",")[0]);
                i2 = Number(i.split(",")[1]);
                y1 = pu.point[i1].y - offset_y;
                y2 = pu.point[i2].y - offset_y;
                x1 = pu.point[i1].x - offset_x;
                x2 = pu.point[i2].x - offset_x;
                text += y1 + ',' + x1 + ';' + y2 + ',' + x2 + '\n';
            }
        }
        text += "--------\n";


        if (!isEmptycontent("pu_q", "symbol", 1, "star")) {
            text += '#問題星:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$ws:\n' +
                '0.05 w\n' +
                '1 g\n' +
                '1 j\n' +
                '0.00   -0.900  m\n' +
                '0.202  -0.278  l\n' +
                '0.856  -0.278  l\n' +
                '0.327  0.106   l\n' +
                '0.529  0.728   l\n' +
                '0.00   0.344   l\n' +
                '-0.529 0.728   l\n' +
                '-0.327 0.106   l\n' +
                '-0.856 -0.278  l\n' +
                '-0.202 -0.278  l\n' +
                'h b\n' +
                '----\n' +
                '$bs:\n' +
                '0.05 w\n' +
                '0 g\n' +
                '1 j\n' +
                '0.00   -0.900  m\n' +
                '0.202  -0.278  l\n' +
                '0.856  -0.278  l\n' +
                '0.327  0.106   l\n' +
                '0.529  0.728   l\n' +
                '0.00   0.344   l\n' +
                '-0.529 0.728   l\n' +
                '-0.327 0.106   l\n' +
                '-0.856 -0.278  l\n' +
                '-0.202 -0.278  l\n' +
                'h b\n' +
                '####\n'

            for (var i in this.pu_q.symbol) {
                if (this.pu_q.symbol[i][0] === 1 && this.pu_q.symbol[i][1] === "star") {
                    text += "ws@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,8,8\n";
                } else if (this.pu_q.symbol[i][0] === 2 && this.pu_q.symbol[i][1] === "star") {
                    text += "bs@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,8,8\n";
                }
            }
            text += "--------\n";
        }

        if (!isEmptycontent("pu_a", "symbol", 1, "star")) {
            text += '#解答星:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';
            text += '$ws:\n' +
                '0.05 w\n' +
                '1 g\n' +
                '1 j\n' +
                '0.00   -0.900  m\n' +
                '0.202  -0.278  l\n' +
                '0.856  -0.278  l\n' +
                '0.327  0.106   l\n' +
                '0.529  0.728   l\n' +
                '0.00   0.344   l\n' +
                '-0.529 0.728   l\n' +
                '-0.327 0.106   l\n' +
                '-0.856 -0.278  l\n' +
                '-0.202 -0.278  l\n' +
                'h b\n' +
                '----\n' +
                '$bs:\n' +
                '0.05 w\n' +
                '0 g\n' +
                '1 j\n' +
                '0.00   -0.900  m\n' +
                '0.202  -0.278  l\n' +
                '0.856  -0.278  l\n' +
                '0.327  0.106   l\n' +
                '0.529  0.728   l\n' +
                '0.00   0.344   l\n' +
                '-0.529 0.728   l\n' +
                '-0.327 0.106   l\n' +
                '-0.856 -0.278  l\n' +
                '-0.202 -0.278  l\n' +
                'h b\n' +
                '####\n'

            for (var i in this.pu_a.symbol) {
                if (this.pu_a.symbol[i][0] === 1 && this.pu_a.symbol[i][1] === "star") {
                    text += "ws@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,8,8\n";
                } else if (this.pu_a.symbol[i][0] === 2 && this.pu_a.symbol[i][1] === "star") {
                    text += "bs@" + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ",0,0,8,8\n";
                }
            }
            text += "--------\n";
        }

        if (!isEmpty(this.pu_q.surface)) {
            var enlarge = 10 * gridsize;
            text += '#問題黒マス:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:100\n' +
                '*Stroke:100,0.5,0,1\n';

            for (var i in this.pu_q.surface) {
                text += '$' + i + ':\n' +
                    '0.4 w 0 g ';
                corner = this.point[i].surround.length;
                for (var j = 0; j < corner; j++) {
                    if (j == 0) {
                        text += Math.round((this.point[this.point[i].surround[j]].x - this.point[i].x) * 1000) / 10000 + " " + Math.round((this.point[this.point[i].surround[j]].y - this.point[i].y) * 1000) / 10000 + " m ";
                    } else {
                        text += Math.round((this.point[this.point[i].surround[j]].x - this.point[i].x) * 1000) / 10000 + " " + Math.round((this.point[this.point[i].surround[j]].y - this.point[i].y) * 1000) / 10000 + " l ";
                    }
                }
                text += 'h f\n' +
                    '----\n'
            }

            text += "####\n";

            for (var i in this.pu_q.surface) {
                text += "" + i + '@ ' + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ',0,0,' + enlarge + ',' + enlarge + '\n'
            }
            text += "--------\n";
        }

        if (!isEmpty(this.pu_a.surface)) {
            var enlarge = 10.2 * gridsize;
            text += '#解答黒マス:8,True\n' +
                '*Grid:' + gridsize + ',' + gridsize + '\n' +
                '*Skew:0,0\n' +
                '*Offset:-0.2,-0.2\n' +
                '*Size:' + gridsize + ',' + gridsize + '\n' +
                '*Alignment:0,0\n' +
                '*Fill:80\n' +
                '*Stroke:100,0.5,0,1\n';

            for (var i in this.pu_a.surface) {
                text += '$' + i + ':\n' +
                    '0.4 w 0.2 g ';
                corner = this.point[i].surround.length;
                for (var j = 0; j < corner; j++) {
                    if (j == 0) {
                        text += Math.round((this.point[this.point[i].surround[j]].x - this.point[i].x) * 1000) / 10000 + " " + Math.round((this.point[this.point[i].surround[j]].y - this.point[i].y) * 1000) / 10000 + " m ";
                    } else {
                        text += Math.round((this.point[this.point[i].surround[j]].x - this.point[i].x) * 1000) / 10000 + " " + Math.round((this.point[this.point[i].surround[j]].y - this.point[i].y) * 1000) / 10000 + " l ";
                    }
                }
                text += 'h f\n' +
                    '----\n'
            }

            text += "####\n";

            for (var i in this.pu_a.surface) {
                text += "" + i + '@ ' + (this.point[i].y - offset_y) + "," + (this.point[i].x - offset_x) + ',0,0,' + enlarge + ',' + enlarge + '\n'
            }
            text += "--------\n";
        }

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

    getregiondata(row_size, col_size, mode = "pu_q", alphabetical = true) {
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
            var edge_elements = [this.pu_q.lineE];
            var supportstyles = [2, 21];
        } else if (mode === "pu_a") {
            var edge_elements = [this.pu_a.lineE];
            var supportstyles = [3];
        }
        // Full mode: accept edges of any normal style and from both problem/solution mode
        else if (mode === "full") {
            var edge_elements = [this.pu_q.lineE, this.pu_a.lineE];
            var supportstyles = [2, 3, 4, 5, 8, 9, 21];
        }

        // Setup Edge Matrices
        var pointA, pointA_x, pointA_y, edge, points;
        for (let edge_map of edge_elements) {
            for (edge in edge_map) {
                // If black edge or thicker edge in problem, green edge in solution
                if (supportstyles.includes(edge_map[edge])) {
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
            }
        }

        // Check Frame
        for (edge in this.frame) {
            // If black edge
            if (this.frame[edge] === 2) {
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

        for (var k = 0; k < size_unique_nums; k++) {
            if (alphabetical) {
                // Loop through each region to convert to Alphabet
                // Temporary solution, but later find efficient way
                // 26 alphabets and then cycle
                cell_char = String.fromCharCode(65 + (k % 26));
            } else {
                // Just return a numeric matrix with all regions being
                // unique.
                cell_char = k;
            }
            for (var i = 0; i < row_size; i++) {
                for (var j = 0; j < col_size; j++) {
                    if (cell_matrix[i][j] === unique_nums[k]) {
                        cell_matrix[i][j] = cell_char;
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
                row_size = this.ny;
                col_size = this.nx;
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
                row_size = this.ny;
                col_size = this.nx;
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
                row_size = this.ny;
                col_size = this.nx;
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
                let cell_v;
                if (!isEmptycontent("pu_q", "number", 2, "4")) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            if (this.pu_q.number[i + j * (this.nx0)]) {
                                cell_v = this.pu_q.number[i + j * (this.nx0)];
                                if (cell_v[2] === "4" && (pu.only_alphanumeric(cell_v[0]) || cell_v[0].includes("?"))) {
                                    text += cell_v[0].split('').sort().join('');
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
            } else if (header === "tapa_contest" ||
                header === "tc" ||
                header === "kurotto_contest" ||
                header === "kc") {
                // Answer - Shading
                if (!isEmpty(this.pu_a.surface)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            // any shades of grey including black
                            if (!this.pu_q.number[i + j * (this.nx0)] &&
                                this.pu_a.surface[i + j * (this.nx0)] &&
                                (this.pu_a.surface[i + j * (this.nx0)] === 1 ||
                                    this.pu_a.surface[i + j * (this.nx0)] === 8 ||
                                    this.pu_a.surface[i + j * (this.nx0)] === 3 ||
                                    this.pu_a.surface[i + j * (this.nx0)] === 4)) {
                                text += "1";
                            } else {
                                text += "0";
                            }
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
                                if (this.pu_q.symbol[i + j * (this.nx0)][0] === 2) {
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
                var allowed_styles = [1, 8, 3, 4]; // Dark Grey, Grey, Light Grey, Black

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
                            if (this.pu_a.surface[i + j * (this.nx0)] && allowed_styles.includes(this.pu_a.surface[i + j * (this.nx0)])) {
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
                row_size = this.ny;
                col_size = this.nx;
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
                row_size = this.ny;
                col_size = this.nx;
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

            } else if (header === "rassi_sillai_contest" ||
                header === "rsc") {
                // Answer - Line Segments
                let sol = [];
                for (var i in this.pu_a.line) {
                    if (this.pu_q.line[i] && this.ignored_line_types[this.pu_q.line[i]]) {
                        // Ignore the line
                    } else {
                        if (this.pu_a.line[i] === 3) {
                            sol.push(i);
                        }
                    }
                }
                sol = sol.sort();
                text = JSON.stringify(sol);
            } else if (header === "killersudoku" || header === "ks") {

                // Grid Size
                row_size = this.ny;
                col_size = this.nx;

                text += 'Author:\n' +
                    'Genre: Killer Sudoku\n' +
                    'Variation: Standard\n' +
                    'Theme:\n' +
                    'Entry:\n' +
                    'Solution:\n' +
                    'Solving Times:\n' +
                    'Status:\n';
                text += col_size + ' ' + row_size + ' ' + '1' + '\n';

                if (row_size == 6) {
                    text += 'aaabbb\n' +
                        'aaabbb\n' +
                        'dddeee\n' +
                        'dddeee\n' +
                        'ggghhh\n' +
                        'ggghhh\n';
                } else {
                    text += 'aaabbbccc\n' +
                        'aaabbbccc\n' +
                        'aaabbbccc\n' +
                        'dddeeefff\n' +
                        'dddeeefff\n' +
                        'dddeeefff\n' +
                        'ggghhhiii\n' +
                        'ggghhhiii\n' +
                        'ggghhhiii\n';
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

                // Killer Cages
                let matrix = [];
                let k = 0;

                // initialize
                for (let i = 0; i < row_size; i++) {
                    matrix[i] = new Array(parseInt(col_size)).fill('Z');
                }

                // loop through each array
                for (let iter in this.pu_q.killercages) {
                    let arr = this.pu_q.killercages[iter];
                    if (arr.length > 0) {
                        let cell_char = String.fromCharCode(65 + (k % 26));

                        // find all touching alphabets - Do this only if 26 alphabets are exhausted
                        if (k > 25) {
                            console.log('under works')
                        }

                        // Find unique alphabet otuside of this touching alphabets

                        // loop through each element of the array
                        for (let j = 0; j < arr.length; j++) {
                            // row and col index
                            let rowind = (arr[j] % this.nx0) - 2;
                            let colind = Math.floor(arr[j] / this.nx0) - 2;

                            // update matrix
                            matrix[colind][rowind] = cell_char
                        }

                        // increment alphabet
                        k += 1;
                    }
                }

                // Write the matrix to the text variable
                for (var i = 0; i < row_size; i++) {
                    for (var j = 0; j < col_size; j++) {
                        text += matrix[i][j];
                    }
                    text += '\n';
                }

                // Killer Clues
                if (!isEmptycontent("pu_q", "numberS", 1, null)) {
                    for (var j = 2; j < this.ny0 - 2; j++) {
                        for (var i = 2; i < this.nx0 - 2; i++) {
                            let corner_cursor = 4 * (i + j * (this.nx0) + this.nx0 * this.ny0);

                            // If there is clue in the corner
                            if (this.pu_q.numberS[corner_cursor]) {
                                // Replace white spaces in the string
                                var tomtom_clue = this.pu_q.numberS[corner_cursor][0].replace(/\s+/g, '');
                                text += tomtom_clue;
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
            } else if (header === "test") {
                console.log(this.pu_q);
                console.log(this.pu_a);
                console.log(this.pu_q_col);
                console.log(this.pu_a_col);
                console.log(this);
            } else {
                text += 'Error - It doesnt support puzzle type ' + header + '\n' +
                    'Please see instructions (Help) for supported puzzle types\n' +
                    'For additional genre support please submit your request to penpaplus@gmail.com';
            }
        } else {
            text += 'Error - Enter the Puzzle type in Header area\n' +
                'Please see instructions (Help) for supported puzzle types\n';
        }

        return text;
    }

    undo(replay = false) {
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
                    if (a) {
                        this.pu_q.command_undo.push(a);
                    }
                    if (a_col) {
                        this.pu_q_col.command_undo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    if ((a[0] === "thermo" ||
                            a[0] === "nobulbthermo" ||
                            a[0] === "arrows" ||
                            a[0] === "direction" ||
                            a[0] === "squareframe" ||
                            a[0] === "polygon") && a[1] === -1) {
                        if (this[pu_mode][a[0]].length > 0) {
                            this.pu_q.command_redo.push([a[0], a[1], this[pu_mode][a[0]].pop(), pu_mode]);
                            if (a_col) {
                                this.pu_q_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]].pop(), pu_mode + "_col"]);
                            }
                        }
                    } else if (a[0] === "killercages" && a[1] === -1) {
                        if (this[pu_mode][a[0]].length > 0) {
                            this.pu_q.command_redo.push([a[0], a[1], this[pu_mode][a[0]].pop(), pu_mode, a[4]]);
                            if (a_col) {
                                this.pu_q_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]].pop(), pu_mode + "_col", a_col[4]]);
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
                                if (a_col[2]) {
                                    this[pu_mode + "_col"][a_col[0]][a_col[1]] = JSON.parse(a_col[2]); //JSON.parse with decode
                                } else {
                                    this[pu_mode + "_col"][a_col[0]][a_col[1]] = null;
                                }
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
                if (a && a[4] && a[4] != 0) { // if part of group undo
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
                    if (a) {
                        this.pu_a.command_undo.push(a);
                    }
                    if (a_col) {
                        this.pu_a_col.command_undo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    var a_replay = [...a];
                    if (a_col) {
                        var a_col_replay = [...a_col];
                    }
                    // counter and timestamp
                    var a_45 = [],
                        a_4 = []; // for color array
                    if (typeof a[4] !== "undefined" && typeof a[5] !== "undefined") {
                        a_45 = [a[4], a[5]];
                        a_4 = [a[4]];
                    } else if (typeof a[4] !== "undefined") {
                        a_45 = [a[4]];
                        a_4 = [a[4]];
                    }
                    if ((a[0] === "thermo" ||
                            a[0] === "nobulbthermo" ||
                            a[0] === "arrows" ||
                            a[0] === "direction" ||
                            a[0] === "squareframe" ||
                            a[0] === "polygon" ||
                            a[0] === "killercages") && a[1] === -1) {
                        if (this[pu_mode][a[0]].length > 0) {
                            this.pu_a.command_redo.push([a[0], a[1], this[pu_mode][a[0]].pop(), pu_mode].concat(a_45));
                            if (a_col) {
                                this.pu_a_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]].pop(), pu_mode + "_col"].concat(a_4));
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
                        this.pu_a.command_redo.push([a[0], a[1], a[2], pu_mode].concat(a_45));
                        if (a_col) {
                            this.pu_a_col.command_redo.push([a_col[0], a_col[1], a_col[2], pu_mode + "_col"].concat(a_4));
                        }
                    } else {
                        if (a[0] === "deletelineE") {
                            pu_mode = "pu_q";
                        }
                        if (this[pu_mode][a[0]][a[1]]) { //symbol etc
                            this.pu_a.command_redo.push([a[0], a[1], this[pu_mode][a[0]][a[1]], pu_mode].concat(a_45));
                            if (a_col) {
                                this.pu_a_col.command_redo.push([a_col[0], a_col[1], this[pu_mode + "_col"][a_col[0]][a_col[1]], pu_mode + "_col"].concat(a_4));
                            }
                        } else {
                            this.pu_a.command_redo.push([a[0], a[1], null, pu_mode].concat(a_45));
                            if (a_col) {
                                this.pu_a_col.command_redo.push([a_col[0], a_col[1], null, pu_mode + "_col"].concat(a_4));
                            }
                        }

                        if (a[2]) {
                            this[pu_mode][a[0]][a[1]] = JSON.parse(a[2]); //JSON.parse with decode
                            a_replay[2] = JSON.parse(a[2]);
                            if (a_col) {
                                if (a_col[2]) {
                                    this[pu_mode + "_col"][a_col[0]][a_col[1]] = JSON.parse(a_col[2]); //JSON.parse with decode
                                    a_col_replay[2] = JSON.parse(a_col[2]);
                                } else {
                                    this[pu_mode + "_col"][a_col[0]][a_col[1]] = null;
                                }
                            }
                        } else {
                            delete this[pu_mode][a[0]][a[1]];
                            if (a_col) {
                                delete this[pu_mode + "_col"][a_col[0]][a_col[1]];
                            }
                        }
                    }

                    if (!replay) {
                        // Introducing timestamp for live replay (in milli seconds)
                        let timestamp = parseInt(sw_timer.getTotalTimeValues().toString(['secondTenths'])) * 100;
                        if (timestamp > this.replaycutoff) {
                            timestamp = null;
                        }

                        // Save the record
                        a_replay[5] = timestamp;
                        this.pu_a.command_replay.push(a_replay);
                        if (a_col) {
                            a_col_replay[5] = timestamp;
                            this.pu_a_col.command_replay.push(a_col_replay);
                        }
                    }
                    this.redraw();
                }
            }
        }
    }

    redo(replay = false) {
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
                    if (a) {
                        this.pu_q.command_redo.push(a);
                    }
                    if (a_col) {
                        this.pu_q_col.command_redo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    if ((a[0] === "thermo" ||
                            a[0] === "nobulbthermo" ||
                            a[0] === "arrows" ||
                            a[0] === "direction" ||
                            a[0] === "squareframe" ||
                            a[0] === "polygon") && a[1] === -1) {
                        this.pu_q.command_undo.push([a[0], a[1], null, pu_mode]);
                        this[pu_mode][a[0]].push(a[2]);
                        if (a_col) {
                            this.pu_q_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"]);
                            this[pu_mode + "_col"][a_col[0]].push(a_col[2]);
                        }
                    } else if (a[0] === "killercages" && a[1] === -1) {
                        this.pu_q.command_undo.push([a[0], a[1], null, pu_mode, a[4]]);
                        this[pu_mode][a[0]].push(a[2]);
                        if (a_col) {
                            this.pu_q_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col", a_col[4]]);
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
                if (a && a[4] && a[4] != 0) { // if its part of group
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
                    if (a) {
                        this.pu_a.command_redo.push(a); // group redo is done, stop
                    }
                    if (a_col) {
                        this.pu_a_col.command_redo.push(a_col);
                    }
                    break;
                }
                if (a) {
                    // counter and timestamp
                    var a_45 = [],
                        a_4 = []; // for color array
                    if (typeof a[4] !== "undefined" && typeof a[5] !== "undefined") {
                        a_45 = [a[4], a[5]];
                        a_4 = [a[4]];
                    } else if (typeof a[4] !== "undefined") {
                        a_45 = [a[4]];
                        a_4 = [a[4]];
                    }
                    if ((a[0] === "thermo" ||
                            a[0] === "nobulbthermo" ||
                            a[0] === "arrows" ||
                            a[0] === "direction" ||
                            a[0] === "squareframe" ||
                            a[0] === "polygon" ||
                            a[0] === "killercages") && a[1] === -1) {
                        this.pu_a.command_undo.push([a[0], a[1], null, pu_mode].concat(a_45));
                        this[pu_mode][a[0]].push(a[2]);
                        if (a_col) {
                            this.pu_a_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"].concat(a_4));
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
                        this.pu_a.command_undo.push([a[0], a[1], a[2], pu_mode].concat(a_45));
                        if (a_col) {
                            this.pu_a_col.command_undo.push([a_col[0], a_col[1], a_col[2], pu_mode + "_col"].concat(a_4));
                        }
                    } else {
                        if (a[0] === "deletelineE") {
                            pu_mode = "pu_q";
                        }
                        if (this[pu_mode][a[0]][a[1]]) {
                            this.pu_a.command_undo.push([a[0], a[1], JSON.stringify(this[pu_mode][a[0]][a[1]]), pu_mode].concat(a_45));
                            if (a_col) {
                                this.pu_a_col.command_undo.push([a_col[0], a_col[1], JSON.stringify(this[pu_mode + "_col"][a_col[0]][a_col[1]]), pu_mode + "_col"].concat(a_4));
                            }
                        } else {
                            this.pu_a.command_undo.push([a[0], a[1], null, pu_mode].concat(a_45));
                            if (a_col) {
                                this.pu_a_col.command_undo.push([a_col[0], a_col[1], null, pu_mode + "_col"].concat(a_4));
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

                    if (!replay) {
                        // Introducing timestamp for live replay (in milli seconds)
                        let timestamp = parseInt(sw_timer.getTotalTimeValues().toString(['secondTenths'])) * 100;
                        if (timestamp > this.replaycutoff) {
                            timestamp = null;
                        }

                        // Save the record
                        a[5] = timestamp;
                        this.pu_a.command_replay.push(a);
                        if (a_col) {
                            a_col[5] = timestamp;
                            this.pu_a_col.command_replay.push(a_col);
                        }
                    }

                    this.redraw();
                }
            }
        }
    }


    record(arr, num, groupcounter = 0) {
        if (this.mode.qa === "pu_q") {
            if ((arr === "thermo" || arr === "nobulbthermo" || arr === "arrows" || arr === "direction" || arr === "squareframe") && num === -1) {
                this.pu_q.command_undo.push([arr, num, null, this.mode.qa]);
                this.pu_q_col.command_undo.push([arr, num, null, this.mode.qa + "_col"]);
            } else if (arr === "killercages" && num === -1) { // killer cages always have groupcounter passed
                this.pu_q.command_undo.push([arr, num, null, this.mode.qa, groupcounter]);
                this.pu_q_col.command_undo.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
            } else if (arr === "move") {
                this.pu_q.command_undo.push([arr, num[0], num[1], this.mode.qa]); //num[0]:start_point num[1]:to_point
                this.pu_q_col.command_undo.push([arr, num[0], num[1], this.mode.qa + "_col"]); //num[0]:start_point num[1]:to_point
            } else {
                if (this.pu_q[arr][num]) {
                    if (groupcounter === 0) {
                        this.pu_q.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa]); // Array is also recorded in JSON
                        if (penpa_modes[this.gridtype].customcolor.includes(penpa_modes_map[arr])) {
                            this.pu_q_col.command_undo.push([arr, num, JSON.stringify(this.pu_q_col[arr][num]), this.mode.qa + "_col"]); // Array is also recorded in JSON
                        } else {
                            this.pu_q_col.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa + "_col"]); // Array is also recorded in JSON
                        }
                    } else {
                        this.pu_q.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), this.mode.qa, groupcounter]); // Array is also recorded in JSON
                        if (penpa_modes[this.gridtype].customcolor.includes(penpa_modes_map[arr])) {
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
            let timestamp = null;

            if ((arr === "thermo" || arr === "nobulbthermo" || arr === "arrows" || arr === "direction" || arr === "squareframe" || arr === "killercages") && num === -1) {
                this.pu_a.command_undo.push([arr, num, null, this.mode.qa, groupcounter, timestamp]);
                this.pu_a_col.command_undo.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
            } else if (arr === "move") {
                this.pu_a.command_undo.push([arr, num[0], num[1], this.mode.qa, groupcounter, timestamp]); //num[0]:start_point num[1]:to_point
                this.pu_a_col.command_undo.push([arr, num[0], num[1], this.mode.qa + "_col", groupcounter]); //num[0]:start_point num[1]:to_point
            } else if (arr === "deletelineE") {
                if (this.pu_a[arr][num]) {
                    this.pu_a.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), "pu_q", groupcounter, timestamp]); // Array is also recorded in JSON
                    this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_q[arr][num]), "pu_q_col"], groupcounter); // Array is also recorded in JSON
                } else {
                    this.pu_a.command_undo.push([arr, num, null, "pu_q", groupcounter, timestamp]);
                    this.pu_a_col.command_undo.push([arr, num, null, "pu_q_col", groupcounter]);
                }
            } else {
                if (this.pu_a[arr][num]) {
                    this.pu_a.command_undo.push([arr, num, JSON.stringify(this.pu_a[arr][num]), this.mode.qa, groupcounter, timestamp]); // Array is also recorded in JSON
                    if (penpa_modes[this.gridtype].customcolor.includes(penpa_modes_map[arr])) {
                        this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_a_col[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                    } else {
                        this.pu_a_col.command_undo.push([arr, num, JSON.stringify(this.pu_a[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                    }
                } else {
                    this.pu_a.command_undo.push([arr, num, null, this.mode.qa, groupcounter, timestamp]);
                    this.pu_a_col.command_undo.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
                }
            }
            this.pu_a.command_redo = new Stack();
            this.pu_a_col.command_redo = new Stack();
        }
    }

    record_replay(arr, num, groupcounter = 0) {
        if (this.mode.qa === "pu_a") {
            // Introducing timestamp for live replay (in milli seconds)
            let timestamp = parseInt(sw_timer.getTotalTimeValues().toString(['secondTenths'])) * 100;
            if (timestamp > this.replaycutoff) {
                timestamp = null;
            }
            if ((arr === "thermo" || arr === "nobulbthermo" || arr === "arrows" || arr === "direction" || arr === "squareframe" || arr === "killercages") && num === -1) {
                this.pu_a.command_replay.push([arr, num, null, this.mode.qa, groupcounter, timestamp]);
                this.pu_a_col.command_replay.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
            } else if (arr === "move") {
                this.pu_a.command_replay.push([arr, num[0], num[1], this.mode.qa, groupcounter, timestamp]); //num[0]:start_point num[1]:to_point
                this.pu_a_col.command_replay.push([arr, num[0], num[1], this.mode.qa + "_col", groupcounter]); //num[0]:start_point num[1]:to_point
            } else if (arr === "deletelineE") {
                if (this.pu_a[arr][num]) {
                    this.pu_a.command_replay.push([arr, num, JSON.stringify(this.pu_q[arr][num]), "pu_q", groupcounter, timestamp]); // Array is also recorded in JSON
                    this.pu_a_col.command_replay.push([arr, num, JSON.stringify(this.pu_q[arr][num]), "pu_q_col"], groupcounter); // Array is also recorded in JSON
                } else {
                    this.pu_a.command_replay.push([arr, num, null, "pu_q", groupcounter, timestamp]);
                    this.pu_a_col.command_replay.push([arr, num, null, "pu_q_col", groupcounter]);
                }
            } else {
                if (this.pu_a[arr][num]) {
                    this.pu_a.command_replay.push([arr, num, structuredClone(this.pu_a[arr][num]), this.mode.qa, groupcounter, timestamp]); // Array is also recorded in JSON
                    if (penpa_modes[this.gridtype].customcolor.includes(penpa_modes_map[arr])) {
                        this.pu_a_col.command_replay.push([arr, num, structuredClone(this.pu_a_col[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                    } else {
                        this.pu_a_col.command_replay.push([arr, num, structuredClone(this.pu_a[arr][num]), this.mode.qa + "_col", groupcounter]); // Array is also recorded in JSON
                    }
                } else {
                    this.pu_a.command_replay.push([arr, num, null, this.mode.qa, groupcounter, timestamp]);
                    this.pu_a_col.command_replay.push([arr, num, null, this.mode.qa + "_col", groupcounter]);
                }
            }
        }
    }

    set_value(prop, key, value, color_value = undefined) {
        this.record(prop, key, this.undoredo_counter);
        this[this.mode.qa][prop][key] = value;
        if (color_value !== undefined) {
            this[this.mode.qa + "_col"][prop][key] = color_value;
        }
        this.record_replay(prop, key, this.undoredo_counter);
    }

    remove_value(prop, key) {
        this.record(prop, key, this.undoredo_counter);
        delete this[this.mode.qa][prop][key];
        this.record_replay(prop, key, this.undoredo_counter);
    }

    /////////////////////////////
    // Cut/copy/paste
    //
    /////////////////////////////

    copy_handler(ev) {
        // Skip handling copy if a target is selected (eg a textbox)
        if (ev.target.id !== "" && ['INPUT', 'TEXTAREA'].includes(ev.target.tagName))
            return false;

        if (!this.selection.length)
            return false;

        let puzzle = this[this.mode.qa];
        let puzzle_col = this[this.mode.qa + '_col'];

        // Sort the selection both to get the minimum element and so the plain-text clipboard
        // values are in a sane order. Also create a specialized function for this grid type
        // to convert an absolute point index into coordinates relative to the minimum.

        let base_x, base_y, rel_coords;

        // Triangular grid
        if (this.gridtype === "tri") {
            this.selection.sort((a,b) => {
                a = this.point[a].index;
                b = this.point[b].index;
                if (a[1] == b[1]) {
                    if (a[0] == b[0])
                        return a[2] >= b[2];
                    return a[0] > b[0];
                }
                return a[1] > b[1];
            });
            let base_point = this.point[this.selection[0]];
            [base_x, base_y, _] = base_point.index;

            rel_coords = (p) => {
                let [x, y, t] = this.point[p].index;
                // Compensate for every other row being offset, also store if this triangle
                // is pointing up or down
                let offset = (y - base_y) & y & 1;
                return {x: x - base_x + offset, y: y - base_y, t: t};
            }
        }
        // Hexagonal grid
        else if (this.gridtype === "hex") {
            this.selection.sort((a,b) => a >= b);
            let base_point = this.point[this.selection[0]];
            [base_x, base_y] = base_point.index;

            rel_coords = (p) => {
                let [x, y] = this.point[p].index;
                // Compensate for every other row being offset
                let offset = (y - base_y) & y & 1;
                return {x: x - base_x + offset, y: y - base_y};
            }
        }
        // Square grid
        else if (this.grid_is_square()) {
            this.selection.sort((a,b) => a >= b);
            let base_point = this.point[this.selection[0]];
            [base_x, base_y] = base_point.index;

            rel_coords = (p) => {
                let [x, y] = this.point[p].index;
                return {x: x - base_x, y: y - base_y};
            }
        }
        // Unsupported grid type
        else
            return false;

        var plain_clipboard = "";
        var clipboard = [];

        var seen_lines = {};
        var seen_edges = {};
        var seen_vertices = {};

        for (var k of this.selection) {
            let data = rel_coords(k);

            // Put the text from number fields into the plain clipboard. For this, we use data
            // from both the problem and solution modes
            let n_a = this.pu_a['number'][k];
            let n_q = this.pu_q['number'][k];
            if (n_a && n_a[0] !== "")
                plain_clipboard += n_a[0];
            else if (n_q && n_q[0] !== "")
                plain_clipboard += n_q[0];
            // Put an "S" in the clipboard for shaded cells without numbers (commonly
            // used in LMD solution codes)
            else if ([1, 8, 3, 4].includes(puzzle['surface'][k]))
                plain_clipboard += 'S';

            // Copy all supported properties into the full clipboard
            for (let prop of COPY_PROPS) {
                if (prop === "line") {
                    let lines = [];
                    // For lines, look at any lines from this cell to adjacent cells
                    for (var adj of [...this.point[k].adjacent, ...this.point[k].adjacent_dia]) {
                        let key = this.line_key(k, adj);
                        if (!seen_lines[key] && puzzle[prop][key]) {
                            lines.push([rel_coords(adj), puzzle[prop][key], puzzle_col[prop][key]]);
                            seen_lines[key] = true;
                        }
                    }
                    if (lines.length > 0)
                        data[prop] = lines;
                } else if (prop === "lineE") {
                    let edges = [];
                    // For edges, look only at this cell's edges, and number them with the indices
                    // of the "surround" array
                    for (let i in this.point[k].surround) {
                        let adj = this.point[k].surround[i];
                        let j = 0;
                        for (let j in this.point[k].surround) {
                            if (j <= i)
                                continue;
                            let adj2 = this.point[k].surround[j];
                            let key = this.line_key(adj, adj2);
                            if (!seen_edges[key] && puzzle[prop][key]) {
                                edges.push([[i, j], puzzle[prop][key], puzzle_col[prop][key]]);
                                seen_edges[key] = true;
                            }
                        }
                    }
                    if (edges.length > 0)
                        data[prop] = edges;
                } else if (puzzle[prop][k] !== undefined)
                    data[prop] = puzzle[prop][k];
            }

            // Also copy corner/side/vertex marks
            if (this.grid_is_square()) {
                var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);
                for (var i = 0; i < 4; i++) {
                    if (puzzle['numberS'][corner_cursor + i] !== undefined)
                        data['corner' + i] = puzzle['numberS'][corner_cursor + i];
                    if (puzzle['numberS'][side_cursor + i] !== undefined)
                        data['side' + i] = puzzle['numberS'][side_cursor + i];
                    let v = this.point[k].surround[i];
                    if (v !== undefined && !seen_vertices[v] && puzzle['number'][v]) {
                        data['vertex' + i] = puzzle['number'][v];
                        seen_vertices[v] = true;
                    }
                }
            }

            clipboard.push(data);
        }

        clipboard = {
            gridtype: this.gridtype,
            items: clipboard,
        };

        ev.clipboardData.setData("text/plain", plain_clipboard);
        ev.clipboardData.setData("application/penpa-data", JSON.stringify(clipboard));
        ev.preventDefault();

        return true;
    }

    cut_handler(ev) {
        // Run the copy handler and exit if necessary (other input focused, no selection, etc)
        if (!this.copy_handler(ev))
            return false;

        let puzzle = this[this.mode.qa];

        this.undoredo_counter++;

        // Delete all copied attributes
        for (var k of this.selection) {
            for (let prop of COPY_PROPS)
                if (puzzle[prop][k] !== undefined)
                    this.remove_value(prop, k);

            // Delete lines from this cell
            for (var adj of [...this.point[k].adjacent, ...this.point[k].adjacent_dia]) {
                let key = this.line_key(k, adj);
                if (puzzle['line'][key] !== undefined)
                    this.remove_value('line', key);
            }
            // Delete edges around this cell
            let edges = [];
            for (let i in this.point[k].surround) {
                let adj = this.point[k].surround[i];
                let j = 0;
                for (let j in this.point[k].surround) {
                    if (j <= i)
                        continue;
                    let adj2 = this.point[k].surround[j];
                    let key = this.line_key(adj, adj2);
                    if (puzzle['lineE'][key] !== undefined)
                        this.remove_value('lineE', key);
                }
            }

            // Delete corner/side marks
            if (this.grid_is_square()) {
                var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);
                for (var i = 0; i < 4; i++) {
                    if (puzzle['numberS'][corner_cursor + i] !== undefined)
                        this.remove_value('numberS', corner_cursor + i);
                    if (puzzle['numberS'][side_cursor + i] !== undefined)
                        this.remove_value('numberS', side_cursor + i);
                    let v = this.point[k].surround[i];
                    if (puzzle['number'][v] !== undefined)
                        this.remove_value('number', v);
                }
            }
        }

        this.selection = [];

        this.redraw();
    }

    paste_handler(ev) {
        // Skip handling paste if a target is selected (eg a textbox)
        if (ev.target.id !== "")
            return false;

        if (this.selection.length === 0)
            return false;

        // Pull data from the clipboard
        // TODO: perhaps handle text sanely from other sources?
        let clipboard_data = ev.clipboardData.getData("application/penpa-data");
        if (clipboard_data === "")
            return;
        clipboard_data = JSON.parse(clipboard_data);
        // Sanity check that the grid type the data was copied from matches up
        if (clipboard_data.gridtype !== this.gridtype)
            return;

        let [base_x, base_y] = this.point[Math.min(...this.selection)].index;

        // Create an indexing function for this specific grid type, to convert relative (x, y)
        // coordinates into an absolute point index
        let index = null;
        if (this.gridtype === "tri")
            // Compensate both for every other row being offset, and for there being two sets of
            // indices, one for each of upward- and downward-pointing triangles
            index = (x, y, data) => ((this.n0 ** 2 * (2 - data.t)) +
                    (this.n0 * y + x - ((y - base_y) & y & 1)));
        else if (this.gridtype === "hex")
            // Compensate for every other row being offset
            index = (x, y) => (this.nx * 3 + 1) * y + x - ((y - base_y) & y & 1);
        else if (this.grid_is_square())
            index = (x, y) => this.nx0 * y + x;

        this.undoredo_counter++;

        // Insert all data items into the grid relative to the base cell
        for (var data of clipboard_data.items) {
            let {x, y} = data;

            x += base_x;
            y += base_y;

            // Check for this cell being out of bounds in this particular grid type
            if (this.gridtype === "tri") {
                if (x < 2 || x >= this.n0 - 2 || y < 2 || y >= this.n0 - 2)
                    continue;
            } else if (this.gridtype === "hex") {
                let n0 = this.nx * 3 + 1;
                if (x < 1 || x >= n0 - 1 || y < 1 || y >= n0 - 1)
                    continue;
            } else if (this.grid_is_square()) {
                if (x < 2 || x >= this.nx0 - 2 || y < 2 || y >= this.ny0 - 2)
                    continue;
            }

            let k = index(x, y, data);
            if (!this.point[k].use)
                continue

            for (let prop of COPY_PROPS) {
                if (data[prop] === undefined)
                    continue;

                if (prop === "line") {
                    for (var [adj, line_data, color] of data[prop]) {
                        let x2 = adj.x + base_x, y2 = adj.y + base_y;
                        let key = this.line_key(k, index(x2, y2, adj));

                        this.set_value(prop, key, line_data, color);
                    }
                } else if (prop === "lineE") {
                    for (var [[i, j], edge_data, color] of data[prop]) {
                        let c1 = this.point[k].surround[i];
                        let c2 = this.point[k].surround[j];
                        let key = this.line_key(c1, c2);

                        this.set_value(prop, key, edge_data, color);
                    }
                } else
                    this.set_value(prop, k, data[prop]);
            }

            // Also copy corner/side marks
            var corner_cursor = 4 * (k + this.nx0 * this.ny0);
            var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);
            for (var i = 0; i < 4; i++) {
                if (data['corner' + i] !== undefined)
                    this.set_value('numberS', corner_cursor + i, data['corner' + i]);
                if (data['side' + i] !== undefined)
                    this.set_value('numberS', side_cursor + i, data['side' + i]);
                if (data['vertex' + i] !== undefined)
                    this.set_value('number', this.point[k].surround[i], data['vertex' + i]);
            }
        }
        this.redraw();

        ev.preventDefault();
    }


    /////////////////////////////
    // Key Event
    //
    /////////////////////////////

    key_number(key, force_no_shortcut = false) {
        var number;
        var con, conA;
        var arrow, mode;
        var str_num = "1234567890";
        let edit_mode = this.mode[this.mode.qa].edit_mode;
        let submode = this.mode[this.mode.qa][edit_mode];

        // If ZXCV is disabled
        if (!UserSettings.shortcuts_enabled || force_no_shortcut) {
            var str_all = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
        } else {
            var str_all = "1234567890qwertuioasdfghjklQWERTYUIOPASDFGHJKLZXCVBNM";
        }
        var str_num_no0 = "123456789";
        // var str_replace = ["+-=*", "＋－＝＊"];
        // if (str_replace[0].indexOf(key) != -1) { key = str_replace[1][str_replace[0].indexOf(key)]; }
        if (edit_mode === "number") {
            if (this.selection.length === 1) {
                let clean_flag = this.check_neighbors(this.selection[0]);
                if (!clean_flag) {
                    this.undoredo_counter = 0;
                } else {
                    this.undoredo_counter = this.undoredo_counter + 1;
                }
            } else {
                this.undoredo_counter = this.undoredo_counter + 1;
            }
            let cells = null;
            if (this.number_multi_enabled())
                cells = this.selection; 
            else
                cells = [this.cursol];
            for (var k of cells) {
                switch (submode[0]) {
                    case "1":
                        // If the there are corner or sides present then get rid of them
                        // Only in Answer mode
                        if (this.mode.qa === "pu_a") {
                            var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                            var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

                            for (var j = 0; j < 4; j++)
                                if (this[this.mode.qa].numberS[corner_cursor + j])
                                    this.remove_value("numberS", corner_cursor + j);

                            for (var j = 0; j < 4; j++)
                                if (this[this.mode.qa].numberS[side_cursor + j])
                                    this.remove_value("numberS", side_cursor + j);
                        }

                        if (str_num.indexOf(key) != -1 && this[this.mode.qa].number[k]) {
                            con = parseInt(this[this.mode.qa].number[k][0], 10); // Convert to number
                            if (con >= 1 && con <= 9 && this[this.mode.qa].number[k][2] != "7") { // If already 1-9 exist, go to 2nd digit
                                number = con.toString() + key;
                            } else {
                                // It enters here when the cell already contains 2 digits.
                                number = key;
                            }
                        } else {
                            // It enters for first entry in a cell and then for alphabets or special characters i.e. non numbers
                            number = key;
                        }

                        this.set_value("number", k, [number, submode[1], submode[0]]);
                        break;
                    case "2": // Arrow
                        if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] != "7") {
                            con = this[this.mode.qa].number[k][0];
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
                            if (conA >= 1 && conA <= 9) { // If 1 to 9 got to the second digit
                                number = conA.toString() + key;
                            } else {
                                number = key;
                            }
                        } else {
                            number = key;
                        }
                        this.set_value("number", k, [number + arrow, submode[1], submode[0]]);
                        break;
                    case "3": // 1/4, corner
                    case "9": // Sides
                        if (this[this.mode.qa].numberS[k]) {
                            con = this[this.mode.qa].numberS[k][0];
                        } else {
                            con = "";
                        }
                        number = con + key;
                        this.set_value("numberS", k, [number, submode[1]]);
                        break;
                    case "4": //tapa
                        if (key === ".") { key = " "; }
                        if (this[this.mode.qa].number[k]) {
                            con = this[this.mode.qa].number[k][0];
                            mode = this[this.mode.qa].number[k][2];
                        } else {
                            con = "";
                            mode = "";
                        }
                        let con_expand = [...con];
                        if (mode != 2 && mode != 7) { // If not arrow mode
                            if (con_expand.length >= 0 && con_expand.length <= 3) { // Max 4 values
                                number = con + key;
                            } else {
                                number = con; // Don't update if more than 4 values
                            }
                        } else { // Overwrite if arrow
                            number = key;
                        }
                        this.set_value("number", k, [number, submode[1], submode[0]]);
                        break;
                    case "5": // Small
                    case "6": // Medium
                    case "10": //big
                    case "8": // Long
                        if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] != "2" && this[this.mode.qa].number[k][2] != "7") {
                            con = this[this.mode.qa].number[k][0];
                        } else {
                            con = "";
                        }
                        // Length limit of 10 except for Long submode which has 50
                        const limit = (submode[0] === "8") ? 50 : 10;
                        if (con.length < limit) {
                            number = con + key;
                            this.set_value("number", k, [number, submode[1], submode[0]]);
                        }
                        break;

                    case "7": // Candidates
                        if (str_num_no0.indexOf(key) != -1) {
                            if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] === "7") {
                                con = this[this.mode.qa].number[k][0];
                            } else {
                                con = "";
                            }
                            number = this.onofftext(9, key, con);
                            this.set_value("number", k, [number, submode[1], submode[0]]);
                        }
                        break;

                    case "11": // Killer Sum
                        var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                        if (this[this.mode.qa].numberS[corner_cursor]) {
                            con = " " + this[this.mode.qa].numberS[corner_cursor][0];
                        } else {
                            con = "";
                        }
                        number = con + key;
                        this.set_value("numberS", corner_cursor, [number, submode[1]]);
                        break;
                }
            }
        } else if (edit_mode === "symbol") {
            if (str_num.indexOf(key) != -1) {
                const symbolname = this.mode[this.mode.qa].symbol[0];
                if (this[this.mode.qa].symbol[this.cursol]) {
                    if (this[this.mode.qa].symbol[this.cursol][0] === parseInt(key, 10) && this[this.mode.qa].symbol[this.cursol][1] === symbolname) {
                        this.key_space(); // Delete if the contents are the same
                        return;
                    } else {
                        con = this[this.mode.qa].symbol[this.cursol][0];
                    }
                } else {
                    con = "";
                }

                if (this.onoff_symbolmode_list[symbolname]) { // List in ON-OFF mode
                    number = this.onofftext(this.onoff_symbolmode_list[symbolname], key, con);
                } else {
                    number = parseInt(key, 10);
                }
                this.record("symbol", this.cursol);
                this[this.mode.qa].symbol[this.cursol] = [number, symbolname, submode[1]];
                if (UserSettings.custom_colors_on) {
                    let cc = this.get_customcolor();
                    if (!cc || tinycolor.equals(cc, CustomColor.default_symbol_color(symbolname))) {
                        delete this[this.mode.qa + "_col"].symbol[this.cursol];
                    } else {
                        this[this.mode.qa + "_col"].symbol[this.cursol] = cc;
                    }
                }
                this.record_replay("symbol", this.cursol);
            }
        } else if (edit_mode === "sudoku") {
            switch (submode[0]) {
                case "1": // Normal mode
                    if (this.selection.length > 0 && str_all.indexOf(key) != -1) {
                        if (this.selection.length === 1) {
                            let clean_flag = this.check_neighbors(this.selection[0]);
                            if (!clean_flag) {
                                this.undoredo_counter = 0;
                            } else {
                                this.undoredo_counter = this.undoredo_counter + 1;
                            }
                        } else {
                            this.undoredo_counter = this.undoredo_counter + 1;
                        }
                        for (var k of this.selection) {
                            if (((this.mode.qa === "pu_a") &&
                                    this["pu_q"].number[k] &&
                                    this["pu_q"].number[k][2] === "1" &&
                                    pu.only_alphanumeric(parseInt(this["pu_q"].number[k][0])))) { // if single digit is present, dont modify that cell
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
                                    var edge_cursor = this.get_neighbors(k, 'edges');

                                    for (var j = 0; j < 4; j++) {
                                        if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                            this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                            delete this[this.mode.qa].numberS[corner_cursor + j];
                                            this.record_replay("numberS", corner_cursor + j, this.undoredo_counter);
                                        }
                                    }

                                    for (var j = 0; j < 4; j++) {
                                        if (this[this.mode.qa].numberS[side_cursor + j]) {
                                            this.record("numberS", side_cursor + j, this.undoredo_counter);
                                            delete this[this.mode.qa].numberS[side_cursor + j];
                                            this.record_replay("numberS", side_cursor + j, this.undoredo_counter);
                                        }
                                    }
                                }

                                this.record("number", k, this.undoredo_counter);
                                if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] === 1 && this[this.mode.qa].number[k][0] === key) {
                                    delete this[this.mode.qa].number[k];
                                } else {
                                    this[this.mode.qa].number[k] = [key, submode[1], "1"]; // Normal submode is 1
                                }
                                this.record_replay("number", k, this.undoredo_counter);
                            }
                        }
                    }
                    break;
                case "2": // Corner mode
                    if (this.grid_is_square()) {
                        if (this.selection.length > 0 && str_all.indexOf(key) != -1) {

                            if (this.selection.length === 1) {
                                this.undoredo_counter = 0;

                                // if the selected cell is on the edge then do not proceed
                                if (parseInt(this.selection[0] / (this.nx0 * this.ny0)) > 0) {
                                    break;
                                }
                            } else {
                                this.undoredo_counter = this.undoredo_counter + 1;
                            }
                            var j_start = 0;
                            var length_limit = 8;

                            // First step: go through all cells in the selection that don't have a main single digit, and
                            // collect the digits that are in the corner of each
                            let cells = [];
                            for (var k of this.selection) {
                                if ((this["pu_q"].number[k] && this["pu_q"].number[k][2] === "1" &&
                                        pu.only_alphanumeric(parseInt(this["pu_q"].number[k][0])) &&
                                        this.selection.length > 1) ||
                                    this["pu_a"].number[k] && this["pu_a"].number[k][2] === "1") { // if single digit is present, dont modify that cell
                                    continue;
                                } else if (this["pu_q"].number[k] && this["pu_q"].number[k][2] === "7" && this.selection.length > 1) {
                                    // This is for single digit obtained from candidate submode in Problem
                                    var sum = 0;
                                    for (var j = 0; j < 10; j++) {
                                        if (this["pu_q"].number[k][0][j] === 1) {
                                            sum += 1;
                                        }
                                    }
                                    if (sum === 1)
                                        continue;
                                } else if (this["pu_a"].number[k] && this["pu_a"].number[k][2] === "7") {
                                    // This is for digits obtained from candidate submode in Solution
                                    var sum = 0;
                                    for (var j = 0; j < 10; j++) {
                                        if (this["pu_a"].number[k][0][j] === 1) {
                                            sum += 1;
                                        }
                                    }
                                    if (sum === 1)
                                        continue;
                                }

                                // Collect all digits on the corners/sides of this cell
                                con = "";
                                var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                                var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

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
                                cells.push([k, con]);
                            }

                            // Second step: check if the new digit is present in all the cells. If so, we remove the digit, otherwise
                            // we add it to all the cells that don't have it yet
                            let remove = cells.every(([k, con]) => con && con.indexOf(key) !== -1);

                            // Third step: actually add or remove the new digit
                            for (var [k, con] of cells) {
                                number = "";

                                var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                                var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);
                                if (remove) { // if digit already exists
                                    con = con.replace(key, '');

                                    // remove the last digit from old location
                                    if ((con.length + 1) < (5 - j_start)) {
                                        this.remove_value("numberS", corner_cursor + con.length + j_start);
                                    } else {
                                        this.remove_value("numberS", side_cursor + con.length - 4 + 2 * j_start);
                                    }
                                    if (con) {
                                        if (con.length < (5 - j_start)) {
                                            for (var j = j_start; j < (con.length + j_start); j++) {
                                                this.set_value("numberS", corner_cursor + j, [con[j - j_start], submode[1]]);
                                            }
                                        } else {
                                            for (var j = j_start; j < 4; j++) {
                                                this.set_value("numberS", corner_cursor + j, [con[j - j_start], submode[1]]);
                                            }
                                            for (var j = 4 + j_start; j < (con.length + 2 * j_start); j++) {
                                                this.set_value("numberS", side_cursor + j - 4, [con[j - 2 * j_start], submode[1]]);
                                            }
                                        }
                                    }
                                } else if (con.indexOf(key) === -1 && con.length < length_limit) { // If digit doesnt exist in the cell
                                    con += key;
                                    if (con.length < (5 - j_start)) {
                                        this.set_value("numberS", corner_cursor + con.length - 1 + j_start, [key, submode[1]]);
                                    } else {
                                        this.set_value("numberS", side_cursor + con.length - 5 + 2 * j_start, [key, submode[1]]);
                                    }
                                }
                            }
                        }
                    }
                    break;
                case "3": // Centre mode
                    if (this.selection.length > 0 && str_all.indexOf(key) != -1) {
                        if (this.selection.length === 1) {
                            this.undoredo_counter = 0;
                        } else {
                            this.undoredo_counter = this.undoredo_counter + 1;
                        }
                        // First step: go through all cells in the selection that don't have a main single digit, and
                        // collect the digits that are in the center of each
                        let cells = [];
                        for (var k of this.selection) {
                            con = "";
                            // if single digit is present, dont modify that cell
                            if (this["pu_q"].number[k] && this["pu_q"].number[k][2] === "1" &&
                                    pu.only_alphanumeric(parseInt(this["pu_q"].number[k][0])))
                                continue;
                            if (this["pu_a"].number[k] && this["pu_a"].number[k][2] === "1")
                                continue;

                            if (this["pu_q"].number[k] && this["pu_q"].number[k][2] === "7") {
                                // This is for single digit obtained from candidate submode
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_q"].number[k][0][j] === 1) {
                                        sum += 1;
                                        con += (j + 1).toString();
                                    }
                                }
                                // Single candidate: skip
                                if (sum === 1)
                                    continue;
                            } else if (this["pu_a"].number[k] && this["pu_a"].number[k][2] === "7") {
                                // This is for digits obtained from candidate submode
                                var sum = 0;
                                for (var j = 0; j < 10; j++) {
                                    if (this["pu_a"].number[k][0][j] === 1) {
                                        sum += 1;
                                        con += (j + 1).toString();
                                    }
                                }
                                // Single candidate: skip
                                if (sum === 1)
                                    continue;
                            } else {
                                if (this["pu_q"].number[k])
                                    con = this["pu_q"].number[k][0];
                                else if (this["pu_a"].number[k])
                                    con = this["pu_a"].number[k][0];
                            }

                            cells.push([k, con]);
                        }

                        // Second step: check if the new digit is present in all the cells. If so, we remove the digit, otherwise
                        // we add it to all the cells that don't have it yet
                        let remove = cells.every(([k, con]) => con && con.indexOf(key) !== -1);

                        // Third step: actually add or remove the new digit
                        for (var [k, con] of cells) {
                            number = "";

                            // Check if we're removing, or if not, if the digit isn't already there
                            if (remove)
                                number = con.split("").filter(c => c !== key);
                            else if (con.indexOf(key) === -1)
                                number = (con + key).split("");
                            else
                                continue;

                            number = number.sort().join("");

                            // if number empty then delete the entry
                            if (number !== "") {
                                // S submode is 5, M submode is 6
                                // dynamic (i.e. upto 5 digits larger size and then smaller size)
                                let size = "6";
                                if ((UserSettings.sudoku_centre_size === 1 && number.length > 5) ||
                                        UserSettings.sudoku_centre_size === 3) { // all small
                                    size = "5";
                                }

                                this.set_value("number", k, [number, submode[1], size]);
                            } else {
                                this.remove_value("number", k);
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

    check_neighbors(k) {
        var corner_cursor = 4 * (k + this.nx0 * this.ny0);
        var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);
        var edge_cursor = this.get_neighbors(k, 'edges');
        let clean_flag = false;

        // if even one element exist to be cleaned then return true
        for (var j = 0; j < 4; j++) {
            if (this[this.mode.qa].numberS[corner_cursor + j]) {
                clean_flag = true;
                return clean_flag;
            }
        }

        for (var j = 0; j < 4; j++) {
            if (this[this.mode.qa].numberS[side_cursor + j]) {
                clean_flag = true;
                return clean_flag;
            }
        }

        for (var j = 0; j < 4; j++) {
            if (this[this.mode.qa].number[edge_cursor[j]]) {
                clean_flag = true;
                return clean_flag;
            }
        }

        // if no element exist then it will reach here
        return clean_flag;
    }

    key_space(keypressed = 0, shift_key = false, ctrl_key = false) {
        if (this.mode[this.mode.qa].edit_mode === "number") {
            if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3" || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                this.record("numberS", this.cursolS);
                delete this[this.mode.qa].numberS[this.cursolS];
                this.record_replay("numberS", this.cursolS);
            } else {
                // Remove the corner and side numbers
                var corner_cursor = 4 * (this.cursol + this.nx0 * this.ny0);
                var side_cursor = 4 * (this.cursol + 2 * this.nx0 * this.ny0);

                for (var j = 0; j < 4; j++) {
                    if (this[this.mode.qa].numberS[corner_cursor + j]) {
                        this.record("numberS", corner_cursor + j);
                        delete this[this.mode.qa].numberS[corner_cursor + j];
                        this.record_replay("numberS", corner_cursor + j);
                    }
                }

                for (var j = 0; j < 4; j++) {
                    if (this[this.mode.qa].numberS[side_cursor + j]) {
                        this.record("numberS", side_cursor + j);
                        delete this[this.mode.qa].numberS[side_cursor + j];
                        this.record_replay("numberS", side_cursor + j);
                    }
                }

                this.record("number", this.cursol);
                delete this[this.mode.qa].number[this.cursol];
                this.record_replay("number", this.cursol);
            }
        } else if (this.mode[this.mode.qa].edit_mode === "symbol") {
            this.record("symbol", this.cursol);
            delete this[this.mode.qa].symbol[this.cursol];
            if (UserSettings.custom_colors_on) {
                delete this[this.mode.qa + "_col"].symbol[this.cursol];
            }
            this.record_replay("symbol", this.cursol);
        } else if (this.mode[this.mode.qa].edit_mode === "sudoku") {
            if (this.selection.length === 1) {
                this.undoredo_counter = 0;
            } else {
                this.undoredo_counter = this.undoredo_counter + 1;
            }
            if (keypressed === 46 || keypressed === 8 || this.ondown_key === "touchstart") {
                if (this.selection.length > 0) {
                    if (!ctrl_key && !shift_key) {
                        for (var k of this.selection) {
                            if (this[this.mode.qa].number[k]) {
                                this.record("number", k, this.undoredo_counter);
                                delete this[this.mode.qa].number[k];
                                this.record_replay("number", k, this.undoredo_counter);
                            }

                            var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                            var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

                            for (var j = 0; j < 4; j++) {
                                if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                    this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                    delete this[this.mode.qa].numberS[corner_cursor + j];
                                    this.record_replay("numberS", corner_cursor + j, this.undoredo_counter);
                                }
                            }

                            for (var j = 0; j < 4; j++) {
                                if (this[this.mode.qa].numberS[side_cursor + j]) {
                                    this.record("numberS", side_cursor + j, this.undoredo_counter);
                                    delete this[this.mode.qa].numberS[side_cursor + j];
                                    this.record_replay("numberS", side_cursor + j, this.undoredo_counter);
                                }
                            }
                        }
                    } else if (ctrl_key && !shift_key) {
                        if (this.selection.length > 0) {
                            for (var k of this.selection) {
                                if (this[this.mode.qa].number[k] && (this[this.mode.qa].number[k][2] === "5" || this[this.mode.qa].number[k][2] === "6")) {
                                    this.record("number", k, this.undoredo_counter);
                                    delete this[this.mode.qa].number[k];
                                    this.record_replay("number", k, this.undoredo_counter);
                                }
                            }
                        }
                    } else if (shift_key && !ctrl_key) {
                        if (this.selection.length > 0) {
                            for (var k of this.selection) {
                                var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                                var side_cursor = 4 * (k + 2 * this.nx0 * this.ny0);

                                for (var j = 0; j < 4; j++) {
                                    if (this[this.mode.qa].numberS[corner_cursor + j]) {
                                        this.record("numberS", corner_cursor + j, this.undoredo_counter);
                                        delete this[this.mode.qa].numberS[corner_cursor + j];
                                        this.record_replay("numberS", corner_cursor + j, this.undoredo_counter);
                                    }
                                }

                                for (var j = 0; j < 4; j++) {
                                    if (this[this.mode.qa].numberS[side_cursor + j]) {
                                        this.record("numberS", side_cursor + j, this.undoredo_counter);
                                        delete this[this.mode.qa].numberS[side_cursor + j];
                                        this.record_replay("numberS", side_cursor + j, this.undoredo_counter);
                                    }
                                }
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
                                this.record_replay("number", k, this.undoredo_counter);
                            }
                        }
                    }
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    if (this.selection.length > 0) {
                        for (var k of this.selection) {
                            if (this[this.mode.qa].number[k] && (this[this.mode.qa].number[k][2] === "5" || this[this.mode.qa].number[k][2] === "6")) {
                                this.record("number", k, this.undoredo_counter);
                                delete this[this.mode.qa].number[k];
                                this.record_replay("number", k, this.undoredo_counter);
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
                                    this.record_replay("numberS", corner_cursor + j, this.undoredo_counter);
                                }
                            }

                            for (var j = 0; j < 4; j++) {
                                if (this[this.mode.qa].numberS[side_cursor + j]) {
                                    this.record("numberS", side_cursor + j, this.undoredo_counter);
                                    delete this[this.mode.qa].numberS[side_cursor + j];
                                    this.record_replay("numberS", side_cursor + j, this.undoredo_counter);
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
                this.record_replay("numberS", this.cursolS);
            } else {
                this.record("number", this.cursol);
                delete this[this.mode.qa].number[this.cursol];
                this.record_replay("number", this.cursol);
                this.record("symbol", this.cursol);
                delete this[this.mode.qa].symbol[this.cursol];
                this.record_replay("symbol", this.cursol);
            }
        }
        this.redraw();
    }

    key_backspace() {
        var number;
        if (this.mode[this.mode.qa].edit_mode === "number") {
            let submode = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0];
            if (this.selection.length > 0) {
                if (this.selection.length === 1) {
                    let clean_flag = this.check_neighbors(this.selection[0]);
                    if (!clean_flag) {
                        this.undoredo_counter = 0;
                    } else {
                        this.undoredo_counter = this.undoredo_counter + 1;
                    }
                } else {
                    this.undoredo_counter = this.undoredo_counter + 1;
                }
                let cells = null;
                if (this.number_multi_enabled())
                    cells = this.selection; 
                else
                    cells = [this.cursol];

                for (var k of cells) {
                    if (submode === "3" || submode === "9") { // 1/4 and side
                        if (this[this.mode.qa].numberS[k]) {
                            this.record("numberS", k, this.undoredo_counter);
                            number = this[this.mode.qa].numberS[k][0].slice(0, -1);
                            if (number) {
                                this[this.mode.qa].numberS[k][0] = number;
                            } else {
                                delete this[this.mode.qa].numberS[k];
                            }
                            this.record_replay("numberS", k, this.undoredo_counter);
                        }
                    } else if (submode === "11") {
                        var corner_cursor = 4 * (k + this.nx0 * this.ny0);
                        if (this[this.mode.qa].numberS[corner_cursor]) {
                            this.record("numberS", corner_cursor, this.undoredo_counter);
                            number = this[this.mode.qa].numberS[corner_cursor][0].slice(1, -1);
                            if (number) {
                                this[this.mode.qa].numberS[corner_cursor][0] = number;
                            } else {
                                delete this[this.mode.qa].numberS[corner_cursor];
                            }
                            this.record_replay("numberS", corner_cursor, this.undoredo_counter);
                        }
                    } else {
                        if (this[this.mode.qa].number[k] && this[this.mode.qa].number[k][2] != 7) {
                            this.record("number", k, this.undoredo_counter);
                            number = this[this.mode.qa].number[k][0];
                            if (number) {
                                if (this[this.mode.qa].number[k][2] === "2") {
                                    if (number.slice(-2, -1) === "_") {
                                        number = number.slice(0, -2).slice(0, -1) + number.slice(-2);
                                    } else {
                                        number = number.slice(0, -1);
                                    }
                                } else {
                                    number = number.slice(0, -1);
                                }
                                if (number ||
                                    this[this.mode.qa].number[k][1] === 6 ||
                                    this[this.mode.qa].number[k][1] === 7 ||
                                    this[this.mode.qa].number[k][1] === 11) {
                                    this[this.mode.qa].number[k][0] = number;
                                } else {
                                    delete this[this.mode.qa].number[k];
                                }
                            }
                            this.record_replay("number", k, this.undoredo_counter);
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

    handle_rect_mousedown(e, ctrl, num, obj) {
        this.rect_surface_draw = false;

        let edit_mode = this.mode[this.mode.qa].edit_mode;

        const modes = ['sudoku', 'number', 'surface'];

        // Check if this is the start of an alt-drag rectangular selection event
        if (isAltKeyHeld(e) && this.grid_is_square() && modes.includes(edit_mode)) {
            if (!isShiftKeyHeld(e))
                this.selection = [];

            // Remember the first cell clicked for rectangular selection, as well as the
            // old selection so we can easily combine them
            this.rect_select_base = obj.index;
            this.old_selection = this.selection;

            if (edit_mode === "surface") {
                this.rect_surface_draw = true;
                this.rect_surface_secondary = (this.mouse_mode === "down_right");

                // Check here if the start cell already has the given color (primary or secondary).
                // If so, we remove the selected cells instead.
                let color = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
                if (this.rect_surface_secondary)
                    color = UserSettings.secondcolor;
                this.surface_remove = false;
                if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === color)
                    this.surface_remove = true;
            }
        } else {
            this.rect_select_base = null;
            this.old_selection = [];
        }
    }

    mouseevent(x, y, num, ctrl_key = false, e = null, obj = null) {
        if (!pu.replay) {
            num = this.recalculate_num(x, y, num); //for uniform tiling
            let edit_mode = this.mode[this.mode.qa].edit_mode;
            let submode = this.mode[this.mode.qa][edit_mode][0];

            // Map shift/ctrl-click to right click in certain modes for convenience
            if (ctrl_key && this.mouse_mode === "down_left" &&
                    (edit_mode === "surface" || edit_mode === "combi")) {
                this.mouse_mode = "down_right";
                this.mouse_click = 2;
                this.mouse_click_last = 2;
            }

            // Deal with starting a rectangular selection
            if (e !== null && (this.mouse_mode === "down_left" || this.mouse_mode === "down_right"))
                this.handle_rect_mousedown(e, ctrl_key, num, obj);

            switch (edit_mode) {
                case "surface":
                    this.mouse_surface(x, y, num);
                    break;
                case "line":
                    if (submode === "3") {
                        this.mouse_linefree(x, y, num);
                    } else if (submode === "4") {
                        this.mouse_lineX(x, y, num);
                    } else {
                        this.mouse_line(x, y, num);
                    }
                    break;
                case "lineE":
                    if (submode === "3") {
                        this.mouse_lineEfree(x, y, num);
                    } else if (submode === "4") {
                        this.mouse_lineEX(x, y, num);
                    } else {
                        this.mouse_lineE(x, y, num);
                    }
                    break;
                case "wall":
                    this.mouse_wall(x, y, num);
                    break;
                case "number":
                    // Multi-selection mode: treat this just like sudoku mode if we're in
                    // a submode that can work with multiple cells
                    if (this.number_multi_enabled())
                        this.mouse_sudoku(x, y, num, ctrl_key);
                    else
                        this.mouse_number(x, y, num, ctrl_key);
                    if (pu.mouse_mode === "down_left") {
                        let isNumberS = ["3", "9", "11"].includes(submode)
                        let enableLoadButton = (!isNumberS && pu[pu.mode.qa].number[pu.cursol]) || (isNumberS && pu[pu.mode.qa].numberS[pu.cursolS]);
                        document.getElementById("closeBtn_input3").disabled = !enableLoadButton;
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
    }

    // Double click: select all cells with the same value as the clicked cell
    // XXX: support other cell types
    dblmouseevent(x, y, num, ctrl_key = false) {
        let edit_mode = this.mode[this.mode.qa].edit_mode;
        let priority = ["number", "multicolor"];

        // Treat sudoku mode like number mode here
        if (edit_mode === "sudoku")
            edit_mode = "number";

        if (priority.includes(edit_mode)) {
            // Put the current mode as first priority
            priority.sort((a, b) => (b === edit_mode));

            if (!ctrl_key)
                this.selection = [];

            let remove = this.selection.indexOf(num) !== -1;

            let value;
            // Go through the available modes in priority order to search for a value
            // we can select other cells by
            for (let mode of priority) {
                if (mode === "multicolor") {
                    value = this.pu_q.surface[num] || this.pu_a.surface[num];
                    value = JSON.stringify(value);
                } else if (mode === "number") {
                      value = this.pu_q.number[num] || this.pu_a.number[num];
                }

                if (value) {
                    edit_mode = mode;
                    break;
                }
            }

            if (!value)
                return;

            // Normal sudoku values
            if (value) {
                for (let qa of ["pu_q", "pu_a"]) {
                    let puzzle = this[qa];

                    for (let c of this.centerlist) {
                        let match;
                        if (edit_mode === "multicolor") {
                            if (JSON.stringify(puzzle.surface[c]) === value)
                                match = true;
                        }
                        else {
                            if (puzzle.number[c] && puzzle.number[c][0] === value[0])
                                match = true;
                        }

                        if (match) {
                            if (remove) {
                                var index = this.selection.indexOf(c);
                                if (index !== -1)
                                    this.selection.splice(index, 1);
                            } else if (this.selection.indexOf(c) === -1)
                                this.selection.push(c);
                        }
                    }
                }
            }
            this.redraw();
        }
    }

    //////////////////////////
    // surface
    //////////////////////////

    mouse_surface(x, y, num) {
        if (this.mouse_mode === "down_left") {
            if (!this.rect_surface_draw) {
                this.drawing = true;
                if (this.ondown_key === "touchstart") {
                    this.re_surface(num);
                } else {
                    this.re_surface_twobutton(num);
                }
                this.last = num;
            }
        } else if (this.mouse_mode === "down_right") {
            if (!this.rect_surface_draw) {
                this.drawing = true;
                this.re_surfaceR(num);
                this.last = num;
            }
        } else if (this.mouse_mode === "move") {
            this.re_surfacemove(num);
            this.last = num;
        } else if (this.mouse_mode === "up") {
            // If rectangular area is being selected, add all the cells now
            if (this.rect_surface_draw) {
                var color = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
                let cc;
                if (this.rect_surface_secondary) {
                    color = UserSettings.secondcolor;
                    if (UserSettings.custom_colors_on)
                        cc = this.get_rgbcolor(color);
                } else if (UserSettings.custom_colors_on)
                    cc = this.get_customcolor();

                this.undoredo_counter++;
                for (var k of this.selection) {
                    if (this.surface_remove)
                        this.remove_value("surface", k);
                    else
                        this.set_value("surface", k, color, cc);
                }

                // Reset all rectangle-drawing attributes
                this.rect_surface_draw = false;
                this.rect_surface_secondary = false;
                this.selection = [];
                this.redraw();
            }

            if (this.last > 0) {
                this.cursol = this.last;
            }
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
        var allowed_styles = [1, 8, 3, 4]; // Dark Grey, Grey, Light Grey, Black
        this.record("surface", num);
        let rightclick_color = UserSettings.secondcolor;
        if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === color && allowed_styles.includes(color)) {
            this[this.mode.qa].surface[num] = rightclick_color;
            if (UserSettings.custom_colors_on) {
                let cc = this.get_rgbcolor(rightclick_color);
                if (!cc || tinycolor.equals(cc, CustomColor.default_surface_style_color(rightclick_color))) {
                    delete this[this.mode.qa + "_col"].surface[num];
                } else {
                    this[this.mode.qa + "_col"].surface[num] = cc;
                }
            }
            this.drawing_mode = rightclick_color;
        } else if (this[this.mode.qa].surface[num] && (this[this.mode.qa].surface[num] === color || (this[this.mode.qa].surface[num] === rightclick_color && allowed_styles.includes(color)))) {
            delete this[this.mode.qa].surface[num];
            if (UserSettings.custom_colors_on) {
                delete this[this.mode.qa + "_col"].surface[num];
            }
            this.drawing_mode = 0;
        } else {
            this[this.mode.qa].surface[num] = color;
            if (UserSettings.custom_colors_on) {
                let cc = this.get_customcolor();
                if (!cc || tinycolor.equals(cc, CustomColor.default_surface_style_color(color))) {
                    delete this[this.mode.qa + "_col"].surface[num];
                } else {
                    this[this.mode.qa + "_col"].surface[num] = cc;
                }
            }
            this.drawing_mode = color;
        }
        this.record_replay("surface", num);
        this.redraw();
    }

    re_surface_twobutton(num) {
        var color = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
        this.record("surface", num);
        if (this[this.mode.qa].surface[num] && (this[this.mode.qa].surface[num] === color)) {
            delete this[this.mode.qa].surface[num];
            if (UserSettings.custom_colors_on) {
                delete this[this.mode.qa + "_col"].surface[num];
            }
            this.drawing_mode = 0;
        } else {
            this[this.mode.qa].surface[num] = color;
            if (UserSettings.custom_colors_on) {
                let cc = this.get_customcolor();
                if (!cc || tinycolor.equals(cc, CustomColor.default_surface_style_color(color))) {
                    delete this[this.mode.qa + "_col"].surface[num];
                } else {
                    this[this.mode.qa + "_col"].surface[num] = cc;
                }
            }
            this.drawing_mode = color;
        }
        this.record_replay("surface", num);
        this.redraw();
    }

    re_surfaceR(num) {
        this.record("surface", num);
        let rightclick_color = UserSettings.secondcolor;
        if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] === rightclick_color) {
            delete this[this.mode.qa].surface[num];
            if (UserSettings.custom_colors_on) {
                delete this[this.mode.qa + "_col"].surface[num];
            }
            this.drawing_mode = 0;
        } else {
            this[this.mode.qa].surface[num] = rightclick_color;
            if (UserSettings.custom_colors_on) {
                let cc = this.get_rgbcolor(rightclick_color);
                if (!cc || tinycolor.equals(cc, CustomColor.default_surface_style_color(rightclick_color))) {
                    delete this[this.mode.qa + "_col"].surface[num];
                } else {
                    this[this.mode.qa + "_col"].surface[num] = cc;
                }
            }
            this.drawing_mode = rightclick_color;
        }
        this.record_replay("surface", num);
        this.redraw();
    }

    re_surfacemove(num) {
        if (this.drawing) {
            if (this.drawing_mode === 0) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                    if (UserSettings.custom_colors_on) {
                        delete this[this.mode.qa + "_col"].surface[num];
                    }
                    this.record_replay("surface", num);
                    this.redraw();
                }
            } else {
                let cc = undefined;
                if (UserSettings.custom_colors_on) {
                    // Not right click
                    if (this.mouse_click !== 2) {
                        if (this.drawing_mode === 2) {
                            cc = this.get_rgbcolor(this.drawing_mode);
                        } else {
                            cc = this.get_customcolor();
                        }
                        if (!cc || tinycolor.equals(cc, CustomColor.default_surface_style_color(this.drawing_mode))) {
                            cc = undefined;
                        }
                    }
                }
                if (!this[this.mode.qa].surface[num] || this[this.mode.qa].surface[num] != this.drawing_mode || this[this.mode.qa + "_col"].surface[num] != cc) {
                    this.record("surface", num);
                    this[this.mode.qa].surface[num] = this.drawing_mode;
                    if (UserSettings.custom_colors_on) {
                        if (!cc) {
                            delete this[this.mode.qa + "_col"].surface[num];
                        } else {
                            this[this.mode.qa + "_col"].surface[num] = cc;
                        }
                    }
                    this.record_replay("surface", num);
                    this.redraw();
                }
            }
        }
    }

    get_rgbcolor(choice) {
        switch (choice) {
            case 1:
                return Color.GREY_DARK_VERY;
                break;
            case 8:
                return Color.GREY;
                break;
            case 3:
                return Color.GREY_LIGHT;
                break;
            case 4:
                return Color.BLACK;
                break;
            case 2:
                return Color.GREEN_LIGHT_VERY;
                break;
            case 5:
                return Color.BLUE_LIGHT_VERY;
                break;
            case 6:
                return Color.RED_LIGHT;
                break;
            case 7:
                return Color.YELLOW;
                break;
            case 9:
                return Color.PINK_LIGHT;
                break;
            case 10:
                return Color.ORANGE_LIGHT;
                break;
            case 11:
                return Color.PURPLE_LIGHT;
                break;
            case 12:
                return Color.BROWN_LIGHT;
                break;
        }
    }

    //////////////////////////
    // line
    //////////////////////////

    line_key(a, b) {
      return (Math.min(a, b)).toString() + "," + (Math.max(a, b)).toString();
    }

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
    re_line(array, num, line_style, group_counter = 0) {
        if ((this[this.mode.qa][array][num] === line_style) || (this["pu_q"]["deletelineE"][num] === line_style)) {
            if (this.drawing_mode === 100) { // single line, edge
                if (group_counter > 0) { // for killer
                    this.record(array, num, group_counter);
                } else {
                    this.record(array, num);
                }
                if (array === "deletelineE") {
                    delete this["pu_q"][array][num];
                } else {
                    delete this[this.mode.qa][array][num];
                    if (UserSettings.custom_colors_on) {
                        delete this[this.mode.qa + "_col"][array][num];
                    }
                }
                if (group_counter > 0) {
                    this.record_replay(array, num, group_counter);
                } else {
                    this.record_replay(array, num);
                }
                if (group_counter === 0) { //group_counter > 0 belongs to automatic killer cage
                    this.drawing_mode = 0;
                }
            } else if (this.drawing_mode === 0) { // to draw in a stretch
                this.record(array, num);
                if (array === "deletelineE") {
                    delete this["pu_q"][array][num];
                } else {
                    delete this[this.mode.qa][array][num];
                    if (UserSettings.custom_colors_on) {
                        delete this[this.mode.qa + "_col"][array][num];
                    }
                }
                this.record_replay(array, num);
            }
        } else {
            if (this.drawing_mode === 100) { // single line, edge
                if (group_counter > 0) {
                    this.record(array, num, group_counter);
                } else {
                    this.record(array, num);
                }
                if (array === "deletelineE") {
                    this["pu_q"][array][num] = line_style;
                } else {
                    this[this.mode.qa][array][num] = line_style;
                    if (UserSettings.custom_colors_on) {
                        let cc = this.get_customcolor();
                        if (!cc || tinycolor.equals(cc, CustomColor.default_line_style_color(line_style))) {
                            delete this[this.mode.qa + "_col"][array][num];
                        } else {
                            this[this.mode.qa + "_col"][array][num] = cc;
                        }
                    }
                }
                if (group_counter > 0) {
                    this.record_replay(array, num, group_counter);
                } else {
                    this.record_replay(array, num);
                }
                if (group_counter === 0) { //group_counter > 0 belongs to automatic killer cage
                    this.drawing_mode = line_style;
                }
            } else if (this.drawing_mode === line_style) { // to draw in a stretch
                this.record(array, num);
                if (array === "deletelineE") {
                    this["pu_q"][array][num] = line_style;
                } else {
                    this[this.mode.qa][array][num] = line_style;
                    if (UserSettings.custom_colors_on) {
                        let cc = this.get_customcolor();
                        if (!cc || tinycolor.equals(cc, CustomColor.default_line_style_color(line_style))) {
                            delete this[this.mode.qa + "_col"][array][num];
                        } else {
                            this[this.mode.qa + "_col"][array][num] = cc;
                        }
                    }
                }
                this.record_replay(array, num);
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
                if (UserSettings.custom_colors_on) {
                    delete this[this.mode.qa + "_col"].freeline[key];
                }
            } else {
                this[this.mode.qa].freeline[key] = this.drawing_mode;
                if (UserSettings.custom_colors_on) {
                    let cc = this.get_customcolor();
                    if (!cc || tinycolor.equals(cc, CustomColor.default_line_style_color(this.drawing_mode))) {
                        delete this[this.mode.qa + "_col"].freeline[key];
                    } else {
                        this[this.mode.qa + "_col"].freeline[key] = cc;
                    }
                }
            }
            this.record_replay("freeline", key);
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
            if (UserSettings.custom_colors_on) {
                delete this[this.mode.qa + "_col"].line[num];
            }
            this.record_replay("line", num);
        } else {
            this.record("line", num);
            this[this.mode.qa].line[num] = 98;
            if (UserSettings.custom_colors_on) {
                let cc = this.get_customcolor();
                if (!cc || tinycolor.equals(cc, CustomColor.default_line_style_color(98))) {
                    delete this[this.mode.qa + "_col"].line[num];
                } else {
                    this[this.mode.qa + "_col"].line[num] = cc;
                }
            }
            this.record_replay("line", num);
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
                if (UserSettings.custom_colors_on) {
                    delete this[this.mode.qa + "_col"].freelineE[key];
                }
            } else {
                this[this.mode.qa].freelineE[key] = this.drawing_mode;
                if (UserSettings.custom_colors_on) {
                    let cc = this.get_customcolor();
                    if (!cc || tinycolor.equals(cc, CustomColor.default_line_style_color(this.drawing_mode))) {
                        delete this[this.mode.qa + "_col"].freelineE[key];
                    } else {
                        this[this.mode.qa + "_col"].freelineE[key] = cc;
                    }

                }
            }
            this.record_replay("freelineE", key);
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
            if (UserSettings.custom_colors_on) {
                delete this[this.mode.qa + "_col"].lineE[num];
            }
            this.record_replay("lineE", num);
        } else {
            this.record("lineE", num);
            this[this.mode.qa].lineE[num] = 98;
            if (UserSettings.custom_colors_on) {
                let cc = this.get_customcolor();
                if (!cc || tinycolor.equals(cc, CustomColor.default_line_style_color(98))) {
                    delete this[this.mode.qa + "_col"].lineE[num];
                } else {
                    this[this.mode.qa + "_col"].lineE[num] = cc;
                }
            }
            this.record_replay("lineE", num);
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

            // Remember cursolS
            if (this.grid_is_square()) {
                if (!this.cellsoutsideFrame.includes(this.cursol)) {
                    this.cursolS = 4 * (this.cursol + this.nx0 * this.ny0);
                }
            }
            this.redraw();
        } else if (this.mouse_mode === "down_right") {
            this.cursol = num;

            // Remember cursolS
            if (this.grid_is_square()) {
                if (!this.cellsoutsideFrame.includes(this.cursol)) {
                    this.cursolS = 4 * (this.cursol + this.nx0 * this.ny0);
                }
            }
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

    mouse_sudoku(x, y, num, ctrl_key = false) {
        // if (this.point[num].type === 0) {}  // Add this line, to ignore corners and allow diagonal selection, and set type = [0, 1]
        if (this.mouse_mode === "down_left") {
            num = this.coord_p_edgex(x, y, 0.15); // reducing the bounding box for edge cells to be less aggressive
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

            // Remember cursolS
            if (this.grid_is_square()) {
                if (!this.cellsoutsideFrame.includes(this.cursol)) {
                    this.cursolS = 4 * (this.cursol + this.nx0 * this.ny0);
                }
            }
            this.redraw();
        } else if (this.mouse_mode === "move") {
            // if the first selected position is edge then do not consider move
            if (this.cursol && this.cursol >= this.nx0 * this.ny0 &&
                this.gridtype !== "iso" && this.gridtype !== "tetrakis_square" && this.gridtype !== "truncated_square" &&
                this.gridtype !== "snub_square" && this.gridtype !== "cairo_pentagonal" &&
                this.gridtype !== "rhombitrihexagonal" && this.gridtype !== "deltoidal_trihexagonal") {
                // do nothing
            } else if (this.select_remove && this.drawing) {
                let i = this.selection.indexOf(num);
                if (i !== -1)
                    this.selection.splice(i, 1);
            } else if (!this.selection.includes(num) && this.drawing) {
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
                this.record_replay("number", this.cursol);
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
            if (UserSettings.panel_shown && !this.onoff_symbolmode_list[this.mode[this.mode.qa].symbol[0]]) {
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
        if (document.getElementById('sub_cage1').checked) {
            if (this.mouse_mode === "down_left") {
                this.drawing = true;
                // find if num already exist
                let num_index = this.cageselection.indexOf(num);
                if (num_index === -1) {
                    this.cageselection.push(num);
                }
                if (!this.selection.includes(num)) {
                    this.selection.push(num);
                }
                this.redraw();
                this.cursol = num;
            } else if (this.mouse_mode === "move") {
                if (this.drawing) {
                    if (!this.cageselection.includes(num)) {
                        this.cageselection.push(num);
                    }
                    if (!this.selection.includes(num)) {
                        this.selection.push(num);
                    }
                    this.redraw();
                } else {
                    this.cageselection = [];
                }
            } else if (this.mouse_mode === "up") {
                this.drawing = false;
                let cageexist_status = false;
                let skip_cages = false;
                let array = "cage";
                let arraykill = "killercages";
                let grid_matrix = [];
                let cageexist_loc;
                let key;

                // Grid Size
                let row_size = parseInt(this.ny0 - 4);
                let col_size = parseInt(this.nx0 - 4);

                // sort cage
                let sortedcages = this.cageselection.sort((a, b) => a - b);

                let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];

                // Find if any cell of the new cage already has a cage
                for (let j = 0; j < this[this.mode.qa][arraykill].length; j++) {
                    let killercages_cells = [].concat.apply([], this[this.mode.qa][arraykill][j]);
                    for (let i = 0; i < sortedcages.length; i++) {
                        if (killercages_cells.includes(sortedcages[i])) {
                            cageexist_status = true;
                            cageexist_loc = j;
                            break;
                        }
                    }
                    if (cageexist_status) { // to exit from outermost for loop
                        break;
                    }
                }

                // Find if any cell of the new cage has outside half grid cells then skip
                for (let i = 0; i < sortedcages.length; i++) {
                    let col_num = (sortedcages[i] % (this.nx0)) - 2;
                    let row_num = parseInt(sortedcages[i] / this.nx0) - 2;

                    // If cage selection has outisde half grid cells then skip
                    if ((row_num < 0) || (row_num >= row_size) || (col_num < 0) || (col_num >= col_size)) {
                        cageexist_status = true;
                        skip_cages = true;
                        break;
                    }
                }

                if (!cageexist_status) {

                    // undo redo group counter
                    this.undoredo_counter = this.undoredo_counter + 1;

                    // if cage does not exist, then add to killer cages.
                    this.record(arraykill, -1, this.undoredo_counter);
                    this[this.mode.qa][arraykill].push(sortedcages);
                    // let min_cell = Math.min(...this.cageselection);
                    // let max_cell = Math.max(...this.cageselection);

                    // cage cell locations
                    for (let i = 0; i < row_size; i++) {
                        grid_matrix[i] = new Array(parseInt(col_size)).fill(0);
                    }
                    for (let i = 0; i < sortedcages.length; i++) {
                        let col_num = (sortedcages[i] % (this.nx0)) - 2;
                        let row_num = parseInt(sortedcages[i] / this.nx0) - 2;
                        grid_matrix[row_num][col_num] = 1;
                    }

                    // remember drawing_mode
                    let draw_mode = this.drawing_mode;
                    this.drawing_mode = 100;

                    // Find the corner coordinates of the cell
                    for (let i = 0; i < sortedcages.length; i++) {
                        let col_num = (sortedcages[i] % (this.nx0)) - 2;
                        let row_num = parseInt(sortedcages[i] / this.nx0) - 2;

                        // current cell
                        let top_left = 4 * (sortedcages[i] + this.nx0 * this.ny0);
                        let top_right = top_left + 1;
                        let bottom_left = top_left + 2;
                        let bottom_right = top_left + 3;

                        // check if left cell is shared
                        if (col_num !== 0) {
                            if (grid_matrix[row_num][col_num - 1]) {

                                // left shared cell
                                let top_left_left = 4 * (sortedcages[i] - 1 + this.nx0 * this.ny0);
                                let top_right_left = top_left_left + 1;
                                let bottom_left_left = top_left_left + 2;
                                let bottom_right_left = top_left_left + 3;

                                if ((row_num !== 0) && (grid_matrix[row_num - 1][col_num - 1]) && (grid_matrix[row_num - 1][col_num])) {
                                    // dont do anything
                                } else {
                                    key = (top_right_left.toString() + "," + top_left.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }

                                if ((row_num !== row_size - 1) && (grid_matrix[row_num + 1][col_num - 1]) && (grid_matrix[row_num + 1][col_num])) {
                                    // dont do anything
                                } else {
                                    key = (bottom_right_left.toString() + "," + bottom_left.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }
                            } else {
                                key = (top_left.toString() + "," + bottom_left.toString());
                                if (this[this.mode.qa][array][key] !== line_style) {
                                    this.re_line(array, key, line_style, this.undoredo_counter); // left line
                                }
                            }
                        } else {
                            key = (top_left.toString() + "," + bottom_left.toString());
                            if (this[this.mode.qa][array][key] !== line_style) {
                                this.re_line(array, key, line_style, this.undoredo_counter); // left line
                            }
                        }

                        // check if top cell is shared
                        if (row_num !== 0) {
                            if (grid_matrix[row_num - 1][col_num]) {

                                // top shared cell
                                let top_left_top = 4 * (sortedcages[i] - this.nx0 + this.nx0 * this.ny0);
                                let top_right_top = top_left_top + 1;
                                let bottom_left_top = top_left_top + 2;
                                let bottom_right_top = top_left_top + 3;

                                if ((col_num !== 0) && (grid_matrix[row_num - 1][col_num - 1]) && (grid_matrix[row_num][col_num - 1])) {
                                    // dont do anything
                                } else {
                                    key = (bottom_left_top.toString() + "," + top_left.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }

                                if ((col_num !== col_size - 1) && (grid_matrix[row_num - 1][col_num + 1]) && (grid_matrix[row_num][col_num + 1])) {
                                    // dont do anything
                                } else {
                                    key = (bottom_right_top.toString() + "," + top_right.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }
                            } else {
                                key = (top_left.toString() + "," + top_right.toString());
                                if (this[this.mode.qa][array][key] !== line_style) {
                                    this.re_line(array, key, line_style, this.undoredo_counter); // top line
                                }
                            }
                        } else {
                            key = (top_left.toString() + "," + top_right.toString());
                            if (this[this.mode.qa][array][key] !== line_style) {
                                this.re_line(array, key, line_style, this.undoredo_counter); // top line
                            }
                        }

                        // check if right cell is shared
                        if (col_num !== col_size - 1) {
                            if (grid_matrix[row_num][col_num + 1]) {

                                // top shared cell
                                let top_left_right = 4 * (sortedcages[i] + 1 + this.nx0 * this.ny0);
                                let top_right_right = top_left_right + 1;
                                let bottom_left_right = top_left_right + 2;
                                let bottom_right_right = top_left_right + 3;

                                if ((row_num !== 0) && (grid_matrix[row_num - 1][col_num]) && (grid_matrix[row_num - 1][col_num + 1])) {
                                    // dont do anything
                                } else {
                                    key = (top_right.toString() + "," + top_left_right.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }

                                if ((row_num !== row_size - 1) && (grid_matrix[row_num + 1][col_num]) && (grid_matrix[row_num + 1][col_num + 1])) {
                                    // dont do anything
                                } else {
                                    key = (bottom_right.toString() + "," + bottom_left_right.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }
                            } else {
                                key = (top_right.toString() + "," + bottom_right.toString());
                                if (this[this.mode.qa][array][key] !== line_style) {
                                    this.re_line(array, key, line_style, this.undoredo_counter); // right line
                                }
                            }
                        } else {
                            key = (top_right.toString() + "," + bottom_right.toString());
                            if (this[this.mode.qa][array][key] !== line_style) {
                                this.re_line(array, key, line_style, this.undoredo_counter); // right line
                            }
                        }

                        // check if bottom cell is shared
                        if (row_num !== row_size - 1) {
                            if (grid_matrix[row_num + 1][col_num]) {

                                // top shared cell
                                let top_left_bottom = 4 * (sortedcages[i] + this.nx0 + this.nx0 * this.ny0);
                                let top_right_bottom = top_left_bottom + 1;
                                let bottom_left_bottom = top_left_bottom + 2;
                                let bottom_right_bottom = top_left_bottom + 3;

                                if ((col_num !== 0) && (grid_matrix[row_num][col_num - 1]) && (grid_matrix[row_num + 1][col_num - 1])) {
                                    // dont do anything
                                } else {
                                    key = (bottom_left.toString() + "," + top_left_bottom.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }

                                if ((col_num !== col_size - 1) && (grid_matrix[row_num][col_num + 1]) && (grid_matrix[row_num + 1][col_num + 1])) {
                                    // dont do anything
                                } else {
                                    key = (bottom_right.toString() + "," + top_right_bottom.toString());
                                    if (this[this.mode.qa][array][key] !== line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter);
                                    }
                                }
                            } else {
                                key = (bottom_left.toString() + "," + bottom_right.toString());
                                if (this[this.mode.qa][array][key] !== line_style) {
                                    this.re_line(array, key, line_style, this.undoredo_counter); // bottom line
                                }
                            }
                        } else {
                            key = (bottom_left.toString() + "," + bottom_right.toString());
                            if (this[this.mode.qa][array][key] !== line_style) {
                                this.re_line(array, key, line_style, this.undoredo_counter); // bottom line
                            }
                        }
                    }
                    this.record_replay(arraykill, -1, this.undoredo_counter);

                    // reset variables
                    this.cageselection = [];
                    this.selection = [];
                    this.drawing_mode = draw_mode;
                } else {
                    // length 1 then delete
                    if (sortedcages.length === 1 && !skip_cages) {

                        // check which style cage exist, if same style then delete or else do nothing
                        let top_left = 4 * (this[this.mode.qa][arraykill][cageexist_loc][0] + this.nx0 * this.ny0);
                        let top_right = top_left + 1;
                        let bottom_left = top_left + 2;
                        let key1 = (top_left.toString() + "," + top_right.toString());
                        let key2 = (top_left.toString() + "," + bottom_left.toString());

                        // caveat - if both of these lines are manually removed from the cage then it won't detect the cage.
                        if (this[this.mode.qa][array][key1] === line_style || this[this.mode.qa][array][key2] === line_style) {

                            // undo redo group counter
                            this.undoredo_counter = this.undoredo_counter + 1;

                            // remember drawing_mode
                            let draw_mode = this.drawing_mode;
                            this.drawing_mode = 100;

                            // cage cell locations
                            for (let i = 0; i < row_size; i++) {
                                grid_matrix[i] = new Array(parseInt(col_size)).fill(0);
                            }
                            for (let i = 0; i < this[this.mode.qa][arraykill][cageexist_loc].length; i++) {
                                let col_num = (this[this.mode.qa][arraykill][cageexist_loc][i] % (this.nx0)) - 2;
                                let row_num = parseInt(this[this.mode.qa][arraykill][cageexist_loc][i] / this.nx0) - 2;
                                grid_matrix[row_num][col_num] = 1;
                            }


                            for (let i = 0; i < this[this.mode.qa][arraykill][cageexist_loc].length; i++) {
                                let col_num = (this[this.mode.qa][arraykill][cageexist_loc][i] % (this.nx0)) - 2;
                                let row_num = parseInt(this[this.mode.qa][arraykill][cageexist_loc][i] / this.nx0) - 2;

                                // current cell
                                let top_left = 4 * (this[this.mode.qa][arraykill][cageexist_loc][i] + this.nx0 * this.ny0);
                                let top_right = top_left + 1;
                                let bottom_left = top_left + 2;
                                let bottom_right = top_left + 3;

                                // check if left cell is shared
                                if (col_num !== 0) {
                                    if (grid_matrix[row_num][col_num - 1]) {

                                        // left shared cell
                                        let top_left_left = 4 * (this[this.mode.qa][arraykill][cageexist_loc][i] - 1 + this.nx0 * this.ny0);
                                        let top_right_left = top_left_left + 1;
                                        let bottom_left_left = top_left_left + 2;
                                        let bottom_right_left = top_left_left + 3;
                                        key = (top_right_left.toString() + "," + top_left.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                        key = (bottom_right_left.toString() + "," + bottom_left.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                    } else {
                                        key = (top_left.toString() + "," + bottom_left.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter); // left line
                                        }
                                    }
                                } else {
                                    key = (top_left.toString() + "," + bottom_left.toString());
                                    if (this[this.mode.qa][array][key] === line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter); // left line
                                    }
                                }

                                // check if top cell is shared
                                if (row_num !== 0) {
                                    if (grid_matrix[row_num - 1][col_num]) {

                                        // top shared cell
                                        let top_left_top = 4 * (this[this.mode.qa][arraykill][cageexist_loc][i] - this.nx0 + this.nx0 * this.ny0);
                                        let top_right_top = top_left_top + 1;
                                        let bottom_left_top = top_left_top + 2;
                                        let bottom_right_top = top_left_top + 3;
                                        key = (bottom_left_top.toString() + "," + top_left.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                        key = (bottom_right_top.toString() + "," + top_right.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                    } else {
                                        key = (top_left.toString() + "," + top_right.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter); // top line
                                        }
                                    }
                                } else {
                                    key = (top_left.toString() + "," + top_right.toString());
                                    if (this[this.mode.qa][array][key] === line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter); // top line
                                    }
                                }

                                // check if right cell is shared
                                if (col_num !== col_size - 1) {
                                    if (grid_matrix[row_num][col_num + 1]) {

                                        // top shared cell
                                        let top_left_right = 4 * (this[this.mode.qa][arraykill][cageexist_loc][i] + 1 + this.nx0 * this.ny0);
                                        let top_right_right = top_left_right + 1;
                                        let bottom_left_right = top_left_right + 2;
                                        let bottom_right_right = top_left_right + 3;
                                        key = (top_right.toString() + "," + top_left_right.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                        key = (bottom_right.toString() + "," + bottom_left_right.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                    } else {
                                        key = (top_right.toString() + "," + bottom_right.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter); // right line
                                        }
                                    }
                                } else {
                                    key = (top_right.toString() + "," + bottom_right.toString());
                                    if (this[this.mode.qa][array][key] === line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter); // right line
                                    }
                                }

                                // check if bottom cell is shared
                                if (row_num !== row_size - 1) {
                                    if (grid_matrix[row_num + 1][col_num]) {

                                        // top shared cell
                                        let top_left_bottom = 4 * (this[this.mode.qa][arraykill][cageexist_loc][i] + this.nx0 + this.nx0 * this.ny0);
                                        let top_right_bottom = top_left_bottom + 1;
                                        let bottom_left_bottom = top_left_bottom + 2;
                                        let bottom_right_bottom = top_left_bottom + 3;
                                        key = (bottom_left.toString() + "," + top_left_bottom.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                        key = (bottom_right.toString() + "," + top_right_bottom.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter);
                                        }
                                    } else {
                                        key = (bottom_left.toString() + "," + bottom_right.toString());
                                        if (this[this.mode.qa][array][key] === line_style) {
                                            this.re_line(array, key, line_style, this.undoredo_counter); // bottom line
                                        }
                                    }
                                } else {
                                    key = (bottom_left.toString() + "," + bottom_right.toString());
                                    if (this[this.mode.qa][array][key] === line_style) {
                                        this.re_line(array, key, line_style, this.undoredo_counter); // bottom line
                                    }
                                }
                            }

                            // Save the current killercage and then delete
                            this.record(arraykill, cageexist_loc, this.undoredo_counter);
                            this[this.mode.qa][arraykill][cageexist_loc] = [];
                            if (UserSettings.custom_colors_on) {
                                this[this.mode.qa + "_col"][arraykill][cageexist_loc] = [];
                            }
                            this.record_replay(arraykill, cageexist_loc, this.undoredo_counter);
                            this.drawing_mode = draw_mode;
                        }
                    }
                    // length > 1 do not do anything
                    // reset variables
                    this.cageselection = [];
                    this.selection = [];
                }

                // reset variables
                this.selection = [];

                // Draw up cages
                this.redraw();

            } else if (this.mouse_mode === "out") {
                // reset variables
                this.selection = [];

                this.drawing = false;
            }
        } else if (document.getElementById('sub_cage2').checked) {
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
    }

    re_linecage(num) {
        if (this.drawing && this.last != num) {
            var line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) { // If they are adjacent
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
        this.record_replay(arr, -1);
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
            if (UserSettings.custom_colors_on) {
                let cc = this.get_customcolor();
                let cc_idx = this[this.mode.qa][arr].length - 1;
                if (!cc || tinycolor.equals(cc, CustomColor.default_special_style_color(arr))) {
                    delete this[this.mode.qa + "_col"][arr][cc_idx];
                } else {
                    this[this.mode.qa + "_col"][arr][cc_idx] = cc;
                }
            }
        }
        this.redraw();
    }

    re_specialup(num, arr) {
        if (this[this.mode.qa][arr].slice(-1)[0] && this[this.mode.qa][arr].slice(-1)[0].length === 1) {
            //*********SPECIAL CASE of EMPTY STARTS HERE***************
            // If the mouse was released back on the starting cell, basically no thermo then remove the custom color entry as well.
            // This accounts for the case when user dragged the thermo but came back to starting point.
            if (UserSettings.custom_colors_on && this[this.mode.qa + "_col"][arr][this[this.mode.qa][arr].length - 1]) {
                this[this.mode.qa + "_col"][arr].pop();
            }
            if (this.mode.qa === "pu_q") {
                this.pu_q.command_undo.pop();
                this.pu_q_col.command_undo.pop();
            } else if (this.mode.qa === "pu_a") {
                this.pu_a.command_undo.pop();
                this.pu_a_col.command_undo.pop();
            }
            //*********SPECIAL CASE of EMPTY ENDS HERE***************
            this[this.mode.qa][arr].pop();
            for (var i = this[this.mode.qa][arr].length - 1; i >= 0; i--) {
                if (this[this.mode.qa][arr][i] && this[this.mode.qa][arr][i][0] === num) {
                    this.record(arr, i);
                    this[this.mode.qa][arr][i] = [];
                    if (UserSettings.custom_colors_on) {
                        this[this.mode.qa + "_col"][arr][i] = [];
                    }
                    this.record_replay(arr, i);
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
            if (UserSettings.custom_colors_on) {
                let cc = this.get_customcolor();
                let cc_idx = this[this.mode.qa][arr].length - 1;
                if (!cc || tinycolor.equals(cc, CustomColor.default_special_style_color(arr))) {
                    delete this[this.mode.qa + "_col"][arr][cc_idx];
                } else {
                    this[this.mode.qa + "_col"][arr][cc_idx] = cc;
                }
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
            this.record_replay(arr, -1);
        } else if (this.drawing) {
            if (num != this[this.mode.qa][arr].slice(-1)[0][0] && num != this[this.mode.qa][arr].slice(-1)[0][this[this.mode.qa][arr].slice(-1)[0].length - 2]) {
                this[this.mode.qa][arr].slice(-1)[0].push(num);
            } else {
                this[this.mode.qa][arr].slice(-1)[0].pop();
                this.drawing = false;
            }
        }
        this.redraw();
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
            let status = this.check_last_cell();
            if (!status) {
                this.centerlist.splice(index, 1);
                this.drawing_mode = 0;
            } else {
                this.drawing = false;
                this.last = -1
            }
        }
        this.make_frameline();
        this.redraw();
    }

    check_last_cell() {
        if (this.centerlist.length == 1) {
            infoMsg('<h3 class="info">Last cell cannot be removed using the "Box" mode. For a blank grid use the following approach:</h3><ol><li>Click on "New Grid / Update"</li><li>Set "Gridlines" to "None"</li><li>Set "Gridpoints" to "No"</li><li>Set "Outside frame" to "No"</li><li>Click on "Update display"</li></ol>');
            return true;
        } else {
            return false;
        }
    }

    re_boardmove(num) {
        if (this.drawing && this.last != num) {
            var index = this.centerlist.indexOf(num);
            if (this.drawing_mode === 1 && index === -1) {
                this.centerlist.push(num);
            } else if (this.drawing_mode === 0 && index != -1) {
                let status = this.check_last_cell();
                if (!status) {
                    this.centerlist.splice(index, 1);
                }
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
                this.record_replay("move", [this.start_point, num]);
            }
        } else if (this.mouse_mode === "out") {
            if (this.drawing) {
                this.record("move", [this.start_point, this.last]);
                this.drawing = false;
                this.start_point = {};
                this.last = -1;
                this.record_replay("move", [this.start_point, num]);
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
            case "linedir":
                if (this.mouse_click === 2 || this.ondown_key === "touchstart") {
                    num = this.coord_p_edgex(x, y, 0.3);
                } else {
                    num = this.coord_p_edgex(x, y, 0.01);
                }
                break;
            case "edgexoi":
            case "tents":
                if (this.mouse_click === 2 || this.ondown_key === "touchstart") {
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
                case "linedir":
                    if (this.ondown_key === "touchstart") {
                        this.re_combi_linedir_downright(x, y, num);
                    } else {
                        this.re_combi_linedir(num);
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
                case "rassisillai":
                    this.re_combi_rassisillai(num);
                    break;
                case "edgesub":
                    this.re_combi_edgesub(num);
                    break;
                case "battleship":
                    this.re_combi_battleship(x, y, num);
                    break;
                case "star":
                    if (this.ondown_key === "mousedown") { // do only star when on laptop
                        this.re_combi_star_reduced(num);
                    } else {
                        if (UserSettings.starbattle_dots === 3) {
                            num = this.coord_p_edgex_star(x, y, 0);
                        } else if (UserSettings.starbattle_dots === 2) {
                            num = this.coord_p_edgex_star(x, y, 0.2);
                        }
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
                case "mines":
                    if (this.ondown_key === "mousedown") { // do only mine when on laptop
                        this.re_combi_mines_reduced(num);
                    } else {
                        this.re_combi_mines(num); // Behave as normal when ipad and phone
                    }
                    break;
                case "doublemines":
                    if (this.ondown_key === "mousedown") { // do only mine when on laptop
                        this.re_combi_doublemines_reduced(num);
                    } else {
                        this.re_combi_doublemines(num); // Behave as normal when ipad and phone
                    }
                    break;
                case "akari":
                    this.re_combi_akari(num);
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
                case "blpo":
                    this.re_combi_blpo_downright(num);
                    break;
                case "blwh":
                    this.re_combi_blwh_downright(num);
                    break;
                case "linex":
                    this.re_combi_cross_downright(num);
                    break;
                case "linedir":
                    this.re_combi_linedir_downright(x, y, num);
                    break;
                case "lineox":
                    this.re_combi_lineox(num);
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
                case "hashi":
                    this.re_combi_hashi(num);
                    break;
                case "rassisillai":
                    this.re_combi_rassisillai_downright(num);
                    break;
                case "akari":
                    this.re_combi_akari_downright(num);
                    break;
                case "star":
                    if (UserSettings.starbattle_dots === 3) {
                        num = this.coord_p_edgex_star(x, y, 0);
                    } else if (UserSettings.starbattle_dots === 2) {
                        num = this.coord_p_edgex_star(x, y, 0.2);
                    }
                    this.re_combi_star_downright(num);
                    break;
                case "magnets":
                    this.re_combi_magnets_downright(num);
                    break;
                case "mines":
                case "doublemines":
                    this.re_combi_mines_downright(num);
                    break;
                case "battleship":
                    this.re_combi_battleship_downright(num);
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
                case "linedir":
                    this.re_combi_linedir_move(x, y, num);
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
                case "rassisillai":
                    this.re_combi_rassisillai_move(num);
                    break;
                case "edgesub":
                    this.re_combi_edgesub_move(num);
                    break;
                case "battleship":
                    this.re_combi_battleship_move(x, y, num);
                    break;
                case "star":
                    this.re_combi_star_move(num);
                    break;
                case "tents":
                    this.re_combi_tents_move(num);
                    break;
                case "mines":
                case "doublemines":
                    this.re_combi_mines_move(num);
                    break;
                case "akari":
                    this.re_combi_akari_move(num);
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
                case "star":
                case "mines":
                case "doublemines":
                case "magnets":
                    this.drawing_mode = -1;
                    break;
                case "linedir":
                    this.re_combi_linedir_up(x, y, num);
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
                case "hashi":
                    this.re_combi_hashi_up(num);
                    break;
                case "rassisillai":
                    if (this.ondown_key === "mousedown") {
                        this.re_combi_rassisillai_up_reduced(num); // moved the dot to right click
                    } else {
                        this.re_combi_rassisillai_up(num); // on ipad/mobile behave as usual
                    }
                    break;
                case "tents":
                    this.re_combi_tents_up(num);
                    break;
                case "akari":
                    if (this.ondown_key === "mousedown") {
                        this.re_combi_akari_up_reduced(num); // moved the dot to right click
                    } else {
                        this.re_combi_akari_up(num); // on ipad/mobile behave as usual
                    }
                    break;
                case "shaka":
                    this.re_combi_shaka_up(num);
                    break;
                case "arrowS":
                    this.re_combi_arrowS_up(num);
                    break;
                case "battleship":
                    this.re_combi_battleship_up(x, y, num);
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
            this.record_replay("surface", num);
            this.drawing_mode = 1;
        } else if (this[this.mode.qa].surface[num] === 1) {
            this.record("surface", num);
            delete this[this.mode.qa].surface[num];
            this.record_replay("surface", num);
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
            this.record_replay("symbol", num);
            this.drawing_mode = 2;
        } else if (this[this.mode.qa].symbol[num][0] === 8) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.record_replay("symbol", num);
            this.drawing_mode = 0;
        }
        this.redraw();
    }

    re_combi_blpo_downright(num) {
        if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
            this.record_replay("symbol", num);
            this.drawing_mode = 2;
        } else if (this[this.mode.qa].surface[num] === 1) {
            this.record("surface", num);
            delete this[this.mode.qa].surface[num];
            this.record_replay("surface", num);
            this.drawing_mode = 0;
        } else if (this[this.mode.qa].symbol[num][0] === 8) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.record_replay("symbol", num);
            this.record("surface", num);
            this[this.mode.qa].surface[num] = 1;
            this.record_replay("surface", num);
            this.drawing_mode = 1;
        }
        this.redraw();
    }

    re_combi_blpo_move(num) {
        if (num != this.last) {
            if (this.drawing_mode === 1) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 1;
                this.record_replay("surface", num);
            } else if (this.drawing_mode === 2) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                    this.record_replay("surface", num);
                }
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 2];
                this.record_replay("symbol", num);
            } else if (this.drawing_mode === 0) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                    this.record_replay("surface", num);
                }
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                this.record_replay("symbol", num);
                this.drawing_mode = 1;
            } else if (this[this.mode.qa].symbol[num][0] === 1) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [2, "circle_M", 2];
                this.record_replay("symbol", num);
                this.drawing_mode = 2;
            } else if (this[this.mode.qa].symbol[num][0] === 2) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 0;
            }
            this.redraw();
        }
    }

    re_combi_blwh_downright(num) {
        if ((this.mode.qa === "pu_q") || (this.mode.qa === "pu_a" && !this["pu_q"].symbol[num])) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [2, "circle_M", 2];
                this.record_replay("symbol", num);
                this.drawing_mode = 2;
            } else if (this[this.mode.qa].symbol[num][0] === 2) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "circle_M", 2];
                this.record_replay("symbol", num);
                this.drawing_mode = 1;
            } else if (this[this.mode.qa].symbol[num][0] === 1) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
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
                this.record_replay("symbol", num);
            } else if (this.drawing_mode === 2) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [2, "circle_M", 2];
                this.record_replay("symbol", num);
            } else if (this.drawing_mode === 0) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
            this.record_replay("symbol", this.last);
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
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 8) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
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
            let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "line";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        } else if ((this.point[num].type === 2 || this.point[num].type === 3) && (this.ondown_key === "mousedown")) {
            if (this.drawing_mode == 52) {
                if (!this[this.mode.qa].line[num]) { // Insert cross
                    this.record("line", num);
                    this[this.mode.qa].line[num] = 98;
                    this.record_replay("line", num);
                }
            } else if (this.drawing_mode == 50) {
                if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                    this.record("line", num);
                    delete this[this.mode.qa].line[num];
                    this.record_replay("line", num);
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
            let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
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
        let firstsymbol = [1, "ox_E", 2];
        let secondsymbol = [4, "ox_E", 2];

        // If its right click up event then reverse the order of symbols
        if (this.mouse_click_last === 2) {
            firstsymbol = [4, "ox_E", 2];
            secondsymbol = [1, "ox_E", 2];
        }

        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = firstsymbol;
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num][0] === firstsymbol[0]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = secondsymbol;
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_linedir(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
    }

    re_combi_linedir_get_arrow_side(num, dir) {
        // up down left right
        const dirs = [
            [6, "inequality", 2],
            [8, "inequality", 2],
            [5, "inequality", 2],
            [7, "inequality", 2]
        ];

        // neighbor - up down left right
        let side = this.point[num].neighbor[dir];
        let arrowdir = dirs[dir];
        return [arrowdir, side];
    }

    re_combi_linedir_make_arrow(num, dir) {
        let [arrowdir, side] = this.re_combi_linedir_get_arrow_side(num, dir);

        if (this.drawing_mode === 0) { // In delete mode
            if (this[this.mode.qa].line[side])
                this.remove_value("line", side);
            if (this[this.mode.qa].symbol[side])
                this.remove_value("symbol", side);
        } else if (!this[this.mode.qa].line[side] && !this[this.mode.qa].symbol[side]) { // Insert symbol
            this.record("symbol", side);
            this[this.mode.qa].symbol[side] = arrowdir;
            this.record_replay("symbol", side);
        } else if (this[this.mode.qa].line[side]) { // If cross, delete cross and insert symbol
            this.record("line", side);
            delete this[this.mode.qa].line[side];
            this.record_replay("line", side);
            this.record("symbol", side);
            this[this.mode.qa].symbol[side] = arrowdir;
            this.record_replay("symbol", side);
        } else if (this[this.mode.qa].symbol[side]) { // If symbol in wrong direction, update symbol
            if (this[this.mode.qa].symbol[side][0] !== arrowdir[0]) {
                this.record("symbol", side);
                this[this.mode.qa].symbol[side] = arrowdir;
                this.record_replay("symbol", side);
            }
        }
    }

    re_combi_linedir_move(x, y, num) {
        let horizontal = (this.point[num].type === 2);
        let vertical = (this.point[num].type === 3);
        let center = (this.point[num].type === 0);
        let drawing_modes = [50, 52, 53, 54, 55, 56];

        // Remapping array to convert the indices of the pu.point[k].adjacent array to directions
        const dir_remap = [0, 2, 3, 1];

        if (this.drawing_mode != -1) {
            // Left click and drag or touchdown and drag
            let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                const array = "line";
                var key = this.line_key(num, this.last);

                // Only allow line delete if not in right click mode
                let only_arrow = (this[this.mode.qa][array][key] === line_style && this.mouse_click_last === 2);

                let dir = this.point[this.last].adjacent.indexOf(parseInt(num));
                dir = dir_remap[dir];

                // Check if there's already a line and an arrow segment in the same direction at
                // the beginning of a right-click-drag action. If so, it's delete mode
                if (only_arrow && this.drawing_mode === 100) {
                    let [arrowdir, side] = this.re_combi_linedir_get_arrow_side(this.last, dir);
                    let old = this[this.mode.qa]["symbol"][side];
                    if (old && JSON.stringify(old) === JSON.stringify(arrowdir))
                        this.drawing_mode = 0;
                }

                if (this.drawing_mode === 0 || !only_arrow)
                    this.re_line(array, key, line_style);

                if (only_arrow || (this.mouse_click_last === 2 && this.drawing_mode === line_style))
                    this.re_combi_linedir_make_arrow(this.last, dir);
            }
            this.last = num;
            this.redraw();
        } else if ((horizontal || vertical) && (this.ondown_key === "mousedown")) {
            // Modes
            // 56 - insert cross
            // 55 - delete cross and Insert updir
            // 54 - delete updir and insert downdir
            // 53 - delete cross and insert leftdir
            // 52 - delete leftdir and insert rightdir
            // 50 - delete last symbol
            if (this.drawing_mode == 56) {
                if (!this[this.mode.qa].symbol[num] && !this[this.mode.qa].line[num]) { // Insert cross
                    this.record("line", num);
                    this[this.mode.qa].line[num] = 98;
                    this.record_replay("line", num);
                }
            } else if (this.drawing_mode == 50) {
                if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                    this.record("line", num);
                    delete this[this.mode.qa].line[num];
                    this.record_replay("line", num);
                } else if (this[this.mode.qa].symbol[num]) { // Remove Symbol
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
            }
            this.redraw();
        }
    }

    re_combi_linedir_downright(x, y, num) {
        let leftdir = [5, "inequality", 2];
        let rightdir = [7, "inequality", 2];
        let updir = [6, "inequality", 2];
        let downdir = [8, "inequality", 2];
        let horizontal = (this.point[num].type === 2);
        let vertical = (this.point[num].type === 3);

        if (horizontal) {
            if (!this[this.mode.qa].line[num] && !this[this.mode.qa].symbol[num]) { // Insert cross
                this.record("line", num);
                this[this.mode.qa].line[num] = 98;
                this.record_replay("line", num);
                this.drawing_mode = 56;
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record("line", num);
                delete this[this.mode.qa].line[num];
                this.record_replay("line", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = updir;
                this.record_replay("symbol", num);
                this.drawing_mode = 55;
            } else if (this[this.mode.qa].symbol[num][0] === updir[0]) { // symbol in other direction
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = downdir;
                this.record_replay("symbol", num);
                this.drawing_mode = 54;
            } else { // Remove symbol
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 50;
            }
        } else if (vertical) {
            if (!this[this.mode.qa].line[num] && !this[this.mode.qa].symbol[num]) { // Insert cross
                this.record("line", num);
                this[this.mode.qa].line[num] = 98;
                this.record_replay("line", num);
                this.drawing_mode = 56;
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record("line", num);
                delete this[this.mode.qa].line[num];
                this.record_replay("line", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = leftdir;
                this.record_replay("symbol", num);
                this.drawing_mode = 53;
            } else if (this[this.mode.qa].symbol[num][0] === leftdir[0]) { // Symbol in other direction
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = rightdir;
                this.record_replay("symbol", num);
                this.drawing_mode = 52;
            } else { // Remove symbol
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 50;
            }
        } else {
            this.drawing_mode = 100;
            this.first = num;
            this.last = num;
            this.lastx = x;
            this.lasty = y;
        }
        this.redraw();
    }

    re_combi_linedir_up(x, y, num) {
        this.drawing_mode = -1;
        this.last = -1;
        this.lastx = -1;
        this.lasty = -1;
    }

    re_combi_cross_downright(num, symboltype = "line") {
        if (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4) {
            if (symboltype === "line") {
                if (!this[this.mode.qa].line[num]) { // Insert cross
                    this.record(symboltype, num);
                    this[this.mode.qa].line[num] = 98;
                    this.record_replay(symboltype, num);
                    this.drawing_mode = 52;
                } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                    this.record(symboltype, num);
                    delete this[this.mode.qa].line[num];
                    this.record_replay(symboltype, num);
                    this.drawing_mode = 50;
                }
            } else {
                // Ignore if edge already exist
                // Do this only for square grids for now
                if (this.grid_is_square()) {

                    let neighbor1 = this.point[num].neighbor[0];
                    let neighbor2 = this.point[num].neighbor[1];
                    let edge_num;
                    let corners = this.point[neighbor2].surround;

                    // If difference is 1 then its left and right else its top and bottom
                    if (Math.abs(neighbor1 - neighbor2) === 1) {
                        edge_num = corners[0].toString() + "," + corners[3].toString();
                    } else {
                        edge_num = corners[0].toString() + "," + corners[1].toString();
                    }

                    if (!this[this.mode.qa].lineE[num] && !this[this.mode.qa].lineE[edge_num]) { // Insert cross
                        this.record(symboltype, num);
                        this[this.mode.qa].lineE[num] = 98;
                        this.record_replay(symboltype, num);
                        this.drawing_mode = 52;
                    } else if (this[this.mode.qa].lineE[num] === 98) { // Remove Cross
                        this.record(symboltype, num);
                        delete this[this.mode.qa].lineE[num];
                        this.record_replay(symboltype, num);
                        this.drawing_mode = 50;
                    }
                } else {
                    if (!this[this.mode.qa].lineE[num]) { // Insert cross
                        this.record(symboltype, num);
                        this[this.mode.qa].lineE[num] = 98;
                        this.record_replay(symboltype, num);
                        this.drawing_mode = 52;
                    } else if (this[this.mode.qa].lineE[num] === 98) { // Remove Cross
                        this.record(symboltype, num);
                        delete this[this.mode.qa].lineE[num];
                        this.record_replay(symboltype, num);
                        this.drawing_mode = 50;
                    }
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
            let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
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
        let firstcolor = 7;
        let secondcolor = UserSettings.secondcolor;

        // If its right click up event then reverse the order of colors
        if (this.mouse_click_last === 2) {
            firstcolor = UserSettings.secondcolor;
            secondcolor = 7;
        }

        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num]) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = firstcolor;
                this.record_replay("surface", num);
            } else if (this[this.mode.qa].surface[num] === firstcolor) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = secondcolor;
                this.record_replay("surface", num);
            } else {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
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
            let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            var array;
            if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                array = "lineE";
                var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                this.re_line(array, key, line_style);
            }
            this.last = num;
            this.redraw();
        } else if ((this.point[num].type === 2 || this.point[num].type === 3) && (this.ondown_key === "mousedown")) {
            if (this.gridtype === "square") {
                // Ignore if edge already exist
                // Do this only for square grids for now
                let neighbor1 = this.point[num].neighbor[0];
                let neighbor2 = this.point[num].neighbor[1];
                let edge_num;
                let corners = this.point[neighbor2].surround;

                // If difference is 1 then its left and right else its top and bottom
                if (Math.abs(neighbor1 - neighbor2) === 1) {
                    edge_num = corners[0].toString() + "," + corners[3].toString();
                } else {
                    edge_num = corners[0].toString() + "," + corners[1].toString();
                }

                if (this.drawing_mode == 52) {
                    if (!this[this.mode.qa].lineE[num] && !this[this.mode.qa].lineE[edge_num]) { // Insert cross
                        this.record("lineE", num);
                        this[this.mode.qa].lineE[num] = 98;
                        this.record_replay("lineE", num);
                    }
                } else if (this.drawing_mode == 50) {
                    if (this[this.mode.qa].lineE[num] === 98) { // Remove Cross
                        this.record("lineE", num);
                        delete this[this.mode.qa].lineE[num];
                        this.record_replay("lineE", num);
                    }
                }
            } else {
                if (this.drawing_mode == 52) {
                    if (!this[this.mode.qa].lineE[num]) { // Insert cross
                        this.record("lineE", num);
                        this[this.mode.qa].lineE[num] = 98;
                        this.record_replay("lineE", num);
                    }
                } else if (this.drawing_mode == 50) {
                    if (this[this.mode.qa].lineE[num] === 98) { // Remove Cross
                        this.record("lineE", num);
                        delete this[this.mode.qa].lineE[num];
                        this.record_replay("lineE", num);
                    }
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
                    this.record_replay("symbol", num);
                }
            } else if (this.drawing_mode === 6 && num != this.last) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
            } else {
                let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
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
                this.record_replay("surface", num);
            } else if (this[this.mode.qa].surface[num] === 1) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
        } else if (!this.loop_counter &&
            (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4)) {
            if (!this[this.mode.qa].line[num]) { // Insert cross
                this.record('line', num);
                this[this.mode.qa].line[num] = 98;
                this.record_replay('line', num);
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record('line', num);
                delete this[this.mode.qa].line[num];
                this.record_replay('line', num);
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
                this.record_replay("surface", num);
            } else if (this[this.mode.qa].surface[num] === 1) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 1;
                this.record_replay("surface", num);
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
                this.record_replay("symbol", num);
                this.drawing_mode = 5; // placing dots
            } else if (this[this.mode.qa].surface[num] === 1) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.record_replay("symbol", num);
                this.drawing_mode = 5; // placing dots
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 6; // removing dots
            }
        } else if (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4) {
            if (!this[this.mode.qa].line[num]) { // Insert cross
                this.record('line', num);
                this[this.mode.qa].line[num] = 98;
                this.record_replay('line', num);
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record('line', num);
                delete this[this.mode.qa].line[num];
                this.record_replay('line', num);
            }
        }
        this.last = num;
    }

    re_combi_rassisillai(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_rassisillai_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 0) {
            if (this.drawing_mode === 5 && num != this.last) {
                if (!this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    this[this.mode.qa].surface[num] = 7;
                    this.record_replay("surface", num);
                }
            } else if (this.drawing_mode === 6 && num != this.last) {
                if (this[this.mode.qa].surface[num]) {
                    this.record("surface", num);
                    delete this[this.mode.qa].surface[num];
                    this.record_replay("surface", num);
                }
            } else {
                let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
                var array;
                if (this.point[num].adjacent.indexOf(parseInt(this.last)) != -1) {
                    array = "line";
                    var key = (Math.min(num, this.last)).toString() + "," + (Math.max(num, this.last)).toString();
                    this.re_line(array, key, line_style);
                }
            }
            this.last = num;
            this.redraw();
        }
    }

    re_combi_rassisillai_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "ox_G", 1];
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 1) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 7;
                this.record_replay("surface", num);
            } else {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_rassisillai_up_reduced(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "ox_G", 1];
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].surface[num] === 7) {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [1, "ox_G", 1];
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_rassisillai_downright(num) {
        if (this.point[num].type === 0) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 7;
                this.record_replay("surface", num);
                this.drawing_mode = 5; // placing shaded yellow
            } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 1) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.record("surface", num);
                this[this.mode.qa].surface[num] = 7;
                this.record_replay("surface", num);
                this.drawing_mode = 5; // placing shaded yellow
            } else {
                this.record("surface", num);
                delete this[this.mode.qa].surface[num];
                this.record_replay("surface", num);
                this.drawing_mode = 6; // removing shaded yellow
            }
        }
        this.last = num;
    }

    re_combi_akari(num) {
        this.drawing_mode = 100;
        this.first = num;
        this.last = num;
        this.redraw();
    }

    re_combi_akari_move(num) {
        if (this.drawing_mode != -1 && this.point[num].type === 0) {
            if (this.drawing_mode === 5 && num != this.last) {
                if (!this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                    this.record_replay("symbol", num);
                }
            } else if (this.drawing_mode === 6 && num != this.last) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
            } else {
                var line_style = 12;
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

    re_combi_akari_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [3, "sun_moon", 2];
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num][0] === 3) { // bulb is present then delete and place a dot
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
        } else if (!this.loop_counter &&
            (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4)) {
            if (!this[this.mode.qa].line[num]) { // Insert cross
                this.record('line', num);
                this[this.mode.qa].line[num] = 98;
                this.record_replay('line', num);
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record('line', num);
                delete this[this.mode.qa].line[num];
                this.record_replay('line', num);
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.loop_counter = false;
        this.redraw();
    }

    re_combi_akari_up_reduced(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].surface[num] && !this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [3, "sun_moon", 2];
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num][0] === 3) { // bulb is present then delete and place a dot
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [3, "sun_moon", 2];
                this.record_replay("symbol", num);
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
    }

    re_combi_akari_downright(num) {
        if (this.point[num].type === 0) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.record_replay("symbol", num);
                this.drawing_mode = 5; // placing dots
            } else if (this[this.mode.qa].symbol[num][0] === 3) { // bulb is present then delete and place a dot
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [8, "ox_B", 1];
                this.record_replay("symbol", num);
                this.drawing_mode = 5; // placing dots
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 6; // removing dots
            }
        } else if (this.point[num].type === 2 || this.point[num].type === 3 || this.point[num].type === 4) {
            if (!this[this.mode.qa].line[num]) { // Insert cross
                this.record('line', num);
                this[this.mode.qa].line[num] = 98;
                this.record_replay('line', num);
            } else if (this[this.mode.qa].line[num] === 98) { // Remove Cross
                this.record('line', num);
                delete this[this.mode.qa].line[num];
                this.record_replay('line', num);
            }
        }
        this.last = num;
    }

    re_combi_hashi(num) {
        this.drawing_mode = 100;
        this.first = num;
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

    re_combi_hashi_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [4, "ox_G", 2];
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num][0] === 4) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
        }
        this.drawing_mode = -1;
        this.first = -1;
        this.last = -1;
        this.redraw();
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

    re_combi_battleship(x, y, num) {
        if ((this.mode.qa === "pu_q") ||
            (this.mode.qa === "pu_a" &&
                (!this["pu_q"].symbol[num] ||
                    (this["pu_q"].symbol[num] &&
                        !this["pu_q"].symbol[num][1].includes("battleship"))))) {
            if (this.point[num].type === 0) {
                this.last = num;
                this.lastx = x;
                this.lasty = y;
                if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 8) {
                    this.drawing_mode = 3;
                } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 7) {
                    this.drawing_mode = 2;
                } else {
                    this.drawing_mode = 1;
                }
            }
        }
    }

    re_combi_battleship_downright(num) {
        if ((this.mode.qa === "pu_q") ||
            (this.mode.qa === "pu_a" &&
                (!this["pu_q"].symbol[num] ||
                    (this["pu_q"].symbol[num] &&
                        !this["pu_q"].symbol[num][1].includes("battleship"))))) {
            if (this.point[num].type === 0) {
                this.last = num;
                if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 7) {
                    this.drawing_mode = 5;
                } else {
                    this.drawing_mode = 4;
                }
            }
        }
    }

    re_combi_battleship_move(x, y, num) {
        if ((this.mode.qa === "pu_q") ||
            (this.mode.qa === "pu_a" &&
                (!this["pu_q"].symbol[num] ||
                    (this["pu_q"].symbol[num] &&
                        !this["pu_q"].symbol[num][1].includes("battleship"))))) {
            if (this.drawing_mode === 5) {
                if (this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                    this.redraw();
                }
                this.last = -1;
            } else if (this.drawing_mode === 4) {
                if (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][0] !== 7) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [7, "battleship_B", 2];
                    this.record_replay("symbol", num);
                    this.redraw();
                }
                this.last = -1;
            } else if (this.drawing_mode === 3) {
                if (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][0] !== 8) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [8, "battleship_B", 2];
                    this.record_replay("symbol", num);
                    this.redraw();
                }
                this.last = -1;
            } else if (this.drawing_mode === 2) {
                if (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][0] !== 7) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [7, "battleship_B", 2];
                    this.record_replay("symbol", num);
                    this.redraw();
                }
                this.last = -1;
            } else if (this.drawing_mode === 1) {
                if ((x - this.lastx) ** 2 + (y - this.lasty) ** 2 < (0.3 * this.size) ** 2) {
                    return;
                }
                var battleshipdirection = this.direction_battleship4(x, y, this.lastx, this.lasty);
                // battleshipdirection = 1 (left pointing), 0 (up pointing), 3 (right pointing), 2 (down pointing)
                var a = [6, 5, 4, 3];
                if (!this[this.mode.qa].symbol[this.last] || this[this.mode.qa].symbol[this.last][0] !== a[battleshipdirection]) {
                    this.record("symbol", this.last);
                    this[this.mode.qa].symbol[this.last] = [a[battleshipdirection], "battleship_B", 2];
                    this.record_replay("symbol", this.last);
                    this.redraw();
                }
                this.drawing_mode = -1;
                this.last = -1;
            }
        }
    }

    re_combi_battleship_up(x, y, num) {
        if ((this.mode.qa === "pu_q") ||
            (this.mode.qa === "pu_a" &&
                (!this["pu_q"].symbol[num] ||
                    (this["pu_q"].symbol[num] &&
                        !this["pu_q"].symbol[num][1].includes("battleship"))))) {
            if (this.drawing_mode === 1) {
                if (!this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[this.last] = [2, "battleship_B", 2];
                    this.record_replay("symbol", num);
                } else if (this[this.mode.qa].symbol[num][0] === 2) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[this.last] = [1, "battleship_B", 2];
                    this.record_replay("symbol", num);
                } else if (this[this.mode.qa].symbol[num][0] === 1) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[this.last] = [8, "battleship_B", 2];
                    this.record_replay("symbol", num);
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
            } else if (this.drawing_mode == 5 && (this.last === num)) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            } else if (this.drawing_mode == 4 && (this.last === num)) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[this.last] = [7, "battleship_B", 2];
                this.record_replay("symbol", num);
            } else if (this.drawing_mode == 3 && (this.last === num)) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[this.last] = [7, "battleship_B", 2];
                this.record_replay("symbol", num);
            } else if (this.drawing_mode == 2 && (this.last === num)) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
            this.redraw();
        }
        this.drawing_mode = -1; // always exit drawing mode
        this.last = -1;
    }

    get_neighbors(num, options = 'all') {
        let neighbors;
        let neighbors2;
        let col_num = (num % (this.nx0));
        let row_num = parseInt(num / this.nx0);

        // if (options === 'edges') {
        //     neighbors2 = [(row_num - 1) * this.nx0 + 2 * this.nx0 * this.ny0 + col_num, // top middle
        //         row_num * this.nx0 + 2 * this.nx0 * this.ny0 + col_num, // bottom middle
        //         row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num - 1, // left middle
        //         row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num // right middle
        //     ]
        // } else {
        //     neighbors2 = [(row_num - 1) * this.nx0 + this.nx0 * this.ny0 + col_num - 1, // top left corner
        //         (row_num - 1) * this.nx0 + this.nx0 * this.ny0 + col_num, // top right corner
        //         row_num * this.nx0 + this.nx0 * this.ny0 + col_num - 1, // bottom left corner
        //         row_num * this.nx0 + this.nx0 * this.ny0 + col_num, // bottom right corner
        //         (row_num - 1) * this.nx0 + 2 * this.nx0 * this.ny0 + col_num, // top middle
        //         row_num * this.nx0 + 2 * this.nx0 * this.ny0 + col_num, // bottom middle
        //         row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num - 1, // left middle
        //         row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num // right middle
        //     ]
        // }

        //Improved and simplified version
        if (options === 'edges') {
            neighbors = this.point[num].neighbor;
        } else if (options === 'adjacent') {
            neighbors = this.point[num].adjacent;
        } else {
            if (this.gridtype === "cairo_pentagonal") {
                // neighbors = this.point[num].neighbor; // Currently eliminating some other cell markings so ignore for now
                neighbors = [];
            } else if (this.gridtype === "pyramid") {
                let offset;
                if (row_num % 2 === 0) { // even row
                    offset = 0;
                } else { // odd row
                    offset = 2;
                }
                neighbors2 = [row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num - 1, // left middle
                    row_num * this.nx0 + 3 * this.nx0 * this.ny0 + col_num, // right middle,
                    4 * this.nx0 * this.ny0 + num * 2, // bottom left middle
                    4 * this.nx0 * this.ny0 + num * 2 + 1, // bottom right middle
                    4 * this.nx0 * this.ny0 + num * 2 - this.nx0 * 2 - 1 + offset, // top left middle
                    4 * this.nx0 * this.ny0 + num * 2 + 1 - this.nx0 * 2 - 1 + offset // top right middle
                ]
                neighbors = neighbors2.concat(this.point[num].surround);
            } else if (this.gridtype === "tetrakis_square") {
                // let tol = 0.01;
                // if (Math.abs(this.point[this.point[num].surround[0]].y - this.point[this.point[num].surround[2]].y) <= tol) {
                //     neighbors2 = [num + this.nx0 * 2,
                //         num + this.nx0 * 2 + 1,
                //     ];
                // }
                neighbors = this.point[num].surround.concat(this.point[num].neighbor);
            } else {
                neighbors = this.point[num].surround.concat(this.point[num].neighbor);
            }
        }
        return neighbors;
    }

    re_combi_star_reduced(num) {
        let star_type = 2;
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
                        this.record_replay("symbol", neighbors[i], this.undoredo_counter);
                    }
                }
                this.record("symbol", num, this.undoredo_counter);
                this[this.mode.qa].symbol[num] = [star_type, "star", 2];
                this.record_replay("symbol", num, this.undoredo_counter);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 2;
            }
            this.redraw();
        }
    }

    re_combi_star(num) {
        let star_type = 2;
        switch (this.point[num].type) {
            case 0:
                if (!this[this.mode.qa].symbol[num]) {
                    if (this.undoredo_counter > 3) {
                        this.undoredo_counter = 1;
                    } else {
                        this.undoredo_counter = this.undoredo_counter + 1;
                    }
                    // Disabling dots clean up for ipad/mobile until better solution is figured
                    // let neighbors = this.get_neighbors(num);
                    // for (let i = 0; i < neighbors.length; i++) {
                    //     if (this[this.mode.qa].symbol[neighbors[i]]) {
                    //         this.record("symbol", neighbors[i], this.undoredo_counter);
                    //         delete this[this.mode.qa].symbol[neighbors[i]];
                    //     }
                    // }
                    this.record("symbol", num, this.undoredo_counter);
                    this[this.mode.qa].symbol[num] = [star_type, "star", 2];
                    this.record_replay("symbol", num, this.undoredo_counter);
                } else if (this[this.mode.qa].symbol[num][0] === star_type) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [0, "star", 2];
                    this.record_replay("symbol", num);
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                    this.record_replay("symbol", num);
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                    this.record_replay("symbol", num);
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                    this.record_replay("symbol", num);
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                this.record_replay("symbol", num);
            } else if (this.drawing_mode === 2 && this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
            }
            this.redraw();
        }
    }

    re_combi_mines_reduced(num) {
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
                        this.record_replay("symbol", neighbors[i], this.undoredo_counter);
                    }
                }
                this.record("symbol", num, this.undoredo_counter);
                this[this.mode.qa].symbol[num] = [4, "sun_moon", 2];
                this.record_replay("symbol", num, this.undoredo_counter);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 2;
            }
            this.redraw();
        }
    }

    re_combi_mines(num) {
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
                            this.record_replay("symbol", neighbors[i], this.undoredo_counter);
                        }
                    }
                    this.record("symbol", num, this.undoredo_counter);
                    this[this.mode.qa].symbol[num] = [4, "sun_moon", 2];
                    this.record_replay("symbol", num, this.undoredo_counter);
                } else if (this[this.mode.qa].symbol[num][0] === 4) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [0, "star", 2];
                    this.record_replay("symbol", num);
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                    this.record_replay("symbol", num);
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
                this.redraw();
                break;
        }
    }

    re_combi_doublemines_reduced(num) {
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
                        this.record_replay("symbol", neighbors[i], this.undoredo_counter);
                    }
                }
                this.record("symbol", num, this.undoredo_counter);
                this[this.mode.qa].symbol[num] = [4, "sun_moon", 2];
                this.record_replay("symbol", num, this.undoredo_counter);
            } else if (this[this.mode.qa].symbol[num][0] === 4) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [5, "sun_moon", 2];
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
                this.drawing_mode = 2;
            }
            this.redraw();
        }
    }

    re_combi_doublemines(num) {
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
                            this.record_replay("symbol", neighbors[i], this.undoredo_counter);
                        }
                    }
                    this.record("symbol", num, this.undoredo_counter);
                    this[this.mode.qa].symbol[num] = [4, "sun_moon", 2];
                    this.record_replay("symbol", num, this.undoredo_counter);
                } else if (this[this.mode.qa].symbol[num][0] === 4) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [5, "sun_moon", 2];
                    this.record_replay("symbol", num);
                } else if (this[this.mode.qa].symbol[num][0] === 5) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [0, "star", 2];
                    this.record_replay("symbol", num);
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                    this.record_replay("symbol", num);
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
                this.redraw();
                break;
        }
    }

    re_combi_mines_downright(num) {
        switch (this.point[num].type) {
            case 0:
                if (!this[this.mode.qa].symbol[num]) {
                    this.record("symbol", num);
                    this[this.mode.qa].symbol[num] = [0, "star", 2];
                    this.record_replay("symbol", num);
                    this.drawing_mode = 1;
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
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
                    this.record_replay("symbol", num);
                } else {
                    this.record("symbol", num);
                    delete this[this.mode.qa].symbol[num];
                    this.record_replay("symbol", num);
                }
                this.redraw();
                break;
        }
    }

    re_combi_mines_move(num) {
        if (this.point[num].type === 0) {
            if (this.drawing_mode === 1 &&
                (!this[this.mode.qa].symbol[num] || this[this.mode.qa].symbol[num][0] != 0)) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = [0, "star", 2];
                this.record_replay("symbol", num);
            } else if (this.drawing_mode === 2 && this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
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
            let line_style = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
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
        let firstsymbol = [2, "tents", 2];
        let secondsymbol = [8, "ox_B", 2];

        // If its right click up event then reverse the order of symbols
        if (this.mouse_click_last === 2) {
            firstsymbol = [8, "ox_B", 2];
            secondsymbol = [2, "tents", 2];
        }

        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (!this[this.mode.qa].symbol[num]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = firstsymbol;
                this.record_replay("symbol", num);
            } else if (this[this.mode.qa].symbol[num][0] === firstsymbol[0]) {
                this.record("symbol", num);
                this[this.mode.qa].symbol[num] = secondsymbol;
                this.record_replay("symbol", num);
            } else {
                this.record("symbol", num);
                delete this[this.mode.qa].symbol[num];
                this.record_replay("symbol", num);
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
            this.record_replay("symbol", num);
        } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 2) {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [3, "math_G", 2];
            this.record_replay("symbol", num);
        } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 3) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.record_replay("symbol", num);
            this.record("surface", num);
            this[this.mode.qa].surface[num] = 1;
            this.record_replay("surface", num);
        } else if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] == 1) {
            this.record("surface", num);
            delete this[this.mode.qa].surface[num];
            this.record_replay("surface", num);
        }
        this.redraw();
    }

    re_combi_magnets_downright(num) {
        if (!this[this.mode.qa].symbol[num] && this[this.mode.qa].surface[num] != 1) {
            this.record("surface", num);
            this[this.mode.qa].surface[num] = 1;
            this.record_replay("surface", num);
        } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 2) {
            this.record("symbol", num);
            delete this[this.mode.qa].symbol[num];
            this.record_replay("symbol", num);
        } else if (this[this.mode.qa].symbol[num] && this[this.mode.qa].symbol[num][0] === 3) {
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [2, "math_G", 2];
            this.record_replay("symbol", num);
        } else if (this[this.mode.qa].surface[num] && this[this.mode.qa].surface[num] == 1) {
            this.record("surface", num);
            delete this[this.mode.qa].surface[num];
            this.record_replay("surface", num);
            this.record("symbol", num);
            this[this.mode.qa].symbol[num] = [3, "math_G", 2];
            this.record_replay("symbol", num);
        }
        this.redraw();
    }

    re_combi_arrowS_up(num) {
        if (this.point[num].type === 0 && this.last === num && this.first === num) {
            if (this[this.mode.qa].symbol[this.last] && this[this.mode.qa].symbol[this.last][1] === "arrow_S") {
                this.record("symbol", this.last);
                delete this[this.mode.qa].symbol[this.last];
                this.record_replay("symbol", this.last);
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
            this.record_replay("symbol", this.last);
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
                this.record_replay("number", this.last);
            } else {
                this.record("number", this.last);
                delete this[this.mode.qa].number[this.last];
                this.record_replay("number", this.last);
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
            this.record_replay("number", this.last);
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
                this.record_replay("number", this.last);
            } else {
                this.record("number", this.last);
                delete this[this.mode.qa].number[this.last];
                this.record_replay("number", this.last);
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
            this.record_replay("number", this.last);
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

    update_bg_image_url() {
        this.bg_image_data.url = document.getElementById("bg_image_url").value;

        this.bg_image_canvas = null;

        this.bg_image = new Image();
        this.bg_image.crossOrigin = "anonymous";
        this.bg_image.src = this.bg_image_data.url;
        this.bg_image.onload = () => this.extract_bg_image_pixels();
    }

    extract_bg_image_pixels() {
        if (this.bg_image) {
            let data = this.bg_image_data;

            // Create a temporary canvas and write the image to it
            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');
            canvas.width = this.bg_image.width;
            canvas.height = this.bg_image.height;
            ctx.drawImage(this.bg_image, 0, 0);

            // Extract the canvas data
            let raw_data = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Set alpha channel if given an opacity parameter
            if (data.opacity >= 0 && data.opacity < 100) {
                let opacity = 255 * data.opacity / 100;
                opacity = Math.max(0, Math.min(opacity, 255));

                for (let i = 0; i < raw_data.data.length; i += 4)
                    raw_data.data[i + 3] = opacity;
            }

            // Mask out white pixels if requested
            if (data.mask_white) {
                const t = data.threshold;
                for (let i = 0; i < raw_data.data.length; i += 4) {
                    let [r, g, b] = raw_data.data.slice(i, i+3);
                    if (r > t && g > t && b > t)
                        raw_data.data[i+3] = 0;
                }
            }

            // Write the data back to the canvas for drawing
            ctx.putImageData(raw_data, 0, 0);

            this.bg_image_canvas = canvas;

            this.redraw();
        }
    }

    update_bg_image_attrs() {
        for (let v of ['x', 'y', 'width', 'height', 'opacity', 'threshold']) {
            let value = parseInt(document.getElementById("bg_image_" + v).value);

            if (!Number.isNaN(value))
                this.bg_image_data[v] = value;
            else
                delete this.bg_image_data[v];
        }
        this.bg_image_data.foreground = document.getElementById("bg_image_foreground").checked;
        this.bg_image_data.mask_white = document.getElementById("bg_image_mask_white").checked;
        this.extract_bg_image_pixels();
    }

    load_bg_image_attrs() {
        for (let v of ['url', 'x', 'y', 'width', 'height', 'opacity', 'threshold']) {
            if (this.bg_image_data[v] !== undefined)
                document.getElementById("bg_image_" + v).value = this.bg_image_data[v];
        }
        if (this.bg_image_data.foreground !== undefined)
            document.getElementById("bg_image_foreground").value = this.bg_image_data.foreground;
        if (this.bg_image_data.mask_white !== undefined)
            document.getElementById("bg_image_mask_white").value = this.bg_image_data.mask_white;
        // Trigger a reload of the image
        this.update_bg_image_url();
    }

    draw_bg_image() {
        if (this.bg_image && this.bg_image_canvas) {
            let data = this.bg_image_data;

            // Take the width/height from the given parameters or from the given image if not
            let width = data.width, height = data.height;
            if (!width) {
                if (!height) {
                    width = this.bg_image.width;
                    height = this.bg_image.height;
                } else
                    width = (this.bg_image.width / this.bg_image.height) * height;
            } else if (!height)
                height = (this.bg_image.height / this.bg_image.width) * width;

            this.ctx.drawImage(this.bg_image_canvas, data.x, data.y, width, height);
        }
    }

    redraw(svgcall = false, check_sol = true) {
        try {
            this.flushcanvas(svgcall);
            if (!this.bg_image_data.foreground)
                this.draw_bg_image();
            if (check_sol) {
                this.check_solution();
            }
            panel_pu.draw_panel();
            this.draw();
            this.set_redoundocolor();
            if (this.bg_image_data.foreground)
                this.draw_bg_image();
        }
        // don't crash the UI
        catch (err) {
            console.error(err);
        }
    }

    set_redoundocolor() {
        document.getElementById('tb_redo').disabled = (this[this.mode.qa].command_redo.__a.length === 0) ? 'disabled' : '';
        document.getElementById('tb_undo').disabled = (this[this.mode.qa].command_undo.__a.length === 0) ? 'disabled' : '';
    }

    flushcanvas(svgcall) {
        if (svgcall) {
            this.ctx.fillStyle = Color.TRANSPARENTWHITE;
            this.ctx.fillRect(0, 0, this.canvasx, this.canvasy);
        } else {
            this.ctx.fillStyle = Color.WHITE;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
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
                if (UserSettings.custom_colors_on && this[pu + "_col"].polygon[i]) {
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

    draw_surface(pu, num = "") {
        if (num) {
            var keys = [],
                key0 = num + "";
            if (this[pu].surface[key0]) {
                keys.push(key0);
            }
            for (var i = 0; i < this.point[num].adjacent.length; i++) {
                key0 = this.point[num].adjacent[i] + "";
                if (keys.indexOf(key0) === -1 && this[pu].surface[key0]) {
                    keys.push(key0);
                }
            }
        } else {
            var keys = Object.keys(this[pu].surface);
        }
        const draw_cell = (i) => {
            // XXX [ZW] Not sure why this was happening (grid resizing...?) but if this gets
            // called with a cell with no surrounding vertices, bail out to continue rendering
            if (this.point[i].surround.length == 0) {
                return;
            }

            this.ctx.beginPath();
            this.ctx.moveTo(this.point[this.point[i].surround[0]].x, this.point[this.point[i].surround[0]].y);
            for (var j = 1; j < this.point[i].surround.length; j++) {
                this.ctx.lineTo(this.point[this.point[i].surround[j]].x, this.point[this.point[i].surround[j]].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        for (var k = 0; k < keys.length; k++) {
            var i = keys[k];
            if (this.rect_surface_draw && this.surface_remove && this.selection.includes(parseInt(i)))
                continue;
            set_surface_style(this.ctx, this[pu].surface[i]);
            if (UserSettings.custom_colors_on && this[pu + "_col"].surface[i]) {
                this.ctx.fillStyle = this[pu + "_col"].surface[i];
                this.ctx.strokeStyle = this.ctx.fillStyle;
            }
            draw_cell(i);
        }
        if (this.rect_surface_draw && !this.surface_remove) {
            let color = this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][1];
            if (this.rect_surface_secondary)
                color = UserSettings.secondcolor;

            set_surface_style(this.ctx, color);

            if (UserSettings.custom_colors_on) {
                let cc;
                if (this.rect_surface_secondary)
                    cc = this.get_rgbcolor(color);
                else
                    cc = this.get_customcolor()
                this.ctx.fillStyle = cc;
                this.ctx.strokeStyle = this.ctx.fillStyle;
            }

            for (var i of this.selection)
                draw_cell(i);
        }
    }

    draw_freecircle() {
        /*free_circle*/
        if (((this.mode[this.mode.qa].edit_mode === "line" || this.mode[this.mode.qa].edit_mode === "lineE") && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") || this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "polygon") {
            this.ctx.setLineDash([]);
            this.ctx.fillStyle = Color.TRANSPARENTBLACK;
            if (this.drawing && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "polygon") {
                this.ctx.strokeStyle = Color.RED;
            } else {
                this.ctx.strokeStyle = Color.BLUE_LIGHT;
            }
            this.ctx.lineWidth = 4;
            let i1 = this.freelinecircle_g[0];
            let i2 = this.freelinecircle_g[1];
            if (i1 != -1) {
                this.draw_circle(this.ctx, this.point[i1].x, this.point[i1].y, 0.3);
            }
            if (i2 != -1) {
                this.draw_circle(this.ctx, this.point[i2].x, this.point[i2].y, 0.3);
            }
            // Preview the line 
            if (i1 != -1 && i2 != -1) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
                this.ctx.stroke();
            }
        }
    }

    draw_cursol() {
        let edit_mode = this.mode[this.mode.qa].edit_mode;
        /*cursol*/
        if ((edit_mode === "number" && !this.number_multi_enabled()) || edit_mode === "symbol") {
            set_line_style(this.ctx, 99);
            if (edit_mode === "symbol" && UserSettings.panel_shown && !pu.onoff_symbolmode_list[pu.mode[this.mode.qa].symbol[0]]) {
                this.ctx.strokeStyle = Color.BLUE_DARK_VERY;
            }
            this.ctx.fillStyle = Color.TRANSPARENTBLACK;
            let submode = this.mode[this.mode.qa][edit_mode][0];
            if (UserSettings.draw_edges) {
                this.draw_polygon(this.ctx, this.point[this.cursol].x, this.point[this.cursol].y, 0.2, 4, 45);
            } else {
                this.default_cursol();
            }
        }
    }

    default_cursol() {
        this.ctx.beginPath();
        this.ctx.moveTo(this.point[this.point[this.cursol].surround[0]].x, this.point[this.point[this.cursol].surround[0]].y);
        for (var j = 1; j < this.point[this.cursol].surround.length; j++) {
            this.ctx.lineTo(this.point[this.point[this.cursol].surround[j]].x, this.point[this.point[this.cursol].surround[j]].y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
    }

    draw_conflicts() {
        let keys = this.conflict_cells;
        for (var k = 0; k < keys.length; k++) {
            var i = keys[k];
            set_surface_style(this.ctx, 100);
            this.ctx.beginPath();
            this.ctx.moveTo(this.point[this.point[i].surround[0]].x, this.point[this.point[i].surround[0]].y);
            for (var j = 1; j < this.point[i].surround.length; j++) {
                this.ctx.lineTo(this.point[this.point[i].surround[j]].x, this.point[this.point[i].surround[j]].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    }

    draw_selection() {
        let edit_mode = this.mode[this.mode.qa].edit_mode;
        if (edit_mode === "sudoku" || this.number_multi_enabled() ||
            (edit_mode === "cage" && document.getElementById("sub_cage1").checked)) {
            // [ZW] removing this for now, preventing escape to clear selection, not sure what the purpose is
            // since we dont want single cell highlighed while in killer submode
            //if (this.selection.length === 0 && this.mode[this.mode.qa].edit_mode === "sudoku") {
            //    // check if cursor is in centerlist, to avoid border/edge case
            //    let cursorexist = this.centerlist.indexOf(this.cursol);
            //    if (cursorexist !== -1) {
            //        this.selection.push(this.cursol);
            //    }
            //}

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
                let factor, offset;
                if (this.grid_is_square()) {
                    factor = parseInt(k / (this.nx0 * this.ny0));
                    offset = 3;
                } else if (this.gridtype === "iso") {
                    factor = 0;
                    offset = 0;
                } else if (this.gridtype === "tetrakis_square" || this.gridtype === "cairo_pentagonal") {
                    factor = 0;
                    offset = 0;
                } else {
                    factor = 2;
                }
                // Color of selected cell
                // set_surface_style(this.ctx, 13);

                // Shadow for the selected cell
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = Color.BLUE_DARK_VERY;
                // Border outline for the selected cell
                set_line_style(this.ctx, 101);
                if (factor < 1) {
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
                            case 4:
                                // only useful and hard coded for cairo_pentagonal
                                this.ctx.lineTo(this.point[this.point[k].surround[4]].x + offset, this.point[this.point[k].surround[4]].y - offset);
                                break;
                        }
                    }
                    this.ctx.closePath();
                    // this.ctx.fill();
                    this.ctx.stroke();
                } else {
                    let r, n, th;
                    let tol = 0.01; // error tolerance
                    if (this.grid_is_square()) {
                        r = 0.2;
                        n = 4;
                        th = 45;
                    } else if (this.gridtype === "hex") {
                        r = 0.45;
                        n = 6;
                        th = 30 + this.theta;
                    } else if (this.gridtype === "tri") {
                        r = 0.5;
                        n = 3;
                        if (parseInt(k / (this.n0) ** 2) === 1) {
                            th = 90;
                        } else if (parseInt(k / (this.n0) ** 2) === 2) {
                            th = 150;
                        }
                    } else if (this.gridtype === "pyramid") {
                        r = 0.6;
                        n = 4;
                        th = 45;
                    } else if (this.gridtype === "truncated_square") {
                        if (parseInt(k % 2) === 0) { // Even numbers are octa shape, odd numbers are square shape
                            r = 0.65;
                            n = 8;
                            th = 22.5;
                        } else {
                            r = 0.3;
                            n = 4;
                            th = 45;
                        }
                    } else if (this.gridtype === "snub_square") {
                        if (this.point[k].surround.length === 3) { // Even numbers are octa shape, odd numbers are square shape
                            if (Math.abs(this.point[this.point[k].surround[a[0]]].y - this.point[this.point[k].surround[a[1]]].y) <= tol) {
                                r = 0.4;
                                n = 3;
                                th = 90;
                            } else if (Math.abs(this.point[this.point[k].surround[a[0]]].x - this.point[this.point[k].surround[a[2]]].x) <= tol) {
                                r = 0.4;
                                n = 3;
                                th = 0;
                            } else if (Math.abs(this.point[this.point[k].surround[a[1]]].y - this.point[this.point[k].surround[a[2]]].y) <= tol) {
                                r = 0.4;
                                n = 3;
                                th = 30;
                            } else {
                                r = 0.4;
                                n = 3;
                                th = 60;
                            }
                        } else if (this.point[k].surround.length === 4) {
                            if (Math.abs(this.point[this.point[k].surround[a[0]]].y - this.point[this.point[k].surround[a[1]]].y) <= tol) {
                                r = 0.6;
                                n = 4;
                                th = 45;
                            } else {
                                r = 0.6;
                                n = 4;
                                th = 105;
                            }
                        }
                    }
                    let x = this.point[k].x;
                    let y = this.point[k].y

                    this.ctx.beginPath();
                    this.ctx.moveTo(x - r * Math.cos(th * (Math.PI / 180)) * this.size, y - r * Math.sin(th * (Math.PI / 180)) * this.size);
                    for (var i = 0; i < n - 1; i++) {
                        th += 360 / n;
                        this.ctx.lineTo(x - r * Math.cos(th * (Math.PI / 180)) * this.size, y - r * Math.sin(th * (Math.PI / 180)) * this.size);
                    }
                    this.ctx.closePath();
                    this.ctx.stroke();
                }

                // Reset Bluring
                this.ctx.shadowBlur = 0;
                this.ctx.shadowColor = Color.TRANSPARENTBLACK;
            }
        }
    }

    check_solution() {
        var text = JSON.stringify(this.make_solution());
        let conflict = this.check_conflict(text);
        if (!this.multisolution) {
            if (this.solution) {
                if (!conflict) {
                    if (text === this.solution && this.sol_flag === 0) {
                        let message = document.getElementById("custom_message").value;
                        message = DOMPurify.sanitize(message);
                        if (message == "" || message.includes("http-equiv=")) {
                            message = Identity.solveDefaultMessage;
                        }
                        setTimeout(() => {
                            Swal.fire({
                                title: Identity.solveTitle ? '<h3 class="wish">' + Identity.solveTitle + '</h3>' : undefined,
                                html: '<h2 class="wish">' + message + '</h2>',
                                background: 'url(js/images/new_year.jpg)',
                                icon: 'success',
                                confirmButtonText: Identity.solveOKButtonText,
                                // timer: 5000
                            })
                        }, 20);
                        sw_timer.pause();
                        // this.mouse_mode = "out";
                        // this.mouseevent(0, 0, 0);
                        this.sol_flag = 1;
                        // document.getElementById("pu_a_label").innerHTML = "Correct Solution";
                        // document.getElementById("pu_a_label").style.backgroundColor = Color.GREEN_LIGHT_VERY;
                    } else if (text != this.solution && this.sol_flag === 1) { // If the answer changes, check again
                        this.sol_flag = 0;
                        // document.getElementById("pu_a_label").innerHTML = "Check Solution";
                        // document.getElementById("pu_a_label").style.backgroundColor = Color.GREY_LIGHT;
                    }
                }
                this.redraw(false, false);
            }
        } else {
            var text = this.make_solution();
            for (var i = 0; i < this.solution.length; i++) {
                let author_sol = JSON.stringify(this.solution[i]);
                if (author_sol) {
                    for (var j = 0; j < text.length; j++) {
                        let user_sol = JSON.stringify(text[j]);
                        if (user_sol === author_sol && this.sol_flag === 0) {
                            let message = document.getElementById("custom_message").value;
                            message = DOMPurify.sanitize(message);
                            if (message == "" || message.includes("http-equiv=")) {
                                message = Identity.solveDefaultMessage;
                            }
                            setTimeout(() => {
                                Swal.fire({
                                    title: Identity.solveTitle ? '<h3 class="wish">' + Identity.solveTitle + '</h3>' : undefined,
                                    html: '<h2 class="wish">' + message + '</h2>',
                                    background: 'url(js/images/new_year.jpg)',
                                    icon: 'success',
                                    confirmButtonText: Identity.solveOKButtonText,
                                })
                            }, 20);
                            sw_timer.pause();
                            this.sol_flag = 1;
                            // document.getElementById("pu_a_label").innerHTML = "Correct Solution";
                            // document.getElementById("pu_a_label").style.backgroundColor = Color.GREEN_LIGHT_VERY;
                            i = this.solution.length; // to break the outer for loop
                            break;
                        } else if (user_sol === author_sol && this.sol_flag === 1) {
                            i = this.solution.length; // to break the outer for loop
                            break;
                        }
                    }
                }
                if (i === (this.solution.length - 1) && this.sol_flag === 1) {
                    // If there was any change in the grid and none of the solution matches then reset the flag
                    // last iteration of outer for loop and if sol_flag is still up then it needs to be reset
                    this.sol_flag = 0;
                    // document.getElementById("pu_a_label").innerHTML = "Check Solution";
                    // document.getElementById("pu_a_label").style.backgroundColor = Color.GREY_LIGHT;
                }
            }
        }
    }

    only_alphanumeric(str) {
        return /^[A-Za-z0-9]*$/.test(str);
    }

    load_clues() {
        let iostring = document.getElementById("iostring").value;
        let pcolor = 1; //black
        let scolor = 9; //blue, 2 for green

        // Replace spaces if user desires. Keep line breaks if using non-square mode.
        if (document.getElementById("sudokuIgnoreSpaces").checked) {
            if (document.getElementById("sudokuIgnoreNotSquare").checked) {
                iostring = iostring.replace(' ', '');
            } else {
                iostring = iostring.replace(/\s/g, '');
            }
        }

        // Replace dots with zeros
        iostring = iostring.replace(/\./g, 0);

        let digits = iostring.split("");
        let size = Math.sqrt(iostring.length);

        // check all are digits or alphabets (or spacing)
        if (!document.getElementById("sudokuIgnoreNotSquare").checked && !pu.only_alphanumeric(iostring)) {
            document.getElementById("sudokuIOFail").classList.remove('is_hidden');
            return "failed";
        } else if (document.getElementById("sudokuIgnoreNotSquare").checked && !(/^[A-Za-z0-9\s]*$/.test(iostring))) {
            document.getElementById("sudokuIOFail").classList.remove('is_hidden');
            return "failed";
        } else {
            document.getElementById("sudokuIOFail").classList.add('is_hidden');
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

        if (!document.getElementById("sudokuIgnoreNotSquare").checked && !Number.isInteger(Math.sqrt(iostring.length))) {
            document.getElementById("iostring").value = "Error: Number of digits is not a perfect square";
            return "failed";
        }

        // Helper method
        const placeChar = function(thisRef, x, y, char, color) {
            thisRef.record("number", x + y);
            thisRef[thisRef.mode.qa].number[x + y] = [char, color, "1"];
        };

        let colorToUse = this.mode.qa === "pu_q" ? pcolor : scolor;

        if (document.getElementById("sudokuIgnoreNotSquare").checked) {
            // Ignoring square rule, use line breaks to do import.
            let j = r_start;
            let i = c_start;
            let nextChar;
            for (let k = 0; k < digits.length; k++) {
                nextChar = digits[k];
                if (nextChar.charCodeAt(0) === 10) {
                    i = c_start;
                    j++;
                } else {
                    if (this.mode.qa === "pu_q" || !(this["pu_q"].number[(i + 2) + ((j + 2) * this.nx0)])) {
                        placeChar(this, i + 2, (j + 2) * this.nx0, nextChar, colorToUse);
                    }
                    i++;
                }
            }
        } else if (Number.isInteger(Math.sqrt(iostring.length))) {
            // Using classic square mode
            for (var j = r_start; j < (size + r_start); j++) { //  row
                for (var i = c_start; i < (size + c_start); i++) { // column
                    if (parseInt(digits[j - r_start + i - c_start + (j - r_start) * (size - 1)], 10) !== 0) {
                        if (this.mode.qa === "pu_q" || !(this["pu_q"].number[(i + 2) + ((j + 2) * this.nx0)])) {
                            placeChar(this, i + 2, (j + 2) * this.nx0, digits[j - r_start + i - c_start + (j - r_start) * (size - 1)], colorToUse);
                        }
                    }
                }
            }
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

                let primary = this[mode_order[0]].number[(i + 2) + ((j + 2) * this.nx0)];
                let secondary = this[mode_order[1]].number[(i + 2) + ((j + 2) * this.nx0)];
                let checklist = {};

                if (document.getElementById("ignore_pencilmarks").checked) {
                    checklist = {
                        2: 1,
                        4: 1,
                        5: 1,
                        6: 1,
                        10: 1
                    };
                } else {
                    checklist = {
                        2: 1,
                        4: 1
                    };
                }

                if (primary && !checklist[primary[2]]) {
                    if (primary[2] === "7") {
                        var sum = 0,
                            a;
                        for (var k = 0; k < 10; k++) {
                            if (primary[0][k] === 1) {
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
                        if (!pu.only_alphanumeric(primary[0])) {
                            outputstring += '0';
                        } else {
                            outputstring += primary[0];
                        }
                    }
                } else if (secondary && !checklist[secondary[2]]) {
                    if (secondary[2] === "7") {
                        var sum = 0,
                            a;
                        for (var k = 0; k < (size + 1); k++) {
                            if (secondary[0][k] === 1) {
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
                        if (!pu.only_alphanumeric(secondary[0])) {
                            outputstring += '0';
                        } else {
                            outputstring += secondary[0];
                        }
                    }
                } else {
                    outputstring += '0';
                }
            }
        }

        // Sanity check
        if (outputstring.length === size * size) {
            let textarea = document.getElementById("iostring");
            if (navigator.clipboard) {
                navigator.clipboard.writeText(textarea.value);
            } else {
                document.getElementById("iostring").value = outputstring;
                textarea.select();
                let range = document.createRange();
                range.selectNodeContents(textarea);
                let sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                textarea.setSelectionRange(0, 1e5);
                document.execCommand("copy");
            }
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
        if (!customcolor) return customcolor;
        return "rgba(" + Math.round(customcolor._r) + "," + Math.round(customcolor._g) + "," + Math.round(customcolor._b) + "," + customcolor._a + ")";
    }

    check_conflict(current_sol) {
        if (UserSettings.conflict_detection > 1) {
            // User has disabled conflict detection.
            this.conflict_cells = [];
            this.conflict_cell_values = [];
            return;
        }
        if (this.user_tags) {
            this.conflicts.reset();
            const tags = new Set(this.user_tags);
            if (tags.has('noconflict')) {
                return false;
            }
            if (tags.has('consecutivepairs')) {
                this.conflicts.check_sudoku();
                // check consecutive only if no classic conflict
                if (this.conflict_cells.length === 0) {
                    this.conflicts.check_consecutivepairs();
                }
            } else if (tags.has('consecutive') || tags.has('nonconsecutive')) {
                this.conflicts.check_sudoku();
                // check consecutive only if no classic conflict
                if (this.conflict_cells.length === 0) {
                    this.conflicts.check_consecutive();
                }
            } else if (tags.has('irregular')) {
                this.conflicts.check_irregular();
            } else if (tags.has('classic')) {
                this.conflicts.check_sudoku();
            } else if (tags.has('starbattle')) {
                this.conflicts.check_star_battle();
            } else if (tags.has('tomtom')) {
                this.conflicts.check_tomtom();
            } else if (tags.has('latin')) {
                this.conflicts.check_latin_square();
            }
            this.previous_sol = current_sol;
            if (this.conflict_cells.length !== 0) {
                return true;
            } else {
                return false;
            }
        }
    }

    update_customcolor(color) {
        const mode = this.mode[this.mode.qa].edit_mode;
        this.mode[this.mode.qa][mode][2] = color;

        // Save custom color for this submode
        const [submode, style] = this.mode[this.mode.qa][mode];
        let name = 'st_' + mode + style;
        this.custom_colors[name] = color;

        panel_pu.draw_panel();
    }

    version_lt(major, minor, revision) {
        if (this.version[0] < major) return true;
        if (this.version[0] > major) return false;
        if (this.version[1] < minor) return true;
        if (this.version[1] > minor) return false;
        return this.version[2] < revision;
    }

    version_ge(major, minor, revision) {
        return !this.version_lt(major, minor, revision);
    }

    version_gt(major, minor, revision) {
        if (this.version[0] > major) return true;
        if (this.version[0] < major) return false;
        if (this.version[1] > minor) return true;
        if (this.version[1] < minor) return false;
        return this.version[2] > revision;
    }

    version_le(major, minor, revision) {
        return !this.version_gt(major, minor, revision);
    }

}
