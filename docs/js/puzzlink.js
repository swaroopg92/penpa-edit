class Puzzlink {
    constructor(cols, rows, bstr) {
        this.cols = cols;
        this.rows = rows;
        this.gridurl = bstr;
    }

    decodeBorder() {
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
                    console.log(ca & twi[w] ? 1 : 0);
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
                    console.log(ca & twi[w] ? 1 : 0);
                    id++;
                }
            }
        }
    }

    decodeNumber16() {
        var i, pos1, pos2;
        var c = 0;

        // Identifying how many characters of the url includes border information and exclude those
        pos1 = Math.min((((this.cols - 1) * this.rows + 4) / 5) | 0, this.gridurl.length);
        pos2 = Math.min((((this.cols * (this.rows - 1) + 4) / 5) | 0) + pos1, this.gridurl.length);
        i = pos2;

        while (i < this.gridurl.length) {
            var ca = this.gridurl.charAt(i);
            var res = this.readNumber16(ca);
            if (res[0] !== -1) {
                console.log('cell', c, 'value', res[0]);
                i += res[1];
                c++;
            } else if (ca >= "g" && ca <= "z") {
                c += parseInt(ca, 36) - 15;
                i++;
            } else {
                i++;
            }
        }
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
            return [-2, 1];
        } else {
            return [-1, 0];
        }
    }

    include(ca, bottom, up) {
        return bottom <= ca && ca <= up;
    }
}