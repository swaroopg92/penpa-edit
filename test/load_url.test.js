const assert = require("node:assert/strict");
const test = require("node:test");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

global.window = global;
global.TextEncoder = require("util").TextEncoder;
global.TextDecoder = require("util").TextDecoder;
global.btoa = (value) => Buffer.from(value, "binary").toString("base64");
global.atob = (value) => Buffer.from(value, "base64").toString("binary");
global.Swal = { fire() {} };
global.Identity = { errorTitle: "error", okButtonText: "ok" };
global.PenpaText = { get: (key) => key };

const context = vm.createContext(global);
const zlibSource = fs.readFileSync(
    path.join(__dirname, "../docs/js/libs/zlib.js"),
    "utf8",
);
vm.runInContext(zlibSource, context);

const { normalizePenpaLoadInput } = require("../docs/js/general.js");

test("normalizes Sudotoku puzzle URLs to Penpa load parameters", () => {
    const payload = "m=solve&v=0&p=example-puzzle-data";
    assert.equal(
        normalizePenpaLoadInput(`https://sudotoku.example/#${payload}`),
        payload,
    );
    assert.equal(
        normalizePenpaLoadInput(`http://localhost:5174/?${payload}`),
        payload,
    );
});

test("preserves supported external puzzle URLs", () => {
    const puzzLink = "https://puzz.link/p?sudoku/9/9/example";
    assert.equal(normalizePenpaLoadInput(puzzLink), puzzLink);
});
