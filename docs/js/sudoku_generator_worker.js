/* Puzzle generation worker: uniqueness checks never block Penpa's canvas. */
importScripts("./sudoku_csp.js", "./sudoku_csp_variants/browser.js", "./sudoku_generator.js");

self.onmessage = function(event) {
    if (!event.data || event.data.type !== "generate") return;
    try {
        var result = SudokuGenerator.generate({
            size: event.data.size,
            variant: event.data.variant,
            variants: event.data.variants,
            negative: event.data.negative,
            sourceBoard: event.data.sourceBoard,
            sourceConstraints: event.data.sourceConstraints,
            preserveExisting: event.data.preserveExisting,
            seed: event.data.seed,
            onProgress: function(progress) {
                self.postMessage({ type: "progress", progress: progress });
            }
        });
        self.postMessage({ type: "result", result: result });
    } catch (error) {
        self.postMessage({ type: "error", message: error && error.message ? error.message : String(error) });
    }
};
