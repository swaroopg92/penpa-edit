class Conflicts {
    constructor() {
        this.sudokumatrix = [];
        this.previous_ans = [];
    }

    check_classic(pu) {
        console.log(pu);

        if (this.sudokumatrix.length === 0) {
            console.log('enters')
            // Find first cell (if author added extra white space rows or columns)
            let first_classic_cell = pu.nx0 * (2 + pu.space[0]) + 2 + pu.space[2];

            for (var i = 0; i < parseInt(pu.ny); i++) {
                this.sudokumatrix[i] = new Array(parseInt(pu.nx)).fill(0);
            }
            console.log(this.sudokumatrix);
        }

        // Update grid matrix
        // Better create the matrix at start when puzzle is loaded and then update live as user enters number rather than updating all 
        // cells again and again. Its inefficient. But then adding code to update data for each submode may also be lots of effort?

        // check row

        // check column

        // check region
    }
}