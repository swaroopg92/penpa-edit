/**
 * @class PenpaProgress
 * 
 * Abstracted logic for saving and loading progress from browser local storage.
 * 
 * In future updates, this can be used to simplify migrating progress
 * saving to indexeddb or something similar.
 */
const PenpaProgress = {
    _localStorageAvailable: undefined,

    /**
     * Helper that returns whether progress can be saved locally.
     * 
     * Essentially just a fancy wrapper for the original localstorage check but will
     * eventually also check indexeddb. 
     * 
     * @returns {boolean} Returns true if progress can be saved.
     */
    canSaveProgress: function () {
        if (this._localStorageAvailable === undefined) {
            try {
                if (window.localStorage) {
                    window.localStorage.setItem('test', 123);
                    this._localStorageAvailable = (window.localStorage.getItem('test') === "123");
                    window.localStorage.removeItem('test');
                } else {
                    this._localStorageAvailable = false;
                    console.warn("PenpaProgress.canSaveProgress(): Local storage is not available.");
                }
            } catch (e) {
                this._localStorageAvailable = false;
                console.warn("PenpaProgress.canSaveProgress(): Local storage seems to not be available.");
            }
        }
        return this._localStorageAvailable;
    },

    /**
     * Helper that checks if local storage is supported and updates the UI if it isn't.
     */
    updateLocalSaveUI: function () {
        if (!this.canSaveProgress()) {
            document.getElementById('allow_local_storage').classList.add('is_hidden');
            document.getElementById('clear_storage_one').classList.add('is_hidden');
            document.getElementById('clear_storage_all').classList.add('is_hidden');
            document.getElementById('local_storage_browser_message').classList.remove('is_hidden');
        }
    },

    /**
     * Helper that returns the current puzzle's hash.
     * 
     * @param {string} urlToHash URL to use in the hash.
     * @returns {string} Puzzle URL hash.
     */
    getHash: function (urlToHash) {
        if (urlToHash.length <= 0) {
            console.error("PenpaProgress.getHash(): Cannot hash empty URL.");
            return null;
        }

        return "penpa_" + md5(urlToHash);
    },

    /**
     * Attempts to save the current puzzle progress to local storage.
     */    
    save: function () {
        // Auto-save tab state in browser history if requested
        if (UserSettings.auto_save_history) {
            duplicate(true);
        }

        // Save puzzle progress
        if (this._localStorageAvailable &&
            pu.url.length !== 0 &&
            pu.mmode === "solve" &&
            UserSettings.save_current_puzzle &&
            !pu.replay) {
                
            // get md5 hash for unique id
            const hash = this.getHash(pu.url);

            // generate duplicate link
            const rstr = pu.maketext_duplicate() + "&l=solvedup";

            // Wrapping in try/catch may prevent the app from locking up and acting
            // badly when the limit is reached, but there will likely need to be
            // improved UI around this happening to let the user know, plus some
            // guidance for users to prevent it from filling up in the first place.
            try {
                localStorage.setItem(hash, rstr);
            } catch (err) {
                console.error("PenpaProgress.save(): Could not save to local storage:", err);
            }

        }
    },

    /**
     * Checks if local storage is available. If it is, attempts to load the puzzle progress.
     * 
     * @param {string} puzzleHash Hash of the puzzle we would like to load.
     * @returns {string|undefined} Puzzle data if available.
     */
    tryLoad: function (puzzleHash) {
        if (this._localStorageAvailable) {
            return localStorage.getItem(puzzleHash);
        }
    },

    /**
     * Clears a puzzle's local progress if saved.
     * 
     * @param {string} puzzleHash Hash of the puzzle we would like to load.
     */
    clearPuzzle: function (puzzleHash) {
        if (this._localStorageAvailable) {
            localStorage.removeItem(puzzleHash);
        }
    },

    /**
     * Clears all local progress for puzzles.
     */
    clearAllPuzzles: function () {
        if (this._localStorageAvailable) {
            Object.keys(localStorage).forEach(key => {
                if (key.includes("penpa")) {
                    localStorage.removeItem(key);
                }
            });
            // localStorage.clear(); for all clear
        }
    }
};