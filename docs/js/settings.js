const UserSettings = {
    // Do responsive layout for wider screens
    _responsive_mode: 1,
    set responsive_mode(newMode) {
        const modeInt = newMode ? parseInt(newMode, 10) : 1;
        this._responsive_mode = modeInt;
        
        let verb = modeInt > 1 ? 'add' : 'remove';
        let flipVerb = modeInt > 2 ? 'add' : 'remove';
        document.getElementById("app-container").classList[verb]("responsive");
        document.getElementById("app-container").classList[flipVerb]("responsive-flip");
        document.getElementById("responsive_settings_opt").value = newMode;
        
        // Display the mode break line if min-width greater than 850px (defined in base-structure.css media)
        // and responsive mode is not equal to 1, window.screen.width gives laptop size and not current window size
        if (modeInt === 1 || (modeInt > 1 && window.innerWidth < 850)) {
            document.getElementById("mode_break").style.display = "inline";
            document.getElementById("mode_txt_space").style.display = "inline";
            document.getElementById("visibility_break").style.display = "none";
        } else if (modeInt > 1 && window.innerWidth >= 850) {
            document.getElementById("mode_break").style.display = "none";
            document.getElementById("mode_txt_space").style.display = "none";
            document.getElementById("visibility_break").style.display = "inline";
        }
        this.attemptSave();
    },
    get responsive_mode() {
        return this._responsive_mode;
    },
    
    // Save settings as cookie
    _save_settings: false,
    set save_settings(newValue) {
        this._save_settings = (String(newValue) === "2");
        document.getElementById("save_settings_opt").value = this._save_settings ? "2" : "1";
        // this.attemptSave();
    },
    get save_settings() {
        return this._save_settings;
    },

    // Toggle timer bar visibility
    _timerbar_status: 1,
    set timerbar_status(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._timerbar_status = valueInt;

        document.getElementById("timer_bar_opt").value = valueInt;
        document.getElementById("stop_watch").style.display = (valueInt === 2) ? 'none' : 'block';
        this.attemptSave();
    },
    get timerbar_status() {
        return this._timerbar_status;
    },

    // Toggle timer bar visibility
    _mousemiddle_button: 1,
    set mousemiddle_button(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._mousemiddle_button = valueInt;

        document.getElementById("mousemiddle_settings_opt").value = valueInt;
        this.attemptSave();
    },
    get mousemiddle_button() {
        return this._mousemiddle_button;
    },

    can_save: [
        'mousemiddle_button',
        'responsive_mode',
        'timerbar_status'
    ],

    // Handle saving settings if needed
    attemptSave: function () {
        if (!this._settingsLoaded) {
            return;
        }
        
        if (this._save_settings) {
            let expDate = 2147483647;
            this.can_save.forEach(function (setting) {
                setCookie(setting, UserSettings[setting], expDate);
            });
            setCookie("color_theme", document.getElementById("theme_mode_opt").value, expDate);
            setCookie("reload_button", document.getElementById('reload_button').value, expDate);
            setCookie("tab_settings", JSON.stringify(getValues('mode_choices')), expDate);
            setCookie("gridtype", document.getElementById("gridtype").value, expDate);
            setCookie("sudoku_centre_size", document.getElementById("sudoku_settings_opt").value, expDate);
            setCookie("displaysize", document.getElementById("nb_size3").value, expDate);
            setCookie("sudoku_normal_size", document.getElementById("sudoku_settings_normal_opt").value, expDate);
            setCookie("starbattle_dots", document.getElementById("starbattle_settings_opt").value, expDate);
            // setCookie("different_solution_tab", document.getElementById("multitab_settings_opt").value, expDate);
        } else {
            this.can_save.forEach(function (setting) {
                deleteCookie(setting);
            });
            deleteCookie("color_theme");
            deleteCookie("reload_button");
            deleteCookie("tab_settings");
            deleteCookie("gridtype");
            deleteCookie("sudoku_centre_size");
            deleteCookie("displaysize");
            deleteCookie("sudoku_normal_size");
            deleteCookie("starbattle_dots");
            // deleteCookie("different_solution_tab");
        }
    },

    _settingsLoaded: false,
    loadFromCookies: function () {
        let foundCookie;
        this.can_save.forEach(function (setting) {
            let cookieQuery = getCookie(setting);
            UserSettings[setting] = cookieQuery;
            console.log(setting, UserSettings[setting], cookieQuery);
            foundCookie = foundCookie || cookieQuery;
        });
        // If we found any saved setting, turn saving back on.
        if (foundCookie) {
            UserSettings.save_settings = 2;
        }
        this._settingsLoaded = true;
    }
};