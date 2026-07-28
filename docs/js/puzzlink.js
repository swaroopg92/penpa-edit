class Puzzlink {
    constructor(cols, rows, bstr) {
        this.cols = cols;
        this.rows = rows;
        this.gridurl = bstr;
    }

    decodeBorder() {
        var border_list = {};
        var id,
            pos1,
            pos2,
            twi = [16, 8, 4, 2, 1];

        // Identifying how many characters of the url includes border information
        // pos1 is for vertical border
        // pos2 is for horizontal border
        pos1 = Math.min((((this.cols - 1) * this.rows + 4) / 5) | 0, this.gridurl.length);
        pos2 = Math.min((((this.cols * (this.rows - 1) + 4) / 5) | 0) + pos1, this.gridurl.length);

        // Vertical Borders
        id = 0;
        for (var i = 0; i < pos1; i++) {
            var ca = parseInt(this.gridurl.charAt(i), 32);
            for (var w = 0; w < 5; w++) {
                if (id < (this.cols - 1) * this.rows) {
                    border_list[id] = ca & twi[w] ? 1 : 0;
                    id++;
                }
            }
        }

        // Horizontal Borders
        id = (this.cols - 1) * this.rows;
        for (var i = pos1; i < pos2; i++) {
            var ca = parseInt(this.gridurl.charAt(i), 32);
            for (var w = 0; w < 5; w++) {
                if (id < 2 * this.cols * this.rows - this.cols - this.rows) {
                    border_list[id] = ca & twi[w] ? 1 : 0;
                    id++;
                }
            }
        }

        // Reduce the URL by removing the border information
        this.gridurl = this.gridurl.substr(pos2);

        return border_list;
    }

    drawBorder(pu, info_edge, edge_style) {
        var row_ind, col_ind, edgex, edgey;
        var row_offset = pu.space[0];
        var col_offset = pu.space[2];

        // Add edges to grid
        for (var i in info_edge) {
            if (info_edge[i] === 0) continue;

            // Determine Vertical Border or Horizontal
            if (i < (this.cols - 1) * this.rows) {
                row_ind = parseInt(i / (this.cols - 1)) + row_offset;
                col_ind = i % (this.cols - 1) + col_offset;
                // plus 1 at end because the 0 reference is from column 1 due to inside border
                edgex = pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind + 1;
                edgey = edgex + pu.nx0;
            } else {
                i -= (this.cols - 1) * this.rows; //offset to 0
                row_ind = parseInt(i / this.cols) + row_offset;
                col_ind = i % this.cols + col_offset;
                // 2 + row_ind, as 1st horizontal is the 0 reference
                edgex = pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 1 + col_ind;
                edgey = edgex + 1;
            }
            var key = edgex.toString() + "," + edgey.toString();
            pu["pu_q"]["lineE"][key] = edge_style;
        }
    }

    addBorderForContinousPart(pu, row_ind, col_ind, enforce_same_shading = false) {
        var cell_edges = [
            [pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind, pu.nx0], // Left
            [pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 2 + col_ind, pu.nx0], // Right
            [pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind, 1], // Above
            [pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 1 + col_ind, 1], // Below
        ];

        var cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
        var edgex, edgey;

        // Borders
        for (var e of cell_edges) {
            edgex = e[0];
            edgey = e[0] + e[1];
            var key = edgex.toString() + "," + edgey.toString();

            if (key in pu.pu_q.lineE) {
                if (enforce_same_shading) {
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

    decodeNumber16(max_length = Infinity) {
        // refer to: genericDecodeNumber16 in robx/pzprjs => Encode.js

        var number_list = {};
        var i = 0;
        var c = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            var res = this.readNumber16(ca, i);
            if (res[0] !== -1) {
                number_list[c] = res[0];
                i += res[1];
                c++;
            } else if (ca >= "g" && ca <= "z") {
                c += parseInt(ca, 36) - 15;
                i++;
            } else {
                i++;
            }

            if (c >= max_length) {
                break;
            }
        }

        // Remove what was parsed so the next function call reads what is left
        this.gridurl = this.gridurl.substr(i);

        return number_list;
    }

    readNumber16(ca, i) {
        if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
            return [parseInt(ca, 16), 1];
        } else if (ca === "-") {
            return [parseInt(this.gridurl.substr(i + 1, 2), 16), 3];
        } else if (ca === "+") {
            return [parseInt(this.gridurl.substr(i + 1, 3), 16), 4];
        } else if (ca === "=") {
            return [parseInt(this.gridurl.substr(i + 1, 3), 16) + 4096, 4];
        } else if (ca === "%") {
            return [parseInt(this.gridurl.substr(i + 1, 3), 16) + 8192, 4];
        } else if (ca === "*") {
            return [parseInt(this.gridurl.substr(i + 1, 4), 16) + 12240, 5];
        } else if (ca === "$") {
            return [parseInt(this.gridurl.substr(i + 1, 5), 16) + 77776, 6];
        } else if (ca === ".") {
            return ['?', 1];
        } else {
            return [-1, 0];
        }
    }

    drawNumbers(pu, info_number, style, sub_mode, hide_ques = true) {
        var row_ind, col_ind, cell, number;
        var row_offset = pu.space[0];
        var col_offset = pu.space[2];

        // Add numbers to grid
        for (var i in info_number) {
            // Determine which row and column
            row_ind = parseInt(i / this.cols) + row_offset;
            col_ind = i % this.cols + col_offset;
            cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
            number = hide_ques && info_number[i] === "?" ? " " : info_number[i];
            pu["pu_q"].number[cell] = [number, style, sub_mode];
        }
    }

    include(ca, bottom, up) {
        return bottom <= ca && ca <= up;
    }

    decodeNumber16ExCell(top_left_only) {
        // refer to: decodeNumber16ExCell in robx/pzprjs => Encode.js

        var number_list = {};
        var ec = 0,
            i = 0;
        var skipped_bottom = false;

        // Top row, bottom row, left column and then right column
        for (i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i)
            if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
                number_list[ec] = parseInt(this.gridurl.substr(i, 1), 16);
            } else if (ca === "-") {
                number_list[ec] = parseInt(this.gridurl.substr(i + 1, 2), 16);
                i += 2;
            } else if (ca === ".") {
                number_list[ec] = '?';
            } else if (ca >= "g" && ca <= "z") {
                ec += parseInt(ca, 36) - 16;
            }

            ec++;
            if (top_left_only && !skipped_bottom && ec >= this.cols) {
                skipped_bottom = true;
                ec += this.cols; // Skip bottom row if top_left_only
            }
            if (top_left_only && ec >= 2 * this.cols + this.rows) {
                break; // Finished top and left
            }
            if (ec >= this.rows * 2 + this.cols * 2) {
                break; // Finished all four sides
            }
        }

        // Reduce the URL by removing the Number information
        this.gridurl = this.gridurl.substr(i + 1);

        return number_list;
    }

    drawNumbersExCell(pu, info_number, style, sub_mode, hide_ques) {
        var cell;
        for (var i in info_number) {
            i = parseInt(i);
            // Top row, bottom row, left column and then right column
            if (i < this.cols) { // Top Row
                cell = pu.nx0 * 2 + 2 + i + 1;
            } else if (i < 2 * this.cols) { // Bottom Row
                cell = pu.nx0 * (2 + this.rows + 1) + 2 + (i - this.cols) + 1;
            } else if (i < 2 * this.cols + this.rows) { // Left Column 
                cell = pu.nx0 * (2 + (i - 2 * this.cols) + 1) + 2;
            } else {
                cell = pu.nx0 * (2 + (i - 2 * this.cols - this.rows) + 1) + 2 + this.cols + 1;
            }
            var number = hide_ques && info_number[i] === "?" ? " " : info_number[i];
            pu["pu_q"].number[cell] = [number, style, sub_mode];
        }
    }

    decodeKakuro() {
        // 0 means no restriction
        // first inner clues, then outer row clue and then outer column clue
        // outer row and column will only have one values. Inner clue has two values. If not existing then it can be 0 or -1.
        // dot means not part of grid
        // outer row empty clue is not part of URL if adjacent cell is used, else it includes -1 in the URl.

        var inner_clues = {},
            outer_row = {},
            outer_column = {};
        var c = 0,
            a = 0;

        // Inner clues
        for (var i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i);
            if (ca >= "k" && ca <= "z") {
                // Decodes cell position
                c += parseInt(ca, 36) - 19;
            } else {
                // Decodes cell value
                if (ca !== ".") {
                    inner_clues[c] = [this.decval(ca), this.decval(this.gridurl.charAt(i + 1))];
                    i++;
                } else {
                    inner_clues[c] = -1; // cell not part of grid
                }
                c++;
            }
            // break the loop after inner clues are done
            if (c >= this.rows * this.cols) {
                a = i + 1;
                break;
            }
        }

        // reset parameters
        var i = a;

        // Outer row
        for (var bx = 0; bx < this.cols; bx++) {
            if (bx in inner_clues) {
                outer_row[bx] = -1;
            } else {
                outer_row[bx] = this.decval(this.gridurl.charAt(i));
                i++;
            }
        }

        // Outer column
        for (var by = 0; by < this.rows; by++) {
            if (by * this.cols in inner_clues) {
                outer_column[by] = -1;
            } else {
                outer_column[by] = this.decval(this.gridurl.charAt(i));
                i++;
            }
        }

        var obj = new Object();
        obj.inner_clues = inner_clues;
        obj.outer_row = outer_row;
        obj.outer_column = outer_column;
        return obj;
    }

    decodeKakuru() {
        // Refer to: decodeKakuru in robx/pzprjs => src/variety/kakuru.js

        var number_list = {};
        var c = 0;

        for (var i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i);
            if (ca === "+" || ca === "_") {
                number_list[c] = "?";
            } else if (ca >= "k" && ca <= "z") {
                // Decodes cell position
                c += parseInt(ca, 36) - 19;
            } else if (ca !== ".") {
                number_list[c] = this.decval(ca);
            }

            c++;
            if (c >= this.rows * this.cols) {
                break;
            }
        }

        this.gridurl = this.gridurl.substr(i);
        return number_list;
    }

    decval(ca) {
        if (ca >= "0" && ca <= "9") {
            return parseInt(ca, 36);
        } else if (ca >= "a" && ca <= "j") {
            return parseInt(ca, 36);
        } else if (ca >= "A" && ca <= "Z") {
            return parseInt(ca, 36) + 10;
        }
        return -1;
    }

    decodeNumber36(max_length = Infinity) {
        // refer to: decodeHitori in robx/pzprjs => hitori.js
        var number_list = [];
        var i = 0;
        let c = 0;

        for (i = 0; i < this.gridurl.length; i++) {
            const char = this.gridurl[i];
            if (char === "-") {
                number_list[c] = parseInt(this.gridurl.substr(i + 1, 2), 36);
                i += 2;
            } else if (char === "%") {
                number_list[c] = "?";
            } else if (char === ".") {
                number_list[c] = " ";
            } else {
                number_list[c] = parseInt(char, 36);
            }

            c++;
            if (c >= max_length) {
                break;
            }
        }

        // Remove what was parsed so the next function call reads what is left
        this.gridurl = this.gridurl.substr(i);

        return number_list;
    }

    decodeNumber10(max_length = Infinity) {
        // refer to: decodeNumber10 in robx/pzprjs => Encode.js

        var number_list = {};
        var i = 0;
        var c = 0;

        for (i = 0; i < this.gridurl.length; i++) {
            var char = this.gridurl.charAt(i);
            if (char === '.') {
                number_list[c] = '?';
            } else if (char >= "0" && char <= "9") {
                number_list[c] = parseInt(char);
            } else if (char >= "a" && char <= "z") {
                c += parseInt(char, 36) - 10;
            }
            c++;

            if (c >= max_length) {
                break;
            }
        }

        // Remove what was parsed so the next function call reads what is left
        this.gridurl = this.gridurl.substr(i + 1);

        return number_list;
    }

    decodeNumber4(max_length = Infinity) {
        // refer to: decode4Cell & decode4Cross in robx/pzprjs => Encode.js

        var number_list = {};
        var i = 0;
        var c = 0;

        for (i = 0; i < this.gridurl.length; i++) {
            const char = this.gridurl[i];
            if (char === '.') {
                number_list[c] = '?';
            } else if (char >= "0" && char <= "4") {
                number_list[c] = parseInt(char);
            } else if (char >= "5" && char <= "9") {
                number_list[c] = parseInt(char) - 5;
                c += 1;
            } else if (char >= "a" && char <= "e") {
                number_list[c] = parseInt(char, 16) - 10;
                c += 2;
            } else if (char >= "g" && char <= "z") {
                c += parseInt(char, 36) - 16;
            }
            c += 1;

            if (c >= max_length) {
                break;
            }
        }

        this.gridurl = this.gridurl.substr(i + 1);

        return number_list;
    }

    decodeNumber3(max_length = Infinity) {
        // refer to: genericDecodeTriple in robx/pzprjs => Encode.js

        var number_list = [];
        var c = 0;

        for (var char of this.gridurl) {
            var int = parseInt(char, 27);
            number_list.push(
                parseInt(int / 9) % 3,
                parseInt(int / 3) % 3,
                parseInt(int / 1) % 3,
            );

            c += 3;
            if (c >= max_length) {
                break;
            }
        }
        // Remove what was parsed
        this.gridurl = this.gridurl.substr(number_list.length / 3);

        if (isFinite(max_length)) {
            // reshape number_list to fit with board size
            number_list = number_list.slice(0, max_length);
        }

        return number_list;
    }

    decodeNumber2(max_length = Infinity) {
        // refer to: decode1Cell in robx/pzprjs => Encode.js

        var number_list = {};
        var c = 0;
        var i = 0;

        for (i = 0; i < this.gridurl.length; i++) {
            var char = this.gridurl.charAt(i);
            if (char >= "0" && char <= "h") {
                number_list[c] = "1";
                c += parseInt(char, 36);
            } else {
                c += parseInt(char, 36) - 18;
            }

            c++;
            if (c >= max_length) {
                break;
            }
        }

        this.gridurl = this.gridurl.substr(i + 1);

        return number_list;
    }

    decodeNumber2Binary(max_length = Infinity) {
        // refer to: genericDecodeBinary in robx/pzprjs => Encode.js

        var number_list = [];
        var c = 0;

        for (var char of this.gridurl) {
            var int = parseInt(char, 36);
            number_list.push(
                parseInt(int / 16) % 2,
                parseInt(int / 8) % 2,
                parseInt(int / 4) % 2,
                parseInt(int / 2) % 2,
                parseInt(int / 1) % 2,
            );

            c += 5;
            if (c >= max_length) {
                break;
            }
        }
        // Remove what was parsed
        this.gridurl = this.gridurl.substr(number_list.length / 5);

        if (isFinite(max_length)) {
            // reshape number_list to fit with board size
            number_list = number_list.slice(0, max_length);
        }

        return number_list;
    }

    drawBinary2Surface(pu, info, style) {
        var row_ind, col_ind, cell;
        var row_offset = pu.space[0];
        var col_offset = pu.space[2];

        for (var i in info) {
            if (info[i] === 0) continue;

            // Determine which row and column
            row_ind = parseInt(i / this.cols) + row_offset;
            col_ind = i % this.cols + col_offset;
            cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
            pu["pu_q"].surface[cell] = style;
        }
    }

    decodeCrossMark(border_type = -1) {
        // refer to decodeCrossMark in robx/pzprjs => Encode.js
        // border_type = -1: shrink to inner grid, 0: no change (for compatibility), 1: expand to outer grid

        var cc = 0,
            i = 0,
            crossmark_list = {};
        var rows = this.rows + (border_type),
            cols = this.cols + (border_type);

        for (i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i);

            if (this.include(ca, "0", "9") || this.include(ca, "a", "z")) {
                cc += parseInt(ca, 36);
                if (cc >= cols * rows) {
                    i++;
                    break;
                }
                crossmark_list[cc] = 1;
            } else if (ca === ".") {
                cc += 35;
            }

            cc++;
            if (cc >= cols * rows) {
                i++;
                break;
            }
        }

        // Remove what was parsed so the next function call reads what is left
        this.gridurl = this.gridurl.substr(i);
        return crossmark_list;
    }

    drawCrossMark(pu, info, symbol, style, border_type = -1) {
        // border_type = -1: shrink to inner grid, 0: no change (for compatibility), 1: expand to outer grid
        // this parameter should be consistent with that in decodeCrossMark

        var i, row_ind, col_ind, cell;
        var cp = (border_type === 1) ? 1 : 0;

        for (i in info) {
            row_ind = parseInt(i / (this.cols + (border_type))) - cp + pu.space[0]; // border shrink/expand + offset
            col_ind = (i % (this.cols + (border_type))) - cp + pu.space[2]; // border shrink/expand + offset
            cell = pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
            if (info[i] === 1) {
                pu["pu_q"].symbol[cell] = [style, symbol, 2]; // 2 for behind line
            }
        }
    }

    moveNumbersToRegionCorners(info_edge, info_number) {
        var cols = this.cols,
            rows = this.rows;
        var ds = new DisjointSets(cols * rows);

        var x, y, cell, right_edge = 0,
            bottom_edge = (cols - 1) * rows;
        for (cell = 0; cell < cols * rows; cell++) {
            x = cell % cols;
            y = parseInt(cell / cols);
            if (x !== cols - 1) {
                if (!info_edge[right_edge]) {
                    ds.combineSets(cell, cell + 1);
                }
                right_edge++;
            }
            if (y !== rows - 1) {
                if (!info_edge[bottom_edge]) {
                    ds.combineSets(cell, cell + cols);
                }
                bottom_edge++;
            }
        }

        var regions = ds.getSets();

        // Regions are ordered row-wise
        regions.sort((region1, region2) => Math.min(...region1) - Math.min(...region2));

        // But cells in each region are ordered column-wise for some reason
        regions = regions.map(
            (region) => region.sort((a, b) =>
                100 * (a % cols - b % cols) + (a / cols - b / cols))
        );

        // Put the numbers in the first cell of their respective region
        var new_numbers = {};
        for (var i in info_number) {
            new_numbers[regions[i][0]] = info_number[i];
        }
        return new_numbers;
    }

    decodeMidloop() {
        // Refer to: decodeDot in robx/pzprjs => Encode.js

        // Every cell, corner and edge is a point, unless it is on the grid edge.
        // Small even digits are white dots. Small odd digits are black dots.
        // Large digits/characters are spacing
        var points = {};
        var i = 0;
        for (var char of this.gridurl) {
            char = parseInt(char, 36);
            if (0 <= char && char < 16) {
                points[i] = char % 2;
                i += parseInt(char / 2) + 1;
            } else {
                i += char - 15;
            }
        }
        return points;
    }

    drawMidloop(pu, info, behind_line = 2) {
        var row_ind, col_ind, cell;
        for (var i in info) {
            row_ind = parseInt(i / (2 * this.cols - 1));
            col_ind = i % (2 * this.cols - 1);
            if (row_ind % 2 === 0 && col_ind % 2 === 0) {
                // cell center
                row_ind = (row_ind) / 2;
                col_ind = (col_ind) / 2;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
            } else if (col_ind % 2 === 0) {
                // vertical edge
                row_ind = (row_ind - 1) / 2;
                col_ind = (col_ind) / 2;
                cell = 2 * pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
            } else if (row_ind % 2 === 0) {
                // horizonal edge
                row_ind = (row_ind) / 2;
                col_ind = (col_ind - 1) / 2;
                cell = 3 * pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
            } else {
                // corner/vertex
                row_ind = (row_ind - 1) / 2;
                col_ind = (col_ind - 1) / 2;
                cell = pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
            }
            pu["pu_q"].symbol[cell] = [info[i] + 1, "circle_SS", behind_line];
        }
    }

    drawKurarin(pu, info, enable_sansa = false, behind_line = 2) {
        var row_ind, col_ind, cell;
        const kurarin_dot_map = [2, 5, 1];
        for (var i in info) {
            for (var j = 2 * i; j < 2 * i + 2; j++) {
                var dot = j === 2 * i ? (info[i] >> 2) & 3 : info[i] & 3;
                if (dot === 0) continue;

                row_ind = parseInt(j / (2 * this.cols - 1));
                col_ind = j % (2 * this.cols - 1);

                if (row_ind % 2 === 0 && col_ind % 2 === 0) {
                    // cell center
                    row_ind = (row_ind) / 2;
                    col_ind = (col_ind) / 2;
                    cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

                    if (enable_sansa && dot === 1) {
                        // special judge for sansa road triangles
                        pu["pu_q"].symbol[cell] = [1, "tridown_M", behind_line];
                        continue;
                    }
                } else if (col_ind % 2 === 0) {
                    // vertical edge
                    row_ind = (row_ind - 1) / 2;
                    col_ind = (col_ind) / 2;
                    cell = 2 * pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
                } else if (row_ind % 2 === 0) {
                    // horizonal edge
                    row_ind = (row_ind) / 2;
                    col_ind = (col_ind - 1) / 2;
                    cell = 3 * pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
                } else {
                    // corner/vertex
                    row_ind = (row_ind - 1) / 2;
                    col_ind = (col_ind - 1) / 2;
                    cell = pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
                }

                pu["pu_q"].symbol[cell] = [kurarin_dot_map[dot - 1], "circle_SS", behind_line];
            }
        }
    }

    decodeYajilinArrows(parsing_castle = false) {
        // refer to: decodeArrowNumber16 in robx/pzprjs => Encode.js

        // Arrows start with one number giving direction and the next giving the number
        var arrows = {};
        var i = 0;
        var c = 0;
        var shading = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            if ("a" <= ca && ca <= "z") {
                c += parseInt(ca, 36) - 9;
                i++;

                if (c >= this.rows * this.cols) {
                    break;  // limit for the board size
                }

                continue;
            }

            if (parsing_castle) {
                shading = parseInt(ca);
                i++;
                ca = this.gridurl.charAt(i);
            }

            var number_length = ca === "-" ? 3 : 1;
            if (ca === "-") {
                i++;
                ca = this.gridurl.charAt(i);
            }

            var direc = parseInt(ca);
            number_length += parseInt(direc / 5);

            var cell_value = this.gridurl.substr(i + 1, number_length);
            if (cell_value === ".") {
                cell_value = "";
            } else {
                cell_value = "" + parseInt(cell_value, 16);
            }
            arrows[c] = [direc % 5, cell_value, shading]; // [direction, number, shading]
            i += number_length + 1;
            c += 1;
        }

        this.gridurl = this.gridurl.substr(i);
        return arrows;
    }

    decodeTapa() {
        var strings = "?12345";
        var number_list = {};
        var i = 0;
        var c = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            if (("0" <= ca && ca <= "9") || ca === ".") {
                if (ca === ".") {
                    number_list[c] = "?";
                } else {
                    number_list[c] = ca === "9" ? "1111" : ca;
                }
                i++;
                c++;
            } else if ("a" <= ca && ca <= "f") {
                var n = parseInt(this.gridurl.substr(i, 2), 36) - 360;
                if (n < 36) {
                    number_list[c] = strings[parseInt(n / 6)] + strings[n % 6];
                } else if (n < 100) {
                    n -= 36;
                    number_list[c] = strings[parseInt(n / 16)] + strings[parseInt((n % 16) / 4)] + strings[n % 4];
                } else if (n < 116) {
                    // These values are technically impossible to input, but they are included for completeness-sake
                    n -= 100;
                    number_list[c] = (n & 4 ? "1" : "?") + (n & 8 ? "1" : "?") + (n & 2 ? "1" : "?") + (n & 1 ? "1" : "?");
                }
                i += 2;
                c++;
            } else {
                i++;
                c += parseInt(ca, 36) - 15;
            }
        }

        return number_list;
    }

    decodeTapaLoop() {
        // Annoyingly, TapaLoop has a slightly different encoding than Tapa
        var number_list = {};
        var i = 0;
        var c = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            if (("0" <= ca && ca <= "8") || ca === ".") {
                number_list[c] = ca === "." ? "?" : ca;
                i++;
                c++;
            } else if (("a" <= ca && ca <= "f") || ca === "-" || ca === "+") {
                var n, numbers_per_cell, mod;
                if (ca === "-") {
                    numbers_per_cell = 4;
                    mod = 6;
                    n = parseInt(this.gridurl.substr(i + 1, 2), 36) - 36;
                    i += 3
                } else if (ca === "+") {
                    numbers_per_cell = 3;
                    mod = 7;
                    n = parseInt(this.gridurl.substr(i + 1, 2), 36) - 36;
                    i += 3
                } else {
                    numbers_per_cell = 2;
                    mod = 8;
                    n = parseInt(this.gridurl.substr(i, 2), 36) - 360;
                    i += 2;
                }

                var s = "";
                for (var j = 0; j < numbers_per_cell; j++) {
                    s = (n % mod || "?") + s;
                    n = parseInt(n / mod);
                }

                if (numbers_per_cell === 4) {
                    // puzzlink places numbers clockwise while penpa places top to bottom, left to right
                    s = s[1] + s[0] + s[2] + s[3];
                }

                number_list[c] = s;
                c++;
            } else {
                i++;
                c += parseInt(ca, 36) - 15;
            }
        }

        return number_list;
    }

    decodeRailPool() {
        var c = 0,
            i = 0,
            number_list = {},
            off = false,
            bd = this.board;

        for (i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i);

            if (this.include(ca, "0", "j")) {
                while (this.include(ca, "0", "j")) {
                    var curNum = 0;
                    while (this.include(ca, "a", "j")) {
                        var curDigit = parseInt(ca, 36) - 10;
                        curNum = (curNum + curDigit) * 10;
                        ca = this.gridurl.charAt(++i);
                    }
                    curNum += parseInt(ca, 10);
                    if (!number_list[c]) {
                        number_list[c] = [];
                    }
                    number_list[c].push(curNum === 0 ? "?" : +ca);
                    ca = this.gridurl.charAt(++i);
                }
                i--;
                c++;
                off = true;
            } else if (this.include(ca, "k", "z")) {
                c += parseInt(ca, 36) - 19;
                if (off) {
                    c--;
                }
                off = false;
            }

            if (c >= this.rows * this.cols || ca === "/") {
                break;
            }
        }
        this.gridurl = this.gridurl.substr(i + 1);
        if (this.gridurl[0] === "/") {
            this.gridurl = this.gridurl.substr(1);
        }

        return number_list;
    }

    decodeCompass(max_length = Infinity) {
        // slightly different from decodeNumber16 (with encoded gray surfaces)
        // if there are no side effects from other puzzles, this function might be merged into decodeNumber16

        var number_list = {};
        var i = 0;
        var c = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            var res = this.readNumber16(ca, i);
            if (res[0] !== -1) {
                number_list[c] = res[0];
                i += res[1];
                c++;
            } else if (ca === "_") {
                // padding for gray cells in compass puzzle
                number_list[c] = -1;
                number_list[c + 1] = -1;
                number_list[c + 2] = -1;
                number_list[c + 3] = -1;
                c += 4;
                i++;
            } else if (ca >= "g" && ca <= "z") {
                c += parseInt(ca, 36) - 15;
                i++;
            } else {
                i++;
            }

            if (c >= max_length) {
                break;
            }
        }

        // Remove what was parsed so the next function call reads what is left
        this.gridurl = this.gridurl.substr(i);

        return number_list;
    }

    drawCompass(pu, info_number) {
        // Compass numbers are given as groups of four numbers
        // Compass lists them in a different order than Penpa+
        var number_order = [0, 3, 2, 1];
        var indexes = Object.keys(info_number).sort((a, b) => a - b);
        var shading_flag = false;

        for (var compass_index = 0; compass_index < indexes.length; compass_index += 4) {
            var cell_index = indexes[compass_index] - compass_index * (3 / 4);
            var row_ind = parseInt(cell_index / this.cols);
            var col_ind = cell_index % this.cols;
            var cell = 8 * (pu.ny0 * pu.nx0) + 4 * (pu.nx0 * (2 + row_ind) + 2 + col_ind);

            for (var j = 0; j < 4; j++) {
                if (info_number[indexes[compass_index + j]] === -1) {
                    // deal with shaded cells (gray) in compass puzzle
                    shading_flag = true;
                    break;
                }

                var number = info_number[indexes[compass_index + j]];
                pu["pu_q"].numberS[cell + number_order[j]] = [number === "?" ? " " : number, 1];
                shading_flag = false;
            }

            cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
            if (!shading_flag) {
                pu["pu_q"].symbol[cell] = [1, "compass", 1];
            } else {
                pu["pu_q"].surface[cell] = 4;
            }
        }
    }

    decodeNurimaze() {
        var number_list = {};
        var shape_list = {};
        var i = 0;
        var c = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            var res = this.readNumber16(ca, i);
            if (ca === "1") {
                number_list[c] = "S";
            } else if (ca === "2") {
                number_list[c] = "G";
            } else if (ca === "3") {
                shape_list[c] = "o";
            } else if (ca === "4") {
                shape_list[c] = "t";
            } else if ((ca >= "5" && ca <= "9") || (ca >= "a" && ca <= "z")) {
                c += parseInt(ca, 36) - 5;
            }
            i++;
            c++;
        }
        var obj = new Object();
        obj.number_list = number_list;
        obj.shape_list = shape_list;
        return obj;
    }

    decodeTateyoko() {
        let info_number = {};
        let cell_index = 0,
            index;
        for (index = 0; index < this.gridurl.length; index++) {
            let char = this.gridurl[index];
            // value = [number, is background shaded?]
            let value = null;

            if (char === "x") {
                value = ["", true];
            } else if (this.include(char, "o", "s")) {
                value = [parseInt(char, 29) - 24, true];
            } else if (this.include(char, "0", "9") || this.include(char, "a", "f")) {
                value = [parseInt(char, 16), false];
            } else if (char === "-") {
                value = [parseInt(this.gridurl.substr(index + 1, 2), 16), false];
                index += 2;
            } else if (char === "i") {
                cell_index += parseInt(this.gridurl[index + 1], 16);
                index++;
                continue;
            } else {
                cell_index++;
                continue;
            }

            info_number[cell_index] = value;
            cell_index++;

            if (cell_index >= this.cols * this.rows) {
                break;
            }
        }

        this.gridurl = this.gridurl.substr(this.cols * this.rows);

        return info_number;
    }

    decodeBox() {
        var number_list1 = {};
        var number_list2 = {};
        var ec = 0,
            i = 0;
        var skipped_bottom = false;

        for (var i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i);
            if (ca === "-") {
                number_list1[ec] = parseInt(this.gridurl.substr(i + 1, 2), 32);
                i += 2;
            } else {
                number_list1[ec] = parseInt(ca, 32);
            }

            ec++;
            if (!skipped_bottom && ec >= this.cols) {
                skipped_bottom = true;
                // append numbers for bottom row
                for (var j = 0; j < this.cols; j++) number_list2[ec + j] = j + 1;
                ec += this.cols;
            }

            if (ec >= 2 * this.cols + this.rows) {
                // append numbers for rightmost column
                for (var j = 0; j < this.rows; j++) number_list2[ec + j] = j + 1;
                ec += this.rows;
            }

            if (ec >= this.rows * 2 + this.cols * 2) {
                break; // Finished all four sides
            }
        }

        return [number_list1, number_list2];
    }

    decodeAnglers() {
        var number_list1 = {};
        var number_list2 = {};
        var extra_list = {};
        var i = 0;
        var c = 0;
        const clen = this.cols * this.rows;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            var res = this.readNumber16(ca, i);
            if (res[0] !== -1) {
                var val = res[0] === 0 ? -3 : res[0] > 0 ? res[0] - 1 : res[0];

                if (val === 0 || val === -3) {
                    extra_list[c] = val; // fish or shaded cells must be inside of the grid
                } else {
                    if (c >= clen) {
                        number_list1[c - clen] = val; // numbers outside of the grid
                    } else {
                        number_list2[c] = val; // numbers inside the grid
                    }
                }

                i += res[1];
                c++;
            } else if (ca >= "g" && ca <= "z") {
                c += parseInt(ca, 36) - 15;
                i++;
            } else {
                i++;
            }
        }

        // Remove what was parsed so the next function call reads what is left
        this.gridurl = this.gridurl.substr(i);

        return [number_list1, number_list2, extra_list];
    }

    decodeMinarism() {
        var number_list = {};
        var ec = 0,
            i = 0;

        // There are no limits for this type yet
        for (i = 0; i < this.gridurl.length; i++) {
            var ca = this.gridurl.charAt(i)
            if (this.include(ca, "0", "9") || this.include(ca, "a", "f")) {
                number_list[ec] = parseInt(this.gridurl.substr(i, 1), 16);
            } else if (ca === "-") {
                number_list[ec] = parseInt(this.gridurl.substr(i + 1, 2), 16);
                i += 2;
            } else if (ca === "g") {
                number_list[ec] = "<";  // the smaller operator
            } else if (ca === "h") {
                number_list[ec] = ">";  // the larger operator
            } else if (ca === ".") {
                number_list[ec] = '?';
            } else if (ca >= "i" && ca <= "z") {
                ec += parseInt(ca, 36) - 18;
            }

            ec++;
        }

        this.gridurl = this.gridurl.substr(i + 1);
        return number_list;
    }

    drawOpia(pu, info_number) {
        var row_ind, col_ind, cell;
        for (var i in info_number) {
            // Determine which row and column
            row_ind = parseInt(i / this.cols);
            col_ind = i % this.cols;
            cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

            var is_up = (info_number[i] & 1) ? 1 : 0;
            var is_down = (info_number[i] & 2) ? 1 : 0;
            var is_left = (info_number[i] & 4) ? 1 : 0;
            var is_right = (info_number[i] & 8) ? 1 : 0;

            pu["pu_q"].symbol[cell] = [[is_left, is_up, is_right, is_down], "arrow_cross", 1]
        }
    }
}

class DisjointSets {
    constructor(max) {
        this.map = {};
        for (var i = 0; i < max; i++) {
            this.map[i] = i;
        }
    }

    combineSets(a, b) {
        a += '';
        b += '';
        while (this.map[a] !== a) {
            a = this.map[a];
        }
        while (this.map[b] !== b) {
            b = this.map[b];
        }

        this.map[a] = b;
    }

    flattenMaps() {
        for (var i in this.map) {
            var indirectMaps = [];
            while (this.map[i] !== this.map[this.map[i]]) {
                indirectMaps.push(i);
                i = this.map[i];
            }
            for (var j of indirectMaps) {
                this.map[j] = this.map[i];
            }
        }
    }

    getSets() {
        this.flattenMaps();
        var inverted = {};
        for (var i in this.map) {
            var ind = this.map[i];
            inverted[ind] = inverted[ind] || [];
            inverted[ind].push(i);
        }
        return Object.values(inverted);
    }
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

    if ((cols > pu.gridmax['square']) || (rows > pu.gridmax['square'])) {
        errorMsg(PenpaText.get('puzzlink_row_column', pu.gridmax['square'].toString()));
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
        case "suguru":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "number");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16(rows * cols);

            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            if (type === "ripple") {
                puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);
            } else {
                puzzlink_pu.drawNumbers(pu, info_number, 1, "1");
            }

            if (type === "suguru") {
                info_surface = puzzlink_pu.decodeNumber2Binary();
                puzzlink_pu.drawBinary2Surface(pu, info_surface, 4); // 4 is for Black Surface
            }

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
                suguru: "suguru (capsules)",
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
                errorMsg(PenpaText.get('sudoku_size_unsupported', `${cols}x${rows}`));
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
        case "kakuru":
        case "numrope":
        case "sananko":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "number");

            if (type === "numrope") {
                info_line = puzzlink_pu.decodeBorder();
                for (var i in info_line) {
                    if (info_line[i] === 1) {
                        // Determine Vertical Border or Horizontal
                        if (i < (cols - 1) * rows) {
                            row_ind = parseInt(i / (cols - 1));
                            col_ind = i % (cols - 1);
                            edgex = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                            edgey = edgex + 1;
                        } else {
                            i -= (cols - 1) * rows; // offset to 0
                            row_ind = parseInt(i / cols);
                            col_ind = i % cols;
                            edgex = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                            edgey = edgex + pu.nx0;
                        }
                        var key = edgex.toString() + "," + edgey.toString();
                        pu["pu_q"]["line"][key] = 5;
                    }
                }
            }

            info_number = puzzlink_pu.decodeKakuru();
            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].surface[cell] = 4;

                style = type === "kakuru" ? 6 : 7;
                if (info_number[i] !== "?") {
                    pu["pu_q"].number[cell] = [info_number[i], style, "1"];
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal"];
            pu.user_tags = [type === "numrope" ? "number rope" : type];
            break;
        case "aqre":
        case "ayeheya":
        case "chocona":
        case "cocktail":
        case "heyawacky": // heyawake alias
        case "heyawake":
        case "heyablock":
        case "hinge":
        case "mannequin":
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
                case "cocktail":
                    pu.user_tags = ['cocktail lamp'];
                    break;
                case "mannequin":
                    pu.user_tags = ['mannequin gate'];
                    break;
                default:
                    pu.user_tags = [type];
            }
            break;
        case "martini":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style

            info_number = puzzlink_pu.decodeNumber16();
            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                number = info_number[i] === "?" ? " " : info_number[i];

                if (number === 0) {
                    pu["pu_q"].symbol[cell] = [2, "circle_L", 1];
                } else {
                    pu["pu_q"].number[cell] = [number, 6, "1"];
                }
            }

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("surface"); //include redraw
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = ['martini'];
            break;
        case "island":
        case "kurochute":
        case "kurodoko":
        case "kurotto":
        case "nurikabe":
        case "nurimisaki":
        case "oasis":
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
                case "island":
                    pu.user_tags = ['Inaba\'s island'];
                    break;
                default:
                    pu.user_tags = [type];
            }
            break;
        case "lither":
        case "slitherlink":
        case "slither": // slitherlink alias
        case "tslither":
        case "vslither":
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
            switch (type) {
                case "lither":
                    pu.user_tags = ["lither (litherslink)"];
                    break;
                case "tslither":
                    pu.user_tags = ["tslither (touch slitherlink)"];
                    break;
                case "vslither":
                    pu.user_tags = ["vslither (vertex slitherlink)"];
                    break;
                case "slither":
                case "slitherlink":
                    pu.user_tags = ["slitherlink"];
                    break;
            }
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
        case "nothing":
        case "pearl": // masyu alias
        case "wblink":
            pu = new Puzzle_square(cols, rows, size);
            if (type === "wblink") {
                // Don't draw any of the grid
                pu.mode_grid("nb_grid3");
                pu.mode_grid("nb_lat2");
                pu.mode_grid("nb_out2");
            } else {
                pu.mode_grid("nb_grid2"); // Dashed gridlines
            }
            setupProblem(pu, "combi");

            if (type === 'moonsun' || type === 'nothing') {
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
                pu["pu_q"].symbol[cell] = [info_number[i], value, type === "wblink" ? 2 : 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            if (type === "nothing") {
                pu.user_tags = ['all or nothing'];
            } else if (type === "moonsun") {
                pu.user_tags = ['moon or sun'];
            } else if (type === "wblink") {
                pu.user_tags = ['shirokuro-link'];
            } else {
                pu.user_tags = ["masyu"];
            }
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
        case "nothree":
        case "nuriuzu":
            pu = new Puzzle_square(cols, rows, size);
            if (type === "nuriuzu") {
                pu.mode_grid("nb_grid2"); // Dashed gridlines
            }
            setupProblem(pu, "surface");

            info_edge = puzzlink_pu.decodeMidloop();
            puzzlink_pu.drawMidloop(pu, info_edge);

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = [type];
            break;
        case "castle":
        case "hebi":
        case "snakes": // hebi alias
        case "kuroclone":
        case "tetrochain":
        case "yajikazu":
        case "yajilin":
        case "yajirin": // yajilin alias
        case "yajitatami":
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

            if (type === "kuroclone") {
                info_edge = puzzlink_pu.decodeBorder();
                puzzlink_pu.drawBorder(pu, info_edge, 2);
            }

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

                puzzlink_pu.addBorderForContinousPart(pu, row_ind, col_ind, type === "castle");
            }
            
            if (type === "yajitatami") {
                info_edge = puzzlink_pu.decodeBorder();
                puzzlink_pu.drawBorder(pu, info_edge, 2);
            }

            pu.mode_qa("pu_a");
            if (type === "yajikazu" || type === "tetrochain" || type === "kuroclone") {
                pu.mode_set("surface");
                UserSettings.tab_settings = ["Surface"];
            } else if (type === "hebi") {
                pu.mode_set("number");
                UserSettings.tab_settings = ["Surface", "Number Normal"];
            } else {
                pu.mode_set("combi");
                pu.subcombimode(type === "yajitatami" ? "edgesub" : "linex");
                UserSettings.tab_settings = ["Surface", "Composite"];
            }

            // Convert the abreviated type name to the long form
            map_genre_tag = {
                castle: "castlewall",
                tetrochain: "tetrochain-Y",
                yajikazu: "yajikazu (yajisan-kazusan)",
                hebi: "hebi-ichigo",
            }
            // Set tags
            pu.user_tags = [map_genre_tag[type] || type];
            break;
        case "koburin":
        case "retsurin":
            var skip_shading = true;

            // changes the url format to indicate shading or not
            if (urldata[1] === "b") {
                skip_shading = false;
                cols = parseInt(urldata[2]);
                rows = parseInt(urldata[3]);
                puzzlink_pu = new Puzzlink(cols, rows, urldata[4]);
            }

            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            if (type === "koburin") {
                info_number = puzzlink_pu.decodeNumber4();
            }

            if (type === "retsurin") {
                info_number = puzzlink_pu.decodeNumber16();
            }

            if (skip_shading) {
                puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);
            } else {
                for (var i in info_number) {
                    // Determine which row and column
                    row_ind = parseInt(i / cols);
                    col_ind = i % cols;
                    cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                    number = info_number[i] === "?" ? " " : info_number[i];
                    pu["pu_q"].number[cell] = [number, 1, "1"];
                    pu["pu_q"].surface[cell] = 3; // Light gray background
                    puzzlink_pu.addBorderForContinousPart(pu, row_ind, col_ind);
                }
            }

            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = [type];
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
        case "simplegako":
        case "squarejam":
        case "symmarea":
        case "view":
            if (type === "fillomino01") type = "fillomino";

            pu = new Puzzle_square(cols, rows, size);
            if (type !== "view" && type !== "simplegako") {
                pu.mode_grid("nb_grid2"); // Dashed grid lines
            }
            setupProblem(pu, type === "squarejam" ? "combi" : "number");

            info_number = puzzlink_pu.decodeNumber16(rows * cols);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            if (type === "fillomino") {
                info_edge = puzzlink_pu.decodeBorder();
                puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            }

            pu.mode_qa("pu_a");
            pu.mode_set(type === "squarejam" ? "combi" : "number");
            if (type === "squarejam") pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Edge Normal", "Number Normal"];

            // Set tags
            switch (type) {
                case "fillomino":
                    pu.user_tags = ['fillomino'];
                    break;
                case "symmarea":
                    pu.user_tags = ['symmetry area'];
                    break;
                default:
                    pu.user_tags = [type];
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
        case "mukkonn":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeCompass();
            puzzlink_pu.drawCompass(pu, info_number);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode(type === "compass" ? "edgesub" : "linex");
            UserSettings.tab_settings = ["Surface", type === "compass" ? "Edge Normal" : "Line Normal", "Composite"];

            // Set tags
            pu.user_tags = [type === "compass" ? "compass" : "mukkonn enn"];
            break;
        case "coral":
        case "cts":
        case "japanesesums":
        case "nonogram":
            if (type === "japanesesums") puzzlink_pu = new Puzzlink(cols, rows, urldata[4]); // intercept for extra number

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
                pu["pu_q"].number[cell] = [info_number[i] === 0 && type === "cts" ? "*" : info_number[i], 1, "1"];
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
            if (type === "cts") pu.user_tags = ["cross the streams"];
            else pu.user_tags = [type];
            break;
        case "bag": // cave alias
        case "cave":
        case "cityspace":
        case "context":
        case "corral": // cave alias
        case "correl": // cave alias
        case "mochikoro":
        case "mochinyoro":
        case "norinuri":
        case "nuribou":
        case "smullyan":
            if (type === "bag" || type === "corral" || type === "correl") {
                type = "cave";
            }
            pu = new Puzzle_square(cols, rows, size);
            if (type === "cave" || type === "cityspace") {
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
            if (type === "smullyan") pu.user_tags = ["smullyan (smullyanic dynasty)"];
            else pu.user_tags = [type];
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
            document.getElementById("nb_space3").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16ExCell(true);
            puzzlink_pu.drawNumbersExCell(pu, info_number, 1, "1", false);

            info_number = puzzlink_pu.decodeNumber2();
            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols) + 1; // row offset
                col_ind = i % cols + 1; // col offset
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
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
            document.getElementById("nb_space3").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);
            setupProblem(pu, "combi");

            // Add snake ends
            info_number = puzzlink_pu.decodeNumber3(cols * rows);
            for (i in info_number) {
                if (info_number[i] === 0) {
                    continue;
                }
                row_ind = parseInt(i / cols) + 1; // row offset
                col_ind = i % cols + 1; // col offset
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
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
        case "arukone":
        case "dominion":
        case "geradeweg":
        case "nikoji":
        case "numlin": // numberlink alias
        case "numberlink":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            var style = type === "geradeweg" ? 6 : 1;
            info_number = puzzlink_pu.decodeNumber16();

            if (["arukone", "dominion", "nikoji"].includes(type)) {
                var string_map = "0ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                for (var i in info_number) {
                    info_number[i] = string_map[info_number[i]] || info_number[i];
                }
            }
            puzzlink_pu.drawNumbers(pu, info_number, style, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            if (type === "dominion") pu.subcombimode("blpo");
            else if (type === "nikoji") pu.subcombimode("edgesub");
            else pu.subcombimode("linex");

            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            switch (type) {
                case "numlin":
                case "numberlink":
                    pu.user_tags = ['numberlink'];
                    break;
                default:
                    pu.user_tags = [type];
            }
            break;
        case "pentominous":
        case "tetrominous":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16(rows * cols);
            var string_map = type === "pentominous" ? "FILNPTUVWXYZ" : "ILOST";
            for (var i in info_number) {
                if (info_number[i] === string_map.length) {
                    row_ind = parseInt(i / cols);
                    col_ind = i % cols;
                    cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                    pu["pu_q"].surface[cell] = 4;
                    delete info_number[i]; // remove the key for shaded cells
                    continue;
                }
                info_number[i] = string_map[info_number[i]] || info_number[i];
            }
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = [type];
            break;
        case "simpleloop":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed lines
            setupProblem(pu, "combi");

            info_surface = puzzlink_pu.decodeNumber2Binary();
            puzzlink_pu.drawBinary2Surface(pu, info_surface, 4);

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
        case "creek":
        case "gokigen":
        case "nibunnogo":
            // Outside padding
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);

            if (type === "gokigen") {
                pu.mode_grid("nb_grid2"); // Dashed gridlines
                pu.mode_grid("nb_out2"); // No grid frame
                setupProblem(pu, "lineE");
            } else {
                setupProblem(pu, "combi");
            }

            info_number = puzzlink_pu.decodeNumber4();

            for (var i in info_number) {
                row_ind = 2 + parseInt(i / (cols + 1));
                col_ind = 2 + i % (cols + 1);
                cell = pu.nx0 * pu.ny0 + pu.nx0 * row_ind + col_ind;
                value = info_number[i] === "?" ? " " : info_number[i];
                pu["pu_q"].number[cell] = [value, 6, "1"];
            }

            pu.mode_qa("pu_a");

            if (type === "gokigen") {
                pu.mode_set("lineE");
                pu.submode_check("sub_lineE2");
                UserSettings.tab_settings = ["Edge Diagonal"];
            } else {
                pu.mode_set("combi");
                pu.subcombimode("blpo");
                UserSettings.tab_settings = ["Surface", "Composite"];
            }

            pu.user_tags = [type === "gokigen" ? 'slant (gokigen)' : type]; // Genre Tags
            break
        case "lightshadow":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            for (var i in info_number) {
                if (isNaN(info_number[i])) continue;

                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                number = info_number[i];

                // odd number are black, even numbers are white
                if (number % 2 === 0) {
                    number = number === 0 ? "?" : number / 2;
                    pu["pu_q"].number[cell] = [number, 1, "1"];
                } else {
                    number = number === 1 ? "?" : (number - 1) / 2;
                    pu["pu_q"].number[cell] = [number, 4, "1"];
                    pu["pu_q"].surface[cell] = 4; // black background
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface"];
            pu.user_tags = ['light and shadow']; // Genre Tags
            break;
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

            info_surface = puzzlink_pu.decodeNumber2Binary();
            puzzlink_pu.drawBinary2Surface(pu, info_surface, 4);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Edge Normal", "Composite"];
            pu.user_tags = ['double back']; // Genre Tags
            break;
        case "circlesquare":
        case "statuepark":
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
            pu.subcombimode(type === "yinyang" ? "blwh" : "blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = [type === "yinyang" ? 'yin-yang' : type]; // Genre Tags
            break;
        case "dosufuwa":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            info_shade = puzzlink_pu.decodeCrossMark(0);
            puzzlink_pu.drawBinary2Surface(pu, info_shade, 4);  // encoding compatible with this

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blwh");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ['dosufuwa (dosun-fuwari)']; // Genre Tags
            break;
        case "kramma":
        case "kramman":
            var enable_dots = true;

            if (urldata[1] === "c") {
                enable_dots = false;
                cols = parseInt(urldata[2]);
                rows = parseInt(urldata[3]);
                puzzlink_pu = new Puzzlink(cols, rows, urldata[4]);
            }

            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            if (enable_dots) {
                info_crossmark = puzzlink_pu.decodeCrossMark();
                puzzlink_pu.drawCrossMark(pu, info_crossmark, "circle_SS", 2); // 2 for black circle
            }

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
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            map_genre_tag = {
                "kramma": "kaitoramma",
                "kramman": "new kaitoramma"
            };

            pu.user_tags = [map_genre_tag[type] || type]; // Genre Tags
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
        case "fivecells":
        case "fourcells":
        case "heteromino":
        case "nawabari":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed grid lines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber10();
            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                number = info_number[i];

                if (number === 7) {
                    // deal with holes in the grid
                    if (type === "heteromino") {
                        pu["pu_q"].surface[cell] = 4; // Black background
                    } else {
                        pu["pu_q"].surface[cell] = 3; // Light Gray background
                        puzzlink_pu.addBorderForContinousPart(pu, row_ind, col_ind, true);
                    }
                } else {
                    pu["pu_q"].number[cell] = [number, 1, "1"];
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = [type === "nawabari" ? "territory (nawabari)" : type]; // Set tags
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
        case "aquarium":
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space3").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);
            setupProblem(pu, "combi");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            var puzzlink_nb = new Puzzlink(cols, rows, urldata[4]);
            info_number = puzzlink_nb.decodeNumber16ExCell(true);
            puzzlink_nb.drawNumbersExCell(pu, info_number, 1, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["aquarium"];
            break;
        case "box":
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);
            setupProblem(pu, "number");

            [info_number1, info_number2] = puzzlink_pu.decodeBox();
            puzzlink_pu.drawNumbersExCell(pu, info_number1, 1, "1", false);
            puzzlink_pu.drawNumbersExCell(pu, info_number2, 6, "1", false);

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal"];
            pu.user_tags = ["box"];
            break;
        case "alter":
        case "hakoiri":
        case "tontonbeya":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "symbol");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            info_number = puzzlink_pu.decodeNumber10();
            for (i in info_number) {
                if (![1, 2, 3].includes(info_number[i])) continue;
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                pu["pu_q"].symbol[cell] = [info_number[i], "ox_B", 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("symbol");
            UserSettings.tab_settings = ["Surface", "Shape"];

            switch (type) {
                case "alter":
                    pu.user_tags = ["alternation"];
                    break;
                case "hakoiri":
                    pu.user_tags = ["hakoiri (Hakoiri-masashi)"];
                    break;
                case "tontonbeya":
                    pu.user_tags = ["tontonbeya"];
                    break;
            }
            break;
        case "anglers":
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space2").value = 1;
            document.getElementById("nb_space3").value = 1;
            document.getElementById("nb_space4").value = 1;

            pu = new Puzzle_square(cols + 2, rows + 2, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            [info_number_ex, info_number, info_extra] = puzzlink_pu.decodeAnglers();
            puzzlink_pu.drawNumbersExCell(pu, info_number_ex, 1, "1", false);
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1", false);

            for (var i in info_extra) {
                row_ind = parseInt(i / cols) + 1; // top offset
                col_ind = (i % cols) + 1; // left offset
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                if (info_extra[i] === 0) {
                    pu["pu_q"].symbol[cell] = [3, "tents", 1]; // fish symbol
                } else {
                    pu["pu_q"].surface[cell] = 4; // shaded cell
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["anglers"];
            break;
        case "doppelblock":
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space3").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);
            setupProblem(pu, "number");

            info_number_ex = puzzlink_pu.decodeNumber16ExCell(true);
            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbersExCell(pu, info_number_ex, 1, "1");
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal"];
            pu.user_tags = ["doppelblock"];
            break;
        case "aquapelago":
            info_number = puzzlink_pu.decodeNumber16();

            pu = new Puzzle_square(cols, rows, size);
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

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["aquapelago"];
            break;
        case "barns":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber2Binary(rows * cols);
            puzzlink_pu.drawBinary2Surface(pu, info_number, 5); // 5 is for icy/water style

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["barns"];
            break;
        case "battleship":
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space3").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);
            setupProblem(pu, "combi");

            info_exnumber = puzzlink_pu.decodeNumber16ExCell(true);
            puzzlink_pu.drawNumbersExCell(pu, info_exnumber, 1, "1", true);

            info_number = puzzlink_pu.decodeNumber16();
            const battleship_map = [7, 4, 6, 3, 5, 2, 1];
            const battleship_map_plus = [2, 3, 1, 4];

            for (i in info_number) {
                row_ind = parseInt(i / cols) + 1; // row offset
                col_ind = (i % cols) + 1; // column offset
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                if (info_number[i] >= 0 && info_number[i] < 7) {
                    pu["pu_q"].symbol[cell] = [battleship_map[info_number[i]], "battleship_B", 1];
                } else if (info_number[i] >= 7 && info_number[i] < 11) {
                    pu["pu_q"].symbol[cell] = [battleship_map_plus[info_number[i] - 7], "battleship_B+", 1];
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("battleship");
            UserSettings.tab_settings = ["Surface", "Shape", "Composite"];
            pu.user_tags = ["battleship"];
            break;
        case "bdblock":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_crossmark = puzzlink_pu.decodeCrossMark(1);
            puzzlink_pu.drawCrossMark(pu, info_crossmark, "circle_SS", 2, 1); // 2 for black circle

            puzzlink_nb = new Puzzlink(cols, rows, urldata[4]);
            info_number = puzzlink_nb.decodeNumber16();
            puzzlink_nb.drawNumbers(pu, info_number, 1, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["border block"];
            break;
        case "bosanowa":
            if (urldata[1] === "t" || urldata[1] === "h") {
                // all the unused cells are shaded in black
                cols = parseInt(urldata[2]);
                rows = parseInt(urldata[3]);
                puzzlink_pu = new Puzzlink(cols, rows, urldata[4]);
            }
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "number");

            info_shade = puzzlink_pu.decodeNumber2Binary(rows * cols);
            puzzlink_pu.drawBinary2Surface(pu, info_shade, 4);

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal"];
            pu.user_tags = ["bosanowa (bossa nova)"];
            break;
        case "familyphoto":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_shade = puzzlink_pu.decodeNumber2Binary(rows * cols);
            info_number = puzzlink_pu.decodeNumber16();

            // Add numbers to grid
            for (var i in info_shade) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
                number = info_number[i] ? info_number[i] : "";
                if (info_shade[i] === 1) {
                    pu["pu_q"].number[cell] = [number, 7, "1"];  // White number in circle
                } else {
                    pu["pu_q"].number[cell] = [number, 1, "1"];  // Black number
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["family photo"];
            break;
        case "kazunori":
        case "minarism":
        case "wafusuma":
            pu = new Puzzle_square(cols, rows, size);
            if (type === "wafusuma") pu.mode_grid("nb_grid2");
            setupProblem(pu, "number");

            if (type === "kazunori") {
                info_edge = puzzlink_pu.decodeBorder();
                puzzlink_pu.drawBorder(pu, info_edge, 2);
            }

            info_number = (type === "minarism") ? puzzlink_pu.decodeMinarism() : puzzlink_pu.decodeNumber16();
            for (var i in info_number) {
                var border_type = -1;
                if (i < (cols - 1) * rows) {
                    row_ind = parseInt(i / (cols - 1));
                    col_ind = i % (cols - 1);
                    border_type = 3;
                    cell = border_type * pu.nx0 * pu.ny0 + pu.nx0 * (row_ind + 2) + col_ind + 2;
                } else {
                    var tmp = i - (cols - 1) * rows;
                    row_ind = parseInt(tmp / cols);
                    col_ind = tmp % cols;
                    border_type = 2;
                    cell = border_type * pu.nx0 * pu.ny0 + pu.nx0 * (row_ind + 2) + col_ind + 2;
                }

                if (type === "minarism" && ["<", ">"].includes(info_number[i])) {
                    const symbolValue = border_type === 3
                        ? (info_number[i] === "<" ? 1 : 3)
                        : (info_number[i] === "<" ? 2 : 4);
                    pu["pu_q"].symbol[cell] = [symbolValue, "inequality", 2];
                    continue;
                }

                number = info_number[i] === "?" ? " " : info_number[i];
                pu["pu_q"].number[cell] = [number, 6, "6"];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            UserSettings.tab_settings = ["Surface", "Number Normal"];
            pu.user_tags = [type === "kazunori" ? "kazunori room" : type];
            break;
        case "myopia":
        case "pentopia":
            pu = new Puzzle_square(cols, rows, size);
            if (type === "myopia") {
                // Draw grid dots only
                pu.mode_grid("nb_grid3");
                pu.mode_grid("nb_lat1");
                pu.mode_grid("nb_out2");
            }
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawOpia(pu, info_number);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode(type === "myopia" ? "edgesub" : "blpo");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = [type];
            break;
        case "nagare":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            const nagare_map = { 1: 3, 2: 7, 3: 1, 4: 5 };
            info_number = puzzlink_pu.decodeNumber10();
            for (var i in info_number) {
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

                var number = info_number[i];
                if (number === 5) {
                    // black background only
                    pu["pu_q"].surface[cell] = 4;
                } else if (number >= 5 && number <= 9) {
                    // black background with white arrows
                    pu["pu_q"].surface[cell] = 4;
                    pu["pu_q"].symbol[cell] = [nagare_map[number - 5], "arrow_B_W", 1];
                } else if (number >= 1 && number <= 4) {
                    // white background with black arrows
                    pu["pu_q"].symbol[cell] = [nagare_map[number], "arrow_B_B", 1];
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["nagare (nagareru-loop)"];
            break;
        case "nondango":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "symbol");

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            info_number = puzzlink_pu.decodeNumber2Binary(rows * cols);
            for (var i in info_number) {
                // Determine which row and column
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

                if (info_number[i] !== 0) continue;
                pu["pu_q"].symbol[cell] = [4, "circle_M", 1];
            }

            pu.mode_qa("pu_a");
            pu.mode_set("symbol");
            pu.subsymbolmode("circle_M"); // can't override composite mode over symbols, so use subsymbolmode instead
            UserSettings.tab_settings = ["Surface", "Shape"];
            pu.user_tags = [type];
            break;
        case "railpool":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeRailPool();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "4", false);

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2);

            info_shade = puzzlink_pu.decodeNumber2Binary(rows * cols);
            puzzlink_pu.drawBinary2Surface(pu, info_shade, 4);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["rail pool"];
            break;
        case "tatamibari":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            const tatamibari_map = { 1: 2, 2: 1, 3: 5 };
            info_number = puzzlink_pu.decodeNumber4();
            for (i in info_number) {
                number = info_number[i];
                row_ind = parseInt(i / cols);
                col_ind = i % cols;
                cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;

                if (number === "?") {
                    pu["pu_q"].number[cell] = [number, 1, "1"];
                } else {
                    pu["pu_q"].symbol[cell] = [tatamibari_map[number] || number, "line", 1];
                }
            }

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi"); //include redraw
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ["tatamibari"];
            break;
        case "voxas":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "combi");

            // Decode URL
            const voxas_map = { 2: 2, 3: 5, 4: 1 };
            info_number = puzzlink_pu.decodeNumber4();
            for (var i in info_number) {
                info_number[i]++;
                number = info_number[i];
                if (i < (cols - 1) * rows) {
                    row_ind = parseInt(i / (cols - 1));
                    col_ind = i % (cols - 1);
                    cell = 3 * pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
                } else {
                    i -= (cols - 1) * rows; //offset to 0
                    row_ind = parseInt(i / cols);
                    col_ind = i % cols;
                    cell = 2 * pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 2 + col_ind;
                }
                if (number >= 2 && number <= 4) {
                    pu["pu_q"].symbol[cell] = [voxas_map[number], "circle_SS", 2];
                }
            }
            puzzlink_pu.drawBorder(pu, info_number, 2);

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("combi"); //include redraw
            pu.subcombimode("edgesub");
            UserSettings.tab_settings = ["Surface", "Composite"];

            // Set tags
            pu.user_tags = ["voxas"];
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
        case "dotchi2":
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
            pu.user_tags = [type === "dotchi" ? "dotchi-loop" : "dotchi-dotchi loop"];
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
            info_surface = puzzlink_pu.decodeNumber2Binary();
            puzzlink_pu.drawBinary2Surface(pu, info_surface, 4);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("rassisillai");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["rassi silai"]; // Genre Tags
            break;
        case "batten":
            document.getElementById("nb_space1").value = 1;
            document.getElementById("nb_space3").value = 1;

            pu = new Puzzle_square(cols + 1, rows + 1, size);
            setupProblem(pu, "combi");

            info_crossmark = puzzlink_pu.decodeCrossMark();
            puzzlink_pu.drawCrossMark(pu, info_crossmark, "sudokuetc", 1); // Large square
            info_number = puzzlink_pu.decodeNumber16ExCell(true);
            puzzlink_pu.drawNumbersExCell(pu, info_number, 1, "1");

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];
            pu.user_tags = ["battenberg painting"];
            break;
        case "keywest":
            pu = new Puzzle_square(cols, rows, size);

            // Don't draw any of the grid
            pu.mode_grid("nb_grid3");
            pu.mode_grid("nb_lat2");
            pu.mode_grid("nb_out2");
            setupProblem(pu, "number");

            info_number = puzzlink_pu.decodeNumber4();
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1");

            for (i = 0; i < rows; i++) {
                for (j = 0; j < cols; j++) {
                    cell = pu.nx0 * (2 + i) + 2 + j;
                    pu["pu_q"].symbol[cell] = [1, "circle_L", 2]; // Circle all cells
                }
            }

            pu.mode_qa("pu_a");
            pu.mode_set("number");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Number Normal", "Composite"];

            // Set tags
            pu.user_tags = ['key west'];
            break;
        case "kurarin":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawKurarin(pu, info_number);

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = [type]; // Set tags
            break;
        case "kuromenbun":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            // Decode URL
            info_edge = puzzlink_pu.decodeBorder();
            info_number = puzzlink_pu.decodeNumber16(rows * cols);

            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style
            puzzlink_pu.drawNumbers(pu, info_number, 1, "1") // Black Style, Normal submode is 1

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("surface"); //include redraw
            UserSettings.tab_settings = ["Surface"];

            // Set tags
            pu.user_tags = [type];
            break;
        case "tetrochaink":
        case "sansaroad":
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            info_number = puzzlink_pu.decodeNumber16();
            puzzlink_pu.drawKurarin(pu, info_number, type === "sansaroad");

            pu.mode_qa("pu_a");
            pu.mode_set("surface");
            UserSettings.tab_settings = ["Surface"];

            pu.user_tags = [type === "tetrochaink" ? "tetrochain-k" : "sansa road"]; // Set tags
            break;
        case "portal":
            pu = new Puzzle_square(cols, rows, size);
            pu.mode_grid("nb_grid2"); // Dashed gridlines
            setupProblem(pu, "combi");

            info_number = puzzlink_pu.decodeNumber16(rows * cols);
            puzzlink_pu.drawNumbers(pu, info_number, 6, "1");

            info_shade = puzzlink_pu.decodeNumber2Binary(rows * cols);
            puzzlink_pu.drawBinary2Surface(pu, info_shade, 4); // 4 is for black shading

            pu.mode_qa("pu_a");
            pu.mode_set("combi");
            pu.subcombimode("linex");
            UserSettings.tab_settings = ["Surface", "Composite"];

            pu.user_tags = ["portal loop"]; // Set tags
            break;
        case "sumiwake":
            // Setup board
            pu = new Puzzle_square(cols, rows, size);
            setupProblem(pu, "surface");

            // Decode URL
            info_number = puzzlink_pu.decodeNumber4((rows + 1) * (cols + 1));
            for (var i in info_number) {
                row_ind = parseInt(i / (cols + 1));
                col_ind = i % (cols + 1);
                cell = pu.nx0 * pu.ny0 + pu.nx0 * (row_ind + 1) + col_ind + 1;
                value = info_number[i] === "?" ? " " : info_number[i];
                pu["pu_q"].symbol[cell] = [value, "circle_M", 1];
            }

            info_edge = puzzlink_pu.decodeBorder();
            puzzlink_pu.drawBorder(pu, info_edge, 2); // 2 is for Black Style

            // Change to Solution Tab
            pu.mode_qa("pu_a");
            pu.mode_set("surface"); //include redraw
            UserSettings.tab_settings = ["Surface"];

            // Set tags
            pu.user_tags = ["sumiwake"];
            break;
        default:
            errorMsg(PenpaText.get('puzzlink_not_supported', type));
            break;
    }

    // Set PenpaLite
    // document.getElementById('advance_button').value = "1";
    document.getElementById("mode_break").classList.add('is_hidden');
    document.getElementById("mode_txt_space").classList.add('is_hidden');
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
