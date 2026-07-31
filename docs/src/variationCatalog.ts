type RawVariation = {
    id: string;
    name: string;
    rules: Record<string, string>;
    status: "available" | "planned" | "infeasible" | "hidden";
    inputType?: {
        categories?: Array<"no-input" | "line" | "cage" | "shading" | "outside" | "cell" | "edge" | "intersection">;
        instructions?: string[];
    };
    tags: string[];
    isDuplicate?: boolean;
    duplicateOf?: string;
    example?: string;
    reviewed?: boolean;
    otherNames?: string;
    wikiOnly?: boolean;
    gridSizeReplacesNine?: boolean;
};

type VariantMetadata = {
    scrapedAliases?: Record<string, string>;
    markOverrides?: Record<string, { position: string; mark: string }>;
    variants: RawVariation[];
};

export type Variation = Omit<RawVariation, "inputType"> & {
    value: string;
    rule: string;
    inputType: {
        categories: Array<"no-input" | "line" | "cage" | "shading" | "outside" | "cell" | "edge" | "intersection">;
        instructions: string[];
    };
};

import metadataJson from "../../variant_metadata.json";
export const variantMetadata = metadataJson as VariantMetadata;
const scrapedAliases = variantMetadata.scrapedAliases || {};

function stripRulePreamble(rule: string) {
    const detail = rule.replace(/^Place a digit\b[^.]*\.\s*/i, "").trim();
    return detail || "Standard row, column, and box uniqueness applies.";
}

function preferredRule(rules: Record<string, string>) {
    return stripRulePreamble(rules["9x9"] || rules["6x6"] || Object.values(rules)[0] || "");
}

const allVariations: Variation[] = variantMetadata.variants.map((item) => {
    const value = item.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    const rule = preferredRule(item.rules);
    return {
        ...item,
        name: item.name.trim(),
        rules: Object.fromEntries(Object.entries(item.rules).map(([size, rule]) => [size, stripRulePreamble(rule)])),
        value,
        rule,
        otherNames: item.otherNames || "",
        inputType: {
            ...item.inputType,
            categories: item.inputType?.categories || [],
            instructions: item.inputType?.instructions || []
        }
    };
});

export const variations: Variation[] = allVariations
    .filter((item, index, all) => item.status !== "hidden" &&
        all.findIndex((candidate) => candidate.value === item.value) === index)
    .sort((first, second) => first.name.localeCompare(second.name));

const hiddenVariationValues = new Set(allVariations
    .filter((item) => item.status === "hidden")
    .map((item) => item.value));

export const variationByValue = new Map(variations.map((item) => [item.value, item]));
Object.entries(scrapedAliases).forEach(([alias, canonical]) => {
    const target = variationByValue.get(canonical);
    if (target) variationByValue.set(alias, target);
});
export const outsideVariationValues = new Set(variations.filter((item) =>
    item.value !== "xydifference" && (item.inputType.categories.includes("outside") ||
        item.tags?.includes("outside"))
).map((item) => item.value));
const regionGridVariants = ["irregular", "scattered", "deficit", "surplus", "toroidal"];

function genericSetting(variation: Variation) {
    const text = variation.rule.toLowerCase();
    const modes = ["sudoku"];
    const submodes: Array<string | number> = ["1"];
    const styles: Array<string | number> = [""];
    const show = ["mo_sudoku_lb", "sub_sudoku1_lb", "sub_sudoku2_lb", "sub_sudoku3_lb"];
    const add = (mode: string, submode: string | number, style: string | number, controls: string[], allowDuplicateMode = false) => {
        if (!allowDuplicateMode && modes.includes(mode)) return;
        modes.push(mode); submodes.push(submode); styles.push(style); show.push(...controls);
    };

    // These variants share the persisted region-ID editor rather than using
    // Penpa cages. Scattered also exposes surface paint for its visual set,
    // but remains a no-input rule in the variant catalogue.
    if (regionGridVariants.includes(variation.value)) {
        if (variation.value === "scattered") add("surface", "", 1, ["mo_surface_lb"]);
        return {
            show, modeset: modes, submodeset: submodes, styleset: styles,
            outside: false, regionEditor: true
        };
    }
    if (variation.value === "arrow") {
        add("special", "arrow", "", ["mo_special_lb", "sub_specialarrow_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["search9", "search6", "smallestneighbours", "biggestneighbours", "pointtonext", "pointtoprevious", "sumdetector", "twindetector"].includes(variation.value)) {
        add("symbol", "arrow_B_G", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["arrowsum", "countdifferentarrow", "counttheoddonesarrow", "averagearrows", "eliminate", "detection"].includes(variation.value)) {
        add("symbol", "arrow_eight", 2, ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["quadmax", "quadmin"].includes(variation.value)) {
        add("symbol", "arrow_B_B", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "deadoralivearrows") {
        add("symbol", "arrow_B_W", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"]);
        add("symbol", "arrow_B_G", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"], true);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "rossini") {
        add("symbol", "arrow_N_G", 2, ["mo_symbol_lb", "ms3", "li_arrow_N"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "braille") {
        add("symbol", "braille", 2, ["mo_symbol_lb", "ms", "ms_braille"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "lc") {
        add("symbol", "text", 1, ["mo_symbol_lb", "ms_text"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "anticonsecutive" || variation.value === "nonconsecutive") {
        add("symbol", "cross", 2, ["mo_symbol_lb", "ms1", "li_cross"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["consecutive", "evensumpairs", "oddsumpairs", "fadedkropki"].includes(variation.value)) {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["sumnine", "diagonalsumisnine", "xydifference", "perfectsquares", "primesums", "twodigitprimenumbers", "fives"].includes(variation.value)) {
        add("symbol", "diamond_SS", 2, ["mo_symbol_lb", "ms1", "li_diamond"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "termination") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "sudokuwithstars") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        add("symbol", "star", 2, ["mo_symbol_lb", "ms4", "li_star", "ms_star"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "partitionedsums") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.inputType.categories.includes("no-input")) {
        return { show, modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.inputType.categories.includes("shading")) {
        add("surface", "", 1, ["mo_surface_lb"]);
    }
    if (["extraregion", "extralargeregions", "difference2neighbours", "hiddenclone", "escape", "offset", "oneknightstep", "repeatedneighbors"].includes(variation.value)) {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "alternatingstripes") {
        add("line", "1", 2, ["mo_line_lb", "sub_line1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "tictactoewinner") {
        add("line", "2", 5, ["mo_line_lb", "sub_line2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "meandering diagonals") {
        add("line", "2", 2, ["mo_line_lb", "sub_line2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["clonedstrands", "equal sum line", "equal sum lines", "german whispers", "factor lines", "24trio", "24-trio"].includes(variation.value)) {
        add("line", "2", 3, ["mo_line_lb", "sub_line2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "between") {
        add("line", "1", 2, ["mo_line_lb", "sub_line1_lb"]);
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "upperrightheavykiller") {
        add("number", "3", 1, ["mo_number_lb", "sub_number3_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "blocksumrelations") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "threedigitnumberskiller") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        add("number", "11", 1, ["mo_number_lb", "sub_number11_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "ordering") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        add("number", "11", 1, ["mo_number_lb", "sub_number11_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "codedpairs") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        add("number", "3", 1, ["mo_number_lb", "sub_number3_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "deadoralivearrows") {
        add("symbol", "arrow_B_W", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"]);
        add("symbol", "arrow_B_G", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"], true);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "crosssums") {
        add("symbol", "cross", 2, ["mo_symbol_lb", "ms1", "li_cross"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "countingneighbours") {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L"]);
        add("symbol", "cross", 2, ["mo_symbol_lb", "ms1", "li_cross"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "detection") {
        add("symbol", "arrow_eight", 2, ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "determinant") {
        add("number", "4", 6, ["mo_number_lb", "sub_number4_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["quadmax", "quadmin"].includes(variation.value)) {
        add("symbol", "arrow_B_B", 2, ["mo_symbol_lb", "ms3", "li_arrow_B"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["equalsums", "equalproducts", "equaldifferences", "equalratios"].includes(variation.value)) {
        add("symbol", "ox_B", 4, ["mo_symbol_lb", "ms1", "li_ox", "ms_ox_B"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "divisor" || variation.value === "eitheror") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.inputType.categories.includes("shape") && variation.inputType.instructions.some((item) => /direction|arrow/i.test(item))) {
        if (variation.value === "sumdetector") {
            add("symbol", "arrow_eight", 2, ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
            return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
        }
        const isQuad = variation.value === "quadmax" || variation.value === "quadmin";
        const allowsMultiple = variation.value === "biggestneighbours" || variation.value === "smallestneighbours" || variation.value === "twindetector";
        add("symbol", isQuad ? "arrow_B_B" : allowsMultiple ? "arrow_eight" : "arrow_B_G", 2,
            isQuad || !allowsMultiple
                ? ["mo_symbol_lb", "ms3", "li_arrow_B"]
                : ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "consecutive" || variation.value === "evensumpairs") {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }

    if (variation.value === "coded") {
        add("number", "3", 1, ["mo_number_lb", "sub_number3_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "pencilmarks") {
        add("number", "7", 1, ["mo_number_lb", "sub_number7_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "quadruple" || variation.value === "exclusion") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "groupsum") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "stretchedthermo") {
        add("special", "thermo", "", ["mo_special_lb", "sub_specialthermo_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["productkiller", "solokiller", "sumorproductkiller", "roundoff"].includes(variation.value)) {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        if (["productkiller", "sumorproductkiller", "roundoff"].includes(variation.value)) 
          add("number", "11", 1, ["mo_number_lb", "sub_number11_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "starproduct" || variation.value === "sudokuwithstars") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        add("symbol", "star", 2, ["mo_symbol_lb", "ms4", "li_star", "ms_star"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "sudokuwithstars") {
        add("symbol", "star", 2, ["mo_symbol_lb", "ms4", "li_star", "ms_star"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["bust", "xsums", "numberedrooms", "sumframe", "edgedifference", "fullrank",
        "outsideparity", "parityparty", "serbianframe", "median", "ascendingstarters",
        "before9", "before1after9"].includes(variation.value)) {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "almostpalindrome" || variation.value === "disguisedpalindromes") {
        add("line", "2", 5, ["mo_line_lb", "sub_line2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "tinder") {
        add("line", "2", 5, ["mo_line_lb", "sub_line2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "upanddown") {
        add("line", "2", 5, ["mo_line_lb", "sub_line2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "anticonsecutive") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "fadedkropki") {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS", "ms1_bars", "li_circle", "li_bars", "ul_bars"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "doublekropki") {
        add("symbol", "diamond_SS", 2, ["mo_symbol_lb", "ms1", "li_diamond"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["countdifferentarrow", "counttheoddonesarrow", "averagearrows"].includes(variation.value)) {
        add("symbol", "arrow_eight", 2, ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "rossini") {
        add("symbol", "arrow_N_G", 2, ["mo_symbol_lb", "ms3", "li_arrow_N"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "average") {
        add("wall", "", 2, ["mo_wall_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "fortress") {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["inequality", "xydifference", "perfectsquares", "primesums", "twodigitprimenumbers", "fives", "wildcard", "sumnine"].includes(variation.value)) {
        add((variation.value === "inequality" || variation.value === "wildcard") ? "number" : "symbol",
            (variation.value === "inequality" || variation.value === "wildcard") ? "5" : "diamond_SS",
            (variation.value === "inequality" || variation.value === "wildcard") ? 6 : 2,
            (variation.value === "inequality" || variation.value === "wildcard") ? ["mo_number_lb", "sub_number5_lb"] :
                ["mo_symbol_lb", "ms1", "li_diamond"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "trio") {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "ms1_triup",
            "li_circle_L", "li_square_L", "li_triup"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "multipledivisor") {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "clockfaces") {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["little killer", "weighted little killer", "product little killer", "productframe", "bouncing x-sums", "czech outsider", "framediagonal", "pointingdifferents"].includes(variation.value)) {
        const mediumProduct = variation.value === "product little killer" || variation.value === "productframe";
        add("number", mediumProduct ? "6" : "1", 1,
            mediumProduct ? ["mo_number_lb", "sub_number6_lb"] : ["mo_number_lb", "sub_number1_lb"]);
        add("symbol", "arrow_eight", 2, ["mo_symbol_lb", "ms3", "li_arrow_eight"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "descriptivepairs") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "distances") {
        add("number", "6", 1, ["mo_number_lb", "sub_number6_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "missingdigit") {
        add("number", "8", 1, ["mo_number_lb", "sub_number8_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "mathdoku" || variation.value === "mathrax" || variation.value === "midpoint") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["outside", "outside234", "maximin", "minimax", "innerframesum", "nextto9", "outsideconsecutive", "outsidegreaterthan", "outsidekiller", "parityskyscrapers", "sumbyx"].includes(variation.value)) {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "creasing") {
        add("special", "nobulbthermo", "", ["mo_special_lb", "sub_specialnobulbthermo_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (["diagonallyconsecutive", "diagonal sum is nine", "diagonal tens"].includes(variation.value)) {
        add("symbol", "diagonal_consecutive", 2, ["mo_symbol_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "multiplication") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "evensandwich" || variation.value === "oddsandwich") {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: true };
    }
    if (variation.value === "clock") {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "termination") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb", "st_number0_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "xivi") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "lc") {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "slotmachine") {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "wheel") {
        add("number", "4", 1, ["mo_number_lb", "sub_number4_lb"]);
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "li_circle_L"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "onetouch") {
        add("symbol", "circle_SS", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_SS"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "paritycircles") {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "li_circle_L"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "braille") {
        add("symbol", "dice", 2, ["mo_symbol_lb", "ms", "ms_dice"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }
    if (variation.value === "tightfit") {
        add("line", "2", 5, ["mo_line_lb", "sub_line2_lb"]);
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }


    if (variation.value === "alloddalleven") {
        add("surface", "", 1, ["mo_surface_lb"]);
        return { show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles, outside: false };
    }

    if (variation.inputType.categories.includes("cage") || variation.tags?.includes("region")) {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
    }

    if (/thermometer|thermo/.test(text)) {
        add("special", "thermo", "", ["mo_special_lb", "sub_specialthermo_lb", "sub_specialnobulbthermo_lb"]);
    }
    if (variation.value === "arrow") {
        add("special", "arrow", "", ["mo_special_lb", "sub_specialarrow_lb"]);
    }
    if (/\bline\b|path|diagonal/.test(text)) {
        add("line", "2", 5, ["mo_line_lb", "sub_line1_lb", "sub_line2_lb", "sub_line3_lb"]);
    }
    if (/cage|outlined region|extra region|shaded region/.test(text)) {
        add("cage", "1", 10, ["mo_cage_lb", "sub_cage1_lb", "sub_cage2_lb"]);
    }
    if (outsideVariationValues.has(variation.value)) {
        add("number", "1", 1, ["mo_number_lb", "sub_number1_lb"]);
    } else if (/clue|digit between|number between|sum|difference|product|ratio/.test(text)) {
        add("number", "5", 6, ["mo_number_lb", "sub_number5_lb"]);
    }
    if (!variation.tags?.includes("region") && !variation.inputType.categories.includes("shading") && /marked|circle|square|shaded|bar|dot|diamond|symbol/.test(text)) {
        add("symbol", "circle_L", 2, ["mo_symbol_lb", "ms1", "ms1_circle", "ms1_square", "li_circle_L", "li_square_L"]);
    }
    return {
        show: Array.from(new Set(show)), modeset: modes, submodeset: submodes, styleset: styles,
        outside: outsideVariationValues.has(variation.value)
    };
}

let _installingCatalog = false;
export function installVariationCatalog() {
    if (_installingCatalog) return;
    const constraints = (window as any).penpa_constraints;
    const select = document.getElementById("constraints_settings_opt") as HTMLSelectElement | null;
    if (!constraints || !select) return;
    if (select.dataset.variationCatalog === "ready") return;
    _installingCatalog = true;
    try {
    constraints.options.sudoku = constraints.options.sudoku.filter((value: string) => !hiddenVariationValues.has(value));
    Array.from(select.options).filter((option) => hiddenVariationValues.has(option.value)).forEach((option) => option.remove());

    let implementedGroup = Array.from(select.children).find((element) =>
        element instanceof HTMLOptGroupElement && element.label === "Available") as HTMLOptGroupElement | undefined;
    if (!implementedGroup) {
        implementedGroup = document.createElement("optgroup");
        implementedGroup.label = "Available";
        select.prepend(implementedGroup);
    }
    let unsupportedGroup = Array.from(select.children).find((element) =>
        element instanceof HTMLOptGroupElement && element.label === "Unsupported CSP") as HTMLOptGroupElement | undefined;
    if (!unsupportedGroup) {
        unsupportedGroup = document.createElement("optgroup");
        unsupportedGroup.label = "Unsupported CSP";
    }
    Array.from(select.children).filter((element) =>
        element instanceof HTMLOptGroupElement && element.label === "Variation catalog"
    ).forEach((element) => element.remove());
    variations.forEach((variation) => {
        if (variation.wikiOnly) return;
        if (regionGridVariants.includes(variation.value)) {
            // Replace legacy cage-based settings so every consumer—not only
            // the custom toolbar—sees the persisted region-number editor.
            constraints.setting[variation.value] = genericSetting(variation);
        } else if (!constraints.setting[variation.value]) {
            constraints.setting[variation.value] = genericSetting(variation);
        }
        constraints.setting[variation.value].outside = outsideVariationValues.has(variation.value);
        if (!constraints.options.sudoku.includes(variation.value)) constraints.options.sudoku.push(variation.value);
        const existingOption = Array.from(select.options).find((option) => option.value === variation.value);
        const targetGroup = variation.status === "available" ? implementedGroup : unsupportedGroup;
        if (existingOption) {
            // The legacy select may use the internal variant ID as its label.
            // Metadata names are the display source of truth, even when the
            // option is already filed under the correct group.
            existingOption.textContent = variation.name;
            if (existingOption.parentElement !== targetGroup) targetGroup.appendChild(existingOption);
        } else {
            const option = document.createElement("option");
            option.value = variation.value;
            option.textContent = variation.name;
            targetGroup.appendChild(option);
        }
    });
    [implementedGroup, unsupportedGroup].forEach((group) => {
        if (!group) return;
        const sorted = Array.from(group.children).sort((a, b) =>
            (a.textContent || "").localeCompare(b.textContent || "")
        );
        sorted.forEach((option) => group.appendChild(option));
    });
    if (unsupportedGroup.children.length && !unsupportedGroup.parentElement) select.appendChild(unsupportedGroup);
    select.dataset.variationCatalog = "ready";
    if (typeof (window as any).$ === "function") {
        try {
            (window as any).$('#constraints_settings_opt').trigger('change.select2');
        } catch (e) {}
    }
    } finally {
        _installingCatalog = false;
    }
}
