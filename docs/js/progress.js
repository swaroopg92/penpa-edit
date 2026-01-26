/**
 * @class PenpaProgress
 *
 * Abstracted logic for saving and loading progress from browser local storage and/or
 * IndexedDb or WebSQL using LocalForage.
 */
const PenpaProgress = {
    _localStorageAvailable: undefined,

    /**
     * Helper that returns whether progress can be saved locally.
     *
     * @returns {boolean} Returns true if progress can be saved.
     */
    canSaveProgress: async function () {
        const me = this;

        if (me._localStorageAvailable === undefined) {
            try {
                if (window.localforage) {
                    await window.localforage.setItem('test', 123);
                    let testValue = await window.localforage.getItem('test');
                    me._localStorageAvailable = (String(testValue) === "123");
                    window.localforage.removeItem('test');
                } else {
                    me._localStorageAvailable = false;
                    console.warn("PenpaProgress.canSaveProgress(): Local storage is not available.");
                }
            } catch (e) {
                me._localStorageAvailable = false;
                console.warn("PenpaProgress.canSaveProgress(): Local storage seems to not be available.");
            }
        }
        return me._localStorageAvailable;
    },

    /**
     * Helper that checks if local storage is supported and updates the UI if it isn't.
     */
    updateLocalSaveUI: async function () {
        const canSave = await this.canSaveProgress();
        if (!canSave) {
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

        const hash = "penpa_" + md5(urlToHash);
        return hash;
    },

    /**
     * Attempts to save the current puzzle progress to local storage.
     */
    save: async function () {
        // Auto-save tab state in browser history if requested
        if (UserSettings.auto_save_history) {
            duplicate(true);
        }

        // Save puzzle progress
        const canSave = await this.canSaveProgress();
        if (canSave &&
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
                localforage.setItem(hash, rstr);
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
    tryLoad: async function (puzzleHash) {
        let result;
        const canSave = await this.canSaveProgress();
        if (canSave) {
            // Check if newer storage method contains save.
            result = await localforage.getItem(puzzleHash);
            if (result) {
                return result;
            }
            // As a fallback, check localStorage
            return localStorage.getItem(puzzleHash);
        }
    },

    /**
     * Clears a puzzle's local progress if saved.
     *
     * @param {string} puzzleHash Hash of the puzzle we would like to load.
     */
    clearPuzzle: async function (puzzleHash) {
        const canSave = await this.canSaveProgress();
        if (canSave) {
            localStorage.removeItem(puzzleHash);
            localforage.removeItem(puzzleHash);
        }
    },

    /**
     * Clears all local progress for puzzles.
     */
    clearAllPuzzles: async function () {
        const canSave = await this.canSaveProgress();
        if (canSave) {
            // LocalForage keys
            const lfKeys = await localforage.keys();
            lfKeys.forEach(key => {
                if (key.includes("penpa")) {
                    localforage.removeItem(key);
                }
            });
            // LocalStorage backup keys
            Object.keys(localStorage).forEach(key => {
                if (key.includes("penpa")) {
                    localStorage.removeItem(key);
                }
            });
            // localStorage.clear(); for all clear
        }
    }
};