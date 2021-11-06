class Conflicts {
    constructor() {
        this.sudoku_row = [];
        this.sudoku_col = [];
        this.sudoku_box = [];
        this.previous_ans = [];
    }

    check_classic(pu) {
        // console.log(pu);

        // Find first cell (if author added extra white space rows or columns)
        let first_classic_cell = pu.nx0 * (2 + pu.space[0]) + 2 + pu.space[2];

        for (var i = 0; i < parseInt(pu.ny); i++) {
            this.sudoku_row[i] = new Array(parseInt(pu.nx)).fill(-1);
            this.sudoku_col[i] = new Array(parseInt(pu.nx)).fill(-1);
            this.sudoku_box[i] = new Array(parseInt(pu.nx)).fill(-1);
        }

        // Update grid matrix
        // Better create the matrix at start when puzzle is loaded and then update live as user enters number rather than updating all 
        // cells again and again. Its inefficient. But then adding code to update data for each submode may also be lots of effort?
        for (var j = 2; j < pu.ny0 - 2; j++) {
            for (var i = 2; i < pu.nx0 - 2; i++) {
                let row = j - 2;
                let col = i - 2;
                let box = parseInt(row / 3) * 3 + parseInt(col / 3);
                if (pu.pu_q.number[i + j * (pu.nx0)] &&
                    pu.pu_q.number[i + j * (pu.nx0)][2] === "1" &&
                    !isNaN(pu.pu_q.number[i + j * (pu.nx0)][0])) {
                    this.sudoku_row[j - 2][i - 2] = parseInt(pu.pu_q.number[i + j * (pu.nx0)][0]);
                    this.sudoku_col[i - 2][j - 2] = parseInt(pu.pu_q.number[i + j * (pu.nx0)][0]);
                    this.sudoku_box[box][row * 3 + col] = parseInt(pu.pu_q.number[i + j * (pu.nx0)][0]);
                }
                if (pu.pu_a.number[i + j * (pu.nx0)] &&
                    pu.pu_a.number[i + j * (pu.nx0)][2] === "1" &&
                    !isNaN(pu.pu_a.number[i + j * (pu.nx0)][0])) {
                    this.sudoku_row[j - 2][i - 2] = parseInt(pu.pu_a.number[i + j * (pu.nx0)][0]);
                    this.sudoku_col[i - 2][j - 2] = parseInt(pu.pu_a.number[i + j * (pu.nx0)][0]);
                    this.sudoku_box[box][row * 3 + col] = parseInt(pu.pu_a.number[i + j * (pu.nx0)][0]);
                }
            }
        }
        // console.log('row', this.sudoku_row);
        // console.log('col', this.sudoku_col);
        // console.log('box', this.sudoku_box);

        // check row
        let duplicates = [];
        for (var j = 2; j < pu.ny0 - 2; j++) {
            duplicates = this.find_duplicates(this.sudoku_row[j - 2]);
            if (Object.keys(duplicates).length != 0) {
                let conflict_cells = [];
                for (var i = 2; i < pu.nx0 - 2; i++) {
                    conflict_cells.push(pu.nx0 * j + i);
                }
                return conflict_cells;
            }
        }

        // check column
        for (var j = 2; j < pu.ny0 - 2; j++) {
            duplicates = this.find_duplicates(this.sudoku_col[j - 2]);
            if (Object.keys(duplicates).length != 0) {
                let conflict_cells = [];
                for (var i = 2; i < pu.ny0 - 2; i++) {
                    conflict_cells.push(pu.nx0 * i + j);
                }
                return conflict_cells;
            }
        }

        // check region
        for (var j = 2; j < pu.ny0 - 2; j++) {
            duplicates = this.find_duplicates(this.sudoku_box[j - 2]);
            if (Object.keys(duplicates).length != 0) {
                let conflict_cells = [];
                let row = parseInt((j - 2) / 3) * 3 + 2;
                let col = ((j - 2) % 3) * 3 + 2;
                for (var i = row; i < (row + 3); i++) {
                    for (var k = col; k < (col + 3); k++) {
                        conflict_cells.push(pu.nx0 * i + k);
                    }
                }
                return conflict_cells;
            }
        }

        return [];
    }

    check_consecutive(pu) {
        // check row
        for (var j = 2; j < pu.ny0 - 2; j++) {
            for (var k = 0; k < pu.ny0 - 5; k++) {
                if (Math.abs(this.sudoku_row[j - 2][k] - this.sudoku_row[j - 2][k + 1]) === 1) {
                    let conflict_cells = [];
                    conflict_cells.push(pu.nx0 * j + k + 2);
                    conflict_cells.push(pu.nx0 * j + k + 3);
                    return conflict_cells;
                }
            }
        }

        // check column
        for (var j = 2; j < pu.ny0 - 2; j++) {
            for (var k = 0; k < pu.ny0 - 5; k++) {
                if (Math.abs(this.sudoku_col[j - 2][k] - this.sudoku_col[j - 2][k + 1]) === 1) {
                    let conflict_cells = [];
                    conflict_cells.push(pu.nx0 * (k + 2) + j);
                    conflict_cells.push(pu.nx0 * (k + 3) + j);
                    return conflict_cells;
                }
            }
        }

        return [];
    }

    find_duplicates(su_array) {
        const uniqueElements = new Set(su_array);
        const filteredElements = su_array.filter(item => {
            if (uniqueElements.has(item)) {
                uniqueElements.delete(item);
            } else if (item === -1) {
                uniqueElements.delete(item);
            } else {
                return item;
            }
        });

        return [...new Set(filteredElements)];
    }
}