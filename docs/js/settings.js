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
    // Cookie Expiry Constant
    _expDate: 2147483647,

    // Do responsive layout for wider screens
    _responsive_mode: 1,
    set responsive_mode(newMode) {
        const modeInt = newMode ? parseInt(newMode, 10) : 1;
        this._responsive_mode = modeInt;

        let verb = (modeInt === 2 || modeInt === 3) ? 'add' : 'remove';
        let flipVerb = (modeInt === 3) ? 'add' : 'remove';
        let streamVerb = (modeInt === 4) ? 'add' : 'remove';
        document.getElementById("app-container").classList[verb]("responsive");
        document.getElementById("app-container").classList[flipVerb]("responsive-flip");
        document.getElementById("app-container").classList[streamVerb]("streaming-mode");
        document.getElementById("responsive_settings_opt").value = modeInt;

        // Handle Cookie dynamically (This is to allow Solver Mode also save this setting)
        if (modeInt === 1) {
            deleteCookie('responsive_mode');
        } else {
            setCookie('responsive_mode', modeInt, this._expDate);
        }
    },
    get responsive_mode() {
        return this._responsive_mode;
    },

    // Save settings as cookie
    _save_settings: false,
    set save_settings(newValue) {
        this._save_settings = (String(newValue) === "2");
        document.getElementById("save_settings_opt").value = this._save_settings ? "2" : "1";
        this.attemptSave();
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
    },
    get mousemiddle_button() {
        return this._mousemiddle_button;
    },

    // Conflict detection
    _conflict_detection: 1,
    set conflict_detection(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._conflict_detection = valueInt;

        document.getElementById("conflict_detection_opt").value = valueInt;

        // Handle Cookie dynamically (This is to allow Solver Mode also save this setting)
        if (valueInt === 3) {
            setCookie('conflict_detection', valueInt, this._expDate);
        } else {
            deleteCookie('conflict_detection');
        }
    },
    get conflict_detection() {
        return this._conflict_detection;
    },

    // Star Battle Dot handling
    _starbattle_dots: 1,
    set starbattle_dots(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._starbattle_dots = valueInt;

        document.getElementById("starbattle_settings_opt").value = valueInt;
    },
    get starbattle_dots() {
        return this._starbattle_dots;
    },

    // Surface Second Color handling
    _secondcolor: 2,
    set secondcolor(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 2;
        this._secondcolor = valueInt;

        document.getElementById("secondcolor_settings_opt").value = valueInt;
    },
    get secondcolor() {
        return this._secondcolor;
    },

    // Sudoku number size handling
    _sudoku_normal_size: 1,
    set sudoku_normal_size(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._sudoku_normal_size = valueInt;

        document.getElementById("sudoku_settings_normal_opt").value = valueInt;
    },
    get sudoku_normal_size() {
        return this._sudoku_normal_size;
    },

    _sudoku_centre_size: 1,
    set sudoku_centre_size(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._sudoku_centre_size = valueInt;

        document.getElementById("sudoku_settings_opt").value = valueInt;
    },
    get sudoku_centre_size() {
        return this._sudoku_centre_size;
    },

    _local_storage: 1,
    set local_storage(newValue) {
        const valueInt = newValue ? parseInt(newValue, 10) : 1;
        this._local_storage = valueInt;

        document.getElementById("clear_storage_opt").value = valueInt;
        switch (valueInt) {
            case 1:
                deleteCookie('local_storage');
                break;
            case 4:
                setCookie('local_storage', valueInt, 2147483647);
                break;
        }
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
    },
    get reload_button() {
        return this._reload_button;
    },

    _gridtype: "square",
    set gridtype(newValue) {
        newValue = newValue || "square";
        this._gridtype = newValue;

        document.getElementById("gridtype").value = newValue;
    },
    get gridtype() {
        return this._gridtype;
    },

    _tab_settings: [],
    set tab_settings(newValue) {
        newValue = newValue || [];
        this._tab_settings = newValue;
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
        if (style_tag_cache['color_theme']) {
            style_tag_cache['color_theme'].href = themeStylesheet;
        } else {
            console.error('Could not find color theme stylesheet to change.');
        }

        if (window.pu) {
            pu.set_redoundocolor();
            pu.redraw();
        }
    },
    get color_theme() {
        return this._color_theme;
    },

    _displaysize: 38,
    set displaysize(newValue) {
        var valueInt = newValue ? parseInt(newValue, 10) : 38;

        if (valueInt > 90) {
            valueInt = 90;
            Swal.fire({
                title: 'GMPuzzles says:',
                html: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to max value.',
                icon: 'info',
                confirmButtonText: 'ok 🙂',
            })
        }
        if (valueInt < 12) {
            valueInt = 12;
            Swal.fire({
                title: 'GMPuzzles says:',
                html: 'Display Size must be in the range <h2 class="warn">12-90</h2> It is set to min value.',
                icon: 'info',
                confirmButtonText: 'ok 🙂',
            })
        }

        this._displaysize = valueInt;

        document.getElementById("nb_size3").value = valueInt;
        document.getElementById("nb_size3_r").value = valueInt;
        if (window.pu) { redraw_grid(); }
    },
    get displaysize() {
        return this._displaysize;
    },

    _draw_edges: false,
    set draw_edges(newValue) {
        const button = document.getElementById("edge_button");
        this._draw_edges = newValue;
        button.textContent = newValue ? "ON" : "OFF";

        if (window.pu) {
            if (!newValue) {
                pu.cursol = pu.centerlist[0];
            }
            pu.type = pu.type_set();
            pu.redraw();
        }
    },
    get draw_edges() {
        return this._draw_edges;
    },

    _show_solution: true,
    set show_solution(newValue) {
        const button = document.getElementById("visibility_button");
        this._show_solution = newValue;
        button.textContent = newValue ? "ON" : "OFF";

        if (window.pu) {
            pu.redraw();
        }
    },
    get show_solution() {
        return this._show_solution;
    },

    _shorten_links: false,
    set shorten_links(newValue) {
        if (newValue === undefined) { newValue = false; }
        this._shorten_links = newValue;

        document.getElementById("shorten_links_dropdown").value = newValue ? 1 : 0;
        document.getElementById("auto_shorten_chk").checked = newValue ? 'checked' : null;
    },
    get shorten_links() {
        return this._shorten_links;
    },

    can_save: [
        'color_theme',
        'mousemiddle_button',
        'reload_button',
        'responsive_mode',
        'starbattle_dots',
        'secondcolor',
        'sudoku_centre_size',
        'sudoku_normal_size',
        'timerbar_status',
        'conflict_detection',
        'shorten_links'
    ],
    gridtype_size: [
        'gridtype',
        'displaysize'
    ],

    // Handle saving settings if needed
    attemptSave: function() {
        if (!this._settingsLoaded) {
            return;
        }

        if (this._save_settings) {
            this.can_save.forEach(function(setting) {
                setCookie(setting, UserSettings[setting], this._expDate);
            });
            this.gridtype_size.forEach(function(setting) {
                setCookie(setting, UserSettings[setting], this._expDate);
            });
            setCookie("tab_settings", JSON.stringify(getValues('mode_choices')), this._expDate);
            // setCookie("different_solution_tab", document.getElementById("multitab_settings_opt").value, this._expDate);
        } else {
            this.can_save.forEach(function(setting) {
                deleteCookie(setting);
            });
            this.gridtype_size.forEach(function(setting) {
                deleteCookie(setting);
            });
            deleteCookie('tab_settings');
            // deleteCookie("different_solution_tab");
        }
    },

    _settingsLoaded: false,
    loadFromCookies: function(load = "others") {
        if (load === "others") {
            let foundCookie;
            this.can_save.forEach(function(setting) {
                let cookieQuery = getCookie(setting);
                if (cookieQuery !== null) {
                    UserSettings[setting] = cookieQuery;
                    foundCookie = 1;
                }
            });

            const tab_cookie = getCookie("tab_settings");
            if (tab_cookie !== null) {
                UserSettings.tab_settings = JSON.parse(tab_cookie);
                if (UserSettings.tab_settings.length > 0) {
                    // document.getElementById('advance_button').value = "1";
                    advancecontrol_onoff("url");
                }
                foundCookie = 1;
            }

            // If we found any saved setting, turn saving back on.
            if (foundCookie) {
                UserSettings.save_settings = 2;
            }

            // Check for local storage setting
            let cookieQuery = getCookie('local_storage');
            UserSettings['local_storage'] = cookieQuery;

            this._settingsLoaded = true;
        } else {
            this.gridtype_size.forEach(function(setting) {
                UserSettings[setting] = getCookie(setting);
            });
        }
    }
};