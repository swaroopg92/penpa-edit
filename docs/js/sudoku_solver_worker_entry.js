/* Entry point appended to the self-contained CSP-analysis worker bundle. */
self.onmessage = async function(event) {
    if (!event.data || (event.data.type !== "analyze" && event.data.type !== "solve")) return;
    try {
        if (event.data.type === "solve") {
            self.postMessage({ type: "result", result: SudokuCSP.solve(event.data.board, event.data.constraints) });
            return;
        }
        var result = await SudokuCSP.getCandidatesAsync(event.data.board, event.data.constraints, {
            seedSolutions: event.data.seedSolutions || [],
            onProgress: function(progress) {
                self.postMessage({ type: "progress", progress: progress });
            }
        });
        self.postMessage({ type: "result", result: result });
    } catch (error) {
        self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
    }
};
