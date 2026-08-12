import { variantMetadata, type Variation } from "./variationCatalog";

export type MarkPosition = "none" | "center" | "edge" | "corner" | "outside" | "multiple";

export type PenpaMark = {
    id: string;
    name: string;
    family: string;
    positions: MarkPosition[];
    penpaMode: string;
    description: string;
};

export type VariantMarkChoice = {
    position: MarkPosition;
    mark: string;
};

export type MarkConfig = {
    version: number;
    overrides: Record<string, VariantMarkChoice>;
};

export const positions: Array<{ id: MarkPosition; name: string; description: string }> = [
    { id: "none", name: "No placed mark", description: "The rule is global or is represented by the Sudoku grid itself." },
    { id: "center", name: "Cell center", description: "The mark is anchored to one cell or follows cell centers." },
    { id: "edge", name: "Cell edge", description: "The mark sits between two orthogonally adjacent cells." },
    { id: "corner", name: "Cell corner", description: "The mark sits at the intersection of four cells." },
    { id: "outside", name: "Outside grid", description: "The clue is entered in the margin beyond the Sudoku grid." },
    { id: "multiple", name: "Multiple / manual", description: "The variant needs more than one mark or placement; configure it manually." }
];

export const penpaMarks: PenpaMark[] = [
    { id: "none", name: "None", family: "Rule", positions: ["none"], penpaMode: "Sudoku", description: "No drawable clue; the CSP applies the rule globally." },
    { id: "multiple", name: "Multiple / manual", family: "Manual", positions: ["multiple"], penpaMode: "Multiple", description: "A deliberate placeholder for variants that combine marks, orientations, or clue types." },
    { id: "surface", name: "Cell shading", family: "Surface", positions: ["center"], penpaMode: "Surface", description: "A colored or shaded cell surface." },
    { id: "circle", name: "Circle", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · circle_L", description: "Large Penpa circle, with its style or color carrying the clue meaning." },
    { id: "square", name: "Square", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · square_L", description: "Large Penpa square, with its style or color carrying the clue meaning." },
    { id: "diamond", name: "Diamond", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · diamond", description: "Diamond symbol at a cell, edge midpoint, or corner." },
    { id: "triangle", name: "Triangle", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · tri*", description: "Directional triangle shape (up, down, left, or right)." },
    { id: "bars", name: "Bars", family: "Shape", positions: ["center", "edge"], penpaMode: "Shape · bars", description: "Bar symbol; orientation is chosen manually when horizontal and vertical forms differ." },
    { id: "math", name: "Math symbol", family: "Shape", positions: ["center", "edge", "corner"], penpaMode: "Shape · math", description: "Mathematical relation or operator symbol." },
    { id: "text", name: "Text / number", family: "Number", positions: ["center", "edge", "corner", "outside"], penpaMode: "Number", description: "Digits, letters, totals, inequalities, or other text clues." },
    { id: "line", name: "Center line", family: "Line", positions: ["center"], penpaMode: "Line", description: "A path drawn through cell centers." },
    { id: "edge-line", name: "Edge line", family: "Line", positions: ["edge"], penpaMode: "Edge", description: "A line drawn along cell boundaries or between cells." },
    { id: "wall", name: "Wall", family: "Line", positions: ["edge"], penpaMode: "Wall", description: "A heavy boundary segment on a cell edge." },
    { id: "thermo", name: "Thermometer", family: "Special", positions: ["center"], penpaMode: "Special · thermo", description: "A bulb and connected center-line stem." },
    { id: "arrow", name: "Arrow", family: "Special", positions: ["center", "outside"], penpaMode: "Special · arrows", description: "An arrow with a circular origin and shaft." },
    { id: "direction", name: "Direction arrow", family: "Special", positions: ["center", "outside"], penpaMode: "Special · direction", description: "A directional arrow without an arithmetic bulb." },
    { id: "frame", name: "Square frame", family: "Special", positions: ["center"], penpaMode: "Special · squareframe", description: "A frame enclosing one or more cells." },
    { id: "polygon", name: "Polygon", family: "Special", positions: ["center"], penpaMode: "Special · polygon", description: "A filled or outlined freeform polygon." },
    { id: "cage", name: "Cage", family: "Cage", positions: ["center"], penpaMode: "Cage", description: "An outlined group of cells, optionally with a corner total." }
];

export const bundledMarkConfig: MarkConfig = {
    version: 1,
    overrides: variantMetadata.markOverrides as MarkConfig["overrides"]
};

function has(text: string, pattern: RegExp) {
    return pattern.test(text);
}

/** Provides a conservative default that can be corrected through the dev-only editor. */
export function inferredMarkChoice(variation: Variation): VariantMarkChoice {
    const text = `${variation.name} ${variation.rule}`.toLowerCase();
    if (variation.inputType.categories.includes("no-input")) return { position: "none", mark: "none" };
    if (variation.inputType.categories.includes("shading")) return { position: "center", mark: "surface" };
    if (variation.inputType.categories.includes("cage")) return { position: "center", mark: "cage" };
    if (["anti king", "anti knight", "disjoint", "queen", "disparity", "liardiagonal", "magicsquares", "onefivenine", "unicorn", "citywalk", "poleposition", "pole position", "sequence top-bottom", "pirate", "touchy"].includes(variation.value)) {
        return { position: "none", mark: "none" };
    }
    if (["biggestneighbours", "smallestneighbours", "eliminate", "pointtonext", "pointtoprevious", "search6", "search9", "sumdetector", "twindetector"].includes(variation.value)) {
        return { position: "center", mark: "direction" };
    }
    if (["quadmax", "quadmin"].includes(variation.value)) {
        return { position: "corner", mark: "direction" };
    }
    if (variation.value === "coded") return { position: "corner", mark: "text" };
    if (variation.value === "pencilmarks") return { position: "center", mark: "text" };
    if (["xydifference", "primesums", "twodigitprimenumbers"].includes(variation.value)) return { position: "edge", mark: "diamond" };
    if (variation.value === "xivi" || variation.value === "termination") return { position: "edge", mark: "text" };
    if (variation.value === "clock") return { position: "center", mark: "cage" };
    if (variation.value === "slotmachine") return { position: "center", mark: "surface" };
    if (variation.value === "midpoint") return { position: "multiple", mark: "circle" };
    if (variation.value === "fadedkropki") return { position: "edge", mark: "circle" };
    if (["wheel", "pinnochio", "little killer", "weighted little killer", "product little killer", "bouncing x-sums", "czech outsider"].includes(variation.value)) {
        return { position: "multiple", mark: "multiple" };
    }
    if (variation.value === "mastermind") {
        return { position: "outside", mark: "multiple" };
    }
    if (["diagonal sum is nine", "diagonal tens"].includes(variation.value)) {
        return { position: "corner", mark: "bars" };
    }
    if (variation.value === "distances") {
        return { position: "outside", mark: "text" };
    }
    if (["productkiller", "solokiller"].includes(variation.value)) return { position: "center", mark: "cage" };
    if (variation.value === "consecutive") {
        return { position: "edge", mark: "bars" };
    }
    if (variation.value === "evensumpairs") {
        return { position: "edge", mark: "circle" };
    }
    const multiSignals = [
        /horizontal.+vertical|vertical.+horizontal/, /black.+white|white.+black/,
        /circle.+square|square.+circle/, /circle.+cross|cross.+circle/, /different (?:symbols|marks)/, /one of (?:the )?following/
    ];
    if (multiSignals.some((pattern) => has(text, pattern))) return { position: "multiple", mark: "multiple" };
    if (variation.tags?.includes("region")) return { position: "center", mark: "cage" };
    if (variation.tags?.includes("outside") || has(text, /outside (?:the )?grid|outside clue/)) {
        return { position: "outside", mark: has(text, /arrow/) ? "arrow" : "text" };
    }
    if (has(text, /thermometer|thermo/)) return { position: "center", mark: "thermo" };
    if (has(text, /arrow/)) return { position: "center", mark: "arrow" };
    if (has(text, /cage|outlined region/)) return { position: "center", mark: "cage" };
    if (has(text, /line|path|renban|palindrome/)) return { position: "center", mark: "line" };
    if (has(text, /between (?:two )?(?:orthogonally )?adjacent cells|between adjacent cells|shared edge/)) {
        if (has(text, /bar/)) return { position: "edge", mark: "bars" };
        if (has(text, /circle|dot/)) return { position: "edge", mark: "circle" };
        return { position: "edge", mark: has(text, /number|digit|sum|difference|product|ratio/) ? "text" : "edge-line" };
    }
    if (has(text, /intersection|four cells|2x2 area/)) return { position: "corner", mark: has(text, /circle|dot/) ? "circle" : "text" };
    if (has(text, /shaded|colou?red|painted/)) return { position: "center", mark: "surface" };
    if (has(text, /circle|dot/)) return { position: "center", mark: "circle" };
    if (has(text, /square/)) return { position: "center", mark: "square" };
    if (has(text, /diamond/)) return { position: "center", mark: "diamond" };
    if (has(text, /triangle/)) return { position: "center", mark: "triangle" };
    if (has(text, /marked|symbol|clue|number/)) return { position: "center", mark: "text" };
    return { position: "none", mark: "none" };
}

export function markChoiceFor(variation: Variation, config: MarkConfig = bundledMarkConfig) {
    return config.overrides[variation.value] || inferredMarkChoice(variation);
}

export function inputModesFor(variation: Variation) {
    if (variation?.inputType?.instructions?.length) return variation.inputType.instructions;
    const choice = markChoiceFor(variation);
    if (!choice || choice.position === "none") return ["No placed input", "The constraint is generated from grid geometry."];
    return [`${choice.position} · ${choice.mark}`, penpaMarks.find((mark) => mark.id === choice.mark)?.penpaMode || choice.mark];
}

/** Human-readable source shown on each generated variant reference page. */
function cspImplementationFor(variation: Variation) {
    return "cspImplementationFor"
}

/** Partial and full validator source shown on each generated variant reference page. */
export function cspConstraintFunctionsFor(variation: Variation) {
    return {
        partial: "cspConstraintFunctionsFor",
        full: "cspConstraintFunctionsFor"
    };
}

/** Kept for callers that want both functions in one code block. */
export function cspConstraintFunctionFor(variation: Variation) {
    return "cspConstraintFunctionFor"
}

/** Executable-style regression examples displayed on every variant detail page. */
export function solverTestCasesFor(variation: Variation) {
    return "solverTestCasesFor"
}

/** Explains why a backlog item cannot be safely inferred by the generic CSP families. */
export function automaticBlockerFor(variation: Variation) {
    return "automaticBlockerFor"
}

export function cspApproachFor(variation: Variation) {
    return "cspApproachFor"
}
