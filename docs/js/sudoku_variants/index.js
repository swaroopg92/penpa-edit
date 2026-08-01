"use strict";

var fs = require("node:fs");
var path = require("node:path");
var runtime = require("./runtime.js");
var families = require("./constraint_families.js");
var descriptorsDirectory = path.join(__dirname, "descriptors");
var descriptors = fs.readdirSync(descriptorsDirectory)
    .filter(function(filename) { return filename.endsWith(".js"); })
    .sort()
    .map(function(filename) { return require(path.join(descriptorsDirectory, filename)); });

module.exports = runtime.createRegistry(descriptors, families);
