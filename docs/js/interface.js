const PenpaUI = {
    set_all_modes_hidden(hidden) {
        const allModes = penpa_modes.square;
        for (var i of allModes.mode) {
            document.getElementById("mo_" + i + "_lb").classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.sub) {
            document.getElementById("sub_" + i + "_lb").classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.ms) {
            document.getElementById("ms_" + i).parentElement.classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.ms1) {
            document.getElementById("ms1_" + i).parentElement.classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.ms3) {
            document.getElementById("ms3_" + i).parentElement.classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.ms4) {
            document.getElementById("ms4_" + i).parentElement.classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.shapemodes) {
            document.getElementById(i).classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.combisub) {
            document.getElementById("combisub_" + i).parentElement.classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.subcombi) {
            document.getElementById(i).classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.top_buttons) {
            document.getElementById(i).classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.exceptions) {
            document.getElementById(i).classList.toggle('is_hidden', hidden);
        }
        for (var i of allModes.li) {
            document.getElementById("li_" + i).classList.toggle('is_hidden', hidden);
        }
    },

    set_visible_modes_by_gridtype(gridtype) {
        const allPossible = penpa_modes.square;
        const selectedGrid = penpa_modes[gridtype];

        // One time operation when the grid is created
        // Remove all modes, square grid is the reference as it has all the modes
        for (var i of allPossible.mode) {
            document.getElementById("mo_" + i + "_lb").classList.toggle('is_hidden', selectedGrid.mode.indexOf(i) < 0);
        }
        for (var i of allPossible.sub) {
            document.getElementById("sub_" + i + "_lb").classList.toggle('is_hidden', selectedGrid.sub.indexOf(i) < 0);
        }
        for (var i of allPossible.ms) {
            document.getElementById("ms_" + i).parentElement.classList.toggle('is_hidden', selectedGrid.ms.indexOf(i) < 0);
        }
        for (var i of allPossible.ms1) {
            document.getElementById("ms1_" + i).parentElement.classList.toggle('is_hidden', selectedGrid.ms1.indexOf(i) < 0);
        }
        for (var i of allPossible.ms3) {
            document.getElementById("ms3_" + i).parentElement.classList.toggle('is_hidden', selectedGrid.ms3.indexOf(i) < 0);
        }
        for (var i of allPossible.ms4) {
            document.getElementById("ms4_" + i).parentElement.classList.toggle('is_hidden', selectedGrid.ms4.indexOf(i) < 0);
        }
        for (var i of allPossible.shapemodes) {
            document.getElementById(i).classList.toggle('is_hidden', selectedGrid.shapemodes.indexOf(i) < 0);
        }
        for (var i of allPossible.combisub) {
            document.getElementById("combisub_" + i).parentElement.classList.toggle('is_hidden', selectedGrid.combisub.indexOf(i) < 0);
        }
        for (var i of allPossible.subcombi) {
            document.getElementById(i).classList.toggle('is_hidden', selectedGrid.subcombi.indexOf(i) < 0);
        }
        for (var i of allPossible.top_buttons) {
            document.getElementById(i).classList.toggle('is_hidden', selectedGrid.top_buttons.indexOf(i) < 0);
        }
        for (var i of allPossible.exceptions) {
            document.getElementById(i).classList.toggle('is_hidden', selectedGrid.exceptions.indexOf(i) < 0);
        }
        // document.getElementById("sub_number4_lb").innerText = (gridtype === 'sudoku') ? 'Quad' : 'Tapa';
    },

    _liteSelectInstance: undefined,
    initPenpaLite() {
        let select = document.getElementById("mode_choices");

        select.innerHTML = '';

        for (var i = 0; i < PenpaText.modes.EN.length; i++) {
            var option = document.createElement("option");
            option.value = PenpaText.modes.EN[i];
            option.text = PenpaText.modes[UserSettings.app_language][i];

            if (UserSettings.tab_settings) {
                // Load the author defined tab settings if any
                if (UserSettings.tab_settings.indexOf(PenpaText.modes.EN[i]) > -1) {
                    option.setAttribute("selected", true);
                }
            }
            select.appendChild(option);
        }

        if (this._liteSelectInstance) {
            this._liteSelectInstance.destroy();
        }

        this._liteSelectInstance = new vanillaSelectBox("#mode_choices", {
            "disableSelectAll": false,
            "maxHeight": 250,
            "search": true,
            "translations": PenpaText.vanillaSelect[UserSettings.app_language]
        });

        let selectContainer = document.getElementById('btn-group-#mode_choices').getElementsByClassName('vsb-menu')[0];
        let liteModeButton = document.createElement('button');
        liteModeButton.id = "tab-dropdown-lite-btn";
        liteModeButton.disabled = true;
        let tab_initial = getValues('mode_choices');
        if (tab_initial.length > 0) {
            liteModeButton.innerText = PenpaText.get('disable_penpa_lite');
            liteModeButton.setAttribute('data-mode', 'disable');
            liteModeButton.disabled = false;
        } else {
            liteModeButton.innerText = PenpaText.get('enable_penpa_lite');
            liteModeButton.setAttribute('data-mode', 'enable');
            liteModeButton.disabled = true;
        }
        liteModeButton.addEventListener('click', advancecontrol_toggle);
        selectContainer.appendChild(liteModeButton);

        PenpaUI.liteModeButton = liteModeButton;
    }
};