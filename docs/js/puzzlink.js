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

    decodeNumber16() {
        var number_list = {};
        var i = 0;
        var c = 0;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            var res = this.readNumber16(ca);
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
        }

        return number_list;
    }

    readNumber16(ca) {
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
            if (ec >= this.rows * 4) {
                break;
            }
        }

        // Reduce the URL by removing the Number information
        this.gridurl = this.gridurl.substr(i + 1);

        return number_list;
    }

    decodeKakuro() {
        // 0 means no restiction
        // first inner clues, then outer row clue and then outer column clue
        // outer row and column will only have one values. Inner clue has two values. If not existence then it can be 0 or -1.
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
}