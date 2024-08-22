class Puzzle_truncated_square extends Puzzle {
    constructor(nx, ny, size) {
        //盤面情報
        super('truncated_square');
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny * 2 + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid
        this.sudoku = [0, 0, 0, 0]; // This is for sudoku settings
        this.width0 = this.nx + 6;
        this.height0 = this.ny;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var ny = this.ny0;
        var r;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        adjacent = [];
        surround = [];
        neighbor = [];
        //center
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                k0 = k;
                type = 0;
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                point[k] = new Point(((i * 2 + (j % 2)) + 0.5) * this.size, (j + 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 0);
                k++;
                point[k] = new Point(((i * 2 + (j % 2)) + 1.5) * this.size, (j + 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;

                type = 1;
                r = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
                for (var m = 0; m < 8; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 45 + 22.5)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 45 + 22.5)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]); //pushやspliceだと全てのpointが更新されてしまう
                    k++;
                }
                r = Math.sqrt(2) - 1;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 45)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 45)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    k++;
                }

                type = 2;
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 8; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 8 * m), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 8 * m), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]); //pushやspliceだとpointが全て更新されてしまう
                    if (m === 0) {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 5].neighbor = point[k - 5].neighbor.concat([k]);
                    } else {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 13].neighbor = point[k - 13].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 1 - 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 4 * m), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 4 * m), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 9].neighbor = point[k - 9].neighbor.concat([k]);
                    } else {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 13].neighbor = point[k - 13].neighbor.concat([k]);
                    }
                    k++;
                }
            }
        }
        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    if (point[i].use === -1 && point[j].use === 1) { point[i].use = 1; };
                    delete point[j];
                    //置換ここまで
                }
            }
        }
        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
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
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
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
                    type = [2];
                }
                break;
            case "cage":
                type = [4];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 0) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 0 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 45 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -45);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 45 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +45);
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
        var a, b, c;
        b = [0, 1, 2, 3];
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
        var quotient = parseInt(this.cursol / 27);
        if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol") {
            if (this.cursol % 27 === 0) { // top side
                switch (c) {
                    case 0: //left
                        // if cursor already on the left border
                        if (quotient % this.nx0 === 0) {
                            a = this.cursol + 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 1: //up
                        a = this.cursol + 27 * this.nx0;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 2: //right
                        a = this.cursol + 27;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 3: //down
                        // if cursor already on the bottom border
                        if (quotient < this.nx0) {
                            a = this.cursol * this.nx0 + 2;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                }
            } else if (this.cursol % 27 === 1) { // left side
                switch (c) {
                    case 0: //left
                        a = this.cursol + 27 * this.nx0;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 1: //up
                        // if cursor already on the up border
                        if (quotient % this.nx0 === 0) {
                            a = this.cursol - 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 2: //right
                        // if cursor already on the right border
                        if (quotient < this.nx0) {
                            a = this.cursol + 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 3: //down
                        a = this.cursol + 27;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                }
            } else if (this.cursol % 27 === 2) { // right side
                switch (c) {
                    case 0: //left
                        // if cursor already on the left border
                        if (quotient < this.nx0) {
                            a = this.cursol - 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 1: //up
                        // if cursor already on the up border
                        if (quotient % this.nx0 === 0) {
                            a = parseInt((this.cursol - 2) / this.nx0);
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 2: //right
                        a = this.cursol + 27 * this.nx0;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 3: //down
                        a = this.cursol + 27;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                }
            }
            this.selection = [];
            if (!this.selection.includes(this.cursol)) {
                this.selection.push(this.cursol);
            }
        } else if (this.mode[this.mode.qa].edit_mode === "sudoku") {
            if (this.selection.length >= 1) {
                if (this.cursol % 27 === 0) { // top side
                    switch (c) {
                        case 0: //left
                            // if cursor already on the left border
                            if (quotient % this.nx0 === 0) {
                                a = this.cursol + 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 1: //up
                            a = this.cursol + 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 2: //right
                            a = this.cursol + 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 3: //down
                            // if cursor already on the bottom border
                            if (quotient < this.nx0) {
                                a = this.cursol * this.nx0 + 2;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27 * this.nx0;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                    }
                } else if (this.cursol % 27 === 1) { // left side
                    switch (c) {
                        case 0: //left
                            a = this.cursol + 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 1: //up
                            // if cursor already on the up border
                            if (quotient % this.nx0 === 0) {
                                a = this.cursol - 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 2: //right
                            // if cursor already on the right border
                            if (quotient < this.nx0) {
                                a = this.cursol + 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27 * this.nx0;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 3: //down
                            a = this.cursol + 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                    }
                } else if (this.cursol % 27 === 2) { // right side
                    switch (c) {
                        case 0: //left
                            // if cursor already on the left border
                            if (quotient < this.nx0) {
                                a = this.cursol - 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27 * this.nx0;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 1: //up
                            // if cursor already on the up border
                            if (quotient % this.nx0 === 0) {
                                a = parseInt((this.cursol - 2) / this.nx0);
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 2: //right
                            a = this.cursol + 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 3: //down
                            a = this.cursol + 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                    }
                }
                if (this.point[a] && this.point[a].use === 1) {
                    if (!ctrl_key) {
                        this.selection = [];
                    }
                    if (!this.selection.includes(a)) {
                        this.selection.push(a);
                    }
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

    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
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

    draw_direction(pu) {
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
                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x, this.point[this[pu].direction[i][0]].y);
                for (var j = 1; j < this[pu].direction[i].length - 1; j++) {
                    this.ctx.lineTo(this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y);
                }
                this.ctx.stroke();

                j = this[pu].direction[i].length - 1;
                this.ctx.lineJoin = "bevel";
                this.ctx.beginPath();
                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                    this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y, [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                this.ctx.stroke();
                this.ctx.lineJoin = "miter";
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

    draw_symbol(pu, layer) {
        /*symbol_layer*/
        var p_x, p_y;
        for (var i in this[pu].symbol) {
            if (i.slice(-1) === "E") { //辺モードでの重ね書き
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            if (this[pu].symbol[i][2] === layer) {
                try {
                    this.draw_symbol_select(this.ctx, p_x, p_y, this[pu].symbol[i][0], this[pu].symbol[i][1], i, pu);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    draw_number(pu) {
        /*number*/
        var p_x, p_y;
        for (var i in this[pu].number) {
            if (i.slice(-1) === "E") { // Overwriting in edge mode
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            switch (this[pu].number[i][2]) {
                case "1": //normal
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
                    set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.06 * this.size, this.size * 0.8);
                    break;
                case "2": //arrow
                    var arrowlength = 0.7;
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
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
                                p_x + (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 0:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.0 * this.size, p_y + 0.15 * this.size, this.size * 0.8);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x - (arrowlength * 0.5 + 0.0) * this.size, p_y + (arrowlength * 0.0 - 0.3) * this.size,
                                p_x - (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 90:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 270:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 45:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 225:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 135:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 315:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
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
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.44);
                    if (this[pu].number[i][0].length === 1) {
                        set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.06 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 2) {
                        set_font_style(this.ctx, 0.48 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), p_x - 0.16 * this.size, p_y - 0.15 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), p_x + 0.18 * this.size, p_y + 0.19 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 3) {
                        set_font_style(this.ctx, 0.45 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), p_x - 0.22 * this.size, p_y - 0.14 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), p_x + 0.24 * this.size, p_y - 0.05 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(2, 3), p_x - 0.0 * this.size, p_y + 0.3 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 4) {
                        set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), p_x - 0.0 * this.size, p_y - 0.22 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), p_x - 0.26 * this.size, p_y + 0.04 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(2, 3), p_x + 0.26 * this.size, p_y + 0.04 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(3, 4), p_x - 0.0 * this.size, p_y + 0.3 * this.size, this.size * 0.8);
                    }
                    break;
                case "5": //small
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.17);
                    set_font_style(this.ctx, 0.25 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.02 * this.size, this.size * 0.8);
                    break;
                case "6": //medium
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.25);
                    set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.03 * this.size, this.size * 0.8);
                    break;
                case "10": //big
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.36);
                    set_font_style(this.ctx, 0.6 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.03 * this.size, this.size * 0.8);
                    break;
                case "7": //sudoku
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
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
            }
            if (true) { //(this[pu].numberS[i][0].length <= 2 ){
                set_font_style(this.ctx, 0.32 * this.size.toString(10), this[pu].numberS[i][1]);
                this.ctx.textAlign = "center";
                this.ctx.text(this[pu].numberS[i][0], this.point[i].x, this.point[i].y + 0.03 * this.size, this.size * 0.48);
                //}else{
                //  set_font_style(this.ctx,0.28*this.size.toString(10),this[pu].numberS[i][1]);
                //  this.ctx.textAlign = "left";
                //  this.ctx.text(this[pu].numberS[i][0],this.point[i].x-0.15*this.size,this.point[i].y+0.03*this.size,this.size*0.8);
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

    draw_numbercircle_iso(pu, i, size) {
        if (this[pu].number[i][1] === 5) {
            set_circle_style(this.ctx, 7);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        } else if (this[pu].number[i][1] === 6) {
            set_circle_style(this.ctx, 1);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        } else if (this[pu].number[i][1] === 7) {
            set_circle_style(this.ctx, 2);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        } else if (this[pu].number[i][1] === 11) {
            set_circle_style(this.ctx, 11);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        }
    }

    draw_symbol_select(ctx, x, y, num, sym, i = 'panel', qamode) {
        let ccolor = undefined;
        if (i !== 'panel' && UserSettings.custom_colors_on && this[qamode + "_col"].symbol[i]) {
            ccolor = this[qamode + "_col"].symbol[i];
        }
        this.draw_symbol_select_ccolor(ctx, x, y, num, sym, i, ccolor);
    }

    draw_symbol_select_ccolor(ctx, x, y, num, sym, loc, ccolor) {
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
            case "tridown_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y - 0.16 * 0.25 * this.size, 0.16, 3, -90);
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
                set_font_style(ctx, 0.8 * pu.size.toString(10), 2, ccolor);
                this.draw_math(ctx, num, x, y + 0.05 * pu.size);
                break;
            case "degital":
                this.draw_degital(ctx, num, x, y, ccolor);
                break;
            case "degital_f":
                this.draw_degital_f(ctx, num, x, y, ccolor);
                break;
            case "dice":
                set_circle_style(ctx, 2, ccolor);
                this.draw_dice(ctx, num, x, y);
                break;
            case "pills":
                set_circle_style(ctx, 3, ccolor);
                this.draw_pills(ctx, num, x, y);
                break;

                /* arrow */
            case "arrow_B_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_B_G":
                set_circle_style(ctx, 3, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_B_W":
                set_circle_style(ctx, 1, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_N_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_N_G":
                set_circle_style(ctx, 3, ccolor);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_N_W":
                set_circle_style(ctx, 1, ccolor);
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
                set_circle_style(ctx, 3, ccolor);
                this.draw_arrowtri(ctx, num, x, y);
                break;
            case "arrow_tri_W":
                set_circle_style(ctx, 1, ccolor);
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
                // case "kakuro":
                //     this.draw_kakuro(ctx, num, x, y, ccolor);
                //     break;
                // case "compass":
                //     this.draw_compass(ctx, num, x, y, ccolor);
                //     break;
            case "star":
                this.draw_star(ctx, num, x, y, loc, ccolor);
                break;
            case "tents":
                this.draw_tents(ctx, num, x, y, ccolor);
                break;
                // case "battleship_B":
                //     set_circle_style(ctx, 2);
                //     this.draw_battleship(ctx, num, x, y, ccolor);
                //     break;
                // case "battleship_G":
                //     set_circle_style(ctx, 3);
                //     ctx.fillStyle = Color.GREY;
                //     this.draw_battleship(ctx, num, x, y);
                //     break;
                // case "battleship_W":
                //     ctx.setLineDash([]);
                //     ctx.lineCap = "butt";
                //     ctx.fillStyle = Color.TRANSPARENTBLACK;
                //     ctx.strokeStyle = Color.BLACK;
                //     ctx.lineWidth = 2;
                //     this.draw_battleship(ctx, num, x, y);
                //     break;
            case "angleloop":
                this.draw_angleloop(ctx, num, x, y, ccolor);
                break;
            case "firefly":
                this.draw_firefly(ctx, num, x, y, ccolor);
                break;
            case "sun_moon":
                this.draw_sun_moon(ctx, num, x, y, loc, ccolor);
                break;
            case "sudokuetc":
                this.draw_sudokuetc(ctx, num, x, y, ccolor);
                break;
            case "polyomino":
                this.draw_polyomino(ctx, num, x, y, ccolor);
                break;
                // case "pencils":
                //     this.draw_pencils(ctx, num, x, y);
                //     break;
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
        }
    }

    draw_framelinesym(ctx, num, x, y, ccolor) {
        var r = 0.32;
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.fillStyle = Color.TRANSPARENTBLACK;
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 3;
        switch (num) {
            case 1:
                set_line_style(ctx, 115, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                set_line_style(ctx, 15, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 3:
                set_line_style(ctx, 16, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 4:
                set_line_style(ctx, 110, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                set_line_style(ctx, 115, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                set_line_style(ctx, 15, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                set_line_style(ctx, 16, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 8:
                set_line_style(ctx, 110, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
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
                set_circle_style(ctx, 10);
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

    draw_degital(ctx, num, x, y, ccolor) {
        set_circle_style(ctx, 2, ccolor);
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
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[1] === 1) {
                w1 = -(z1 + z2);
                w2 = -2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[2] === 1) {
                w1 = z1 + z2;
                w2 = -2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[3] === 1) {
                w1 = z1;
                w2 = 0;
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[4] === 1) {
                w1 = -(z1 + z2);
                w2 = 2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[5] === 1) {
                w1 = z1 + z2;
                w2 = 2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[6] === 1) {
                w1 = z1;
                w2 = 2 * (z1 + z2);
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
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
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = -(z1 + z2);
        w2 = -2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1 + z2;
        w2 = -2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1;
        w2 = 0;
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = -(z1 + z2);
        w2 = 2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1 + z2;
        w2 = 2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1;
        w2 = 2 * (z1 + z2);
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();

        //contents
        this.draw_degital(ctx, num, x, y, ccolor);
    }

    draw_dice(ctx, num, x, y) {
        for (var i = 0; i < 9; i++) {
            if (num[i] === 1) {
                this.draw_circle(ctx, x + (i % 3 - 1) * 0.25 * pu.size, y + ((i / 3 | 0) - 1) * 0.25 * pu.size, 0.09);
            }
        }
    }

    draw_pills(ctx, num, x, y) {
        var r = 0.15;
        ctx.fillStyle = Color.GREY
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
        if (num > 0 && num <= 6) {
            th = this.rotate_theta((num - 1) * 60 - 150);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, r1 * pu.size, w1 * pu.size, r2 * pu.size, w2 * pu.size, r3 * pu.size, w3 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowGP_C(ctx, num, x, y) {
        if (num > 0 && num <= 6) {
            var th = this.rotate_theta((num - 1) * 60 - 150);
            this.draw_circle(ctx, x, y, 0.35);
            this.draw_arrowGP(ctx, num, x + 0.5 * pu.size * Math.cos(th), y + 0.5 * pu.size * Math.sin(th));
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
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowcross(ctx, num, x, y) {
        var w1 = 0.025;
        var w2 = 0.12;
        var len1 = 0.5 * w1; //nemoto
        var len2 = 0.45; //tip
        var ri = -0.18;
        var th;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th = this.rotate_theta(i * 90 - 180);
                ctx.beginPath();
                ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
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
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
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
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowfouredge(ctx, num, x, y) {
        var len1 = 0.5; //nemoto
        var len2 = 0.5;
        var t1 = 0.00;
        var t2 = 0.50;
        var w1 = 0.02;
        var w2 = 0.07;
        var ri = 0.42;
        var th1, th2;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th1 = this.rotate_theta(225 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                ctx.arrow(x + len1 * pu.size * Math.cos(th1 + Math.PI * t1) + 0.1 * pu.size * Math.cos(th2), y + len1 * pu.size * Math.sin(th1 + Math.PI * t1) + 0.1 * pu.size * Math.sin(th2), x + len2 * pu.size * Math.cos(th1 + Math.PI * t2) - 0.05 * pu.size * Math.cos(th2), y + len2 * pu.size * Math.sin(th1 + Math.PI * t2) - 0.05 * pu.size * Math.sin(th2), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                ctx.fill();
                ctx.stroke();
            }
        }
        for (var i = 4; i < 8; i++) {
            if (num[i] === 1) {
                th1 = this.rotate_theta(225 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                ctx.arrow(x + len2 * pu.size * Math.cos(th1 + Math.PI * t2) - 0.1 * pu.size * Math.cos(th2), y + len2 * pu.size * Math.sin(th1 + Math.PI * t2) - 0.1 * pu.size * Math.sin(th2), x + len1 * pu.size * Math.cos(th1 + Math.PI * t1) + 0.05 * pu.size * Math.cos(th2), y + len1 * pu.size * Math.sin(th1 + Math.PI * t1) + 0.05 * pu.size * Math.sin(th2), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                ctx.fill();
                ctx.stroke();
            }
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

    draw_star(ctx, num, x, y, loc, ccolor) {
        if (parseInt(loc % 2) === 0) { // Even numbers are octa shape, odd numbers are square shape
            var r1 = 0.5;
            var r = 0.5;
        } else {
            var r = 0.3;
            var r1 = 0.25;
        }
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
        var r1 = 0.25,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -45, 4: 45, 5: -225, 6: 225, 7: 135, 8: 180, 9: 0 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                var th = this.rotate_theta(thMap[num]);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
            case 0:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 4) {
            var r1 = 0.24,
                r2 = 0.22,
                alp1 = 0.4,
                alp2 = 0.5,
                alp3 = 0.6;
        } else {
            var r1 = 0.45,
                r2 = 0.43,
                alp1 = 0.6,
                alp2 = 0.7,
                alp3 = 0.8;
        }
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
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, alp2 * pu.size, this.size * alp3);
                break;
            case 4:
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, alp2 * pu.size, this.size * alp3);
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

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }
}

class Puzzle_tetrakis_square extends Puzzle_truncated_square {
    constructor(nx, ny, size) {
        // Board Information
        super("tetrakis_square");
        this.gridtype = 'tetrakis_square';
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny * 2 + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 6;
        this.height0 = this.ny;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var ny = this.ny0;
        var r;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        adjacent = [];
        surround = [];
        neighbor = [];
        //center
        for (var i = 0; i < nx; i++) {
            for (var j = 0; j < ny; j++) {
                k0 = k;
                type = 1;
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                point[k] = new Point(((i * 2 + (j % 2)) + 0.5) * this.size, (j + 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 0);
                k++;
                point[k] = new Point(((i * 2 + (j % 2)) + 1.5) * this.size, (j + 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;

                type = 0;
                r = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
                for (var m = 0; m < 8; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 45 + 22.5)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 45 + 22.5)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]); //pushやspliceだと全てのpointが更新されてしまう
                    point[k].surround = point[k].surround.concat([k0]);
                    k++;
                }
                r = Math.sqrt(2) - 1;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 45)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 45)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    k++;
                }

                //type = 2-4;
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 8; m++) {
                    if (m % 2 === 0) { type = 2; } else { type = 3; }
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 8 * m), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 8 * m), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]); //pushやspliceだとpointが全て更新されてしまう
                    if (m === 0) {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 5].neighbor = point[k - 5].neighbor.concat([k]);
                    } else {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 13].neighbor = point[k - 13].neighbor.concat([k]);
                    }
                    k++;
                }
                type = 2;
                r = 1 - 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 4 * m), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 4 * m), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 9].neighbor = point[k - 9].neighbor.concat([k]);
                    } else {
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                        point[k - 13].neighbor = point[k - 13].neighbor.concat([k]);
                    }
                    k++;
                }
                type = 4;
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 4 * m), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 4 * m), type, adjacent, surround, use, neighbor);
                    k++;
                }
            }
        }
        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                    }
                    for (var n = 0; n < point[j].surround.length; n++) { //削除された点のsurroundを移し替え
                        if (point[i].surround.indexOf(point[j].surround[n]) === -1) {
                            point[i].surround = point[i].surround.concat([point[j].surround[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    delete point[j];
                    //置換ここまで
                }
            }
        }
        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        //use更新
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            for (var k = 0; k < point[i].neighbor.length; k++) {
                point[point[i].neighbor[k]].use = 1;
            }
            for (var k = 0; k < point[i].surround.length; k++) {
                point[point[i].surround[k]].use = 1;
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 3, 4];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [5];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [6];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 3, 4];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [3, 4];
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
                    type = [3, 4];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
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
                    case "yajilin":
                        type = [0, 3, 4];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 3, 4];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 3, 4];
                        break;
                    case "mines":
                        type = [0, 1, 3, 4];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 1) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 1 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 45 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -45);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 45 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +45);
        this.redraw();
    }


    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_frameBold();
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_frameBold();
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_symbol("pu_q", 2);
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
        }
    }

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }

    key_arrow(key_code, ctrl_key = false) {
        var a, b, c;
        b = [0, 1, 2, 3];
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
        if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol") {
            console.log(this.cursol);
            // switch (c) {
            //     case 0:
            //         a = this.cursol - 1;
            //         if (this.point[a].use === 1) { this.cursol = a; }
            //         break;
            //     case 1:
            //         a = this.cursol - this.nx0;
            //         if (this.point[a].use === 1) { this.cursol = a; }
            //         break;
            //     case 2:
            //         a = this.cursol + 1;
            //         if (this.point[a].use === 1) { this.cursol = a; }
            //         break;
            //     case 3:
            //         a = this.cursol + this.nx0;
            //         if (this.point[a].use === 1) { this.cursol = a; }
            //         break;
            // }
        }
        this.redraw();
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
            case 5:
            case 6:
            case 7:
            case 8:
                var th = this.rotate_theta((num - 1) * 45 - 180);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
            case 9:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
        var r1 = 0.22,
            r2 = 0.20;
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
                set_font_style(ctx, 0.4 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, 0.5 * pu.size, this.size * 0.6);
                break;
            case 4:
                set_font_style(ctx, 0.4 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, 0.5 * pu.size, this.size * 0.6);
                break;
        }
    }

    draw_star(ctx, num, x, y, loc, ccolor) {
        var r1 = 0.25;
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
            case 0:
                var r = 0.25;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }
}

class Puzzle_snub_square extends Puzzle_truncated_square {
    constructor(nx, ny, size) {
        //盤面情報
        super("snub_square");
        this.gridtype = 'snub_square';
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 6;
        this.height0 = this.ny + 6;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var ny = this.ny0;
        var r;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        adjacent = [];
        surround = [];
        neighbor = [];
        //center
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                var offsetx = i * (1 + 0.5 * Math.sqrt(3)) + j * 0.5 + 0.5;
                var offsety = j * (1 + 0.5 * Math.sqrt(3)) - i * 0.5 + 0.5

                k0 = k;
                type = 0;
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                point[k] = new Point(offsetx * this.size, (offsety) * this.size, type, adjacent, surround, use, neighbor, [], 0);
                k++;
                point[k] = new Point((offsetx + 0.5 + Math.sqrt(3) / 6) * this.size, (offsety) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx) * this.size, (offsety + 0.5 + Math.sqrt(3) / 6) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.5) * this.size, (offsety + 0.5 + Math.sqrt(3) / 3) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.75 + Math.sqrt(3) / 4) * this.size, (offsety + 0.25 + Math.sqrt(3) / 4) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.5 + Math.sqrt(3) / 3) * this.size, (offsety - 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;

                type = 1;
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 45)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 45)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]); //pushやspliceだと全てのpointが更新されてしまう
                    point[k].surround = point[k].surround.concat([k0]);
                    k++;
                }
                r = Math.sqrt(3) / 3;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    k++;
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 90)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 90)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].surround = point[k0 + 2].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 2]);
                    k++;
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 30)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].surround = point[k0 + 3].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 3]);
                    k++;
                }
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 15)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 15)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].surround = point[k0 + 4].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 4]);
                    k++;
                }
                r = Math.sqrt(3) / 3;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 60)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].surround = point[k0 + 5].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 5]);
                    k++;
                }

                type = 2;
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 0)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 17].neighbor = point[k - 17].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    } else {
                        point[k - 11].neighbor = point[k - 11].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    }
                    k++;
                }
                r = Math.sqrt(3) / 6;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 60)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 30)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].neighbor = point[k0 + 2].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 90)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 90)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].neighbor = point[k0 + 3].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 60)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].neighbor = point[k0 + 4].neighbor.concat([k]);
                    if (m === 3) {
                        point[k - 17].neighbor = point[k - 17].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    } else {
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    }
                    k++;
                }
                r = Math.sqrt(3) / 6;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].neighbor = point[k0 + 5].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                }
            }
        }
        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                    }
                    for (var n = 0; n < point[j].surround.length; n++) { //削除された点のsurroundを移し替え
                        if (point[i].surround.indexOf(point[j].surround[n]) === -1) {
                            point[i].surround = point[i].surround.concat([point[j].surround[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    delete point[j];
                    //置換ここまで
                }
            }
        }
        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        //use更新
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            for (var k = 0; k < point[i].neighbor.length; k++) {
                point[point[i].neighbor[k]].use = 1;
            }
            for (var k = 0; k < point[i].surround.length; k++) {
                point[point[i].surround[k]].use = 1;
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [5];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [6];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 1) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 1 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -30);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +30);
        this.redraw();
    }


    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
        }
    }

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }

    draw_star(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 3) {
            var r1 = 0.2;
            var r = 0.2;
        } else {
            var r1 = 0.4;
            var r = 0.4;
        }
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
            case 0:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 3) {
            var r1 = 0.26,
                r2 = 0.24,
                alp1 = 0.4,
                alp2 = 0.5,
                alp3 = 0.6;
        } else {
            var r1 = 0.36,
                r2 = 0.34,
                alp1 = 0.5,
                alp2 = 0.6,
                alp3 = 0.7;
        }
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
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, alp2 * pu.size, this.size * alp3);
                break;
            case 4:
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, alp2 * pu.size, this.size * alp3);
                break;
        }
    }

    draw_firefly(ctx, num, x, y, ccolor) {
        var r1 = 0.25,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -30, 4: 60, 5: 150, 6: 240, 7: 210, 8: 180, 9: 0, 0: 30 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                var th = this.rotate_theta(thMap[num]);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
        }
    }
}

class Puzzle_cairo_pentagonal extends Puzzle_truncated_square {
    constructor(nx, ny, size) {
        //盤面情報
        super("cairo_pentagonal");
        this.gridtype = "cairo_pentagonal";
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 6;
        this.height0 = this.ny + 6;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var ny = this.ny0;

        var r;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        adjacent = [];
        surround = [];
        neighbor = [];
        //center
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                var offsetx = i * (1 + 0.5 * Math.sqrt(3)) + j * 0.5 + 0.5;
                var offsety = j * (1 + 0.5 * Math.sqrt(3)) - i * 0.5 + 0.5

                k0 = k;
                type = 1;
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                point[k] = new Point(offsetx * this.size, (offsety) * this.size, type, adjacent, surround, use, neighbor, [], 0);
                k++;
                point[k] = new Point((offsetx + 0.5 + Math.sqrt(3) / 6) * this.size, (offsety) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx) * this.size, (offsety + 0.5 + Math.sqrt(3) / 6) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.5) * this.size, (offsety + 0.5 + Math.sqrt(3) / 3) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.75 + Math.sqrt(3) / 4) * this.size, (offsety + 0.25 + Math.sqrt(3) / 4) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.5 + Math.sqrt(3) / 3) * this.size, (offsety - 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;

                type = 0;
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 45)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 45)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]); //pushやspliceだと全てのpointが更新されてしまう
                    point[k].surround = point[k].surround.concat([k0]);
                    k++;
                }
                r = Math.sqrt(3) / 3;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    k++;
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 90)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 90)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].surround = point[k0 + 2].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 2]);
                    k++;
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 30)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].surround = point[k0 + 3].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 3]);
                    k++;
                }
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    if (m === 0) { var type2 = 1; } else { var type2 = 0; }
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 15)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 15)), type, adjacent, surround, use, neighbor, [], type2);
                    point[k0 + 4].surround = point[k0 + 4].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 4]);
                    k++;
                }
                r = Math.sqrt(3) / 3;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 60)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].surround = point[k0 + 5].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 5]);
                    k++;
                }

                type = 2;
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 0)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 17].neighbor = point[k - 17].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    } else {
                        point[k - 11].neighbor = point[k - 11].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    }
                    k++;
                }
                r = Math.sqrt(3) / 6;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 60)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 30)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].neighbor = point[k0 + 2].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 90)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 90)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].neighbor = point[k0 + 3].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 60)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].neighbor = point[k0 + 4].neighbor.concat([k]);
                    if (m === 3) {
                        point[k - 17].neighbor = point[k - 17].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    } else {
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                    }
                    k++;
                }
                r = Math.sqrt(3) / 6;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].neighbor = point[k0 + 5].neighbor.concat([k]);
                    if (m === 2) {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                    } else {
                        point[k - 20].neighbor = point[k - 20].neighbor.concat([k]);
                        point[k - 19].neighbor = point[k - 19].neighbor.concat([k]);
                    }
                    k++;
                }
            }
        }
        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                    }
                    for (var n = 0; n < point[j].surround.length; n++) { //削除された点のsurroundを移し替え
                        if (point[i].surround.indexOf(point[j].surround[n]) === -1) {
                            point[i].surround = point[i].surround.concat([point[j].surround[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    delete point[j];
                    //置換ここまで
                }
            }
        }
        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        //use更新
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            for (var k = 0; k < point[i].neighbor.length; k++) {
                point[point[i].neighbor[k]].use = 1;
            }
            for (var k = 0; k < point[i].surround.length; k++) {
                point[point[i].surround[k]].use = 1;
            }
        }
        //surround並び替え
        var s0;
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            if (point[i].type2 === 0) {
                s0 = point[i].surround[2];
                point[i].surround[2] = point[i].surround[4];
                point[i].surround[4] = s0;
            } else {
                s0 = point[i].surround[3];
                point[i].surround[3] = point[i].surround[4];
                point[i].surround[4] = s0;
                point[i].type2 = 0;
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [5];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [6];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 1) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 1 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -30);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +30);
        this.redraw();
    }


    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
        }
    }

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }

    draw_star(ctx, num, x, y, loc, ccolor) {
        var r1 = 0.4
        var r2 = 0.382 * r1;
        var r = 0.4;
        switch (num) {
            case 1:
                ctx.fillStyle = ccolor || Color.WHITE;
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_star0(ctx, x, y + 0.03 * pu.size, r1, r2, 5);
                break;
            case 0:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }

    draw_firefly(ctx, num, x, y, ccolor) {
        var r1 = 0.25,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -30, 4: 60, 5: 150, 6: 240, 7: 210, 8: 180, 9: 0, 0: 30 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                var th = this.rotate_theta(thMap[num]);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
        }
    }
}

class Puzzle_iso extends Puzzle_truncated_square {
    constructor(nx, ny, size) {
        //盤面情報
        super("iso");
        this.gridtype = 'iso';
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx;
        this.ny0 = this.ny;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 6;
        this.height0 = this.ny + 6;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 6,
            "arrow_cross": 6,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
        document.getElementById("sub_lineE2_lb").style.display = "inline-block";
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var r1, r2, angle;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        adjacent = [];
        surround = [];
        neighbor = [];
        use = 1;
        var offsetx, offsety;
        //center
        for (var j = 0; j < nx; j++) {
            for (var i = 0; i < nx; i++) {

                k0 = k;
                type = 0;
                offsetx = i * 0.5 * Math.sqrt(3) - j * 0.5 * Math.sqrt(3);
                offsety = -i * 0.5 - j * 0.5;
                point[k] = new Point((offsetx) * this.size, (offsety - 0.5) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                offsetx = -j * 0.5 * Math.sqrt(3);
                offsety = i - j * 0.5;
                point[k] = new Point((offsetx - Math.sqrt(3) / 4) * this.size, (offsety + 0.25) * this.size, type, adjacent, surround, use, neighbor, [], 2);
                k++;
                offsetx = j * 0.5 * Math.sqrt(3);
                offsety = i - j * 0.5;
                point[k] = new Point((offsetx + Math.sqrt(3) / 4) * this.size, (offsety + 0.25) * this.size, type, adjacent, surround, use, neighbor, [], 3);
                k++;

                type = 1;
                r1 = 0.5 * Math.sqrt(3);
                r2 = 0.5;
                for (var m = 0; m < 2; m++) {
                    point[k] = new Point(point[k0].x + r1 * this.size * Math.cos(2 * Math.PI / 360 * (m * 180 + 0)), point[k0].y + r1 * this.size * Math.sin(2 * Math.PI / 360 * (m * 180 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0]);
                    if (m === 0) {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k + 2]);
                    } else {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k - 2]);
                    }
                    k++;
                    point[k] = new Point(point[k0].x + r2 * this.size * Math.cos(2 * Math.PI / 360 * (m * 180 + 90)), point[k0].y + r2 * this.size * Math.sin(2 * Math.PI / 360 * (m * 180 + 90)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0]);
                    if (m === 0) {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k + 2]);
                    } else {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k - 2]);
                    }
                    k++;
                }
                for (var m = 0; m < 2; m++) {
                    point[k] = new Point(point[k0 + 1].x + r1 * this.size * Math.cos(2 * Math.PI / 360 * (m * 180 + 60)), point[k0 + 1].y + r1 * this.size * Math.sin(2 * Math.PI / 360 * (m * 180 + 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    if (m === 0) {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k + 2]);
                    } else {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k - 2]);
                    }
                    k++;
                    point[k] = new Point(point[k0 + 1].x + r2 * this.size * Math.cos(2 * Math.PI / 360 * (m * 180 + 150)), point[k0 + 1].y + r2 * this.size * Math.sin(2 * Math.PI / 360 * (m * 180 + 150)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    if (m === 0) {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k + 2]);
                    } else {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k - 2]);
                    }
                    k++;
                }
                for (var m = 0; m < 2; m++) {
                    point[k] = new Point(point[k0 + 2].x + r1 * this.size * Math.cos(2 * Math.PI / 360 * (m * 180 - 60)), point[k0 + 2].y + r1 * this.size * Math.sin(2 * Math.PI / 360 * (m * 180 - 60)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].surround = point[k0 + 2].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 2]);
                    if (m === 0) {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k + 2]);
                    } else {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k - 2]);
                    }
                    k++;
                    point[k] = new Point(point[k0 + 2].x + r2 * this.size * Math.cos(2 * Math.PI / 360 * (m * 180 + 30)), point[k0 + 2].y + r2 * this.size * Math.sin(2 * Math.PI / 360 * (m * 180 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].surround = point[k0 + 2].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 2]);
                    if (m === 0) {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k + 2]);
                    } else {
                        point[k].adjacent_dia = point[k].adjacent_dia.concat([k - 2]);
                    }
                    k++;
                }

                type = 2;
                r1 = 0.5;
                angle = [30, 150, 210, 330];
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0].x + r1 * this.size * Math.cos(2 * Math.PI / 360 * angle[m]), point[k0].y + r1 * this.size * Math.sin(2 * Math.PI / 360 * angle[m]), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]);
                    if (m === 3) {
                        point[k - 15].neighbor = point[k - 15].neighbor.concat([k]);
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                    } else {
                        point[k - 11].neighbor = point[k - 11].neighbor.concat([k]);
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                    }
                    k++;
                }
                angle = [30, 90, 210, 270];
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r1 * this.size * Math.cos(2 * Math.PI / 360 * angle[m]), point[k0 + 1].y + r1 * this.size * Math.sin(2 * Math.PI / 360 * angle[m]), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 9].neighbor = point[k - 9].neighbor.concat([k]);
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                    } else {
                        point[k - 13].neighbor = point[k - 13].neighbor.concat([k]);
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                    }
                    k++;
                }
                angle = [-30, 90, 150, 270];
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 2].x + r1 * this.size * Math.cos(2 * Math.PI / 360 * angle[m]), point[k0 + 2].y + r1 * this.size * Math.sin(2 * Math.PI / 360 * angle[m]), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].neighbor = point[k0 + 2].neighbor.concat([k]);
                    if (m === 3) {
                        point[k - 15].neighbor = point[k - 15].neighbor.concat([k]);
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                    } else {
                        point[k - 11].neighbor = point[k - 11].neighbor.concat([k]);
                        point[k - 12].neighbor = point[k - 12].neighbor.concat([k]);
                    }
                    k++;
                }

            }
        }

        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                        for (var n = 0; n < point[k].adjacent_dia.length; n++) {
                            if (point[k].adjacent_dia[n] === j) {
                                point[k].adjacent_dia.splice(n, 1, i);
                            }
                        }
                    }
                    for (var n = 0; n < point[j].surround.length; n++) { //削除された点のsurroundを移し替え
                        if (point[i].surround.indexOf(point[j].surround[n]) === -1) {
                            point[i].surround = point[i].surround.concat([point[j].surround[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].adjacent_dia.length; n++) { //削除された点のadjacent_diaを移し替え
                        if (point[i].adjacent_dia.indexOf(point[j].adjacent_dia[n]) === -1) {
                            point[i].adjacent_dia = point[i].adjacent_dia.concat([point[j].adjacent_dia[n]]);
                        }
                    }
                    delete point[j];
                    //置換ここまで
                }
            }
        }
        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [5];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [6];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 1) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 1 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -30);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +30);
        this.redraw();
    }

    direction_arrow8(x, y, x0, y0) {
        var angle = Math.atan2(y - y0, x - x0) * 360 / 2 / Math.PI + 180;
        if (this.reflect[0] === -1) { angle = (180 - angle + 360) % 360; }
        if (this.reflect[1] === -1) { angle = (360 - angle + 360) % 360; }
        angle = (angle - this.theta + 360) % 360;
        angle -= 180;
        var a;
        if (angle < -120) {
            a = 0;
        } else if (angle > -120 && angle < -60) {
            a = 1;
        } else if (angle > -60 && angle < 0) {
            a = 2;
        } else if (angle > 0 && angle < 60) {
            a = 3;
        } else if (angle > 60 && angle < 120) {
            a = 4;
        } else if (angle > 120) {
            a = 5;
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
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_frameBold();
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_symbol("pu_q", 2);
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
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
                var i3;
                //search neighbor
                for (var j = 0; j < 4; j++) {
                    if (this.point[i2].neighbor.indexOf(this.point[i1].neighbor[j]) != -1) {
                        i3 = this.point[i1].neighbor[j];
                    }
                }
                this.ctx.beginPath();
                if (this[pu].line[i] === 40) {
                    var r = 0.6;
                    var x1 = r * this.point[i1].x + (1 - r) * this.point[i3].x;
                    var y1 = r * this.point[i1].y + (1 - r) * this.point[i3].y;
                    var x2 = (1 - r) * this.point[i3].x + r * this.point[i2].x;
                    var y2 = (1 - r) * this.point[i3].y + r * this.point[i2].y;
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(this.point[i3].x, this.point[i3].y);
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
                    this.ctx.lineTo(this.point[i3].x, this.point[i3].y);
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

    draw_number(pu) {
        /*number*/
        for (var i in this[pu].number) {
            switch (this[pu].number[i][2]) {
                case "1": //normal
                    this.draw_numbercircle_iso(pu, i, 0.41);
                    set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], this.point[i].x, this.point[i].y + 0.06 * this.size, this.size * 0.8);
                    break;
                case "2": //arrow
                    var arrowlength = 0.7;
                    this.draw_numbercircle_iso(pu, i, 0.42);
                    set_font_style(this.ctx, 0.65 * this.size.toString(10), this[pu].number[i][1]);
                    var direction = {
                        "_0": 150,
                        "_1": 90,
                        "_2": 30,
                        "_3": 330,
                        "_4": 270,
                        "_5": 210
                    }
                    direction = (direction[this[pu].number[i][0].slice(-2)] - this.theta + 360) % 360;
                    if (this.reflect[0] === -1) { direction = (180 - direction + 360) % 360; }
                    if (this.reflect[1] === -1) { direction = (360 - direction + 360) % 360; }
                    switch (direction) {
                        case 120:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x - 0.1 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (arrowlength * 0.25 + 0.15) * this.size, this.point[i].y + (arrowlength * 0.25 * Math.sqrt(3) - 0.15) * this.size,
                                this.point[i].x + (-arrowlength * 0.25 + 0.15) * this.size, this.point[i].y + (-arrowlength * 0.25 * Math.sqrt(3) - 0.15) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 300:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x - 0.1 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (-arrowlength * 0.25 + 0.2) * this.size, this.point[i].y + (-arrowlength * 0.25 * Math.sqrt(3) - 0.1) * this.size,
                                this.point[i].x + (arrowlength * 0.25 + 0.2) * this.size, this.point[i].y + (arrowlength * 0.25 * Math.sqrt(3) - 0.1) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 60:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x + 0.1 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x - (arrowlength * 0.25 + 0.15) * this.size, this.point[i].y + (arrowlength * 0.25 * Math.sqrt(3) - 0.15) * this.size,
                                this.point[i].x - (-arrowlength * 0.25 + 0.15) * this.size, this.point[i].y + (-arrowlength * 0.25 * Math.sqrt(3) - 0.15) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 240:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x + 0.1 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x - (-arrowlength * 0.25 + 0.2) * this.size, this.point[i].y + (-arrowlength * 0.25 * Math.sqrt(3) - 0.1) * this.size,
                                this.point[i].x - (arrowlength * 0.25 + 0.2) * this.size, this.point[i].y + (arrowlength * 0.25 * Math.sqrt(3) - 0.1) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 180:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x + 0.0 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (arrowlength * 0.5 + 0.0) * this.size, this.point[i].y + (arrowlength * 0.0 - 0.3) * this.size,
                                this.point[i].x + (-arrowlength * 0.5 + 0.0) * this.size, this.point[i].y + (-arrowlength * 0.0 - 0.3) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 0:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x + 0.0 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x - (arrowlength * 0.5 + 0.0) * this.size, this.point[i].y + (arrowlength * 0.0 - 0.3) * this.size,
                                this.point[i].x - (-arrowlength * 0.5 + 0.0) * this.size, this.point[i].y + (-arrowlength * 0.0 - 0.3) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 150:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x - 0.0 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (arrowlength * 0.25 * Math.sqrt(3) + 0.1) * this.size, this.point[i].y + (arrowlength * 0.25 - 0.2) * this.size,
                                this.point[i].x + (-arrowlength * 0.25 * Math.sqrt(3) + 0.1) * this.size, this.point[i].y + (-arrowlength * 0.25 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 330:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x - 0.0 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (-arrowlength * 0.25 * Math.sqrt(3) + 0.15) * this.size, this.point[i].y + (-arrowlength * 0.25 - 0.15) * this.size,
                                this.point[i].x + (arrowlength * 0.25 * Math.sqrt(3) + 0.15) * this.size, this.point[i].y + (arrowlength * 0.25 - 0.15) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 30:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x + 0.0 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x - (arrowlength * 0.25 * Math.sqrt(3) + 0.1) * this.size, this.point[i].y + (arrowlength * 0.25 - 0.2) * this.size,
                                this.point[i].x - (-arrowlength * 0.25 * Math.sqrt(3) + 0.1) * this.size, this.point[i].y + (-arrowlength * 0.25 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 210:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x + 0.0 * this.size, this.point[i].y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x - (-arrowlength * 0.25 * Math.sqrt(3) + 0.15) * this.size, this.point[i].y + (-arrowlength * 0.25 - 0.15) * this.size,
                                this.point[i].x - (arrowlength * 0.25 * Math.sqrt(3) + 0.15) * this.size, this.point[i].y + (arrowlength * 0.25 - 0.15) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 90:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x - 0.1 * this.size, this.point[i].y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (arrowlength * 0.0 + 0.25) * this.size, this.point[i].y + (arrowlength * 0.5 - 0.0) * this.size,
                                this.point[i].x + (-arrowlength * 0.0 + 0.25) * this.size, this.point[i].y + (-arrowlength * 0.5 - 0.0) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 270:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), this.point[i].x - 0.1 * this.size, this.point[i].y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(this.point[i].x + (arrowlength * 0.0 + 0.25) * this.size, this.point[i].y + (-arrowlength * 0.5 - 0.0) * this.size,
                                this.point[i].x + (-arrowlength * 0.0 + 0.25) * this.size, this.point[i].y + (arrowlength * 0.5 - 0.0) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        default:
                            set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                            this.ctx.text(this[pu].number[i][0], this.point[i].x, this.point[i].y + 0.06 * this.size, this.size * 0.8);
                            break;
                    }
                    break;
                case "4": //tapa
                    this.draw_numbercircle_iso(pu, i, 0.44);
                    if (this[pu].number[i][0].length === 1) {
                        set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0], this.point[i].x, this.point[i].y + 0.06 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 2) {
                        set_font_style(this.ctx, 0.48 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), this.point[i].x - 0.16 * this.size, this.point[i].y - 0.15 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), this.point[i].x + 0.18 * this.size, this.point[i].y + 0.19 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 3) {
                        set_font_style(this.ctx, 0.45 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), this.point[i].x - 0.22 * this.size, this.point[i].y - 0.14 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), this.point[i].x + 0.24 * this.size, this.point[i].y - 0.05 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(2, 3), this.point[i].x - 0.0 * this.size, this.point[i].y + 0.3 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 4) {
                        set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), this.point[i].x - 0.0 * this.size, this.point[i].y - 0.22 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), this.point[i].x - 0.26 * this.size, this.point[i].y + 0.04 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(2, 3), this.point[i].x + 0.26 * this.size, this.point[i].y + 0.04 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(3, 4), this.point[i].x - 0.0 * this.size, this.point[i].y + 0.3 * this.size, this.size * 0.8);
                    }
                    break;
                case "5": //small
                    this.draw_numbercircle_iso(pu, i, 0.17);
                    set_font_style(this.ctx, 0.25 * this.size.toString(10), this[pu].number[i][1]);
                    let lines = this[pu].number[i][0].split('\\n');
                    if (lines.length == 1) {
                        this.ctx.text(this[pu].number[i][0], this.point[i].x, this.point[i].y + 0.02 * this.size, this.size * 0.8);
                    } else {
                        let offset_x, offset_y;
                        let cube_side = this.find_cube_side(i);
                        switch (cube_side) {
                            case "top":
                                offset_y = 0.3 * this.size * 0.8;
                                for (let j = 0; j < lines.length; j++) {
                                    if (lines[j]) {
                                        this.ctx.text(lines[j], this.point[i].x, this.point[i].y + 0.02 * this.size + j * offset_y, this.size * 0.8);
                                    }
                                }
                                break;
                            case "left":
                                offset_x = 0.23 * this.size * 0.8;
                                offset_y = 0.4 * this.size * 0.8;
                                for (let j = 0; j < lines.length; j++) {
                                    if (lines[j]) {
                                        this.ctx.text(lines[j], this.point[i].x + j * offset_x, this.point[i].y + 0.02 * this.size + j * offset_y, this.size * 0.8);
                                    }
                                }
                                break;
                            case "right":
                                offset_x = 0.25 * this.size * 0.8;
                                offset_y = 0.15 * this.size * 0.8;
                                for (let j = 0; j < lines.length; j++) {
                                    if (lines[j]) {
                                        this.ctx.text(lines[j], this.point[i].x + j * offset_x, this.point[i].y + 0.02 * this.size + j * offset_y, this.size * 0.8);
                                    }
                                }
                                break;
                        }
                    }
                    break;
                case "6": //medium
                    this.draw_numbercircle_iso(pu, i, 0.25);
                    set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], this.point[i].x, this.point[i].y + 0.03 * this.size, this.size * 0.8);
                    break;
                case "10": //big
                    this.draw_numbercircle_iso(pu, i, 0.33);
                    set_font_style(this.ctx, 0.55 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], this.point[i].x, this.point[i].y + 0.03 * this.size, this.size * 0.8);
                    break;
                case "7": //sudoku
                    this.draw_numbercircle_iso(pu, i, 0.41);
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
                        this.ctx.text((pos + 1).toString(), this.point[i].x, this.point[i].y + 0.06 * this.size, this.size * 0.8);
                    } else {
                        set_font_style(this.ctx, 0.3 * this.size.toString(10), this[pu].number[i][1]);
                        for (var j = 0; j < 9; j++) {
                            if (this[pu].number[i][0][j] === 1) {
                                this.ctx.text((j + 1).toString(), this.point[i].x + ((j % 3 - 1) * 0.25) * this.size, this.point[i].y + (((j / 3 | 0) - 1) * 0.25 + 0.01) * this.size);
                            }
                        }
                    }
                    break;
                case "8": //long
                    if (this[pu].number[i][1] === 5) {
                        set_font_style(this.ctx, 0.5 * this.size.toString(10), this[pu].number[i][1]);
                        set_circle_style(this.ctx, 7);
                        this.ctx.fillRect(this.point[i].x - 0.2 * this.size, this.point[i].y - 0.25 * this.size, this.ctx.measureText(this[pu].number[i][0]).width, 0.5 * this.size);
                    }
                    set_font_style(this.ctx, 0.5 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.textAlign = "left";
                    this.ctx.text(this[pu].number[i][0], this.point[i].x - 0.2 * this.size, this.point[i].y);
                    break;
            }
        }

        for (var i in this[pu].numberS) {
            if (this[pu].numberS[i][1] === 5) {
                set_circle_style(this.ctx, 7);
                this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, 0.15);
            } else if (this[pu].numberS[i][1] === 6) {
                set_circle_style(this.ctx, 1);
                this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, 0.15);
            } else if (this[pu].numberS[i][1] === 7) {
                set_circle_style(this.ctx, 2);
                this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, 0.15);
            }
            if (true) {
                set_font_style(this.ctx, 0.26 * this.size.toString(10), this[pu].numberS[i][1]);
                this.ctx.textAlign = "center";
                this.ctx.text(this[pu].numberS[i][0], this.point[i].x, this.point[i].y + 0.03 * this.size, 0.3 * this.size);
            }
        }
    }

    find_cube_side(i) {
        let surround = this.point[i].surround;
        let top = 0,
            left = 0,
            right = 0;
        for (let j = 0; j < surround.length; j++) {
            if (surround[j] % 27 === 0) {
                top += 1;
            } else if (surround[j] % 27 === 1) {
                left += 1;
            } else if (surround[j] % 27 === 2) {
                right += 1;
            }
        }
        if (right > 0) {
            return "right";
        } else if (left > 0) {
            return "left";
        } else {
            return "top";
        }
    }

    draw_cross(ctx, num, x, y) {
        for (var i = 0; i < 6; i++) {
            if (num[i] === 1) {
                var th = this.rotate_theta(i * 60 - 150);
                ctx.beginPath();
                ctx.moveTo(x + ctx.lineWidth * 0.3 * Math.cos(th), y + ctx.lineWidth * 0.3 * Math.sin(th));
                ctx.lineTo(x - 0.5 * pu.size * Math.cos(th), y - 0.5 * pu.size * Math.sin(th));
                ctx.stroke();
            }
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
            case 5:
            case 6:
                ctx.beginPath();
                th = this.rotate_theta((num - 1) * 60 + 75);
                ctx.moveTo(x + len * Math.sqrt(2) * pu.size * Math.cos(th), y + len * Math.sqrt(2) * pu.size * Math.sin(th));
                th = this.rotate_theta((num - 1) * 60 + 210);
                ctx.lineTo(x + len * pu.size * Math.cos(th), y + len * pu.size * Math.sin(th));
                th = this.rotate_theta((num - 1) * 60 + 345);
                ctx.lineTo(x + len * Math.sqrt(2) * pu.size * Math.cos(th), y + len * Math.sqrt(2) * pu.size * Math.sin(th));
                ctx.fill();
                ctx.stroke();
                break;
        }
    }

    draw_arrow(ctx, num, x, y, len1, len2, w1, w2, ri) {
        var th;
        if (num > 0 && num <= 6) {
            th = this.rotate_theta((num - 1) * 60 - 150);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowcross(ctx, num, x, y) {
        var w1 = 0.025;
        var w2 = 0.12;
        var len1 = 0.5 * w1; //nemoto
        var len2 = 0.45; //tip
        var ri = -0.18;
        var th;
        for (var i = 0; i < 6; i++) {
            if (num[i] === 1) {
                th = this.rotate_theta(i * 60 - 150);
                ctx.beginPath();
                ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
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
        for (var i = 0; i < 6; i++) {
            if (num[i] === 1) {
                this.draw_arrow(ctx, i + 1, x, y, len1, len2, w1, w2, ri);
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

    draw_star(ctx, num, x, y, loc, ccolor) {
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

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
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
                set_font_style(ctx, 0.5 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, 0.6 * pu.size, this.size * 0.7);
                break;
            case 4:
                set_font_style(ctx, 0.5 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, 0.6 * pu.size, this.size * 0.7);
                break;
        }
    }

    draw_firefly(ctx, num, x, y, ccolor) {
        var r1 = 0.36,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -30, 4: 30, 5: -210, 6: 210, 7: 150 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                var th = this.rotate_theta(thMap[num]);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
            case 8:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
        }
    }
}

class Puzzle_rhombitrihexagonal extends Puzzle_truncated_square {
    constructor(nx, ny, size) {
        //盤面情報
        super("rhombitrihexagonal");
        this.gridtype = 'rhombitrihexagonal';
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 6;
        this.height0 = this.ny + 6;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var ny = this.ny0;
        var r;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        var adjacent = [];
        var surround = [];
        var neighbor = [];
        //center
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                var offsetx = i * (1.5 + 0.5 * Math.sqrt(3)) + 0.5;
                var offsety = j * (1 + Math.sqrt(3)) - (i % 2) * (0.5 + 0.5 * Math.sqrt(3)) + 0.5;

                k0 = k;
                type = 0;
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                point[k] = new Point(offsetx * this.size, (offsety) * this.size, type, adjacent, surround, use, neighbor, [], 0);
                k++;
                point[k] = new Point((offsetx) * this.size, (offsety - 0.5 - 0.5 * Math.sqrt(3)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.5 + Math.sqrt(3) / 6) * this.size, (offsety - 0.5 - 0.5 * Math.sqrt(3)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx - 0.5 - Math.sqrt(3) / 6) * this.size, (offsety - 0.5 - 0.5 * Math.sqrt(3)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 1 + Math.sqrt(2) * 0.5 * Math.cos(2 * Math.PI / 360 * 75)) * this.size, (offsety - Math.sqrt(2) * 0.5 * Math.sin(2 * Math.PI / 360 * 75)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx - 1 - Math.sqrt(2) * 0.5 * Math.cos(2 * Math.PI / 360 * 75)) * this.size, (offsety - Math.sqrt(2) * 0.5 * Math.sin(2 * Math.PI / 360 * 75)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;

                type = 1;
                r = 1;
                for (var m = 0; m < 6; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 60 + 0)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 60 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0].surround = point[k0].surround.concat([k]); //pushやspliceだと全てのpointが更新されてしまう
                    point[k].surround = point[k].surround.concat([k0]);
                    k++;
                }
                r = Math.sqrt(2) / 2;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 45)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 45)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    k++;
                }
                r = Math.sqrt(3) / 3;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].surround = point[k0 + 2].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 2]);
                    k++;
                }
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 180)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 180)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].surround = point[k0 + 3].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 3]);
                    k++;
                }
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 15)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 15)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].surround = point[k0 + 4].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 4]);
                    k++;
                }
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 - 15)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 - 15)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].surround = point[k0 + 5].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 5]);
                    k++;
                }

                type = 2;
                r = Math.sqrt(3) / 2;
                for (var m = 0; m < 6; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 60 + 30)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 60 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]);
                    if (m === 5) {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 29].neighbor = point[k - 29].neighbor.concat([k]);
                    } else {
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 0)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 21].neighbor = point[k - 21].neighbor.concat([k]);
                    } else {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    }
                    k++;
                }
                r = Math.sqrt(3) / 6;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 180)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 180)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].neighbor = point[k0 + 2].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                    } else if (m === 1) {
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    } else {
                        point[k - 26].neighbor = point[k - 26].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    }
                    k++;
                }
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].neighbor = point[k0 + 3].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                    } else if (m === 1) {
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    } else {
                        point[k - 26].neighbor = point[k - 26].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 - 30)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 - 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].neighbor = point[k0 + 4].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 21].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                    } else {
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                    }
                    k++;
                }
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 30)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].neighbor = point[k0 + 5].neighbor.concat([k]);
                    if (m === 3) {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                    } else {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 27].neighbor = point[k - 27].neighbor.concat([k]);
                    }
                    k++;
                }
            }
        }


        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                    }
                    for (var n = 0; n < point[j].surround.length; n++) { //削除された点のsurroundを移し替え
                        if (point[i].surround.indexOf(point[j].surround[n]) === -1) {
                            point[i].surround = point[i].surround.concat([point[j].surround[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    delete point[j];
                    //置換ここまで
                }
            }
        }

        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        //use更新
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            for (var k = 0; k < point[i].neighbor.length; k++) {
                point[point[i].neighbor[k]].use = 1;
            }
            for (var k = 0; k < point[i].surround.length; k++) {
                point[point[i].surround[k]].use = 1;
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [5];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [6];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 1) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 1 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -30);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +30);
        this.redraw();
    }


    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
        }
    }

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }

    draw_star(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 3) {
            var r1 = 0.2;
            var r = 0.2;
        } else {
            var r1 = 0.4;
            var r = 0.4;
        }
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
            case 0:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 3) {
            var r1 = 0.26,
                r2 = 0.24,
                alp1 = 0.4,
                alp2 = 0.5,
                alp3 = 0.6;
        } else {
            var r1 = 0.36,
                r2 = 0.34,
                alp1 = 0.5,
                alp2 = 0.6,
                alp3 = 0.7;
        }
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
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, alp2 * pu.size, this.size * alp3);
                break;
            case 4:
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, alp2 * pu.size, this.size * alp3);
                break;
        }
    }

    draw_firefly(ctx, num, x, y, ccolor) {
        var r1 = 0.25,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -30, 4: 60, 5: 150, 6: 240, 7: 210, 8: 180, 9: 0, 0: 30 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                var th = this.rotate_theta(thMap[num]);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
        }
    }
}

class Puzzle_deltoidal_trihexagonal extends Puzzle_truncated_square {
    constructor(nx, ny, size) {
        //盤面情報
        super("deltoidal_trihexagonal");
        this.gridtype = 'deltoidal_trihexagonal';
        this.nx = nx;
        this.ny = ny;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid

        this.width0 = this.nx + 6;
        this.height0 = this.ny + 6;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
        var k = 0,
            k0;
        var nx = this.nx0;
        var ny = this.ny0;
        var r;
        var adjacent, surround, type, use, neighbor;
        var point = [];
        var adjacent = [];
        var surround = [];
        var neighbor = [];
        //center
        for (var j = 0; j < ny; j++) {
            for (var i = 0; i < nx; i++) {
                var offsetx = i * (1.5 + 0.5 * Math.sqrt(3)) + 0.5;
                var offsety = j * (1 + Math.sqrt(3)) - (i % 2) * (0.5 + 0.5 * Math.sqrt(3)) + 0.5;

                k0 = k;
                type = 1;
                if (i === 0 || i === nx - 1 || j === 0 || j === ny - 1) { use = -1; } else { use = 1; }
                point[k] = new Point(offsetx * this.size, (offsety) * this.size, type, adjacent, surround, use, neighbor, [], 0);
                k++;
                point[k] = new Point((offsetx) * this.size, (offsety - 0.5 - 0.5 * Math.sqrt(3)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 0.5 + Math.sqrt(3) / 6) * this.size, (offsety - 0.5 - 0.5 * Math.sqrt(3)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx - 0.5 - Math.sqrt(3) / 6) * this.size, (offsety - 0.5 - 0.5 * Math.sqrt(3)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx + 1 + Math.sqrt(2) * 0.5 * Math.cos(2 * Math.PI / 360 * 75)) * this.size, (offsety - Math.sqrt(2) * 0.5 * Math.sin(2 * Math.PI / 360 * 75)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;
                point[k] = new Point((offsetx - 1 - Math.sqrt(2) * 0.5 * Math.cos(2 * Math.PI / 360 * 75)) * this.size, (offsety - Math.sqrt(2) * 0.5 * Math.sin(2 * Math.PI / 360 * 75)) * this.size, type, adjacent, surround, use, neighbor, [], 1);
                k++;

                type = 0;
                r = 1;
                for (var m = 0; m < 6; m++) {
                    if ((i % 2 === 1 && m === 1) || m === 2) { var type2 = 1; } else { var type2 = 0; }
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 60 + 0)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 60 + 0)), type, adjacent, surround, use, neighbor, [], type2);
                    point[k0].surround = point[k0].surround.concat([k]); //pushやspliceだと全てのpointが更新されてしまう
                    point[k].surround = point[k].surround.concat([k0]);
                    k++;
                }
                r = Math.sqrt(2) / 2;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 45)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 45)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].surround = point[k0 + 1].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 1]);
                    k++;
                }
                r = Math.sqrt(3) / 3;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].surround = point[k0 + 2].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 2]);
                    k++;
                }
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 180)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 180)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].surround = point[k0 + 3].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 3]);
                    k++;
                }
                r = 0.5 * Math.sqrt(2);
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 15)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 15)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].surround = point[k0 + 4].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 4]);
                    k++;
                }
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 - 15)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 - 15)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].surround = point[k0 + 5].surround.concat([k]);
                    point[k].surround = point[k].surround.concat([k0 + 5]);
                    k++;
                }


                type = 2;
                r = Math.sqrt(3) / 2;
                for (var m = 0; m < 6; m++) {
                    point[k] = new Point(point[k0].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 60 + 30)), point[k0].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 60 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0].neighbor = point[k0].neighbor.concat([k]);
                    if (m === 5) {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 29].neighbor = point[k - 29].neighbor.concat([k]);
                    } else {
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 1].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 0)), point[k0 + 1].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 1].neighbor = point[k0 + 1].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 21].neighbor = point[k - 21].neighbor.concat([k]);
                    } else {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    }
                    k++;
                }
                r = Math.sqrt(3) / 6;
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 2].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 180)), point[k0 + 2].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 180)), type, adjacent, surround, use, neighbor);
                    point[k0 + 2].neighbor = point[k0 + 2].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                    } else if (m === 1) {
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    } else {
                        point[k - 26].neighbor = point[k - 26].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    }
                    k++;
                }
                for (var m = 0; m < 3; m++) {
                    point[k] = new Point(point[k0 + 3].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 120 + 0)), point[k0 + 3].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 120 + 0)), type, adjacent, surround, use, neighbor);
                    point[k0 + 3].neighbor = point[k0 + 3].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 22].neighbor = point[k - 22].neighbor.concat([k]);
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                    } else if (m === 1) {
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    } else {
                        point[k - 26].neighbor = point[k - 26].neighbor.concat([k]);
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                    }
                    k++;
                }
                r = 0.5;
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 4].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 - 30)), point[k0 + 4].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 - 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 4].neighbor = point[k0 + 4].neighbor.concat([k]);
                    if (m === 0) {
                        point[k - 21].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                    } else {
                        point[k - 25].neighbor = point[k - 25].neighbor.concat([k]);
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                    }
                    k++;
                }
                for (var m = 0; m < 4; m++) {
                    point[k] = new Point(point[k0 + 5].x + r * this.size * Math.cos(2 * Math.PI / 360 * (m * 90 + 30)), point[k0 + 5].y + r * this.size * Math.sin(2 * Math.PI / 360 * (m * 90 + 30)), type, adjacent, surround, use, neighbor);
                    point[k0 + 5].neighbor = point[k0 + 5].neighbor.concat([k]);
                    if (m === 3) {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 23].neighbor = point[k - 23].neighbor.concat([k]);
                    } else {
                        point[k - 24].neighbor = point[k - 24].neighbor.concat([k]);
                        point[k - 27].neighbor = point[k - 27].neighbor.concat([k]);
                    }
                    k++;
                }
            }
        }


        // 重複判定
        for (var i = 0; i < point.length; i++) {
            if (!point[i]) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j]) { continue; };
                if ((point[i].x - point[j].x) ** 2 + (point[i].y - point[j].y) ** 2 < 0.01) {
                    //surround,neighbor置換
                    for (var k = 0; k < point.length; k++) {
                        if (!point[k]) { continue; };
                        for (var n = 0; n < point[k].surround.length; n++) {
                            if (point[k].surround[n] === j) {
                                point[k].surround.splice(n, 1, i);
                            }
                        }
                        for (var n = 0; n < point[k].neighbor.length; n++) {
                            if (point[k].neighbor[n] === j) {
                                if (point[k].neighbor.indexOf(i) === -1) {
                                    point[k].neighbor.splice(n, 1, i); //無ければ置き換え
                                } else {
                                    point[k].neighbor.splice(n, 1); //あったら削除
                                }
                            }
                        }
                    }
                    for (var n = 0; n < point[j].surround.length; n++) { //削除された点のsurroundを移し替え
                        if (point[i].surround.indexOf(point[j].surround[n]) === -1) {
                            point[i].surround = point[i].surround.concat([point[j].surround[n]]);
                        }
                    }
                    for (var n = 0; n < point[j].neighbor.length; n++) { //削除された点のneighborを移し替え
                        if (point[i].neighbor.indexOf(point[j].neighbor[n]) === -1) {
                            point[i].neighbor = point[i].neighbor.concat([point[j].neighbor[n]]);
                        }
                    }
                    delete point[j];
                    //置換ここまで
                }
            }
        }

        // adjacent作成
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 0) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 1) { continue; };
            for (var j = i + 1; j < point.length; j++) {
                if (!point[j] || point[j].type != 1) { continue; };
                for (var k = 0; k < point[i].neighbor.length; k++) {
                    if (point[j].neighbor.indexOf(point[i].neighbor[k]) != -1) {
                        point[i].adjacent = point[i].adjacent.concat([j]);
                        point[j].adjacent = point[j].adjacent.concat([i]);
                    }
                }
            }
        }
        //use更新
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            for (var k = 0; k < point[i].neighbor.length; k++) {
                point[point[i].neighbor[k]].use = 1;
            }
            for (var k = 0; k < point[i].surround.length; k++) {
                point[point[i].surround[k]].use = 1;
            }
        }
        //surround並び替え
        var s0;
        for (var i = 0; i < point.length; i++) {
            if (!point[i] || point[i].type != 0 || point[i].use === -1) { continue; };
            if (point[i].type2 === 1) {
                s0 = point[i].surround[2];
                point[i].surround[2] = point[i].surround[3];
                point[i].surround[3] = s0;
            }
        }
        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
                }
                break;
            case "number":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "3") {
                    type = [5];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "9") {
                    type = [6];
                } else {
                    if (!UserSettings.draw_edges) {
                        type = [0];
                    } else {
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else {
                    type = [1];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 1) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 1 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -30);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 30 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +30);
        this.redraw();
    }


    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_number("pu_q");
            this.draw_cursol();
            this.draw_freecircle();
        }
    }


    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }

    draw_star(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 3) {
            var r1 = 0.2;
            var r = 0.2;
        } else {
            var r1 = 0.4;
            var r = 0.4;
        }
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
            case 0:
                ctx.setLineDash([]);
                ctx.lineCap = "butt";
                ctx.strokeStyle = ccolor || Color.BLACK;
                ctx.lineWidth = 1;
                this.draw_x(ctx, x, y, r)
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 3) {
            var r1 = 0.26,
                r2 = 0.24,
                alp1 = 0.4,
                alp2 = 0.5,
                alp3 = 0.6;
        } else {
            var r1 = 0.36,
                r2 = 0.34,
                alp1 = 0.5,
                alp2 = 0.6,
                alp3 = 0.7;
        }
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
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, alp2 * pu.size, this.size * alp3);
                break;
            case 4:
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, alp2 * pu.size, this.size * alp3);
                break;
        }
    }

    draw_firefly(ctx, num, x, y, ccolor) {
        var r1 = 0.25,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -30, 4: 60, 5: 150, 6: 240, 7: 210, 8: 180, 9: 0, 0: 30 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 0:
                var th = this.rotate_theta(thMap[num]);
                this.set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
        }
    }
}

class Puzzle_penrose_P3 extends Puzzle {
    constructor(side, order, size) {
        //盤面情報
        super('penrose_P3');
        this.nx = side;
        this.ny = side;
        this.nx0 = this.nx + 2;
        this.ny0 = this.ny + 2;
        this.margin = -1; //for arrow of number pointing outside of the grid
        this.sudoku = [0, 0, 0, 0]; // This is for sudoku settings
        this.ngrids = order;
        // The grid_offset coefficients determine which part of the infinite
        // Penrose tiling you get. Ideally we would make them configurable,
        // but it's a bit fiddly. They must not be integer. To ensure a valid
        // aperiodic tiling, the sum of all values should be an integer.
        this.grid_offset = Array(this.ngrids).fill(1/this.ngrids);
        this.width0 = this.nx;
        this.height0 = this.ny;
        this.width_c = this.width0;
        this.height_c = this.height0;
        this.width = this.width_c;
        this.height = this.height_c;
        this.canvasx = this.width_c * this.size;
        this.canvasy = this.height_c * this.size;
        this.space = [];
        this.size = size;
        this.onoff_symbolmode_list = {
            "cross": 4,
            "arrow_cross": 4,
            "arrow_fourtip": 4,
            "degital": 7,
            "degital_f": 7,
            "arrow_eight": 8,
            "arrow_fouredge_B": 8,
            "arrow_fouredge_G": 8,
            "arrow_fouredge_E": 8,
            "dice": 9,
            "polyomino": 9
        };
        this.reset();
        PenpaUI.set_visible_modes_by_gridtype(this.gridtype);
    }

    create_point() {
	const PI = Math.PI;
	const pixel_sqradius = (this.nx*this.ny*this.size*this.size)
	const pixel_sqradius0 = (this.nx0*this.ny0*this.size*this.size)

	// Compute the identity of the next tile in the tiling,
	// using a de Bruijn grid.
	// Ref.: https://www.mathpages.com/home/kmath621/kmath621.htm
	var next_gridpoint = (x, y, i, j, dir) => {
	    const rel = (this.ngrids + j - i) % this.ngrids;
	    const costh = Math.cos(rel * 2 * PI / this.ngrids);
	    const sinth = Math.sin(rel * 2 * PI / this.ngrids);
	    let yco = -(x+this.grid_offset[i]) * (costh / sinth) + (y+this.grid_offset[j]) / sinth;
	    let nextyco = yco + dir*1000;
	    let bestp = null;
	    let besty = null;
	    for (let p = 1; p < this.ngrids; p++) {
                if (p == rel) { continue; }
	        const costh = Math.cos(p * 2 * PI / this.ngrids);
	        const sinth = Math.sin(p * 2 * PI / this.ngrids);
	        const base = -(x+this.grid_offset[i]) * (costh / sinth);
	        const off = Math.abs(1 / sinth);
	        const go = this.grid_offset[(i+p)%this.ngrids];
		if (dir > 0) {
	            const thisy = Math.ceil(((yco - base) / off) - go*Math.sign(sinth));
	            const higher = base + off * (thisy + go*Math.sign(sinth));

	            if (higher < nextyco) {
	                nextyco = higher;
	                bestp = p;
	                besty = 0+thisy * Math.sign(sinth);
	            }
	        } else {
	            const thisy = Math.floor(((yco - base) / off) - go*Math.sign(sinth));
	            const lower = base + off * (thisy + go*Math.sign(sinth));
	            if (lower > nextyco) {
	                nextyco = lower;
	                bestp = p;
	                besty = 0+thisy * Math.sign(sinth);
	            }
	        }
	    }
	    const bestj = (this.ngrids + i + bestp) % this.ngrids;
	    return { xnum: x, ynum: besty, i: i, j: bestj }
	}

        var k = 0;
        var point = [];
	// List of tile-specs to add in next phase
	var queue = [], oldqueue;
        // Map of tile-specs to their index in point[]
	var existing_tiles = new Map();

	var get_tile_name = (spec) => {
	    var rel = (this.ngrids+spec.j-spec.i)%this.ngrids;
	    if (rel>this.ngrids/2) {  // swap i,j
	       return "<" + spec.j + "|" + spec.i + ">(" + spec.ynum + "," + spec.xnum + ")";
	    } else {
	       return "<" + spec.i + "|" + spec.j + ">(" + spec.xnum + "," + spec.ynum + ")";
	    }
	}
	// closure modifies 'queue' and 'existing_tiles'
	var add_tile = (tile_spec, loc_spec) => {
	    var name = get_tile_name(tile_spec);
	    if (existing_tiles.has(name)) {
	      return;
	    }
            console.log("Adding new tile", name)
	    var rel = (this.ngrids+tile_spec.j-tile_spec.i)%this.ngrids;
	    var i,j,xnum,ynum;
	    if (rel>this.ngrids/2) {  // swap i,j
              i = tile_spec.j; j = tile_spec.i;
	      xnum = tile_spec.ynum; ynum = tile_spec.xnum;
	    } else {
              i = tile_spec.i; j = tile_spec.j;
	      xnum = tile_spec.xnum; ynum = tile_spec.ynum;
	    }
	    var xoffi = Math.sin(2*i*PI/this.ngrids)*this.size, yoffi = -Math.cos(2*i*PI/this.ngrids)*this.size;
	    var xoffj = Math.sin(2*j*PI/this.ngrids)*this.size, yoffj = -Math.cos(2*j*PI/this.ngrids)*this.size;
	    var xco = loc_spec.xco, yco = loc_spec.yco;
	    if (rel>this.ngrids/2) {
	        if (loc_spec.dir>0) {
		    xco = xco - xoffi;
		    yco = yco - yoffi;
		} else {
		    xco = xco - xoffj;
		    yco = yco - yoffj;
		}
            } else if (loc_spec.dir<0) {
	        xco = xco - xoffi - xoffj;
		yco = yco - yoffi - yoffj;
	    }
	    var xcen = xco + 0.5*xoffi + 0.5*xoffj, ycen = yco + 0.5*yoffi + 0.5*yoffj;
	    var sqdist = xcen*xcen + ycen*ycen;
            if (sqdist > pixel_sqradius0) {
		// far from origin: abort
		return
	    }
	    var use = (sqdist <= pixel_sqradius) ? 1 : 0;


	    var xco = [xco, xco + xoffi, xco + xoffi + xoffj, xco + xoffj];
	    var yco = [yco, yco + yoffi, yco + yoffi + yoffj, yco + yoffj];

            var loc_spec, nbr_spec, s, nbr;
	    var surround = [null, null, null, null];
	    var edge = [null, null, null, null];
	    var adja = [null, null, null, null];

            // For each of the four directions, compute the name of
            // the tile that should be adjacent, and look up whether
            // it already exists. If it does, update the adjacency
            // information from it. If it does not, add it to the
            // queue to be created in the next pass.

            nbr_spec = next_gridpoint(xnum, ynum, i, j, 1) // next along xline
	    nbr = existing_tiles.get(get_tile_name(nbr_spec))
	    if (nbr) {
	       adja[2] = nbr
	       nbr = point[nbr]
	       s = ((this.ngrids+nbr_spec.j-nbr_spec.i)%this.ngrids)>this.ngrids/2
	       surround[3] = s ? nbr.surround[1] : nbr.surround[0]
	       surround[2] = s ? nbr.surround[2] : nbr.surround[1]
	       edge[2] = s ? nbr.neighbor[1] : nbr.neighbor[0]
	    } else {
	       loc_spec = { xco: xco[3], yco: yco[3], dir: 1 }
	       queue.push({tile_spec: nbr_spec, loc_spec: loc_spec})
	    }
            nbr_spec = next_gridpoint(xnum, ynum, i, j, -1) // prev along xline
	    nbr = existing_tiles.get(get_tile_name(nbr_spec))
	    if (nbr) {
	       adja[0] = nbr
	       nbr = point[nbr]
	       s = ((this.ngrids+nbr_spec.j-nbr_spec.i)%this.ngrids)>this.ngrids/2
	       surround[1] = s ? nbr.surround[3] : nbr.surround[2]
	       surround[0] = s ? nbr.surround[0] : nbr.surround[3]
	       edge[0] = s ? nbr.neighbor[3] : nbr.neighbor[2]
	    } else {
	       loc_spec = { xco: xco[1], yco: yco[1], dir: -1 }
	       queue.push({tile_spec: nbr_spec, loc_spec: loc_spec})
	    }
            nbr_spec = next_gridpoint(ynum, xnum, j, i, 1) // next along yline
	    nbr = existing_tiles.get(get_tile_name(nbr_spec))
	    if (nbr) {
	       adja[3] = nbr
	       nbr = point[nbr]
	       s = ((this.ngrids+nbr_spec.j-nbr_spec.i)%this.ngrids)>this.ngrids/2
	       surround[0] = s ? nbr.surround[1] : nbr.surround[0]
	       surround[3] = s ? nbr.surround[2] : nbr.surround[1]
	       edge[3] = s ? nbr.neighbor[1] : nbr.neighbor[0]
	    } else {
	       loc_spec = { xco: xco[0], yco: yco[0], dir: 1 }
	       queue.push({tile_spec: nbr_spec, loc_spec: loc_spec})
	    }
            nbr_spec = next_gridpoint(ynum, xnum, j, i, -1) // prev along yline
	    nbr = existing_tiles.get(get_tile_name(nbr_spec))
	    if (nbr) {
	       adja[1] = nbr
	       nbr = point[nbr]
	       s = ((this.ngrids+nbr_spec.j-nbr_spec.i)%this.ngrids)>this.ngrids/2
	       surround[2] = s ? nbr.surround[3] : nbr.surround[2]
	       surround[1] = s ? nbr.surround[0] : nbr.surround[3]
	       edge[1] = s ? nbr.neighbor[3] : nbr.neighbor[2]
	    } else {
	       loc_spec = { xco: xco[2], yco: yco[2], dir: -1 }
	       queue.push({tile_spec: nbr_spec, loc_spec: loc_spec})
	    }

            // Create vertices if they don't already exist
            var type = 1;
	    for (let e = 0; e < 4; e++) {
	      if (surround[e] == null) {
	        point[k] = new Point(xco[e], yco[e], type, [], [], use, []);
		surround[e] = k;
	        k++;
	      } else if (use == 1) {
		point[surround[e]].use = 1;
	      }
	    }
	    for (let e = 0; e < 4; e++) {
	      // Update mapping vertex -> adjacent vertex
	      let se = surround[e], sf = surround[(e+1)%4];
	      if (point[se].adjacent.indexOf(sf) == -1) {
	        point[se].adjacent = point[se].adjacent.concat([sf])
	      }
	      if (point[sf].adjacent.indexOf(se) == -1) {
	        point[sf].adjacent = point[sf].adjacent.concat([se])
	      }
	    }
            // Create edges if they don't already exist
            type = 2;
	    for (let e = 0; e < 4; e++) {
	      if (edge[e] == null) {
	        point[k] = new Point((point[surround[e]].x + point[surround[(e+1)%4]].x)/2,
		                     (point[surround[e]].y + point[surround[(e+1)%4]].y)/2, 
		                     type, [], [], use, []);
		edge[e] = k;
	        k++;
	      } else if (use == 1) {
		point[edge[e]].use = 1;
	      }
	    }

	    // Create face
	    type = 0;
	    point[k] = new Point(xcen, ycen, type, adja, surround, use, edge);
	    for (let e = 0; e < 4; e++) {
	      // Update mapping edge -> face
	      point[edge[e]].neighbor = point[edge[e]].neighbor.concat([k])
	      if (adja[e] != null) {
	        // Update mapping face -> adjacent face
	        point[adja[e]].adjacent[ point[adja[e]].neighbor.indexOf(edge[e]) ] = k
	      }
	    }
	    existing_tiles.set(name, k);
	    k++;
	}

	// Initial tile
	add_tile({ xnum: 0, ynum: 0, i: 0, j: 1 }, {xco: 0.0, yco: 0.0, dir: 1 })
	for (var iter = 0; (queue.length > 0) && (iter < 100); iter++) {
	    oldqueue = queue;
	    queue = [];
	    for (var n = 0; n < oldqueue.length; n++) {
	        add_tile(oldqueue[n].tile_spec, oldqueue[n].loc_spec);
	    }
	    if (queue.length == 0) { break; }
	}

        this.point = point;
    }

    reset_frame() {
        this.create_point();
        this.space = [];

        this.centerlist = [];
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].use === 1 && this.point[i].type === 0) {
                this.centerlist.push(i);
            }
        }
        this.search_center();
        this.width_c = this.width;
        this.height_c = this.height;
        this.center_n0 = this.center_n;
        this.canvasxy_update();
        this.canvas_size_setting();
        this.point_move((this.canvasx * 0.5 - this.point[this.center_n].x + 0.5), (this.canvasy * 0.5 - this.point[this.center_n].y + 0.5), this.theta);

        this.make_frameline();
        this.cursol = this.centerlist[0];
        this.cursolS = 4 * (this.nx0) * (this.ny0) + 4 + 4 * (this.nx0);
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
        this.width = (xmax - xmin) / this.size + 2.5;
        this.height = (ymax - ymin) / this.size + 2.5;

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
                    type = [0, 1, 2];
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
                        type = [0, 1, 2];
                    }
                }
                break;
            case "line":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "2") {
                    type = [0, 1];
                } else if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "5") {
                    type = [0, 2];
                } else {
                    type = [0];
                }
                break;
            case "lineE":
                if (this.mode[this.mode.qa][this.mode[this.mode.qa].edit_mode][0] === "4") {
                    type = [2];
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
                    type = [2];
                }
                break;
            case "cage":
                type = [4];
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
                    case "yajilin":
                        type = [0, 2];
                        break;
                    case "edgex":
                    case "edgexoi":
                    case "star":
                        type = [0, 1, 2];
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
                        type = [0];
                        break;
                    case "edgesub":
                        type = [0, 1];
                        break;
                    case "akari":
                        type = [0, 2];
                        break;
                    case "mines":
                        type = [0, 1, 2];
                        break;
                }
                break;
            case "sudoku":
                type = [0];
                break;
        }
        return type;
    }

    recalculate_num(x, y, num) {
        var min0, min = 10e6;
        var num0 = 0;
        var r0 = 0.5 * Math.sqrt(2) / Math.cos(2 * Math.PI / 360 * 22.5);
        var r1 = Math.sqrt(2) - 1;
        if (this.point[num].type != 0) { return num; }

        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.point[i].type === 0 && this.point[i].use === 1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type2 === 0 && min0 > (r0 * this.size) ** 2) { continue; } //円形の内側に入っていなければ更新しない
                    if (this.point[i].type2 === 1 && min0 > (r1 * this.size) ** 2) { continue; }
                    min = min0;
                    num = i;
                }
            }
        }
        return parseInt(num);
    }

    coord_p_edgex(x, y) {
        var min0, min = 10e6;
        var num = 0;
        for (var i = 0; i < this.point.length; i++) {
            if (this.point[i] && this.type.indexOf(this.point[i].type) != -1) {
                min0 = (x - this.point[i].x) ** 2 + (y - this.point[i].y) ** 2;
                if (min0 < min) {
                    if (this.point[i].type === 2 || this.point[i].type === 3) {
                        if (min0 > (0.3 * this.size) ** 2) {
                            continue;
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
        this.theta = (this.theta - 45 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, -45);
        this.redraw();
    }

    rotate_right() {
        this.theta = (this.theta + 45 * this.reflect[0] * this.reflect[1] + 360) % 360;
        this.point_move(0, 0, +45);
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
        var a, b, c;
        b = [0, 1, 2, 3];
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
        var quotient = parseInt(this.cursol / 27);
        if (this.mode[this.mode.qa].edit_mode === "number" || this.mode[this.mode.qa].edit_mode === "symbol") {
            if (this.cursol % 27 === 0) { // top side
                switch (c) {
                    case 0: //left
                        // if cursor already on the left border
                        if (quotient % this.nx0 === 0) {
                            a = this.cursol + 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 1: //up
                        a = this.cursol + 27 * this.nx0;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 2: //right
                        a = this.cursol + 27;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 3: //down
                        // if cursor already on the bottom border
                        if (quotient < this.nx0) {
                            a = this.cursol * this.nx0 + 2;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                }
            } else if (this.cursol % 27 === 1) { // left side
                switch (c) {
                    case 0: //left
                        a = this.cursol + 27 * this.nx0;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 1: //up
                        // if cursor already on the up border
                        if (quotient % this.nx0 === 0) {
                            a = this.cursol - 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 2: //right
                        // if cursor already on the right border
                        if (quotient < this.nx0) {
                            a = this.cursol + 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 3: //down
                        a = this.cursol + 27;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                }
            } else if (this.cursol % 27 === 2) { // right side
                switch (c) {
                    case 0: //left
                        // if cursor already on the left border
                        if (quotient < this.nx0) {
                            a = this.cursol - 1;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 1: //up
                        // if cursor already on the up border
                        if (quotient % this.nx0 === 0) {
                            a = parseInt((this.cursol - 2) / this.nx0);
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        } else {
                            a = this.cursol - 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        }
                        break;
                    case 2: //right
                        a = this.cursol + 27 * this.nx0;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                    case 3: //down
                        a = this.cursol + 27;
                        if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                        break;
                }
            }
            this.selection = [];
            if (!this.selection.includes(this.cursol)) {
                this.selection.push(this.cursol);
            }
        } else if (this.mode[this.mode.qa].edit_mode === "sudoku") {
            if (this.selection.length >= 1) {
                if (this.cursol % 27 === 0) { // top side
                    switch (c) {
                        case 0: //left
                            // if cursor already on the left border
                            if (quotient % this.nx0 === 0) {
                                a = this.cursol + 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 1: //up
                            a = this.cursol + 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 2: //right
                            a = this.cursol + 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 3: //down
                            // if cursor already on the bottom border
                            if (quotient < this.nx0) {
                                a = this.cursol * this.nx0 + 2;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27 * this.nx0;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                    }
                } else if (this.cursol % 27 === 1) { // left side
                    switch (c) {
                        case 0: //left
                            a = this.cursol + 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 1: //up
                            // if cursor already on the up border
                            if (quotient % this.nx0 === 0) {
                                a = this.cursol - 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 2: //right
                            // if cursor already on the right border
                            if (quotient < this.nx0) {
                                a = this.cursol + 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27 * this.nx0;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 3: //down
                            a = this.cursol + 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                    }
                } else if (this.cursol % 27 === 2) { // right side
                    switch (c) {
                        case 0: //left
                            // if cursor already on the left border
                            if (quotient < this.nx0) {
                                a = this.cursol - 1;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27 * this.nx0;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 1: //up
                            // if cursor already on the up border
                            if (quotient % this.nx0 === 0) {
                                a = parseInt((this.cursol - 2) / this.nx0);
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            } else {
                                a = this.cursol - 27;
                                if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            }
                            break;
                        case 2: //right
                            a = this.cursol + 27 * this.nx0;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                        case 3: //down
                            a = this.cursol + 27;
                            if (this.point[a] && this.point[a].use === 1) { this.cursol = a; }
                            break;
                    }
                }
                if (this.point[a] && this.point[a].use === 1) {
                    if (!ctrl_key) {
                        this.selection = [];
                    }
                    if (!this.selection.includes(a)) {
                        this.selection.push(a);
                    }
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

    ////////////////draw/////////////////////

    draw() {
        var present_mode = this.mode.qa;
        if (present_mode !== "pu_q" || UserSettings.show_solution) {
            this.draw_surface("pu_q");
            this.draw_surface("pu_a");
            this.draw_symbol("pu_q", 1);
            this.draw_symbol("pu_a", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_polygonsp("pu_a");
            this.draw_freeline("pu_q");
            this.draw_freeline("pu_a");
            this.draw_line("pu_q");
            this.draw_line("pu_a");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
            this.draw_symbol("pu_a", 2);
            this.draw_number("pu_q");
            this.draw_number("pu_a");
            this.draw_cursol();
            this.draw_freecircle();
        } else {
            this.draw_surface("pu_q");
            this.draw_symbol("pu_q", 1);
            this.draw_frame();
            this.draw_polygonsp("pu_q");
            this.draw_freeline("pu_q");
            this.draw_line("pu_q");
            this.draw_lattice();
            this.draw_selection();
            this.draw_frameBold();
            this.draw_symbol("pu_q", 2);
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

    draw_direction(pu) {
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
                this.ctx.moveTo(this.point[this[pu].direction[i][0]].x, this.point[this[pu].direction[i][0]].y);
                for (var j = 1; j < this[pu].direction[i].length - 1; j++) {
                    this.ctx.lineTo(this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y);
                }
                this.ctx.stroke();

                j = this[pu].direction[i].length - 1;
                this.ctx.lineJoin = "bevel";
                this.ctx.beginPath();
                this.ctx.arrow(this.point[this[pu].direction[i][j - 1]].x, this.point[this[pu].direction[i][j - 1]].y,
                    this.point[this[pu].direction[i][j]].x, this.point[this[pu].direction[i][j]].y, [-0.00001, 0, -0.25 * this.size, 0.25 * this.size]);
                this.ctx.stroke();
                this.ctx.lineJoin = "miter";
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

    draw_symbol(pu, layer) {
        /*symbol_layer*/
        var p_x, p_y;
        for (var i in this[pu].symbol) {
            if (i.slice(-1) === "E") { //辺モードでの重ね書き
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            if (this[pu].symbol[i][2] === layer) {
                try {
                    this.draw_symbol_select(this.ctx, p_x, p_y, this[pu].symbol[i][0], this[pu].symbol[i][1], i, pu);
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }

    draw_number(pu) {
        /*number*/
        var p_x, p_y;
        for (var i in this[pu].number) {
            if (i.slice(-1) === "E") { // Overwriting in edge mode
                p_x = this.point[i.slice(0, -1)].x;
                p_y = this.point[i.slice(0, -1)].y;
            } else {
                p_x = this.point[i].x;
                p_y = this.point[i].y;
            }
            switch (this[pu].number[i][2]) {
                case "1": //normal
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
                    set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.06 * this.size, this.size * 0.8);
                    break;
                case "2": //arrow
                    var arrowlength = 0.7;
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
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
                                p_x + (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 0:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.0 * this.size, p_y + 0.15 * this.size, this.size * 0.8);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x - (arrowlength * 0.5 + 0.0) * this.size, p_y + (arrowlength * 0.0 - 0.3) * this.size,
                                p_x - (-arrowlength * 0.5 + 0.0) * this.size, p_y + (-arrowlength * 0.0 - 0.3) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 90:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 270:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.1 * this.size, p_y + 0.05 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.0 + 0.3) * this.size, p_y + (-arrowlength * 0.5 - 0.0) * this.size,
                                p_x + (-arrowlength * 0.0 + 0.3) * this.size, p_y + (arrowlength * 0.5 - 0.0) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 45:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 225:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x + 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.35 - 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 - 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 135:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
                            this.ctx.stroke();
                            this.ctx.fill();
                            break;
                        case 315:
                            this.ctx.text(this[pu].number[i][0].slice(0, -2), p_x - 0.05 * this.size, p_y + 0.15 * this.size, this.size * 0.7);
                            this.ctx.beginPath();
                            this.ctx.arrow(p_x + (-arrowlength * 0.35 + 0.2) * this.size, p_y + (-arrowlength * 0.35 - 0.2) * this.size,
                                p_x + (arrowlength * 0.35 + 0.2) * this.size, p_y + (arrowlength * 0.35 - 0.2) * this.size, [0, 1, -0.25 * this.size, 1, -0.25 * this.size, 3]);
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
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.44);
                    if (this[pu].number[i][0].length === 1) {
                        set_font_style(this.ctx, 0.7 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.06 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 2) {
                        set_font_style(this.ctx, 0.48 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), p_x - 0.16 * this.size, p_y - 0.15 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), p_x + 0.18 * this.size, p_y + 0.19 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 3) {
                        set_font_style(this.ctx, 0.45 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), p_x - 0.22 * this.size, p_y - 0.14 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), p_x + 0.24 * this.size, p_y - 0.05 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(2, 3), p_x - 0.0 * this.size, p_y + 0.3 * this.size, this.size * 0.8);
                    } else if (this[pu].number[i][0].length === 4) {
                        set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                        this.ctx.text(this[pu].number[i][0].slice(0, 1), p_x - 0.0 * this.size, p_y - 0.22 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(1, 2), p_x - 0.26 * this.size, p_y + 0.04 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(2, 3), p_x + 0.26 * this.size, p_y + 0.04 * this.size, this.size * 0.8);
                        this.ctx.text(this[pu].number[i][0].slice(3, 4), p_x - 0.0 * this.size, p_y + 0.3 * this.size, this.size * 0.8);
                    }
                    break;
                case "5": //small
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.17);
                    set_font_style(this.ctx, 0.25 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.02 * this.size, this.size * 0.8);
                    break;
                case "6": //medium
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.25);
                    set_font_style(this.ctx, 0.4 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.03 * this.size, this.size * 0.8);
                    break;
                case "10": //big
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.36);
                    set_font_style(this.ctx, 0.6 * this.size.toString(10), this[pu].number[i][1]);
                    this.ctx.text(this[pu].number[i][0], p_x, p_y + 0.03 * this.size, this.size * 0.8);
                    break;
                case "7": //sudoku
                    this.draw_numbercircle(pu, i, p_x, p_y, 0.42);
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
            }
            if (true) { //(this[pu].numberS[i][0].length <= 2 )
                set_font_style(this.ctx, 0.32 * this.size.toString(10), this[pu].numberS[i][1]);
                this.ctx.textAlign = "center";
                this.ctx.text(this[pu].numberS[i][0], this.point[i].x, this.point[i].y + 0.03 * this.size, this.size * 0.48);
                //else
                //  set_font_style(this.ctx,0.28*this.size.toString(10),this[pu].numberS[i][1]);
                //  this.ctx.textAlign = "left";
                //  this.ctx.text(this[pu].numberS[i][0],this.point[i].x-0.15*this.size,this.point[i].y+0.03*this.size,this.size*0.8);
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

    draw_numbercircle_iso(pu, i, size) {
        if (this[pu].number[i][1] === 5) {
            set_circle_style(this.ctx, 7);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        } else if (this[pu].number[i][1] === 6) {
            set_circle_style(this.ctx, 1);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        } else if (this[pu].number[i][1] === 7) {
            set_circle_style(this.ctx, 2);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        } else if (this[pu].number[i][1] === 11) {
            set_circle_style(this.ctx, 11);
            this.draw_circle(this.ctx, this.point[i].x, this.point[i].y, size);
        }
    }

    draw_symbol_select(ctx, x, y, num, sym, i = 'panel', qamode) {
        let ccolor = undefined;
        if (i !== 'panel' && UserSettings.custom_colors_on && this[qamode + "_col"].symbol[i]) {
            ccolor = this[qamode + "_col"].symbol[i];
        }
        this.draw_symbol_select_ccolor(ctx, x, y, num, sym, i, ccolor);
    }

    draw_symbol_select_ccolor(ctx, x, y, num, sym, loc, ccolor) {
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
            case "tridown_SS":
                set_circle_style(ctx, num, ccolor);
                this.draw_polygon(ctx, x, y - 0.16 * 0.25 * this.size, 0.16, 3, -90);
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
                set_font_style(ctx, 0.8 * pu.size.toString(10), 2, ccolor);
                this.draw_math(ctx, num, x, y + 0.05 * pu.size);
                break;
            case "degital":
                this.draw_degital(ctx, num, x, y, ccolor);
                break;
            case "degital_f":
                this.draw_degital_f(ctx, num, x, y, ccolor);
                break;
            case "dice":
                set_circle_style(ctx, 2, ccolor);
                this.draw_dice(ctx, num, x, y);
                break;
            case "pills":
                set_circle_style(ctx, 3, ccolor);
                this.draw_pills(ctx, num, x, y);
                break;

                /* arrow */
            case "arrow_B_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_B_G":
                set_circle_style(ctx, 3, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_B_W":
                set_circle_style(ctx, 1, ccolor);
                this.draw_arrowB(ctx, num, x, y);
                break;
            case "arrow_N_B":
                set_circle_style(ctx, 2, ccolor);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_N_G":
                set_circle_style(ctx, 3, ccolor);
                this.draw_arrowN(ctx, num, x, y);
                break;
            case "arrow_N_W":
                set_circle_style(ctx, 1, ccolor);
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
                set_circle_style(ctx, 3, ccolor);
                this.draw_arrowtri(ctx, num, x, y);
                break;
            case "arrow_tri_W":
                set_circle_style(ctx, 1, ccolor);
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
                // case "kakuro":
                //     this.draw_kakuro(ctx, num, x, y, ccolor);
                //     break;
                // case "compass":
                //     this.draw_compass(ctx, num, x, y, ccolor);
                //     break;
            case "star":
                this.draw_star(ctx, num, x, y, loc, ccolor);
                break;
            case "tents":
                this.draw_tents(ctx, num, x, y, ccolor);
                break;
                // case "battleship_B":
                //     set_circle_style(ctx, 2);
                //     this.draw_battleship(ctx, num, x, y, ccolor);
                //     break;
                // case "battleship_G":
                //     set_circle_style(ctx, 3);
                //     ctx.fillStyle = Color.GREY;
                //     this.draw_battleship(ctx, num, x, y);
                //     break;
                // case "battleship_W":
                //     ctx.setLineDash([]);
                //     ctx.lineCap = "butt";
                //     ctx.fillStyle = Color.TRANSPARENTBLACK;
                //     ctx.strokeStyle = Color.BLACK;
                //     ctx.lineWidth = 2;
                //     this.draw_battleship(ctx, num, x, y);
                //     break;
            case "angleloop":
                this.draw_angleloop(ctx, num, x, y, ccolor);
                break;
            case "firefly":
                this.draw_firefly(ctx, num, x, y, ccolor);
                break;
            case "sun_moon":
                this.draw_sun_moon(ctx, num, x, y, loc, ccolor);
                break;
            case "sudokuetc":
                this.draw_sudokuetc(ctx, num, x, y, ccolor);
                break;
            case "polyomino":
                this.draw_polyomino(ctx, num, x, y, ccolor);
                break;
                // case "pencils":
                //     this.draw_pencils(ctx, num, x, y);
                //     break;
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
        }
    }

    draw_framelinesym(ctx, num, x, y, ccolor) {
        var r = 0.32;
        ctx.setLineDash([]);
        ctx.lineCap = "round";
        ctx.fillStyle = Color.TRANSPARENTBLACK;
        ctx.strokeStyle = Color.BLACK;
        ctx.lineWidth = 3;
        switch (num) {
            case 1:
                set_line_style(ctx, 115, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 2:
                set_line_style(ctx, 15, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 3:
                set_line_style(ctx, 16, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 4:
                set_line_style(ctx, 110, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x + r * pu.size, y - r * pu.size);
                ctx.lineTo(x - r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 5:
                set_line_style(ctx, 115, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 6:
                set_line_style(ctx, 15, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 7:
                set_line_style(ctx, 16, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
                break;
            case 8:
                set_line_style(ctx, 110, ccolor);
                r = r / Math.sqrt(2);
                ctx.beginPath();
                ctx.moveTo(x - r * pu.size, y - r * pu.size);
                ctx.lineTo(x + r * pu.size, y + r * pu.size);
                ctx.closePath();
                ctx.stroke();
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
                set_circle_style(ctx, 10);
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

    draw_degital(ctx, num, x, y, ccolor) {
        set_circle_style(ctx, 2, ccolor);
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
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[1] === 1) {
                w1 = -(z1 + z2);
                w2 = -2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[2] === 1) {
                w1 = z1 + z2;
                w2 = -2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[3] === 1) {
                w1 = z1;
                w2 = 0;
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[4] === 1) {
                w1 = -(z1 + z2);
                w2 = 2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[5] === 1) {
                w1 = z1 + z2;
                w2 = 2 * z1;
                ctx.beginPath();
                ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
                ctx.fill();
            }
            if (num[6] === 1) {
                w1 = z1;
                w2 = 2 * (z1 + z2);
                ctx.beginPath();
                ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
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
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = -(z1 + z2);
        w2 = -2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1 + z2;
        w2 = -2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y - 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1;
        w2 = 0;
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = -(z1 + z2);
        w2 = 2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1 + z2;
        w2 = 2 * z1;
        ctx.beginPath();
        ctx.arrow(x + w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + 2 * z2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();
        w1 = z1;
        w2 = 2 * (z1 + z2);
        ctx.beginPath();
        ctx.arrow(x - w1 * pu.size, y + w2 * pu.size, x + w1 * pu.size, y + w2 * pu.size, [w3 * pu.size, w4 * pu.size, -w3 * pu.size, w4 * pu.size]);
        ctx.stroke();
        ctx.fill();

        //contents
        this.draw_degital(ctx, num, x, y, ccolor);
    }

    draw_dice(ctx, num, x, y) {
        for (var i = 0; i < 9; i++) {
            if (num[i] === 1) {
                this.draw_circle(ctx, x + (i % 3 - 1) * 0.25 * pu.size, y + ((i / 3 | 0) - 1) * 0.25 * pu.size, 0.09);
            }
        }
    }

    draw_pills(ctx, num, x, y) {
        var r = 0.15;
        ctx.fillStyle = Color.GREY
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
        if (num > 0 && num <= 6) {
            th = this.rotate_theta((num - 1) * 60 - 150);
            ctx.beginPath();
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, r1 * pu.size, w1 * pu.size, r2 * pu.size, w2 * pu.size, r3 * pu.size, w3 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowGP_C(ctx, num, x, y) {
        if (num > 0 && num <= 6) {
            var th = this.rotate_theta((num - 1) * 60 - 150);
            this.draw_circle(ctx, x, y, 0.35);
            this.draw_arrowGP(ctx, num, x + 0.5 * pu.size * Math.cos(th), y + 0.5 * pu.size * Math.sin(th));
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
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowcross(ctx, num, x, y) {
        var w1 = 0.025;
        var w2 = 0.12;
        var len1 = 0.5 * w1; //nemoto
        var len2 = 0.45; //tip
        var ri = -0.18;
        var th;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th = this.rotate_theta(i * 90 - 180);
                ctx.beginPath();
                ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
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
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
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
            ctx.arrow(x - len1 * pu.size * Math.cos(th), y - len1 * pu.size * Math.sin(th), x + len2 * pu.size * Math.cos(th), y + len2 * pu.size * Math.sin(th), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
            ctx.fill();
            ctx.stroke();
        }
    }

    draw_arrowfouredge(ctx, num, x, y) {
        var len1 = 0.5; //nemoto
        var len2 = 0.5;
        var t1 = 0.00;
        var t2 = 0.50;
        var w1 = 0.02;
        var w2 = 0.07;
        var ri = 0.42;
        var th1, th2;
        for (var i = 0; i < 4; i++) {
            if (num[i] === 1) {
                th1 = this.rotate_theta(225 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                ctx.arrow(x + len1 * pu.size * Math.cos(th1 + Math.PI * t1) + 0.1 * pu.size * Math.cos(th2), y + len1 * pu.size * Math.sin(th1 + Math.PI * t1) + 0.1 * pu.size * Math.sin(th2), x + len2 * pu.size * Math.cos(th1 + Math.PI * t2) - 0.05 * pu.size * Math.cos(th2), y + len2 * pu.size * Math.sin(th1 + Math.PI * t2) - 0.05 * pu.size * Math.sin(th2), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                ctx.fill();
                ctx.stroke();
            }
        }
        for (var i = 4; i < 8; i++) {
            if (num[i] === 1) {
                th1 = this.rotate_theta(225 + 90 * i);
                th2 = this.rotate_theta(90 * i);
                ctx.beginPath();
                ctx.arrow(x + len2 * pu.size * Math.cos(th1 + Math.PI * t2) - 0.1 * pu.size * Math.cos(th2), y + len2 * pu.size * Math.sin(th1 + Math.PI * t2) - 0.1 * pu.size * Math.sin(th2), x + len1 * pu.size * Math.cos(th1 + Math.PI * t1) + 0.05 * pu.size * Math.cos(th2), y + len1 * pu.size * Math.sin(th1 + Math.PI * t1) + 0.05 * pu.size * Math.sin(th2), [0, w1 * pu.size, ri * pu.size, w1 * pu.size, ri * pu.size, w2 * pu.size]);
                ctx.fill();
                ctx.stroke();
            }
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

    draw_star(ctx, num, x, y, loc, ccolor) {
        if (parseInt(loc % 2) === 0) { // Even numbers are octa shape, odd numbers are square shape
            var r1 = 0.5;
            var r = 0.5;
        } else {
            var r = 0.3;
            var r1 = 0.25;
        }
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
        var r1 = 0.25,
            r2 = 0.09;
        ctx.setLineDash([]);
        ctx.lineCap = "butt";
        const thMap = { 1: -90, 2: 90, 3: -45, 4: 45, 5: -225, 6: 225, 7: 135, 8: 180, 9: 0 };
        switch (num) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
                var th = this.rotate_theta(thMap[num]);
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                ctx.fillStyle = Color.BLACK;
                ctx.strokeStyle = Color.TRANSPARENTBLACK;
                ctx.lineWidth = 2;
                this.draw_circle(ctx, x - r1 * pu.size * Math.cos(th), y - r1 * pu.size * Math.sin(th), r2);
                break;
            case 0:
                set_circle_style(ctx, 1, ccolor);
                this.draw_circle(ctx, x, y, r1);
                break;
        }
    }

    draw_sun_moon(ctx, num, x, y, loc, ccolor) {
        if (this.point[loc].surround.length === 4) {
            var r1 = 0.24,
                r2 = 0.22,
                alp1 = 0.4,
                alp2 = 0.5,
                alp3 = 0.6;
        } else {
            var r1 = 0.45,
                r2 = 0.43,
                alp1 = 0.6,
                alp2 = 0.7,
                alp3 = 0.8;
        }
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
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💡", x, y, alp2 * pu.size, this.size * alp3);
                break;
            case 4:
                set_font_style(ctx, alp1 * pu.size.toString(10), 10);
                ctx.text("💣", x, y, alp2 * pu.size, this.size * alp3);
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

    rotate_theta(th) {
        th = (th + this.theta);
        if (this.reflect[0] === -1) { th = (180 - th + 360) % 360; }
        if (this.reflect[1] === -1) { th = (360 - th + 360) % 360; }
        th = th / 180 * Math.PI;
        return th;
    }
}