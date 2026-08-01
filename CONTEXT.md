# Sudoku Variant Architecture

Shared language for organizing Sudoku variant definitions, their puzzle inputs, and their solving rules.

## Language

**Variant Descriptor**:
The sole authoritative definition of one catalog variant, including its identity, presentation, supported grid sizes, input interpretation, constraint registration, and loading. Legacy catalogs may be derived from it during migration.
_Avoid_: Variant file, full variant implementation

**Variant Registry**:
The build-generated collection of validated Variant Descriptors used by Node, the browser, and solver workers. Descriptor discovery is automatic; manually maintained installer lists are not registries.
_Avoid_: Installer list, variant catalog

**Variant ID**:
The stable normalized machine identity already used by solver matching, such as `antiking` or `oddevensum`. Human labels and historical spellings are aliases, not identities.
_Avoid_: Display name, constraint key

**Constraint Family**:
A reusable, versioned payload contract shared by related variants, such as edge relations, outside clues, or line constraints. It owns payload validation, JavaScript rule evaluation, affected-cell discovery, fixtures, and optional backend translation.
_Avoid_: Variant, category

**Constraint Instance**:
A parsed, registered rule occurrence consisting of a constraint-family type and its validated payload. Variant parsers emit instances; keyed arrays exist only as a compatibility representation during migration.
_Avoid_: Constraint array entry, raw clue

**Puzzle Evidence**:
The read-only, normalized representation of puzzle geometry and authored marks that variant parsers interpret. Core geometry and digits are eager; heavier mark indexes are frozen, lazy, and memoized, isolating descriptors from Penpa drawing layers, coordinate offsets, and mutable solver globals.
_Avoid_: Raw puzzle, parser context

**Puzzle Interpretation**:
The canonical result of resolving active Variant IDs against Puzzle Evidence, consisting of emitted Constraint Instances and Variant Diagnostics. Legacy keyed constraints are a derived compatibility view.
_Avoid_: Read constraints, parsed puzzle

**Variant Composition**:
The declared dependencies, implications, and conflicts among simultaneously active variants. Descriptors parse the same Puzzle Evidence independently; activation order carries no meaning.
_Avoid_: Parser ordering, implicit dependency

**Variant Diagnostic**:
A structured explanation that an active variant cannot be interpreted or solved, including its Variant ID and relevant clue location. Unknown variants, unsupported sizes, malformed required clues, and invalid Constraint Instances fail closed rather than producing a partial Sudoku solve.
_Avoid_: Console warning, unsupported list

**Parser Parity Fixture**:
A migration fixture that compares normalized Constraint Instances from a legacy parser and its replacement descriptor for the same puzzle evidence. Intentional corrections are named explicitly, and the legacy production branch is removed when parity is accepted.
_Avoid_: Snapshot test, duplicate production parser

**Solver Backend**:
An implementation that translates and solves a complete set of Constraint Instances. Backend selection is all-or-nothing for a solve; JavaScript is the required correctness fallback when another backend lacks any needed capability.
_Avoid_: Partial accelerator, constraint handler
