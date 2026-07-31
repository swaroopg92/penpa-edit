# CSP variant modules

This directory is the extraction seam for variant-specific CSP logic.

- One file owns one constraint registry key.
- A module exports an installer that accepts the public `SudokuCSP` API.
- Handlers access board utilities through the `helpers` argument; they do not
  reach into the CSP core's closure.
- `index.js` is the CommonJS manifest.
- `browser.js` is generated from the source modules and loaded immediately
  after `sudoku_csp.js`, keeping browser delivery to one request.
- Shared constraint families use `relation_family.js`; each relation registers
  one validator while the family owns CSP dispatch.

Day 1 moved a pair constraint, a cage constraint, and a whole-grid constraint
through the seam. Day 2 moved the remaining standalone chess, adjacency,
parity, and neighborhood handlers. Day 3 fully split the twelve
`cellRelations` variants and introduced the generated browser bundle. Day 4
fully split the twenty-eight `edgeRelations` variants while retaining one
family-level CSP interface. Day 5 split the twelve `directionalMarks` variants
behind the same relation-family seam. Batches 6 and 7 split the fourteen
`catalogLines` variants and fourteen `quadRelations` variants. The shared
relation-family seam now preserves both partial and complete validators.
Batches 8 and 9 split all fifty-four `outsideRelations` variants across
forty-six cohesive modules, covering sightline/sequence rules first and
positional/arithmetic rules second. The final batch moved the remaining
twenty-three planned cage, region, clone, rank, Rossini, and palindrome
handlers into three cohesive directories.

The staged refactor roadmap is complete. Further extraction can follow the
same registry seam when a new maintenance need justifies it.

Further migrations should move existing tests with the handler instead of
adding a second implementation.
