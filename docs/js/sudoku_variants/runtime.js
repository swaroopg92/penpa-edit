(function(root, factory) {
    var runtime = factory();
    if (typeof module !== "undefined" && module.exports) module.exports = runtime;
    else root.SudokuVariantRuntime = runtime;
})(typeof globalThis !== "undefined" ? globalThis : this, function() {
    "use strict";

    function normalizeId(value) {
        return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    function defineVariant(specification) {
        if (!specification || typeof specification !== "object") {
            throw new TypeError("A Variant Descriptor must be an object.");
        }
        var id = normalizeId(specification.id);
        if (!id || id !== specification.id) {
            throw new TypeError("A Variant Descriptor requires a normalized Variant ID.");
        }
        if (!specification.label || typeof specification.label !== "string") {
            throw new TypeError("Variant " + id + " requires a label.");
        }
        if (typeof specification.parse !== "function") {
            throw new TypeError("Variant " + id + " requires parse(evidence, emit, diagnostic).");
        }
        var inputType = specification.inputType || { categories: ["no-input"], instructions: [] };
        if (!Array.isArray(inputType.categories) || !Array.isArray(inputType.instructions)) {
            throw new TypeError("Variant " + id + " requires inputType categories and instructions.");
        }
        var descriptor = Object.assign({}, specification, {
            aliases: Object.freeze((specification.aliases || []).slice()),
            constraintTypes: Object.freeze((specification.constraintTypes || []).slice()),
            supportedSizes: Object.freeze((specification.supportedSizes || [6, 7, 8, 9]).slice()),
            requires: Object.freeze((specification.requires || []).map(normalizeId)),
            implies: Object.freeze((specification.implies || []).map(normalizeId)),
            conflictsWith: Object.freeze((specification.conflictsWith || []).map(normalizeId)),
            rules: Object.freeze(Object.assign({}, specification.rules || {})),
            tags: Object.freeze((specification.tags || []).slice()),
            status: specification.status || "available",
            inputType: Object.freeze({
                categories: Object.freeze(inputType.categories.slice()),
                instructions: Object.freeze(inputType.instructions.slice())
            })
        });
        return Object.freeze(descriptor);
    }

    function puzzleSize(puzzle) {
        var horizontalSpace = Number(puzzle && puzzle.space && puzzle.space[2] || 0) +
            Number(puzzle && puzzle.space && puzzle.space[3] || 0);
        var verticalSpace = Number(puzzle && puzzle.space && puzzle.space[0] || 0) +
            Number(puzzle && puzzle.space && puzzle.space[1] || 0);
        var width = Number(puzzle && puzzle.nx) - horizontalSpace;
        var height = Number(puzzle && puzzle.ny) - verticalSpace;
        if (width === height && width > 0) return width;
        var centerCount = puzzle && Array.isArray(puzzle.centerlist) ? puzzle.centerlist.length : 0;
        var inferred = Math.sqrt(centerCount);
        if (Number.isInteger(inferred) && inferred >= 6 && inferred <= 9) return inferred;
        var storageWidth = Number(puzzle && puzzle.nx0) - 4 - horizontalSpace;
        if (storageWidth >= 6 && storageWidth <= 9) return storageWidth;
        // Some legacy test/import shapes omit dimensions and use playable-cell
        // keys directly. Those records predate variable-size Sudoku support.
        return puzzle && puzzle.nx0 ? 9 : 0;
    }

    function createPuzzleEvidence(puzzle) {
        var size = puzzleSize(puzzle);
        var cells;
        var cages;
        var outsideNumbers = Object.create(null);
        var activeCellKeys;
        var linePaths = Object.create(null);
        var numberMarks;
        var symbolMarks;
        var wallSegments;

        function isInside(row, col) {
            return row >= 0 && row < size && col >= 0 && col < size;
        }

        function cell(row, col) {
            return isInside(row, col) ? Object.freeze({ row: row, col: col }) : null;
        }

        function pairs(offsets) {
            var result = [];
            for (var row = 0; row < size; row++) {
                for (var col = 0; col < size; col++) {
                    offsets.forEach(function(offset) {
                        var neighbour = cell(row + offset[0], col + offset[1]);
                        if (neighbour) result.push(Object.freeze([
                            cell(row, col), neighbour
                        ]));
                    });
                }
            }
            return Object.freeze(result);
        }

        function boxDimensions() {
            var height = Math.floor(Math.sqrt(size));
            while (height > 1 && size % height !== 0) height--;
            return Object.freeze({ height: height, width: size / height });
        }

        function cellFromKey(key) {
            var top = Number(puzzle.space && puzzle.space[0] || 0);
            var left = Number(puzzle.space && puzzle.space[2] || 0);
            var col = (Number(key) % puzzle.nx0) - 2 - left;
            var row = ((Number(key) / puzzle.nx0) | 0) - 2 - top;
            if (row < 0 || row >= size || col < 0 || col >= size) return null;
            return Object.freeze({ row: row, col: col });
        }

        function keyForCell(row, col) {
            var top = Number(puzzle.space && puzzle.space[0] || 0);
            var left = Number(puzzle.space && puzzle.space[2] || 0);
            return (col + 2 + left) + (row + 2 + top) * puzzle.nx0;
        }

        function connectedLinePaths(style) {
            var cacheKey = String(style);
            if (linePaths[cacheKey]) return linePaths[cacheKey];
            if (!activeCellKeys) {
                activeCellKeys = Object.create(null);
                (puzzle.centerlist || []).forEach(function(key) { activeCellKeys[key] = true; });
            }
            var adjacency = Object.create(null);
            Object.keys(puzzle.pu_q && puzzle.pu_q.line || {}).forEach(function(edge) {
                if (puzzle.pu_q.line[edge] !== style) return;
                var endpoints = edge.split(",").map(Number);
                if (endpoints.length !== 2 || !activeCellKeys[endpoints[0]] || !activeCellKeys[endpoints[1]]) return;
                (adjacency[endpoints[0]] || (adjacency[endpoints[0]] = [])).push(endpoints[1]);
                (adjacency[endpoints[1]] || (adjacency[endpoints[1]] = [])).push(endpoints[0]);
            });
            var visited = Object.create(null), paths = [];
            Object.keys(adjacency).forEach(function(nodeText) {
                if (visited[nodeText]) return;
                var component = [], queue = [Number(nodeText)];
                visited[nodeText] = true;
                while (queue.length) {
                    var node = queue.shift(); component.push(node);
                    (adjacency[node] || []).forEach(function(next) {
                        if (!visited[next]) { visited[next] = true; queue.push(next); }
                    });
                }
                var current = component.find(function(key) { return adjacency[key].length === 1; }) || component[0];
                var previous = null, ordered = [];
                while (current !== undefined && ordered.length < component.length) {
                    ordered.push(current);
                    var next = (adjacency[current] || []).find(function(key) {
                        return key !== previous && ordered.indexOf(key) === -1;
                    });
                    previous = current; current = next;
                }
                var path = ordered.map(cellFromKey).filter(Boolean);
                if (path.length > 1) paths.push(Object.freeze(path));
            });
            linePaths[cacheKey] = Object.freeze(paths);
            return linePaths[cacheKey];
        }

        function authoredMarks(sourceName) {
            var source = puzzle.pu_q && puzzle.pu_q[sourceName] || {};
            return Object.freeze(Object.keys(source).sort(function(a, b) { return Number(a) - Number(b); })
                .map(function(key) {
                    var point = puzzle.point && puzzle.point[key];
                    var neighbors = point && Array.isArray(point.neighbor) ? point.neighbor
                        .map(cellFromKey).filter(Boolean) : [];
                    var anchoredCell = cellFromKey(Number(key));
                    if (anchoredCell) anchoredCell = Object.freeze({
                        row: anchoredCell.row, col: anchoredCell.col, key: Number(key)
                    });
                    return Object.freeze({
                        key: Number(key), cell: anchoredCell,
                        neighbors: Object.freeze(neighbors),
                        pointType: point && point.type,
                        entry: Object.freeze(Array.isArray(source[key]) ? source[key].slice() : source[key])
                    });
                }));
        }

        function killerTotal(cageKeys) {
            var numbers = puzzle.pu_q && puzzle.pu_q.numberS || {};
            for (var index = 0; index < cageKeys.length; index++) {
                var base = cageKeys[index] + puzzle.nx0 * puzzle.ny0;
                for (var corner = 0; corner < 4; corner++) {
                    var entry = numbers[4 * base + corner];
                    if (!entry || entry[0] === undefined || entry[0] === null) continue;
                    var total = parseInt(String(entry[0]).replace(/\s+/g, ""), 10);
                    if (total > 0) return total;
                }
            }
            return 0;
        }

        function cageLabel(cageKeys) {
            var numbers = puzzle.pu_q && puzzle.pu_q.numberS || {};
            for (var index = 0; index < cageKeys.length; index++) {
                var base = cageKeys[index] + puzzle.nx0 * puzzle.ny0;
                for (var corner = 0; corner < 4; corner++) {
                    var entry = numbers[4 * base + corner];
                    if (entry && entry[0] !== undefined && entry[0] !== null && String(entry[0]).trim()) {
                        return String(entry[0]).trim();
                    }
                }
            }
            return "";
        }

        return Object.freeze({
            size: size,
            cell: cell,
            pairs: pairs,
            boxDimensions: boxDimensions,
            cellEntry: function(row, col) {
                var entry = puzzle.pu_q && puzzle.pu_q.number && puzzle.pu_q.number[keyForCell(row, col)];
                return entry ? Object.freeze(Array.isArray(entry) ? entry.slice() : entry) : null;
            },
            cornerLabel: function(row, col) {
                var key = keyForCell(row, col);
                var numbers = puzzle.pu_q && puzzle.pu_q.numberS || {};
                var entry = numbers[4 * (key + puzzle.nx0 * puzzle.ny0)] || numbers[4 * key];
                return entry && entry[0] !== undefined ? String(entry[0]).trim() : null;
            },
            connectedLinePaths: connectedLinePaths,
            numberMarks: function() {
                if (!numberMarks) numberMarks = authoredMarks("number");
                return numberMarks;
            },
            symbolMarks: function() {
                if (!symbolMarks) symbolMarks = authoredMarks("symbol");
                return symbolMarks;
            },
            isShaded: function(row, col) {
                return !!(puzzle.pu_q && puzzle.pu_q.surface || {})[keyForCell(row, col)];
            },
            wallSegments: function() {
                if (wallSegments) return wallSegments;
                wallSegments = Object.freeze(Object.keys(puzzle.pu_q && puzzle.pu_q.wall || {}).map(function(edge) {
                    var endpoints = edge.split(",").map(Number);
                    var first = puzzle.point && puzzle.point[endpoints[0]];
                    var second = puzzle.point && puzzle.point[endpoints[1]];
                    if (endpoints.length !== 2 || !first || !second) return null;
                    var middleX = (first.x + second.x) / 2, middleY = (first.y + second.y) / 2;
                    var nearest = null, distance = Infinity;
                    (puzzle.centerlist || []).forEach(function(key) {
                        var center = puzzle.point[key];
                        if (!center) return;
                        var candidate = Math.pow(center.x - middleX, 2) + Math.pow(center.y - middleY, 2);
                        if (candidate < distance) { distance = candidate; nearest = cellFromKey(key); }
                    });
                    return nearest ? Object.freeze({ cell: nearest,
                        orientation: Math.abs(first.x - second.x) > Math.abs(first.y - second.y) ? "horizontal" : "vertical" }) : null;
                }).filter(Boolean));
                return wallSegments;
            },
            option: function(name) { return puzzle[name]; },
            cells: function() {
                if (!cells) {
                    cells = Object.freeze(Array.from({ length: size * size }, function(_, index) {
                        return Object.freeze({ row: (index / size) | 0, col: index % size });
                    }));
                }
                return cells;
            },
            cages: function() {
                if (!cages) {
                    var source = typeof puzzle.refreshKillerCages === "function" ?
                        puzzle.refreshKillerCages("pu_q") :
                        (puzzle.pu_q && puzzle.pu_q.killercages || []);
                    cages = Object.freeze(source.map(function(cageKeys) {
                        var cageCells = cageKeys.map(cellFromKey).filter(Boolean);
                        return Object.freeze({
                            cells: Object.freeze(cageCells),
                            total: killerTotal(cageKeys),
                            label: cageLabel(cageKeys)
                        });
                    }).filter(function(cage) { return cage.cells.length > 0; }));
                }
                return cages;
            },
            outsideNumber: function(side, index, layer) {
                var cacheKey = side + ":" + index + ":" + layer;
                if (Object.prototype.hasOwnProperty.call(outsideNumbers, cacheKey)) {
                    return outsideNumbers[cacheKey];
                }
                var top = Number(puzzle.space && puzzle.space[0] || 0);
                var left = Number(puzzle.space && puzzle.space[2] || 0);
                var startRow = 2 + top;
                var startCol = 2 + left;
                var key = side === "top" ?
                    (startCol + index) + (startRow - layer) * puzzle.nx0 :
                    (startCol - layer) + (startRow + index) * puzzle.nx0;
                var entry = puzzle.pu_q && puzzle.pu_q.number && puzzle.pu_q.number[key];
                var value = null;
                if (entry && ["1", "6", "10"].indexOf(String(entry[2])) !== -1) {
                    var parsed = parseInt(entry[0], 10);
                    if (Number.isFinite(parsed) && parsed >= 0) value = parsed;
                }
                outsideNumbers[cacheKey] = value;
                return value;
            }
        });
    }

    function createRegistry(specifications, familySpecifications) {
        var families = Object.create(null);
        (familySpecifications || []).forEach(function(family) {
            if (!family || typeof family.type !== "string" || !Number.isInteger(family.version) ||
                family.version < 1 || typeof family.validatePayload !== "function") {
                throw new TypeError("A Constraint Family requires type, version, and validatePayload.");
            }
            if (families[family.type]) throw new Error("Duplicate Constraint Family: " + family.type);
            families[family.type] = Object.freeze(Object.assign({}, family));
        });
        var descriptors = (specifications || []).map(defineVariant).sort(function(first, second) {
            return first.id.localeCompare(second.id);
        });
        var byName = Object.create(null);
        var byId = Object.create(null);
        descriptors.forEach(function(descriptor) {
            byId[descriptor.id] = descriptor;
            descriptor.constraintTypes.forEach(function(type) {
                if (!families[type]) {
                    throw new Error("Variant " + descriptor.id + " uses unregistered Constraint Family " + type + ".");
                }
            });
            [descriptor.id, descriptor.label].concat(descriptor.aliases).forEach(function(name) {
                var normalized = normalizeId(name);
                if (byName[normalized] && byName[normalized] !== descriptor) {
                    throw new Error("Duplicate Variant ID or alias: " + name);
                }
                byName[normalized] = descriptor;
            });
        });
        descriptors.forEach(function(descriptor) {
            descriptor.requires.concat(descriptor.implies, descriptor.conflictsWith).forEach(function(id) {
                if (!byId[id]) throw new Error("Variant " + descriptor.id + " references unknown variant " + id + ".");
            });
        });
        function interpretPuzzle(puzzle) {
            var requested = Array.isArray(puzzle && puzzle.activeSudokuVariants) ?
                puzzle.activeSudokuVariants : [puzzle && puzzle.activeSudokuVariant || "classic"];
            var descriptorsToParse = [];
            var activeVariantIds = [];
            var diagnostics = [];
            requested.forEach(function(name) {
                if (normalizeId(name) === "classic") return;
                var descriptor = byName[normalizeId(name)];
                if (!descriptor) {
                    diagnostics.push(Object.freeze({
                        code: "unknown-variant",
                        variantId: normalizeId(name),
                        message: "Unknown Sudoku variant: " + name
                    }));
                    return;
                }
                if (activeVariantIds.indexOf(descriptor.id) !== -1) return;
                activeVariantIds.push(descriptor.id);
                descriptorsToParse.push(descriptor);
            });
            activeVariantIds.sort();
            descriptorsToParse.sort(function(first, second) {
                return first.id.localeCompare(second.id);
            });

            var evidence = createPuzzleEvidence(puzzle || {});
            var instances = [];
            for (var impliedIndex = 0; impliedIndex < descriptorsToParse.length; impliedIndex++) {
                descriptorsToParse[impliedIndex].implies.forEach(function(id) {
                    if (activeVariantIds.indexOf(id) !== -1) return;
                    activeVariantIds.push(id);
                    descriptorsToParse.push(byId[id]);
                });
            }
            activeVariantIds.sort();
            descriptorsToParse.sort(function(first, second) {
                return first.id.localeCompare(second.id);
            });
            var reportedConflicts = Object.create(null);
            descriptorsToParse.forEach(function(descriptor) {
                descriptor.requires.forEach(function(id) {
                    if (activeVariantIds.indexOf(id) === -1) {
                        diagnostics.push(Object.freeze({
                            code: "missing-required-variant",
                            variantId: descriptor.id,
                            requiredVariantId: id,
                            message: descriptor.label + " requires variant " + id + "."
                        }));
                    }
                });
                descriptor.conflictsWith.forEach(function(id) {
                    var pair = [descriptor.id, id].sort().join(":");
                    if (activeVariantIds.indexOf(id) !== -1 && !reportedConflicts[pair]) {
                        reportedConflicts[pair] = true;
                        diagnostics.push(Object.freeze({
                            code: "conflicting-variants",
                            variantId: descriptor.id,
                            conflictingVariantId: id,
                            message: descriptor.label + " conflicts with variant " + id + "."
                        }));
                    }
                });
                if (descriptor.supportedSizes.indexOf(evidence.size) === -1) {
                    diagnostics.push(Object.freeze({
                        code: "unsupported-size",
                        variantId: descriptor.id,
                        size: evidence.size,
                        supportedSizes: descriptor.supportedSizes,
                        message: descriptor.label + " does not support a " + evidence.size + "x" + evidence.size + " grid."
                    }));
                }
            });
            if (diagnostics.length) {
                return Object.freeze({
                    activeVariantIds: Object.freeze(activeVariantIds),
                    instances: Object.freeze([]),
                    diagnostics: Object.freeze(diagnostics)
                });
            }
            descriptorsToParse.forEach(function(descriptor) {
                function diagnostic(value) {
                    diagnostics.push(Object.freeze(Object.assign({ variantId: descriptor.id }, value)));
                }
                function emit(type, payload, version) {
                    if (descriptor.constraintTypes.indexOf(type) === -1) {
                        diagnostic({
                            code: "invalid-constraint-type",
                            message: "Variant " + descriptor.id + " emitted undeclared constraint type " + type + "."
                        });
                        return;
                    }
                    var family = families[type];
                    var payloadVersion = version || family.version;
                    if (payloadVersion !== family.version || !family.validatePayload(payload)) {
                        diagnostic({
                            code: "invalid-constraint-payload",
                            message: "Variant " + descriptor.id + " emitted an invalid " + type + " payload."
                        });
                        return;
                    }
                    instances.push(Object.freeze({
                        type: type,
                        version: payloadVersion,
                        payload: payload,
                        variantId: descriptor.id
                    }));
                }
                descriptor.parse(evidence, emit, diagnostic);
            });
            return Object.freeze({
                activeVariantIds: Object.freeze(activeVariantIds),
                instances: Object.freeze(instances),
                diagnostics: Object.freeze(diagnostics)
            });
        }

        return Object.freeze({
            ids: function() { return descriptors.map(function(descriptor) { return descriptor.id; }); },
            all: function() { return descriptors.slice(); },
            resolve: function(value) { return byName[normalizeId(value)] || null; },
            constraintFamily: function(type) { return families[type] || null; },
            interpretPuzzle: interpretPuzzle
        });
    }

    return {
        normalizeId: normalizeId,
        defineVariant: defineVariant,
        createRegistry: createRegistry,
        createPuzzleEvidence: createPuzzleEvidence
    };
});
