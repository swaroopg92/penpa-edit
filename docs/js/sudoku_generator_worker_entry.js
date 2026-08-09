/* Entry point appended to the self-contained puzzle-generation worker bundle. */
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
            symmetry: event.data.symmetry,
            minimal: event.data.minimal,
            extraClues: event.data.extraClues,
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
