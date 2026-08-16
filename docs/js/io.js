class IO {
    /**
     * Estimated "URI too long" limit to use when checking for a URI's length after generating an
     * export link.
     */
    MAX_URI_LENGTH = 8000;

    /**
     * Attempts to get the puzzle data from the URL passed in.
     *
     * @param {string} loadUrl URL to attempt to parse for puzzle data.
     */
    getPuzzleDataFromUrl = function (loadUrl) {
        const urlAsUrl = new URL(loadUrl);
        let puzzleData;

        if (loadUrl.includes("#")) {
            puzzleData = urlAsUrl.hash.split("#")[1];
        } else {
            puzzleData = urlAsUrl.search.split("?")[1];
        }

        return puzzleData;
    };
};

const PenpaIO = new IO();