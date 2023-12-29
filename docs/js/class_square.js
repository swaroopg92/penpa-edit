class Puzzle_square extends Puzzle {
    constructor(nx, ny, size) {
        // Board information
        super('square');
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 4;
        this.ny0 = this.ny + 4;
        this.margin = -1; //for arrow of number pointing outside of the grid
        this.sudoku = [0, 0, 0, 0]; // This is for sudoku settings
        this.width0 = this.nx + 1;
        this.height0 = this.ny + 1;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [
            parseInt(document.getElementById("nb_space1").value, 10),
            parseInt(document.getElementById("nb_space2").value, 10),
            parseInt(document.getElementById("nb_space3").value, 10),
            parseInt(document.getElementById("nb_space4").value, 10)
        ];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 8,
            "arrow_fourtip": 4,
            "degital_B": 7,
            "degital_G": 7,
            "degital_E": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9,
            "polyhex": 7

        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0;
        var nx = this.nx0;
        var ny = this.ny0;
        var adjacent, surround, type, use, neighbor, adjacent_dia;
        var point = [];
        //center
        type = 0;
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                adjacent = [k - nx, k - 1, k + 1, k + nx];
                adjacent_dia = [k - nx - 1, k - nx + 1, k + nx - 1, k + nx + 1];
                surround = [k + nx * ny - nx - 1, k + nx * ny - nx, k + nx * ny, k + nx * ny - 1];
                neighbor = [k + 2 * nx * ny - nx, k + 2 * nx * ny, k + 3 * nx * ny - 1, k + 3 * nx * ny];
                point[k] = new Point((i + 0.5) * this.size, (j + 0.5) * this.size, type, adjacent, surround, use, neighbor, adjacent_dia);
                k++;
            }
        }
        //vertex
        type = 1;
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                adjacent = [k - nx, k - 1, k + 1, k + nx];
                adjacent_dia = [k - nx - 1, k - nx + 1, k + nx - 1, k + nx + 1];
                surround = [];
                point[k] = new Point(point[i + j * nx].x + 0.5 * this.size, point[i + j * nx].y + 0.5 * this.size, type, adjacent, surround, use, [], adjacent_dia);
                k++;
            }
        }


        //centervertex
        type = 2;
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                adjacent = [k + nx, k - nx];
                surround = [];
                neighbor = [k - 2 * nx * ny, k - 2 * nx * ny + nx];
                point[k] = new Point(point[i + j * nx].x, point[i + j * nx].y + 0.5 * this.size, type, adjacent, surround, use, neighbor);
                k++;
            }
        }
        type = 3;
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                adjacent = [k + 1, k - 1];
                surround = [];
                neighbor = [k - 3 * nx * ny, k - 3 * nx * ny + 1];
                point[k] = new Point(point[i + j * nx].x + 0.5 * this.size, point[i + j * nx].y, type, adjacent, surround, use, neighbor);
                k++;
            }
        }

        //  1/4
        var r = 0.25;
        type = 4;
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                surround = [];
                adjacent = [k - 4 * nx + 2, k - 3, k + 1, k + 2];
                point[k] = new Point(point[i + j * nx].x - r * this.size, point[i + j * nx].y - r * this.size, type, adjacent, surround, use);
                k++;
                adjacent = [k - 4 * nx + 2, k - 1, k + 3, k + 2];
                point[k] = new Point(point[i + j * nx].x + r * this.size, point[i + j * nx].y - r * this.size, type, adjacent, surround, use);
                k++;
                adjacent = [k - 2, k - 3, k + 1, k + 4 * nx - 2];
                point[k] = new Point(point[i + j * nx].x - r * this.size, point[i + j * nx].y + r * this.size, type, adjacent, surround, use);
                k++;
                adjacent = [k - 2, k - 1, k + 3, k + 4 * nx - 2];
                point[k] = new Point(point[i + j * nx].x + r * this.size, point[i + j * nx].y + r * this.size, type, adjacent, surround, use);
                k++;
            }
        }

        //  compass
        var r = 0.3;
        type = 5;
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                adjacent = [];
                surround = [];
                point[k] = new Point(point[i + j * nx].x - 0 * this.size, point[i + j * nx].y - r * this.size, type, adjacent, surround, use);
                k++;
                point[k] = new Point(point[i + j * nx].x + r * this.size, point[i + j * nx].y - 0 * this.size, type, adjacent, surround, use);
                k++;
                point[k] = new Point(point[i + j * nx].x - r * this.size, point[i + j * nx].y + 0 * this.size, type, adjacent, surround, use);
                k++;
                point[k] = new Point(point[i + j * nx].x + 0 * this.size, point[i + j * nx].y + r * this.size, type, adjacent, surround, use);
                k++;
            }
        }

        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [
            parseInt(document.getElementById("nb_space1").value, 10),
            parseInt(document.getElementById("nb_space2").value, 10),
            parseInt(document.getElementById("nb_space3").value, 10),
            parseInt(document.getElementById("nb_space4").value, 10)
        ];

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

        this.centerlist = [] //reset centerlist to match the margins
        for (var j = 2 + this.space[0]; j < this.ny0 - 2 - this.space[1]; j++) {
            for (var i = 2 + this.space[2]; i < this.nx0 - 2 - this.space[3]; i++) { // the top and left edges are unused
                this.centerlist.push(i + j * (this.nx0));
            }
        }

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
    }

    type_set() {
        var type
        switch (this.mode[this.mode.qa].edit_mode) {
            case "surface":
            case "board":
                type = [0];
                break;
            case "symbol":
            case "move":
                if (!UserSettings.draw_edges) {
                    type = [0];
                } else {
                    type = [0, 1, 2, 3];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [4];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [5];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 2, 3];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2, 3];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2, 3];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2, 3];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
                }
                break;
            case "wall":
                if (this.drawing) {
                    type = [this.point[this.last].type];
                } else {
                    type = [2, 3];
                }
                break;
            case "cage":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "1") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [4];
                }
                break;
            case "special":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "polygon") {
                    type = [1];
                } else {
                    type = [0, 1];
                }
                break;
            case "combi":
                switch (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0]) {
                    case "tents":
                    case "linex":
                    case "linedir":
                    case "yajilin":
                    case "akari":
                        type = [0, 2, 3];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                    case "mines":
                    case "doublemines":
                        type = [0, 1, 2, 3];
                        break;
                    case "blpo":
                    case "blwh":
                    case "battleship":
                    case "magnets":
                    case "lineox":
                    case "hashi":
                    case "arrowS":
                    case "shaka":
                    case "numfl":
                    case "alfl":
                    case "rassisillai":
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                }
                break;
            case "sudoku":
                if (UserSettings.draw_edges) {
                    type = [0, 2, 3];
                } else {
                    type = [0];
                }
                break;
        }
        return type;
    }

    coord_p_edgex(x, y, hitboxfactor) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (hitboxfactor * this.size) ** 2) {
                            break;
                        }
                    }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex_star(x, y, hitboxfactor) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 1 || this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (hitboxfactor * this.size) ** 2) {
                            break;
                        }
                    }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    rotate_left() {
        this.theta = (this.theta - 90 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -90);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 90 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +90);
        this.redraw();
    }

    cursolcheck() {
        if (this.mode[this.mode.qa].edit_mode === "number" && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
            if (this.cursolS > 8 * (this.nx0) * (this.ny0)) {
                this.cursolS -= 4 * (this.nx0) * (this.ny0);
            }
        } else if (this.mode[this.mode.qa].edit_mode === "number" && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
            if (this.cursolS < 8 * (this.nx0) * (this.ny0)) {
                this.cursolS += 4 * (this.nx0) * (this.ny0);
            }
        }
    }

    key_arrow(key_code, ctrl_key = false) {
        var a, a1, a2;
        var b, c;
        if (this.theta === 0) { b = [0, 1, 2, 3]; } else if (this.theta === 90) { b = [3, 0, 1, 2]; } else if (this.theta === 180) { b = [2, 3, 0, 1]; } else if (this.theta === 270) { b = [1, 2, 3, 0]; }
        if (this.reflect[0] === -1) {
            c = b[0];
            b[0] = b[2];
            b[2] = c;
        }
        if (this.reflect[1] === -1) {
            c = b[1];
            b[1] = b[3];
            b[3] = c;
        }
        switch (key_code) {
            case "ArrowLeft":
                c = b[0];
                break;
            case "ArrowUp":
                c = b[1];
                break;
            case "ArrowRight":
                c = b[2];
                break;
            case "ArrowDown":
                c = b[3];
                break;
        }
        if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol" || this.mode[this.mode.qa].edit_mode === "sudoku") {
            if (this.mode[this.mode.qa].edit_mode === "number" && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                switch (c) {
                    case 0:
                        a = this.cursolS % 2 === 0 ? this.cursolS - 3 : this.cursolS - 1;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                    case 1:
                        a = (this.cursolS % 4 === 0 || this.cursolS % 4 === 1) ? this.cursolS - 4 * (this.nx0) + 2 : this.cursolS - 2;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                    case 2:
                        a = this.cursolS % 2 === 0 ? this.cursolS + 1 : this.cursolS + 3;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                    case 3:
                        a = (this.cursolS % 4 === 0 || this.cursolS % 4 === 1) ? this.cursolS + 2 : this.cursolS + 4 * (this.nx0) - 2;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                }
                // Remember cursol
                this.cursol = parseInt(this.cursolS / 4) - this.nx0 * this.ny0;
                this.selection = [];
                if (!this.selection.includes(this.cursol)) {
                    this.selection.push(this.cursol);
                }
            } else if (this.mode[this.mode.qa].edit_mode === "number" && this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                switch (c) {
                    case 0:
                        a = this.cursolS % 4 === 2 ? this.cursolS - 4 : this.cursolS - this.cursolS % 4 + 2;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                    case 1:
                        a = this.cursolS % 4 === 0 ? this.cursolS - 4 * (this.nx0) : this.cursolS - this.cursolS % 4;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                    case 2:
                        a = this.cursolS % 4 === 1 ? this.cursolS + 4 : this.cursolS - this.cursolS % 4 + 1;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                    case 3:
                        a = this.cursolS % 4 === 3 ? this.cursolS + 4 * (this.nx0) : this.cursolS - this.cursolS % 4 + 3;
                        if (this.point[a].use === 1) { this.cursolS = a; }
                        break;
                }
                // Remember cursol
                this.cursol = parseInt(this.cursolS / 4) - 2 * this.nx0 * this.ny0;
                this.selection = [];
                if (!this.selection.includes(this.cursol)) {
                    this.selection.push(this.cursol);
                }
            } else if (this.mode[this.mode.qa].edit_mode === "sudoku") {
                if (this.selection.length >= 1) {
                    var current_cursor = this.cursol;
                    switch (c) {
                        case 0:
                            a1 = current_cursor - 1;
                            a2 = current_cursor - 2;
                            if (this.point[a1].use === 1) {
                                if (this.point[a2].use === 1) {
                                    if (!ctrl_key) {
                                        this.selection = [];
                                    }
                                    if (!this.selection.includes(a1)) {
                                        this.selection.push(a1);
                                    }
                                    this.cursol = a1;
                                } else {
                                    a2 = current_cursor - 1 + this.nx;
                                    if (this.point[a2].use === 1) {
                                        if (!ctrl_key) {
                                            this.selection = [];
                                        }
                                        if (!this.selection.includes(a2)) {
                                            this.selection.push(a2);
                                        }
                                        this.cursol = a2;
                                    }
                                }
                            }
                            break;
                        case 1:
                            a1 = current_cursor - this.nx0;
                            a2 = current_cursor - 2 * this.nx0;
                            if (this.point[a1].use === 1) {
                                if (this.point[a2].use === 1) {
                                    if (!ctrl_key) {
                                        this.selection = [];
                                    }
                                    if (!this.selection.includes(a1)) {
                                        this.selection.push(a1);
                                    }
                                    this.cursol = a1;
                                } else {
                                    a2 = current_cursor + (this.ny - 1) * this.nx0;
                                    if (this.point[a2].use === 1) {
                                        if (!ctrl_key) {
                                            this.selection = [];
                                        }
                                        if (!this.selection.includes(a2)) {
                                            this.selection.push(a2);
                                        }
                                        this.cursol = a2;
                                    }
                                }
                            }
                            break;
                        case 2:
                            a1 = current_cursor + 1;
                            a2 = current_cursor + 2;
                            if (this.point[a1].use === 1) {
                                if (this.point[a2].use === 1) {
                                    if (!ctrl_key) {
                                        this.selection = [];
                                    }
                                    if (!this.selection.includes(a1)) {
                                        this.selection.push(a1);
                                    }
                                    this.cursol = a1;
                                } else {
                                    a2 = current_cursor + 1 - this.nx;
                                    if (this.point[a2].use === 1) {
                                        if (!ctrl_key) {
                                            this.selection = [];
                                        }
                                        if (!this.selection.includes(a2)) {
                                            this.selection.push(a2);
                                        }
                                        this.cursol = a2;
                                    }
                                }
                            }
                            break;
                        case 3:
                            a1 = current_cursor + this.nx0;
                            a2 = current_cursor + 2 * this.nx0;
                            if (this.point[a1].use === 1) {
                                if (this.point[a2].use === 1) {
                                    if (!ctrl_key) {
                                        this.selection = [];
                                    }
                                    if (!this.selection.includes(a1)) {
                                        this.selection.push(a1);
                                    }
                                    this.cursol = a1;
                                } else {
                                    a2 = current_cursor - (this.ny - 1) * this.nx0;
                                    if (this.point[a2].use === 1) {
                                        if (!ctrl_key) {
                                            this.selection = [];
                                        }
                                        if (!this.selection.includes(a2)) {
                                            this.selection.push(a2);
                                        }
                                        this.cursol = a2;
                                    }
                                }
                            }
                            break;
                    }
                    // Remember cursolS
                    if (!this.cellsoutsideFrame.includes(this.cursol)) {
                        this.cursolS = 4 * (this.cursol + this.nx0 * this.ny0);
                    }
                }
            } else {
                switch (c) {
                    case 0:
                        a = this.cursol - 1;
                        if (this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 1:
                        a = this.cursol - this.nx0;
                        if (this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 2:
                        a = this.cursol + 1;
                        if (this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 3:
                        a = this.cursol + this.nx0;
                        if (this.point[a].use === 1) { this.cursol = a; }
                        break;
                }
                // Remember cursolS
                if (!this.cellsoutsideFrame.includes(this.cursol)) {
                    this.cursolS = 4 * (this.cursol + this.nx0 * this.ny0);
                }
            }
        }
        this.redraw();
    }

    direction_arrow8(x, y, x0, y0) {
        var angle = Math.atan2(y - y0, x - x0) * 360 / 2 / Math.PI + 180;
        if (this.reflect[0] === -1) { angle = (180 - angle + 360) % 360; }
        if (this.reflect[1] === -1) { angle = (360 - angle + 360) % 360; }
        angle = (angle - this.theta + 360) % 360;
        angle -= 180;
        var a;
        if (angle < -157.5 || angle > 157.5) {
            a = 1;
        } else if (angle > -157.5 && angle < -112.5) {
            a = 4;
        } else if (angle > -112.5 && angle < -67.5) {
            a = 0;
        } else if (angle > -67.5 && angle < -22.5) {
            a = 5;
        } else if (angle > -22.5 && angle < 22.5) {
            a = 2;
        } else if (angle > 22.5 && angle < 67.5) {
            a = 7;
        } else if (angle > 67.5 && angle < 112.5) {
            a = 3;
        } else if (angle > 112.5 && angle < 157.5) {
            a = 6;
        }
        return a;
    }

    direction_arrow4(x, y, x0, y0) {
        var angle = Math.atan2(y - y0, x - x0) * 360 / 2 / Math.PI + 180;
        if (this.reflect[0] === -1) { angle = (180 - angle + 360) % 360; }
        if (this.reflect[1] === -1) { angle = (360 - angle + 360) % 360; }
        angle = (angle - this.theta + 360) % 360;
        angle -= 180;
        var a;
        if (angle >= -180 && angle < -90) {
            a = 1;
        } else if (angle >= -90 && angle < 0) {
            a = 4;
        } else if (angle >= 0 && angle < 90) {
            a = 3;
        } else if (angle >= 90 && angle <= 180) {
            a = 2;
        }
        return a;
    }

    direction_battleship4(x, y, x0, y0) {
        var angle = Math.atan2(y - y0, x - x0) * 360 / 2 / Math.PI + 180;
        if (this.reflect[0] === -1) { angle = (180 - angle + 360) % 360; }
        if (this.reflect[1] === -1) { angle = (360 - angle + 360) % 360; }
        angle = (angle - this.theta + 360) % 360;
        angle -= 180;
        var a;
        if ((angle >= -225 && angle < -135) || (angle >= 135 && angle < 225)) {
            a = 1;
        } else if ((angle >= -135 && angle < -45) || (angle >= 225 && angle < 315)) {
            a = 0;
        } else if ((angle >= -45 && angle < 45) || (angle >= 315 && angle < 405)) {
            a = 3;
        } else if (angle >= 45 && angle <= 135) {
            a = 2;
        }
        return a;
    }

    direction_loop4(x, y, x0, y0) {
        var angle = Math.atan2(y - y0, x - x0) * 360 / 2 / Math.PI + 180;
        if (this.reflect[0] === -1) { angle = (180 - angle + 360) % 360; }
        if (this.reflect[1] === -1) { angle = (360 - angle + 360) % 360; }
        angle = (angle - this.theta + 360) % 360;
        angle -= 180;
        var a;
        if ((angle >= -225 && angle < -135) || (angle >= 135 && angle < 225)) {
            a = 2;
        } else if ((angle >= -135 && angle < -45) || (angle >= 225 && angle < 315)) {
            a = 0;
        } else if ((angle >= -45 && angle < 45) || (angle >= 315 && angle < 405)) {
            a = 3;
        } else if (angle >= 45 && angle <= 135) {
            a = 1;
        }
        return a;
    }

    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_frameBold();
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_conflicts();
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_squareframe("pu_q");
            this.draw_squareframe("pu_a");
            this.draw_thermo("pu_q");
            this.draw_thermo("pu_a");
            this.draw_nobulbthermo("pu_q");
            this.draw_nobulbthermo("pu_a");
            this.draw_arrowsp("pu_q");
            this.draw_arrowsp("pu_a");
            this.draw_wall("pu_q");
            this.draw_wall("pu_a");
            this.draw_direction("pu_q");
            this.draw_direction("pu_a");
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_number_circle("pu_q");
            this.draw_number_circle("pu_a");
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_cage("pu_q");
            this.draw_cage("pu_a");
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_frameBold();
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_squareframe("pu_q");
            this.draw_thermo("pu_q");
            this.draw_nobulbthermo("pu_q");
            this.draw_arrowsp("pu_q");
            this.draw_wall("pu_q");
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_direction("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_number_circle("pu_q");
            this.draw_symbol("pu_q", 2);
            this.draw_cage("pu_q");
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
        }
    }

    draw_lattice() {
        if (this.mode.grid[1] === "1") {
            this.ctx.fillStyle = Color.BLACK;
            var verticelist = [];
            for (var i = 0; i < this.centerlist.length; i++) {
                for (var j = 0; j < this.point[this.centerlist[i]].surround.length; j++) {
                    verticelist.push(this.point[this.centerlist[i]].surround[j]);
                }
            }
            verticelist = Array.from(new Set(verticelist));
            for (var i = 0; i < verticelist.length; i++) {
                this.ctx.beginPath();
                this.ctx.arc(this.point[verticelist[i]].x, this.point[verticelist[i]].y, 2.1, 0, 2 * Math.PI, true);
                this.ctx.fill();
            }
        }
    }

    draw_polygon(ctx, x, y, r, n, th) {
        ctx.LineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - r * Math.cos(th * (Math.PI / 180)) * this.size, y - r * Math.sin(th * (Math.PI / 180)) * this.size);
        for (var i = 0; i < n - 1; i++) {
            th += 360 / n;
            ctx.lineTo(x - r * Math.cos(th * (Math.PI / 180)) * this.size, y - r * Math.sin(th * (Math.PI / 180)) * this.size);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    draw_rectbar(ctx, x, y, rx, ry, n, th) {
        ctx.LineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - rx * Math.cos(th * (Math.PI / 180)) * this.size, y - ry * Math.sin(th * (Math.PI / 180)) * this.size);
        for (var i = 0; i < n - 1; i++) {
            th += 360 / n;
            ctx.lineTo(x - rx * Math.cos(th * (Math.PI / 180)) * this.size, y - ry * Math.sin(th * (Math.PI / 180)) * this.size);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    draw_squareframe(pu) {
        for (var i = 0; i < this[pu].squareframe.length; i++) {
            if (this[pu].squareframe[i][0]) {
                this.ctx.setLineDash([]);
                this.ctx.lineCap = "square";
                if (UserSettings.custom_colors_on && this[pu + "_col"].squareframe[i]) {
                    this.ctx.strokeStyle = this[pu + "_col"].squareframe[i];
                } else {
                    this.ctx.strokeStyle = Color.GREY_LIGHT;
                }
                this.ctx.lineWidth = this.size * 0.8;
                this.ctx.beginPath();
                this.ctx.moveTo(this.point[this[pu].squareframe[i][0]].x, this.point[this[pu].squareframe[i][0]].y);
                for (var j = 1; j < this[pu].squareframe[i].length; j++) {
                    this.ctx.lineTo(this.point[this[pu].squareframe[i][j]].x, this.point[this[pu].squareframe[i][j]].y);
                }
                this.ctx.stroke();
            }
        }
    }

    draw_thermo(pu) {
        if (this[pu].thermo) {
            let xdirection, ydirection, commonend; // x is column, y is row
            let reduce_straight = 0.44 * this.size,
                reduce_diagonal = 0.316 * this.size;
            for (var i = 0; i < this[pu].thermo.length; i++) {
                if (this[pu].thermo[i] && this[pu].thermo[i][0]) {
                    this.ctx.strokeStyle = Color.TRANSPARENTBLACK;
                    if (UserSettings.custom_colors_on && this[pu + "_col"].thermo[i]) {
                        this.ctx.fillStyle = this[pu + "_col"].thermo[i];
                    } else {
                        this.ctx.fillStyle = Color.GREY_LIGHT;
                    }
                    this.draw_circle(this.ctx, this.point[this[pu].thermo[i][0]].x, this.point[this[pu].thermo[i][0]].y, 0.4);
                    this.ctx.setLineDash([]);
                    this.ctx.lineCap = "square";
                    if (UserSettings.custom_colors_on && this[pu + "_col"].thermo[i]) {
                        this.ctx.strokeStyle = this[pu + "_col"].thermo[i];
                    } else {
                        this.ctx.strokeStyle = Color.GREY_LIGHT;
                    }
                    this.ctx.lineWidth = this.size * 0.4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.point[this[pu].thermo[i][0]].x, this.point[this[pu].thermo[i][0]].y);
                    for (var j = 1; j < this[pu].thermo[i].length; j++) {
                        if (j < (this[pu].thermo[i].length - 1)) {
                            this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x, this.point[this[pu].thermo[i][j]].y);
                        } else {
                            commonend = this.find_common(pu, i, this[pu].thermo[i][j], "thermo");
                            if (commonend) {
                                xdirection = this.point[this[pu].thermo[i][j]].x - this.point[this[pu].thermo[i][j - 1]].x;
                                ydirection = this.point[this[pu].thermo[i][j]].y - this.point[this[pu].thermo[i][j - 1]].y;
                                if (xdirection == 0 && ydirection < 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x, this.point[this[pu].thermo[i][j]].y + reduce_straight);
                                } else if (xdirection < 0 && ydirection > 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x + reduce_diagonal, this.point[this[pu].thermo[i][j]].y - reduce_diagonal);
                                } else if (xdirection > 0 && ydirection == 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x - reduce_straight, this.point[this[pu].thermo[i][j]].y);
                                } else if (xdirection > 0 && ydirection > 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x - reduce_diagonal, this.point[this[pu].thermo[i][j]].y - reduce_diagonal);
                                } else if (xdirection == 0 && ydirection > 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x, this.point[this[pu].thermo[i][j]].y - reduce_straight);
                                } else if (xdirection > 0 && ydirection < 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x - reduce_diagonal, this.point[this[pu].thermo[i][j]].y + reduce_diagonal);
                                } else if (xdirection < 0 && ydirection == 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x + reduce_straight, this.point[this[pu].thermo[i][j]].y);
                                } else if (xdirection < 0 && ydirection < 0) {
                                    this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x + reduce_diagonal, this.point[this[pu].thermo[i][j]].y + reduce_diagonal);
                                }
                            } else {
                                this.ctx.lineTo(this.point[this[pu].thermo[i][j]].x, this.point[this[pu].thermo[i][j]].y);
                            }
                        }
                    }
                    this.ctx.stroke();
                }
            }
        }
    }

    draw_nobulbthermo(pu) {
        if (this[pu].nobulbthermo) {
            let xdirection, ydirection, commonend; // x is column, y is row
            let reduce_straight = 0.44 * this.size,
                reduce_diagonal = 0.316 * this.size;
            for (var i = 0; i < this[pu].nobulbthermo.length; i++) {
                if (this[pu].nobulbthermo[i] && this[pu].nobulbthermo[i][0]) {
                    this.ctx.strokeStyle = Color.TRANSPARENTBLACK;
                    if (UserSettings.custom_colors_on && this[pu + "_col"].nobulbthermo[i]) {
                        this.ctx.fillStyle = this[pu + "_col"].nobulbthermo[i];
                    } else {
                        this.ctx.fillStyle = Color.GREY_LIGHT;
                    }
                    this.ctx.setLineDash([]);
                    this.ctx.lineCap = "square";
                    if (UserSettings.custom_colors_on && this[pu + "_col"].nobulbthermo[i]) {
                        this.ctx.strokeStyle = this[pu + "_col"].nobulbthermo[i];
                    } else {
                        this.ctx.strokeStyle = Color.GREY_LIGHT;
                    }
                    this.ctx.lineWidth = this.size * 0.4;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.point[this[pu].nobulbthermo[i][0]].x, this.point[this[pu].nobulbthermo[i][0]].y);
                    for (var j = 1; j < this[pu].nobulbthermo[i].length; j++) {
                        if (j < (this[pu].nobulbthermo[i].length - 1)) {
                            this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x, this.point[this[pu].nobulbthermo[i][j]].y);
                        } else {
                            commonend = this.find_common(pu, i, this[pu].nobulbthermo[i][j], "nobulbthermo");
                            if (commonend) {
                                xdirection = this.point[this[pu].nobulbthermo[i][j]].x - this.point[this[pu].nobulbthermo[i][j - 1]].x;
                                ydirection = this.point[this[pu].nobulbthermo[i][j]].y - this.point[this[pu].nobulbthermo[i][j - 1]].y;
                                if (xdirection == 0 && ydirection < 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x, this.point[this[pu].nobulbthermo[i][j]].y + reduce_straight);
                                } else if (xdirection < 0 && ydirection > 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x + reduce_diagonal, this.point[this[pu].nobulbthermo[i][j]].y - reduce_diagonal);
                                } else if (xdirection > 0 && ydirection == 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x - reduce_straight, this.point[this[pu].nobulbthermo[i][j]].y);
                                } else if (xdirection > 0 && ydirection > 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x - reduce_diagonal, this.point[this[pu].nobulbthermo[i][j]].y - reduce_diagonal);
                                } else if (xdirection == 0 && ydirection > 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x, this.point[this[pu].nobulbthermo[i][j]].y - reduce_straight);
                                } else if (xdirection > 0 && ydirection < 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x - reduce_diagonal, this.point[this[pu].nobulbthermo[i][j]].y + reduce_diagonal);
                                } else if (xdirection < 0 && ydirection == 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x + reduce_straight, this.point[this[pu].nobulbthermo[i][j]].y);
                                } else if (xdirection < 0 && ydirection < 0) {
                                    this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x + reduce_diagonal, this.point[this[pu].nobulbthermo[i][j]].y + reduce_diagonal);
                                }
                            } else {
                                this.ctx.lineTo(this.point[this[pu].nobulbthermo[i][j]].x, this.point[this[pu].nobulbthermo[i][j]].y);
                            }
                        }
                    }
                    this.ctx.stroke();
                }
            }
        }
    }

    find_common(pu, i, endpoint, symboltype) {
        if (symboltype === "thermo" || symboltype === "nobulbthermo") {
            if (this[pu].thermo) {
                for (var k = 0; k < this[pu].thermo.length; k++) {
                    if (k != i) {
                        if (this[pu].thermo[k]) {
                            for (var m = 1; m < this[pu].thermo[k].length; m++) {
                                if (this[pu].thermo[k][m] === endpoint) {
                                    return 1;
                                }
                            }
                        }
                    }
                }
            }
            if (this[pu].nobulbthermo) {
                for (var k = 0; k < this[pu].nobulbthermo.length; k++) {
                    if (k != i) {
                        if (this[pu].nobulbthermo[k]) {
                            for (var m = 1; m < this[pu].nobulbthermo[k].length; m++) {
                                if (this[pu].nobulbthermo[k][m] === endpoint) {
                                    return 1;
                                }
                            }
                        }
                    }
                }
            }
        } else if (symboltype === "arrows" || symboltype === "direction") {
            if (this[pu].arrows) {
                for (var k = 0; k < this[pu].arrows.length; k++) {
                    if (k != i) {
                        if (this[pu].arrows[k]) {
                            for (var m = 1; m < this[pu].arrows[k].length; m++) {
                                if (this[pu].arrows[k][m] === endpoint) {
                                    return 1;
                                }
                            }
                        }
                    }
                }
            }
            if (this[pu].direction) {
                for (var k = 0; k < this[pu].direction.length; k++) {
                    if (k != i) {
                        if (this[pu].direction[k]) {
                            for (var m = 1; m < this[pu].direction[k].length; m++) {
                                if (this[pu].direction[k][m] === endpoint) {
                                    return 1;
                                }
                            }
                        }
                    }
                }
            }
        }
        return 0;
    }

    draw_arrowsp(pu) {
        if (this[pu].arrows) {
            let commonend;
            for (var i = 0; i < this[pu].arrows.length; i++) {
                if (this[pu].arrows[i] && this[pu].arrows[i][0]) {
                    this.ctx.setLineDash([]);
                    this.ctx.lineCap = "square";
                    if (UserSettings.custom_colors_on && this[pu + "_col"].arrows[i]) {
                        this.ctx.strokeStyle = this[pu + "_col"].arrows[i];
                    } else {
                        this.ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                    }
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.point[this[pu].arrows[i][0]].x, this.point[this[pu].arrows[i][0]].y);
                    for (var j = 1; j < this[pu].arrows[i].length - 1; j++) {
                        this.ctx.lineTo(this.point[this[pu].arrows[i][j]].x, this.point[this[pu].arrows[i][j]].y);
                    }
                    this.ctx.stroke();

                    j = this[pu].arrows[i].length - 1;
                    if (j) {
                        this.ctx.lineJoin = "bevel";
                        this.ctx.beginPath();
                        commonend = this.find_common(pu, i, this[pu].arrows[i][j], "arrows");
                        if (commonend) {
                            this.ctx.arrow(this.point[this[pu].arrows[i][j - 1]].x,
                                this.point[this[pu].arrows[i][j - 1]].y,
                                this.point[this[pu].arrows[i][j]].x - (this.point[this[pu].arrows[i][j]].x - this.point[this[pu].arrows[i][j - 1]].x) * 0.1,
                                this.point[this[pu].arrows[i][j]].y - (this.point[this[pu].arrows[i][j]].y - this.point[this[pu].arrows[i][j - 1]].y) * 0.1,
                                [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                        } else {
                            this.ctx.arrow(this.point[this[pu].arrows[i][j - 1]].x,
                                this.point[this[pu].arrows[i][j - 1]].y,
                                this.point[this[pu].arrows[i][j]].x + (this.point[this[pu].arrows[i][j]].x - this.point[this[pu].arrows[i][j - 1]].x) * 0.2,
                                this.point[this[pu].arrows[i][j]].y + (this.point[this[pu].arrows[i][j]].y - this.point[this[pu].arrows[i][j - 1]].y) * 0.2,
                                [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                        }
                        this.ctx.stroke();
                        this.ctx.setLineDash([]);
                        this.ctx.lineJoin = "miter";
                        if (UserSettings.custom_colors_on && this[pu + "_col"].arrows[i]) {
                            this.ctx.strokeStyle = this[pu + "_col"].arrows[i];
                        } else {
                            this.ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                        }
                        this.ctx.fillStyle = Color.WHITE;
                        this.ctx.lineWidth = 3;

                        this.draw_circle(this.ctx, this.point[this[pu].arrows[i][0]].x, this.point[this[pu].arrows[i][0]].y, 0.4);
                    }
                }
            }
        }
    }

    draw_direction(pu) {
        if (this[pu].direction) {
            let xdirection, ydirection, commonend, shape, arrowsum_present; // x is column, y is row
            let reduce_straight = 0.1 * this.size,
                reduce_diagonal = 0.1 * this.size,
                reduce_straight2 = -1 * 0.4 * this.size,
                reduce_diagonal2 = -1 * 0.3 * this.size;
            for (var i = 0; i < this[pu].direction.length; i++) {
                if (this[pu].direction[i][0]) {
                    this.ctx.setLineDash([]);
                    this.ctx.lineCap = "square";
                    if (UserSettings.custom_colors_on && this[pu + "_col"].direction[i]) {
                        this.ctx.strokeStyle = this[pu + "_col"].direction[i];
                    } else {
                        this.ctx.strokeStyle = Color.GREY_DARK_LIGHT;
                    }
                    this.ctx.lineWidth = 3;
                    this.ctx.beginPath();

                    // Check if there is double or triple arrow sum
                    arrowsum_present = false;
                    if (this[pu].symbol) {
                        for (shape in this[pu].symbol) {
                            if (this[pu].symbol[shape][1] === "sudokumore") {
                                switch (this[pu].symbol[shape][0]) {
                                    case 1:
                                        // 2 cell sum row
                                        if ((this[pu].direction[i][0] == parseInt(shape)) || ((this[pu].direction[i][0] - 1) == parseInt(shape))) {
                                            arrowsum_present = true;
                                        }
                                        break;
                                    case 2:
                                        // 2 cell sum column
                                        if ((this[pu].direction[i][0] == parseInt(shape)) || ((this[pu].direction[i][0] - this.nx0) == parseInt(shape))) {
                                            arrowsum_present = true;
                                        }
                                        break;
                                    case 3:
                                        // 3 cell sum row
                                        if ((this[pu].direction[i][0] == parseInt(shape)) || ((this[pu].direction[i][0] - 1) == parseInt(shape)) || ((this[pu].direction[i][0] - 2) == parseInt(shape))) {
                                            arrowsum_present = true;
                                        }
                                        break;
                                    case 4:
                                        // 3 cell sum column
                                        if ((this[pu].direction[i][0] == parseInt(shape)) || ((this[pu].direction[i][0] - this.nx0) == parseInt(shape)) || ((this[pu].direction[i][0] - (2 * this.nx0)) == parseInt(shape))) {
                                            arrowsum_present = true;
                                        }
                                        break;
                                    case 5:
                                        // 1 cell sum
                                        if (this[pu].direction[i][0] == parseInt(shape)) {
                                            arrowsum_present = true;
                                        }
                                        break;
                                }
                            }
                            if (arrowsum_present) {
                                break;
                            }
                        }
                    }
                    if (arrowsum_present) {
                        if (this.point[this[pu].direction[i][1]]) {
                            xdirection = this.point[this[pu].direction[i][1]].x - this.point[this[pu].direction[i][0]].x;
                            ydirection = this.point[this[pu].direction[i][1]].y - this.point[this[pu].direction[i][0]].y;
                            if (xdirection == 0 && ydirection < 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x, this.point[this[pu].direction[i][0]].y + reduce_straight2);
                            } else if (xdirection < 0 && ydirection > 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x + reduce_diagonal2, this.point[this[pu].direction[i][0]].y - reduce_diagonal2);
                            } else if (xdirection > 0 && ydirection == 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x - reduce_straight2, this.point[this[pu].direction[i][0]].y);
                            } else if (xdirection > 0 && ydirection > 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x - reduce_diagonal2, this.point[this[pu].direction[i][0]].y - reduce_diagonal2);
                            } else if (xdirection == 0 && ydirection > 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x, this.point[this[pu].direction[i][0]].y - reduce_straight2);
                            } else if (xdirection > 0 && ydirection < 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x - reduce_diagonal2, this.point[this[pu].direction[i][0]].y + reduce_diagonal2);
                            } else if (xdirection < 0 && ydirection == 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x + reduce_straight2, this.point[this[pu].direction[i][0]].y);
                            } else if (xdirection < 0 && ydirection < 0) {
                                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x + reduce_diagonal2, this.point[this[pu].direction[i][0]].y + reduce_diagonal2);
                            }
                        }
                    } else {
                        this.ctx.moveTo(this.point[this[pu].direction[i][0]].x, this.point[this[pu].direction[i][0]].y);
                    }

                    for (var j = 1; j < this[pu].direction[i].length - 1; j++) {
                        this.ctx.lineTo(this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y);
                    }
                    this.ctx.stroke();

                    j = this[pu].direction[i].length - 1;
                    if (j) {
                        this.ctx.lineJoin = "bevel";
                        this.ctx.beginPath();
                        commonend = this.find_common(pu, i, this[pu].direction[i][j], "direction");
                        if (commonend) {
                            xdirection = this.point[this[pu].direction[i][j]].x - this.point[this[pu].direction[i][j - 1]].x;
                            ydirection = this.point[this[pu].direction[i][j]].y - this.point[this[pu].direction[i][j - 1]].y;
                            if (xdirection == 0 && ydirection < 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y + reduce_straight,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection < 0 && ydirection > 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x + reduce_diagonal, this.point[this[pu].direction[i][j]].y - reduce_diagonal,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection > 0 && ydirection == 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x - reduce_straight, this.point[this[pu].direction[i][j]].y,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection > 0 && ydirection > 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x - reduce_diagonal, this.point[this[pu].direction[i][j]].y - reduce_diagonal,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection == 0 && ydirection > 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y - reduce_straight,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection > 0 && ydirection < 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x - reduce_diagonal, this.point[this[pu].direction[i][j]].y + reduce_diagonal,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection < 0 && ydirection == 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x + reduce_straight, this.point[this[pu].direction[i][j]].y,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            } else if (xdirection < 0 && ydirection < 0) {
                                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                    this.point[this[pu].direction[i][j]].x + reduce_diagonal, this.point[this[pu].direction[i][j]].y + reduce_diagonal,
                                    [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                            }
                        } else {
                            this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                                this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y,
                                [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                        }
                        this.ctx.stroke();
                        this.ctx.lineJoin = "miter";
                    }
                }
            }
        }
    }

    draw_line(pu) {
        for (var i in this[pu].line) {
            if (this[pu].line[i] === 98) {
                var r = 0.2;
                var x = this.point[i].x;
                var y = this.point[i].y;
                set_line_style(this.ctx, 98);
                if (UserSettings.custom_colors_on && this[pu + "_col"].line[i]) {
                    this.ctx.strokeStyle = this[pu + "_col"].line[i];
                }
                this.ctx.beginPath();
                this.ctx.moveTo(x + r * Math.cos(45 * (Math.PI / 180)) * this.size, y + r * Math.sin(45 * (Math.PI / 180)) * this.size);
                this.ctx.lineTo(x + r * Math.cos(225 * (Math.PI / 180)) * this.size, y + r * Math.sin(225 * (Math.PI / 180)) * this.size);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x + r * Math.cos(135 * (Math.PI / 180)) * this.size, y + r * Math.sin(135 * (Math.PI / 180)) * this.size);
                this.ctx.lineTo(x + r * Math.cos(315 * (Math.PI / 180)) * this.size, y + r * Math.sin(315 * (Math.PI / 180)) * this.size);
                this.ctx.stroke();
            } else {
                set_line_style(this.ctx, this[pu].line[i]);
                if (UserSettings.custom_colors_on && this[pu + "_col"].line[i]) {
                    this.ctx.strokeStyle = this[pu + "_col"].line[i];
                }
                var i1 = i.split(",")[0];
                var i2 = i.split(",")[1];
                this.ctx.beginPath();
                if (this[pu].line[i] === 40) {
                    var r = 0.8;
                    var x1 = r * this.point[i1].x + (1 - r) * this.point[i2].x;
                    var y1 = r * this.point[i1].y + (1 - r) * this.point[i2].y;
                    var x2 = (1 - r) * this.point[i1].x + r * this.point[i2].x;
                    var y2 = (1 - r) * this.point[i1].y + r * this.point[i2].y;
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                } else if (this[pu].line[i] === 30) {
                    var r = 0.15 * this.size;
                    var dx = this.point[i1].x - this.point[i2].x;
                    var dy = this.point[i1].y - this.point[i2].y;
                    var d = Math.sqrt(dx ** 2 + dy ** 2);
                    this.ctx.moveTo(this.point[i1].x - r / d * dy, this.point[i1].y + r / d * dx);
                    this.ctx.lineTo(this.point[i2].x - r / d * dy, this.point[i2].y + r / d * dx);
                    this.ctx.stroke();
                    this.ctx.moveTo(this.point[i1].x + r / d * dy, this.point[i1].y - r / d * dx);
                    this.ctx.lineTo(this.point[i2].x + r / d * dy, this.point[i2].y - r / d * dx);
                } else {
                    if (this.point[i1].type === 2 || this.point[i1].type === 3) { //for centerline
                        this.ctx.moveTo(this.point[i2].x, this.point[i2].y);
                        this.ctx.lineTo((this.point[i1].x + this.point[i2].x) * 0.5, (this.point[i1].y + this.point[i2].y) * 0.5);
                        this.ctx.stroke();
                        this.ctx.lineCap = "butt";
                    } else if (this.point[i2].type === 2 || this.point[i2].type === 3) {
                        this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                        this.ctx.lineTo((this.point[i1].x + this.point[i2].x) * 0.5, (this.point[i1].y + this.point[i2].y) * 0.5);
                        this.ctx.stroke();
                        this.ctx.lineCap = "butt";
                    }
                    this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                    this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
                }
                this.ctx.stroke();
            }
        }
        for (var i in this[pu].lineE) {
            if (this[pu].lineE[i] === 98) {
                var r = 0.2;
                var x = this.point[i].x;
                var y = this.point[i].y;
                set_line_style(this.ctx, 98);
                if (UserSettings.custom_colors_on && this[pu + "_col"].lineE[i]) {
                    this.ctx.strokeStyle = this[pu + "_col"].lineE[i];
                }
                this.ctx.beginPath();
                this.ctx.moveTo(x + r * Math.cos(45 * (Math.PI / 180)) * this.size, y + r * Math.sin(45 * (Math.PI / 180)) * this.size);
                this.ctx.lineTo(x + r * Math.cos(225 * (Math.PI / 180)) * this.size, y + r * Math.sin(225 * (Math.PI / 180)) * this.size);
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.moveTo(x + r * Math.cos(135 * (Math.PI / 180)) * this.size, y + r * Math.sin(135 * (Math.PI / 180)) * this.size);
                this.ctx.lineTo(x + r * Math.cos(315 * (Math.PI / 180)) * this.size, y + r * Math.sin(315 * (Math.PI / 180)) * this.size);
                this.ctx.stroke();
            } else {
                set_line_style(this.ctx, this[pu].lineE[i]);
                if (UserSettings.custom_colors_on && this[pu + "_col"].lineE[i]) {
                    this.ctx.strokeStyle = this[pu + "_col"].lineE[i];
                }
                var i1 = i.split(",")[0];
                var i2 = i.split(",")[1];
                this.ctx.beginPath();
                if (this[pu].lineE[i] === 30) {
                    var r = 0.15 * this.size;
                    var dx = this.point[i1].x - this.point[i2].x;
                    var dy = this.point[i1].y - this.point[i2].y;
                    var d = Math.sqrt(dx ** 2 + dy ** 2);
                    this.ctx.moveTo(this.point[i1].x - r / d * dy, this.point[i1].y + r / d * dx);
                    this.ctx.lineTo(this.point[i2].x - r / d * dy, this.point[i2].y + r / d * dx);
                    this.ctx.stroke();
                    this.ctx.moveTo(this.point[i1].x + r / d * dy, this.point[i1].y - r / d * dx);
                    this.ctx.lineTo(this.point[i2].x + r / d * dy, this.point[i2].y - r / d * dx);
                } else {
                    this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                    this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
                }
                this.ctx.stroke();
            }
        }
    }

    draw_freeline(pu) {
        /*freeline*/
        for (var i in this[pu].freeline) {
            set_line_style(this.ctx, this[pu].freeline[i]);
            if (UserSettings.custom_colors_on && this[pu + "_col"].freeline[i]) {
                this.ctx.strokeStyle = this[pu + "_col"].freeline[i];
            }
            var i1 = i.split(",")[0];
            var i2 = i.split(",")[1];
            this.ctx.beginPath();
            if (this[pu].freeline[i] === 30) {
                var r = 0.15 * this.size;
                var dx = this.point[i1].x - this.point[i2].x;
                var dy = this.point[i1].y - this.point[i2].y;
                var d = Math.sqrt(dx ** 2 + dy ** 2);
                this.ctx.moveTo(this.point[i1].x - r / d * dy, this.point[i1].y + r / d * dx);
                this.ctx.lineTo(this.point[i2].x - r / d * dy, this.point[i2].y + r / d * dx);
                this.ctx.stroke();
                this.ctx.moveTo(this.point[i1].x + r / d * dy, this.point[i1].y - r / d * dx);
                this.ctx.lineTo(this.point[i2].x + r / d * dy, this.point[i2].y - r / d * dx);
            } else {
                this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
            }
            this.ctx.stroke();
        }
        for (var i in this[pu].freelineE) {
            set_line_style(this.ctx, this[pu].freelineE[i]);
            if (UserSettings.custom_colors_on && this[pu + "_col"].freelineE[i]) {
                this.ctx.strokeStyle = this[pu + "_col"].freelineE[i];
            }
            var i1 = i.split(",")[0];
            var i2 = i.split(",")[1];
            this.ctx.beginPath();
            if (this[pu].freelineE[i] === 30) {
                var r = 0.15 * this.size;
                var dx = this.point[i1].x - this.point[i2].x;
                var dy = this.point[i1].y - this.point[i2].y;
                var d = Math.sqrt(dx ** 2 + dy ** 2);
                this.ctx.moveTo(this.point[i1].x - r / d * dy, this.point[i1].y + r / d * dx);
                this.ctx.lineTo(this.point[i2].x - r / d * dy, this.point[i2].y + r / d * dx);
                this.ctx.stroke();
                this.ctx.moveTo(this.point[i1].x + r / d * dy, this.point[i1].y - r / d * dx);
                this.ctx.lineTo(this.point[i2].x + r / d * dy, this.point[i2].y - r / d * dx);
            } else {
                this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
                this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
            }
            this.ctx.stroke();
        }
    }

    draw_wall(pu) {
        for (var i in this[pu].wall) {
            set_line_style(this.ctx, this[pu].wall[i]);
            if (UserSettings.custom_colors_on && this[pu + "_col"].wall[i]) {
                this.ctx.strokeStyle = this[pu + "_col"].wall[i];
            }
            this.ctx.lineCap = "butt";
            var i1 = i.split(",")[0];
            var i2 = i.split(",")[1];
            this.ctx.beginPath();
            this.ctx.moveTo(this.point[i1].x, this.point[i1].y);
            this.ctx.lineTo(this.point[i2].x, this.point[i2].y);
            this.ctx.stroke();
        }
    }

    draw_cage(pu) {
        var r = 0.16; //space between grid
        var a = [0, 1, 2, 3],
            c;
        if (this.theta === 90) { a = [2, 0, 3, 1]; } else if (this.theta === 180) { a = [3, 2, 1, 0]; } else if (this.theta === 270) { a = [1, 3, 0, 2]; }
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
            a[0] = a[2];
            a[2] = c;
            c = a[1];
            a[1] = a[3];
            a[3] = c;
        }
        for (var i in this[pu].cage) {
            var i1 = i.split(",")[0];
            var i2 = i.split(",")[1];
            var x1, y1, x2, y2;

            if (i1 % 4 === a[0]) {
                x1 = this.point[i1].x - r * this.size;
                y1 = this.point[i1].y - r * this.size;
            } else if (i1 % 4 === a[1]) {
                x1 = this.point[i1].x + r * this.size;
                y1 = this.point[i1].y - r * this.size;
            } else if (i1 % 4 === a[2]) {
                x1 = this.point[i1].x - r * this.size;
                y1 = this.point[i1].y + r * this.size;
            } else if (i1 % 4 === a[3]) {
                x1 = this.point[i1].x + r * this.size;
                y1 = this.point[i1].y + r * this.size;
            }
            if (i2 % 4 === a[0]) {
                x2 = this.point[i2].x - r * this.size;
                y2 = this.point[i2].y - r * this.size;
            } else if (i2 % 4 === a[1]) {
                x2 = this.point[i2].x + r * this.size;
                y2 = this.point[i2].y - r * this.size;
            } else if (i2 % 4 === a[2]) {
                x2 = this.point[i2].x - r * this.size;
                y2 = this.point[i2].y + r * this.size;
            } else if (i2 % 4 === a[3]) {
                x2 = this.point[i2].x + r * this.size;
                y2 = this.point[i2].y + r * this.size;
            }
            if (i1 % 4 === 3 || i2 % 4 === 0) {
                set_line_style(this.ctx, this[pu].cage[i] + 100);
            } else {
                set_line_style(this.ctx, this[pu].cage[i]);
            }
            if (UserSettings.custom_colors_on && this[pu + "_col"].cage[i]) {
                this.ctx.strokeStyle = this[pu + "_col"].cage[i];
            }
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }
    }

    draw_symbol(pu, layer) {
        /*symbol_layer*/
        var p_x, p_y;
        for (var i in this[pu].symbol) {
            if (i.slice(-1) === "E") { // Overwriting in Edge Mode
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            if (this[pu].symbol[i][2] === layer) {
                this.draw_symbol_select(this.ctx, p_x, p_y, this[pu].symbol[i][0], this[pu].symbol[i][1], i, pu);
            }
        }
    }

    draw_number(pu) {
        /*number*/
        var p_x, p_y, factor;
        var str_alph_low = "abcdefghijklmnopqrstuvwxyz";
        for (var i in this[pu].number) {
            if (i.slice(-1) === "E") { // Overwriting in Edge Mode
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            // if its lower case
            if (str_alph_low.indexOf(this[pu].number[i][0]) === -1) {
                factor = 1;
            } else {
                factor = 0;
            }
            switch (this[pu].number[i][2]) {
                case "1": //normal
                    set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);

                    // if some numbers present in the corner (like Killer sudoku etc) then displace the numbers slightly lower to avoid overlap
                    let offset = (UserSettings.sudoku_normal_size === 2) ? 0.16 : 0.06;
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + offset * factor * this.size, this.size * 0.8);

                    break;
                case "2": //arrow
                    var arrowlength = 0.7;
                    set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                    var direction = {
                        "_0": 90,
                        "_1": 180,
                        "_2": 0,
                        "_3": 270,
                        "_4": 135,
                        "_5": 45,
                        "_6": 225,
                        "_7": 315,
                    }
                    var direction = (direction[this[pu].number[i][0].slice(-2)] - this.theta + 360) % 360;
                    if (this.reflect[0] === -1) { direction = (180 - direction + 360) % 360; }
                    if (this.reflect[1] === -1) { direction = (360 - direction + 360) % 360; }
                    switch (direction) {

                        case 180:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.0 * this.size, p_y + 0.15 * this.size, this.size * 0.8);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.5 + 0.0) * this.size, p_y + (arrowlength * 0.0 - 0.3) * this.size,
                                p_x + (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 0:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.0 * this.size, p_y + 0.15 * this.size, this.size * 0.8);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x - (arrowlength * 0.5 + 0.0) * this.size, p_y + (arrowlength * 0.0 - 0.3) * this.size,
                                p_x - (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 90:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 270:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 45:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 225:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 135:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 315:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        default:
                            set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);;
                            this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.06 * this.size, this.size * 0.8);
                            break;
                    }
                    break;
                case "4": //tapa
                    let values = [...this[pu].number[i][0]]; // This is to handle unicode symbols.
                    let quad = (this.point[i].type === 1) && [5, 6, 7, 11].includes(this[pu].number[i][1]) && this.version_ge(3, 1, 2);
                    if (quad) {
                        set_font_style(this.ctx, 0.31 * this.size.toString(10), this[pu].number[i][1]);
                        if (values.length === 1) {
                            this.ctx.text(values[0], p_x, p_y + 0.00 * this.size, this.size * 0.6);
                        } else if (values.length === 2) {
                            this.ctx.text(values[0], p_x - 0.10 * this.size, p_y - 0.00 * this.size, this.size * 0.6);
                            this.ctx.text(values[1], p_x + 0.10 * this.size, p_y + 0.00 * this.size, this.size * 0.6);
                        } else if (values.length === 3) {
                            this.ctx.text(values[0], p_x - 0.10 * this.size, p_y - 0.10 * this.size, this.size * 0.6);
                            this.ctx.text(values[1], p_x + 0.10 * this.size, p_y - 0.10 * this.size, this.size * 0.6);
                            this.ctx.text(values[2], p_x - 0.00 * this.size, p_y + 0.15 * this.size, this.size * 0.6);
                        } else if (values.length === 4) {
                            this.ctx.text(values[0], p_x - 0.10 * this.size, p_y - 0.10 * this.size, this.size * 0.6);
                            this.ctx.text(values[1], p_x + 0.10 * this.size, p_y - 0.10 * this.size, this.size * 0.6);
                            this.ctx.text(values[2], p_x - 0.10 * this.size, p_y + 0.15 * this.size, this.size * 0.6);
                            this.ctx.text(values[3], p_x + 0.10 * this.size, p_y + 0.15 * this.size, this.size * 0.6);
                        }
                    }
                    else {
                        if (values.length === 1) {
                            set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                            this.ctx.text(values[0], p_x, p_y + 0.06 * this.size, this.size * 0.8);
                        } else if (values.length === 2) {
                            set_font_style(this.ctx, 0.48 * this.size.toString(10), this[pu].number[i][1]);
                            this.ctx.text(values[0], p_x - 0.16 * this.size, p_y - 0.15 * this.size, this.size * 0.8);
                            this.ctx.text(values[1], p_x + 0.18 * this.size, p_y + 0.19 * this.size, this.size * 0.8);
                        } else if (values.length === 3) {
                            set_font_style(this.ctx, 0.45 * this.size.toString(10), this[pu].number[i][1]);
                            this.ctx.text(values[0], p_x - 0.22 * this.size, p_y - 0.14 * this.size, this.size * 0.8);
                            this.ctx.text(values[1], p_x + 0.24 * this.size, p_y - 0.05 * this.size, this.size * 0.8);
                            this.ctx.text(values[2], p_x - 0.0 * this.size, p_y + 0.3 * this.size, this.size * 0.8);
                        } else if (values.length === 4) {
                            set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                            this.ctx.text(values[0], p_x - 0.0 * this.size, p_y - 0.22 * this.size, this.size * 0.8);
                            this.ctx.text(values[1], p_x - 0.26 * this.size, p_y + 0.04 * this.size, this.size * 0.8);
                            this.ctx.text(values[2], p_x + 0.26 * this.size, p_y + 0.04 * this.size, this.size * 0.8);
                            this.ctx.text(values[3], p_x - 0.0 * this.size, p_y + 0.3 * this.size, this.size * 0.8);
                        }
                    }
                    break;
                case "5": //small
                    set_font_style(this.ctx, 0.25 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.02 * factor * this.size, this.size * 0.9);
                    break;
                case "6": //medium
                    set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.03 * factor * this.size, this.size * 0.9);
                    break;
                case "10": //big
                    set_font_style(this.ctx, 0.6 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.03 * factor * this.size, this.size * 0.8);
                    break;
                case "7": //sudoku
                    var sum = 0,
                        pos = 0;
                    for (var j = 0; j < 9; j++) {
                        if (this[pu].number[i][0][j] === 1) {
                            sum += 1;
                            pos = j;
                        }
                    }
                    if (sum === 1) {
                        set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text((pos + 1).toString(), p_x, p_y + 0.06 * this.size, this.size * 0.8);
                    } else {
                        set_font_style(this.ctx, 0.3 * this.size.toString(10), this[pu].number[i][1]);
                        for (var j = 0; j < 9; j++) {
                            if (this[pu].number[i][0][j] === 1) {
                                this.ctx.text((j + 1).toString(), p_x + ((j % 3 - 1) * 0.28) * this.size, p_y + (((j / 3 | 0) - 1) * 0.28 + 0.02) * this.size);
                            }
                        }
                    }
                    break;
                case "8": //long
                    if (this[pu].number[i][1] === 5) {
                        set_font_style(this.ctx, 0.5 * this.size.toString(10), this[pu].number[i][1]);
                        set_circle_style(this.ctx, 7);
                        this.ctx.fillRect(p_x - 0.2 * this.size, p_y - 0.25 * this.size, this.ctx.measureText(this[pu].number[i][0]).width, 0.5 * this.size);
                    }
                    set_font_style(this.ctx, 0.5 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.textAlign = "left";
                    this.ctx.text(this[pu].number[i][0], p_x - 0.2 * this.size, p_y);
                    break;
            }
        }

        for (var i in this[pu].numberS) {
            if (this[pu].numberS[i][1] === 5) {
                set_circle_style(this.ctx, 7);
                this.draw_polygon(this.ctx, this.point[i].x, this.point[i].y, 0.27, 4, 45);
            } else if (this[pu].numberS[i][1] === 6) {
                set_circle_style(this.ctx, 1);
                this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, 0.18);
            } else if (this[pu].numberS[i][1] === 7) {
                set_circle_style(this.ctx, 2);
                this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, 0.18);
            } else if (this[pu].numberS[i][1] === 11) {
                set_circle_style(this.ctx, 11);
                this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, 0.18);
            }
            if (true) { //(this[pu].numberS[i][0].length <= 2 ){
                if (this.point[i]) {
                    set_font_style(this.ctx, 0.32 * this.size.toString(10), this[pu].numberS[i][1]);
                    this.ctx.textAlign = "center";
                    this.ctx.text(this[pu].numberS[i][0], this.point[i].x, this.point[i].y + 0.03 * this.size, this.size * 0.48);
                }
                //}else{
                //  set_font_style(this.ctx,0.28*this.size.toString(10),this[pu].numberS[i][1]);
                //  this.ctx.textAlign = "left";
                //  this.ctx.text(this[pu].numberS[i][0],this.point[i].x-0.15*this.size,this.point[i].y+0.03*this.size,this.size*0.8);
            }
        }
    }

    draw_number_circle(pu) {
        var p_x, p_y;
        for (var i in this[pu].number) {
            if (i.slice(-1) === "E") { // Overwriting in Edge Mode
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            switch (this[pu].number[i][2]) {
                case "1": //normal
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
                    break;
                case "2": //arrow
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
                    break;
                case "4": //tapa
                    let quad = (this.point[i].type === 1) && [5, 6, 7, 11].includes(this[pu].number[i][1]) && this.version_ge(3, 1, 2);
                    this.draw_numbercircle(pu, i, p_x, p_y, quad ? 0.31 : 0.44);
                    break;
                case "5": //small
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.17);
                    break;
                case "6": //medium
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.25);
                    break;
                case "10": //big
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.36);
                    break;
                case "7": //sudoku
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
                    break;
            }
        }
    }

    draw_numbercircle(pu, i, p_x, p_y, size) {
        if (this[pu].number[i][1] === 5) {
            set_circle_style(this.ctx, 7);
            this.draw_circle(this.ctx, p_x, p_y, size);
        } else if (this[pu].number[i][1] === 6) {
            set_circle_style(this.ctx, 1);
            this.draw_circle(this.ctx, p_x, p_y, size);
        } else if (this[pu].number[i][1] === 7) {
            set_circle_style(this.ctx, 2);
            this.draw_circle(this.ctx, p_x, p_y, size);
        } else if (this[pu].number[i][1] === 11) {
            set_circle_style(this.ctx, 11);
            this.draw_circle(this.ctx, p_x, p_y, size);
        }
    }

    draw_symbol_select(ctx, x, y, num, sym, i = 'panel', qamode) {
        let ccolor = undefined;
        if (i !== 'panel' && UserSettings.custom_colors_on && this[qamode + "_col"].symbol[i]) {
            ccolor = this[qamode + "_col"].symbol[i];
        }
        this.draw_symbol_select_ccolor(ctx, x, y, num, sym, i, ccolor);
    }

    draw_symbol_select_ccolor(ctx, x, y, num, sym, i, ccolor) {
        switch (sym) {
            /* figure */
            case "circle_L":
                if (num === 0) {
                    set_circle_style(ctx, 1);
                    this.draw_circle(ctx, x, y, 0.43);
                    this.draw_circle(ctx, x, y, 0.32);
                } else {
                    set_circle_style(ctx, num, ccolor);
                    this.draw_circle(ctx, x, y, 0.43);
                }
                break;
            case "circle_M":
                if (num === 0) {
                    set_circle_style(ctx, 1);
                    this.draw_circle(ctx, x, y, 0.35);
                    this.draw_circle(ctx, x, y, 0.25);
                } else {
                    set_circle_style(ctx, num, ccolor);
                    this.draw_circle(ctx, x, y, 0.35);
                }
                break;
            case "circle_S":
                if (num === 0) {
                    set_circle_style(ctx, 1);
                    this.draw_circle(ctx, x, y, 0.22);
                    this.draw_circle(ctx, x, y, 0.14);
                } else {
                    set_circle_style(ctx, num, ccolor);
                    this.draw_circle(ctx, x, y, 0.22);
                }
                break;
            case "circle_SS":
                if (num === 0) {
                    set_circle_style(ctx, 1);
                    this.draw_circle(ctx, x, y, 0.13);
                    this.draw_circle(ctx, x, y, 0.07);
                } else {
                    set_circle_style(ctx, num, ccolor);
                    this.draw_circle(ctx, x, y, 0.13);
                }
                break;
            case "square_LL":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, 45);
                break;
            case "square_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.4 * Math.sqrt(2), 4, 45);
                break;
            case "square_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.35 * Math.sqrt(2), 4, 45);
                break;
            case "square_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.22 * Math.sqrt(2), 4, 45);
                break;
            case "square_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.13 * Math.sqrt(2), 4, 45);
                break;
            case "triup_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y + 0.5 * 0.25 * this.size, 0.5, 3, 90);
                break;
            case "triup_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y + 0.4 * 0.25 * this.size, 0.4, 3, 90);
                break;
            case "triup_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y + 0.25 * 0.25 * this.size, 0.25, 3, 90);
                break;
            case "triup_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y + 0.16 * 0.25 * this.size, 0.16, 3, 90);
                break;
            case "tridown_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y - 0.5 * 0.25 * this.size, 0.5, 3, -90);
                break;
            case "tridown_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y - 0.4 * 0.25 * this.size, 0.4, 3, -90);
                break;
            case "tridown_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y - 0.25 * 0.25 * this.size, 0.25, 3, -90);
                break;
            case "tridown_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y - 0.16 * 0.25 * this.size, 0.16, 3, -90);
                break;
            case "triright_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x - 0.5 * 0.25 * this.size, y, 0.5, 3, 180);
                break;
            case "triright_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x - 0.4 * 0.25 * this.size, y, 0.4, 3, 180);
                break;
            case "triright_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x - 0.25 * 0.25 * this.size, y, 0.25, 3, 180);
                break;
            case "triright_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x - 0.16 * 0.25 * this.size, y, 0.16, 3, 180);
                break;
            case "trileft_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x + 0.5 * 0.25 * this.size, y, 0.5, 3, 0);
                break;
            case "trileft_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x + 0.4 * 0.25 * this.size, y, 0.4, 3, 0);
                break;
            case "trileft_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x + 0.25 * 0.25 * this.size, y, 0.25, 3, 0);
                break;
            case "trileft_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x + 0.16 * 0.25 * this.size, y, 0.16, 3, 0);
                break;
            case "diamond_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.43, 4, 0);
                break;
            case "diamond_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.35, 4, 0);
                break;
            case "diamond_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.22, 4, 0);
                break;
            case "diamond_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.13, 4, 0);
                break;
            case "hexpoint_LL":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.48, 6, 30);
                break;
            case "hexpoint_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.4, 6, 30);
                break;
            case "hexpoint_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.3, 6, 30);
                break;
            case "hexpoint_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.2, 6, 30);
                break;
            case "hexpoint_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.13, 6, 30);
                break;
            case "hexflat_LL":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.48, 6, 0);
                break;
            case "hexflat_L":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.4, 6, 0);
                break;
            case "hexflat_M":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.3, 6, 0);
                break;
            case "hexflat_S":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.2, 6, 0);
                break;
            case "hexflat_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y, 0.13, 6, 0);
                break;
            case "ox_B":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTWHITE;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 2;
                this.draw_ox(ctx, num, x, y);
                break;
            case "ox_E":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTWHITE;
                ctx.strokeStyle = Color.GREEN;
                ctx.lineWidth = 2;
                this.draw_ox(ctx, num, x, y);
                break;
            case "ox_G":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTWHITE;
                ctx.strokeStyle = Color.GREY;
                ctx.lineWidth = 2;
                this.draw_ox(ctx, num, x, y);
                break;
            case "tri":
                this.draw_tri(ctx, num, x, y, ccolor);
                break;
            case "cross":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 3;
                this.draw_cross(ctx, num, x, y);
                break;
            case "line":
                this.draw_linesym(ctx, num, x, y, ccolor);
                break;
            case "frameline":
                this.draw_framelinesym(ctx, num, x, y, ccolor);
                break;
            case "bars_B":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = ccolor || Color.BLACK;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_bars(ctx, num, x, y);
                break;
            case "bars_G":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = ccolor || Color.GREY_LIGHT;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_bars(ctx, num, x, y);
                break;
            case "bars_W":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_bars(ctx, num, x, y);
                break;
                //number
            case "inequality":
                set_circle_style(ctx, 10, ccolor);
                this.draw_inequality(ctx, num, x, y);
                break;
            case "math":
                set_font_style(ctx, 0.8 * pu.size.toString(10), 1, ccolor);
                this.draw_math(ctx, num, x, y + 0.05 * pu.size);
                break;
            case "math_G":
                set_font_style(ctx, 0.8 * pu.size.toString(10), 2);
                this.draw_math(ctx, num, x, y + 0.05 * pu.size);
                break;
            case "degital":
                set_circle_style(ctx, 2, ccolor);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_E":
                set_circle_style(ctx, 12);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_G":
                set_circle_style(ctx, 3);
                this.draw_degital(ctx, num, x, y);
                break;
            case "degital_f":
                this.draw_degital_f(ctx, num, x, y, ccolor);
                break;
            case "dice":
                set_circle_style(ctx, 2, ccolor);
                this.draw_dice(ctx, num, x, y);
                break;
            case "pills":
                set_circle_style(ctx, 3);
                this.draw_pills(ctx, num, x, y, ccolor);
                break;

                /* arrow */
            case "arrow_B_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_B_G":
                set_circle_style(ctx, 3);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_B_W":
                set_circle_style(ctx, 1);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_N_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_N_G":
                set_circle_style(ctx, 3);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_N_W":
                set_circle_style(ctx, 1);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_S":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowS(ctx, num, x, y);
                break;
            case "arrow_GP":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowGP(ctx, num, x, y);
                break;
            case "arrow_GP_C":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowGP_C(ctx, num, x, y);
                break;
            case "arrow_Short":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowShort(ctx, num, x, y);
                break;
            case "arrow_tri_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowtri(ctx, num, x, y);
                break;
            case "arrow_tri_G":
                set_circle_style(ctx, 3);
                this.draw_arrowtri(ctx, num, x, y);
                break;
            case "arrow_tri_W":
                set_circle_style(ctx, 1);
                this.draw_arrowtri(ctx, num, x, y);
                break;
            case "arrow_cross":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowcross(ctx, num, x, y);
                break;
            case "arrow_eight":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arroweight(ctx, num, x, y);
                break;
            case "arrow_fourtip":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowfourtip(ctx, num, x, y);
                break;
            case "arrow_fouredge_B":
                set_circle_style(ctx, 2, ccolor);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                this.draw_arrowfouredge(ctx, num, x, y);
                break;
            case "arrow_fouredge_G":
                set_circle_style(ctx, 2);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.fillStyle = Color.GREY;
                this.draw_arrowfouredge(ctx, num, x, y);
                break;
            case "arrow_fouredge_E":
                set_circle_style(ctx, 2);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.fillStyle = Color.GREEN_LIGHT;
                this.draw_arrowfouredge(ctx, num, x, y);
                break;

                /* special */
            case "kakuro":
                this.draw_kakuro(ctx, num, x, y, ccolor);
                break;
            case "compass":
                this.draw_compass(ctx, num, x, y, ccolor);
                break;
            case "star":
                this.draw_star(ctx, num, x, y, ccolor);
                break;
            case "tents":
                this.draw_tents(ctx, num, x, y, ccolor);
                break;
            case "battleship_B":
                var font_style_type = 1;
                set_circle_style(ctx, 2, ccolor);
                this.draw_battleship(ctx, num, x, y, font_style_type, ccolor);
                break;
            case "battleship_G":
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                font_style_type = 3;
                this.draw_battleship(ctx, num, x, y, font_style_type);
                break;
            case "battleship_W":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 2;
                this.draw_battleship(ctx, num, x, y);
                break;
            case "battleship_B+":
                set_circle_style(ctx, 2, ccolor);
                this.draw_battleshipplus(ctx, num, x, y);
                break;
            case "battleship_G+":
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                this.draw_battleshipplus(ctx, num, x, y);
                break;
            case "battleship_W+":
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 2;
                this.draw_battleshipplus(ctx, num, x, y);
                break;
            case "angleloop":
                this.draw_angleloop(ctx, num, x, y, ccolor);
                break;
            case "firefly":
                this.draw_firefly(ctx, num, x, y, ccolor);
                break;
            case "sun_moon":
                this.draw_sun_moon(ctx, num, x, y, ccolor);
                break;
            case "sudokuetc":
                this.draw_sudokuetc(ctx, num, x, y, ccolor);
                break;
            case "sudokumore":
                this.draw_sudokumore(ctx, num, x, y, ccolor);
                break;
            case "polyomino":
                this.draw_polyomino(ctx, num, x, y, ccolor);
                break;
            case "polyhex":
                this.draw_polyhex(ctx, num, x, y, ccolor);
                break;
            case "pencils":
                this.draw_pencils(ctx, num, x, y, ccolor);
                break;
            case "slovak":
                this.draw_slovak(ctx, num, x, y, ccolor);
                break;
            case "arc":
                this.draw_arc(ctx, num, x, y, ccolor);
                break;
            case "darts":
                this.draw_darts(ctx, num, x, y, ccolor);
                break;
            case "spans":
                this.draw_spans(ctx, num, x, y, ccolor);
                break;
            case "neighbors":
                this.draw_neighbors(ctx, num, x, y, ccolor);
                break;
        }
    }

    draw_circle(ctx, x, y, r) {
        ctx.beginPath();
        ctx.arc(x, y, r * pu.size, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
    }

    draw_x(ctx, x, y, r) {
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(45 * (Math.PI / 180)) * this.size, y + r * Math.sin(45 * (Math.PI / 180)) * this.size);
        ctx.lineTo(x + r * Math.cos(225 * (Math.PI / 180)) * this.size, y + r * Math.sin(225 * (Math.PI / 180)) * this.size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(135 * (Math.PI / 180)) * this.size, y + r * Math.sin(135 * (Math.PI / 180)) * this.size);
        ctx.lineTo(x + r * Math.cos(315 * (Math.PI / 180)) * this.size, y + r * Math.sin(315 * (Math.PI / 180)) * this.size);
        ctx.stroke();
    }

    draw_ast(ctx, x, y, r) {
        var th;
        th = 45 + this.theta % 180;
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(th * (Math.PI / 180)) * this.size, y + r * Math.sin(th * (Math.PI / 180)) * this.size);
        ctx.lineTo(x + r * Math.cos((th + 180) * (Math.PI / 180)) * this.size, y + r * Math.sin((th + 180) * (Math.PI / 180)) * this.size);
        ctx.stroke();
        th = 135 + this.theta % 180;
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(th * (Math.PI / 180)) * this.size, y + r * Math.sin(th * (Math.PI / 180)) * this.size);
        ctx.lineTo(x + r * Math.cos((th + 180) * (Math.PI / 180)) * this.size, y + r * Math.sin((th + 180) * (Math.PI / 180)) * this.size);
        ctx.stroke();
    }

    draw_slash(ctx, x, y, r) {
        var th;
        th = 45 + this.theta % 180;
        ctx.beginPath();
        ctx.moveTo(x + r * Math.cos(th * (Math.PI / 180)) * this.size, y + r * Math.sin(th * (Math.PI / 180)) * this.size);
        ctx.lineTo(x + r * Math.cos((th + 180) * (Math.PI / 180)) * this.size, y + r * Math.sin((th + 180) * (Math.PI / 180)) * this.size);
        ctx.stroke();
    }

    draw_ox(ctx, num, x, y) {
        var r = 0.3;
        switch (num) {
            case 1:
                this.draw_circle(ctx, x, y, r);
                break;
            case 2:
                this.draw_polygon(ctx, x, y + 0.05 * this.size, 0.3, 3, 90);
                break;
            case 3:
                this.draw_polygon(ctx, x, y, 0.35, 4, 45);
                break;
            case 4:
                this.draw_x(ctx, x, y, r);
                break;
            case 5:
                r = 0.5;
                ctx.beginPath();
                ctx.moveTo(x + r * Math.cos(45 * (Math.PI / 180)) * pu.size, y + r * Math.sin(45 * (Math.PI / 180)) * pu.size);
                ctx.lineTo(x + r * Math.cos(225 * (Math.PI / 180)) * pu.size, y + r * Math.sin(225 * (Math.PI / 180)) * pu.size);
                ctx.stroke();
                break;
            case 6:
                r = 0.5;
                ctx.beginPath();
                ctx.moveTo(x + r * Math.cos(135 * (Math.PI / 180)) * pu.size, y + r * Math.sin(135 * (Math.PI / 180)) * pu.size);
                ctx.lineTo(x + r * Math.cos(315 * (Math.PI / 180)) * pu.size, y + r * Math.sin(315 * (Math.PI / 180)) * pu.size);
                ctx.stroke();
                break;
            case 7:
                this.draw_x(ctx, x, y, 0.5);
                break;
            case 8:
                r = 0.05;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = ctx.strokeStyle;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x, y, r);
                break;
            case 9:
                r = 0.3;
                this.draw_circle(ctx, x, y, r);
                this.draw_x(ctx, x, y, 0.45);
                break;
        }
    }

    draw_tri(ctx, num, x, y, ccolor) {
        var r = 0.5,
            th, th1, th2, th3;
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                set_circle_style(ctx, 2, ccolor);
                ctx.beginPath();
                // This is to not break old puzzles which were constructed assuming this rendering bug. Check PR 120.
                if (pu.version_ge(3, 0, 5)) {
                    th1 = this.rotate_theta(-90 * (num - 1) - 135);
                    th2 = this.rotate_theta(-90 * (num - 1) - 45);
                    th3 = this.rotate_theta(-90 * (num - 1) + 135);
                    ctx.moveTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th1), y + Math.sqrt(2) * r * pu.size * Math.sin(th1));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th2), y + Math.sqrt(2) * r * pu.size * Math.sin(th2));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th3), y + Math.sqrt(2) * r * pu.size * Math.sin(th3));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th1), y + Math.sqrt(2) * r * pu.size * Math.sin(th1));
                } else {
                    th = this.rotate_theta(-90 * (num - 1));
                    ctx.moveTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * pu.size * Math.sin(th - Math.PI * 0.75));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th - Math.PI * 0.25), y + Math.sqrt(2) * r * pu.size * Math.sin(th - Math.PI * 0.25));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th + Math.PI * 0.75), y + Math.sqrt(2) * r * pu.size * Math.sin(th + Math.PI * 0.75));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * pu.size * Math.sin(th - Math.PI * 0.75));
                }
                ctx.fill();
                break;
            case 5:
                set_circle_style(ctx, 2, ccolor);
                this.draw_polygon(ctx, x, y, r * Math.sqrt(2), 4, 45);
                break;
            case 6:
            case 7:
            case 8:
            case 9:
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                ctx.beginPath();
                // This is to not break old puzzles which were constructed assuming this rendering bug. Check PR 120.
                if (pu.version_ge(3, 0, 5)) {
                    th1 = this.rotate_theta(-90 * (num - 1) - 135);
                    th2 = this.rotate_theta(-90 * (num - 1) - 45);
                    th3 = this.rotate_theta(-90 * (num - 1) + 135);
                    ctx.moveTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th1), y + Math.sqrt(2) * r * pu.size * Math.sin(th1));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th2), y + Math.sqrt(2) * r * pu.size * Math.sin(th2));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th3), y + Math.sqrt(2) * r * pu.size * Math.sin(th3));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th1), y + Math.sqrt(2) * r * pu.size * Math.sin(th1));
                } else {
                    th = this.rotate_theta(-90 * (num - 1));
                    ctx.moveTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * pu.size * Math.sin(th - Math.PI * 0.75));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th - Math.PI * 0.25), y + Math.sqrt(2) * r * pu.size * Math.sin(th - Math.PI * 0.25));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th + Math.PI * 0.75), y + Math.sqrt(2) * r * pu.size * Math.sin(th + Math.PI * 0.75));
                    ctx.lineTo(x + Math.sqrt(2) * r * pu.size * Math.cos(th - Math.PI * 0.75), y + Math.sqrt(2) * r * pu.size * Math.sin(th - Math.PI * 0.75));
                }
                ctx.fill();
                break;
            case 0:
                set_circle_style(ctx, 3);
                ctx.fillStyle = Color.GREY;
                this.draw_polygon(ctx, x, y, r * Math.sqrt(2), 4, 45);
                break;
        }
    }

    draw_cross(ctx, num, x, y) {
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                var th = this.rotate_theta(i * 90 - 180);
                ctx.beginPath();
                ctx.moveTo(x + ctx.lineWidth * 0.3 * Math.cos(th), y + ctx.lineWidth * 0.3 * Math.sin(th));
                ctx.lineTo(x - 0.5 * pu.size * Math.cos(th), y - 0.5 * pu.size * Math.sin(th));
                ctx.stroke();
            }
        }
    }

    draw_linesym(ctx, num, x, y, ccolor) {
        var r = 0.32;
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.fillStyle = Color.TRANSPARENTBLACK;
        ctx.strokeStyle = ccolor || Color.BLACK;
        ctx.lineWidth = 3;
        switch (num) {
            case 1:
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - 0 * pu.size);
                ctx.lineTo(x + r * pu.size, y + 0 * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                ctx.beginPath();
                ctx.moveTo(x - 0 * pu.size, y - r * pu.size);
                ctx.lineTo(x + 0 * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 3:
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 4:
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - 0 * pu.size);
                ctx.lineTo(x + r * pu.size, y + 0 * pu.size);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - 0 * pu.size, y - r * pu.size);
                ctx.lineTo(x + 0 * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                ctx.save();
                set_font_style(ctx, 0.8 * pu.size.toString(10), 1, ctx.strokeStyle);
                ctx.font = 0.8 * pu.size.toString(10) + "px Helvetica,Arial";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.translate(x, y);
                ctx.rotate(-Math.PI / 4);
                ctx.translate(-x, -y);
                ctx.fillText("＝", x, y + r / 10 * pu.size);
                ctx.restore();
                break;
            case 8:
                ctx.save();
                set_font_style(ctx, 0.8 * pu.size.toString(10), 1, ctx.strokeStyle);
                ctx.font = 0.8 * pu.size.toString(10) + "px Helvetica,Arial";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.translate(x, y);
                ctx.rotate(Math.PI / 4);
                ctx.translate(-x, -y);
                ctx.fillText("＝", x, y + r / 10 * pu.size);
                ctx.restore();
                break;
        }
    }

    draw_framelinesym(ctx, num, x, y, ccolor) {
        var r = 0.32;
        var r2 = 0.17;
        var d = 0.08;
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.fillStyle = Color.TRANSPARENTBLACK;
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 3;
        let flip = (pu.reflect[0] !== pu.reflect[1]) === ((pu.theta % 180) === 0);
        switch (num) {
            case 1:
                set_line_style(ctx, 115, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                set_line_style(ctx, 15, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 3:
                set_line_style(ctx, 16, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 4:
                set_line_style(ctx, 110, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                set_line_style(ctx, 115, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                set_line_style(ctx, 15, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                set_line_style(ctx, 16, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 8:
                set_line_style(ctx, 110, ccolor)
                r = r / Math.sqrt(2);
                ctx.beginPath();
                if (flip && pu.version_ge(3, 0, 5)) {
                    ctx.moveTo(x + r * pu.size, y - r * pu.size);
                    ctx.lineTo(x - r * pu.size, y + r * pu.size);
                } else {
                    ctx.moveTo(x - r * pu.size, y - r * pu.size);
                    ctx.lineTo(x + r * pu.size, y + r * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 9:
                set_line_style(ctx, 16, ccolor)
                ctx.beginPath();
                if (flip) {
                    ctx.moveTo(x - (r2 + d) * pu.size, y - (r2 - d) * pu.size);
                    ctx.lineTo(x + (r2 - d) * pu.size, y + (r2 + d) * pu.size);
                    ctx.moveTo(x - (r2 - d) * pu.size, y - (r2 + d) * pu.size);
                    ctx.lineTo(x + (r2 + d) * pu.size, y + (r2 - d) * pu.size);
                } else {
                    ctx.moveTo(x + (r2 + d) * pu.size, y - (r2 - d) * pu.size);
                    ctx.lineTo(x - (r2 - d) * pu.size, y + (r2 + d) * pu.size);
                    ctx.moveTo(x + (r2 - d) * pu.size, y - (r2 + d) * pu.size);
                    ctx.lineTo(x - (r2 + d) * pu.size, y + (r2 - d) * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
            case 0:
                set_line_style(ctx, 16, ccolor)
                ctx.beginPath();
                if (flip) {
                    ctx.moveTo(x + (r2 + d) * pu.size, y - (r2 - d) * pu.size);
                    ctx.lineTo(x - (r2 - d) * pu.size, y + (r2 + d) * pu.size);
                    ctx.moveTo(x + (r2 - d) * pu.size, y - (r2 + d) * pu.size);
                    ctx.lineTo(x - (r2 + d) * pu.size, y + (r2 - d) * pu.size);
                } else {
                    ctx.moveTo(x - (r2 + d) * pu.size, y - (r2 - d) * pu.size);
                    ctx.lineTo(x + (r2 - d) * pu.size, y + (r2 + d) * pu.size);
                    ctx.moveTo(x - (r2 - d) * pu.size, y - (r2 + d) * pu.size);
                    ctx.lineTo(x + (r2 + d) * pu.size, y + (r2 - d) * pu.size);
                }
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    draw_bars(ctx, num, x, y) {
        switch (num) {
            case 1:
                this.draw_rectbar(ctx, x, y, 0.1, 0.5, 4, 45);
                break;
            case 2:
                this.draw_rectbar(ctx, x, y, 0.5, 0.1, 4, 45);
                break;
            case 3:
                this.draw_rectbar(ctx, x, y, 0.2, 0.5, 4, 45);
                break;
            case 4:
                this.draw_rectbar(ctx, x, y, 0.5, 0.2, 4, 45);
                break;
        }
    }

    draw_inequality(ctx, num, x, y) {
        var th;
        var len = 0.14;
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                ctx.beginPath();
                th = this.rotate_theta((num - 1) * 90 + 45);
                ctx.moveTo(x + len * Math.sqrt(2) * pu.size * Math.cos(th), y + len * Math.sqrt(2) * pu.size * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 180);
                ctx.lineTo(x + len * pu.size * Math.cos(th), y + len * pu.size * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 315);
                ctx.lineTo(x + len * Math.sqrt(2) * pu.size * Math.cos(th), y + len * Math.sqrt(2) * pu.size * Math.sin(th));
                ctx.fill();
                ctx.stroke();
                break;
                //for square
            case 5:
            case 6:
            case 7:
            case 8:
                len = 0.12;
                ctx.beginPath();
                th = this.rotate_theta((num - 1) * 90 + 80);
                ctx.moveTo(x + len * Math.sqrt(2) * pu.size * Math.cos(th), y + len * Math.sqrt(2) * pu.size * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 180);
                ctx.lineTo(x + len * pu.size * Math.cos(th), y + len * pu.size * Math.sin(th));
                th = this.rotate_theta((num - 1) * 90 + 280);
                ctx.lineTo(x + len * Math.sqrt(2) * pu.size * Math.cos(th), y + len * Math.sqrt(2) * pu.size * Math.sin(th));
                ctx.stroke();
                break;
        }
    }

    draw_math(ctx, num, x, y) {
        switch (num) {
            case 1:
                ctx.font = 0.8 * pu.size + "px sans-serif";
                ctx.text("\u{221E}", x, y);
                break;
            case 2:
                ctx.font = 0.7 * pu.size + "px Helvetica,Arial";
                ctx.text("＋", x, y);
                break;
            case 3:
                ctx.font = 0.7 * pu.size + "px Helvetica,Arial";
                ctx.text("－", x, y);
                break;
            case 4:
                ctx.text("×", x, y);
                break;
            case 5:
                ctx.font = 0.7 * pu.size + "px Helvetica,Arial";
                ctx.text("＊", x, y);
                break;
            case 6:
                ctx.text("÷", x, y);
                break;
            case 7:
                ctx.font = 0.7 * pu.size + "px Helvetica,Arial";
                ctx.text("＝", x, y);
                break;
            case 8:
                ctx.text("≠", x, y);
                break;
            case 9:
                ctx.text("≦", x, y);
                break;
            case 0:
                ctx.text("≧", x, y);
                break;

        }
    }

    draw_degital(ctx, num, x, y) {
        var w1, w2, w3, w4, z1, z2;
        z1 = 0.17;
        z2 = 0.015;
        w3 = 0.05;
        w4 = 0.05;
        for (var i = 0; i < 7; i++) {
            if (num[0] === 1) {
                w1 = z1;
                w2 = -2 * (z1 + z2);
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[1] === 1) {
                w1 = -(z1 + z2);
                w2 = -2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[2] === 1) {
                w1 = z1 + z2;
                w2 = -2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[3] === 1) {
                w1 = z1;
                w2 = 0;
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[4] === 1) {
                w1 = -(z1 + z2);
                w2 = 2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[5] === 1) {
                w1 = z1 + z2;
                w2 = 2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[6] === 1) {
                w1 = z1;
                w2 = 2 * (z1 + z2);
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size,
                    [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
        }
    }

    draw_degital_f(ctx, num, x, y, ccolor) {
        set_circle_style(ctx, 3);
        var w1, w2, w3, w4, z1, z2;
        z1 = 0.17;
        z2 = 0.015;
        w3 = 0.05;
        w4 = 0.05;
        //frame
        w1 = z1;
        w2 = -2 * (z1 + z2);
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = -(z1 + z2);
        w2 = -2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1 + z2;
        w2 = -2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1;
        w2 = 0;
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = -(z1 + z2);
        w2 = 2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1 + z2;
        w2 = 2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1;
        w2 = 2 * (z1 + z2);
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size,
            [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();

        //contents
        set_circle_style(ctx, 2, ccolor);
        this.draw_degital(ctx, num, x, y);
    }

    draw_dice(ctx, num, x, y) {
        for (var i = 0; i < 9; i++) {
            if (num[i] === 1) {
                this.draw_circle(ctx, x + (i % 3 - 1) * 0.25 * pu.size, y + ((i / 3 | 0) - 1) * 0.25 * pu.size, 0.09);
            }
        }
    }

    draw_pills(ctx, num, x, y, ccolor) {
        var r = 0.15;
        ctx.fillStyle = ccolor || Color.GREY;
        switch (num) {
            case 1:
                this.draw_circle(ctx, x, y, r);
                break;
            case 2:
                this.draw_circle(ctx, x - 0.22 * pu.size, y - 0.22 * pu.size, r);
                this.draw_circle(ctx, x + 0.22 * pu.size, y + 0.22 * pu.size, r);
                break;
            case 3:
                this.draw_circle(ctx, x - 0 * pu.size, y - 0.23 * pu.size, r);
                this.draw_circle(ctx, x + 0.23 * pu.size, y + 0.2 * pu.size, r);
                this.draw_circle(ctx, x - 0.23 * pu.size, y + 0.2 * pu.size, r);
                break;
            case 4:
                this.draw_circle(ctx, x - 0.22 * pu.size, y - 0.22 * pu.size, r);
                this.draw_circle(ctx, x + 0.22 * pu.size, y + 0.22 * pu.size, r);
                this.draw_circle(ctx, x - 0.22 * pu.size, y + 0.22 * pu.size, r);
                this.draw_circle(ctx, x + 0.22 * pu.size, y - 0.22 * pu.size, r);
                break;
            case 5:
                this.draw_circle(ctx, x, y, r);
                this.draw_circle(ctx, x - 0.24 * pu.size, y - 0.24 * pu.size, r);
                this.draw_circle(ctx, x + 0.24 * pu.size, y + 0.24 * pu.size, r);
                this.draw_circle(ctx, x - 0.24 * pu.size, y + 0.24 * pu.size, r);
                this.draw_circle(ctx, x + 0.24 * pu.size, y - 0.24 * pu.size, r);
                break;
        }
    }


    draw_arrowB(ctx, num, x, y) {
        var len1 = 0.38; //nemoto
        var len2 = 0.4; //tip
        var w1 = 0.2;
        var w2 = 0.4;
        var ri = -0.4;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    draw_arrowN(ctx, num, x, y) {
        var len1 = 0.38; //nemoto
        var len2 = 0.4; //tip
        var w1 = 0.03;
        var w2 = 0.13;
        var ri = -0.25;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    draw_arrowS(ctx, num, x, y) {
        var len1 = 0.3; //nemoto
        var len2 = 0.32; //tip
        var w1 = 0.02;
        var w2 = 0.12;
        var ri = -0.2;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    draw_arrowGP(ctx, num, x, y) {
        var len1 = 0.35; //nemoto
        var len2 = 0.35; //tip
        var w1 = 0.12;
        var w2 = 0.23;
        var w3 = 0.34;
        var r1 = -0.33;
        var r2 = -0.44;
        var r3 = -0.32;
        var th;
        if (num > 0 && num <= 8) {
            th = this.rotate_theta((num - 1) * 45 - 180);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th),
                [0, w1 * pu.size, r1 * pu.size, w1 * pu.size, r2 * pu.size, w2 * pu.size, r3 * pu.size, w3 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowGP_C(ctx, num, x, y) {
        if (num > 0 && num <= 8) {
            this.draw_circle(ctx, x, y, 0.4);
            var th = this.rotate_theta((num - 1) * 45 - 180);
            this.draw_arrowGP(ctx, num, x + 0.6 * pu.size * Math.cos(th), y + 0.6 * pu.size * Math.sin(th));
        }
    }

    draw_arrowShort(ctx, num, x, y) {
        var len1 = 0.3; //nemoto
        var len2 = 0.3; //tip
        var w1 = 0.15;
        var w2 = 0.31;
        var ri = -0.33;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    draw_arrowtri(ctx, num, x, y) {
        var len1 = 0.25; //nemoto
        var len2 = 0.4; //tip
        var w1 = 0;
        var w2 = 0.35;
        var ri = 0;
        this.draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri);
    }

    draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num > 0 && num <= 8) {
            th = this.rotate_theta((num - 1) * 45 - 180);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th),
                [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowcross(ctx, num, x, y) {
        var w1 = 0.025;
        var w2 = 0.12;
        var len1 = 0.5 * w1; //nemoto
        var len2 = 0.45; //tip
        var len3 = 0.55; //tip 45 deg
        var ri = -0.18;
        var th;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th = this.rotate_theta(i * 90 - 180);
                ctx.beginPath();
                ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th),
                    [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                ctx.fill();
            }
        }
        for (var i = 4; i < 8; i++) {
            if (num[i] === 1) {
                th = this.rotate_theta(i * 90 - 135);
                ctx.beginPath();
                ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len3 * pu.size * Math.cos(th), y + len3 * pu.size * Math.sin(th),
                    [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                ctx.fill();
            }
        }
    }

    draw_arroweight(ctx, num, x, y) {
        var len1 = -0.2; //nemoto
        var len2 = 0.45; //tip
        var w1 = 0.025;
        var w2 = 0.10;
        var ri = -0.15;
        for (var i = 0; i < 8; i++) {
            if (num[i] === 1) {
                this.draw_arrow8(ctx, i + 1, x, y, len1, len2, w1, w2, ri);
            }
        }
    }

    draw_arrow8(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num === 2 || num === 4 || num === 6 || num === 8) {
            len1 *= 1.3;
            len2 *= 1.2;
        }
        if (num > 0 && num <= 8) {
            th = this.rotate_theta((num - 1) * 45 - 180);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th),
                [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowfourtip(ctx, num, x, y) {
        var len1 = 0.5; //nemoto
        var len2 = -0.25; //tip
        var w1 = 0.0;
        var w2 = 0.2;
        var ri = 0.0;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                this.draw_arrow4(ctx, i + 1, x, y, len1, len2, w1, w2, ri);
            }
        }
    }

    draw_arrow4(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num > 0 && num <= 4) {
            th = this.rotate_theta((num - 1) * 90);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th),
                [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowfouredge(ctx, num, x, y) {
        var len1 = 0.5; //nemoto
        var len2 = 0.5;
        var t1 = 0.0;
        var t2 = 0.5;
        var w1 = 0.02;
        var w2 = 0.07;
        var ri = 0.42;
        var th1a, th1b, th2;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th1a = this.rotate_theta(225 + 90 * i);
                th1b = this.rotate_theta(315 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                // This is to not break old puzzles which were constructed assuming this rendering bug. Check PR 108.
                if (pu.version_ge(3, 0, 5)) {
                    ctx.arrow(
                        x + len1 * pu.size * Math.cos(th1a) + 0.1 * pu.size * Math.cos(th2),
                        y + len1 * pu.size * Math.sin(th1a) + 0.1 * pu.size * Math.sin(th2),
                        x + len2 * pu.size * Math.cos(th1b) - 0.05 * pu.size * Math.cos(th2),
                        y + len2 * pu.size * Math.sin(th1b) - 0.05 * pu.size * Math.sin(th2),
                        [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                } else {
                    ctx.arrow(
                        x + len1 * pu.size * Math.cos(th1a + Math.PI * t1) + 0.1 * pu.size * Math.cos(th2),
                        y + len1 * pu.size * Math.sin(th1a + Math.PI * t1) + 0.1 * pu.size * Math.sin(th2),
                        x + len2 * pu.size * Math.cos(th1a + Math.PI * t2) - 0.05 * pu.size * Math.cos(th2),
                        y + len2 * pu.size * Math.sin(th1a + Math.PI * t2) - 0.05 * pu.size * Math.sin(th2),
                        [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                }
                ctx.fill();
                ctx.stroke();
            }
        }
        for (var i = 4; i < 8; i++) {
            if (num[i] === 1) {
                th1a = this.rotate_theta(225 + 90 * i);
                th1b = this.rotate_theta(315 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                // This is to not break old puzzles which were constructed assuming this rendering bug. Check PR 108.
                if (pu.version_ge(3, 0, 5)) {
                    ctx.arrow(
                        x + len2 * pu.size * Math.cos(th1b) - 0.1 * pu.size * Math.cos(th2),
                        y + len2 * pu.size * Math.sin(th1b) - 0.1 * pu.size * Math.sin(th2),
                        x + len1 * pu.size * Math.cos(th1a) + 0.05 * pu.size * Math.cos(th2),
                        y + len1 * pu.size * Math.sin(th1a) + 0.05 * pu.size * Math.sin(th2),
                        [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                } else {
                    ctx.arrow(
                        x + len2 * pu.size * Math.cos(th1a + Math.PI * t2) - 0.1 * pu.size * Math.cos(th2),
                        y + len2 * pu.size * Math.sin(th1a + Math.PI * t2) - 0.1 * pu.size * Math.sin(th2),
                        x + len1 * pu.size * Math.cos(th1a + Math.PI * t1) + 0.05 * pu.size * Math.cos(th2),
                        y + len1 * pu.size * Math.sin(th1a + Math.PI * t1) + 0.05 * pu.size * Math.sin(th2),
                        [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                }
                ctx.fill();
                ctx.stroke();
            }
        }
    }

    draw_kakuro(ctx, num, x, y, ccolor) {
        var th = this.rotate_theta(45) * 180 / Math.PI;
        switch (num) {
            case 1:
                ctx.fillStyle = ccolor || Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTWHITE;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.WHITE;
                ctx.lineWidth = 1;
                this.draw_slash(ctx, x, y, 0.5 * Math.sqrt(2));
                break;
            case 2:
                ctx.fillStyle = ccolor || Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTWHITE;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                break;
            case 3:
                ctx.fillStyle = Color.GREY_LIGHT;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_slash(ctx, x, y, 0.5 * Math.sqrt(2));
                break;
            case 4:
                ctx.fillStyle = Color.GREY_LIGHT;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                break;
            case 5:
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_slash(ctx, x, y, 0.5 * Math.sqrt(2));
                break;
            case 6:
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, 0.5 * Math.sqrt(2), 4, th);
                break;
        }
    }


    draw_compass(ctx, num, x, y, ccolor) {
        switch (num) {
            case 1:
                var r = 0.5;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_ast(ctx, x, y, r * Math.sqrt(2));
                break;
            case 2:
                var r = 0.33;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_ast(ctx, x, y, r * Math.sqrt(2));
                break;
            case 3:
                var r = 0.5;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.WHITE;
                ctx.lineWidth = 1;
                this.draw_ast(ctx, x, y, r * Math.sqrt(2));
                break;
        }
    }

    draw_tents(ctx, num, x, y, ccolor) {
        switch (num) {
            case 1:
                var r1;
                var r2;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                ctx.fillStyle = Color.WHITE;
                r1 = 0.1;
                r2 = 0.4;
                ctx.beginPath();
                ctx.moveTo(x - r1 * pu.size, y);
                ctx.lineTo(x + r1 * pu.size, y);
                ctx.lineTo(x + r1 * pu.size, y + r2 * pu.size);
                ctx.lineTo(x - r1 * pu.size, y + r2 * pu.size);
                ctx.lineTo(x - r1 * pu.size, y);
                ctx.fill();
                ctx.stroke();
                r1 = 0.2;
                r2 = 0.4;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.fillStyle = ccolor || Color.GREY;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x - r1 * Math.cos(90 * (Math.PI / 180)) * pu.size, y - (r1 * Math.sin(90 * (Math.PI / 180)) + 0) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(210 * (Math.PI / 180)) + 0) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(330 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(330 * (Math.PI / 180)) + 0) * pu.size);
                //ctx.arc(x,y-0.1*pu.size,0.3*pu.size,0,2*Math.PI,false);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(x - r1 * Math.cos(90 * (Math.PI / 180)) * pu.size, y - (r1 * Math.sin(90 * (Math.PI / 180)) + 0.2) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(210 * (Math.PI / 180)) + 0.2) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(330 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(330 * (Math.PI / 180)) + 0.2) * pu.size);
                ctx.fill();
                break;
            case 2:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.fillStyle = ccolor || Color.GREY_LIGHT;
                ctx.lineWidth = 1;
                r1 = 0.3;
                r2 = 0.4;
                ctx.beginPath();
                ctx.moveTo(x - r1 * Math.cos(90 * (Math.PI / 180)) * pu.size, y - (r1 * Math.sin(90 * (Math.PI / 180)) - 0.1) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(210 * (Math.PI / 180)) - 0.1) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(330 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(330 * (Math.PI / 180)) - 0.1) * pu.size);
                ctx.lineTo(x - r1 * Math.cos(90 * (Math.PI / 180)) * pu.size, y - (r1 * Math.sin(90 * (Math.PI / 180)) - 0.1) * pu.size);
                ctx.lineTo(x - r2 * Math.cos(210 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(210 * (Math.PI / 180)) - 0.1) * pu.size);
                ctx.fill();
                ctx.stroke();
                break;
            case 3: //anglers
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - 0.35 * pu.size, y);
                ctx.quadraticCurveTo(x - 0. * pu.size, y + 0.37 * pu.size, x + 0.3 * pu.size, y - 0.2 * pu.size);
                ctx.stroke();
                ctx.moveTo(x - 0.35 * pu.size, y);
                ctx.quadraticCurveTo(x - 0. * pu.size, y - 0.37 * pu.size, x + 0.3 * pu.size, y + 0.2 * pu.size);
                ctx.stroke();
                break;
            case 4:
                set_font_style(ctx, 0.8 * pu.size.toString(10), 1, ccolor);
                ctx.text("～", x, y - 0.11 * pu.size);
                ctx.text("～", x, y + 0.09 * pu.size);
                ctx.text("～", x, y + 0.29 * pu.size);
                break;
        }
    }

    draw_star(ctx, num, x, y, ccolor) {
        var r1 = 0.38;
        var r2 = 0.382 * r1;
        switch (num) {
            case 1:
                ctx.fillStyle = ccolor || Color.WHITE;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03 * pu.size, r1, r2, 5);
                break;
            case 2:
                ctx.fillStyle = ccolor || Color.BLACK;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03 * pu.size, r1, r2, 5);
                break;
            case 3:
                ctx.fillStyle = Color.GREY;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03 * pu.size, r1, r2, 5);
                break;
            case 4:
                ctx.fillStyle = ccolor || Color.WHITE;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r1, r2 * 0.9, 4);
                break;
            case 5:
                ctx.fillStyle = ccolor || Color.BLACK;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r1, r2 * 0.9, 4);
                break;
            case 6:
                ctx.fillStyle = Color.GREY;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r1, r2 * 0.9, 4);
                break;
            case 7:
                ctx.fillStyle = ccolor || Color.WHITE;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r2 * 0.9, r1, 4);
                break;
            case 8:
                ctx.fillStyle = ccolor || Color.BLACK;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r2 * 0.9, r1, 4);
                break;
            case 9:
                ctx.fillStyle = Color.GREY;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y, r2 * 0.9, r1, 4);
                break;
            case 0:
                var r = 0.4;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }

    draw_star0(ctx, x, y, r1, r2, n) {
        var th1 = 90;
        var th2 = th1 + 180 / n;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x - r1 * Math.cos(th1 * (Math.PI / 180)) * pu.size, y - (r1 * Math.sin(th1 * (Math.PI / 180)) - 0) * pu.size);
        ctx.lineTo(x - r2 * Math.cos(th2 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(th2 * (Math.PI / 180)) - 0) * pu.size);
        for (var i = 0; i < n; i++) {
            th1 += 360 / n;
            th2 += 360 / n;
            ctx.lineTo(x - r1 * Math.cos(th1 * (Math.PI / 180)) * pu.size, y - (r1 * Math.sin(th1 * (Math.PI / 180)) - 0) * pu.size);
            ctx.lineTo(x - r2 * Math.cos(th2 * (Math.PI / 180)) * pu.size, y - (r2 * Math.sin(th2 * (Math.PI / 180)) - 0) * pu.size);
        }
        ctx.fill();
        ctx.stroke();
    }

    draw_battleship(ctx, num, x, y, color_type = 1, ccolor) {
        var r = 0.4;
        var th;
        switch (num) {
            case 1:
                ctx.beginPath();
                ctx.arc(x, y, r * pu.size, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.stroke();
                break;
            case 2:
                th = this.rotate_theta(45) * 180 / Math.PI;
                this.draw_polygon(ctx, x, y, 0.36 * Math.sqrt(2), 4, th);
                break;
            case 3:
                this.draw_battleship_tip(ctx, x, y, 0);
                break;
            case 4:
                this.draw_battleship_tip(ctx, x, y, 90);
                break;
            case 5:
                this.draw_battleship_tip(ctx, x, y, 180);
                break;
            case 6:
                this.draw_battleship_tip(ctx, x, y, 270);
                break;
            case 7:
                set_font_style(ctx, 0.8 * pu.size.toString(10), color_type, ccolor);
                ctx.text("～", x, y - 0.11 * pu.size);
                ctx.text("～", x, y + 0.09 * pu.size);
                ctx.text("～", x, y + 0.29 * pu.size);
                break;
            case 8:
                r = 0.05;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = ccolor || (color_type === 3 ? Color.GREY : Color.BLACK);
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x, y, r);
                break;
        }
    }

    draw_battleship_tip(ctx, x, y, th) {
        var r = 0.36;
        th = this.rotate_theta(th);
        ctx.beginPath();
        ctx.arc(x, y, r * pu.size, Math.PI * 0.5 + th, Math.PI * 1.5 + th, false);
        ctx.moveTo(x + r * pu.size * Math.sin(th), y - r * pu.size * Math.cos(th));
        ctx.lineTo(x + r * Math.sqrt(2) * pu.size * Math.sin(th + 45 / 180 * Math.PI), y - r * Math.sqrt(2) * pu.size * Math.cos(th + 45 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sqrt(2) * pu.size * Math.sin(th + 135 / 180 * Math.PI), y - r * Math.sqrt(2) * pu.size * Math.cos(th + 135 / 180 * Math.PI));
        ctx.lineTo(x + r * pu.size * Math.sin(th + Math.PI), y - r * pu.size * Math.cos(th + Math.PI));
        ctx.fill();
        ctx.stroke();
    }

    draw_battleshipplus(ctx, num, x, y) {
        var r = 0.4;
        var th;
        switch (num) {
            case 1:
                this.draw_battleship_tipplus(ctx, x, y, 0);
                break;
            case 2:
                this.draw_battleship_tipplus(ctx, x, y, 90);
                break;
            case 3:
                this.draw_battleship_tipplus(ctx, x, y, 180);
                break;
            case 4:
                this.draw_battleship_tipplus(ctx, x, y, 270);
                break;
        }
    }

    draw_battleship_tipplus(ctx, x, y, th) {
        var r = 0.36;
        th = this.rotate_theta(th);
        ctx.beginPath();
        ctx.arc(x, y, r * pu.size, Math.PI * 0.5 + th, Math.PI * 1.0 + th, false);
        ctx.moveTo(x - r * pu.size * Math.sin(th), y + r * pu.size * Math.cos(th));
        ctx.lineTo(x + r * Math.sqrt(2) * pu.size * Math.sin(-th + 45 / 180 * Math.PI), y + r * Math.sqrt(2) * pu.size * Math.cos(-th + 45 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sqrt(2) * pu.size * Math.sin(-th + 135 / 180 * Math.PI), y + r * Math.sqrt(2) * pu.size * Math.cos(-th + 135 / 180 * Math.PI));
        ctx.lineTo(x + r * Math.sqrt(2) * pu.size * Math.sin(-th + 225 / 180 * Math.PI), y + r * Math.sqrt(2) * pu.size * Math.cos(-th + 225 / 180 * Math.PI));
        ctx.lineTo(x - r * pu.size * Math.sin(-th + 0.5 * Math.PI), y - r * pu.size * Math.cos(-th + 0.5 * Math.PI));
        ctx.fill();
        ctx.stroke();
    }

    draw_angleloop(ctx, num, x, y, ccolor) {
        var r;
        switch (num) {
            case 1:
                r = 0.24;
                set_circle_style(ctx, 2, ccolor);
                this.draw_polygon(ctx, x, y, r, 3, 90);
                break;
            case 2:
                r = 0.24;
                set_circle_style(ctx, 5);
                ctx.fillStyle = ccolor || Color.GREY;
                this.draw_polygon(ctx, x, y, r, 4, 45);
                break;
            case 3:
                r = 0.215;
                set_circle_style(ctx, 1, ccolor);
                ctx.lineWidth = 1;
                this.draw_polygon(ctx, x, y, r, 5, 90);
                break;
            case 4:
                r = 0.25;
                set_circle_style(ctx, 1);
                ctx.lineWidth = 2;
                this.draw_x(ctx, x, y, r);
                break;
        }
    }

    draw_firefly(ctx, num, x, y, ccolor) {
        var r1 = 0.36,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                var th = this.rotate_theta((num - 1) * 90 - 180);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
            case 5:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, ccolor) {
        var r1 = 0.36,
            r2 = 0.34;
        switch (num) {
            case 1:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
            case 2:
                set_circle_style(ctx, 2, ccolor);
                ctx.beginPath();
                ctx.arc(x, y, r1 * pu.size, -0.34 * Math.PI, 0.73 * Math.PI, false);
                ctx.arc(x - 0.12 * pu.size, y - 0.08 * pu.size, r2 * pu.size, 0.67 * Math.PI, -0.28 * Math.PI, true);
                ctx.closePath();
                ctx.fill();
                break;
            case 3:
                set_font_style(ctx, 0.6 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, 0.7 * pu.size, this.size * 0.8);
                break;
            case 4:
                set_font_style(ctx, 0.6 * pu.size.toString(10), 10);
                ctx.text("💣", x + 0.04 * pu.size, y + 0.04 * pu.size, 0.7 * pu.size, this.size * 0.8);
                break;
            case 5:
                set_font_style(ctx, 0.5 * pu.size.toString(10), 10);
                ctx.text("💣💣", x + 0.02 * pu.size, y + 0.02 * pu.size, 0.7 * pu.size, this.size * 0.8);
                break;
        }
    }

    draw_pencils(ctx, num, x, y, ccolor) {
        var r = 0.2,
            th;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        ctx.fillStyle = ccolor || Color.BLACK;
        ctx.strokeStyle = ccolor || Color.BLACK;
        ctx.lineWidth = 2;
        ctx.lineJoin = "bevel"
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                ctx.beginPath();
                th = this.rotate_theta(90 * (num - 1));
                ctx.moveTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th + Math.PI * 0.25)));
                ctx.lineTo(x, y);
                ctx.lineTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th - Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th - Math.PI * 0.25)));
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo((x + Math.sqrt(2) * 0.25 * pu.size * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.25 * pu.size * Math.sin(th + Math.PI * 0.25)));
                ctx.lineTo(x, y);
                ctx.lineTo((x + Math.sqrt(2) * 0.25 * pu.size * Math.cos(th - Math.PI * 0.25)), (y + Math.sqrt(2) * 0.25 * pu.size * Math.sin(th - Math.PI * 0.25)));
                ctx.closePath();
                ctx.fill();
                break;
        }
    }

    draw_slovak(ctx, num, x, y, ccolor) {
        var r = 0.09,
            h = 0.37;
        switch (num) {
            case 1:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y + h * pu.size, r);
                break;
            case 2:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x - 0.2 * pu.size, y + h * pu.size, r);
                this.draw_circle(ctx, x + 0.2 * pu.size, y + h * pu.size, r);
                break;
            case 3:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x - 0.25 * pu.size, y + h * pu.size, r);
                this.draw_circle(ctx, x + 0.0 * pu.size, y + h * pu.size, r);
                this.draw_circle(ctx, x + 0.25 * pu.size, y + h * pu.size, r);
                break;
            case 4:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x - 0.36 * pu.size, y + h * pu.size, r);
                this.draw_circle(ctx, x - 0.12 * pu.size, y + h * pu.size, r);
                this.draw_circle(ctx, x + 0.12 * pu.size, y + h * pu.size, r);
                this.draw_circle(ctx, x + 0.36 * pu.size, y + h * pu.size, r);
                break;
            case 5:
                set_font_style(ctx, 0.35 * pu.size.toString(10), 1, ccolor);
                ctx.text("?", x, y + h * pu.size);
                break;
        }
    }

    draw_sudokuetc(ctx, num, x, y, ccolor) {
        switch (num) {
            case 1:
                var r = 0.14;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.fillStyle = ccolor || Color.GREY_LIGHT;
                this.draw_polygon(ctx, x - r * pu.size, y + r * pu.size, r * Math.sqrt(2), 4, 45);
                this.draw_polygon(ctx, x + r * pu.size, y - r * pu.size, r * Math.sqrt(2), 4, 45);
                ctx.fillStyle = Color.GREY_DARK;
                this.draw_polygon(ctx, x - r * pu.size, y - r * pu.size, r * Math.sqrt(2), 4, 45);
                this.draw_polygon(ctx, x + r * pu.size, y + r * pu.size, r * Math.sqrt(2), 4, 45);
                break;
            case 2:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = ccolor || Color.GREY_LIGHT;
                ctx.lineWidth = 4;
                this.draw_circle(ctx, x, y, 0.71);
                break;
            case 3:
                var r = 0.99;
                set_circle_style(ctx, 3, ccolor);
                ctx.beginPath();
                ctx.moveTo(x, y + r * pu.size);
                ctx.lineTo(x + r * pu.size, y);
                ctx.lineTo(x, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y);
                ctx.closePath();
                ctx.fill();
                break;
            case 4:
                var r = 0.2 * pu.size;
                var w = 1.8 * pu.size;
                var h = 0.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                var r = 0.2 * pu.size;
                var w = 0.8 * pu.size;
                var h = 1.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                var r = 0.2 * pu.size;
                var w = 2.8 * pu.size;
                var h = 0.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                var r = 0.2 * pu.size;
                var w = 0.8 * pu.size;
                var h = 2.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "butt";
                ctx.lineWidth = 2;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.TRANSPARENTBLACK;
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    draw_sudokumore(ctx, num, x, y, ccolor) {
        switch (num) {
            case 1:
                var r = 0.4 * pu.size;
                var w = 1.8 * pu.size;
                var h = 0.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                if (this.version_lt(2, 25, 9)) {
                    ctx.fillStyle = Color.TRANSPARENTBLACK;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.strokeStyle = ccolor || Color.GREY_DARK_LIGHT;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 2:
                var r = 0.4 * pu.size;
                var w = 0.8 * pu.size;
                var h = 1.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                if (this.version_lt(2, 25, 9)) {
                    ctx.fillStyle = Color.TRANSPARENTBLACK;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.strokeStyle = ccolor || Color.GREY_DARK_LIGHT;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 3:
                var r = 0.4 * pu.size;
                var w = 2.8 * pu.size;
                var h = 0.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                if (this.version_lt(2, 25, 9)) {
                    ctx.fillStyle = Color.TRANSPARENTBLACK;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.strokeStyle = ccolor || Color.GREY_DARK_LIGHT;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 4:
                var r = 0.4 * pu.size;
                var w = 0.8 * pu.size;
                var h = 2.8 * pu.size;
                x = x - 0.40 * pu.size;
                y = y - 0.40 * pu.size;
                ctx.lineCap = "round";
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                if (this.version_lt(2, 25, 9)) {
                    ctx.fillStyle = Color.TRANSPARENTBLACK;
                } else {
                    ctx.fillStyle = Color.WHITE;
                }
                ctx.strokeStyle = ccolor || Color.GREY_DARK_LIGHT;
                ctx.beginPath()
                ctx.moveTo(x + r, y);
                ctx.lineTo(x + w - r, y);
                ctx.arcTo(x + w, y, x + w, y + r, r);
                ctx.lineTo(x + w, y + h - r);
                ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
                ctx.lineTo(x + r, y + h);
                ctx.arcTo(x, y + h, x, y + h - r, r);
                ctx.lineTo(x, y + r);
                ctx.arcTo(x, y, x + r, y, r);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                break;
            case 5:
                ctx.lineWidth = 3;
                ctx.setLineDash([]);
                ctx.fillStyle = Color.WHITE;
                ctx.strokeStyle = ccolor || Color.GREY_DARK_LIGHT;
                this.draw_circle(ctx, x, y, 0.4);
                break;
        }
    }

    draw_arc(ctx, num, x, y, ccolor) {
        var th, th1, th2, th2a;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        ctx.fillStyle = ccolor || Color.BLACK;
        ctx.strokeStyle = ccolor || Color.BLACK;
        ctx.lineWidth = 3;
        ctx.lineJoin = "bevel"
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
                ctx.beginPath();
                // This is to not break old puzzles which were constructed assuming this arc bug. Check PR 109.
                if (pu.version_ge(3, 0, 5)) {
                    th1 = this.rotate_theta(45 + 90 * (num - 1));
                    th2 = this.rotate_theta(225 + 90 * (num - 1));
                    th2a = this.rotate_theta(315 + 90 * (num - 1));
                    ctx.moveTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th1)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th1)));
                    ctx.arcTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th2a)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th2a)), (x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th2)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th2)), pu.size);
                } else {
                    th = this.rotate_theta(90 * (num - 1));
                    ctx.moveTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th + Math.PI * 0.25)));
                    ctx.arcTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th - Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th - Math.PI * 0.25)), (x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th - Math.PI * 0.75)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th - Math.PI * 0.75)), pu.size);
                }
                ctx.stroke();
                break;
            case 5:
            case 6:
                ctx.beginPath();
                // This is to not break old puzzles which were constructed assuming this arc bug. Check PR 109.
                if (pu.version_ge(3, 0, 5)) {
                    th1 = this.rotate_theta(45 + 90 * (num - 5));
                    th2 = this.rotate_theta(225 + 90 * (num - 5));
                    ctx.moveTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th1)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th1)));
                    ctx.lineTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th2)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th2)));
                } else {
                    th = this.rotate_theta(90 * (num - 5));
                    ctx.moveTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th + Math.PI * 0.25)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th + Math.PI * 0.25)));
                    ctx.lineTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(th - Math.PI * 0.75)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(th - Math.PI * 0.75)));
                }
                ctx.stroke();
        }
    }

    draw_darts(ctx, num, x, y, ccolor) {
        set_circle_style(ctx, 13, ccolor);
        if (1 <= num, num <= 4) {
            for (var i = 1; i <= num; i++) {
                this.draw_circle(ctx, x, y, Math.sqrt(2) * 0.5 * (2 * i - 1));
            }
        }
        for (var i = 0; i <= 3; i++) {
            ctx.beginPath();
            ctx.moveTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(Math.PI * 0.5 * i)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(Math.PI * 0.5 * i)));
            ctx.lineTo((x + Math.sqrt(2) * 0.5 * pu.size * Math.cos(Math.PI * 0.5 * i) * (2 * num - 1)), (y + Math.sqrt(2) * 0.5 * pu.size * Math.sin(Math.PI * 0.5 * i) * (2 * num - 1)));
            ctx.stroke();
        }
    }

    draw_spans(ctx, num, x, y, ccolor) {
        var h = 0.15;
        switch (num) {
            case 1:
                set_circle_style(ctx, 8);
                ctx.lineWidth = 3;
                ctx.beginPath()
                ctx.moveTo(x + 0.5 * pu.size, y - h * pu.size);
                ctx.lineTo(x + 0.5 * pu.size, y + h * pu.size);
                ctx.lineTo(x + h * pu.size, y + 0.5 * pu.size);
                ctx.lineTo(x - h * pu.size, y + 0.5 * pu.size);
                ctx.lineTo(x - 0.5 * pu.size, y + h * pu.size);
                ctx.lineTo(x - 0.5 * pu.size, y - h * pu.size);
                ctx.lineTo(x - h * pu.size, y - 0.5 * pu.size);
                ctx.lineTo(x + h * pu.size, y - 0.5 * pu.size);
                ctx.lineTo(x + 0.5 * pu.size, y - h * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
        }
    }

    draw_neighbors(ctx, num, x, y, ccolor) {
        var r = 0.85;
        switch (num) {
            case 1:
                set_circle_style(ctx, 1);
                ctx.fillStyle = Color.GREY;
                this.draw_polygon(ctx, x, y, 1 / Math.sqrt(2), 4, 45);
                ctx.fillStyle = ccolor || Color.GREY_LIGHT;
                this.draw_polygon(ctx, x, y, r / Math.sqrt(2), 4, 45);
                break;
        }
    }

    draw_polyomino(ctx, num, x, y, ccolor) {
        ctx.setLineDash([]);
        ctx.fillStyle = ccolor || Color.GREY_LIGHT;
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "butt";
        var r = 0.25;
        for (var i = 0; i < 9; i++) {
            if (num[i] === 1) {
                this.draw_polygon(ctx, x + (i % 3 - 1) * r * pu.size, y + ((i / 3 | 0) - 1) * r * pu.size, r * 0.5 * Math.sqrt(2), 4, 45);
            }
        }
    }

    draw_polyhex(ctx, num, x, y, ccolor) {
        ctx.setLineDash([]);
        ctx.fillStyle = ccolor || Color.GREY_LIGHT;
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 1.2;
        ctx.lineCap = "butt";
        var r = 0.2;
        var degrees = [-120, -60, 180, null, 0, 120, 60];
        var r2 = r * 1.23;
        for (var i = 0; i < 7; i++) {
            if (num[i] === 1) {
                if (i == 3) {
                    this.draw_polygon(ctx, x, y, r * 0.5 * Math.sqrt(2), 6, 30);
                } else {
                    this.draw_polygon(ctx, x + pu.size * r2 * Math.cos(degrees[i] * Math.PI / 180), y + pu.size * r2 * Math.sin(degrees[i] * Math.PI / 180), r * 0.5 * Math.sqrt(2), 6, 30);
                }
            }
        }
    }

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }
}

class Puzzle_sudoku extends Puzzle_square {
    constructor(nx, ny, size) {
        // Board information
        super('sudoku');
        this.gridtype = "sudoku";
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 4;
        this.ny0 = this.ny + 4;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 1;
        this.height0 = this.ny + 1;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.sudoku = [Number(document.getElementById("nb_sudoku1").checked),
            Number(document.getElementById("nb_sudoku2").checked),
            Number(document.getElementById("nb_sudoku3").checked),
            Number(document.getElementById("nb_sudoku4").checked)
        ];
        this.space = [
            parseInt(document.getElementById("nb_space1").value, 10),
            parseInt(document.getElementById("nb_space2").value, 10),
            parseInt(document.getElementById("nb_space3").value, 10),
            parseInt(document.getElementById("nb_space4").value, 10)
        ];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 8,
            "arrow_fourtip": 4,
            "degital_B": 7,
            "degital_G": 7,
            "degital_E": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9,
            "polyhex": 7
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    draw_sudokugrid(rows, cols, start, end, linestyle) {
        let x, y, key;
        for (var j = 0; j < cols.length; j++) { //  column
            for (var i = start; i <= end; i++) { // row
                x = this.nx0 * i + cols[j] + this.nx0 * this.nx0;
                y = this.nx0 * (i + 1) + cols[j] + this.nx0 * this.nx0;
                key = x.toString() + "," + y.toString();
                this["pu_q"]["lineE"][key] = linestyle;
            }
        }
        for (var j = 0; j < rows.length; j++) { //  row
            for (var i = start; i <= end; i++) { // column
                x = this.nx0 * rows[j] + i + this.nx0 * this.nx0;
                y = this.nx0 * rows[j] + i + 1 + this.nx0 * this.nx0;
                key = x.toString() + "," + y.toString();
                this["pu_q"]["lineE"][key] = linestyle;
            }
        }
    }

    draw_N(start, end, linestyle) {
        let x, y, key;
        for (var i = start; i <= end; i++) {
            x = this.nx0 * i + i + this.nx0 * this.nx0;
            y = this.nx0 * (i + 1) + (i + 1) + this.nx0 * this.nx0;
            key = x.toString() + "," + y.toString();
            this["pu_q"]["lineE"][key] = linestyle;
        }
    }

    draw_Z(start, endloop, endsize, linestyle) {
        let x, y, key;
        for (var i = start; i <= endloop; i++) {
            x = this.nx0 * i + endsize + 2 - i + this.nx0 * this.nx0;
            y = this.nx0 * (i + 1) + (endsize + 1 - i) + this.nx0 * this.nx0;
            key = y.toString() + "," + x.toString();
            this["pu_q"]["lineE"][key] = linestyle;
        }
    }
}

class Puzzle_kakuro extends Puzzle_square {
    constructor(nx, ny, size) {
        // Board information
        super('kakuro');
        this.gridtype = "kakuro";
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 4;
        this.ny0 = this.ny + 4;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 1;
        this.height0 = this.ny + 1;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [
            parseInt(document.getElementById("nb_space1").value, 10),
            parseInt(document.getElementById("nb_space2").value, 10),
            parseInt(document.getElementById("nb_space3").value, 10),
            parseInt(document.getElementById("nb_space4").value, 10)
        ];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 8,
            "arrow_fourtip": 4,
            "degital_B": 7,
            "degital_G": 7,
            "degital_E": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9,
            "polyhex": 7

        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    draw_kakurogrid() {
        let rows = this.ny;
        let cols = this.nx;

        // R1C1 as black
        let i = 0,
            j = 0;
        this[this.mode.qa].symbol[(i + 2) + ((j + 2) * this.nx0)] = [2, "kakuro", 2];

        // Row 1 Blacks
        for (i = 1; i < cols; i++) { // column
            this[this.mode.qa].symbol[(i + 2) + ((j + 2) * this.nx0)] = [1, "kakuro", 2];
        }

        // Col 1 Blacks
        i = 0;
        for (j = 1; j < rows; j++) { // column
            this[this.mode.qa].symbol[(i + 2) + ((j + 2) * this.nx0)] = [1, "kakuro", 2];
        }
    }
}