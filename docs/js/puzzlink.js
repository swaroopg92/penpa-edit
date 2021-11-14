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

        // Add edges to grid
        for (var i in info_edge) {
            if (info_edge[i] === 1) {
                // Determine Vertical Border or Horizontal
                if (i < (this.cols - 1) * this.rows) {
                    row_ind = parseInt(i / (this.cols - 1));
                    col_ind = i % (this.cols - 1);
                    // plus 1 at end because the 0 reference is from column 1 due to inside border
                    edgex = pu.nx0 * pu.ny0 + pu.nx0 * (1 + row_ind) + 1 + col_ind + 1;
                    edgey = edgex + pu.nx0;
                } else {
                    i -= (this.cols - 1) * this.rows; //offset to 0
                    row_ind = parseInt(i / this.cols);
                    col_ind = i % this.cols;
                    // 2 + row_ind, as 1st horizontal is the 0 reference
                    edgex = pu.nx0 * pu.ny0 + pu.nx0 * (2 + row_ind) + 1 + col_ind;
                    edgey = edgex + 1;
                }
                var key = edgex.toString() + "," + edgey.toString();
                pu["pu_q"]["lineE"][key] = edge_style;
            }
        }
    }

    decodeNumber16(max_iter = -1) {
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

            max_iter--;
            if (max_iter === 0) {
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
        } else if (ca === ".") {
            return ['?', 1];
        } else {
            return [-1, 0];
        }
    }

    drawNumbers(pu, info_number, style, sub_mode, hide_ques = true) {
        var row_ind, col_ind, cell, number;

        // Add numbers to grid
        for (var i in info_number) {
            // Determine which row and column
            row_ind = parseInt(i / this.cols);
            col_ind = i % this.cols;
            cell = pu.nx0 * (2 + row_ind) + 2 + col_ind;
            number = hide_ques && info_number[i] === "?" ? " " : info_number[i];
            pu["pu_q"].number[cell] = [number, style, sub_mode];
        }
    }

    include(ca, bottom, up) {
        return bottom <= ca && ca <= up;
    }

    decodeNumber16ExCell() {
        var number_list = {};
        var ec = 0,
            i = 0;

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
            if (ec >= this.rows * 2 + this.cols * 2) {
                break;
            }
        }

        // Reduce the URL by removing the Number information
        this.gridurl = this.gridurl.substr(i + 1);

        return number_list;
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

    decodeNumber4() {
        var number_list = {},
            i = 0;

        for (var char of this.gridurl) {
            if (char === '.') {
                number_list[i] = '?';
            } else if (char >= "0" && char <= "4") {
                number_list[i] = parseInt(char);
            } else if (char >= "5" && char <= "9") {
                number_list[i] = parseInt(char) - 5;
                i += 1;
            } else if (char >= "a" && char <= "e") {
                number_list[i] = parseInt(char, 16) - 10;
                i += 2;
            } else if (char >= "g" && char <= "z") {
                i += parseInt(char, 36) - 16;
            }
            i += 1;
        }

        return number_list;
    }

    decodeNumber3() {
        var number_list = [];

        for (var char of this.gridurl) {
            var int = parseInt(char, 36);
            number_list.push(
                parseInt(int / 9) % 3,
                parseInt(int / 3) % 3,
                parseInt(int / 1) % 3,
            );
        }

        return number_list;
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