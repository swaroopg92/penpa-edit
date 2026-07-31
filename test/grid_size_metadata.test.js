const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

test("marks variants whose nine means the largest grid digit", async function() {
    const metadata = JSON.parse(fs.readFileSync(path.join(root, "variant_metadata.json"), "utf8"));
    const marked = new Map(metadata.variants.map(function(variant) {
        return [variant.id, variant.gridSizeReplacesNine === true];
    }));

    ["search9", "sumsandwich", "sequence top-bottom", "sandwich", "before9",
        "before1after9", "nextto9", "sum next to nine", "queen", "unicorn"].forEach(function(id) {
        assert.equal(marked.get(id), true, id + " should use the grid-size digit");
    });
    assert.equal(marked.get("sumnine"), false, "Sum Nine keeps an intrinsic total of nine");
    assert.equal(marked.get("diagonal sum is nine"), false,
        "Diagonal Sum Is Nine keeps an intrinsic total of nine");
});

test("formats marked metadata for the current grid size", async function() {
    const { replaceGridSizeNine } = await import("../docs/src/gridSizeMetadata.mjs");

    assert.equal(replaceGridSizeNine("Search 9", 6, true), "Search 6");
    assert.equal(
        replaceGridSizeNine("from digit 1 to digit 9", 6, true),
        "from digit 1 to digit 6"
    );
    assert.equal(replaceGridSizeNine("Sum Nine", 6, false), "Sum Nine");
});
