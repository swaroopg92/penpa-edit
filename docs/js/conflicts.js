class Conflicts {
    constructor(pu) {
        this.pu = pu;
        // Some validation functions or calculation functions may request the
        // same data multiple times on the same puzzle state, so we cache the
        // data and use get_data() to broker this.
        this.data_cache = [];
        // Answer numbers should be either blue, light blue, red, or green.
        this.permit_number_colors = new Set([2, 8, 9, 10]);
        // Fow now only check large numbers for conflicts.
        this.permit_number_size = new Set(["1"]);
        // Cache for more stable (question) data
        this.stable_cache = [];
    }

    reset() {
        this.data_cache = [];
        this.pu.conflict_cells = [];
    }

    get_data(item) {
        let function_name = 'calculate_' + item;
        if (!this.data_cache[function_name]) {
            // Don't have cached, calculate by running function.
            this.data_cache[function_name] = this[function_name]();
        }
        return this.data_cache[function_name];
    }

    //========================================================================
    // check_* function family:
    // Check solutions and mark any conflicts.
    //========================================================================

    // For an NxN grid, mark any duplicates between 1 and N as conflicts.
    check_latin_square() {
        const data = this.get_data('number_grid');
        const n = data.length;
        if (!n || data[0].length !== n) {
            // Empty or not square
            return;
        }
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const row_el = data[i][j];
                if (row_el >= 1 && row_el <= n) {
                    for (let k = j+1; k < n; k++) {
                        const el2 = data[i][k];
                        if (row_el === el2) {
                            this.add_conflict(j, i);
                            this.add_conflict(k, i);
                        }
                    }
                }

                const col_el = data[j][i];
                if (col_el >= 1 && col_el <= n) {
                    for (let k = j+1; k < n; k++) {
                        const el2 = data[k][i];
                        if (col_el === el2) {
                            this.add_conflict(i, j);
                            this.add_conflict(i, k);
                        }
                    }
                }
            }
        }
    }

    // Check for duplicate numbers on any of the 3 axes.
    check_latin_square_hex(){
        let hex_seen_cells = this.stable_lookup("hex_seen_cells","");
        // Calculate all pairs of cells which see each other along any of the 
        // three axes on a hex grid, and store pairs of cells as 
        // Map of [Smaller index number] = [List of larger index numbers]
        if (!hex_seen_cells){
            hex_seen_cells = new Map();
            //for each cell in centerlist
            for (let sourceIdx of this.pu.centerlist){
                //for each of the six directions:
                for (let dir = 0; dir < 6; dir++){
                    let targetIdx = this.pu.point[sourceIdx].adjacent[dir];
                    //until we find no more adjacencies:
                    while (this.pu.centerlist.indexOf(targetIdx) > -1){
                        //if this pair is not yet recorded, record it.
                        let lowIdx = Math.min(sourceIdx, targetIdx);
                        let highIdx = Math.max(sourceIdx, targetIdx);
                        if (!hex_seen_cells.has(lowIdx)){
                            hex_seen_cells.set(lowIdx,[highIdx]);
                        }else if (hex_seen_cells.get(lowIdx).indexOf(highIdx) == -1){
                            hex_seen_cells.get(lowIdx).push(highIdx);
                        }
                        targetIdx = this.pu.point[targetIdx].adjacent[dir];
                    }
                }
            }
            this.stable_store("hex_seen_cells", "", hex_seen_cells);
        }

        //do comparison between cells that see each other
        for (let cellIdx_list of hex_seen_cells){
            let sourceNum = this.read_number_cell(cellIdx_list[0]);
            for (let seen_cell of cellIdx_list[1]){
                if (sourceNum !== undefined && sourceNum === this.read_number_cell(seen_cell)){
                    //record conflict
                    this.add_conflict_cell(cellIdx_list[0]);
                    this.add_conflict_cell(seen_cell);
                }
            }
        }
    }

    // Check a classic sudoku puzzle.
    check_sudoku() {
        const data = this.get_data('number_grid');
        const n = data.length;
        if (n !== 9 || data[0].length !== 9) {
            // Not a 9x9 grid
            return;
        }
        this.check_latin_square();
        // Check 3x3 cells
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const el = data[i][j];
                if (!(el >= 1 && el <= n)) continue;

                // Get coordinates of this box's top-left corner
                let bi = 3*((i/3)|0);
                let bj = 3*((j/3)|0);

                for (let k = 0; k < 3; k++) {
                    for (let l = 0; l < 3; l++) {
                        let kk = bi + k;
                        let ll = bj + l;
                        if (kk === i && ll === j)
                            continue;
                        const el2 = data[kk][ll];
                        if (el2 === el)
                            this.add_conflict(ll, kk);
                    }
                }
            }
        }
    }

    // Check that consecutive values are only present exactly where bars are
    // between cells.
    check_consecutive() {
        const data = this.get_data('number_grid');
        const bars = this.get_data('grey_bars');

        // Helper subfunction. Checks the cell values and adds conflicts.
        const check_neighbors = function(x1, y1, index1, num1, x2, y2) {
            const index2 = this.xy_to_index(x2, y2);
            const num2 = data[y2][x2];
            if (isNaN(num2)) return;
            // Either zero or two of these should be true, otherwise we have a
            // conflict.
            const consecutive = Math.abs(num1 - num2) === 1;
            const has_bar = bars.has(index1 + ',' + index2);
            if (consecutive + has_bar === 1) {
                this.add_conflict(x1, y1);
                this.add_conflict(x2, y2);
            }
        }.bind(this);

        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                const index = this.xy_to_index(x, y);
                const num = data[y][x];
                if (isNaN(num)) continue;
                if (x + 1 < data[y].length) {
                    // Check right neighbor
                    check_neighbors(x, y, index, num, x + 1, y);
                }
                if (y + 1 < data.length) {
                    // Check down neighbor
                    check_neighbors(x, y, index, num, x, y + 1);
                }
            }
        }
    }

    // Check that consecutive values where bars/grey dots are between cells.
    check_consecutivepairs() {
        const data = this.get_data('number_grid');
        const bars = this.get_data('grey_bars');

        // Helper subfunction. Checks the cell values and adds conflicts.
        const check_neighbors = function(x1, y1, index1, num1, x2, y2) {
            const index2 = this.xy_to_index(x2, y2);
            const num2 = data[y2][x2];
            if (isNaN(num2)) return;
            // Either zero or two of these should be true, otherwise we have a
            // conflict.
            const consecutive = Math.abs(num1 - num2) === 1;
            const has_bar = bars.has(index1 + ',' + index2);
            if (has_bar && !consecutive) {
                this.add_conflict(x1, y1);
                this.add_conflict(x2, y2);
            }
        }.bind(this);

        for (let y = 0; y < data.length; y++) {
            for (let x = 0; x < data[y].length; x++) {
                const index = this.xy_to_index(x, y);
                const num = data[y][x];
                if (isNaN(num)) continue;
                if (x + 1 < data[y].length) {
                    // Check right neighbor
                    check_neighbors(x, y, index, num, x + 1, y);
                }
                if (y + 1 < data.length) {
                    // Check down neighbor
                    check_neighbors(x, y, index, num, x, y + 1);
                }
            }
        }
    }

    // Check Star Battle puzzle.
    check_star_battle() {
        // Assume that there is a single number in the grid with the number
        // of stars per row/col/region.
        const number_keys = Object.keys(this.pu.pu_q.number);
        if (number_keys.length !== 1) return;
        const star_number = this.pu.pu_q.number[number_keys[0]];
        if (!Array.isArray(star_number) || star_number.length !== 3) return;
        // This is the number of stars per row/col/region.
        const nstars = parseInt(star_number[0]);
        if (nstars <= 0) return;

        // Get grids
        const stars = this.get_data('star_grid');
        const regions = this.get_data('region_grid');
        const n = stars.length;
        if (!n || stars[0].length !== n || regions.length !== n ||
            regions[0].length !== n || regions.number_of_regions !== n) {
            // Unexpected grid data
            return;
        }

        // Helper function to check a neighbor. If (x2,y2) is also a star,
        // mark both as a conflict.
        const check_neighbor = function(x1, y1, x2, y2) {
            if (x2 < 0 || x2 >= n || y2 < 0 || y2 >= n) return;
            if (stars[y2][x2] === 0) return;
            this.add_conflict(x1, y1);
            this.add_conflict(x2, y2);
        }.bind(this);

        // Check neighbors
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                if (stars[y][x] === 0) continue;
                check_neighbor(x, y, x + 1, y); // Right
                check_neighbor(x, y, x - 1, y + 1); // Lower-left
                check_neighbor(x, y, x, y + 1); // Lower
                check_neighbor(x, y, x + 1, y + 1); // Lower-right
            }
        }

        // Check rows and column conflicts.
        for (let i = 0; i < n; i++) {
            let row_sum = 0;
            let col_sum = 0;
            for (let j = 0; j < n; j++) {
                row_sum += stars[i][j];
                col_sum += stars[j][i];
            }
            if (row_sum > nstars) {
                for (let j = 0; j < n; j++) this.add_conflict(j, i);
            }
            if (col_sum > nstars) {
                for (let j = 0; j < n; j++) this.add_conflict(i, j);
            }
        }

        // Stop here if we already found conflicts.
        if (this.has_conflicts()) return;

        // Check region conflicts.
        const region_sums = [];
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                if (!(regions[y][x] in region_sums)) {
                    region_sums[regions[y][x]] = 0;
                }
                region_sums[regions[y][x]] += stars[y][x];
            }
        }
        if (region_sums.every(function(x) { return x <= nstars; })) {
            // Region sums okay.
            return;
        }
        // Mark region conflicts.
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                if (region_sums[regions[y][x]] > nstars) {
                    this.add_conflict(x, y);
                }
            }
        }
    }

    // Check TomTom puzzle
    check_tomtom() {
        // Check if standard range or else return
        // Assume that there is a single number in the grid with the range
        const number_keys = Object.keys(this.pu.pu_q.number);
        if (number_keys.length !== 1) return;
        const number_data = this.pu.pu_q.number[number_keys[0]];
        if (number_data.length !== 3) return;
        const number_range = number_data[0];
        if (number_range.includes(",") || number_range.includes("<")) return;

        const data = this.get_data('number_grid');
        const regions = this.get_data('region_grid');
        const clues = this.get_data('tomtom_clues');
        const n = data.length;
        if (!n || data[0].length !== n ||
            regions.length !== n || regions[0].length !== n) {
            // Empty or not square or regions don't match numbers
            return;
        }

        // Check latin square first and return early if there are conflicts.
        this.check_latin_square();
        if (this.has_conflicts()) return;

        // Check bounds on numbers.
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const entry = data[y][x];
                if (typeof entry === 'undefined') continue;
                if (entry < 1 || entry > n) {
                    this.add_conflict(x, y);
                }
            }
        }
        if (this.has_conflicts()) return;

        const region_entries = new Array(regions.number_of_regions);
        for (let i = 0; i < regions.number_of_regions; i++) {
            region_entries[i] = [];
        }
        const region_full = new Array(regions.number_of_regions).fill(true);
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < n; x++) {
                const region = regions[y][x];
                const entry = data[y][x];
                if (typeof entry === 'undefined') {
                    region_full[region] = false;
                    continue;
                }
                region_entries[region].push(entry);
            }
        }
        for (let i = 0; i < regions.number_of_regions; i++) {
            const clue = clues[i].clue;
            const op = clues[i].op;
            if (!region_full[i] || typeof clue === 'undefined') {
                // Only check regions that are full and have a clue.
                continue;
            }
            const entries = region_entries[i];
            let conflict = false;
            if (typeof op !== 'undefined') {
                conflict = op(entries) !== clue;
            } else {
                // Try all the operations.
                conflict = this.tomtom_plus(entries) !== clue &&
                    this.tomtom_minus(entries) !== clue &&
                    this.tomtom_times(entries) !== clue &&
                    this.tomtom_divide(entries) !== clue;
            }
            if (conflict) {
                this.add_region_conflict(regions, i);
            }
        }
    }

    //========================================================================
    // calculate_* function family:
    // The purpose of these functions is to take the Puzzle instance, read the
    // question or answer data and produce meaningful data structures for
    // processing by check_* functions.
    //========================================================================

    // Get all the numbers from the grid (either question or answer) and
    // convert these to a 2D array.
    calculate_number_grid() {
        const nx = parseInt(this.pu.nx) - this.pu.space[2] - this.pu.space[3];
        const ny = parseInt(this.pu.ny) - this.pu.space[0] - this.pu.space[1];
        const grid = [];
        for (let i = 0; i < ny; i++) {
            let row = [];
            for (let j = 0; j < nx; j++) {
                row.push(this.read_number(j, i));
            }
            grid.push(row);
        }
        return grid;
    }

    // In consecutive sudoku puzzles there are bars between some cells.
    // Returns a set of sorted cell index pairs "index1,index2" for all cells
    // with a grey bar or white circle between them.
    calculate_grey_bars() {
        const bars = new Set();
        const symbol_indices = Object.keys(this.pu.pu_q.symbol);
        for (let index of symbol_indices) {
            const symbol = this.pu.pu_q.symbol[index];
            if (!Array.isArray(symbol) && (symbol[1] !== "bars_G" || symbol[1] !== "circle_SS")) {
                // Not a grey bar.
                continue;
            }
            const point = this.pu.point[index];
            if (!point || !point.neighbor || point.neighbor.length != 2 ||
                point.neighbor[0] == point.neighbor[1]) {
                // Unexpected neighbor data.
                continue;
            }
            const neighbor = point.neighbor.sort(function(a, b) { return a - b; });
            bars.add(neighbor.join(','));
        }
        return bars;
    }

    // Calculate grid of star positions in the answer.
    // Where stars are present, the value will be 1, and where stars are absent
    // the value will be 0.
    calculate_star_grid() {
        const nx = parseInt(this.pu.nx) - this.pu.space[2] - this.pu.space[3];
        const ny = parseInt(this.pu.ny) - this.pu.space[0] - this.pu.space[1];
        const grid = [];
        for (let y = 0; y < ny; y++) {
            let row = [];
            for (let x = 0; x < nx; x++) {
                const index = this.xy_to_index(x, y);
                const symbol = this.pu.pu_a.symbol[index];
                // Only look for stars.
                const have_star = Array.isArray(symbol) &&
                    symbol.length === 3 &&
                    symbol[0] === 2 &&
                    symbol[1] === "star";
                row.push(0 + have_star);
            }
            grid.push(row);
        }
        return grid;
    }

    // Calculate bold regions as a grid.
    calculate_region_grid() {
        const regiondata = this.pu.getregiondata(this.pu.ny, this.pu.nx, "pu_q", false);
        const regions = this.trim_space_from_grid(regiondata);

        // Count and renumber as we go.
        const renumber = [];
        let number_of_regions = 0;
        for (const row of regions) {
            for (let i = 0; i < row.length; i++) {
                if (!(row[i] in renumber)) {
                    renumber[row[i]] = number_of_regions;
                    number_of_regions++;
                }
                row[i] = renumber[row[i]];
            }
        }
        regions.number_of_regions = number_of_regions;
        return regions;
    }

    // Calculate top-left small numbers from question data as a grid.
    calculate_top_left_numbers() {
        // First calculate the index of type 4 points.
        const check_string = JSON.stringify(this.pu.pu_q.numberS);
        const lookup = this.stable_lookup('top_left_numbers', check_string);
        if (lookup) {
            // Already have this cached.
            return lookup;
        }
        const point_offset = this.find_first_point_with_type(4);
        const nx = parseInt(this.pu.nx) - this.pu.space[2] - this.pu.space[3];
        const ny = parseInt(this.pu.ny) - this.pu.space[0] - this.pu.space[1];
        const nx0 = parseInt(this.pu.nx0);
        const corner = 0; // Top-left
        const data = [];
        for (let y = 0; y < ny; y++) {
            const true_y = y + this.pu.space[0] + 2;
            const row = [];
            for (let x = 0; x < nx; x++) {
                const true_x = x + this.pu.space[2] + 2;
                const index = point_offset + (true_y * nx0 + true_x) * 4 + corner;
                const number = this.pu.pu_q.numberS[index];
                const entry = number && number[0];
                row.push(entry);
            }
            data.push(row);
        }
        this.stable_store('top_left_numbers', check_string);
        return data;
    }

    // Calculate the TomTom clues. Returns an array indexed by region number
    // with objects of the form {clue: number, op: operation}
    calculate_tomtom_clues() {
        const regions = this.get_data('region_grid');
        const top_left_numbers = this.get_data('top_left_numbers');
        // Borrow the check string for the stable cache from top_left_numbers.
        const check_string = JSON.stringify(regions) +
            JSON.stringify(top_left_numbers);
        const lookup = this.stable_lookup('tomtom_clues', check_string);
        if (lookup) {
            // Already have this cached.
            return lookup;
        }
        const nx = parseInt(this.pu.nx) - this.pu.space[2] - this.pu.space[3];
        const ny = parseInt(this.pu.ny) - this.pu.space[0] - this.pu.space[1];
        if (regions.length !== ny || regions[0].length !== nx ||
            regions.number_of_regions < 1) {
            return [];
        }
        const clues = new Array(regions.number_of_regions).fill({
            clue: undefined,
            op: undefined
        });
        for (let y = 0; y < ny; y++) {
            for (let x = 0; x < nx; x++) {
                const number = top_left_numbers[y][x];
                const region = regions[y][x];

                if (typeof clues[region].clue !== 'undefined') {
                    // Already have a clue in this region, ignoring.
                    continue;
                }
                if (typeof number !== 'string') {
                    continue;
                }

                const match = number.trim().match(/([0-9]+)([+÷/×*x–−-]?)$/);
                if (!match) continue; // Didn't understand clue.

                const result = parseInt(match[1]);
                if (isNaN(result)) continue; // Bad number.
                clues[region] = {
                    clue: result,
                    op: this.tomtom_map_operation(match[2])
                };
            }
        }
        this.stable_store('tomtom_clues', check_string);
        return clues;
    }

    //========================================================================
    // Helper functions
    //========================================================================

    // Read a single number from either the answer or question, that may be
    // any size but must be a shade of blue, green or red. The coordinates
    // x and y are relative to the puzzle grid.
    // Returns -1 if there is no number present of the designated color.
    read_number(x, y) {
        // Add space above and to the left.
        return this.read_number_cell(this.xy_to_index(x, y));
    }
    read_number_cell(index) {
        // For the question entry we check that it is black and large
        let entry = this.pu.pu_q.number[index];
        if (Array.isArray(entry) && entry.length === 3 &&
            entry[2] === "1" // Large
            &&
            entry[1] === 1 // black
            &&
            Number.isFinite(parseInt(entry[0]))) {
            return parseInt(entry[0]);
        }
        // For the answer entry we allow more colors/sizes
        entry = this.pu.pu_a.number[index];
        if (Array.isArray(entry) && entry.length === 3 &&
            this.permit_number_size.has(entry[2]) // Large
            &&
            this.permit_number_colors.has(entry[1]) // black
            &&
            Number.isFinite(parseInt(entry[0]))) {
            return parseInt(entry[0]);
        }
        return undefined;
    }

    // Add a cell as in conflict. The coordinates x and y are relative to the
    // puzzle grid.
    add_conflict(x, y) {
        // Add space above and to the left.
        this.add_conflict_cell(this.xy_to_index(x, y));
    }

    add_conflict_cell(index) {
        if (this.pu.conflict_cells.includes(index)) return;
        this.pu.conflict_cells.push(index);
    }

    // Add conflicts for a region using the region grid and index.
    add_region_conflict(regions, index) {
        for (let y = 0; y < regions.length; y++) {
            for (let x = 0; x < regions[y].length; x++) {
                if (regions[y][x] === index) {
                    this.add_conflict(x, y);
                }
            }
        }
    }

    // Return whether there are already conflicts found.
    has_conflicts() {
        return this.pu.conflict_cells.length > 0;
    }

    // Convert an (x,y) coordinate, relative to the puzzle grid, to the pu index.
    xy_to_index(x, y) {
        return this.pu.nx0 * (y + this.pu.space[0] + 2) + x + this.pu.space[2] + 2;
    }

    // Convert a pu index to an (x,y) coordinate. Returns an array [x,y].
    index_to_xy(index) {
        const x = (index % this.pu.nx0) - this.pu.space[2] - 2;
        const y = Math.floor(index / this.pu.nx0) - this.pu.space[0] - 2;
        return [x, y];
    }

    // When a grid is calculated in terms of nx/ny, it will have extra space
    // that we want to remove.
    trim_space_from_grid(grid) {
        grid.splice(0, this.pu.space[0]); // Remove rows in space above
        grid.splice(-this.pu.space[1], this.pu.space[1]); // Space below
        // Count and renumber as we go.
        for (const row of grid) {
            row.splice(0, this.pu.space[2]); // Space to the left
            row.splice(-this.pu.space[3], this.pu.space[3]); // Right
        }
        return grid;
    }

    // Lookup stable data
    stable_lookup(key, check_string) {
        if (this.stable_cache[key] &&
            this.stable_cache[key].check_string === check_string) {
            return this.stable_cache[key].data;
        }
        // Absent or data string doesn't match, needs to be recalculated
        return undefined;
    }

    // Store stable data
    stable_store(key, check_string, data) {
        this.stable_cache[key] = {
            check_string,
            data
        };
    }

    // Find the first point in the puzzle's point array with the given type
    // The type2 check is optional.
    // Returns -1 if no point with the given type is found.
    find_first_point_with_type(type, type2 = undefined) {
        const points = this.pu.point;
        for (let i = 0; i < points.length; i++) {
            if (points[i].type === type &&
                (typeof type2 === 'undefined' || points[i].type2 === type2)) {
                return i;
            }
        }
        return -1;
    }

    // Map a TomTom operation character to a calculation function.
    tomtom_map_operation(char) {
        switch (char) {
            case '+':
                return this.tomtom_plus.bind(this);
            case '×':
            case 'x':
            case '*':
                return this.tomtom_times.bind(this);
            case '-':
            case '–':
            case '−':
                return this.tomtom_minus.bind(this);
            case '÷':
            case '/':
                return this.tomtom_divide.bind(this);
            default:
                return undefined;
        }
    }

    // TomTom calculate plus over region.
    tomtom_plus(entries) {
        return entries.reduce(function(a, b) {
            return a + b;
        });
    }

    // TomTom calculate minus over region.
    tomtom_minus(entries) {
        const max = this.array_max(entries);
        const sum = this.tomtom_plus(entries);
        // Double the maximum value since we'll subtract it as part of the sum.
        return 2 * max - sum;
    }

    // TomTom calculate times over region.
    tomtom_times(entries) {
        return entries.reduce(function(a, b) {
            return a * b;
        });
    }

    // TomTom calculate divide over region.
    tomtom_divide(entries) {
        const max = this.array_max(entries);
        const product = this.tomtom_times(entries);
        // Square the maximum value since we'll divide it as part of the product.
        return max * max / product;
    }

    // Return the maximum element of an array.
    array_max(arr) {
        return Math.max(...arr);
    }
}
