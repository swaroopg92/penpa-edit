const assert = require("node:assert/strict");
const path = require("node:path");
const test = require("node:test");

const { normalizeHttpUrl } = require("../docs/js/url_security.js");

test("external URL handling permits only credential-free HTTP(S) URLs", () => {
  assert.equal(normalizeHttpUrl("https://example.com/path?q=1"), "https://example.com/path?q=1");
  assert.equal(normalizeHttpUrl(" http://example.com "), "http://example.com/");
  [
    "javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "//example.com/path",
    "/relative/path",
    "https://user:password@example.com/",
    "https://example.com/\nmalicious"
  ].forEach((value) => assert.equal(normalizeHttpUrl(value), null, value));
});

test("variant IDs and generated paths reject traversal", async () => {
  const {
    resolveContainedPath,
    validateVariantId,
    validateVariantMetadata
  } = await import("../scripts/vite-security.mjs");

  assert.equal(validateVariantId("sequence top-bottom"), "sequence top-bottom");
  assert.throws(() => validateVariantId("../outside"), /Variant ID/);
  assert.throws(() => validateVariantId("nested/path"), /Variant ID/);
  assert.throws(() => resolveContainedPath(path.join("tmp", "list"), "../outside"), /escapes/);

  const valid = {
    version: 3,
    variants: [{
      id: "antiKing",
      name: "Anti King",
      rules: { "9x9": "Kings cannot touch." },
      status: "available",
      inputType: { categories: ["no-input"], instructions: [] },
      tags: ["chess"]
    }]
  };
  assert.equal(validateVariantMetadata(valid), valid);
  assert.throws(
    () => validateVariantMetadata({ variants: [{ ...valid.variants[0], id: "../../escape" }] }),
    /Variant ID/
  );
});

test("development mutations require same-origin JSON requests", async () => {
  const { validateMutationHeaders } = await import("../scripts/vite-security.mjs");

  assert.equal(validateMutationHeaders({
    host: "localhost:5173",
    origin: "http://localhost:5173",
    "content-type": "application/json; charset=utf-8"
  }), null);
  assert.equal(validateMutationHeaders({
    host: "localhost:5173",
    origin: "https://attacker.example",
    "content-type": "application/json"
  }).status, 403);
  assert.equal(validateMutationHeaders({
    host: "localhost:5173",
    origin: "http://localhost:5173",
    "content-type": "text/plain"
  }).status, 415);
  assert.equal(validateMutationHeaders({
    host: "localhost:5173",
    "content-type": "application/json"
  }).status, 403);
});
