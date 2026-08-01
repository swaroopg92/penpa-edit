var SudokuCSPRuntime = typeof SudokuCSP !== "undefined" ? SudokuCSP :
    (typeof require === "function" ? require("./sudoku_csp.js") : null);
var SudokuVariantRegistryRuntime = typeof SudokuVariantRegistry !== "undefined" ? SudokuVariantRegistry :
    (typeof require === "function" ? require("./sudoku_variants/index.js") : null);
var SudokuWorkerAssetVersion = typeof ver !== "undefined" ? ver : "3.3.40";

function sudokuWorkerUrl(filename) {
    return "./js/" + filename + "?v=" + encodeURIComponent(SudokuWorkerAssetVersion);
}

function sudokuSolverTimeLimitMs() {
    if (typeof window === "undefined" || !window.SudokuSolverPreferences) return 60000;
    var value = window.SudokuSolverPreferences.timeLimitMs;
    return value === null ? null : (Number(value) > 0 ? Number(value) : 60000);
}

function sudokuSolverTimeLimitLabel(limitMs) {
    return Math.round(limitMs / 1000) + " s";
}

var SudokuSolver = (function() {
    var SIZE = 9;
    // Kept as the public default for compatibility; active runs read the saved preference.
    var AUTO_RUN_LIMIT_MS = 60000;
    var TEST_BOARD_URL = "https://swaroopg92.github.io/penpa-edit/#m=edit&p=7Vbvb+I4EP3OX3Hy17W0sU2cH9J+oL9WqtpeuW231yJUpRAKbSC7IbRVKv73nZmYi2Ponm6lk3rSCTCP5/i9mbEzYbka548rHsFLhdzjAl4q9OgTdvHtmdfFrMzS+DfeW5XTvADA+e9HR3ySZMuUH18/7B089p4Pe39+9G+UujybfHg46F8+jK++ir43+1h4Z1m4OD0/2Ms+fK5uTqe9p/Qw1efLfDTN0mScVDdXxy/Z4ii8n07E/vF0P5wkC2/5PbyInvb6nz51BiaQYee1iuKqz6vP8YAJxpmEj2BDXvXj1+o0ZnVOjFdf4ALGxZCz+SorZ6M8ywu24aqTerkEeNjAK5pHtF+TwgN8ZjDAa4CjWTHK0tuTmjmPB9UFZxjBHq1GyOb5U4pmGCH+HuXzuxkSd0kJlVxOZ98YVzBhwt04rHnV+5U8QGqTB8I6D0Q78sD0/t08ouF6DRv1B2RyGw8wqcsGhg38Er/CeBa/MhltSlDvJlMCCdjcvwgfCdUQXboisgiNhG8RARKhRZBLtyF8ErUJV8N3A9OeY6tDJzBNS6zQA3Kx4oiU4xLREt0QwiMbKzLhkU9gM7TK0hVCOtZCuFZCuEUQkippu0vSsVdJqqWVtlBbyoqusSNU7QhhswVt+TWNF3AKeKVoPKDRo9Gn8YSuOYTDIULNBZZIgkoUcYlpAoZvLiUUF7H0uVRQIsTQzKQPSSH2BZe6W2Pd5TKAIBEHAZcRFBlxBC3Pg3RQPwR9z+h7oC+MvgB9afQl6OPxQ9wFfd/o+6Cvjb4G/dDoQzuVuOfkpcALThnpYPyGlwqw0ZGgY+clN9drwEZfgr4dD95BhCF+ZXwV+OKNRPFgHUxeGny18dXga9dHG18Nvtr4avC188IjTxh88bQTBt8AfWHTrmjr9mns0qhpSwO87f9RY/i1E/O3IQygYviws1/++2KGnQE87Ngyz26Xq2KSjNLb9CUZlSyuH7r2TItbrOZ3KTwhLCrL82/ZbLFLYTPVImf3i7xId04hmY7v35LCqR1Sd3kxdmJ6TrKsncv3VVK0F9dPqBZVFvD4sX4nRZE/t5h5Uk5bhPWoaimlC6eYZdIOMXlMHLd5U451h70w+gzgDuLB//9M/jP/THDTvPfQht5DCHSu8+InTaaZdOkdrQbYn3Qba3YX/0ZjsWZdfquLYLDbjQTYHb0EWLedALXdUYDcairAvdFXUNVtLRiV213QaqvBoJXdYwbDzg8=";
    var candidateCache = {
        signature: null,
        result: null,
        pendingSignature: null,
        generation: 0,
        board: null,
        constraintsSignature: null,
        witnesses: [],
        conflict: null
    };
    var analysisTimer = null;
    var activeAnalysisAbort = null;
    var conflictHighlightTimer = null;
    var CONFLICT_HIGHLIGHT_MS = 4000;
    var AUTO_MARK_FONT_STYLE = 2;

    function setSolverRunning(running) {
        if (typeof document === "undefined") return;
        document.body.classList.toggle("sudoku-solver-running", running);
        var button = document.getElementById("sudoku_auto_solver");
        if (button) {
            button.title = running ? "Abort Auto Solver" : "Auto Solver";
            button.setAttribute("aria-label", button.title);
            var icon = button.querySelector("i");
            if (icon) icon.className = "fa fa-refresh";
        }
    }

    function getTightFitMapping(puzzle) {
        if (puzzle.tightFitMapping) return puzzle.tightFitMapping;
        var size = puzzleSize(puzzle) || SIZE;
        var mapping = {
            isTightFit: variantEnabled(puzzle, "tightfit"),
            size: size,
            abstractSize: size,
            visualToAbstract: {},
            abstractToVisual: {}
        };
        if (!mapping.isTightFit || !puzzle || !puzzle.pu_q) return mapping;

        var splitCells = {};
        Object.keys(puzzle.pu_q.symbol || {}).forEach(function(key) {
            var entry = puzzle.pu_q.symbol[key];
            if (entry && entry[1] === "line") {
                if (entry[0] === 3) splitCells[key] = "slash";
                if (entry[0] === 4) splitCells[key] = "backslash";
            } else if (entry && entry[1] === "diagonal_consecutive") {
                if (entry[0][0] === 1) splitCells[key] = "backslash";
                if (entry[0][1] === 1) splitCells[key] = "slash";
            }
        });
        Object.keys(puzzle.pu_q.line || {}).forEach(function(key) {
            var entry = puzzle.pu_q.line[key];
            if (entry === 2 || entry === 5) {
                var pts = key.split(",");
                if (pts.length === 2) {
                    var p1 = puzzle.point[pts[0]], p2 = puzzle.point[pts[1]];
                    if (p1 && p2 && p1.type === 1 && p2.type === 1) { // Type 1 is corner
                        var row1 = p1.y - 2, col1 = p1.x - 2;
                        var row2 = p2.y - 2, col2 = p2.x - 2;
                        if (Math.abs(row1 - row2) === 1 && Math.abs(col1 - col2) === 1) {
                            var minRow = Math.min(row1, row2);
                            var minCol = Math.min(col1, col2);
                            var cellKeyVal = cellKey(puzzle, minRow, minCol);
                            if (cellKeyVal) {
                                if ((row1 < row2 && col1 < col2) || (row1 > row2 && col1 > col2)) {
                                    splitCells[cellKeyVal] = "backslash";
                                } else {
                                    splitCells[cellKeyVal] = "slash";
                                }
                            }
                        }
                    }
                }
            }
        });
        var getDiagLineKeys = typeof diagonalLineKeys === "function" ? diagonalLineKeys : function() { return []; };
        getDiagLineKeys(puzzle).forEach(function(key) {
            var entry = puzzle.pu_q.lineE && puzzle.pu_q.lineE[key];
            if (entry === 12 || entry === 2) {
                var pts = key.split(",");
                if (pts.length === 2) {
                    var row1 = Math.floor(pts[0] / puzzle.nx0) - 2;
                    var col1 = (pts[0] % puzzle.nx0) - 2;
                    var row2 = Math.floor(pts[1] / puzzle.nx0) - 2;
                    var col2 = (pts[1] % puzzle.nx0) - 2;
                    if (Math.abs(row1 - row2) === 1 && Math.abs(col1 - col2) === 1) {
                        var minRow = Math.min(row1, row2);
                        var minCol = Math.min(col1, col2);
                        var cellKeyVal = cellKey(puzzle, minRow, minCol);
                        if (cellKeyVal) {
                            if ((row1 < row2 && col1 < col2) || (row1 > row2 && col1 > col2)) {
                                splitCells[cellKeyVal] = "backslash";
                            } else {
                                splitCells[cellKeyVal] = "slash";
                            }
                        }
                    }
                }
            }
        });
        Object.keys(puzzle.pu_q.numberS || {}).forEach(function(key) {
            var val = parseInt(key, 10);
            var baseKey = Math.floor(val / 4);
            var corner = val % 4;
            var cellStr = String(baseKey);
            if (!splitCells[cellStr]) {
                if (corner === 0 || corner === 3) splitCells[cellStr] = "slash";
                if (corner === 1 || corner === 2) splitCells[cellStr] = "backslash";
            }
        });

        var abstractSize = 0;
        for (var r = 0; r < size; r++) {
            var aCol = 0;
            for (var c = 0; c < size; c++) {
                var vKeyStr = r + "," + c;
                var cellKeyVal = cellKey(puzzle, r, c);
                var isSplit = splitCells[cellKeyVal];
                if (isSplit) {
                    mapping.visualToAbstract[vKeyStr] = [
                        { row: r, col: aCol },
                        { row: r, col: aCol + 1 }
                    ];
                    mapping.abstractToVisual[r + "," + aCol] = { vRow: r, vCol: c, half: "top", split: isSplit };
                    mapping.abstractToVisual[r + "," + (aCol + 1)] = { vRow: r, vCol: c, half: "bottom", split: isSplit };
                    aCol += 2;
                } else {
                    mapping.visualToAbstract[vKeyStr] = { row: r, col: aCol };
                    mapping.abstractToVisual[r + "," + aCol] = { vRow: r, vCol: c, half: "none", split: false };
                    aCol++;
                }
            }
            if (aCol > abstractSize) abstractSize = aCol;
        }
        mapping.abstractSize = abstractSize;
        puzzle.tightFitMapping = mapping;
        return mapping;
    }

    function puzzleSize(puzzle) {
        if (!puzzle) return SIZE;
        var horizontalSpace = Number(puzzle.space && puzzle.space[2] || 0) +
            Number(puzzle.space && puzzle.space[3] || 0);
        var verticalSpace = Number(puzzle.space && puzzle.space[0] || 0) +
            Number(puzzle.space && puzzle.space[1] || 0);
        var width = Number(puzzle.nx) - horizontalSpace;
        var height = Number(puzzle.ny) - verticalSpace;
        return width === height && [6, 7, 8, 9].indexOf(width) !== -1 ? width : 0;
    }

    function solverLogElements() {
        return {
            status: document.getElementById("sudoku-solver-status"),
            inlineStatus: document.getElementById("sudoku-auto-inline-status"),
            progress: document.getElementById("sudoku-solver-progress"),
            output: document.getElementById("sudoku-solver-log-output"),
            panel: document.getElementById("sudoku-solver-log")
        };
    }

    function setSolverStatus(elements, value) {
        if (elements.status) {
            elements.status.textContent = value;
        }
        if (elements.inlineStatus) {
            elements.inlineStatus.textContent = value;
        }
    }

    function resetSolverLog(message) {
        var elements = solverLogElements();
        setSolverStatus(elements, "Running");
        setSolverRunning(true);
        if (elements.progress) {
            elements.progress.max = 1;
            elements.progress.value = 0;
        }
        if (elements.output) {
            elements.output.textContent = "[" + new Date().toLocaleTimeString() + "] " + message + "\n";
        }
    }

    function appendSolverLog(event) {
        var elements = solverLogElements();
        if (elements.progress && event.total) {
            elements.progress.max = event.total;
            elements.progress.value = event.tested || 0;
        }
        if (event.type === "done") {
            setSolverStatus(elements, event.unique ? "Complete · unique" : "Complete · multiple solutions");
        } else if (event.type === "invalid" || event.type === "unsatisfiable") {
            setSolverStatus(elements, "No solution");
        } else if (event.type === "cancelled") {
            setSolverStatus(elements, "Restarting");
        } else if (event.type === "timeout") {
            setSolverStatus(elements, "Stopped · " + (event.limitLabel || "time limit"));
        }
        if (elements.output && event.message) {
            var line = "[" + new Date().toLocaleTimeString() + "] " + event.message;
            var lines = (elements.output.textContent + line + "\n").split("\n");
            elements.output.textContent = lines.slice(Math.max(0, lines.length - 121)).join("\n");
            elements.output.scrollTop = elements.output.scrollHeight;
        }
    }

    function requestCandidateAnalysis(puzzle, board, constraints, signature, constraintsSignature, seedSolutions) {
        if (activeAnalysisAbort) activeAnalysisAbort();
        var generation = ++candidateCache.generation;
        var startedAt = Date.now();
        var runLimitMs = sudokuSolverTimeLimitMs();
        var timedOut = false;
        var timeoutId = null;
        candidateCache.pendingSignature = signature;
        resetSolverLog(seedSolutions.length ?
            "Continuing exact candidate analysis from " + seedSolutions.length +
                " compatible cached witness" + (seedSolutions.length === 1 ? "." : "es.") :
            "Starting exact candidate analysis. This does not trust local pencil marks.");
        var analysisOptions = {
            seedSolutions: seedSolutions,
            isCancelled: function() {
                if (runLimitMs !== null && Date.now() - startedAt >= runLimitMs) {
                    timedOut = true;
                }
                return generation !== candidateCache.generation ||
                    !window.SudokuTools.autoEnabled || timedOut;
            },
            onProgress: function(event) {
                if (generation === candidateCache.generation) {
                    var elements = solverLogElements();
                    if (elements.progress && event.total) {
                        elements.progress.max = event.total;
                        elements.progress.value = event.tested || 0;
                    }
                    if (event.type === "done" || event.type === "invalid" ||
                        event.type === "unsatisfiable" || event.type === "cancelled") {
                        candidateCache.conflict = event.conflict || null;
                        if (typeof puzzle !== "undefined" && puzzle) {
                            showConflict(puzzle, event.conflict);
                        } else if (typeof pu !== "undefined" && pu) {
                            showConflict(pu, event.conflict);
                        }
                        setSolverRunning(false);
                        var terminalEvent = timedOut && event.type === "cancelled" ? "timeout" : event.type;
                        appendSolverLog(Object.assign({}, event, {
                            type: terminalEvent,
                            limitLabel: runLimitMs === null ? "" : sudokuSolverTimeLimitLabel(runLimitMs) + " limit",
                            message: (timedOut ? "Solver stopped at the " + sudokuSolverTimeLimitLabel(runLimitMs) + " limit." : event.message) +
                                " Total runtime: " +
                                ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
                        }));
                        if (event.type !== "cancelled" && typeof window !== "undefined" && window.showToast) {
                            if (event.type === "done") {
                                window.showToast(event.message || "Auto Solver complete.", "success", "Auto Solver");
                            } else if (event.type === "invalid" || event.type === "unsatisfiable") {
                                window.showToast(event.message || "No solution found.", "warning", "Auto Solver Conflict");
                            }
                        }
                    }
                }
            }
        };

        function runAnalysis() {
            if (typeof Worker === "undefined") {
                return SudokuCSPRuntime.getCandidatesAsync(board, constraints, analysisOptions);
            }
            return new Promise(function(resolve, reject) {
                var worker = new Worker(sudokuWorkerUrl("sudoku_solver_worker.js"));
                var settled = false;
                function finish(result, error) {
                    if (settled) return;
                    settled = true;
                    worker.terminate();
                    if (activeAnalysisAbort === abort) activeAnalysisAbort = null;
                    if (error) reject(error);
                    else resolve(result);
                }
                function abort() {
                    finish({ cancelled: true });
                }
                activeAnalysisAbort = abort;
                worker.onmessage = function(event) {
                    if (event.data.type === "progress") {
                        analysisOptions.onProgress(event.data.progress);
                    } else if (event.data.type === "result") {
                        finish(event.data.result);
                    } else if (event.data.type === "error") {
                        finish(null, new Error(event.data.message));
                    }
                };
                worker.onerror = function(event) {
                    finish(null, new Error(event.message || "CSP worker failed."));
                };
                worker.postMessage({
                    type: "analyze",
                    board: board,
                    constraints: constraints,
                    seedSolutions: seedSolutions
                });
            });
        }

        if (runLimitMs !== null) {
            timeoutId = setTimeout(function() {
                if (generation !== candidateCache.generation) return;
                timedOut = true;
                if (activeAnalysisAbort) activeAnalysisAbort();
                setSolverRunning(false);
                appendSolverLog({
                    type: "timeout",
                    limitLabel: sudokuSolverTimeLimitLabel(runLimitMs) + " limit",
                    message: "Solver stopped at the " + sudokuSolverTimeLimitLabel(runLimitMs) + " limit. Total runtime: " +
                        ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
                });
            }, runLimitMs);
        }

        runAnalysis().then(function(result) {
            clearTimeout(timeoutId);
            if (generation !== candidateCache.generation) {
                return;
            }
            if (result.cancelled) {
                candidateCache.pendingSignature = null;
                if (timedOut && window.SudokuTools) {
                    window.SudokuTools.autoEnabled = false;
                    window.SudokuTools.setToolbarState();
                    puzzle.redraw();
                }
                return;
            }
            candidateCache.pendingSignature = null;
            candidateCache.signature = signature;
            candidateCache.result = result;
            candidateCache.board = board.map(function(row) { return row.slice(); });
            candidateCache.constraintsSignature = constraintsSignature;
            candidateCache.witnesses = result.witnessSolutions || [];
            candidateCache.conflict = result.conflict || null;
            setSolverRunning(false);
            puzzle.redraw();
        }).catch(function(error) {
            clearTimeout(timeoutId);
            if (generation !== candidateCache.generation) {
                return;
            }
            candidateCache.pendingSignature = null;
            setSolverRunning(false);
            appendSolverLog({
                type: "invalid",
                message: "Solver stopped: " + error.message + " Total runtime: " +
                    ((Date.now() - startedAt) / 1000).toFixed(3) + " s."
            });
        });
    }

    function cancelCandidateAnalysis() {
        candidateCache.generation++;
        if (activeAnalysisAbort) activeAnalysisAbort();
        activeAnalysisAbort = null;
        candidateCache.pendingSignature = null;
        if (analysisTimer !== null) {
            clearTimeout(analysisTimer);
            analysisTimer = null;
        }
        var elements = solverLogElements();
        setSolverStatus(elements, "Idle");
        setSolverRunning(false);
    }

    function invalidateCandidateAnalysis() {
        candidateCache.generation++;
        candidateCache.signature = null;
        candidateCache.pendingSignature = null;
        candidateCache.result = null;
        candidateCache.board = null;
        candidateCache.constraintsSignature = null;
        candidateCache.witnesses = [];
        candidateCache.conflict = null;
        if (conflictHighlightTimer !== null) {
            clearTimeout(conflictHighlightTimer);
            conflictHighlightTimer = null;
        }
        setSolverRunning(false);
    }

    function showConflict(puzzle, conflict) {
        if (conflictHighlightTimer !== null) {
            clearTimeout(conflictHighlightTimer);
            conflictHighlightTimer = null;
        }
        candidateCache.conflict = conflict || null;
        if (puzzle) {
            puzzle.conflict_cells = puzzle.conflict_cells || [];
            puzzle.conflict_cells.length = 0;
            if (conflict && Array.isArray(conflict.cells)) {
                conflict.cells.forEach(function(cell) {
                    var k = cellKey(puzzle, cell.row, cell.col);
                    if (k) puzzle.conflict_cells.push(k);
                });
            }
            if (typeof puzzle.redraw === "function") {
                puzzle.redraw();
            }
        }
        if (puzzle && conflict && Array.isArray(conflict.cells) && conflict.cells.length) {
            conflictHighlightTimer = setTimeout(function() {
                conflictHighlightTimer = null;
                candidateCache.conflict = null;
                puzzle.conflict_cells.length = 0;
                if (typeof puzzle.redraw === "function") {
                    puzzle.redraw();
                }
            }, CONFLICT_HIGHLIGHT_MS);
            if (conflictHighlightTimer && typeof conflictHighlightTimer.unref === "function") {
                conflictHighlightTimer.unref();
            }
        }
    }

    function isClassicSudoku(puzzle) {
        var supportedGrid = puzzle && (puzzle.gridtype === "sudoku" || puzzle.gridtype === "square");
        return supportedGrid && !!puzzleSize(puzzle);
    }

    function cellKey(puzzle, row, col) {
        var top = Number(puzzle.space && puzzle.space[0] || 0);
        var left = Number(puzzle.space && puzzle.space[2] || 0);
        return (col + 2 + left) + ((row + 2 + top) * puzzle.nx0);
    }

    function boxDimensions(size) {
        if (size === 6) return { height: 2, width: 3 };
        if (size === 8) return { height: 2, width: 4 };
        if (size === 9) return { height: 3, width: 3 };
        return { height: 1, width: size };
    }

    function defaultIrregularRegions(size) {
        var dimensions = boxDimensions(size);
        var boxHeight = dimensions.height;
        var boxWidth = dimensions.width;
        return Array.from({ length: size * size }, function(_, index) {
            var row = (index / size) | 0;
            var col = index % size;
            return 1 + ((row / boxHeight) | 0) * (size / boxWidth) + ((col / boxWidth) | 0);
        });
    }

    function irregularRegionIds(puzzle) {
        var size = puzzleSize(puzzle) || SIZE;
        var stored = puzzle && puzzle.pu_q && puzzle.pu_q.irregularRegions;
        var defaults = defaultIrregularRegions(size);
        if (!Array.isArray(stored) || stored.length !== size * size) {
            return defaults;
        }
        return stored.map(function(value, index) {
            var normalized = String(value === undefined || value === null ? "" : value).trim();
            return normalized || String(defaults[index]);
        });
    }

    function irregularBoundaryEdges(puzzle, regionIds) {
        var size = puzzleSize(puzzle);
        if (!puzzle || !size || !Array.isArray(regionIds)) return [];
        var top = Number(puzzle.space && puzzle.space[0] || 0);
        var left = Number(puzzle.space && puzzle.space[2] || 0);
        var firstRow = 1 + top;
        var firstCol = 1 + left;
        var base = puzzle.nx0 * puzzle.ny0;
        var edges = [];
        function vertical(row, boundaryCol) {
            var latticeCol = firstCol + boundaryCol;
            var first = base + (firstRow + row) * puzzle.nx0 + latticeCol;
            return first + "," + (first + puzzle.nx0);
        }
        function horizontal(boundaryRow, col) {
            var first = base + (firstRow + boundaryRow) * puzzle.nx0 + firstCol + col;
            return first + "," + (first + 1);
        }
        for (var row = 0; row < size; row++) {
            for (var col = 1; col < size; col++) {
                if (String(regionIds[row * size + col - 1]) !== String(regionIds[row * size + col])) {
                    edges.push(vertical(row, col));
                }
            }
        }
        for (var boundaryRow = 1; boundaryRow < size; boundaryRow++) {
            for (var boundaryCol = 0; boundaryCol < size; boundaryCol++) {
                if (String(regionIds[(boundaryRow - 1) * size + boundaryCol]) !==
                    String(regionIds[boundaryRow * size + boundaryCol])) {
                    edges.push(horizontal(boundaryRow, boundaryCol));
                }
            }
        }
        return edges;
    }

    function digitFromEntry(entry) {
        if (!entry) {
            return 0;
        }
        if (entry[2] === "1") {
            var value = parseInt(entry[0], 10);
            return value >= 1 && value <= SIZE ? value : 0;
        }
        if (entry[2] === "7" && Array.isArray(entry[0])) {
            var digit = 0;
            var count = 0;
            for (var i = 0; i < SIZE; i++) {
                if (entry[0][i] === 1) {
                    digit = i + 1;
                    count++;
                }
            }
            return count === 1 ? digit : 0;
        }
        return 0;
    }


    function outsideSequenceFromEntry(entry) {
        if (!entry || ["1", "6", "10"].indexOf(String(entry[2])) === -1) return null;
        var str = String(entry[0]).trim().toUpperCase();;
        if (!str) return null;
        var parts = str.split(/[\s,\n]+/);
        var seq = [];
        for (var i = 0; i < parts.length; i++) {
            var val = parseInt(parts[i], 10);
            if (!Number.isFinite(val) || val < 0) return null;
            seq.push(val);
        }
        return seq;
    }

    function outsideClueFromEntry(entry) {
        // entry[2] "1" = normal number, "10" = long (multi-digit) number
        if (!entry || ["1", "6", "10"].indexOf(entry[2]) === -1) return null;
        var value = parseInt(entry[0], 10);
        return Number.isFinite(value) && value >= 0 ? value : null;
    }

    function readBoard(puzzle, includeSolution) {
        var tightFitMapping = getTightFitMapping(puzzle);
        SIZE = tightFitMapping.isTightFit ? tightFitMapping.abstractSize : (puzzleSize(puzzle) || SIZE);
        includeSolution = includeSolution !== false;
        var board = [];
        var isZeroEight = ["0to8", "08arrow", "08skyscrapers"].some(function(v) { return variantEnabled(puzzle, v); });
        for (var row = 0; row < SIZE; row++) {
            board[row] = [];
            for (var col = 0; col < SIZE; col++) {
                var aKey = row + "," + col;
                var visualMap = tightFitMapping.isTightFit ? tightFitMapping.abstractToVisual[aKey] : null;
                var problemDigit = 0;
                var digit = 0;

                if (tightFitMapping.isTightFit && visualMap && !visualMap.split && visualMap.half === "none") {
                    var vKey = cellKey(puzzle, visualMap.vRow, visualMap.vCol);
                    problemDigit = digitFromEntry(puzzle.pu_q.number[vKey]);
                    digit = problemDigit || (includeSolution ? digitFromEntry(puzzle.pu_a.number[vKey]) : 0) || 0;
                } else if (tightFitMapping.isTightFit && visualMap && visualMap.split) {
                    var vKey = cellKey(puzzle, visualMap.vRow, visualMap.vCol);
                    var topCorner = visualMap.split === "slash" ? 0 : 1;
                    var bottomCorner = visualMap.split === "slash" ? 3 : 2;
                    var corner = visualMap.half === "top" ? topCorner : bottomCorner;
                    var cornerKey = 4 * vKey + corner;
                    problemDigit = digitFromEntry(puzzle.pu_q.numberS && puzzle.pu_q.numberS[cornerKey]);
                    digit = problemDigit || (includeSolution ? digitFromEntry(puzzle.pu_a.numberS && puzzle.pu_a.numberS[cornerKey]) : 0) || 0;
                } else if (!tightFitMapping.isTightFit) {
                    var key = cellKey(puzzle, row, col);
                    var problemEntry = puzzle.pu_q.number[key];
                    var pinnochioClue = (variantEnabled(puzzle, "pinocchio") || variantEnabled(puzzle, "pinnochio")) &&
                        problemEntry && problemEntry[1] === 0;
                    problemDigit = (variantEnabled(puzzle, "pencilmarks") && problemEntry && problemEntry[2] === "7") || pinnochioClue ?
                        0 : digitFromEntry(problemEntry);
                    if (problemDigit === 0 && isZeroEight && problemEntry && String(problemEntry[0]).trim() === "0" && (problemEntry[2] === "1" || problemEntry[2] === "2")) {
                        problemDigit = -1; // special case to preserve explicit zero before +1
                    }
                    digit = problemDigit || (includeSolution ? digitFromEntry(puzzle.pu_a.number[key]) : 0) || 0;
                    if (digit === 0 && isZeroEight && includeSolution && puzzle.pu_a.number[key] && String(puzzle.pu_a.number[key][0]).trim() === "0" && (puzzle.pu_a.number[key][2] === "1" || puzzle.pu_a.number[key][2] === "2")) {
                        digit = -1;
                    }
                }

                if (isZeroEight && digit !== 0) digit = digit === -1 ? 1 : digit + 1;
                board[row][col] = digit;
            }
        }
        return board;
    }

    function keyToCell(puzzle, key) {
        var top = Number(puzzle.space && puzzle.space[0] || 0);
        var left = Number(puzzle.space && puzzle.space[2] || 0);
        var col = (key % puzzle.nx0) - 2 - left;
        var row = ((key / puzzle.nx0) | 0) - 2 - top;
        if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) {
            return null;
        }
        return { row: row, col: col, key: key };
    }

    function pathToCells(puzzle, path) {
        var cells = [];
        if (!Array.isArray(path)) {
            return cells;
        }
        for (var i = 0; i < path.length; i++) {
            var cell = keyToCell(puzzle, path[i]);
            if (cell) {
                cells.push(cell);
            }
        }
        return cells;
    }

    function connectedLinePaths(puzzle, style) {
        var active = {};
        (puzzle.centerlist || []).forEach(function(key) { active[key] = true; });

        var adjacency = {};
        Object.keys(puzzle.pu_q.line || {}).forEach(function(edge) {
            if (puzzle.pu_q.line[edge] !== style) return;
            var endpoints = edge.split(",").map(Number);
            if (endpoints.length !== 2 || !active[endpoints[0]] || !active[endpoints[1]]) { return; }
            (adjacency[endpoints[0]] || (adjacency[endpoints[0]] = [])).push(endpoints[1]);
            (adjacency[endpoints[1]] || (adjacency[endpoints[1]] = [])).push(endpoints[0]);
        });
        var visited = {};
        var paths = [];
        Object.keys(adjacency).forEach(function(nodeText) {
            if (visited[nodeText]) return;
            var component = [];
            var queue = [Number(nodeText)];
            visited[nodeText] = true;
            while (queue.length) {
                var node = queue.shift();
                component.push(node);
                (adjacency[node] || []).forEach(function(next) {
                    if (!visited[next]) { visited[next] = true; queue.push(next); }
                });
            }
            var current = component.find(function(key) { return adjacency[key].length === 1; }) || component[0];
            var previous = null;
            var ordered = [];
            while (current !== undefined && ordered.length < component.length) {
                ordered.push(current);
                var next = (adjacency[current] || []).find(function(key) {
                    return key !== previous && ordered.indexOf(key) === -1;
                });
                previous = current; current = next;
            }
            var path = ordered.map(function(key) { return keyToCell(puzzle, key); }).filter(Boolean);
            if (path.length > 1) paths.push(path);
        });
        return paths;
    }

    function readKillerTotal(puzzle, cage) {
        for (var i = 0; i < cage.length; i++) {
            var base = cage[i] + puzzle.nx0 * puzzle.ny0;
            for (var corner = 0; corner < 4; corner++) {
                var entry = puzzle.pu_q.numberS[4 * base + corner];
                if (entry && entry[0] !== undefined && entry[0] !== null) {
                    var total = parseInt(entry[0].toString().replace(/\s+/g, ""), 10);
                    if (total > 0) {
                        return total;
                    }
                }
            }
        }
        return 0;
    }

    function readCageLabel(puzzle, cage) {
        for (var i = 0; i < cage.length; i++) {
            var base = cage[i] + puzzle.nx0 * puzzle.ny0;
            for (var corner = 0; corner < 4; corner++) {
                var entry = puzzle.pu_q.numberS && puzzle.pu_q.numberS[4 * base + corner];
                if (entry && entry[0] !== undefined && entry[0] !== null && String(entry[0]).trim()) {
                    return String(entry[0]).trim();
                }
            }
        }
        return "";
    }

    function canonicalVariantName(name) {
        var normalized = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return ({
            elimination: "eliminate",
            deadoralive: "deadoralivearrows",
            disjointgroups: "disjoint",
            extraregions: "extraregion",
            renbanline: "renban",
            renbanregion: "renban"
        })[normalized] || normalized;
    }

    function variantEnabled(puzzle, name) {
        if (!puzzle) {
            return false;
        }
        var wanted = canonicalVariantName(name);
        if (Array.isArray(puzzle.activeSudokuVariants)) {
            return puzzle.activeSudokuVariants.some(function(variant) {
                return canonicalVariantName(variant) === wanted;
            });
        }
        return canonicalVariantName(puzzle.activeSudokuVariant) === wanted;
    }

    function readLegacyConstraints(puzzle) {
        var tightFitMapping = getTightFitMapping(puzzle);
        SIZE = tightFitMapping.isTightFit ? tightFitMapping.abstractSize : (puzzleSize(puzzle) || SIZE);
        var isZeroEight = ["0to8", "08arrow", "08skyscrapers"].some(function(v) { return variantEnabled(puzzle, v); });
        var constraints = {
            isZeroEight: isZeroEight,
            citywalk: [],
            starCells: [],
            thermos: [],
            arrows: [],
            killers: [],
            oddEven: [],
            oddEvenCounts: [],
            oddEvenSums: [],
            diagonalAllDifferent: [],
            antiDiagonals: [],
            antiKing: [],
            antiKnight: [],
            sequenceTopBottom: [],
            chessKings: [],
            polePosition: [],
            chessKings: [],
            chessKings: [],
            nonConsecutive: [],
            diagonalNonConsecutive: [],
            noEvenNeighbours: [],
            noThreeInRow: [],
            dutchFlatMates: [],
            queenDigits: [],
            pirateCells: [],
            touchyCells: [],
            emitters: [],
            unicorn: [],
            edgeRelations: [],
            catalogLines: [],
            quadRelations: [],
            mathdoku: [],
            directionalMarks: [],
            sumDetectorGroups: [],
            shadedParityGroups: [],
            zones: [],
            somewhere: [],
            regionAllDifferent: [],
            regionCoverage: [],
            watchtowers: [],
            selfjoin: [],
            scatteredAllDifferent: [],
            invalidRegions: [],
            extraLargeRegions: [],
            difference2Neighbours: [],
            offsetStarts: [],
            oneKnightStep: [],
            repeatedNeighbors: [],
            escapeStarts: [],
            renbanRegions: [],
            cloneGroups: [],
            consecutiveCloneGroups: [],
            cloneShapeChecks: [],
            hiddenCloneShapeChecks: [],
            knightmare: [],
            lc: [],
            codedGroups: [],
            pencilmarkCells: [],
            symmetricUnequal: [],
            stretchedThermos: [],
            productKillers: [],
sumOrProductKillers: [],
            threeDigitNumbersKillers: [],
            tableauxCages: [],
            soloKillerGroups: [],
            outsideRelations: [],
            fullRankGroups: [],
            differentParity: [],
            disparity: [],
            rossiniLines: [],
            cellRelations: [],
            palindromes: [],
            almostPalindromes: [],
            disguisedPalindromes: [],
            antiConsecutive: [],
            averageArrows: [],
            countDifferent: [],
            parityCircles: [],
            oneTouch: [],
            countOdd: [],
            kropki: [],
            doublekropki: [],
            fadedKropki: [],
            fives: [],
            oddLabyrinth: [],
            evenPassage: [],
            xv: [],
            battenburg: [],
            midpoints: [],
            skyscrapers: [],
            sandwiches: [],
            uniqueRectangles: [],
            inequalityTriples: [],
            sumskyscrapers: [],
            sumsandwiches: [],
            sameSumGroups: [],
            equalsumlines: [],
            number5isalive: [],
            divisiblebythree: [],
            oddtapa: [],
            tictactoe: [],
            tictactoewinner: [],
            roundOffCages: [],
            orderingGroups: [],
            wildcards: [],
            braille: [],
            supported: ["classic"]
        };
        if (!puzzle || !puzzle.pu_q) {
            return constraints;
        }

        if (tightFitMapping.isTightFit) {
            constraints.baseCols = false;
            constraints.baseBoxes = false;
            constraints.supported.push("tightfit");
            var visualSize = tightFitMapping.size;
            var visualColumns = Array.from({ length: visualSize }, function() { return []; });
            var unusedCells = [];

            for (var r = 0; r < visualSize; r++) {
                var abstractColsUsed = 0;
                for (var c = 0; c < visualSize; c++) {
                    var vKey = r + "," + c;
                    var aCells = tightFitMapping.visualToAbstract[vKey];
                    if (Array.isArray(aCells)) {
                        visualColumns[c].push(aCells[0]);
                        visualColumns[c].push(aCells[1]);
                        constraints.cellRelations.push({
                            relation: "fortress",
                            shaded: aCells[1], // top digit is unshaded, bottom is shaded, so bottom > top (top < bottom)
                            unshaded: aCells[0]
                        });
                        abstractColsUsed += 2;
                    } else {
                        visualColumns[c].push(aCells);
                        abstractColsUsed++;
                    }
                }
                for (var c2 = abstractColsUsed; c2 < tightFitMapping.abstractSize; c2++) {
                    unusedCells.push({ row: r, col: c2 });
                }
            }
            if (unusedCells.length > 0) {
                constraints.regionCoverage.push(unusedCells);
            }

            visualColumns.forEach(function(colCells) {
                constraints.regionAllDifferent.push(colCells);
            });
        }

        var regionIdVariant = ["irregular", "scattered", "deficit", "surplus", "toroidal"].find(function(name) {
            return variantEnabled(puzzle, name);
        });
        if (regionIdVariant || tightFitMapping.isTightFit) {
            var irregularGroups = {};
            var vSize = tightFitMapping.isTightFit ? tightFitMapping.size : SIZE;
            irregularRegionIds(puzzle).forEach(function(regionId, index) {
                var key = String(regionId);
                var vRow = (index / vSize) | 0;
                var vCol = index % vSize;
                if (tightFitMapping.isTightFit) {
                    var aCells = tightFitMapping.visualToAbstract[vRow + "," + vCol];
                    if (Array.isArray(aCells)) {
                        (irregularGroups[key] || (irregularGroups[key] = [])).push(aCells[0]);
                        (irregularGroups[key] || (irregularGroups[key] = [])).push(aCells[1]);
                    } else {
                        (irregularGroups[key] || (irregularGroups[key] = [])).push(aCells);
                    }
                } else {
                    (irregularGroups[key] || (irregularGroups[key] = [])).push({
                        row: vRow,
                        col: vCol
                    });
                }
            });
            constraints.baseBoxes = false;
            var persistedRegions = Object.keys(irregularGroups).map(function(regionId) {
                return irregularGroups[regionId];
            });
            if (regionIdVariant === "surplus") {
                Array.prototype.push.apply(constraints.regionCoverage, persistedRegions);
            } else {
                Array.prototype.push.apply(constraints.regionAllDifferent, persistedRegions);
            }
            var invalidSizes = persistedRegions.filter(function(region) {
                if (regionIdVariant === "deficit") return region.length > SIZE;
                if (regionIdVariant === "surplus") return region.length < SIZE;
                return region.length !== SIZE;
            });
            if (invalidSizes.length && regionIdVariant) {
                var requirement = regionIdVariant === "deficit" ? "at most " + SIZE + " cells" :
                    regionIdVariant === "surplus" ? "at least " + SIZE + " cells" : "exactly " + SIZE + " cells";
                constraints.invalidRegions.push({
                    cells: invalidSizes.reduce(function(cells, region) { return cells.concat(region); }, []),
                    message: regionIdVariant.replace(/\b\w/g, function(letter) { return letter.toUpperCase(); }) +
                        " requires every region to contain " + requirement + "."
                });
            }
            if (regionIdVariant) {
                constraints.supported.push(regionIdVariant);
            }
        }

        [["thermo", "thermos"], ["nobulbthermo", "thermos"]].forEach(function(names) {
            var source = puzzle.pu_q[names[0]] || [];
            for (var i = 0; i < source.length; i++) {
                var cells = pathToCells(puzzle, source[i]);
                if (cells.length > 1) {
                    if (names[0] === "nobulbthermo" && variantEnabled(puzzle, "creasing")) {
                        constraints.catalogLines.push({ path: cells, relation: "creasing" });
                    } else if (names[0] === "nobulbthermo" && variantEnabled(puzzle, "emitters")) {
                        // Handled by emitters block
                    } else if (variantEnabled(puzzle, "stretchedthermo")) constraints.stretchedThermos.push(cells);
                    else constraints[names[1]].push(cells);
                }
            }
        });
        if (constraints.thermos.length) {
            constraints.supported.push("thermo");
        }
        if (variantEnabled(puzzle, "stretchedthermo")) constraints.supported.push("stretchedthermo");
        if (variantEnabled(puzzle, "creasing") && constraints.supported.indexOf("creasing") === -1) {
            constraints.supported.push("creasing");
        }

        var arrows = puzzle.pu_q.arrows || [];
        for (var a = 0; a < arrows.length; a++) {
            var arrowCells = pathToCells(puzzle, arrows[a]);
            if (arrowCells.length > 1) {
                if (variantEnabled(puzzle, "averagearrows")) {
                    constraints.averageArrows.push({ circle: arrowCells[0], shaft: arrowCells.slice(1) });
                } else if (variantEnabled(puzzle, "countdifferent")) {
                    constraints.countDifferent.push({ circle: arrowCells[0], shaft: arrowCells.slice(1) });
                } else if (variantEnabled(puzzle, "counttheoddones")) {
                    constraints.countOdd.push({ circle: arrowCells[0], shaft: arrowCells.slice(1) });
                } else {
                    constraints.arrows.push({ circle: arrowCells[0], shaft: arrowCells.slice(1) });
                }

            }
        }
                if (constraints.zones.length) {
            constraints.supported.push("zones");
        }
        if (constraints.somewhere.length) {
            constraints.supported.push("somewhere");
        }
        if (constraints.arrows.length || variantEnabled(puzzle, "arrow")) {
            constraints.supported.push("arrow");
        }
        if (constraints.averageArrows.length) {
            constraints.supported.push("averagearrows");
        }
        if (constraints.countDifferent.length || variantEnabled(puzzle, "countdifferent")) {
            constraints.supported.push("countdifferent");
        }
        if (constraints.countOdd.length || variantEnabled(puzzle, "counttheoddones")) {
            constraints.supported.push("counttheoddones");
        }

        var activeCells = {};
        (puzzle.centerlist || []).forEach(function(key) {
            activeCells[key] = true;
        });

        var cages = typeof puzzle.refreshKillerCages === "function" ?
            puzzle.refreshKillerCages("pu_q") : (puzzle.pu_q.killercages || []);
        var regionVariantNames = ["clone", "consecutiveclone", "renban",
            "productkiller", "solokiller", "fortress", "multiplication", "clock", "codedpairs", "codedclone", "number 5 is alive", "sumset", "zones", "somewhere", "sumorproductkiller", "tableaux", "roundoff", "ordering","threedigitnumberskiller", "different parity"];
        var usesCagedRegions = regionVariantNames.some(function(name) { return variantEnabled(puzzle, name); });
        var regionCages = [];
        for (var k = 0; k < cages.length; k++) {
            var cageCells = pathToCells(puzzle, cages[k]);
            if (cageCells.length) {
                regionCages.push(cageCells);
                                if (variantEnabled(puzzle, "zones")) {
                    var label = readCageLabel(puzzle, cages[k]);
                    if (label) {
                        var digits = (label.match(/\d/g) || []).map(Number).filter(function(d) { return d > 0; });
                        if (digits.length) {
                            constraints.zones.push({ cells: cageCells, digits: digits });
                        }
                    }
                }

                if (variantEnabled(puzzle, "somewhere")) {
                    var label = readCageLabel(puzzle, cages[k]);
                    if (label) {
                        var num = Number(label);
                        if (!isNaN(num) && num > 0) {
                            constraints.somewhere.push({ cells: cageCells, digit: num });
                        }
                    }
                }

                if (variantEnabled(puzzle, "odd even sum")) {
                    var label = readCageLabel(puzzle, cages[k]);
                    if (label === "O" || label === "E") {
                        constraints.oddEvenSums.push({ cells: cageCells, parity: label === "O" ? "odd" : "even" });
                    }
                }
                if (!variantEnabled(puzzle, "killer") && !usesCagedRegions && !variantEnabled(puzzle, "extraregion")) {
                    constraints.killers.push({ cells: cageCells, total: readKillerTotal(puzzle, cages[k]) });
                }
                if (variantEnabled(puzzle, "different parity")) {
                    if (cageCells.length !== 2) {
                        throw new Error("Different Parity cages must be exactly 2 cells long");
                    }
                    constraints.differentParity.push(cageCells);
                }
            }
        }
        if (variantEnabled(puzzle, "odd even sum")) {
            constraints.supported.push("odd even sum");
        }
        var windokuRegionSignatures = ["1:1|1:2|1:3|2:1|2:2|2:3|3:1|3:2|3:3",
            "1:4|1:5|1:6|2:4|2:5|2:6|3:4|3:5|3:6",
            "4:1|4:2|4:3|5:1|5:2|5:3|6:1|6:2|6:3",
            "4:4|4:5|4:6|5:4|5:5|5:6|6:4|6:5|6:6"];
        function regionSignature(cells) {
            return cells.map(function(cell) { return cell.row + ":" + cell.col; }).sort().join("|");
        }
        var variantRegionCages = regionCages;
        if (constraints.killers.length) {
            constraints.supported.push("killer");
        }
        if (variantEnabled(puzzle, "productkiller")) {
            for (var productIndex = 0; productIndex < cages.length; productIndex++) {
                var productCells = pathToCells(puzzle, cages[productIndex]);
                var productTotal = readKillerTotal(puzzle, cages[productIndex]);
                if (productCells.length && productTotal) constraints.productKillers.push({ cells: productCells, total: productTotal });
            }
            constraints.supported.push("productkiller");
        }
if (variantEnabled(puzzle, "sumorproductkiller")) {
            for (var spIndex = 0; spIndex < cages.length; spIndex++) {
                var spCells = pathToCells(puzzle, cages[spIndex]);
                var spTotal = readKillerTotal(puzzle, cages[spIndex]);
                if (spCells.length && spTotal) constraints.sumOrProductKillers.push({ cells: spCells, total: spTotal });
            }
            constraints.supported.push("sumorproductkiller");
        }






        if (variantEnabled(puzzle, "threedigitnumberskiller")) {
            for (var tIndex = 0; tIndex < cages.length; tIndex++) {
                var tCells = pathToCells(puzzle, cages[tIndex]);
                var tTotal = readKillerTotal(puzzle, cages[tIndex]);
                if (tCells.length) {
                    var rowGroups = {};
                    tCells.forEach(function(cell) {
                        rowGroups[cell.row] = rowGroups[cell.row] || [];
                        rowGroups[cell.row].push(cell);
                    });
                    var numberLines = [];
                    Object.keys(rowGroups).forEach(function(r) {
                        var rCells = rowGroups[r];
                        rCells.sort(function(a, b) { return a.col - b.col; });
                        if (rCells.length === 3) {
                            numberLines.push(rCells);
                        }
                    });
                    constraints.threeDigitNumbersKillers.push({ cells: tCells, total: tTotal, lines: numberLines });
                }
            }
            constraints.supported.push("threedigitnumberskiller");
        }







        if (variantEnabled(puzzle, "tableaux")) {
            for (var tIndex = 0; tIndex < cages.length; tIndex++) {
                var tCells = pathToCells(puzzle, cages[tIndex]);
                if (tCells.length) constraints.tableauxCages.push({ cells: tCells });
            }
            constraints.supported.push("tableaux");
        }
        if (variantEnabled(puzzle, "solokiller")) {
            if (regionCages.length) constraints.soloKillerGroups.push(regionCages);
            constraints.supported.push("solokiller");
        }
        if (variantEnabled(puzzle, "number 5 is alive")) {
            for (var k = 0; k < cages.length; k++) {
                var cageCells = pathToCells(puzzle, cages[k]);
                if (cageCells.length) {
                    constraints.number5isalive.push({ cells: cageCells });
                }
            }
            constraints.supported.push("number5isalive");
        }
        if (variantEnabled(puzzle, "sumset")) {
            if (regionCages.length) constraints.sumsetCages = [regionCages];
            constraints.supported.push("sumset");
        }
        if (variantEnabled(puzzle, "roundoff")) {
            for (var k = 0; k < cages.length; k++) {
                var cageCells = pathToCells(puzzle, cages[k]);
                var clue = readKillerTotal(puzzle, cages[k]);
                if (cageCells.length === 2 && clue !== undefined) {
                    constraints.roundOffCages.push({ cells: cageCells, total: clue });
                }
            }
            constraints.supported.push("roundoff");
        }
        if (variantEnabled(puzzle, "ordering")) {
            var orderingCages = [];
            for (var k = 0; k < cages.length; k++) {
                var cageCells = pathToCells(puzzle, cages[k]);
                var label = readCageLabel(puzzle, cages[k]);
                var order = parseInt(label, 10);
                if (cageCells.length >= 2 && !isNaN(order)) {
                    orderingCages.push({ cells: cageCells, order: order });
                }
            }
            if (orderingCages.length > 0) {
                orderingCages.sort(function(a, b) { return a.order - b.order; });
                constraints.orderingGroups.push(orderingCages);
            }
            constraints.supported.push("ordering");
        }
        if (variantEnabled(puzzle, "codedclone")) {
            var codedCloneGroups = {};
            for (var codedCloneIndex = 0; codedCloneIndex < cages.length; codedCloneIndex++) {
                var cloneCells = pathToCells(puzzle, cages[codedCloneIndex]);
                var cloneLabel = readCageLabel(puzzle, cages[codedCloneIndex]);
                if (cloneCells.length > 0 && cloneLabel) {
                    (codedCloneGroups[cloneLabel] || (codedCloneGroups[cloneLabel] = [])).push(cloneCells);
                }
            }
            Object.keys(codedCloneGroups).forEach(function(label) {
                var group = codedCloneGroups[label];
                if (group.length > 1) {
                    var clones = group.map(function(cage) {
                        var minRow = Math.min.apply(null, cage.map(function(cell) { return cell.row; }));
                        var minCol = Math.min.apply(null, cage.map(function(cell) { return cell.col; }));
                        return cage.map(function(cell) {
                            return { rowOffset: cell.row - minRow, colOffset: cell.col - minCol, cell: cell };
                        }).sort(function(first, second) {
                            return first.rowOffset - second.rowOffset || first.colOffset - second.colOffset;
                        }).map(function(item) {
                            return item.cell;
                        });
                    });
                    constraints.cellRelations.push({
                        relation: "codedclone", clones: clones
                    });
                }
            });
            constraints.supported.push("codedclone");
        }
        if (variantEnabled(puzzle, "renban") && variantRegionCages.length) {
            Array.prototype.push.apply(constraints.renbanRegions, variantRegionCages);
            if (constraints.supported.indexOf("renban") === -1) constraints.supported.push("renban");
        }

        var shadedCells = [];
        Object.keys(puzzle.pu_q.surface || {}).forEach(function(key) {
            if (!puzzle.pu_q.surface[key] || !activeCells[key]) return;
            var cell = keyToCell(puzzle, Number(key));
            if (cell) shadedCells.push(cell);
        });
        if (variantEnabled(puzzle, "watchtowers")) {
            constraints.watchtowers.push(shadedCells);
            constraints.supported.push("watchtowers");
        }
        if (variantEnabled(puzzle, "selfjoin")) {
            constraints.selfjoin.push(shadedCells);
            constraints.supported.push("selfjoin");
        }
        if (variantEnabled(puzzle, "scattered")) {
            if (shadedCells.length === SIZE) {
                constraints.scatteredAllDifferent.push(shadedCells);
            } else {
                constraints.invalidRegions.push({
                    cells: shadedCells,
                    message: "Scattered requires exactly " + SIZE + " aesthetically shaded cells."
                });
            }
        }
        if (variantEnabled(puzzle, "extraregion")) {
            var extraRegionLookup = {};
            shadedCells.forEach(function(cell) { extraRegionLookup[cell.row + ":" + cell.col] = cell; });
            var extraRegionVisited = {};
            shadedCells.forEach(function(start) {
                var startKey = start.row + ":" + start.col;
                if (extraRegionVisited[startKey]) return;
                var component = [], queue = [start];
                extraRegionVisited[startKey] = true;
                while (queue.length) {
                    var current = queue.shift();
                    component.push(current);
                    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function(offset) {
                        var neighborKey = (current.row + offset[0]) + ":" + (current.col + offset[1]);
                        if (extraRegionLookup[neighborKey] && !extraRegionVisited[neighborKey]) {
                            extraRegionVisited[neighborKey] = true;
                            queue.push(extraRegionLookup[neighborKey]);
                        }
                    });
                }
                constraints.regionAllDifferent.push(component);
            });
            constraints.supported.push("extraregion");
        }
        if (variantEnabled(puzzle, "extralargeregions")) {
            var extraLargeRegionLookup = {};
            shadedCells.forEach(function(cell) { extraLargeRegionLookup[cell.row + ":" + cell.col] = cell; });
            var extraLargeRegionVisited = {};
            shadedCells.forEach(function(start) {
                var startKey = start.row + ":" + start.col;
                if (extraLargeRegionVisited[startKey]) return;
                var component = [], queue = [start];
                extraLargeRegionVisited[startKey] = true;
                while (queue.length) {
                    var current = queue.shift();
                    component.push(current);
                    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function(offset) {
                        var neighborKey = (current.row + offset[0]) + ":" + (current.col + offset[1]);
                        if (extraLargeRegionLookup[neighborKey] && !extraLargeRegionVisited[neighborKey]) {
                            extraLargeRegionVisited[neighborKey] = true;
                            queue.push(extraLargeRegionLookup[neighborKey]);
                        }
                    });
                }
                constraints.extraLargeRegions.push(component);
            });
            constraints.supported.push("extralargeregions");
        }
        if (variantEnabled(puzzle, "difference2neighbours")) {
            constraints.difference2Neighbours = shadedCells.slice();
            constraints.supported.push("difference2neighbours");
        }
        if (variantEnabled(puzzle, "oneknightstep")) {
            constraints.oneKnightStep = shadedCells.slice();
            constraints.supported.push("oneknightstep");
        }
        if (variantEnabled(puzzle, "repeatedneighbors")) {
            constraints.repeatedNeighbors = shadedCells.slice();
            constraints.supported.push("repeatedneighbors");
        }
        if (variantEnabled(puzzle, "alloddalleven")) {
            var parityBoxes = {};
            var parityDimensions = boxDimensions(SIZE);
            var parityBoxHeight = parityDimensions.height;
            var parityBoxWidth = parityDimensions.width;
            shadedCells.forEach(function(cell) {
                var boxKey = Math.floor(cell.row / parityBoxHeight) + ":" + Math.floor(cell.col / parityBoxWidth);
                (parityBoxes[boxKey] || (parityBoxes[boxKey] = [])).push(cell);
            });
            Object.keys(parityBoxes).forEach(function(boxKey) {
                if (parityBoxes[boxKey].length > 1) constraints.shadedParityGroups.push(parityBoxes[boxKey]);
            });
            constraints.supported.push("alloddalleven");
        }
        function correspondingRegionGroups(components, target) {
            var byShape = {};
            components.forEach(function(component) {
                var minRow = Math.min.apply(null, component.map(function(cell) { return cell.row; }));
                var minCol = Math.min.apply(null, component.map(function(cell) { return cell.col; }));
                var normalized = component.map(function(cell) {
                    return { row: cell.row - minRow, col: cell.col - minCol, cell: cell };
                }).sort(function(first, second) { return first.row - second.row || first.col - second.col; });
                var signature = normalized.map(function(item) { return item.row + ":" + item.col; }).join("|");
                (byShape[signature] || (byShape[signature] = [])).push(normalized);
            });
            var valid = components.length > 0;
            Object.keys(byShape).forEach(function(signature) {
                var matching = byShape[signature];
                if (matching.length < 2) {
                    valid = false;
                    return;
                }
                for (var position = 0; position < matching[0].length; position++) {
                    target.push(matching.map(function(component) { return component[position].cell; }));
                }
            });
            return valid;
        }

        if (variantEnabled(puzzle, "clone") || variantEnabled(puzzle, "consecutiveclone") || variantEnabled(puzzle, "hiddenclone")) {
            var shadedLookup = {};
            shadedCells.forEach(function(cell) { shadedLookup[cell.row + ":" + cell.col] = cell; });
            var cloneVisited = {};
            var cloneComponents = variantRegionCages.slice();
            if (!cloneComponents.length) {
                shadedCells.forEach(function(start) {
                    var startKey = start.row + ":" + start.col;
                    if (cloneVisited[startKey]) return;
                    var component = [];
                    var queue = [start];
                    cloneVisited[startKey] = true;
                    while (queue.length) {
                        var cell = queue.shift();
                        component.push(cell);
                        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function(offset) {
                            var key = (cell.row + offset[0]) + ":" + (cell.col + offset[1]);
                            if (shadedLookup[key] && !cloneVisited[key]) {
                                cloneVisited[key] = true;
                                queue.push(shadedLookup[key]);
                            }
                        });
                    }
                    cloneComponents.push(component);
                });
            }
            if (variantEnabled(puzzle, "clone")) {
                constraints.cloneShapeChecks.push({ valid: correspondingRegionGroups(cloneComponents, constraints.cloneGroups) });
                constraints.supported.push("clone");
            }
            if (variantEnabled(puzzle, "consecutiveclone")) {
                constraints.cloneShapeChecks.push({
                    valid: correspondingRegionGroups(cloneComponents, constraints.consecutiveCloneGroups)
                });
                constraints.supported.push("consecutiveclone");
            }
            if (variantEnabled(puzzle, "hiddenclone")) {
                constraints.hiddenCloneShapeChecks = cloneComponents.map(function(component) { return { component: component }; });
                constraints.supported.push("hiddenclone");
            }
        }


        function anyKeyToCell(puzzle, key) {
            var top = Number(puzzle.space && puzzle.space[0] || 0);
            var left = Number(puzzle.space && puzzle.space[2] || 0);
            var col = (key % puzzle.nx0) - 2 - left;
            var row = ((key / puzzle.nx0) | 0) - 2 - top;
            return { row: row, col: col, key: key };
        }

        if (variantEnabled(puzzle, "shape")) {
            var shapeInside = [];
            var shapeOutside = [];

            var allCages = typeof puzzle.refreshKillerCages === "function" ? puzzle.refreshKillerCages("pu_q") : (puzzle.pu_q.killercages || []);

            if (allCages.length > 0) {
                for (var k = 0; k < allCages.length; k++) {
                    var path = allCages[k];
                    if (!Array.isArray(path)) continue;
                    var cells = [];
                    for (var i = 0; i < path.length; i++) {
                        cells.push(anyKeyToCell(puzzle, path[i]));
                    }
                    if (!cells.length) continue;

                    var isInside = cells.every(function(c) {
                        return c.row >= 0 && c.row < SIZE && c.col >= 0 && c.col < SIZE;
                    });

                    if (isInside) shapeInside.push(cells);
                    else shapeOutside.push(cells);
                }
            } else {
                var surfaceCells = [];
                Object.keys(puzzle.pu_q.surface || {}).forEach(function(key) {
                    if (puzzle.pu_q.surface[key]) {
                        surfaceCells.push(anyKeyToCell(puzzle, Number(key)));
                    }
                });

                var surfaceLookup = {};
                surfaceCells.forEach(function(c) { surfaceLookup[c.row + ":" + c.col] = c; });

                var visited = {};
                surfaceCells.forEach(function(c) {
                    var startKey = c.row + ":" + c.col;
                    if (visited[startKey]) return;
                    var component = [];
                    var queue = [c];
                    visited[startKey] = true;
                    while (queue.length) {
                        var curr = queue.shift();
                        component.push(curr);
                        [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(function(offset) {
                            var nKey = (curr.row + offset[0]) + ":" + (curr.col + offset[1]);
                            if (surfaceLookup[nKey] && !visited[nKey]) {
                                visited[nKey] = true;
                                queue.push(surfaceLookup[nKey]);
                            }
                        });
                    }
                    var isInside = component.every(function(compCell) {
                        return compCell.row >= 0 && compCell.row < SIZE && compCell.col >= 0 && compCell.col < SIZE;
                    });
                    if (isInside) shapeInside.push(component);
                    else shapeOutside.push(component);
                });
            }

            var outShapesWithDigits = shapeOutside.map(function(comp) {
                return comp.map(function(c) {
                    var digit = null;
                    var entry = puzzle.pu_q.number && puzzle.pu_q.number[c.key];
                    if (entry && entry[0] !== undefined && entry[0] !== null && String(entry[0]).trim()) {
                        var d = parseInt(String(entry[0]).trim(), 10);
                        if (!isNaN(d) && d > 0) digit = d;
                    }
                    return { row: c.row, col: c.col, digit: digit, orig: c };
                });
            });

            function normalizeShape(cells) {
                var minRow = Math.min.apply(null, cells.map(function(c) { return c.row; }));
                var minCol = Math.min.apply(null, cells.map(function(c) { return c.col; }));
                var norm = cells.map(function(c) {
                    return { row: c.row - minRow, col: c.col - minCol, orig: c.orig, digit: c.digit };
                });
                norm.sort(function(a, b) { return a.row - b.row || a.col - b.col; });
                return norm;
            }

            function getShapeSig(norm) {
                return norm.map(function(c) { return c.row + ":" + c.col; }).join("|");
            }

            function rotateShape90(cells) {
                return cells.map(function(c) {
                    return { row: c.col, col: -c.row, orig: c.orig, digit: c.digit };
                });
            }

            function getShapeRotations(comp) {
                var rots = [];
                var curr = comp.map(function(c) { return { row: c.row, col: c.col, orig: c.orig, digit: c.digit }; });
                for (var i = 0; i < 4; i++) {
                    var norm = normalizeShape(curr);
                    var sig = getShapeSig(norm);
                    if (!rots.some(function(r) { return r.sig === sig; })) {
                        rots.push({ sig: sig, norm: norm });
                    }
                    curr = rotateShape90(curr);
                }
                return rots;
            }

            var inNorms = shapeInside.map(function(s) {
                var norm = normalizeShape(s.map(function(c) { return { row: c.row, col: c.col, orig: c }; }));
                return { sig: getShapeSig(norm), norm: norm };
            });
            var outRots = outShapesWithDigits.map(getShapeRotations);

            var matchingsSet = {};
            var validMatchings = [];

            function searchMatchings(outIndex, usedInside, currentReqs) {
                if (outIndex === outShapesWithDigits.length) {
                    var reqSig = currentReqs.map(function(req) { return req.row + ":" + req.col + "=" + req.digit; })
                        .sort().join("|");
                    if (!matchingsSet[reqSig]) {
                        matchingsSet[reqSig] = true;
                        validMatchings.push(currentReqs);
                    }
                    return;
                }

                var rots = outRots[outIndex];
                for (var i = 0; i < inNorms.length; i++) {
                    if (usedInside[i]) continue;
                    var inNorm = inNorms[i];

                    for (var r = 0; r < rots.length; r++) {
                        var outRot = rots[r];
                        if (outRot.sig === inNorm.sig) {
                            var reqs = [];
                            for (var c = 0; c < outRot.norm.length; c++) {
                                var outCell = outRot.norm[c];
                                if (outCell.digit !== null) {
                                    var inCell = inNorm.norm[c];
                                    reqs.push({ row: inCell.orig.row, col: inCell.orig.col, digit: outCell.digit });
                                }
                            }

                            usedInside[i] = true;
                            searchMatchings(outIndex + 1, usedInside, currentReqs.concat(reqs));
                            usedInside[i] = false;
                        }
                    }
                }
            }

            if (outShapesWithDigits.length > 0) {
                var used = [];
                for (var i = 0; i < inNorms.length; i++) used.push(false);
                searchMatchings(0, used, []);
                constraints.shapeMatchings = [validMatchings];
                            }
            constraints.supported.push("shape");
        }

        if (variantEnabled(puzzle, "palindrome")) {
            var adjacency = {};
            Object.keys(puzzle.pu_q.line || {}).forEach(function(edge) {
                if (puzzle.pu_q.line[edge] !== 5) {
                    return;
                }
                var endpoints = edge.split(",").map(Number);
                if (endpoints.length !== 2 || !activeCells[endpoints[0]] || !activeCells[endpoints[1]]) {
                    return;
                }
                (adjacency[endpoints[0]] || (adjacency[endpoints[0]] = [])).push(endpoints[1]);
                (adjacency[endpoints[1]] || (adjacency[endpoints[1]] = [])).push(endpoints[0]);
            });
            var visited = {};
            Object.keys(adjacency).forEach(function(nodeText) {
                if (visited[nodeText]) {
                    return;
                }
                var component = [];
                var queue = [Number(nodeText)];
                visited[nodeText] = true;
                while (queue.length) {
                    var node = queue.shift();
                    component.push(node);
                    (adjacency[node] || []).forEach(function(next) {
                        if (!visited[next]) {
                            visited[next] = true;
                            queue.push(next);
                        }
                    });
                }
                var start = component.find(function(key) { return adjacency[key].length === 1; }) || component[0];
                var ordered = [];
                var previous = null;
                var current = start;
                while (current !== undefined && ordered.length < component.length) {
                    ordered.push(current);
                    var next = (adjacency[current] || []).find(function(key) {
                        return key !== previous && ordered.indexOf(key) === -1;
                    });
                    previous = current;
                    current = next;
                }
                var path = ordered.map(function(key) { return keyToCell(puzzle, key); }).filter(Boolean);
                if (path.length > 1) {
                    constraints.palindromes.push(path);
                }
            });
        }
        if (constraints.palindromes.length) {
            constraints.supported.push("palindrome");
        }
        if (variantEnabled(puzzle, "almostpalindrome")) {
            // Reuse line-5 detection but push into almostPalindromes array
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                if (path.length > 1) constraints.almostPalindromes.push(path);
            });
            constraints.supported.push("almostpalindrome");
        }
        if (variantEnabled(puzzle, "disguisedpalindromes")) {
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                if (path.length > 1) constraints.disguisedPalindromes.push(path);
            });
            if (constraints.disguisedPalindromes.length) {
                constraints.supported.push("disguisedpalindromes");
            }
        }
        if (variantEnabled(puzzle, "tinder")) {
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                if (path.length > 1) constraints.catalogLines.push({ path: path, relation: "tinder" });
            });
            constraints.supported.push("tinder");
        }
        if (variantEnabled(puzzle, "upanddown")) {
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                if (path.length > 1) constraints.catalogLines.push({ path: path, relation: "upanddown" });
            });
            constraints.supported.push("upanddown");
        }
        if (variantEnabled(puzzle, "topheavy")) {
            constraints.supported.push("topheavy");
            constraints.topheavy = [{}];
        }

        if (variantEnabled(puzzle, "upperrightheavykiller")) {
            constraints.supported.push("upperrightheavykiller");
            var urCages = {};
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var cellKeyText = cellKey(puzzle, r, c);
                    var entry = puzzle.pu_q.number && puzzle.pu_q.number[cellKeyText];
                    if (entry && entry[0] !== undefined) {
                        var val = parseInt(entry[0], 10);
                        if (!isNaN(val)) {
                            urCages[r + "," + c] = val;
                        }
                    }
                }
            }
            constraints.upperrightheavykiller = [urCages];
        }
        ["renban", "paritylines", "sequence", "consecutiveonline"].forEach(function(variant) {
            if (!variantEnabled(puzzle, variant)) return;
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                constraints.catalogLines.push({ path: path, relation: variant });
            });
            constraints.supported.push(variant);
        });
        ["meandering diagonals"].forEach(function(variant) {
            if (!variantEnabled(puzzle, variant)) return;
            connectedLinePaths(puzzle, 2).forEach(function(path) {
                if (path.length > 1) constraints.catalogLines.push({ path: path, relation: variant });
            });
            constraints.supported.push(variant);
        });
        ["alternatingstripes", "between", "odd even bridge"].forEach(function(variant) {
            if (!variantEnabled(puzzle, variant)) return;
            [1, 2].forEach(function(style) {
                connectedLinePaths(puzzle, style).forEach(function(path) {
                    if (path.length > 1) constraints.catalogLines.push({ path: path, relation: variant === "odd even bridge" ? "oddevenbridge" : variant });
                });
            });
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                if (path.length > 1 && variant === "odd even bridge") constraints.catalogLines.push({ path: path, relation: "oddevenbridge" });
            });
            constraints.supported.push(variant);
        });
        if (variantEnabled(puzzle, "zones")) constraints.supported.push("zones");
        if (variantEnabled(puzzle, "somewhere")) constraints.supported.push("somewhere");
        if (variantEnabled(puzzle, "disguisedpalindromes") || variantEnabled(puzzle, "disguisedpalindrome")) {
            connectedLinePaths(puzzle, 5).forEach(function(path) {
                if (path.length > 1) constraints.disguisedPalindromes.push(path);
            });
            constraints.supported.push("disguisedpalindromes");
        }
        ["equal sum line", "german whispers", "factor lines", "24-trio", "24trio"].forEach(function(variant) {
            if (!variantEnabled(puzzle, variant)) return;
            [1, 2, 3, 4, 5, 80].forEach(function(st) {
                connectedLinePaths(puzzle, st).forEach(function(path) {
                    if (path.length > 1 && !(canonicalVariantName(variant) === "24trio" && path.length !== 3)) {
                        var relationMap = {
                            "equal sum line": "equalsumline",
                            "german whispers": "germanwhispers",
                            "factor lines": "factorlines",
                            "24-trio": "24trio",
                            "24trio": "24trio"
                        };
                        constraints.catalogLines.push({ path: path, relation: relationMap[variant] });
                    }
                });
            });
            var mappedSupported = {
                "equal sum line": "equalsumline",
                "german whispers": "germanwhispers",
                "factor lines": "factorlines",
                "24-trio": "24trio",
                "24trio": "24trio"
            };
            constraints.supported.push(mappedSupported[variant]);
        });
        if (variantEnabled(puzzle, "equal sum lines")) {
            var equalSumLinesPaths = [];
            connectedLinePaths(puzzle, 3).forEach(function(path) {
                if (path.length > 1) equalSumLinesPaths.push(path);
            });
            if (equalSumLinesPaths.length) {
                constraints.equalsumlines.push({ lines: equalSumLinesPaths });
            }
            constraints.supported.push("equalsumlines");
        }
        if (variantEnabled(puzzle, "emitters")) {
            var emitterCells = [];
            var symbols = puzzle.pu_q.symbol || {};
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                if (entry && entry[1] && entry[1].indexOf("circle_") === 0) {
                    var cell = keyToCell(puzzle, Number(key));
                    if (cell) {
                        emitterCells.push(cell);
                    }
                }
            });

            var thermoEdges = {};
            var source = puzzle.pu_q.nobulbthermo || [];
            for (var i = 0; i < source.length; i++) {
                var cells = pathToCells(puzzle, source[i]);
                for (var j = 0; j < cells.length - 1; j++) {
                    var c1 = cells[j], c2 = cells[j+1];
                    var k1 = c1.row + "," + c1.col;
                    var k2 = c2.row + "," + c2.col;
                    thermoEdges[k1 + "-" + k2] = true;
                    thermoEdges[k2 + "-" + k1] = true;
                }
            }

            var dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            emitterCells.forEach(function(E) {
                var emitterData = { cell: E, lines: [] };
                dirs.forEach(function(d) {
                    var line = [];
                    var cr = E.row, cc = E.col;
                    while (true) {
                        var nr = cr + d[0], nc = cc + d[1];
                        var k1 = cr + "," + cc;
                        var k2 = nr + "," + nc;
                        if (thermoEdges[k1 + "-" + k2]) {
                            line.push({ row: nr, col: nc });
                            cr = nr;
                            cc = nc;
                        } else {
                            break;
                        }
                    }
                    var nextCell = { row: cr + d[0], col: cc + d[1] };
                    if (nextCell.row < 0 || nextCell.row >= SIZE || nextCell.col < 0 || nextCell.col >= SIZE) {
                        nextCell = null;
                    }
                    emitterData.lines.push({ cells: line, nextCell: nextCell });
                });
                constraints.emitters.push(emitterData);
            });
            constraints.supported.push("emitters");
        }

        var symbols = puzzle.pu_q.symbol || {};

        if (variantEnabled(puzzle, "starproduct") || variantEnabled(puzzle, "sudokuwithstars")) {
            var starCells = [];
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                if (entry[1] === "star") {
                    var cell = keyToCell(puzzle, Number(key));
                    if (cell) starCells.push(cell);
                }
            });
            if (starCells.length > 0) {
                constraints.starCells = starCells;
            }
            if (variantEnabled(puzzle, "sudokuwithstars")) {
                constraints.supported.push("sudokuwithstars");
                constraints.sudokuwithstars = [true];
                if (constraints.starCells) {
                    constraints.starCellValues = constraints.starCells;
                }
            }
        }
        Object.keys(symbols).forEach(function(key) {
            var entry = symbols[key];
            if (!entry || !activeCells[key]) {
                return;
            }
            if ((entry[1] === "circle_L" || entry[1] === "square_L")) {
                var cell = keyToCell(puzzle, Number(key));
                if (cell) {
                    if (variantEnabled(puzzle, "odd even")) {
                        constraints.oddEven.push({
                            cell: cell,
                            parity: entry[1] === "circle_L" ? "odd" : "even"
                        });
                    }
                    if (variantEnabled(puzzle, "odd even count")) {
                        constraints.oddEvenCounts.push({
                            cell: cell,
                            parity: entry[1] === "circle_L" ? "odd" : "even"
                        });
                    }
                }
            }
        });
        if (constraints.oddEven.length) {
            constraints.supported.push("odd even");
        }
        if (constraints.oddEvenCounts.length) {
            constraints.supported.push("odd even count");
        }
        if (variantEnabled(puzzle, "battenburg")) {
            var markedBattenburg = {};
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || entry[1] !== "sudokuetc" || entry[0] !== 1 || !point) {
                    return;
                }
                var cells = (point.neighbor || []).filter(function(neighbor) {
                    return activeCells[neighbor];
                }).map(function(neighbor) {
                    return keyToCell(puzzle, neighbor);
                }).filter(Boolean);
                if (cells.length === 4) {
                    var markKey = cells.map(function(cell) { return cell.row + ":" + cell.col; }).sort().join("|");
                    markedBattenburg[markKey] = true;
                    constraints.battenburg.push({ cells: cells, kind: "marked" });
                }
            });
            if (puzzle.battenburgNegativeConstraint === true) {
                for (var battenburgRow = 0; battenburgRow < SIZE - 1; battenburgRow++) {
                    for (var battenburgCol = 0; battenburgCol < SIZE - 1; battenburgCol++) {
                        var square = [
                            { row: battenburgRow, col: battenburgCol },
                            { row: battenburgRow, col: battenburgCol + 1 },
                            { row: battenburgRow + 1, col: battenburgCol },
                            { row: battenburgRow + 1, col: battenburgCol + 1 }
                        ];
                        var squareKey = square.map(function(cell) { return cell.row + ":" + cell.col; }).sort().join("|");
                        if (!markedBattenburg[squareKey]) {
                            constraints.battenburg.push({ cells: square, kind: "none" });
                        }
                    }
                }
            }
            constraints.supported.push("battenburg");
        }
        var circleOwnedByAnotherVariant = ["consecutive", "oneortwodifferencepairs", "fadedkropki", "clockfaces"]
            .some(function(name) { return variantEnabled(puzzle, name); });
        // Keep legacy mark-only puzzles discoverable, but do not reinterpret a
        // circle that belongs to the explicitly selected clue type as Kropki.
        if (variantEnabled(puzzle, "kropki") || !circleOwnedByAnotherVariant) {
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || entry[1] !== "circle_SS" || (entry[0] !== 1 && entry[0] !== 2) || !point) {
                    return;
                }
                var cells = (point.neighbor || []).filter(function(neighbor) {
                    return activeCells[neighbor];
                }).map(function(neighbor) {
                    return keyToCell(puzzle, neighbor);
                }).filter(Boolean);
                if (cells.length === 2) {
                    constraints.kropki.push({
                        cells: cells,
                        kind: entry[0] === 2 ? "black" : "white"
                    });
                }
            });
        }
        if (constraints.kropki.length) {
            constraints.supported.push("kropki");
        }

        // The optional negative Kropki rule makes every undotted orthogonal pair
        // neither consecutive nor double. Explicit dots apply independently.
        if (variantEnabled(puzzle, "kropki") && puzzle.kropkiNegativeConstraint === true) {
            var dottedEdges = {};
            constraints.kropki.forEach(function(dot) {
                var first = dot.cells[0].row * SIZE + dot.cells[0].col;
                var second = dot.cells[1].row * SIZE + dot.cells[1].col;
                dottedEdges[Math.min(first, second) + ":" + Math.max(first, second)] = true;
            });
            for (var row = 0; row < SIZE; row++) {
                for (var col = 0; col < SIZE; col++) {
                    [[row + 1, col], [row, col + 1]].forEach(function(neighbor) {
                        if (neighbor[0] >= SIZE || neighbor[1] >= SIZE) {
                            return;
                        }
                        var first = row * SIZE + col;
                        var second = neighbor[0] * SIZE + neighbor[1];
                        var edge = Math.min(first, second) + ":" + Math.max(first, second);
                        if (!dottedEdges[edge]) {
                            constraints.kropki.push({
                                cells: [
                                    { row: row, col: col },
                                    { row: neighbor[0], col: neighbor[1] }
                                ],
                                kind: "none"
                            });
                        }
                    });
                }
            }
        }
        if (variantEnabled(puzzle, "doublekropki")) {
            var doubleDottedEdges = {};
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || entry[1] !== "diamond_SS" || (entry[0] !== 1 && entry[0] !== 2) || !point) return;
                var cells = (point.neighbor || []).filter(function(neighbor) {
                    return activeCells[neighbor];
                }).map(function(neighbor) {
                    return keyToCell(puzzle, neighbor);
                }).filter(Boolean);
                if (cells.length === 2) {
                    constraints.doublekropki.push({
                        cells: cells,
                        kind: entry[0] === 2 ? "black" : "white"
                    });
                }
            });
            if (constraints.doublekropki.length) constraints.supported.push("doublekropki");

            if (puzzle.doublekropkiNegativeConstraint === true) {
                constraints.doublekropki.forEach(function(dot) {
                    var first = dot.cells[0].row * SIZE + dot.cells[0].col;
                    var second = dot.cells[1].row * SIZE + dot.cells[1].col;
                    doubleDottedEdges[Math.min(first, second) + ":" + Math.max(first, second)] = true;
                });
                for (var row = 0; row < SIZE; row++) {
                    for (var col = 0; col < SIZE; col++) {
                        [[row + 1, col], [row, col + 1]].forEach(function(neighbor) {
                            if (neighbor[0] >= SIZE || neighbor[1] >= SIZE) return;
                            var firstIdx = row * SIZE + col;
                            var secondIdx = neighbor[0] * SIZE + neighbor[1];
                            var edge = Math.min(firstIdx, secondIdx) + ":" + Math.max(firstIdx, secondIdx);
                            if (!doubleDottedEdges[edge]) {
                                constraints.doublekropki.push({
                                    cells: [{ row: row, col: col }, { row: neighbor[0], col: neighbor[1] }],
                                    kind: "none"
                                });
                            }
                        });
                    }
                }
            }
        }
        if (variantEnabled(puzzle, "onetouch")) {
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || !point) return;

                if (entry[1] === "circle_SS" && point.type === 0) {
                    var activeCells = {};
                    (point.neighbor || []).forEach(function(neighbor) {
                        activeCells[neighbor] = true;
                    });
                    var cells = Object.keys(activeCells).map(function(neighbor) {
                        return keyToCell(puzzle, Number(neighbor));
                    }).filter(Boolean);

                    if (cells.length === 4) {
                        constraints.oneTouch.push({ cells: cells });
                    }
                }
            });
            constraints.oneTouch = [constraints.oneTouch]; // Wrapping once for CSP
            constraints.supported.push("onetouch");
        }
        if (variantEnabled(puzzle, "paritycircles")) {
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                if (!entry || !activeCells[key]) return;
                if (entry[1] === "circle_L") {
                    var cell = keyToCell(puzzle, Number(key));
                    if (cell) {
                        constraints.parityCircles.push({ cell: cell });
                    }
                }
            });
            constraints.parityCircles = [constraints.parityCircles]; // Wrap once for CSP
            constraints.supported.push("paritycircles");
        }
        if (variantEnabled(puzzle, "onefivenine")) {
            constraints.onefivenine = [{}];
            constraints.supported.push("onefivenine");
        }
        if (variantEnabled(puzzle, "fadedkropki")) {
            var fadedDottedEdges = {};
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || entry[1] !== "circle_SS" || entry[0] !== 1 || !point) return;
                var cells = (point.neighbor || []).filter(function(neighbor) {
                    return activeCells[neighbor];
                }).map(function(neighbor) {
                    return keyToCell(puzzle, neighbor);
                }).filter(Boolean);
                if (cells.length === 2) {
                    constraints.fadedKropki.push({
                        cells: cells,
                        kind: "white"
                    });
                    cells.sort(function(first, second) { return first.row - second.row || first.col - second.col; });
                    var firstIdx = cells[0].row * SIZE + cells[0].col;
                    var secondIdx = cells[1].row * SIZE + cells[1].col;
                    fadedDottedEdges[Math.min(firstIdx, secondIdx) + ":" + Math.max(firstIdx, secondIdx)] = true;
                }
            });
            if (puzzle.kropkiNegativeConstraint === true) {
                for (var row = 0; row < SIZE; row++) {
                    for (var col = 0; col < SIZE; col++) {
                        [[row + 1, col], [row, col + 1]].forEach(function(neighbor) {
                            if (neighbor[0] >= SIZE || neighbor[1] >= SIZE) return;
                            var firstIdx = row * SIZE + col;
                            var secondIdx = neighbor[0] * SIZE + neighbor[1];
                            var edge = Math.min(firstIdx, secondIdx) + ":" + Math.max(firstIdx, secondIdx);
                            if (!fadedDottedEdges[edge]) {
                                constraints.fadedKropki.push({
                                    cells: [
                                        { row: row, col: col },
                                        { row: neighbor[0], col: neighbor[1] }
                                    ],
                                    kind: "none"
                                });
                            }
                        });
                    }
                }
            }
            if (constraints.fadedKropki.length || puzzle.kropkiNegativeConstraint === true) {
                constraints.supported.push("fadedkropki");
            }
        }

        if (variantEnabled(puzzle, "braille")) {
            Object.keys(symbols).forEach(function(key) {
                var entry = symbols[key];
                var point = puzzle.point && puzzle.point[key];
                if (!entry || entry[1] !== "braille" || !point) return;
                var cell = keyToCell(puzzle, Number(key));
                if (!cell) return;
                var dots = [];
                if (Array.isArray(entry[0])) {
                    for (var i = 0; i < 4; i++) {
                        if (entry[0][i] === 1) dots.push(i);
                    }
                } else if (typeof entry[0] === "number") {
                    if (entry[0] >= 1 && entry[0] <= 4) dots.push(entry[0] - 1);
                }
                if (dots.length) {
                    constraints.braille.push({ cell: cell, dots: dots });
                }
            });
            constraints.supported.push("braille");
        }

        var numbers = puzzle.pu_q.number || {};
        Object.keys(numbers).forEach(function(key) {
            var entry = numbers[key];
            var point = puzzle.point && puzzle.point[key];
            var kind = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
            var isXV = false; // XV is interpreted by its Variant Descriptor.
            var isXIVI = variantEnabled(puzzle, "xivi") && (kind === "VI" || kind === "XI");
            if ((!isXV && !isXIVI) || !point) {
                return;
            }
            var cells = (point.neighbor || []).filter(function(neighbor) {
                return activeCells[neighbor];
            }).map(function(neighbor) {
                return keyToCell(puzzle, neighbor);
            }).filter(Boolean);
            if (cells.length === 2) {
                constraints.xv.push({ cells: cells, kind: kind, family: isXIVI ? "xivi" : "xv" });
            }
        });

        if (variantEnabled(puzzle, "xivi")) {
            var markedXIVIEdges = {};
            constraints.xv.forEach(function(clue) {
                if (clue.family !== "xivi") return;
                var first = clue.cells[0].row * SIZE + clue.cells[0].col;
                var second = clue.cells[1].row * SIZE + clue.cells[1].col;
                markedXIVIEdges[Math.min(first, second) + ":" + Math.max(first, second)] = true;
            });
            for (var xiviRow = 0; xiviRow < SIZE; xiviRow++) {
                for (var xiviCol = 0; xiviCol < SIZE; xiviCol++) {
                    [[xiviRow + 1, xiviCol], [xiviRow, xiviCol + 1]].forEach(function(neighbor) {
                        if (neighbor[0] >= SIZE || neighbor[1] >= SIZE) return;
                        var first = xiviRow * SIZE + xiviCol, second = neighbor[0] * SIZE + neighbor[1];
                        if (!markedXIVIEdges[Math.min(first, second) + ":" + Math.max(first, second)]) {
                            constraints.xv.push({ cells: [{ row: xiviRow, col: xiviCol },
                                { row: neighbor[0], col: neighbor[1] }], kind: "none", family: "xivi" });
                        }
                    });
                }
            }
        }
        if (variantEnabled(puzzle, "xv")) constraints.supported.push("xv");
        if (variantEnabled(puzzle, "xivi")) constraints.supported.push("xivi");

        if (variantEnabled(puzzle, "lc")) {
            var activeLCEdges = {};
            var edgeClueKeys = Object.keys(puzzle.pu_q.number || {});

            function getLC4Cells(r1, c1, r2, c2) {
                if (r1 === r2) {
                    var minC = Math.min(c1, c2);
                    if (minC - 1 >= 0 && minC + 2 < SIZE) {
                        return [
                            { row: r1, col: minC - 1 },
                            { row: r1, col: minC },
                            { row: r1, col: minC + 1 },
                            { row: r1, col: minC + 2 }
                        ];
                    }
                } else if (c1 === c2) {
                    var minR = Math.min(r1, r2);
                    if (minR - 1 >= 0 && minR + 2 < SIZE) {
                        return [
                            { row: minR - 1, col: c1 },
                            { row: minR, col: c1 },
                            { row: minR + 1, col: c1 },
                            { row: minR + 2, col: c1 }
                        ];
                    }
                }
                return null;
            }

            for (var i = 0; i < edgeClueKeys.length; i++) {
                var edgeNum = parseInt(edgeClueKeys[i], 10);
                var entry = puzzle.pu_q.number[edgeNum];
                if (!entry || entry[0] === undefined || entry[0] === "") continue;
                var edgeCells = puzzle.point[edgeNum].neighbor.filter(function(cell) { return activeCells[cell]; });
                if (edgeCells.length === 2 && entry[2] === "5") {
                    var kind = String(entry[0]).trim().toUpperCase();
                    if (kind === "L" || kind === "C") {
                        var r1 = puzzle.point[edgeCells[0]].y - puzzle.ny0;
                        var c1 = puzzle.point[edgeCells[0]].x - puzzle.nx0;
                        var r2 = puzzle.point[edgeCells[1]].y - puzzle.ny0;
                        var c2 = puzzle.point[edgeCells[1]].x - puzzle.nx0;
                        var cells = getLC4Cells(r1, c1, r2, c2);
                        if (cells) {
                            activeLCEdges[edgeNum] = true;
                            constraints.lc.push({ cells: cells, kind: kind });
                        }
                    }
                }
            }
            if (pu && pu.lcNegativeConstraint === true) {
                var markedLCEdges = {};
                for (var r = 0; r < SIZE; r++) {
                    for (var c = 0; c < SIZE; c++) {
                        [[r + 1, c], [r, c + 1]].forEach(function(neighbor) {
                            if (neighbor[0] < SIZE && neighbor[1] < SIZE) {
                                var first = r * SIZE + c, second = neighbor[0] * SIZE + neighbor[1];
                                markedLCEdges[Math.min(first, second) + ":" + Math.max(first, second)] = false;
                            }
                        });
                    }
                }
                constraints.lc.forEach(function(clue) {
                    var mid1 = clue.cells[1], mid2 = clue.cells[2];
                    var first = mid1.row * SIZE + mid1.col;
                    var second = mid2.row * SIZE + mid2.col;
                    markedLCEdges[Math.min(first, second) + ":" + Math.max(first, second)] = true;
                });
                Object.keys(markedLCEdges).forEach(function(edge) {
                    if (!markedLCEdges[edge]) {
                        var parts = edge.split(":");
                        var first = parseInt(parts[0], 10), second = parseInt(parts[1], 10);
                        var cells = getLC4Cells(Math.floor(first / SIZE), first % SIZE, Math.floor(second / SIZE), second % SIZE);
                        if (cells) {
                            constraints.lc.push({ cells: cells, kind: "none" });
                        }
                    }
                });
            }
            constraints.supported.push("lc");
        }
        if (variantEnabled(puzzle, "mathdoku")) {
            var mathdokuEdges = [];
            function catalogEdgeCellsMathdoku(key) {
                var point = puzzle.point && puzzle.point[key];
                if (!point || !Array.isArray(point.neighbor)) return [];
                return point.neighbor.filter(function(neighbor) { return activeCells[neighbor]; })
                    .map(function(neighbor) { return keyToCell(puzzle, neighbor); }).filter(Boolean);
            }
            Object.keys(numbers).forEach(function(key) {
                var cells = catalogEdgeCellsMathdoku(key);
                if (cells.length === 2) {
                    var target = numbers[key] && parseInt(numbers[key][0], 10);
                    if (Number.isFinite(target)) {
                        cells.sort(function(first, second) { return first.row - second.row || first.col - second.col; });
                        mathdokuEdges.push({ cells: cells, target: target });
                    }
                }
            });
            var blockDimensions = boxDimensions(SIZE);
            var blockHeight = blockDimensions.height, blockWidth = blockDimensions.width;
            var boxClues = {};
            mathdokuEdges.forEach(function(clue) {
                var row = clue.cells[0].row;
                var col = clue.cells[0].col;
                var boxRow = Math.floor(row / blockHeight);
                var boxCol = Math.floor(col / blockWidth);
                var boxIndex = boxRow * (SIZE / blockWidth) + boxCol;
                // If it's a horizontal edge, both cells have same row. If vertical, same col.
                var isInternal = false;
                if (clue.cells[0].row === clue.cells[1].row) {
                    if (Math.floor(clue.cells[1].col / blockWidth) === boxCol) isInternal = true;
                } else if (clue.cells[0].col === clue.cells[1].col) {
                    if (Math.floor(clue.cells[1].row / blockHeight) === boxRow) isInternal = true;
                }
                if (isInternal) {
                    boxClues[boxIndex] = boxClues[boxIndex] || [];
                    boxClues[boxIndex].push(clue);
                }
            });
            Object.keys(boxClues).forEach(function(boxIndex) {
                if (boxClues[boxIndex].length === 4) {
                    var cellMap = {};
                    var cells = [];
                    boxClues[boxIndex].forEach(function(clue) {
                        clue.cells.forEach(function(cell) {
                            var cellKey = cell.row + "," + cell.col;
                            if (!cellMap[cellKey]) {
                                cellMap[cellKey] = true;
                                cells.push(cell);
                            }
                        });
                    });
                    constraints.mathdoku.push({ cells: cells, clues: boxClues[boxIndex] });
                }
            });
            constraints.supported.push("mathdoku");
        }

        if (variantEnabled(puzzle, "midpoint")) {
            var allNumbers = Object.assign({}, puzzle.pu_q.number, puzzle.pu_q.numberS);
            Object.keys(allNumbers).forEach(function(key) {
                var entry = allNumbers[key];
                if (!entry) return;
                var text = String(entry[0]).trim();
                if (text === "") return;
                var point = puzzle.point && puzzle.point[key];
                if (!point || [1, 2, 3].indexOf(point.type) === -1) return;

                var nbrs = (point.neighbor || []).map(function(n) { return keyToCell(puzzle, n); }).filter(Boolean);
                if ((point.type === 1 && nbrs.length !== 4) ||
                    ([2, 3].indexOf(point.type) !== -1 && nbrs.length !== 2)) return;

                var centerRow = nbrs.reduce(function(sum, c) { return sum + c.row; }, 0) / nbrs.length;
                var centerCol = nbrs.reduce(function(sum, c) { return sum + c.col; }, 0) / nbrs.length;

                var validPairs = [];
                var activeKeys = Object.keys(activeCells);
                for (var i = 0; i < activeKeys.length; i++) {
                    var cell1 = keyToCell(puzzle, activeKeys[i]);
                    if (!cell1) continue;
                    for (var j = i + 1; j < activeKeys.length; j++) {
                        var cell2 = keyToCell(puzzle, activeKeys[j]);
                        if (!cell2) continue;
                        if (Math.abs((cell1.row + cell2.row) / 2 - centerRow) < 0.01 &&
                            Math.abs((cell1.col + cell2.col) / 2 - centerCol) < 0.01) {
                            validPairs.push([cell1, cell2]);
                        }
                    }
                }
                if (validPairs.length > 0) {
                    constraints.midpoints.push({ text: text, pairs: validPairs });
                }
            });
            constraints.supported.push("midpoint");
        }

        if (variantEnabled(puzzle, "anticonsecutive")) {
            // X-marked edges: cells on either side must NOT be consecutive
            // The X symbol is number entry "X" between two active cells
            Object.keys(numbers).forEach(function(key) {
                var entry = numbers[key];
                if (!entry || String(entry[0]).trim().toUpperCase() !== "X") return;
                var point = puzzle.point && puzzle.point[key];
                if (!point) return;
                var cells = (point.neighbor || []).filter(function(neighbor) { return activeCells[neighbor]; })
                    .map(function(neighbor) { return keyToCell(puzzle, neighbor); }).filter(Boolean);
                if (cells.length === 2) {
                    constraints.antiConsecutive.push([cells[0], cells[1]]);
                }
            });
            if (constraints.antiConsecutive.length) {
                constraints.supported.push("anticonsecutive");
            }
        }
        if (variantEnabled(puzzle, "skyscraper")) {
            var topSpace = Number(puzzle.space && puzzle.space[0] || 0);
            var leftSpace = Number(puzzle.space && puzzle.space[2] || 0);
            var startRow = 2 + topSpace;
            var startCol = 2 + leftSpace;
            function addSkyscraper(key, cells) {
                var clue = digitFromEntry(numbers[key]);
                if (clue) constraints.skyscrapers.push({ clue: clue, cells: cells });
            }
            for (var clueIndex = 0; clueIndex < SIZE; clueIndex++) {
                var column = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: clueIndex }; });
                var rowCells = Array.from({ length: SIZE }, function(_, col) { return { row: clueIndex, col: col }; });
                addSkyscraper((startCol + clueIndex) + (startRow - 1) * puzzle.nx0, column);
                addSkyscraper((startCol + clueIndex) + (startRow + SIZE) * puzzle.nx0, column.slice().reverse());
                addSkyscraper((startCol - 1) + (startRow + clueIndex) * puzzle.nx0, rowCells);
                addSkyscraper((startCol + SIZE) + (startRow + clueIndex) * puzzle.nx0, rowCells.slice().reverse());
            }
            constraints.supported.push("skyscraper");
        }
        if (variantEnabled(puzzle, "sandwich")) {
            var sandwichTop = Number(puzzle.space && puzzle.space[0] || 0);
            var sandwichLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var sandwichStartRow = 2 + sandwichTop;
            var sandwichStartCol = 2 + sandwichLeft;
            function addSandwich(key, cells) {
                var clue = outsideClueFromEntry(numbers[key]);
                if (clue !== null) constraints.sandwiches.push({ clue: clue, cells: cells });
            }
            for (var sandwichIndex = 0; sandwichIndex < SIZE; sandwichIndex++) {
                var sandwichColumn = Array.from({ length: SIZE }, function(_, row) {
                    return { row: row, col: sandwichIndex };
                });
                var sandwichRow = Array.from({ length: SIZE }, function(_, col) {
                    return { row: sandwichIndex, col: col };
                });
                addSandwich((sandwichStartCol + sandwichIndex) +
                    (sandwichStartRow - 1) * puzzle.nx0, sandwichColumn);
                addSandwich((sandwichStartCol - 1) +
                    (sandwichStartRow + sandwichIndex) * puzzle.nx0, sandwichRow);
            }
            constraints.supported.push("sandwich");
        }
        if (variantEnabled(puzzle, "uniquerectangles")) {
            constraints.uniqueRectangles.push({});
            constraints.supported.push("uniquerectangles");
        }
        if (variantEnabled(puzzle, "wildcard")) {
            var wildcardCells = [];
            Object.keys(puzzle.pu_q.number || {}).forEach(function(key) {
                if (!activeCells[key]) return;
                var entry = puzzle.pu_q.number[key];
                var text = entry && String(entry[0]).trim();
                if (text === "<" || text === ">" || text === "^" || text === "v" || text === "V") {
                    var sign = text;
                    if (text === "^") sign = "<";
                    if (text === "v" || text === "V") sign = ">";
                    var cell = keyToCell(puzzle, Number(key));
                    if (cell) wildcardCells.push({ cell: cell, sign: sign });
                }
            });
            if (wildcardCells.length) {
                constraints.wildcards.push(wildcardCells);
                constraints.supported.push("wildcard");
            }
        }
        if (variantEnabled(puzzle, "inequalitytriples")) {
            constraints.inequalityTriples.push({});
            constraints.supported.push("inequalitytriples");
        }
        if (variantEnabled(puzzle, "samesum")) {
            var sameSumGroups = [];
            Object.keys(puzzle.pu_q.surface || {}).forEach(function(key) {
                if (!puzzle.pu_q.surface[key] || !activeCells[key]) return;
                var center = keyToCell(puzzle, Number(key));
                if (!center) return;
                var neighbors = [[-1, 0], [1, 0], [0, -1], [0, 1]].map(function(offset) {
                    var row = center.row + offset[0], col = center.col + offset[1];
                    return row >= 0 && row < SIZE && col >= 0 && col < SIZE ? { row: row, col: col } : null;
                }).filter(Boolean);
                if (neighbors.length) sameSumGroups.push(neighbors);
            });
            if (sameSumGroups.length) constraints.sameSumGroups.push(sameSumGroups);
            constraints.supported.push("samesum");
        }
        if (variantEnabled(puzzle, "escape") && shadedCells.length) {
            constraints.escapeStarts.push(shadedCells);
            constraints.supported.push("escape");
        }
        if (variantEnabled(puzzle, "sumskyscrapers")) {
            var sumSkyTop = Number(puzzle.space && puzzle.space[0] || 0);
            var sumSkyLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var sumSkyStartRow = 2 + sumSkyTop;
            var sumSkyStartCol = 2 + sumSkyLeft;
            function addSumSkyscraper(key, cells) {
                var clue = outsideClueFromEntry(numbers[key]);
                if (clue !== null) constraints.sumskyscrapers.push({ clue: clue, cells: cells });
            }
            for (var sumSkyIndex = 0; sumSkyIndex < SIZE; sumSkyIndex++) {
                var sumSkyColumn = Array.from({ length: SIZE }, function(_, row) {
                    return { row: row, col: sumSkyIndex };
                });
                var sumSkyRow = Array.from({ length: SIZE }, function(_, col) {
                    return { row: sumSkyIndex, col: col };
                });
                addSumSkyscraper((sumSkyStartCol + sumSkyIndex) +
                    (sumSkyStartRow - 1) * puzzle.nx0, sumSkyColumn);
                addSumSkyscraper((sumSkyStartCol + sumSkyIndex) +
                    (sumSkyStartRow + SIZE) * puzzle.nx0, sumSkyColumn.slice().reverse());
                addSumSkyscraper((sumSkyStartCol - 1) +
                    (sumSkyStartRow + sumSkyIndex) * puzzle.nx0, sumSkyRow);
                addSumSkyscraper((sumSkyStartCol + SIZE) +
                    (sumSkyStartRow + sumSkyIndex) * puzzle.nx0, sumSkyRow.slice().reverse());
            }
            constraints.supported.push("sumskyscrapers");
        }
        if (variantEnabled(puzzle, "sumsandwich")) {
            var sumSandwichTop = Number(puzzle.space && puzzle.space[0] || 0);
            var sumSandwichLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var sumSandwichStartRow = 2 + sumSandwichTop;
            var sumSandwichStartCol = 2 + sumSandwichLeft;
            function addSumSandwich(key, cells) {
                var entry = numbers[key];
                var clue = outsideClueFromEntry(entry);
                var sequence = clue === null ? [] : String(entry[0]).split("").map(function(digit) {
                    return parseInt(digit, 10);
                });
                constraints.sumsandwiches.push({ sequence: sequence, cells: cells });
            }
            for (var sumSandwichIndex = 0; sumSandwichIndex < SIZE; sumSandwichIndex++) {
                var sumSandwichColumn = Array.from({ length: SIZE }, function(_, row) {
                    return { row: row, col: sumSandwichIndex };
                });
                var sumSandwichRow = Array.from({ length: SIZE }, function(_, col) {
                    return { row: sumSandwichIndex, col: col };
                });
                addSumSandwich((sumSandwichStartCol + sumSandwichIndex) +
                    (sumSandwichStartRow - 1) * puzzle.nx0, sumSandwichColumn);
                addSumSandwich((sumSandwichStartCol + sumSandwichIndex) +
                    (sumSandwichStartRow + SIZE) * puzzle.nx0, sumSandwichColumn.slice().reverse());
                addSumSandwich((sumSandwichStartCol - 1) +
                    (sumSandwichStartRow + sumSandwichIndex) * puzzle.nx0, sumSandwichRow);
                addSumSandwich((sumSandwichStartCol + SIZE) +
                    (sumSandwichStartRow + sumSandwichIndex) * puzzle.nx0, sumSandwichRow.slice().reverse());
            }
            constraints.supported.push("sumsandwich");
        }
        if (variantEnabled(puzzle, "positionsums") || variantEnabled(puzzle, "positionsum")) {
            var positionSumsTop = Number(puzzle.space && puzzle.space[0] || 0);
            var positionSumsLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var positionSumsStartRow = 2 + positionSumsTop;
            var positionSumsStartCol = 2 + positionSumsLeft;
            function addPositionSum(outerKey, innerKey, cells) {
                var indexedDigitsSum = outsideClueFromEntry(numbers[outerKey]);
                var firstTwoSum = outsideClueFromEntry(numbers[innerKey]);
                if (indexedDigitsSum !== null || firstTwoSum !== null) {
                    constraints.outsideRelations.push({
                        relation: "positionsums",
                        firstTwoSum: firstTwoSum,
                        indexedDigitsSum: indexedDigitsSum,
                        cells: cells
                    });
                }
            }
            for (var positionSumsIndex = 0; positionSumsIndex < SIZE; positionSumsIndex++) {
                var positionSumsColumn = Array.from({ length: SIZE }, function(_, row) {
                    return { row: row, col: positionSumsIndex };
                });
                var positionSumsRow = Array.from({ length: SIZE }, function(_, col) {
                    return { row: positionSumsIndex, col: col };
                });
                addPositionSum((positionSumsStartCol + positionSumsIndex) +
                    (positionSumsStartRow - 2) * puzzle.nx0,
                    (positionSumsStartCol + positionSumsIndex) +
                    (positionSumsStartRow - 1) * puzzle.nx0, positionSumsColumn);
                addPositionSum((positionSumsStartCol - 2) +
                    (positionSumsStartRow + positionSumsIndex) * puzzle.nx0,
                    (positionSumsStartCol - 1) +
                    (positionSumsStartRow + positionSumsIndex) * puzzle.nx0, positionSumsRow);
            }
            constraints.supported.push("positionsums");
        }
        var paritySandwichVariant = ["evensandwich", "oddsandwich"].find(function(name) {
            return variantEnabled(puzzle, name);
        });
        if (paritySandwichVariant) {
            var parityTop = Number(puzzle.space && puzzle.space[0] || 0);
            var parityLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var parityStartRow = 2 + parityTop, parityStartCol = 2 + parityLeft;
            function parityClues(keys) {
                return keys.map(function(key) { return outsideClueFromEntry(numbers[key]); })
                    .filter(function(value) { return value !== null; });
            }
            for (var parityIndex = 0; parityIndex < SIZE; parityIndex++) {
                var parityColumn = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: parityIndex }; });
                var parityRow = Array.from({ length: SIZE }, function(_, col) { return { row: parityIndex, col: col }; });
                var topParityClues = parityClues([1, 2, 3].map(function(layer) {
                        return (parityStartCol + parityIndex) + (parityStartRow - layer) * puzzle.nx0;
                    }));
                var leftParityClues = parityClues([1, 2, 3].map(function(layer) {
                        return (parityStartCol - layer) + (parityStartRow + parityIndex) * puzzle.nx0;
                    }));
                constraints.outsideRelations.push({ relation: paritySandwichVariant,
                    clues: topParityClues, cells: parityColumn });
                constraints.outsideRelations.push({ relation: paritySandwichVariant,
                    clues: leftParityClues, cells: parityRow });
            }
            constraints.supported.push(paritySandwichVariant);
        }
        var activeOutsideVariants = ["starproduct", "bust", "xsums", "numberedrooms", "sumframe", "edgedifference",
            "fullrank", "outsideparity", "parityparty", "serbianframe", "median", "descriptivepairs",
            "maximin", "minimax", "ascendingstarters", "before9", "oddevenbigsmall", "before1after9", "firstseenoddeven", "maxascending",
            "innerframesum", "missingdigit", "nextto9", "outsideconsecutive", "outsidegreaterthan", "outsidekiller", "parityskyscrapers", "sumbyx",
            "position", "sumnexttonine", "wrongoutsidesum", "doublesandwich", "xaverage", "triplesum", "japanesesums", "oddsums", "bigsmalljapanesesums"].filter(function(name) {
            return variantEnabled(puzzle, name);
        });
        if (activeOutsideVariants.length) {
            var outsideTop = Number(puzzle.space && puzzle.space[0] || 0);
            var outsideLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var outsideStartRow = 2 + outsideTop;
            var outsideStartCol = 2 + outsideLeft;
            var outsideDimensions = boxDimensions(SIZE);
            var outsideBoxHeight = outsideDimensions.height;
            var outsideBoxWidth = outsideDimensions.width;
            var fullRankEntries = [];
            activeOutsideVariants.forEach(function(variant) {
                function addOutsideRelation(key, cells, frameLength, axis, relation) {
                    var clue = (variant === "japanesesums" || variant === "oddsums" || variant === "oddevenbigsmall") ? outsideSequenceFromEntry(numbers[key]) : outsideClueFromEntry(numbers[key]);
                    if (variant === "fullrank") {
                        fullRankEntries.push({ rank: clue, cells: cells });
                        return;
                    }
                    if (clue === null) return;
                    var relationTarget = relation || variant;
                    var clueObj = {
                        relation: relationTarget,
                        value: clue,
                        cells: variant === "sumframe" ? cells.slice(0, frameLength) : cells,
                        axis: axis
                    };
                    if (relationTarget === "sumbyx") {
                        // find the first shaded cell in `cells`
                        var shadedIdx = cells.findIndex(function(c) {
                            var outsideTop = Number(puzzle.space && puzzle.space[0] || 0);
                            var outsideLeft = Number(puzzle.space && puzzle.space[2] || 0);
                            var k = (c.col + outsideLeft) + (c.row + outsideTop) * puzzle.nx0;
                            return puzzle.pu_q.surface && puzzle.pu_q.surface[k];
                        });
                        clueObj.targetX = shadedIdx >= 0 ? shadedIdx + 1 : 0;
                    }
                    constraints.outsideRelations.push(clueObj);
                }
                for (var outsideIndex = 0; outsideIndex < SIZE; outsideIndex++) {
                    var outsideColumn = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: outsideIndex }; });
                    var outsideRow = Array.from({ length: SIZE }, function(_, col) { return { row: outsideIndex, col: col }; });
                    if (variant === "before1after9") {
                        addOutsideRelation((outsideStartCol + outsideIndex) + (outsideStartRow - 1) * puzzle.nx0,
                            outsideColumn, outsideBoxHeight, "column", "after9");
                        addOutsideRelation((outsideStartCol - 1) + (outsideStartRow + outsideIndex) * puzzle.nx0,
                            outsideRow, outsideBoxWidth, "row", "after9");
                        addOutsideRelation((outsideStartCol + outsideIndex) + (outsideStartRow - 2) * puzzle.nx0,
                            outsideColumn, outsideBoxHeight, "column", "before1");
                        addOutsideRelation((outsideStartCol - 2) + (outsideStartRow + outsideIndex) * puzzle.nx0,
                            outsideRow, outsideBoxWidth, "row", "before1");
                    } else if (variant === "bigsmalljapanesesums" || variant === "japanesesums") {
                        var colClues = [];
                        var rowClues = [];
                        for (var layer = 0; layer < 5; layer++) {
                            var topClue = outsideClueFromEntry(numbers[(outsideStartCol + outsideIndex) + (outsideStartRow - 1 - layer) * puzzle.nx0]);
                            var topSeq = outsideSequenceFromEntry(numbers[(outsideStartCol + outsideIndex) + (outsideStartRow - 1 - layer) * puzzle.nx0]);
                            var actualTop = (variant === "japanesesums" || variant === "oddsums" || variant === "oddevenbigsmall") && topSeq !== null ? topSeq : topClue;

                            if (actualTop !== null) {
                                if (Array.isArray(actualTop)) colClues.unshift(...actualTop);
                                else colClues.unshift(actualTop);
                            }

                            var leftClue = outsideClueFromEntry(numbers[(outsideStartCol - 1 - layer) + (outsideStartRow + outsideIndex) * puzzle.nx0]);
                            var leftSeq = outsideSequenceFromEntry(numbers[(outsideStartCol - 1 - layer) + (outsideStartRow + outsideIndex) * puzzle.nx0]);
                            var actualLeft = (variant === "japanesesums" || variant === "oddsums" || variant === "oddevenbigsmall") && leftSeq !== null ? leftSeq : leftClue;

                            if (actualLeft !== null) {
                                if (Array.isArray(actualLeft)) rowClues.unshift(...actualLeft);
                                else rowClues.unshift(actualLeft);
                            }
                        }
                        if (colClues.length > 0) {
                            constraints.outsideRelations.push({
                                relation: variant,
                                value: colClues,
                                cells: outsideColumn,
                                axis: "column"
                            });
                        }
                        if (rowClues.length > 0) {
                            constraints.outsideRelations.push({
                                relation: variant,
                                value: rowClues,
                                cells: outsideRow,
                                axis: "row"
                            });
                        }
                    } else if (variant === "triplesum") {
                        addOutsideRelation((outsideStartCol - 1) + (outsideStartRow + outsideIndex) * puzzle.nx0,
                            outsideRow, outsideBoxWidth, "row");
                    } else {
                        addOutsideRelation((outsideStartCol + outsideIndex) + (outsideStartRow - 1) * puzzle.nx0,
                            outsideColumn, outsideBoxHeight, "column");
                        addOutsideRelation((outsideStartCol - 1) + (outsideStartRow + outsideIndex) * puzzle.nx0,
                            outsideRow, outsideBoxWidth, "row");
                        var expansionSides = outsideExpansionSides(variant);
                        if (expansionSides.indexOf("bottom") !== -1 &&
                            expansionSides.indexOf("right") !== -1) {
                            addOutsideRelation((outsideStartCol + outsideIndex) + (outsideStartRow + SIZE) * puzzle.nx0,
                                outsideColumn.slice().reverse(), outsideBoxHeight, "column");
                            addOutsideRelation((outsideStartCol + SIZE) + (outsideStartRow + outsideIndex) * puzzle.nx0,
                                outsideRow.slice().reverse(), outsideBoxWidth, "row");
                        }
                    }
                }
                constraints.supported.push(variant);
            });
            if (fullRankEntries.length) constraints.fullRankGroups.push(fullRankEntries);
        }
        if (variantEnabled(puzzle, "distances")) {
            var distancesTop = Number(puzzle.space && puzzle.space[0] || 0);
            var distancesLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var distancesStartRow = 2 + distancesTop;
            var distancesStartCol = 2 + distancesLeft;
            function addDistancesRelation(key, cells, axis) {
                var entry = numbers[key];
                if (!entry || ["1", "6"].indexOf(String(entry[2])) === -1) return;
                var str = String(entry[0]).trim();
                var match = str.match(/^([1-9])-([1-9]):([1-9][0-9]*)$/);
                if (!match) return;
                constraints.outsideRelations.push({
                    relation: "distances",
                    value: {
                        x: parseInt(match[1], 10),
                        y: parseInt(match[2], 10),
                        z: parseInt(match[3], 10)
                    },
                    cells: cells,
                    axis: axis
                });
            }
            for (var outsideIndex = 0; outsideIndex < SIZE; outsideIndex++) {
                var outsideColumn = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: outsideIndex }; });
                var outsideRow = Array.from({ length: SIZE }, function(_, col) { return { row: outsideIndex, col: col }; });
                addDistancesRelation((distancesStartCol + outsideIndex) + (distancesStartRow - 1) * puzzle.nx0,
                    outsideColumn, "column");
                addDistancesRelation((distancesStartCol - 1) + (distancesStartRow + outsideIndex) * puzzle.nx0,
                    outsideRow, "row");
            }
            constraints.supported.push("distances");
        }
        var unorderedOutsideVariant = ["outside", "outside234"].find(function(name) {
            return variantEnabled(puzzle, name);
        });
        if (unorderedOutsideVariant) {
            var unorderedTop = Number(puzzle.space && puzzle.space[0] || 0);
            var unorderedLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var unorderedStartRow = 2 + unorderedTop;
            var unorderedStartCol = 2 + unorderedLeft;
            var unorderedDimensions = boxDimensions(SIZE);
            var unorderedBoxHeight = unorderedDimensions.height;
            var unorderedBoxWidth = unorderedDimensions.width;
            function unorderedClues(keys) {
                return keys.map(function(key) { return outsideClueFromEntry(numbers[key]); })
                    .filter(function(value) { return value !== null; });
            }
            function addUnorderedOutside(keys, cells, frameLength) {
                var clues = unorderedClues(keys);
                if (!clues.length) return;
                constraints.outsideRelations.push({ relation: unorderedOutsideVariant, clues: clues,
                    cells: unorderedOutsideVariant === "outside234" ? cells.slice(1, 4) : cells.slice(0, frameLength) });
            }
            for (var unorderedIndex = 0; unorderedIndex < SIZE; unorderedIndex++) {
                var unorderedColumn = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: unorderedIndex }; });
                var unorderedRow = Array.from({ length: SIZE }, function(_, col) { return { row: unorderedIndex, col: col }; });
                addUnorderedOutside([1, 2, 3].map(function(layer) {
                    return (unorderedStartCol + unorderedIndex) + (unorderedStartRow - layer) * puzzle.nx0;
                }), unorderedColumn, unorderedBoxHeight);
                addUnorderedOutside([0, 1, 2].map(function(layer) {
                    return (unorderedStartCol + unorderedIndex) + (unorderedStartRow + SIZE + layer) * puzzle.nx0;
                }), unorderedColumn.slice().reverse(), unorderedBoxHeight);
                addUnorderedOutside([1, 2, 3].map(function(layer) {
                    return (unorderedStartCol - layer) + (unorderedStartRow + unorderedIndex) * puzzle.nx0;
                }), unorderedRow, unorderedBoxWidth);
                addUnorderedOutside([0, 1, 2].map(function(layer) {
                    return (unorderedStartCol + SIZE + layer) + (unorderedStartRow + unorderedIndex) * puzzle.nx0;
                }), unorderedRow.slice().reverse(), unorderedBoxWidth);
            }
            constraints.supported.push(unorderedOutsideVariant);
        }
        if (variantEnabled(puzzle, "mastermind")) {
            var mmTop = Number(puzzle.space && puzzle.space[0] || 0);
            var mmLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var mmStartRow = 2 + mmTop;
            var mmStartCol = 2 + mmLeft;
            var mmDimensions = boxDimensions(SIZE);
            var mmBoxHeight = mmDimensions.height;
            var mmBoxWidth = mmDimensions.width;
            function mastermindClues(keys) {
                return keys.map(function(key) {
                    var entry = puzzle.pu_q.symbol[key];
                    if (entry && entry[1] === "cross") return "cross";
                    if (entry && entry[1] === "circle_SS") return entry[0] === 2 ? "black" : "white";
                    return null;
                }).filter(function(value) { return value !== null; });
            }
            function addMastermind(keys, cells, tripletSize, axis) {
                var clues = mastermindClues(keys);
                if (!clues.length) return;
                constraints.outsideRelations.push({ relation: "mastermind", clues: clues,
                    cells: cells.slice(0, tripletSize), axis: axis });
            }
            for (var mmIndex = 0; mmIndex < SIZE; mmIndex++) {
                var mmColumn = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: mmIndex }; });
                var mmRow = Array.from({ length: SIZE }, function(_, col) { return { row: mmIndex, col: col }; });
                addMastermind([1, 2, 3].map(function(layer) {
                    return (mmStartCol + mmIndex) + (mmStartRow - layer) * puzzle.nx0;
                }), mmColumn, mmBoxHeight, "column");
                addMastermind([0, 1, 2].map(function(layer) {
                    return (mmStartCol + mmIndex) + (mmStartRow + SIZE + layer) * puzzle.nx0;
                }), mmColumn.slice().reverse(), mmBoxHeight, "column");
                addMastermind([1, 2, 3].map(function(layer) {
                    return (mmStartCol - layer) + (mmStartRow + mmIndex) * puzzle.nx0;
                }), mmRow, mmBoxWidth, "row");
                addMastermind([0, 1, 2].map(function(layer) {
                    return (mmStartCol + SIZE + layer) + (mmStartRow + mmIndex) * puzzle.nx0;
                }), mmRow.slice().reverse(), mmBoxWidth, "row");
            }
            constraints.supported.push("mastermind");
        }
        var activeDiagVariants = ["little killer", "weighted little killer", "product little killer", "productframe", "bouncing x-sums", "czech outsider", "framediagonal", "pointingdifferents"].filter(function(name) {
            return variantEnabled(puzzle, name);
        });
        if (activeDiagVariants.length) {
            var littleTop = Number(puzzle.space && puzzle.space[0] || 0);
            var littleLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var littleStartRow = 2 + littleTop, littleStartCol = 2 + littleLeft;
            var littleOffsets = [[0, -1], [-1, -1], [-1, 0], [-1, 1],
                [0, 1], [1, 1], [1, 0], [1, -1]];
            Object.keys(numbers).forEach(function(key) {
                var value = outsideClueFromEntry(numbers[key]);
                var arrow = symbols[key];
                if (value === null || !arrow || !/^arrow_/i.test(arrow[1])) return;
                var directions = Array.isArray(arrow[0]) ? arrow[0].map(function(enabled, index) {
                    return enabled === 1 ? index : -1;
                }).filter(function(index) { return index >= 0 && index < littleOffsets.length; }) :
                    [parseInt(arrow[0], 10) - 1].filter(function(direction) {
                        return direction >= 0 && direction < littleOffsets.length;
                    });
                if (!directions.length) return;
                var absoluteKey = Number(key);
                var row = Math.floor(absoluteKey / puzzle.nx0) - littleStartRow;
                var col = absoluteKey % puzzle.nx0 - littleStartCol;
                directions.forEach(function(direction) {
                    var offset = littleOffsets[direction];
                    activeDiagVariants.forEach(function(variant) {
                        var cells = [];
                        var r = row, c = col;
                        if (variant === "bouncing x-sums") {
                            var dr = offset[0], dc = offset[1];
                            for (var step = 0; step < 100 && cells.length < SIZE; step++) {
                                var nextR = r + dr;
                                var nextC = c + dc;
                                if (nextR >= 0 && nextR < SIZE && nextC >= 0 && nextC < SIZE) {
                                    r = nextR;
                                    c = nextC;
                                    cells.push({ row: r, col: c });
                                } else {
                                    if (cells.length > 0) {
                                        if (nextR < 0 || nextR >= SIZE) dr = -dr;
                                        if (nextC < 0 || nextC >= SIZE) dc = -dc;
                                        r += dr;
                                        c += dc;
                                        if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) {
                                            cells.push({ row: r, col: c });
                                        }
                                    } else {
                                        r = nextR;
                                        c = nextC;
                                    }
                                }
                            }
                        } else {
                            for (var step = 0; step < SIZE * 2 + 4; step++) {
                                r += offset[0]; c += offset[1];
                                if (r >= 0 && r < SIZE && c >= 0 && c < SIZE) cells.push({ row: r, col: c });
                                else if (cells.length) break;
                            }
                        }
                        if (cells.length) {
                            if (variant === "weighted little killer") {
                                var weights = cells.map(function(cell) {
                                    var key = (cell.row + littleStartRow) * puzzle.nx0 + (cell.col + littleStartCol);
                                    return puzzle.pu_q.surface && puzzle.pu_q.surface[key] ? 2 : 1;
                                });
                                constraints.outsideRelations.push({ relation: variant,
                                    value: value, cells: cells, weights: weights });
                            } else {
                                if (variant === "framediagonal") {
                                    cells = cells.slice(0, 3);
                                }
                                constraints.outsideRelations.push({ relation: variant,
                                    value: value, cells: cells });
                            }
                        }
                    });
                });
            });
            activeDiagVariants.forEach(function(variant) {
                constraints.supported.push(variant);
            });
        }
        if (variantEnabled(puzzle, "rossini")) {
            var rossiniTop = Number(puzzle.space && puzzle.space[0] || 0);
            var rossiniLeft = Number(puzzle.space && puzzle.space[2] || 0);
            var rossiniStartRow = 2 + rossiniTop;
            var rossiniStartCol = 2 + rossiniLeft;
            function addRossini(key, cells, inwardDirection, outwardDirection) {
                var entry = symbols[key];
                var direction = entry && ["arrow_N_B", "arrow_N_W", "arrow_B_G", "arrow_N_G"].indexOf(entry[1]) !== -1 ? parseInt(entry[0], 10) - 1 : -1;
                constraints.rossiniLines.push({ cells: cells.slice(0, 3),
                    direction: direction === inwardDirection ? "ascending" :
                        direction === outwardDirection ? "descending" : "none" });
            }
            for (var rossiniIndex = 0; rossiniIndex < SIZE; rossiniIndex++) {
                var rossiniColumn = Array.from({ length: SIZE }, function(_, row) { return { row: row, col: rossiniIndex }; });
                var rossiniRow = Array.from({ length: SIZE }, function(_, col) { return { row: rossiniIndex, col: col }; });
                addRossini((rossiniStartCol + rossiniIndex) + (rossiniStartRow - 1) * puzzle.nx0,
                    rossiniColumn, 6, 2);
                addRossini((rossiniStartCol + rossiniIndex) + (rossiniStartRow + SIZE) * puzzle.nx0,
                    rossiniColumn.slice().reverse(), 2, 6);
                addRossini((rossiniStartCol - 1) + (rossiniStartRow + rossiniIndex) * puzzle.nx0,
                    rossiniRow, 4, 0);
                addRossini((rossiniStartCol + SIZE) + (rossiniStartRow + rossiniIndex) * puzzle.nx0,
                    rossiniRow.slice().reverse(), 0, 4);
            }
            constraints.supported.push("rossini");
        }
        if (variantEnabled(puzzle, "disparity")) {
            function getCellRegion(r, c) {
                if (constraints.regionAllDifferent && constraints.regionAllDifferent.length > 0) {
                    for (var i = 0; i < constraints.regionAllDifferent.length; i++) {
                        var region = constraints.regionAllDifferent[i];
                        for (var j = 0; j < region.length; j++) {
                            if (region[j].row === r && region[j].col === c) {
                                return i;
                            }
                        }
                    }
                }
                var dimensions = boxDimensions(SIZE);
                var boxHeight = dimensions.height;
                var boxWidth = dimensions.width;
                return ((r / boxHeight) | 0) * (SIZE / boxWidth) + ((c / boxWidth) | 0);
            }
            for (var r = 0; r < SIZE; r++) {
                for (var c = 0; c < SIZE; c++) {
                    var cell1 = { row: r, col: c };
                    var reg1 = getCellRegion(r, c);
                    [ [0, 1], [1, 0] ].forEach(function(offset) {
                        var nr = r + offset[0];
                        var nc = c + offset[1];
                        if (nr < SIZE && nc < SIZE) {
                            var reg2 = getCellRegion(nr, nc);
                            if (reg1 !== reg2) {
                                constraints.disparity.push([cell1, { row: nr, col: nc }]);
                            }
                        }
                    });
                }
            }
            constraints.supported.push("disparity");
        }
        if (variantEnabled(puzzle, "different parity")) {
            constraints.supported.push("different parity");
        }
        return constraints;
    }

    function interpretationState(puzzle) {
        var legacyConstraints = readLegacyConstraints(puzzle);
        var requested = Array.isArray(puzzle && puzzle.activeSudokuVariants) ?
            puzzle.activeSudokuVariants : [puzzle && puzzle.activeSudokuVariant || "classic"];
        var migratedNames = requested.filter(function(name) {
            return SudokuVariantRegistryRuntime && SudokuVariantRegistryRuntime.resolve(name);
        });
        var descriptorPuzzle = Object.create(puzzle || null);
        descriptorPuzzle.activeSudokuVariants = ["classic"].concat(migratedNames);
        var descriptorInterpretation = SudokuVariantRegistryRuntime ?
            SudokuVariantRegistryRuntime.interpretPuzzle(descriptorPuzzle) :
            { activeVariantIds: [], instances: [], diagnostics: [] };
        var descriptorIds = descriptorInterpretation.activeVariantIds;

        var instances = descriptorInterpretation.instances.slice();
        Object.keys(legacyConstraints).forEach(function(type) {
            if (!Array.isArray(legacyConstraints[type]) || type === "supported") return;
            legacyConstraints[type].forEach(function(payload) {
                var migratedPayload = type === "dutchFlatMates" && descriptorIds.indexOf("dutchflatmates") !== -1 ||
                    type === "killers" && descriptorIds.indexOf("killer") !== -1 ||
                    type === "cellRelations" && payload && payload.relation === "multiplication" &&
                        descriptorIds.indexOf("multiplication") !== -1 ||
                    type === "outsideRelations" && payload && payload.relation === "partitionedsums" &&
                        descriptorIds.indexOf("partitionedsums") !== -1;
                if (!migratedPayload) {
                    instances.push({ type: type, version: 1, payload: payload, variantId: "legacy" });
                }
            });
        });

        var activeVariantIds = [];
        var diagnostics = descriptorInterpretation.diagnostics.slice();
        requested.forEach(function(name) {
            var id = canonicalVariantName(name);
            if (!id || id === "classic" || activeVariantIds.indexOf(id) !== -1) return;
            activeVariantIds.push(id);
            if (SudokuVariantRegistryRuntime && SudokuVariantRegistryRuntime.resolve(name)) return;
            var supported = (legacyConstraints.supported || []).some(function(value) {
                return canonicalVariantName(value) === id;
            });
            if (!supported) {
                diagnostics.push({
                    code: "unknown-or-unsupported-variant",
                    variantId: id,
                    message: "The active Sudoku variant could not be interpreted: " + name
                });
            }
        });
        activeVariantIds.sort();
        return {
            legacyConstraints: legacyConstraints,
            interpretation: {
                activeVariantIds: activeVariantIds,
                instances: instances,
                diagnostics: diagnostics
            }
        };
    }

    function interpretPuzzle(puzzle) {
        return interpretationState(puzzle).interpretation;
    }

    function readConstraints(puzzle) {
        var state = interpretationState(puzzle);
        var constraints = state.legacyConstraints;
        var migratedIds = {};
        state.interpretation.activeVariantIds.forEach(function(id) {
            var diagnostic = state.interpretation.diagnostics.some(function(value) {
                return value.variantId === id;
            });
            if (!diagnostic && SudokuVariantRegistryRuntime && SudokuVariantRegistryRuntime.resolve(id)) {
                migratedIds[id] = true;
            }
        });
        state.interpretation.instances.forEach(function(instance) {
            if (instance.variantId === "legacy") return;
            if (instance.type === "dutchFlatMates") constraints[instance.type] = [];
            if (instance.type === "killers" && instance.variantId === "killer") constraints[instance.type] = [];
            if (instance.type === "cellRelations" && instance.variantId === "multiplication") {
                constraints[instance.type] = (constraints[instance.type] || []).filter(function(payload) {
                    return payload.relation !== "multiplication";
                });
            }
            if (instance.type === "outsideRelations" && instance.variantId === "partitionedsums") {
                constraints[instance.type] = (constraints[instance.type] || []).filter(function(payload) {
                    return payload.relation !== "partitionedsums";
                });
            }
        });
        state.interpretation.instances.forEach(function(instance) {
            if (instance.variantId === "legacy") return;
            (constraints[instance.type] || (constraints[instance.type] = [])).push(instance.payload);
        });
        Object.keys(migratedIds).forEach(function(id) {
            if (!(constraints.supported || []).some(function(value) {
                return canonicalVariantName(value) === id;
            })) constraints.supported.push(id);
        });
        constraints.diagnostics = state.interpretation.diagnostics;
        return constraints;
    }


    function getCandidates(board, constraints) {
        return SudokuCSPRuntime.getCandidates(board, constraints);
    }

    function solve(board, constraints) {
        if (constraints && Array.isArray(constraints.diagnostics) && constraints.diagnostics.length) {
            return {
                solved: false,
                board: null,
                diagnostics: constraints.diagnostics,
                error: "Sudoku variants could not be interpreted."
            };
        }
        return SudokuCSPRuntime.solve(board, constraints);
    }

    function currentDigit(puzzle, key) {
        if (puzzle.mode.qa === "pu_a" && digitFromEntry(puzzle.pu_q.number[key])) {
            return digitFromEntry(puzzle.pu_q.number[key]);
        }
        return digitFromEntry(puzzle[puzzle.mode.qa].number[key]);
    }

    function enterSolutionSudokuMode(puzzle) {
        puzzle.mode.pu_a = puzzle.mode.pu_a || {};
        if (!Array.isArray(puzzle.mode.pu_a.sudoku)) {
            puzzle.mode.pu_a.sudoku = ["1", 9];
        }
        puzzle.mode.pu_a.edit_mode = "sudoku";
        puzzle.mode.pu_a.sudoku[0] = "1";
        puzzle.mode.pu_a.sudoku[1] = 9;
        if (puzzle.mode.qa !== "pu_a") {
            puzzle.mode_qa("pu_a");
        } else {
            puzzle.mode_set("sudoku", "new", true);
        }
    }

    function beginPenpaUndoTransaction(puzzle, label) {
        if (!puzzle || !puzzle.pu_q || !puzzle.pu_q.command_undo ||
            !puzzle.pu_q_col || !puzzle.pu_q_col.command_undo) {
            return false;
        }
        var snapshot = JSON.stringify({
            number: puzzle.pu_a && puzzle.pu_a.number || {},
            numberCol: puzzle.pu_a_col && puzzle.pu_a_col.number || {}
        });
        puzzle.pu_q.command_undo.push(["sudokuTransaction", label, snapshot, "pu_q"]);
        puzzle.pu_q_col.command_undo.push(["sudokuTransaction", label, null, "pu_q_col"]);
        if (puzzle.pu_q.command_redo && puzzle.pu_q.command_redo.__a) {
            puzzle.pu_q.command_redo.__a.length = 0;
        }
        if (puzzle.pu_q_col.command_redo && puzzle.pu_q_col.command_redo.__a) {
            puzzle.pu_q_col.command_redo.__a.length = 0;
        }
        return true;
    }

    function applySolution(puzzle, solvedBoard) {
        var tightFitMapping = getTightFitMapping(puzzle);
        SIZE = solvedBoard && solvedBoard.length || (tightFitMapping.isTightFit ? tightFitMapping.abstractSize : puzzleSize(puzzle)) || SIZE;
        var isZeroEight = ["0to8", "08arrow", "08skyscrapers"].some(function(v) { return variantEnabled(puzzle, v); });
        var isSudokuWithStars = variantEnabled(puzzle, "sudokuwithstars");
        var changes = [];
        var changesS = [];
        var oldQa = puzzle.mode.qa;
        puzzle.mode.qa = "pu_a";
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                var aKey = row + "," + col;
                var visualMap = tightFitMapping.isTightFit ? tightFitMapping.abstractToVisual[aKey] : null;

                var digit = solvedBoard[row][col];
                var displayDigit = digit;
                if (isSudokuWithStars && (digit === 8 || digit === 9)) {
                    displayDigit = "★";
                } else if (isZeroEight && digit) {
                    displayDigit = digit - 1;
                }

                if (digit) {
                    if (tightFitMapping.isTightFit && visualMap && !visualMap.split && visualMap.half === "none") {
                        var key = cellKey(puzzle, visualMap.vRow, visualMap.vCol);
                        if (puzzle.pu_q && puzzle.pu_q.number && puzzle.pu_q.number[key]) continue;
                        var entry = puzzle.pu_a.number[key];
                        var currentStr = entry && String(entry[0]).trim();
                        if (currentStr !== displayDigit.toString()) {
                            changes.push({ key: key, value: [displayDigit.toString(), 9, "1"] });
                        }
                    } else if (tightFitMapping.isTightFit && visualMap && visualMap.split) {
                        var vKey = cellKey(puzzle, visualMap.vRow, visualMap.vCol);
                        var topCorner = visualMap.split === "slash" ? 0 : 1;
                        var bottomCorner = visualMap.split === "slash" ? 3 : 2;
                        var corner = visualMap.half === "top" ? topCorner : bottomCorner;
                        var cornerKey = 4 * vKey + corner;
                        if (puzzle.pu_q && puzzle.pu_q.numberS && puzzle.pu_q.numberS[cornerKey]) continue;
                        var entryS = puzzle.pu_a.numberS && puzzle.pu_a.numberS[cornerKey];
                        var currentStrS = entryS && String(entryS[0]).trim();
                        if (currentStrS !== displayDigit.toString()) {
                            changesS.push({ key: cornerKey, value: [displayDigit.toString(), 2] });
                        }
                    } else if (!tightFitMapping.isTightFit) {
                        var key = cellKey(puzzle, row, col);
                        if (puzzle.pu_q && puzzle.pu_q.number && puzzle.pu_q.number[key]) {
                            continue;
                        }
                        var entry = puzzle.pu_a.number[key];
                        var currentStr = entry && String(entry[0]).trim();
                        if (currentStr !== displayDigit.toString()) {
                            changes.push({ key: key, value: [displayDigit.toString(), 9, "1"] });
                        }
                    }
                }
            }
        }
        puzzle.mode.qa = oldQa;
        if (!changes.length && !changesS.length) {
            enterSolutionSudokuMode(puzzle);
            puzzle.redraw();
            return 0;
        }
        beginPenpaUndoTransaction(puzzle, "Solve");
        enterSolutionSudokuMode(puzzle);
        for (var i = 0; i < changes.length; i++) {
            puzzle.pu_a.number[changes[i].key] = changes[i].value;
        }
        if (changesS.length) {
            puzzle.pu_a.numberS = puzzle.pu_a.numberS || {};
            for (var j = 0; j < changesS.length; j++) {
                puzzle.pu_a.numberS[changesS[j].key] = changesS[j].value;
            }
        }
        puzzle.redraw();
        return changes.length;
    }

    function commitSolveOnce(puzzle, solvedBoard) {
        var changed = applySolution(puzzle, solvedBoard);
        if (puzzle.mode.qa !== "pu_a") {
            puzzle.mode_qa("pu_a");
        }
        return changed;
    }

    function checkCompletion(puzzle) {
        var incomplete = { handled: true, complete: false, conflict: null };
        if (!puzzle || !isClassicSudoku(puzzle) || !SudokuCSPRuntime) {
            return { handled: false, complete: false, conflict: null };
        }
        var constraints = readConstraints(puzzle);
        var active = Array.isArray(puzzle.activeSudokuVariants) ?
            puzzle.activeSudokuVariants : [puzzle.activeSudokuVariant || "classic"];
        var supported = (constraints.supported || []).map(canonicalVariantName);
        var unsupported = active.some(function(name) {
            var normalized = canonicalVariantName(name);
            return normalized !== "classic" && supported.indexOf(normalized) === -1;
        });
        if (unsupported) {
            return { handled: false, complete: false, conflict: null };
        }

        var board = readBoard(puzzle, true);
        if (board.some(function(row) {
            return row.some(function(digit) { return !digit; });
        })) {
            return incomplete;
        }
        var result = SudokuCSPRuntime.solve(board, constraints);
        return {
            handled: true,
            complete: !!(result && result.solved),
            conflict: result && result.solved ? null : (result && result.conflict || null)
        };
    }

    function clearAutoSolution(puzzle) {
        if (!puzzle || !puzzle.pu_a || !puzzle.pu_a.number) {
            return 0;
        }
        var keys = Object.keys(puzzle.pu_a.number).filter(function(key) {
            var entry = puzzle.pu_a.number[key];
            return entry && entry[1] === 9 && entry[2] === "1";
        });
        if (!keys.length) {
            return 0;
        }
        beginPenpaUndoTransaction(puzzle, "Clear Mark");
        enterSolutionSudokuMode(puzzle);
        for (var i = 0; i < keys.length; i++) {
            delete puzzle.pu_a.number[keys[i]];
        }
        puzzle.redraw();
        return keys.length;
    }

    function drawAutoCandidates(puzzle) {
        if (candidateCache.conflict && Array.isArray(candidateCache.conflict.cells)) {
            puzzle.ctx.save();
            puzzle.ctx.fillStyle = "rgba(220, 38, 38, 0.24)";
            puzzle.ctx.strokeStyle = "rgba(185, 28, 28, 0.95)";
            puzzle.ctx.lineWidth = Math.max(2, puzzle.size * 0.055);
            candidateCache.conflict.cells.forEach(function(cell) {
                var point = puzzle.point[cellKey(puzzle, cell.row, cell.col)];
                if (!point) return;
                var inset = puzzle.size * 0.08;
                var side = puzzle.size - inset * 2;
                puzzle.ctx.fillRect(point.x - puzzle.size / 2 + inset,
                    point.y - puzzle.size / 2 + inset, side, side);
                puzzle.ctx.strokeRect(point.x - puzzle.size / 2 + inset,
                    point.y - puzzle.size / 2 + inset, side, side);
            });
            puzzle.ctx.restore();
        }
        if (!window.SudokuTools || !window.SudokuTools.autoEnabled) {
            return;
        }
        if (!isClassicSudoku(puzzle)) {
            var incompatible = solverLogElements();
            setSolverStatus(incompatible, "Unsupported grid");
            if (incompatible.output && incompatible.output.textContent.indexOf("requires a 9x9") === -1) {
                incompatible.output.textContent += "Auto Solver requires a 6x6, 7x7, 8x8, or 9x9 Sudoku or square grid.\n";
            }
            return;
        }
        var board = readBoard(puzzle, true);
        var constraints = readConstraints(puzzle);
        var signature = JSON.stringify([board, constraints]);
        if (candidateCache.signature !== signature) {
            return;
        }
        var result = candidateCache.result;
        if (!result.valid || !result.satisfiable) {
            return;
        }
        set_font_style(puzzle.ctx, 0.3 * puzzle.size.toString(10), AUTO_MARK_FONT_STYLE);
        for (var row = 0; row < SIZE; row++) {
            for (var col = 0; col < SIZE; col++) {
                if (board[row][col]) {
                    continue;
                }
                var key = cellKey(puzzle, row, col);
                var point = puzzle.point[key];
                var values = result.candidates[row][col];
                if (values.length === 1) {
                    set_font_style(puzzle.ctx, 0.7 * puzzle.size.toString(10), AUTO_MARK_FONT_STYLE);
                    // Match Penpa's normal Sudoku baseline exactly.
                    puzzle.ctx.text(values[0].toString(), point.x, point.y + (0.06 * puzzle.size));
                    set_font_style(puzzle.ctx, 0.3 * puzzle.size.toString(10), AUTO_MARK_FONT_STYLE);
                    continue;
                }
                for (var i = 0; i < values.length; i++) {
                    var digit = values[i];
                    var index = digit - 1;
                    puzzle.ctx.text(
                        digit.toString(),
                        point.x + ((index % 3 - 1) * 0.28) * puzzle.size,
                        point.y + ((((index / 3) | 0) - 1) * 0.28 + 0.02) * puzzle.size
                    );
                }
            }
        }
    }

    function scheduleAutoAnalysis(puzzle) {
        if (!window.SudokuTools || !window.SudokuTools.autoEnabled || !puzzle) {
            return;
        }
        if (analysisTimer !== null) {
            clearTimeout(analysisTimer);
        }
        analysisTimer = setTimeout(function() {
            if (puzzle.drawing) {
                analysisTimer = null;
                scheduleAutoAnalysis(puzzle);
                return;
            }
            analysisTimer = null;
            startAutoAnalysis(puzzle);
        }, 120);
    }

    function onPuzzleRedraw(puzzle) {
        if (window.SudokuTools && window.SudokuTools.autoEnabled) scheduleAutoAnalysis(puzzle);
        if (window.SudokuTools && window.SudokuTools.solveOnceAutoEnabled &&
            window.SudokuTools.scheduleSolveOnceCheck) {
            window.SudokuTools.scheduleSolveOnceCheck(puzzle);
        }
    }

    function startAutoAnalysis(puzzle) {
        if (!isClassicSudoku(puzzle)) {
            drawAutoCandidates(puzzle);
            return false;
        }
        var board = readBoard(puzzle, true);
        var constraints = readConstraints(puzzle);
        var activeVariants = Array.isArray(puzzle.activeSudokuVariants) ?
            puzzle.activeSudokuVariants : [puzzle.activeSudokuVariant || "classic"];
        var unsupported = activeVariants.filter(function(variant) {
            return canonicalVariantName(variant) !== "classic" && !constraints.supported.some(function(supported) {
                return canonicalVariantName(supported) === canonicalVariantName(variant);
            });
        });
        if (unsupported.length) {
            cancelCandidateAnalysis();
            if (window.SudokuTools) {
                window.SudokuTools.autoEnabled = false;
                window.SudokuTools.setToolbarState();
            }
            var elements = solverLogElements();
            setSolverStatus(elements, "Unsupported variant");
            if (elements.output) {
                elements.output.textContent = "Auto Solver did not start because CSP support is not implemented for: " +
                    unsupported.join(", ") + ".";
            }
            return false;
        }
        var constraintsSignature = JSON.stringify(constraints);
        var signature = JSON.stringify([board, constraints]);
        if ((candidateCache.signature === signature && candidateCache.result) || candidateCache.pendingSignature === signature) {
            return true;
        }
        if (candidateCache.pendingSignature !== signature) {
            var seedSolutions = [];
            if (candidateCache.constraintsSignature === constraintsSignature) {
                seedSolutions = (candidateCache.witnesses || []).filter(function(solution) {
                    for (var row = 0; row < SIZE; row++) {
                        for (var col = 0; col < SIZE; col++) {
                            if (board[row][col] && solution[row][col] !== board[row][col]) {
                                return false;
                            }
                        }
                    }
                    return true;
                });
            }
            requestCandidateAnalysis(
                puzzle, board, constraints, signature, constraintsSignature, seedSolutions
            );
        }
        return true;
    }

    function primeUniqueSolution(puzzle, solution) {
        var board = readBoard(puzzle, false);
        var constraints = readConstraints(puzzle);
        var candidates = solution.map(function(row) {
            return row.map(function(value) { return [value]; });
        });
        candidateCache.signature = JSON.stringify([board, constraints]);
        candidateCache.pendingSignature = null;
        candidateCache.constraintsSignature = JSON.stringify(constraints);
        candidateCache.board = board.map(function(row) { return row.slice(); });
        candidateCache.witnesses = [solution.map(function(row) { return row.slice(); })];
        candidateCache.conflict = null;
        candidateCache.result = {
            valid: true,
            satisfiable: true,
            unique: true,
            candidates: candidates,
            forced: solution.map(function(row) { return row.slice(); }),
            witnessSolutions: candidateCache.witnesses
        };
    }

    /** Prevents native Penpa primitives from being claimed by two variants. */
    function shouldDiscoverVariant(active, settings, candidate, mode, submode) {
        active = active || [];
        if (active.indexOf(candidate) !== -1) return true;
        return !active.some(function(variant) {
            if (!variant || variant === "classic" || variant === candidate) return false;
            var setting = settings && settings[variant];
            if (!setting || !Array.isArray(setting.modeset)) return false;
            return setting.modeset.some(function(entryMode, index) {
                if (entryMode !== mode) return false;
                return submode === undefined || submode === null ||
                    String(setting.submodeset && setting.submodeset[index]) === String(submode);
            });
        });
    }

    function outsideExpansionSides(variant) {
        if (variant === "triplesum") return ["left"];
        var topLeftOnly = [
            "starproduct", "sandwich", "edgedifference", "evensandwich", "oddsandwich",
            "before9", "before1after9", "nextto9", "outsideconsecutive",
            "outsidekiller", "parityskyscrapers", "positionsums",
            "japanesesums", "oddsums", "bigsmalljapanesesums", "partitionedsums"
        ];
        return topLeftOnly.indexOf(variant) !== -1 ?
            ["top", "left"] : ["top", "bottom", "left", "right"];
    }

    return {
        SIZE: SIZE,
        AUTO_RUN_LIMIT_MS: AUTO_RUN_LIMIT_MS,
        AUTO_MARK_FONT_STYLE: AUTO_MARK_FONT_STYLE,
        TEST_BOARD_URL: TEST_BOARD_URL,
        isClassicSudoku: isClassicSudoku,
        canonicalVariantName: canonicalVariantName,

        cellKey: cellKey,
        digitFromEntry: digitFromEntry,
        readBoard: readBoard,
        interpretPuzzle: interpretPuzzle,
        readConstraints: readConstraints,
        getCandidates: getCandidates,
        solve: solve,
        applySolution: applySolution,
        commitSolveOnce: commitSolveOnce,
        checkCompletion: checkCompletion,
        clearAutoSolution: clearAutoSolution,
        startAutoAnalysis: startAutoAnalysis,
        scheduleAutoAnalysis: scheduleAutoAnalysis,
        onPuzzleRedraw: onPuzzleRedraw,
        drawAutoCandidates: drawAutoCandidates,
        cancelCandidateAnalysis: cancelCandidateAnalysis,
        invalidateCandidateAnalysis: invalidateCandidateAnalysis,
        primeUniqueSolution: primeUniqueSolution,
        showConflict: showConflict,
        shouldDiscoverVariant: shouldDiscoverVariant,
        outsideExpansionSides: outsideExpansionSides,
        puzzleSize: puzzleSize,
        defaultIrregularRegions: defaultIrregularRegions,
        irregularRegionIds: irregularRegionIds,
        irregularBoundaryEdges: irregularBoundaryEdges
    };
})();

var SudokuTools = (function() {
    var initialized = false;
    var generatorWorker = null;
    var generatorTimeout = null;
    var generatorActiveRequest = null;
    var generatorPausedRequest = null;
    var solveOnceTimer = null;
    var solveOnceWorker = null;
    var solveOnceSignature = null;
    var solveOnceGeneration = 0;

    function byId(id) {
        return document.getElementById(id);
    }

    function setToolbarState() {
        var autoButton = byId("sudoku_auto_solver");
        var logPanel = byId("sudoku-solver-log");
        var inlineStatus = byId("sudoku-auto-inline-status");
        if (autoButton) {
            autoButton.classList.toggle("active", SudokuTools.autoEnabled);
            autoButton.classList.toggle("auto-solver-active", SudokuTools.autoEnabled);
            autoButton.setAttribute("aria-pressed", SudokuTools.autoEnabled ? "true" : "false");
            autoButton.innerHTML = '<i class="fa fa-refresh" aria-hidden="true"></i> <span>' + (SudokuTools.autoEnabled ? "ON" : "OFF") + '</span>';
        }
        var solveButton = byId("sudoku_solve_once");
        if (solveButton) {
            solveButton.title = "Solve";
            solveButton.setAttribute("aria-label", solveButton.title);
            solveButton.innerHTML = '<i class="fa fa-magic" aria-hidden="true"></i> <span>Solve</span>';
            solveButton.style.display = "";
        }
        if (logPanel) {
            logPanel.style.display = "block";
        }
        if (inlineStatus) {
            inlineStatus.style.display = SudokuTools.autoEnabled ? "inline-block" : "none";
        }
        document.body.classList.toggle("sudoku-solver-mode", SudokuTools.autoEnabled);
        renderVariantTools();
    }

    function toggleAuto() {
        if (generatorWorker) {
            stopGenerator("Generation stopped.");
            return;
        }
        if (generatorPausedRequest) {
            stopGenerator("Generation stopped.");
            return;
        }
        SudokuTools.autoEnabled = !SudokuTools.autoEnabled;
        if (!SudokuTools.autoEnabled) {
            SudokuSolver.cancelCandidateAnalysis();
        } else {
            SudokuSolver.invalidateCandidateAnalysis();
            if (typeof pu !== "undefined" && pu) {
                SudokuSolver.startAutoAnalysis(pu);
            }
        }
        setToolbarState();
        if (pu) {
            pu.redraw();
        }
    }

    function stopSolveOnceCheck() {
        if (solveOnceTimer !== null) clearTimeout(solveOnceTimer);
        solveOnceTimer = null;
        if (solveOnceWorker) solveOnceWorker.terminate();
        solveOnceWorker = null;
        solveOnceGeneration++;
        document.body.classList.remove("sudoku-solve-check-running");
    }

    function scheduleSolveOnceCheck(puzzle, immediate) {
        if (!SudokuTools.solveOnceAutoEnabled || !puzzle) return;
        if (solveOnceTimer !== null) clearTimeout(solveOnceTimer);
        solveOnceTimer = setTimeout(function() {
            solveOnceTimer = null;
            runSolveOnceCheck(puzzle);
        }, immediate ? 0 : 160);
    }

    function runSolveOnceCheck(puzzle) {
        if (!SudokuTools.solveOnceAutoEnabled || !SudokuSolver.isClassicSudoku(puzzle)) return;
        var board = SudokuSolver.readBoard(puzzle, false);
        var constraints = SudokuSolver.readConstraints(puzzle);
        var active = Array.isArray(puzzle.activeSudokuVariants) ? puzzle.activeSudokuVariants :
            [puzzle.activeSudokuVariant || "classic"];
        var supported = constraints.supported.map(SudokuSolver.canonicalVariantName);
        var unsupported = active.filter(function(name) {
            var normalized = SudokuSolver.canonicalVariantName(name);
            return normalized !== "classic" && supported.indexOf(normalized) === -1;
        });
        if (unsupported.length) {
            generatorLog("Unsupported variant", "Auto solution check is not implemented for: " + unsupported.join(", ") + ".");
            return;
        }
        var signature = JSON.stringify([board, constraints]);
        if (signature === solveOnceSignature) return;
        solveOnceSignature = signature;
        stopSolveOnceCheck();
        var generation = ++solveOnceGeneration;
        var button = byId("sudoku_solve_once");
        var icon = button && button.querySelector("i");
        if (icon) icon.className = "fa fa-spinner fa-spin";
        document.body.classList.add("sudoku-solve-check-running");
        generatorLog("Checking", "Looking for any complete solution after the latest edit…");

        function finish(result) {
            if (generation !== solveOnceGeneration || !SudokuTools.solveOnceAutoEnabled) return;
            solveOnceWorker = null;
            document.body.classList.remove("sudoku-solve-check-running");
            if (result && result.solved) {
                SudokuSolver.showConflict(puzzle, null);
                if (icon) icon.className = "fa fa-check";
                if (button) button.title = "The grid has at least 1 solution";
                generatorLog("✓", "The grid has at least 1 solution.");
                if (typeof window !== "undefined" && window.showToast) {
                    window.showToast("This puzzle has at least one solution.", "success", "Find Solution");
                }
            } else {
                var conflict = result && result.conflict;
                SudokuSolver.showConflict(puzzle, conflict);
                if (icon) icon.className = "fa fa-exclamation-triangle";
                if (button) button.title = "No solution";
                var reason = result && result.reason ? result.reason : "No complete solution exists.";
                generatorLog("No solution", reason);
                if (typeof window !== "undefined" && window.showToast) {
                    window.showToast(reason, "warning", "No Solution");
                }
            }
        }
        if (typeof Worker === "undefined") {
            window.setTimeout(function() { finish(SudokuSolver.solve(board, constraints)); }, 0);
            return;
        }
        var checkWorker = new Worker(sudokuWorkerUrl("sudoku_solver_worker.js"));
        solveOnceWorker = checkWorker;
        checkWorker.onmessage = function(event) {
            if (event.data.type !== "result") return;
            checkWorker.terminate();
            if (solveOnceWorker === checkWorker) solveOnceWorker = null;
            finish(event.data.result);
        };
        checkWorker.onerror = function(event) {
            checkWorker.terminate();
            if (solveOnceWorker === checkWorker) solveOnceWorker = null;
            finish({ solved: false, reason: "Solution check stopped: " + (event.message || "worker error") });
        };
        checkWorker.postMessage({ type: "solve", board: board, constraints: constraints });
    }

    function solveOnce() {
        if (!pu || !SudokuSolver.isClassicSudoku(pu)) {
            const msg = "Auto solution check requires a 6x6, 7x7, 8x8, or 9x9 Sudoku or square grid.";
            generatorLog("Unsupported grid", msg);
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Unsupported Grid", text: msg });
            } else {
                alert(msg);
            }
            return;
        }
        var board = SudokuSolver.readBoard(pu, false);
        var constraints = SudokuSolver.readConstraints(pu);

        var active = Array.isArray(pu.activeSudokuVariants) ? pu.activeSudokuVariants :
            [pu.activeSudokuVariant || "classic"];
        var supported = constraints.supported.map(SudokuSolver.canonicalVariantName);
        var unsupported = active.filter(function(name) {
            var normalized = SudokuSolver.canonicalVariantName(name);
            return normalized !== "classic" && supported.indexOf(normalized) === -1;
        });
        if (unsupported.length) {
            const msg = "Solver is not implemented for: " + unsupported.join(", ") + ".";
            generatorLog("Unsupported variant", msg);
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Unsupported Variant", text: msg });
            } else {
                alert(msg);
            }
            return;
        }

        generatorLog("Solving", "Solving the puzzle...");
        document.body.classList.add("sudoku-solver-running");

        var solveWorker = null;
        var solveTimeout = null;
        var solveRunLimitMs = sudokuSolverTimeLimitMs();

        function cleanup() {
            if (solveTimeout) {
                clearTimeout(solveTimeout);
                solveTimeout = null;
            }
            if (solveWorker) {
                solveWorker.terminate();
                solveWorker = null;
            }
            document.body.classList.remove("sudoku-solver-running");
        }

        function handleResult(result) {
            cleanup();
            if (result && result.solved) {
                SudokuSolver.commitSolveOnce(pu, result.board);
                pu.redraw();
                document.dispatchEvent(new CustomEvent("sudoku-solved"));
                generatorLog("Solved", "This puzzle has at least one solution.");
                if (typeof window !== "undefined" && window.showToast) {
                    window.showToast("This puzzle has at least one solution.", "success", "Find Solution");
                }
            } else {
                SudokuSolver.showConflict(pu, result && result.conflict);
                const msg = result && result.reason ? result.reason : "No complete solution exists for the current grid.";
                generatorLog("No solution", msg);
                if (typeof window !== "undefined" && window.showToast) {
                    window.showToast(msg, "error", "No Solution Found");
                } else if (typeof Swal !== "undefined") {
                    Swal.fire({ icon: "warning", title: "No Solution", text: msg });
                } else {
                    alert(msg);
                }
            }
        }

        if (typeof Worker === "undefined") {
            window.setTimeout(function() {
                try {
                    var result = SudokuSolver.solve(board, constraints);
                    handleResult(result);
                } catch (e) {
                    cleanup();
                    generatorLog("Error", "Solver error: " + e.message);
                }
            }, 0);
            return;
        }

        try {
            solveWorker = new Worker(sudokuWorkerUrl("sudoku_solver_worker.js"));
            if (solveRunLimitMs !== null) {
                solveTimeout = setTimeout(function() {
                    cleanup();
                    const msg = "Solving timed out after " + sudokuSolverTimeLimitLabel(solveRunLimitMs) + ".";
                    generatorLog("Timeout", msg);
                    if (typeof Swal !== "undefined") {
                        Swal.fire({ icon: "warning", title: "Timeout", text: msg });
                    } else {
                        alert(msg);
                    }
                }, solveRunLimitMs);
            }

            solveWorker.onmessage = function(event) {
                if (event.data.type === "result") {
                    handleResult(event.data.result);
                } else if (event.data.type === "error") {
                    cleanup();
                    const msg = "Solver error: " + (event.data.message || "Unknown error");
                    generatorLog("Error", msg);
                    if (typeof Swal !== "undefined") {
                        Swal.fire({ icon: "error", title: "Solver Error", text: msg });
                    } else {
                        alert(msg);
                    }
                }
            };

            solveWorker.onerror = function(event) {
                cleanup();
                const msg = "Solver worker error: " + (event.message || "Worker error");
                generatorLog("Error", msg);
                if (typeof Swal !== "undefined") {
                    Swal.fire({ icon: "error", title: "Solver Error", text: msg });
                } else {
                    alert(msg);
                }
            };

            solveWorker.postMessage({ type: "solve", board: board, constraints: constraints });
        } catch (err) {
            cleanup();
            generatorLog("Error", "Failed to start solver worker: " + err.message);
        }
    }

    function loadTestBoard() {
        var input = byId("urlstring");
        if (input) {
            input.value = SudokuSolver.TEST_BOARD_URL;
        }
        if (typeof import_url === "function") {
            import_url(SudokuSolver.TEST_BOARD_URL);
        }
    }

    function generatorLog(status, message, progress) {
        var statusNode = byId("sudoku-solver-status");
        var output = byId("sudoku-solver-log-output");
        var bar = byId("sudoku-solver-progress");
        if (statusNode) statusNode.textContent = status;
        if (output && message) output.textContent = message;
        if (bar && progress) {
            bar.max = progress.total || 1;
            bar.value = progress.attempt || 0;
        }
    }

    function stopGenerator(message) {
        if (generatorWorker) generatorWorker.terminate();
        generatorWorker = null;
        if (generatorTimeout) clearTimeout(generatorTimeout);
        generatorTimeout = null;
        generatorActiveRequest = null;
        generatorPausedRequest = null;
        document.body.classList.remove("sudoku-solver-running");
        var button = byId("sudoku_auto_solver");
        if (button) {
            button.title = "Auto Solver";
            button.setAttribute("aria-label", button.title);
            var icon = button.querySelector("i");
            if (icon) icon.className = "fa fa-refresh";
        }
        if (message) generatorLog("Stopped", message);
    }

    function pauseGenerator() {
        if (!generatorWorker || !generatorActiveRequest) return;
        generatorWorker.terminate();
        generatorWorker = null;
        if (generatorTimeout) clearTimeout(generatorTimeout);
        generatorTimeout = null;
        generatorPausedRequest = generatorActiveRequest;
        generatorActiveRequest = null;
        document.body.classList.remove("sudoku-solver-running");
        generatorLog("Paused", "Generation paused. Press the wand again to resume the same seeded run.");
        var button = byId("sudoku_auto_solver");
        if (button) {
            button.title = "Resume generation";
            button.setAttribute("aria-label", button.title);
            var icon = button.querySelector("i");
            if (icon) icon.className = "fa fa-refresh";
        }
    }

    function resumeGenerator() {
        if (!generatorPausedRequest) return;
        var request = generatorPausedRequest;
        generatorPausedRequest = null;
        generatePuzzle(request.size, request.variants, request.negative, request.sourcePuzzle, request.seed);
    }

    function stopWork() {
        if (generatorWorker) {
            stopGenerator("Generation stopped.");
            return;
        }
        if (SudokuTools.autoEnabled) {
            SudokuTools.autoEnabled = false;
            SudokuSolver.cancelCandidateAnalysis();
            setToolbarState();
            if (pu) pu.redraw();
        }
        if (SudokuTools.solveOnceAutoEnabled) {
            SudokuTools.solveOnceAutoEnabled = false;
            stopSolveOnceCheck();
            setToolbarState();
        }
    }

    function applyGeneratedPuzzle(result) {
        if (!pu || !pu.pu_q) return;
        SudokuTools.autoEnabled = false;
        SudokuSolver.cancelCandidateAnalysis();
        var generatedVariants = result.variants || [result.variant || "classic"];
        if (generatedVariants.indexOf("classic") === -1) generatedVariants.unshift("classic");
        pu.activeSudokuVariants = generatedVariants.slice();
        pu.activeSudokuVariant = generatedVariants[generatedVariants.length - 1];
        SudokuSolver.invalidateCandidateAnalysis();
        if (pu.mode && pu.mode.qa !== "pu_q" && typeof pu.mode_qa === "function") {
            pu.mode_qa("pu_q");
        }
        if (result.preserveExisting) {
            // Remove only playable-cell givens. Outside clues, edge labels,
            // cages, paths, symbols, and every other native Penpa mark remain.
            result.board.forEach(function(row, rowIndex) {
                row.forEach(function(_, colIndex) {
                    delete pu.pu_q.number[SudokuSolver.cellKey(pu, rowIndex, colIndex)];
                });
            });
        } else {
            pu.pu_q.number = {};
            pu.pu_q.symbol = {};
        }
        if (pu.pu_a) {
            pu.pu_a.number = {};
            pu.pu_a.symbol = {};
        }
        if (pu.pu_q_col) {
            pu.pu_q_col.number = {};
            pu.pu_q_col.symbol = {};
        }
        result.board.forEach(function(row, rowIndex) {
            row.forEach(function(digit, colIndex) {
                if (digit) pu.pu_q.number[SudokuSolver.cellKey(pu, rowIndex, colIndex)] = [digit, 1, "1"];
            });
        });
        (!result.preserveExisting ? result.oddEvenMarks || [] : []).forEach(function(mark) {
            var key = SudokuSolver.cellKey(pu, mark.cell.row, mark.cell.col);
            pu.pu_q.symbol[key] = [3, mark.parity === "odd" ? "circle_L" : "square_L", 2];
        });

        function pointForCells(cells) {
            var wanted = cells.map(function(cell) { return SudokuSolver.cellKey(pu, cell.row, cell.col); })
                .sort(function(first, second) { return first - second; });
            var centers = {};
            (pu.centerlist || []).forEach(function(key) { centers[key] = true; });
            var keys = Object.keys(pu.point || {});
            for (var index = 0; index < keys.length; index++) {
                var point = pu.point[keys[index]];
                if (!point || !Array.isArray(point.neighbor)) continue;
                var pointKey = Number(keys[index]);
                if (cells.length === 2 &&
                    (!pu.types || !pu.types[2] || pu.types[2].indexOf(point.type) === -1 ||
                        !pu.isKropkiEdge || !pu.isKropkiEdge(pointKey))) continue;
                if (cells.length === 4 && (!pu.isBattenburgCorner || !pu.isBattenburgCorner(pointKey))) continue;
                var neighbors = point.neighbor.filter(function(key) { return centers[key]; })
                    .sort(function(first, second) { return first - second; });
                if (neighbors.length === wanted.length && neighbors.every(function(key, offset) {
                    return key === wanted[offset];
                })) return pointKey;
            }
            return null;
        }

        (!result.preserveExisting ? result.kropkiMarks || [] : []).forEach(function(mark) {
            var key = pointForCells(mark.cells);
            if (key !== null) pu.pu_q.symbol[key] = [mark.kind === "black" ? 2 : 1, "circle_SS", 2];
        });
        (!result.preserveExisting ? result.xvMarks || [] : []).forEach(function(mark) {
            var key = pointForCells(mark.cells);
            if (key !== null) pu.pu_q.number[key] = [mark.kind, 6, "5"];
        });
        (!result.preserveExisting ? result.battenburgMarks || [] : []).forEach(function(mark) {
            var key = pointForCells(mark.cells);
            if (key !== null) pu.pu_q.symbol[key] = [1, "sudokuetc", 2];
        });
        var select = byId("constraints_settings_opt");
        if (select) select.value = pu.activeSudokuVariant;
        syncDiagonalLines();
        renderVariantTools();
        if (pu.activeSudokuVariant === "classic") {
            applyMode("classic", "sudoku", "1", "");
        } else {
            var setting = penpa_constraints.setting[pu.activeSudokuVariant];
            var modeIndex = setting ? setting.modeset.findIndex(function(mode) { return mode !== "sudoku"; }) : -1;
            if (modeIndex >= 0) {
                applyMode(pu.activeSudokuVariant, setting.modeset[modeIndex], setting.submodeset[modeIndex], setting.styleset[modeIndex]);
            } else {
                activateVariantRule(pu.activeSudokuVariant);
            }
        }
        setToolbarState();
        pu.redraw();
        var displayedBoard = SudokuSolver.readBoard(pu, false);
        var displayedConstraints = SudokuSolver.readConstraints(pu);
        var displayedAnswers = SudokuCSPRuntime.createProblem(displayedBoard, displayedConstraints).enumerateAnswers(2);
        if (displayedAnswers.length !== 1 || JSON.stringify(displayedAnswers[0]) !== JSON.stringify(result.solution)) {
            throw new Error("The generated Penpa board did not round-trip to the uniquely verified CSP puzzle.");
        }
        SudokuSolver.primeUniqueSolution(pu, result.solution);
    }

    function generatePuzzle(size, variants, negative, sourcePuzzle, seed) {
        stopGenerator();
        var startedAt = Date.now();
        variants = Array.isArray(variants) && variants.length ? variants : ["classic"];
        seed = seed || Date.now();
        generatorActiveRequest = {
            size: size,
            variants: variants.slice(),
            negative: negative,
            sourcePuzzle: sourcePuzzle,
            seed: seed
        };
        var label = variants.filter(function(variant) { return variant !== "classic"; }).join(" + ") || "classic";
        // Read generator settings
        var genSymmetry = (window.UserSettings && window.UserSettings.generator_symmetry) || 'rotational180';
        var genMinimal = window.UserSettings ? (window.UserSettings.generator_difficulty_minimal !== false) : true;
        var genCluesOnMarks = window.UserSettings ? (window.UserSettings.generator_clues_on_marks !== false) : true;
        var symLabel = genSymmetry === 'none' ? 'no symmetry' : genSymmetry === 'all_axis' ? 'all-axis symmetry' : '180° rotational symmetry';
        document.body.classList.add("sudoku-solver-running");
        var generatorButton = byId("sudoku_auto_solver");
        if (generatorButton) {
            generatorButton.title = "Pause generation";
            generatorButton.setAttribute("aria-label", generatorButton.title);
            var generatorIcon = generatorButton.querySelector("i");
            if (generatorIcon) generatorIcon.className = "fa fa-refresh";
        }
        generatorLog("Generating", "[" + new Date().toLocaleTimeString() + "] Building a " +
            label + " puzzle with " + symLabel + (genMinimal ? ", minimal clues" : ", medium clues (+8)") +
            (genCluesOnMarks ? "" : ", no clues on marks") + ", then proving uniqueness with CSP.\n",
            { attempt: 0, total: Math.ceil(size * size / 2) });
        if (typeof Worker === "undefined") {
            try {
                var direct = SudokuGenerator.generate({
                    size: size,
                    variants: variants,
                    negative: negative,
                    sourceBoard: sourcePuzzle && sourcePuzzle.board,
                    sourceConstraints: sourcePuzzle && sourcePuzzle.constraints,
                    preserveExisting: sourcePuzzle && sourcePuzzle.preserveExisting,
                    symmetry: genSymmetry,
                    minimal: genMinimal,
                    seed: seed
                });
                applyGeneratedPuzzle(direct);
                document.body.classList.remove("sudoku-solver-running");
                var symDesc = genSymmetry === 'none' ? 'no symmetry constraint' : genSymmetry === 'all_axis' ? 'all-axis symmetry' : '180° rotational symmetry';
                generatorLog("Generated · unique", "Generated " +
                    (direct.preserveExisting ? "digit-minimal " : (genMinimal ? "minimal " : "medium ")) + direct.givens + "-given " + label +
                    (direct.preserveExisting ? " puzzle while preserving its existing variant clues. No rotational digit pair" :
                        " puzzle with " + symDesc + ". No clue pair") + " can be removed while preserving uniqueness. Total runtime: " +
                    ((Date.now() - startedAt) / 1000).toFixed(3) + " s.");
            } catch (error) {
                stopGenerator("Generator failed: " + error.message);
            }
            return;
        }
        generatorWorker = new Worker(sudokuWorkerUrl("sudoku_generator_worker.js"));
        generatorWorker.onmessage = function(event) {
            if (event.data.type === "progress") {
                generatorLog("Generating", null, event.data.progress);
            } else if (event.data.type === "result") {
                var result = event.data.result;
                stopGenerator();
                try {
                    applyGeneratedPuzzle(result);
                    var symDescW = genSymmetry === 'none' ? 'no symmetry constraint' : genSymmetry === 'all_axis' ? 'all-axis symmetry' : '180° rotational symmetry';
                    generatorLog("Generated · unique", "Generated " +
                        (result.preserveExisting ? "digit-minimal " : (genMinimal ? "minimal " : "medium ")) + result.givens + "-given " + label +
                        (result.preserveExisting ? " puzzle while preserving its existing variant clues. No rotational digit pair" :
                            " puzzle with " + symDescW + ". No clue pair") + " can be removed while preserving uniqueness. Total runtime: " +
                        ((Date.now() - startedAt) / 1000).toFixed(3) + " s.");
                } catch (error) {
                    stopGenerator("Generator validation failed: " + error.message);
                }
            } else if (event.data.type === "error") {
                stopGenerator("Generator failed: " + event.data.message);
            }
        };
        generatorWorker.onerror = function(event) {
            stopGenerator("Generator failed: " + (event.message || "worker error"));
        };
        generatorWorker.postMessage({
            type: "generate",
            size: size,
            variants: variants,
            negative: negative,
            sourceBoard: sourcePuzzle && sourcePuzzle.board,
            sourceConstraints: sourcePuzzle && sourcePuzzle.constraints,
            preserveExisting: sourcePuzzle && sourcePuzzle.preserveExisting,
            symmetry: genSymmetry,
            minimal: genMinimal,
            seed: seed
        });
        generatorTimeout = setTimeout(function() {
            stopGenerator("Generator stopped at the 60-second safety limit.");
        }, SudokuSolver.AUTO_RUN_LIMIT_MS);
    }

    function modeLabel(variant, mode, submode) {
        var labels = {
            irregular: "Regions",
            sudoku: "Sudoku",
            symbol: variant === "deadoralivearrows" ? (submode === "arrow_B_W" ? "White Arrow" : "Grey Arrow") :
                submode === "diamond_SS" && variant === "doublekropki" ? "Double Kropki Dot" :
                submode === "circle_SS" ? (variant === "consecutive" ? "White Dot" : "Kropki Dot") :
                variant === "odd even" || variant === "odd even count" || variant === "odd even bridge" ? "Odd / Even Mark" :
                    variant === "battenburg" ? "Battenburg Mark" :
                        variant === "little killer" || variant === "weighted little killer" || variant === "product little killer" || variant === "productframe" || variant === "bouncing x-sums" || variant === "czech outsider" || variant === "pointingdifferents" ? "Arrow" :
                            variant === "diagonallyconsecutive" || variant === "diagonal sum is nine" || variant === "diagonal tens" ? "Bars" : "Mark",
            special: submode === "arrows" ? "Arrow" : submode === "thermo" ? "Thermo" :
                submode === "nobulbthermo" ? "No-bulb Thermo" : "Special",
            line: variant === "palindrome" ? "Palindrome Line" : "Line",
            lineE: "Edge",
            cage: "Cage",
            number: variant === "xv" && submode === "5" ? "XV Clue" :
                variant === "multiplication" ? "Multiplication Sign" :
                    variant === "product little killer" || variant === "productframe" ? "Product" :
                        variant === "little killer" || variant === "weighted little killer" || variant === "bouncing x-sums" || variant === "pointingdifferents" ? "Total" :
                            ["innerframesum", "missingdigit", "nextto9", "outsideconsecutive", "outsidegreaterthan", "outsidekiller", "parityskyscrapers"].indexOf(variant) !== -1 ? "Outside Clue" :
                                variant === "czech outsider" ? "Outsider" :
                submode === "11" ? "Killer Sum" : variant === "skyscraper" ? "Skyscraper Clue" :
                    variant === "sumskyscrapers" ? "Visible Height Sum" :
                        variant === "sumsandwich" ? "Sum Sequence" :
                            variant === "positionsums" ? "Position Sums" :
                                variant === "sandwich" ? "Sandwich Clue" : "Clue",
            surface: variant === "scattered" ? "Shading" : "Cell",
            combi: "Composite"
        };
        return labels[mode] || mode;
    }

    function variantLabel(variant) {
        var select = byId("constraints_settings_opt");
        var option = select && Array.prototype.find.call(select.options, function(candidate) {
            return candidate.value === variant;
        });
        if (option && option.textContent && option.textContent.trim()) return option.textContent.trim();
        return variant.replace(/\s+sudoku$/i, "").replace(/\b\w/g, function(letter) {
            return letter.toUpperCase();
        });
    }

    function selectedVariant() {
        var select = byId("constraints_settings_opt");
        return select && select.value ? select.value : "classic";
    }

    function activeVariants() {
        if (typeof pu === "undefined" || !pu) {
            return ["classic"];
        }
        if (!Array.isArray(pu.activeSudokuVariants)) {
            pu.activeSudokuVariants = [pu.activeSudokuVariant || "classic"];
        }
        pu.activeSudokuVariants = pu.activeSudokuVariants.filter(function(variant, index, variants) {
            return variant && variants.indexOf(variant) === index;
        });
        if (pu.activeSudokuVariants.indexOf("classic") === -1) {
            pu.activeSudokuVariants.unshift("classic");
        }
        return pu.activeSudokuVariants;
    }

    function hasVariant(variant) {
        return activeVariants().indexOf(variant) !== -1;
    }

    function addVariant(variant) {
        var variants = activeVariants();
        if (variants.indexOf(variant) === -1) {
            variants.push(variant);
        }
    }

    var outsideVariants = ["little killer", "weighted little killer", "product little killer", "sandwich", "evensandwich", "oddsandwich", "skyscraper",
        "descriptivepairs", "outside", "outside234", "maximin", "minimax", "bust", "xsums",
        "numberedrooms", "sumframe", "productframe", "edgedifference", "fullrank", "outsideparity",
        "parityparty", "serbianframe", "median", "rossini", "before9",
        "before1after9", "ascendingstarters", "bouncing x-sums", "czech outsider", "distances",
        "oddevenbigsmall", "firstseenoddeven", "maxascending", "framediagonal",
        "innerframesum", "missingdigit", "nextto9", "outsideconsecutive", "outsidegreaterthan", "outsidekiller", "parityskyscrapers", "pointingdifferents",
        "sumskyscrapers", "sumsandwich", "positionsums", "xaverage", "triplesum",  "japanesesums", "oddsums", "partitionedsums"];

    function variantConflict(variant) {
        var variants = activeVariants();
        var regionGridVariants = ["irregular", "scattered", "deficit", "surplus", "toroidal"];
        if (regionGridVariants.indexOf(variant) !== -1) {
            var otherRegionGrid = variants.find(function(active) {
                return active !== variant && regionGridVariants.indexOf(active) !== -1;
            });
            if (otherRegionGrid) {
                return "Remove " + variantLabel(otherRegionGrid) + " before adding another region-grid variant.";
            }
        }
        if ((variant === "diagonal" && variants.indexOf("anti diagonal") !== -1) ||
            (variant === "anti diagonal" && variants.indexOf("diagonal") !== -1)) {
            return "Diagonal and Anti-Diagonal cannot be active together.";
        }
        if (outsideVariants.indexOf(variant) !== -1) {
            var otherOutside = variants.find(function(active) {
                return active !== variant && outsideVariants.indexOf(active) !== -1;
            });
            if (otherOutside) {
                return "Remove " + otherOutside.replace(/\b\w/g, function(letter) {
                    return letter.toUpperCase();
                }) + " before adding another outside-clue variant.";
            }
        }
        return "";
    }

    function layerHas(layer, property) {
        return !!(layer && layer[property] && Object.keys(layer[property]).length);
    }

    function diagonalLineKeys(puzzle) {
        if (!puzzle || !puzzle.pu_q || !puzzle.pu_q.lineE) {
            return [];
        }
        var sudokuFlags = puzzle.sudoku || [0, 0, 0, 0];
        var start = 1;
        var end = puzzle.nx;
        var endSize = end;
        if (sudokuFlags[1]) {
            start = 2;
            end = puzzle.nx - 1;
            endSize = end + 1;
        } else if (sudokuFlags[2]) {
            start = 2;
            end = puzzle.nx;
            endSize = end + 1;
        }
        var keys = [];
        var base = puzzle.nx0 * puzzle.ny0;
        for (var i = start; i <= end; i++) {
            var first = puzzle.nx0 * i + i + base;
            var second = puzzle.nx0 * (i + 1) + (i + 1) + base;
            keys.push(first + "," + second);

            var reverseFirst = puzzle.nx0 * i + endSize + 2 - i + base;
            var reverseSecond = puzzle.nx0 * (i + 1) + endSize + 1 - i + base;
            keys.push(Math.min(reverseFirst, reverseSecond) + "," + Math.max(reverseFirst, reverseSecond));
        }
        return keys;
    }

    function hasNativeDiagonalLines(puzzle) {
        if (puzzle && puzzle.sudoku && (puzzle.sudoku[0] || puzzle.sudoku[3])) {
            return true;
        }
        return diagonalLineKeys(puzzle).some(function(key) {
            return puzzle.pu_q.lineE[key] === 12;
        });
    }

    function argyleLineKeys(puzzle) {
        if (!puzzle || !puzzle.pu_q || !puzzle.pu_q.lineE ||
            SudokuSolver.puzzleSize(puzzle) !== 9) {
            return [];
        }
        var base = puzzle.nx0 * puzzle.ny0;
        var getCornerPoint = function(vRow, vCol) {
            return base + puzzle.nx0 * (vRow + 1) + (vCol + 1);
        };
        var paths = [
            [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]],
            [[0, 4], [1, 5], [2, 6], [3, 7], [4, 8], [5, 9]],
            [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4], [6, 5], [7, 6], [8, 7], [9, 8]],
            [[4, 0], [5, 1], [6, 2], [7, 3], [8, 4], [9, 5]],
            [[0, 5], [1, 4], [2, 3], [3, 2], [4, 1], [5, 0]],
            [[0, 8], [1, 7], [2, 6], [3, 5], [4, 4], [5, 3], [6, 2], [7, 1], [8, 0]],
            [[1, 9], [2, 8], [3, 7], [4, 6], [5, 5], [6, 4], [7, 3], [8, 2], [9, 1]],
            [[4, 9], [5, 8], [6, 7], [7, 6], [8, 5], [9, 4]]
        ];
        var keys = [];
        paths.forEach(function(path) {
            for (var i = 0; i < path.length - 1; i++) {
                var p1 = getCornerPoint(path[i][0], path[i][1]);
                var p2 = getCornerPoint(path[i + 1][0], path[i + 1][1]);
                keys.push(Math.min(p1, p2) + "," + Math.max(p1, p2));
            }
        });
        return keys;
    }

    function syncDiagonalLines() {
        if (!pu || !pu.pu_q || !pu.pu_q.lineE) {
            return;
        }
        var diagEnabled = hasVariant("diagonal") || hasVariant("anti diagonal");
        var argyleEnabled = hasVariant("argyle") && SudokuSolver.puzzleSize(pu) === 9;
        var argyleKeys = argyleLineKeys(pu);
        var argyleSet = new Set(argyleKeys);

        diagonalLineKeys(pu).forEach(function(key) {
            if (diagEnabled) {
                pu.pu_q.lineE[key] = 12;
            } else if (pu.pu_q.lineE[key] === 12 && !argyleSet.has(key)) {
                delete pu.pu_q.lineE[key];
            }
        });
        argyleKeys.forEach(function(key) {
            if (argyleEnabled) {
                pu.pu_q.lineE[key] = 12;
            } else if (pu.pu_q.lineE[key] === 12 && !diagEnabled) {
                delete pu.pu_q.lineE[key];
            }
        });
        if (Array.isArray(pu.sudoku)) {
            pu.sudoku[0] = diagEnabled ? 1 : 0;
            pu.sudoku[3] = diagEnabled ? 1 : 0;
        }
    }

    function discoverVariantsFromBoard() {
        if (!pu) {
            return;
        }
        var layers = [pu.pu_q, pu.pu_a];
        var canDiscover = function(candidate, mode, submode) {
            return SudokuSolver.shouldDiscoverVariant(
                activeVariants(), penpa_constraints.setting, candidate, mode, submode
            );
        };
        if (hasNativeDiagonalLines(pu) && !hasVariant("diagonal") && !hasVariant("anti diagonal")) {
            addVariant("diagonal");
        }
        layers.forEach(function(layer) {
            if (!layer) {
                return;
            }
            if (layerHas(layer, "arrows") && canDiscover("arrow", "special", "arrows")) { addVariant("arrow"); }
            if (layerHas(layer, "thermo") &&
                canDiscover("thermo", "special", "thermo")) { addVariant("thermo"); }
            if ((layerHas(layer, "killercages") || layerHas(layer, "cage")) &&
                canDiscover("killer", "cage", "1")) { addVariant("killer"); }
            Object.keys(layer.symbol || {}).forEach(function(key) {
                var entry = layer.symbol[key];
                if (entry && entry[1] === "circle_SS" && (entry[0] === 1 || entry[0] === 2) &&
                    canDiscover("kropki", "symbol", "circle_SS")) {
                    addVariant("kropki");
                } else if (entry && (entry[1] === "circle_L" || entry[1] === "square_L") &&
                    canDiscover("odd even", "symbol", "circle_L")) {
                    addVariant("odd even");
                } else if (entry && entry[1] === "sudokuetc" && entry[0] === 1 &&
                    canDiscover("battenburg", "symbol", "sudokuetc")) {
                    addVariant("battenburg");
                } else if (entry && entry[1] === "diamond_SS" && (entry[0] === 1 || entry[0] === 2) &&
                    canDiscover("doublekropki", "symbol", "diamond_SS")) {
                    addVariant("doublekropki");
                }
            });
            Object.keys(layer.line || {}).some(function(key) {
                if (layer.line[key] === 5 && canDiscover("palindrome", "line", "2")) {
                    addVariant("palindrome");
                    return true;
                }
                return false;
            });
            Object.keys(layer.number || {}).some(function(key) {
                var entry = layer.number[key];
                var value = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
                if ((value === "X" || value === "V") && canDiscover("xv", "number", "5")) {
                    addVariant("xv");
                    return true;
                }
                return false;
            });
        });
    }

    function updateVariantActive() {
        var toolbar = byId("sudoku-variant-tools");
        if (!toolbar || typeof pu === "undefined" || !pu || !pu.mode || !pu.mode[pu.mode.qa]) {
            return;
        }
        Array.prototype.forEach.call(toolbar.querySelectorAll(".sudoku-variant-mode"), function(button) {
            if (button.dataset.mode === "irregular") {
                button.classList.toggle("active", pu.irregular_mode === true);
                return;
            }
            var mode = pu.mode[pu.mode.qa].edit_mode;
            var submode = pu.mode[pu.mode.qa][mode] ? pu.mode[pu.mode.qa][mode][0] : "";
            var active = button.dataset.mode === mode &&
                (button.dataset.variant ? button.dataset.variant === pu.activeSudokuVariant :
                    pu.activeSudokuVariant === "classic") &&
                (button.dataset.submode === "" || button.dataset.submode === submode);
            button.classList.toggle("active", active);
        });
    }

    function activateVariantRule(variant) {
        if (!pu) return;
        pu.activeSudokuVariant = variant;
        pu.kropki_mode = false;
        pu.consecutive_mode = false;
        pu.sudoku_directional_cell_mode = false;
        pu.xv_mode = false;
        pu.odd_even_mode = false;
        pu.battenburg_mode = false;
        updateVariantActive();
    }

    function updateKropkiNegativeControl() {
        var button = byId("sudoku_kropki_negative");
        if (!button) {
            return;
        }
        var enabled = !!(pu && pu.kropkiNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Kropki " + (enabled ? "ON" : "OFF");
    }

    function toggleKropkiNegative() {
        if (!pu || !hasVariant("kropki")) {
            return;
        }
        pu.kropkiNegativeConstraint = pu.kropkiNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateKropkiNegativeControl();
        pu.redraw();
    }

    function updateDoubleKropkiNegativeControl() {
        var button = byId("sudoku_doublekropki_negative");
        if (!button) {
            return;
        }
        var enabled = !!(pu && pu.doublekropkiNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Double Kropki " + (enabled ? "ON" : "OFF");
    }

    function toggleDoubleKropkiNegative() {
        if (!pu || !hasVariant("doublekropki")) {
            return;
        }
        pu.doublekropkiNegativeConstraint = pu.doublekropkiNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateDoubleKropkiNegativeControl();
        pu.redraw();
    }

    function updateConsecutiveNegativeControl() {
        var button = byId("sudoku_consecutive_negative");
        if (!button) return;
        var enabled = !!(pu && pu.consecutiveNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Consecutive " + (enabled ? "ON" : "OFF");
    }

    function toggleConsecutiveNegative() {
        if (!pu || !hasVariant("consecutive")) return;
        pu.consecutiveNegativeConstraint = pu.consecutiveNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateConsecutiveNegativeControl();
        pu.redraw();
    }

    function updateXVNegativeControl() {
        var button = byId("sudoku_xv_negative");
        if (!button) {
            return;
        }
        var enabled = !!(pu && pu.xvNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative XV " + (enabled ? "ON" : "OFF");
    }

    function toggleXVNegative() {
        if (!pu || !hasVariant("xv")) {
            return;
        }
        pu.xvNegativeConstraint = pu.xvNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateXVNegativeControl();
        updateLCNegativeControl();
        pu.redraw();
    }

    function updateLCNegativeControl() {
        var button = byId("sudoku_lc_negative");
        if (!button) {
            return;
        }
        var enabled = !!(pu && pu.lcNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative LC " + (enabled ? "ON" : "OFF");
    }

    function toggleLCNegative() {
        if (!pu || !hasVariant("lc")) {
            return;
        }
        pu.lcNegativeConstraint = pu.lcNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateLCNegativeControl();
        pu.redraw();
    }

    function updateBattenburgNegativeControl() {
        var button = byId("sudoku_battenburg_negative");
        if (!button) return;
        var enabled = !!(pu && pu.battenburgNegativeConstraint === true);
        button.classList.toggle("active", enabled);
        button.setAttribute("aria-pressed", enabled ? "true" : "false");
        button.textContent = "Negative Battenburg " + (enabled ? "ON" : "OFF");
    }

    function toggleBattenburgNegative() {
        if (!pu || !hasVariant("battenburg")) return;
        pu.battenburgNegativeConstraint = pu.battenburgNegativeConstraint !== true;
        SudokuSolver.invalidateCandidateAnalysis();
        updateBattenburgNegativeControl();
        pu.redraw();
    }

    function applyMode(variant, mode, submode, style) {
        if (mode === "irregular") {
            enterIrregularEditor(variant);
            return;
        }
        if (!pu || !pu.mode || !pu.mode[pu.mode.qa] || !pu.mode[pu.mode.qa][mode]) {
            return;
        }
        if (submode !== "") {
            pu.mode[pu.mode.qa][mode][0] = submode;
        }
        if (mode === "symbol") {
            // Variant symbols are foreground clues by default.
            pu.mode[pu.mode.qa][mode][1] = 2;
            if (["xydifference", "perfectsquares", "primesums", "twodigitprimenumbers"].indexOf(variant) !== -1) {
                pu.mode[pu.mode.qa][mode][2] = "2";
            }
        } else if (style !== "") {
            pu.mode[pu.mode.qa][mode][1] = style;
        }
        pu.activeSudokuVariant = variant || "classic";
        pu.kropki_mode = pu.activeSudokuVariant === "kropki";
        pu.onefivenine_mode = pu.activeSudokuVariant === "onefivenine";
        pu.onetouch_mode = pu.activeSudokuVariant === "onetouch";
        pu.paritycircles_mode = pu.activeSudokuVariant === "paritycircles";
        pu.consecutive_mode = pu.activeSudokuVariant === "consecutive";
        pu.even_sum_pairs_mode = pu.activeSudokuVariant === "evensumpairs";
        pu.clockfaces_mode = pu.activeSudokuVariant === "clockfaces";
        pu.trio_mode = pu.activeSudokuVariant === "trio";
        pu.mastermind_mode = pu.activeSudokuVariant === "mastermind";
        pu.pencilmarks_mode = pu.activeSudokuVariant === "pencilmarks";
        pu.diagonal_consecutive_mode = ["diagonallyconsecutive", "diagonal sum is nine", "diagonal tens"].indexOf(pu.activeSudokuVariant) !== -1;
        pu.xv_mode = pu.activeSudokuVariant === "xv" || pu.activeSudokuVariant === "xivi";
        pu.lc_mode = pu.activeSudokuVariant === "lc";
        pu.odd_even_mode = pu.activeSudokuVariant === "odd even" || pu.activeSudokuVariant === "odd even count" || pu.activeSudokuVariant === "odd even bridge";
        pu.battenburg_mode = pu.activeSudokuVariant === "battenburg";
        pu.sudoku_midpoint_clue_mode = pu.activeSudokuVariant === "midpoint" &&
            (mode === "number" || mode === "symbol");
        pu.sudoku_edge_clue_mode = ["difference", "sum", "product", "arithmetic", "greater", "lesser",
            "consecutive", "evensumpairs", "oddsumpairs", "inequality", "xydifference", "perfectsquares", "multiplication", "xivi", "lc",
            "primesums", "twodigitprimenumbers", "blocksumrelations", "divisor", "eitheror", "anticonsecutive", "fives", "sumnine", "fadedkropki", "doublekropki",
            "oneortwodifferencepairs", "teneleven", "tenspositionproducts"].indexOf(pu.activeSudokuVariant) !== -1 &&
            (mode === "number" || mode === "symbol");
        pu.sudoku_corner_clue_mode = ["quadruple", "equalsums", "equaldifferences", "equalproducts",
            "equalratios", "consecutivequads", "quadmax", "quadmin", "exclusion", "groupsum", "wheel", "crosssums", "determinant", "fullorhalf"].indexOf(pu.activeSudokuVariant) !== -1 &&
            (mode === "number" || mode === "symbol");
        pu.sudoku_directional_cell_mode = ["biggestneighbours", "smallestneighbours", "eliminate", "pointtonext", "pointtoprevious",
            "search9", "sumdetector", "detection", "deadoralivearrows", "twindetector"].indexOf(pu.activeSudokuVariant) !== -1 && mode === "symbol";
        pu.sudokuSymbolVariantOwner = mode === "symbol" && ["biggestneighbours", "smallestneighbours", "eliminate", "pointtonext",
            "pointtoprevious", "quadmax", "quadmin", "search9", "sumdetector", "detection", "deadoralivearrows", "twindetector"].indexOf(pu.activeSudokuVariant) !== -1 ?
            pu.activeSudokuVariant : null;
        if (pu.battenburg_mode) {
            UserSettings.draw_edges = true;
        }
        if (pu.xv_mode || pu.lc_mode || pu.sudoku_edge_clue_mode || pu.sudoku_corner_clue_mode ||
            pu.sudoku_midpoint_clue_mode || pu.diagonal_consecutive_mode) {
            UserSettings.draw_edges = true;
        }
        pu.mode_set(mode);
        pu.type = pu.type_set();
        updateVariantActive();
        updateKropkiNegativeControl();
        updateDoubleKropkiNegativeControl();
        updateConsecutiveNegativeControl();
        updateXVNegativeControl();
        updateLCNegativeControl();
        updateBattenburgNegativeControl();
    }

    function ensureIrregularRegions() {
        if (!pu || !pu.pu_q) return [];
        var size = SudokuSolver.puzzleSize(pu);
        if (!size) return [];
        var current = pu.pu_q.irregularRegions;
        if (!Array.isArray(current) || current.length !== size * size) {
            current = SudokuSolver.defaultIrregularRegions(size);
        } else {
            var defaults = SudokuSolver.defaultIrregularRegions(size);
            current = current.map(function(value, index) {
                var normalized = String(value === undefined || value === null ? "" : value).trim();
                return normalized || String(defaults[index]);
            });
        }
        pu.pu_q.irregularRegions = current;
        return current;
    }

    function irregularBoundaryEdges(regionIds) {
        return SudokuSolver.irregularBoundaryEdges(pu, regionIds);
    }

    function toroidalEdges(regionIds) {
        if (!SudokuSolver.variantEnabled(pu, "toroidal")) return [];
        var size = SudokuSolver.puzzleSize(pu);
        if (!pu || !size || !Array.isArray(regionIds)) return [];
        var top = Number(pu.space && pu.space[0] || 0);
        var left = Number(pu.space && pu.space[2] || 0);
        var firstRow = 1 + top;
        var firstCol = 1 + left;
        var base = pu.nx0 * pu.ny0;
        var edges = [];
        function outerVertical(row, isLeft) {
            var latticeCol = firstCol + (isLeft ? 0 : size);
            var first = base + (firstRow + row) * pu.nx0 + latticeCol;
            return first + "," + (first + pu.nx0);
        }
        function outerHorizontal(col, isTop) {
            var first = base + (firstRow + (isTop ? 0 : size)) * pu.nx0 + firstCol + col;
            return first + "," + (first + 1);
        }
        for (var row = 0; row < size; row++) {
            if (String(regionIds[row * size + 0]) === String(regionIds[row * size + size - 1])) {
                edges.push(outerVertical(row, true));
                edges.push(outerVertical(row, false));
            }
        }
        for (var col = 0; col < size; col++) {
            if (String(regionIds[0 * size + col]) === String(regionIds[(size - 1) * size + col])) {
                edges.push(outerHorizontal(col, true));
                edges.push(outerHorizontal(col, false));
            }
        }
        return edges;
    }

    function redrawIrregularBoundaries() {
        if (!pu || !pu.pu_q || !pu.pu_q.lineE) return;
        var size = SudokuSolver.puzzleSize(pu);
        var oldEdges = Array.isArray(pu.pu_q.irregularRegionEdges) ?
            pu.pu_q.irregularRegionEdges : irregularBoundaryEdges(SudokuSolver.defaultIrregularRegions(size));
        oldEdges.forEach(function(edge) {
            if (pu.pu_q.lineE[edge] === 2) delete pu.pu_q.lineE[edge];
        });

        var oldToroidal = Array.isArray(pu.pu_q.toroidalEdges) ? pu.pu_q.toroidalEdges : [];
        oldToroidal.forEach(function(edge) {
            if (pu.pu_q.deletelineE[edge] === 1) delete pu.pu_q.deletelineE[edge];
            if (pu.pu_q.lineE[edge] === 80) delete pu.pu_q.lineE[edge];
        });

        var regionIds = ensureIrregularRegions();
        var newEdges = irregularBoundaryEdges(regionIds);
        newEdges.forEach(function(edge) { pu.pu_q.lineE[edge] = 2; });
        pu.pu_q.irregularRegionEdges = newEdges;

        var newToroidal = toroidalEdges(regionIds);
        newToroidal.forEach(function(edge) {
            pu.pu_q.deletelineE[edge] = 1;
            pu.pu_q.lineE[edge] = 80;
        });
        pu.pu_q.toroidalEdges = newToroidal;

        SudokuSolver.invalidateCandidateAnalysis();
        pu.redraw();
    }

    function removeIrregularEditor() {
        var overlay = byId("sudoku-irregular-region-editor");
        if (overlay && overlay.parentNode) overlay.parentNode.removeChild(overlay);
        var host = byId("dvique");
        if (host) host.classList.remove("irregular-editing");
    }

    function renderIrregularEditor() {
        removeIrregularEditor();
        if (!pu || !pu.irregular_mode || pu.mode.qa !== "pu_q") return;
        var host = byId("dvique");
        var canvas = byId("canvas");
        var size = SudokuSolver.puzzleSize(pu);
        var regions = ensureIrregularRegions();
        if (!host || !canvas || !size || !regions.length) return;
        host.classList.add("irregular-editing");
        var overlay = document.createElement("div");
        overlay.id = "sudoku-irregular-region-editor";
        overlay.className = "irregular-region-editor";
        overlay.setAttribute("aria-label", "Irregular Sudoku region numbers");
        overlay.addEventListener("pointerdown", function(event) {
            // Own the whole board while region IDs are being edited. This
            // prevents clicks between inputs from reaching the previous
            // Penpa drawing mode.
            event.preventDefault();
            event.stopPropagation();
        });
        overlay.style.width = canvas.style.width || canvas.width + "px";
        overlay.style.height = canvas.style.height || canvas.height + "px";
        regions.forEach(function(regionId, index) {
            var row = (index / size) | 0;
            var col = index % size;
            var point = pu.point[SudokuSolver.cellKey(pu, row, col)];
            if (!point) return;
            var input = document.createElement("input");
            input.type = "text";
            input.inputMode = "numeric";
            input.pattern = "[0-9]*";
            input.maxLength = 3;
            input.value = String(regionId);
            input.setAttribute("aria-label", "Region number for row " + (row + 1) + ", column " + (col + 1));
            input.style.left = point.x + "px";
            input.style.top = point.y + "px";
            input.style.width = Math.max(24, pu.size * 0.72) + "px";
            input.style.height = Math.max(24, pu.size * 0.72) + "px";
            input.style.fontSize = Math.max(16, pu.size * 0.42) + "px";
            input.addEventListener("pointerdown", function(event) { event.stopPropagation(); });
            input.addEventListener("input", function() {
                input.value = input.value.replace(/\D/g, "").slice(0, 3);
                pu.pu_q.irregularRegions[index] = input.value;
                SudokuSolver.invalidateCandidateAnalysis();
            });
            input.addEventListener("blur", function() {
                if (!input.value) {
                    input.value = String(SudokuSolver.defaultIrregularRegions(size)[index]);
                    pu.pu_q.irregularRegions[index] = input.value;
                }
            });
            input.addEventListener("keydown", function(event) {
                event.stopPropagation();
                var offset = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" || event.key === "Enter" ? 1 :
                    event.key === "ArrowUp" ? -size : event.key === "ArrowDown" ? size : 0;
                if (!offset) return;
                event.preventDefault();
                var inputs = overlay.querySelectorAll("input");
                var next = Math.max(0, Math.min(inputs.length - 1, index + offset));
                inputs[next].focus();
                inputs[next].select();
            });
            overlay.appendChild(input);
        });
        host.appendChild(overlay);
        var first = overlay.querySelector("input");
        if (first) window.setTimeout(function() { first.focus(); first.select(); }, 0);
    }

    function enterIrregularEditor(variant) {
        if (!pu || !SudokuSolver.puzzleSize(pu)) return;
        variant = ["irregular", "scattered", "deficit", "surplus", "toroidal"].indexOf(variant) !== -1 ? variant :
            (["irregular", "scattered", "deficit", "surplus", "toroidal"].indexOf(pu.activeSudokuVariant) !== -1 ?
                pu.activeSudokuVariant : "irregular");
        addVariant(variant);
        ensureIrregularRegions();
        pu.activeSudokuVariant = variant;
        pu.regionEditorVariant = variant;
        pu.irregular_mode = true;
        renderVariantTools();
    }

    function finishIrregularEditor() {
        if (typeof pu === "undefined" || !pu || !pu.irregular_mode) return;
        pu.irregular_mode = false;
        removeIrregularEditor();
        redrawIrregularBoundaries();
        applyMode("classic", "sudoku", "1", "");
        renderVariantTools();
    }

    function ensureWindokuCages() {
        if (!pu || SudokuSolver.puzzleSize(pu) !== 9) return;
        [[1, 1], [1, 5], [5, 1], [5, 5]].forEach(function(start) {
            for (var row = 0; row < 3; row++) {
                for (var col = 0; col < 3; col++) {
                    var cell = SudokuSolver.cellKey(pu, start[0] + row, start[1] + col);
                    if (pu.pu_q.surface === undefined) pu.pu_q.surface = {};
                    if (pu.pu_q.surface[cell] === undefined || pu.pu_q.surface[cell] === 0) {
                        pu.set_value("surface", cell, 1, null);
                    }
                }
            }
        });
    }

    function ensureOneFiveNine() {
        if (!pu || SudokuSolver.puzzleSize(pu) !== 9) return;
        var cols = [0, 4, 8];
        for (var row = 0; row < 9; row++) {
            for (var i = 0; i < cols.length; i++) {
                var col = cols[i];
                var cell = SudokuSolver.cellKey(pu, row, col);
                if (pu.pu_q.surface === undefined) pu.pu_q.surface = {};
                if (pu.pu_q.surface[cell] === undefined || pu.pu_q.surface[cell] === 0) {
                    pu.set_value("surface", cell, 1, null);
                }
            }
        }
    }

    function renderVariantTools() {
        var toolbar = byId("sudoku-variant-tools");
        if (!toolbar || typeof penpa_constraints === "undefined") {
            return;
        }
        discoverVariantsFromBoard();
        syncDiagonalLines();
        toolbar.innerHTML = "";
        if (pu && pu.irregular_mode) {
            var editingVariant = pu.regionEditorVariant || "irregular";
            var editorGroup = document.createElement("span");
            editorGroup.className = "sudoku-variant-group irregular-editor-tools";
            editorGroup.dataset.variant = editingVariant;
            var editorTitle = document.createElement("span");
            editorTitle.className = "sudoku-variant-title";
            editorTitle.textContent = variantLabel(editingVariant);
            editorGroup.appendChild(editorTitle);
            var finish = document.createElement("button");
            finish.type = "button";
            finish.className = "button sudoku-tool-button sudoku-variant-mode active";
            finish.dataset.variant = editingVariant;
            finish.dataset.mode = "irregular";
            finish.dataset.submode = "regions";
            finish.textContent = "Finish regions";
            finish.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                finishIrregularEditor();
            });
            editorGroup.appendChild(finish);
            toolbar.appendChild(editorGroup);
            renderIrregularEditor();
            return;
        }
        var expandedAccordions = window.expandedVariantAccordions || (window.expandedVariantAccordions = {});

        function getVariantRule(variant) {
            if (window.SudokuSolverRuleText && window.SudokuSolverRuleText[variant]) {
                return window.SudokuSolverRuleText[variant];
            }
            if (typeof penpa_constraints !== "undefined" && penpa_constraints.setting && penpa_constraints.setting[variant] && penpa_constraints.setting[variant].rule) {
                return penpa_constraints.setting[variant].rule;
            }
            return "This variant applies its custom CSP constraint to the grid.";
        }

        function getVariantIcon(variant) {
            var icons = {
                "classic": "∅",
                "odd even": "∅",
                "diagonal": "∅",
                "anti diagonal": "∅",
                "anti king": "∅",
                "anti knight": "∅",
                "non consecutive": "∅",
                "arrow": "╱",
                "thermo": "╱",
                "palindrome": "╱",
                "killer": "▧",
                "24trio": "▧",
                "24-trio": "▧",
                "kropki": "⊟",
                "doublekropki": "⊟",
                "xv": "⊟",
                "battenburg": "⊟",
                "skyscraper": "↘",
                "sandwich": "↘",
                "starproduct": "□",
                "sudokuwithstars": "□",
                "irregular": "◩",
                "scattered": "◩",
                "deficit": "◩",
                "surplus": "◩",
                "toroidal": "◩"
            };
            return icons[variant] || "∅";
        }

        var isZeroEight = ["0to8", "08arrow", "08skyscrapers"].some(function(v) { return activeVariants().indexOf(v) !== -1; });
        var isSudokuWithStars = activeVariants().indexOf("sudokuwithstars") !== -1;
        var sudokuGroup = document.createElement("div");
        sudokuGroup.className = "sudoku-variant-group" + (expandedAccordions["classic"] ? " is-expanded" : "");
        sudokuGroup.dataset.variant = "classic";

        var sudokuHeader = document.createElement("div");
        sudokuHeader.className = "sudoku-variant-header";
        var sudokuChevron = document.createElement("span");
        sudokuChevron.className = "variant-accordion-chevron";
        sudokuChevron.textContent = expandedAccordions["classic"] ? "▼" : "▶";
        var sudokuIcon = document.createElement("span");
        sudokuIcon.className = "variant-accordion-icon";
        sudokuIcon.textContent = getVariantIcon("classic");
        var sudokuTitle = document.createElement("span");
        sudokuTitle.className = "sudoku-variant-title";
        sudokuTitle.textContent = isZeroEight ? "0-8 Sudoku" : "Classic";
        sudokuHeader.appendChild(sudokuChevron);
        sudokuHeader.appendChild(sudokuIcon);
        sudokuHeader.appendChild(sudokuTitle);

        var sudokuRow = document.createElement("div");
        sudokuRow.className = "sudoku-variant-row";

        var sudokuButton = document.createElement("button");
        sudokuButton.type = "button";
        sudokuButton.className = "button sudoku-tool-button sudoku-variant-mode";
        sudokuButton.dataset.mode = "sudoku";
        sudokuButton.dataset.submode = "1";
        sudokuButton.textContent = isZeroEight ? "0-8" : (isSudokuWithStars ? "1-7 + ★" : "Number");
        sudokuButton.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            applyMode("classic", "sudoku", "1", "");
        });
        sudokuRow.appendChild(sudokuButton);
        sudokuHeader.appendChild(sudokuRow);

        var sudokuRule = document.createElement("div");
        sudokuRule.className = "sudoku-variant-rule";
        sudokuRule.style.display = expandedAccordions["classic"] ? "block" : "none";
        var sudokuRuleText = document.createElement("p");
        sudokuRuleText.className = "variant-rule-text";
        sudokuRuleText.textContent = "Place a digit from 1 to 9 (or grid size) into each cell so that every row, column and region contains each digit exactly once.";
        sudokuRule.appendChild(sudokuRuleText);

        sudokuHeader.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            expandedAccordions["classic"] = !expandedAccordions["classic"];
            sudokuGroup.classList.toggle("is-expanded", expandedAccordions["classic"]);
            sudokuChevron.textContent = expandedAccordions["classic"] ? "▼" : "▶";
            sudokuRule.style.display = expandedAccordions["classic"] ? "block" : "none";
        });

        sudokuGroup.appendChild(sudokuHeader);
        sudokuGroup.appendChild(sudokuRule);
        toolbar.appendChild(sudokuGroup);

        activeVariants().forEach(function(variant) {
            if (variant === "classic") {
                return;
            }
            var isRegionGridVariant = ["irregular", "scattered", "deficit", "surplus", "toroidal"].indexOf(variant) !== -1;
            var setting = penpa_constraints.setting[variant];
            var group = document.createElement("div");
            group.className = "sudoku-variant-group" + (expandedAccordions[variant] ? " is-expanded" : "");
            group.dataset.variant = variant;

            var header = document.createElement("div");
            header.className = "sudoku-variant-header";
            var chevron = document.createElement("span");
            chevron.className = "variant-accordion-chevron";
            chevron.textContent = expandedAccordions[variant] ? "▼" : "▶";
            var iconSpan = document.createElement("span");
            iconSpan.className = "variant-accordion-icon";
            iconSpan.textContent = getVariantIcon(variant);
            var title = document.createElement("span");
            title.className = "sudoku-variant-title";
            title.textContent = variantLabel(variant);
            header.appendChild(chevron);
            header.appendChild(iconSpan);
            header.appendChild(title);

            var row = document.createElement("div");
            row.className = "sudoku-variant-row";

            if (isRegionGridVariant) {
                addVariantModeButton(row, variant, "irregular", "regions", "");
                if (variant === "scattered") {
                    addVariantModeButton(row, variant, "surface", "", 1);
                }
            } else if (setting) {
                for (var i = 0; i < setting.modeset.length; i++) {
                    if (setting.modeset[i] === "sudoku") {
                        continue;
                    }
                    addVariantModeButton(row, variant, setting.modeset[i],
                        setting.submodeset[i], setting.styleset[i]);
                }
            }
            if (variant === "kropki" || variant === "doublekropki" || variant === "consecutive" || variant === "xv" || variant === "lc" || variant === "battenburg") {
                var isKropki = variant === "kropki";
                var isDoubleKropki = variant === "doublekropki";
                var isConsecutive = variant === "consecutive";
                var isXV = variant === "xv";
                var isLC = variant === "lc";
                var negative = document.createElement("button");
                negative.id = isKropki ? "sudoku_kropki_negative" :
                    isDoubleKropki ? "sudoku_doublekropki_negative" :
                    isConsecutive ? "sudoku_consecutive_negative" :
                        isXV ? "sudoku_xv_negative" : isLC ? "sudoku_lc_negative" : "sudoku_battenburg_negative";
                negative.type = "button";
                negative.className = "button sudoku-tool-button " +
                    (isKropki ? "sudoku-kropki-negative" : isDoubleKropki ? "sudoku-doublekropki-negative" : isConsecutive ? "sudoku-consecutive-negative" : isXV ? "sudoku-xv-negative" :
                        isLC ? "sudoku-lc-negative" : "sudoku-battenburg-negative");
                negative.title = isKropki ?
                    "Apply the negative Kropki rule to every undotted orthogonal edge" :
                    isDoubleKropki ? "Apply the negative Double Kropki rule to every undotted orthogonal edge" :
                    isConsecutive ? "Require every unmarked orthogonal edge to be non-consecutive" :
                    isXV ? "Apply the negative XV rule to every unmarked orthogonal edge" :
                    isLC ? "Apply the negative LC rule to every unmarked orthogonal edge" :
                        "Forbid checkerboard parity around every unmarked four-cell corner";
                negative.setAttribute("aria-label", isKropki ?
                    "Negative Kropki constraint" : isDoubleKropki ? "Negative Double Kropki constraint" : isConsecutive ? "Negative Consecutive constraint" : isXV ? "Negative XV constraint" :
                    isLC ? "Negative LC constraint" : "Negative Battenburg constraint");
                negative.addEventListener("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    if (variant === "kropki") {
                        toggleKropkiNegative();
                    } else if (variant === "doublekropki") {
                        toggleDoubleKropkiNegative();
                    } else if (variant === "consecutive") {
                        toggleConsecutiveNegative();
                    } else if (variant === "xv") {
                        toggleXVNegative();
                    } else if (variant === "lc") {
                        toggleLCNegative();
                    } else {
                        toggleBattenburgNegative();
                    }
                });
                row.appendChild(negative);
            }
            if (row.children.length > 0) {
                header.appendChild(row);
            }
            var close = document.createElement("span");
            close.className = "sudoku-variant-close";
            close.textContent = "\u00d7";
            close.title = "Remove " + variant + " and all of its clues";
            close.setAttribute("aria-label", close.title);
            close.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                removeVariant(variant);
            });
            header.appendChild(close);

            var ruleDiv = document.createElement("div");
            ruleDiv.className = "sudoku-variant-rule";
            ruleDiv.style.display = expandedAccordions[variant] ? "block" : "none";
            var ruleText = document.createElement("p");
            ruleText.className = "variant-rule-text";
            ruleText.textContent = getVariantRule(variant);
            ruleDiv.appendChild(ruleText);

            header.addEventListener("click", function(event) {
                event.preventDefault();
                event.stopPropagation();
                expandedAccordions[variant] = !expandedAccordions[variant];
                group.classList.toggle("is-expanded", expandedAccordions[variant]);
                chevron.textContent = expandedAccordions[variant] ? "▼" : "▶";
                ruleDiv.style.display = expandedAccordions[variant] ? "block" : "none";
            });

            group.appendChild(header);
            group.appendChild(ruleDiv);
            toolbar.appendChild(group);
        });
        if (pu) {
            if (typeof pu.kropkiNegativeConstraint !== "boolean") {
                pu.kropkiNegativeConstraint = false;
            }
            if (typeof pu.doublekropkiNegativeConstraint !== "boolean") {
                pu.doublekropkiNegativeConstraint = false;
            }
            if (typeof pu.consecutiveNegativeConstraint !== "boolean") {
                pu.consecutiveNegativeConstraint = false;
            }
            if (typeof pu.xvNegativeConstraint !== "boolean") {
                pu.xvNegativeConstraint = false;
            }
            if (typeof pu.battenburgNegativeConstraint !== "boolean") {
                pu.battenburgNegativeConstraint = false;
            }
        }
        updateVariantActive();
        updateKropkiNegativeControl();
        updateDoubleKropkiNegativeControl();
        updateConsecutiveNegativeControl();
        updateXVNegativeControl();
        updateLCNegativeControl();
        updateBattenburgNegativeControl();
    }

    function addVariantModeButton(group, variant, mode, submode, style) {
        var button = document.createElement("button");
        button.type = "button";
        button.className = "button sudoku-tool-button sudoku-variant-mode";
        button.dataset.variant = variant;
        button.dataset.mode = mode;
        button.dataset.submode = submode;
        button.textContent = modeLabel(variant, mode, submode);
        button.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            applyMode(variant, mode, submode, style);
        });
        group.appendChild(button);
    }

    function deleteEntries(object, predicate) {
        Object.keys(object || {}).forEach(function(key) {
            if (predicate(object[key], key)) {
                delete object[key];
            }
        });
    }

    function removeVariantElementsFromLayer(layer, colorLayer, variant) {
        if (!layer) {
            return;
        }
        if (variant === "kropki") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && entry[1] === "circle_SS" && (entry[0] === 1 || entry[0] === 2);
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && entry[1] === "circle_SS" && (entry[0] === 1 || entry[0] === 2);
            });
        } else if (variant === "doublekropki") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && entry[1] === "diamond_SS" && (entry[0] === 1 || entry[0] === 2);
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && entry[1] === "diamond_SS" && (entry[0] === 1 || entry[0] === 2);
            });
        } else if (variant === "consecutive") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && entry[1] === "circle_SS" && entry[0] === 1;
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && entry[1] === "circle_SS" && entry[0] === 1;
            });
        } else if (variant === "odd even" || variant === "odd even count" || variant === "odd even bridge") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && (entry[1] === "circle_L" || entry[1] === "square_L");
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && (entry[1] === "circle_L" || entry[1] === "square_L");
            });
        } else if (variant === "odd even sum") {
            // odd even sum can piggyback off cage clear behavior but has no specific delete
        } else if (variant === "battenburg") {
            deleteEntries(layer.symbol, function(entry) {
                return entry && entry[1] === "sudokuetc" && entry[0] === 1;
            });
            deleteEntries(colorLayer && colorLayer.symbol, function(entry) {
                return entry && entry[1] === "sudokuetc" && entry[0] === 1;
            });
        } else if (variant === "windoku") {
            // Windoku owns only its generated window segments; removeVariant()
            // deletes those without disturbing cages belonging to other variants.
        } else if (variant === "average") {
            layer.wall = {};
            if (colorLayer) { colorLayer.wall = {}; }
        } else if (outsideVariants.indexOf(variant) !== -1) {
            deleteEntries(layer.number, function(entry, key) {
                return pu.cellsoutsideFrame && pu.cellsoutsideFrame.includes(Number(key));
            });
            deleteEntries(colorLayer && colorLayer.number, function(entry, key) {
                return pu.cellsoutsideFrame && pu.cellsoutsideFrame.includes(Number(key));
            });
        } else if (variant === "palindrome") {
            deleteEntries(layer.line, function(style) { return style === 5; });
            deleteEntries(colorLayer && colorLayer.line, function(style) { return style === 5; });
        } else if (variant === "xv") {
            deleteEntries(layer.number, function(entry) {
                var value = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
                return value === "X" || value === "V";
            });
            deleteEntries(colorLayer && colorLayer.number, function(entry) {
                var value = entry && entry[0] !== undefined ? entry[0].toString().toUpperCase() : "";
                return value === "X" || value === "V";
            });
        } else if (variant === "arrow") {
            layer.arrows = [];
            if (colorLayer) { colorLayer.arrows = []; }
        } else if (variant === "thermo") {
            layer.thermo = [];
            layer.nobulbthermo = [];
            if (colorLayer) {
                colorLayer.thermo = [];
                colorLayer.nobulbthermo = [];
            }
        } else if (variant === "killer") {
            if (typeof pu.refreshKillerCages === "function") {
                pu.refreshKillerCages(layer === pu.pu_a ? "pu_a" : "pu_q");
            }
            var killerSumKeys = {};
            (layer.killercages || []).forEach(function(cage) {
                (cage || []).forEach(function(cell) {
                    var base = cell + pu.nx0 * pu.ny0;
                    for (var corner = 0; corner < 4; corner++) {
                        killerSumKeys[4 * base + corner] = true;
                    }
                });
            });
            deleteEntries(layer.numberS, function(entry, key) { return !!killerSumKeys[key]; });
            deleteEntries(colorLayer && colorLayer.numberS, function(entry, key) {
                return !!killerSumKeys[key];
            });
            layer.killercages = [];
            layer.cage = {};
            if (colorLayer) {
                colorLayer.killercages = [];
                colorLayer.cage = {};
            }
        } else if (penpa_constraints.setting[variant]) {
            var modes = penpa_constraints.setting[variant].modeset || [];
            if (modes.indexOf("surface") !== -1) {
                layer.surface = {};
                if (colorLayer) colorLayer.surface = {};
            }
            if (modes.indexOf("line") !== -1) {
                deleteEntries(layer.line, function(style) { return style === 5; });
                deleteEntries(colorLayer && colorLayer.line, function(style) { return style === 5; });
            }
            if (modes.indexOf("number") !== -1) {
                deleteEntries(layer.number, function(entry, key) {
                    return !(pu.centerlist || []).includes(Number(key)) || !entry || entry[2] !== "1";
                });
                deleteEntries(colorLayer && colorLayer.number, function(entry, key) {
                    return !(pu.centerlist || []).includes(Number(key)) || !entry || entry[2] !== "1";
                });
            }
            if (modes.indexOf("symbol") !== -1) {
                layer.symbol = {};
                if (colorLayer) colorLayer.symbol = {};
            }
            if (modes.indexOf("cage") !== -1) {
                layer.cage = {};
                layer.killercages = [];
                if (colorLayer) { colorLayer.cage = {}; colorLayer.killercages = []; }
            }
            if (modes.indexOf("special") !== -1) {
                layer.thermo = [];
                layer.nobulbthermo = [];
                layer.arrows = [];
                if (colorLayer) { colorLayer.thermo = []; colorLayer.nobulbthermo = []; colorLayer.arrows = []; }
            }
        }
    }

    function shrinkOutsideSpace() {
        if (!pu || !Array.isArray(pu.space)) return;
        var operations = ["resize_top", "resize_bottom", "resize_left", "resize_right"];
        operations.forEach(function(operation, index) {
            var remaining = Number(pu.space[index] || 0);
            while (remaining-- > 0 && typeof pu[operation] === "function") {
                pu[operation](-1, "white");
            }
        });
    }

    function removeVariant(variant) {
        if (!pu || variant === "classic") {
            return;
        }
        SudokuSolver.invalidateCandidateAnalysis();
        removeVariantElementsFromLayer(pu.pu_q, pu.pu_q_col, variant);
        removeVariantElementsFromLayer(pu.pu_a, pu.pu_a_col, variant);
        pu.activeSudokuVariants = activeVariants().filter(function(active) {
            return active !== variant;
        });
        if (["0to8", "08arrow", "08skyscrapers"].indexOf(variant) !== -1 && !["0to8", "08arrow", "08skyscrapers"].some(function(v) { return activeVariants().indexOf(v) !== -1; })) {
            [pu.pu_q.number, pu.pu_a.number].forEach(function(layer) {
                if (!layer) return;
                Object.keys(layer).forEach(function(key) {
                    if (layer[key] && String(layer[key][0]).trim() === "0") delete layer[key];
                });
            });
        }
        syncDiagonalLines();
        if (variant === "kropki") {
            pu.kropkiNegativeConstraint = false;
        } else if (variant === "doublekropki") {
            pu.doublekropkiNegativeConstraint = false;
        } else if (variant === "consecutive") {
            pu.consecutiveNegativeConstraint = false;
        } else if (variant === "xv") {
            pu.xvNegativeConstraint = false;
        } else if (variant === "battenburg") {
            pu.battenburgNegativeConstraint = false;
        } else if (variant === "argyle") {
            argyleLineKeys(pu).forEach(function(key) {
                if (pu.pu_q && pu.pu_q.lineE && pu.pu_q.lineE[key] === 12) {
                    delete pu.pu_q.lineE[key];
                }
            });
            syncDiagonalLines();
        } else if (variant === "windoku") {
            [[1, 1], [1, 5], [5, 1], [5, 5]].forEach(function(start) {
                for (var row = 0; row < 3; row++) {
                    for (var col = 0; col < 3; col++) {
                        var cell = SudokuSolver.cellKey(pu, start[0] + row, start[1] + col);
                        if (pu.pu_q.surface !== undefined) delete pu.pu_q.surface[cell];
                    }
                }
            });
            if (typeof pu.refreshKillerCages === "function") pu.refreshKillerCages("pu_q");
        } else if (variant === "onefivenine") {
            var cols = [0, 4, 8];
            for (var row = 0; row < 9; row++) {
                for (var i = 0; i < cols.length; i++) {
                    var col = cols[i];
                    var cell = SudokuSolver.cellKey(pu, row, col);
                    if (pu.pu_q.surface !== undefined) delete pu.pu_q.surface[cell];
                }
            }
        } else if (["irregular", "scattered", "deficit", "surplus", "toroidal"].indexOf(variant) !== -1 &&
            !activeVariants().some(function(active) {
                return ["irregular", "scattered", "deficit", "surplus", "toroidal"].indexOf(active) !== -1;
            })) {
            removeIrregularEditor();
            pu.irregular_mode = false;
            pu.regionEditorVariant = null;
            var irregularEdges = Array.isArray(pu.pu_q.irregularRegionEdges) ?
                pu.pu_q.irregularRegionEdges : [];
            irregularEdges.forEach(function(edge) {
                if (pu.pu_q.lineE[edge] === 2) delete pu.pu_q.lineE[edge];
            });
            var oldToroidal = Array.isArray(pu.pu_q.toroidalEdges) ? pu.pu_q.toroidalEdges : [];
            oldToroidal.forEach(function(edge) {
                if (pu.pu_q.deletelineE[edge] === 1) delete pu.pu_q.deletelineE[edge];
                if (pu.pu_q.lineE[edge] === 80) delete pu.pu_q.lineE[edge];
            });
            var size = SudokuSolver.puzzleSize(pu);
            irregularBoundaryEdges(SudokuSolver.defaultIrregularRegions(size)).forEach(function(edge) {
                pu.pu_q.lineE[edge] = 2;
            });
            delete pu.pu_q.irregularRegions;
            delete pu.pu_q.irregularRegionEdges;
            delete pu.pu_q.toroidalEdges;
        }
        pu.activeSudokuVariant = "classic";
        pu.kropki_mode = false;
        pu.consecutive_mode = false;
        pu.sudoku_directional_cell_mode = false;
        pu.xv_mode = false;
        pu.odd_even_mode = false;
        pu.battenburg_mode = false;
        if (outsideVariants.indexOf(variant) !== -1 ||
            (penpa_constraints.setting[variant] && penpa_constraints.setting[variant].outside)) {
            shrinkOutsideSpace();
        }
        var select = byId("constraints_settings_opt");
        if (select) {
            select.value = "classic";
        }
        renderVariantTools();
        applyMode("classic", "sudoku", "1", "");
        pu.redraw();
    }

    function resetForNewGrid() {
        SudokuTools.autoEnabled = false;
        SudokuTools.solveOnceAutoEnabled = false;
        stopSolveOnceCheck();
        SudokuSolver.cancelCandidateAnalysis();
        SudokuSolver.invalidateCandidateAnalysis();
        if (pu) {
            pu.activeSudokuVariants = ["classic"];
            pu.activeSudokuVariant = "classic";
            pu.kropki_mode = false;
            pu.consecutive_mode = false;
            pu.sudoku_directional_cell_mode = false;
            pu.xv_mode = false;
            pu.odd_even_mode = false;
            pu.battenburg_mode = false;
            pu.kropkiNegativeConstraint = false;
            pu.doublekropkiNegativeConstraint = false;
            pu.consecutiveNegativeConstraint = false;
            pu.xvNegativeConstraint = false;
            pu.battenburgNegativeConstraint = false;
            pu.irregular_mode = false;
            pu.regionEditorVariant = null;
            removeIrregularEditor();
        }
        var select = byId("constraints_settings_opt");
        if (select) {
            select.value = "classic";
        }
        setToolbarState();
    }

    function variantChanged() {
        var variant = selectedVariant();
        if (variant === "windoku" && SudokuSolver.puzzleSize(pu) !== 9) {
            var sizeSelect = byId("constraints_settings_opt");
            if (sizeSelect) sizeSelect.value = "classic";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Windoku requires 9 × 9", text: "Create or resize the grid to 9 × 9 first." });
            }
            return;
        }
        if (variant === "argyle" && SudokuSolver.puzzleSize(pu) !== 9) {
            var sizeSelectArgyle = byId("constraints_settings_opt");
            if (sizeSelectArgyle) sizeSelectArgyle.value = "classic";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Argyle requires 9 × 9", text: "Create or resize the grid to 9 × 9 first." });
            }
            return;
        }
        if (variant === "onefivenine" && SudokuSolver.puzzleSize(pu) !== 9) {
            var sizeSelectOneFiveNine = byId("constraints_settings_opt");
            if (sizeSelectOneFiveNine) sizeSelectOneFiveNine.value = "classic";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "One-five-nine requires 9 × 9", text: "Create or resize the grid to 9 × 9 first." });
            }
            return;
        }
        var conflict = variantConflict(variant);
        if (conflict) {
            var rejectedSelect = byId("constraints_settings_opt");
            if (rejectedSelect) rejectedSelect.value = "classic";
            if (typeof Swal !== "undefined") {
                Swal.fire({ icon: "warning", title: "Conflicting variants", text: conflict });
            }
            renderVariantTools();
            return;
        }
        addVariant(variant);
        if (pu) pu.activeSudokuVariant = variant;
        if (variant === "windoku") ensureWindokuCages();
        if (variant === "onefivenine") ensureOneFiveNine();
        if (["irregular", "scattered", "deficit", "surplus", "toroidal"].indexOf(variant) !== -1) {
            SudokuSolver.invalidateCandidateAnalysis();
            enterIrregularEditor(variant);
            return;
        }
        syncDiagonalLines();

        SudokuSolver.invalidateCandidateAnalysis();
        renderVariantTools();
        if (variant === "classic") {
            applyMode("classic", "sudoku", "1", "");
        } else {
            var setting = penpa_constraints.setting[variant];
            var modeIndex = setting ? setting.modeset.findIndex(function(mode) {
                return mode !== "sudoku";
            }) : -1;
            if (modeIndex >= 0) {
                applyMode(variant, setting.modeset[modeIndex], setting.submodeset[modeIndex],
                    setting.styleset[modeIndex]);
            } else {
                activateVariantRule(variant);
            }
        }
        if (pu) {
            pu.redraw();
        }
    }

    function guardKeyboardWhileRunning(event) {
        if (!document.body.classList.contains("sudoku-solver-running")) return;
        if (event.code === "Space") {
            event.preventDefault();
            event.stopImmediatePropagation();
            stopWork();
            return;
        }
        var target = event.target;
        if (target && target.closest && target.closest("input, textarea, select, [contenteditable='true']")) return;
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    function init() {
        if (initialized) {
            setToolbarState();
            return;
        }
        initialized = true;
        window.addEventListener("keydown", guardKeyboardWhileRunning, true);
        var actions = {
            sudoku_reset: function() {
                SudokuTools.autoEnabled = false;
                SudokuSolver.cancelCandidateAnalysis();
                SudokuSolver.invalidateCandidateAnalysis();
                SudokuSolver.showConflict(pu, null);
                var removed = SudokuSolver.clearAutoSolution(pu);
                setToolbarState();
                if (!removed && pu) pu.redraw();
            },
            sudoku_undo: function() { pu.undo(); },
            sudoku_redo: function() { pu.redo(); },
            sudoku_keypad: function() {
                UserSettings.panel_shown = !UserSettings.panel_shown;
            },
            sudoku_auto_solver: toggleAuto,
            sudoku_solve_once: solveOnce,
            sudoku_solve_clear: function() {
                var removed = SudokuSolver.clearAutoSolution(pu);
                if (!removed && pu) pu.redraw();
            },
            sudoku_load_test_board: loadTestBoard,
            sudoku_kropki_negative: toggleKropkiNegative,
            sudoku_doublekropki_negative: toggleDoubleKropkiNegative,
            sudoku_consecutive_negative: toggleConsecutiveNegative,
            sudoku_xv_negative: toggleXVNegative,
            sudoku_lc_negative: toggleLCNegative,
            sudoku_battenburg_negative: toggleBattenburgNegative
        };
        Object.keys(actions).forEach(function(id) {
            var element = byId(id);
            if (element) {
                element.addEventListener("click", function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    actions[id]();
                });
            }
        });
        setToolbarState();
    }

    return {
        autoEnabled: false,
        solveOnceAutoEnabled: false,
        init: init,
        setToolbarState: setToolbarState,
        renderVariantTools: renderVariantTools,
        variantChanged: variantChanged,
        resetForNewGrid: resetForNewGrid,
        enterIrregularEditor: enterIrregularEditor,
        finishIrregularEditor: finishIrregularEditor,
        generatePuzzle: generatePuzzle,
        pauseGenerator: pauseGenerator,
        stopWork: stopWork,
        scheduleSolveOnceCheck: scheduleSolveOnceCheck
    };
})();

if (typeof window !== "undefined") {
    window.SudokuSolver = SudokuSolver;
    window.SudokuTools = SudokuTools;
}

if (typeof module !== "undefined" && module.exports) {
    module.exports = SudokuSolver;
}
