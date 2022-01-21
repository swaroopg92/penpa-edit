const THEME_LIGHT = 1;
const THEME_DARK = 2;

function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
}

function setCookie(name, value, days) {
    var d = new Date;
    d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
    document.cookie = name + "=" + value + ";path=/;SameSite=Lax;expires=" + d.toGMTString();
}

function deleteCookie(name) {
    setCookie(name, '', -1);
}

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

    // Star Battle Dot handling
    _starbattle_dots: 1,
    set starbattle_dots(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._starbattle_dots = valueInt;

        document.getElementById("starbattle_settings_opt").value = valueInt;
        this.attemptSave();
    },
    get starbattle_dots() {
        return this._starbattle_dots;
    },

    // Sudoku number size handling
    _sudoku_normal_size: 1,
    set sudoku_normal_size(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._sudoku_normal_size = valueInt;

        document.getElementById("sudoku_settings_normal_opt").value = valueInt;
        this.attemptSave();
    },
    get sudoku_normal_size() {
        return this._sudoku_normal_size;
    },

    _sudoku_centre_size: 1,
    set sudoku_centre_size(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._sudoku_centre_size = valueInt;

        document.getElementById("sudoku_settings_opt").value = valueInt;
        this.attemptSave();
    },
    get sudoku_centre_size() {
        return this._sudoku_centre_size;
    },

    _local_storage: 1,
    set local_storage(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._local_storage = valueInt;

        document.getElementById("clear_storage_opt").value = valueInt;
        if (valueInt === 4) {
            clear_storage_all();
        }
        this.attemptSave();
    },
    get local_storage() {
        return this._local_storage;
    },

    _reload_button: 2,
    set reload_button(newValue) {
        if (newValue === "ON") { newValue = 1; }
        if (newValue === "OFF") { newValue = 2; }

        const valueInt = newValue ? parseInt(newValue, 10) : 2;
        this._reload_button = valueInt;

        document.getElementById("reload_button").value = valueInt;
        this.attemptSave();
    },
    get reload_button() {
        return this._reload_button;
    },

    _gridtype: "square",
    set gridtype(newValue) {
        newValue = newValue || "square";
        this._gridtype = newValue;

        document.getElementById("gridtype").value = newValue;
        this.attemptSave();
    },
    get gridtype() {
        return this._gridtype;
    },

    _tab_settings: [],
    set tab_settings(newValue) {
        newValue = newValue || [];
        this._tab_settings = newValue;

        this.attemptSave();
    },
    get tab_settings() {
        return this._tab_settings;
    },

    _color_theme: THEME_LIGHT,
    _theme_urls: {
        1: "./css/light_theme.css",
        2: "./css/dark_theme.css"
    },
    set color_theme(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : THEME_LIGHT;
        this._color_theme = valueInt;

        let themeStylesheet = this._theme_urls[valueInt];
        if (!themeStylesheet) { themeStylesheet = this._theme_urls[THEME_LIGHT]; }

        document.getElementById("theme_mode_opt").value = valueInt;
        document.getElementById("color_theme").href = themeStylesheet;
        if (window.pu) {
            pu.set_redoundocolor();
            pu.redraw();
        }
        this.attemptSave();
    },
    get color_theme() {
        return this._color_theme;
    },

    _displaysize: 38,
    set displaysize(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 38;
        if (valueInt > 90) { valueInt = 90; }
        if (valueInt < 12) { valueInt = 12; }

        this._displaysize = valueInt;

        document.getElementById("nb_size3").value = valueInt;
        document.getElementById("nb_size3_r").value = valueInt;
        if (window.pu) { redraw_grid(); }
        this.attemptSave();
    },
    get displaysize() {
        return this._displaysize;
    },

    can_save: [
        'color_theme',
        'displaysize',
        'local_storage',
        'mousemiddle_button',
        'reload_button',
        'responsive_mode',
        'starbattle_dots',
        'sudoku_centre_size',
        'sudoku_normal_size',
        // 'tab_settings',
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
            setCookie("tab_settings", JSON.stringify(getValues('mode_choices')), expDate);
            // setCookie("different_solution_tab", document.getElementById("multitab_settings_opt").value, expDate);
        } else {
            this.can_save.forEach(function (setting) {
                deleteCookie(setting);
            });
            deleteCookie('tab_settings');
            // deleteCookie("different_solution_tab");
        }
    },

    _settingsLoaded: false,
    loadFromCookies: function () {
        let foundCookie;
        this.can_save.forEach(function (setting) {
            let cookieQuery = getCookie(setting);
            UserSettings[setting] = cookieQuery;
            foundCookie = foundCookie || cookieQuery;
        });

        const tab_cookie = getCookie("tab_settings");
        if (tab_cookie !== null) {
            UserSettings.tab_settings = JSON.parse(tab_cookie);
            if (UserSettings.tab_settings.length > 0) { // If none selected, usertab_chocies = [] (size 2)
                document.getElementById('advance_button').value = "1";
                advancecontrol_onoff("url");
            }
        }

        // If we found any saved setting, turn saving back on.
        if (foundCookie) {
            UserSettings.save_settings = 2;
        }
        this._settingsLoaded = true;
    }
};