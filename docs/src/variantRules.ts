import { variationByValue, variantMetadata } from "./variationCatalog";
import { replaceGridSizeNine } from "./gridSizeMetadata.mjs";

export type VariantGuide = {
    title: string;
    rule: string;
    usage: string;
};

export const variantRules = Object.fromEntries(variantMetadata.variants.map((variant) => {
    const value = variant.id.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
    return [value, {
        title: variant.name,
        rule: variant.rules["9x9"] || variant.rules["6x6"] || Object.values(variant.rules)[0] || "",
        usage: (variant.inputType && variant.inputType.instructions) ? variant.inputType.instructions.join(" ") : ""
    }];
})) as Record<string, VariantGuide>;

export function guideFor(variant: string): VariantGuide {
    const catalog = variationByValue.get(variant);
    const puzzle = (window as any).pu;
    const outside = Number(puzzle?.space?.[0] || 0) + Number(puzzle?.space?.[1] || 0);
    const size = Number(puzzle?.ny || 9) - outside;
    const catalogRule = catalog?.rules?.[`${size}x${size}`] || catalog?.rule;
    const metadataGuide = variantRules[variant];
    return catalog ? {
        title: replaceGridSizeNine(catalog.name, size, catalog.gridSizeReplacesNine),
        rule: replaceGridSizeNine(catalogRule || "", size, catalog.gridSizeReplacesNine),
        usage: metadataGuide?.usage || "Use the clue tools shown for this variation; marks remain native Penpa objects for SVG and URL export."
    } : {
        title: variant.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        rule: "This variant uses its standard Sudoku constraint.",
        usage: "Use the selected Penpa tool directly on the puzzle canvas."
    };
}
