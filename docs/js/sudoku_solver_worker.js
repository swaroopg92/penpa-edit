/* CSP analysis worker: keeps recursive search off the UI thread. */
var workerAssetQuery = self.location && self.location.search || "";
function importWorkerAsset(path) {
    var lastError;
    for (var attempt = 0; attempt < 3; attempt++) {
        try {
            var separator = workerAssetQuery ? "&" : "?";
            importScripts(path + workerAssetQuery + (attempt ? separator + "asset_retry=" + attempt + "_" + Date.now() : ""));
            return;
        } catch (error) {
            lastError = error;
        }
    }
    throw lastError;
}
["./sudoku_csp.js", "./sudoku_csp_variants/browser.js", "./sudoku_variants/browser.js"].forEach(importWorkerAsset);

self.onmessage = async function(event) {
    if (!event.data || (event.data.type !== "analyze" && event.data.type !== "solve")) return;
    try {
        if (event.data.type === "solve") {
            self.postMessage({ type: "result", result: SudokuCSP.solve(
                event.data.board, event.data.constraints
            ) });
            return;
        }
        var result = await SudokuCSP.getCandidatesAsync(
            event.data.board,
            event.data.constraints,
            {
                seedSolutions: event.data.seedSolutions || [],
                onProgress: function(progress) {
                    self.postMessage({ type: "progress", progress: progress });
                }
            }
        );
        self.postMessage({ type: "result", result: result });
    } catch (error) {
        self.postMessage({
            type: "error",
            message: error && error.message ? error.message : String(error)
        });
    }
};
