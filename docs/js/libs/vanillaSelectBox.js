/*
Copyright (C) Philippe Meyer 2019-2020
Distributed under the MIT License  

vanillaSelectBox : v0.56 : The multiselect checkboxes are a little smaller, maxWidth option is now working + added minWidth option as well
                           The button has now a style attribute to protect its appearance 
vanillaSelectBox : v0.55 : All attributes from the original select options are copied to the selectBox element
vanillaSelectBox : v0.54 : if all the options of the select are selected by the user then the check all checkbox is checked
vanillaSelectBox : v0.53 : if all the options of the select are selected then the check all checkbox is checked
vanillaSelectBox : v0.52 : Better support of select('all') => command is consistent with checkbox and selecting / deselecting while searching select / uncheck only the found items
vanillaSelectBox : v0.51 : Translations for select all/clear all + minor css corrections + don't select disabled items
vanillaSelectBox : v0.50 : PR by jaguerra2017 adding a select all/clear all check button + optgroup support !
vanillaSelectBox : v0.41 : Bug corrected, the menu content was misplaced if a css transform was applied on a parent
vanillaSelectBox : v0.40 : A click on one selectBox close the other opened boxes
vanillaSelectBox : v0.35 : You can enable and disable items
vanillaSelectBox : v0.30 : The menu stops moving around on window resize and scroll + z-index in order of creation for multiple instances
vanillaSelectBox : v0.26 : Corrected bug in stayOpen mode with disable() function
vanillaSelectBox : v0.25 : New option stayOpen, and the dropbox is no longer a dropbox but a nice multi-select
previous version : v0.24 : corrected bug affecting options with more than one class
https://github.com/PhilippeMarcMeyer/vanillaSelectBox
*/

let VSBoxCounter = function() {
    let count = 0;
    let instances = [];
    return {
        set: function(instancePtr) {
            instances.push({ offset: ++count, ptr: instancePtr });
            return instances[instances.length - 1].offset;
        },
        remove: function(instanceNr) {
            let temp = instances.filter(function(x) {
                return x.offset != instanceNr;
            })
            instances = temp.splice(0);
            temp = [];
        },
        closeAllButMe: function(instanceNr) {
            temp = [];
            instances.forEach(function(x) {
                if (x.offset != instanceNr) {
                    x.ptr.closeOrder();
                }
            });
        }
    };
}();

function vanillaSelectBox(domSelector, options) {
    let self = this;
    this.instanceOffset = VSBoxCounter.set(self);
    this.domSelector = domSelector;
    this.root = document.querySelector(domSelector)
    this.main;
    this.button;
    this.title;
    this.isMultiple = this.root.hasAttribute("multiple");
    this.multipleSize = this.isMultiple && this.root.hasAttribute("size") ? parseInt(this.root.getAttribute("size")) : -1;
    this.drop;
    this.top;
    this.left;
    this.options;
    this.listElements;
    this.isDisabled = false;
    this.search = false;
    this.searchZone = null;
    this.inputBox = null;
    this.disabledItems = [];
    this.ulminWidth = 178;
    this.ulminHeight = 25;
    this.forbidenAttributes = ["class", "selected", "disabled", "data-text", "data-value", "style"];
    this.forbidenClasses = ["active", "disabled"];
    this.userOptions = {
        maxWidth: 500,
        minWidth: -1,
        maxHeight: 400,
        translations: { "all": "All", "items": "items", "selectAll": "Select All", "clearAll": "Clear All" },
        search: false,
        placeHolder: "",
        stayOpen: false,
        disableSelectAll: false,
    }
    if (options) {
        if (options.maxWidth != undefined) {
            this.userOptions.maxWidth = options.maxWidth;
        }
        if (options.maxWidth != undefined) {
            this.userOptions.minWidth = options.minWidth;
        }
        if (options.maxHeight != undefined) {
            this.userOptions.maxHeight = options.maxHeight;
        }
        if (options.translations != undefined) {
            for (var property in options.translations) {
                if (options.translations.hasOwnProperty(property)) {
                    if (this.userOptions.translations[property]) {
                        this.userOptions.translations[property] = options.translations[property];
                    }
                }
            }
        }
        if (options.placeHolder != undefined) {
            this.userOptions.placeHolder = options.placeHolder;
        }
        if (options.search != undefined) {
            this.search = options.search;
        }
        if (options.stayOpen != undefined) {
            this.userOptions.stayOpen = options.stayOpen;
        }
        if (options.disableSelectAll != undefined) {
            this.userOptions.disableSelectAll = options.disableSelectAll;
        }
    }

    this.closeOrder = function() {
        let self = this;
        if (!self.userOptions.stayOpen) {
            self.drop.style.display = "none";
            if (self.search) {
                self.inputBox.value = "";
                Array.prototype.slice.call(self.listElements).forEach(function(x) {
                    x.classList.remove("hide");
                });
            }
        }
    }

    this.init = function() {
        let self = this;
        this.root.style.display = "none";
        let already = document.getElementById("btn-group-" + self.domSelector);
        if (already) {
            already.remove();
        }
        this.main = document.createElement("div");
        this.root.parentNode.insertBefore(this.main, this.root.nextSibling);
        this.main.classList.add("vsb-main");
        this.main.setAttribute("id", "btn-group-" + this.domSelector);
        this.main.style.marginLeft = this.main.style.marginLeft;
        if (self.userOptions.stayOpen) {
            this.main.style.minHeight = (this.userOptions.maxHeight + 10) + "px";
        }

        if (self.userOptions.stayOpen) {
            this.button = document.createElement("div");
        } else {
            this.button = document.createElement("button");
        }
        this.button.style.maxWidth = this.userOptions.maxHeight + "px";
        if (this.userOptions.minWidth !== -1) {
            this.button.style.minWidth = this.userOptions.minWidth + "px";
        }

        this.main.appendChild(this.button);
        this.title = document.createElement("span");
        this.button.appendChild(this.title);
        this.title.classList.add("title");
        let caret = document.createElement("span");
        this.button.appendChild(caret);

        caret.classList.add("caret");
        caret.style.position = "absolute";
        caret.style.right = "8px";
        caret.style.marginTop = "8px";

        if (self.userOptions.stayOpen) {
            caret.style.display = "none";
            this.title.style.paddingLeft = "20px";
            this.title.style.fontStyle = "italic";
            this.title.style.verticalAlign = "20%";
        }

        this.drop = document.createElement("div");
        this.main.appendChild(this.drop);
        this.drop.classList.add("vsb-menu");
        this.drop.style.zIndex = 2000 - this.instanceOffset;
        this.ul = document.createElement("ul");
        this.drop.appendChild(this.ul);

        this.ul.style.maxHeight = this.userOptions.maxHeight + "px";
        this.ul.style.minWidth = this.ulminWidth + "px";
        this.ul.style.minHeight = this.ulminHeight + "px";
        if (this.isMultiple) {
            this.ul.classList.add("multi");
            if (!self.userOptions.disableSelectAll) {
                let selectAll = document.createElement("option");
                selectAll.setAttribute("value", 'all');
                selectAll.innerText = self.userOptions.translations.selectAll;
                this.root.insertBefore(selectAll, (this.root.hasChildNodes()) ?
                    this.root.childNodes[0] :
                    null);
            }
        }
        let selectedTexts = "Tab/↵";
        let sep = "";
        let nrActives = 0;

        if (this.search) {
            this.searchZone = document.createElement("div");
            this.ul.appendChild(this.searchZone);
            this.searchZone.classList.add("vsb-js-search-zone");
            this.searchZone.style.zIndex = 2001 - this.instanceOffset;
            this.inputBox = document.createElement("input");
            this.searchZone.appendChild(this.inputBox);
            this.inputBox.setAttribute("type", "text");
            this.inputBox.setAttribute("id", "search_" + this.domSelector);

            let fontSizeForP = this.isMultiple ? "12px" : "6px";
            var para = document.createElement("p");
            this.ul.appendChild(para);
            para.style.fontSize = fontSizeForP;
            para.innerHTML = "&nbsp;";
            this.ul.addEventListener("scroll", function(e) {
                var y = this.scrollTop;
                self.searchZone.parentNode.style.top = y + "px";
            });
        }

        this.options = document.querySelectorAll(this.domSelector + " > option");
        Array.prototype.slice.call(this.options).forEach(function(x) {
            let text = x.textContent;
            let value = x.value;
            let originalAttrs;
            if (x.hasAttributes()) {
                originalAttrs = Array.prototype.slice.call(x.attributes)
                    .filter(function(a) {
                        return self.forbidenAttributes.indexOf(a.name) === -1
                    });
            }
            let classes = x.getAttribute("class");
            if (classes) {
                classes = classes
                    .split(" ")
                    .filter(function(c) {
                        return self.forbidenClasses.indexOf(c) === -1
                    });
            } else {
                classes = [];
            }
            let li = document.createElement("li");
            let isSelected = x.hasAttribute("selected");
            let isDisabled = x.hasAttribute("disabled");

            self.ul.appendChild(li);
            li.setAttribute("data-value", value);
            li.setAttribute("data-text", text);

            originalAttrs.forEach(function(a) {
                li.setAttribute(a.name, a.value);
            });

            classes.forEach(function(x) {
                li.classList.add(x);
            });
            if (isSelected) {
                nrActives++;
                selectedTexts += sep + text;
                sep = ",";
                li.classList.add("active");
                if (!self.isMultiple) {
                    self.title.textContent = text;
                    if (classes.length != 0) {
                        classes.forEach(function(x) {
                            self.title.classList.add(x);
                        });
                    }
                }
            }
            if (isDisabled) {
                li.classList.add("disabled");
            }
            li.appendChild(document.createTextNode(text));
        });

        if (document.querySelector(this.domSelector + ' optgroup') !== null) {
            this.options = document.querySelectorAll(this.domSelector + " option");
            let groups = document.querySelectorAll(this.domSelector + ' optgroup');
            Array.prototype.slice.call(groups).forEach(function(group) {
                let groupOptions = group.querySelectorAll('option');
                let li = document.createElement("li");
                li.classList.add('grouped-option');
                li.appendChild(document.createTextNode(group.label));
                self.ul.appendChild(li);

                Array.prototype.slice.call(groupOptions).forEach(function(x) {
                    let text = x.textContent;
                    let value = x.value;
                    let classes = x.getAttribute("class");
                    if (classes) {
                        classes = classes.split(" ");
                    } else {
                        classes = [];
                    }
                    let li = document.createElement("li");
                    let isSelected = x.hasAttribute("selected");
                    self.ul.appendChild(li);
                    li.setAttribute("data-value", value);
                    li.setAttribute("data-text", text);
                    if (classes.length != 0) {
                        classes.forEach(function(x) {
                            li.classList.add(x);
                        });

                    }
                    if (isSelected) {
                        nrActives++;
                        selectedTexts += sep + text;
                        sep = ",";
                        li.classList.add("active");
                        if (!self.isMultiple) {
                            self.title.textContent = text;
                            if (classes.length != 0) {
                                classes.forEach(function(x) {
                                    self.title.classList.add(x);
                                });
                            }
                        }
                    }
                    li.appendChild(document.createTextNode(text));
                })
            })
        }

        if (self.multipleSize != -1) {
            if (nrActives > self.multipleSize) {
                let wordForItems = self.userOptions.translations.items || "items"
                // selectedTexts = nrActives + " " + wordForItems;
                selectedTexts = "Tab/↵";
            }
        }
        if (self.isMultiple) {
            self.title.innerHTML = selectedTexts;
        }
        if (self.userOptions.placeHolder != "" && self.title.textContent == "") {
            self.title.textContent = self.userOptions.placeHolder;
        }
        this.listElements = this.drop.querySelectorAll("li:not(.grouped-option)");
        if (self.search) {
            self.inputBox.addEventListener("keyup", function(e) {
                let searchValue = e.target.value.toUpperCase();
                let searchValueLength = searchValue.length;
                let nrFound = 0;
                let nrChecked = 0;
                let selectAll = null;
                if (searchValueLength < 2) {
                    Array.prototype.slice.call(self.listElements).forEach(function(x) {
                        if (x.getAttribute('data-value') === 'all') {
                            selectAll = x;
                        } else {
                            x.classList.remove("hidden-search");
                            nrFound++;
                            nrChecked += x.classList.contains('active');
                        }
                    });
                } else {
                    Array.prototype.slice.call(self.listElements).forEach(function(x) {
                        if (x.getAttribute('data-value') !== 'all') {
                            let text = x.getAttribute("data-text").toUpperCase();
                            if (text.indexOf(searchValue) === -1 && x.getAttribute('data-value') !== 'all') {
                                x.classList.add("hidden-search");
                            } else {
                                nrFound++;
                                x.classList.remove("hidden-search");
                                nrChecked += x.classList.contains('active');
                            }
                        } else {
                            selectAll = x;
                        }
                    });
                }
                if (selectAll) {
                    if (nrFound === 0) {
                        selectAll.classList.add('disabled');
                    } else {
                        selectAll.classList.remove('disabled');
                    }
                    if (nrChecked !== nrFound) {
                        selectAll.classList.remove("active");
                        selectAll.innerText = self.userOptions.translations.selectAll;
                        selectAll.setAttribute('data-selected', 'false')
                    } else {
                        selectAll.classList.add("active");
                        selectAll.innerText = self.userOptions.translations.clearAll;
                        selectAll.setAttribute('data-selected', 'true')
                    }
                }
            });
        }

        if (self.userOptions.stayOpen) {
            self.drop.style.display = "block";
            self.drop.style.boxShadow = "none";
            self.drop.style.minHeight = (this.userOptions.maxHeight + 10) + "px";
            self.drop.style.position = "relative";
            self.drop.style.left = "0px";
            self.drop.style.top = "0px";
            self.button.style.border = "none";
        } else {
            this.main.addEventListener("click", function(e) {
                if (self.isDisabled) return;
                self.drop.style.left = self.left + "px";
                self.drop.style.top = self.top + "px";
                self.drop.style.display = "block";
                document.addEventListener("click", docListener);
                e.preventDefault();
                e.stopPropagation();
                if (!self.userOptions.stayOpen) {
                    VSBoxCounter.closeAllButMe(self.instanceOffset);
                }
            });
        }
        this.drop.addEventListener("click", function(e) {
            if (self.isDisabled) return;

            if (!e.target.hasAttribute("data-value")) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            let choiceValue = e.target.getAttribute("data-value");
            let choiceText = e.target.getAttribute("data-text");
            let className = e.target.getAttribute("class");

            if (className && className.indexOf("disabled") != -1) {
                return;
            }

            if (choiceValue === 'all') {
                if (e.target.hasAttribute('data-selected') &&
                    e.target.getAttribute('data-selected') === 'true') {
                    self.setValue('none')
                } else {
                    self.setValue('all');
                }
                return;
            }

            if (!self.isMultiple) {
                self.root.value = choiceValue;
                self.title.textContent = choiceText;
                if (className) {
                    self.title.setAttribute("class", className + " title");
                } else {
                    self.title.setAttribute("class", "title");
                }
                Array.prototype.slice.call(self.listElements).forEach(function(x) {
                    x.classList.remove("active");
                });
                if (choiceText != "") {
                    e.target.classList.add("active");
                }
                self.privateSendChange();
                if (!self.userOptions.stayOpen) {
                    docListener();
                }
            } else {
                let wasActive = false;
                if (className) {
                    wasActive = className.indexOf("active") != -1;
                }
                if (wasActive) {
                    e.target.classList.remove("active");
                } else {
                    e.target.classList.add("active");
                }
                let selectedTexts = "Tab/↵";
                let sep = "";
                let nrActives = 0;
                let nrAll = 0;
                for (let i = 0; i < self.options.length; i++) {
                    nrAll++;
                    if (self.options[i].value == choiceValue) {
                        self.options[i].selected = !wasActive;
                    }
                    if (self.options[i].selected) {
                        nrActives++;
                        selectedTexts += sep + self.options[i].textContent;
                        sep = ",";
                    }
                }
                if (nrAll == nrActives) {
                    let wordForAll = self.userOptions.translations.all || "all";
                    selectedTexts = "Tab/↵";
                } else if (self.multipleSize != -1) {
                    if (nrActives > self.multipleSize) {
                        let wordForItems = self.userOptions.translations.items || "items"
                        // selectedTexts = nrActives + " " + wordForItems;
                        selectedTexts = "Tab/↵";
                    }
                }
                self.title.textContent = selectedTexts;

                self.checkUncheckAll();
                self.privateSendChange();
            }
            e.preventDefault();
            e.stopPropagation();
            if (self.userOptions.placeHolder != "" && self.title.textContent == "") {
                self.title.textContent = self.userOptions.placeHolder;
            }
        });

        function docListener() {
            document.removeEventListener("click", docListener);
            self.drop.style.display = "none";
            if (self.search) {
                self.inputBox.value = "";
                Array.prototype.slice.call(self.listElements).forEach(function(x) {
                    x.classList.remove("hidden-search");
                });
            }
        }
    }
    this.init();
    this.checkUncheckAll();

}

vanillaSelectBox.prototype.disableItems = function(values) {
    let self = this;
    let foundValues = [];
    if (vanillaSelectBox_type(values) == "string") {
        values = values.split(",");
    }

    if (vanillaSelectBox_type(values) == "array") {
        Array.prototype.slice.call(self.options).forEach(function(x) {
            if (values.indexOf(x.value) != -1) {
                foundValues.push(x.value);
                x.setAttribute("disabled", "");
            }
        });
    }
    Array.prototype.slice.call(self.listElements).forEach(function(x) {
        let val = x.getAttribute("data-value");
        if (foundValues.indexOf(val) != -1) {
            x.classList.add("disabled");
        }
    });
}

vanillaSelectBox.prototype.enableItems = function(values) {
    let self = this;
    let foundValues = [];
    if (vanillaSelectBox_type(values) == "string") {
        values = values.split(",");
    }

    if (vanillaSelectBox_type(values) == "array") {
        Array.prototype.slice.call(self.options).forEach(function(x) {
            if (values.indexOf(x.value) != -1) {
                foundValues.push(x.value);
                x.removeAttribute("disabled");
            }
        });
    }

    Array.prototype.slice.call(self.listElements).forEach(function(x) {
        if (foundValues.indexOf(x.getAttribute("data-value")) != -1) {
            x.classList.remove("disabled");
        }
    });
}

vanillaSelectBox.prototype.checkUncheckAll = function() {
    let self = this;
    if (self.isMultiple) {
        let nrChecked = 0;
        let nrCheckable = 0;
        let checkAllElement = null;

        Array.prototype.slice.call(self.listElements).forEach(function(x) {
            if (x.hasAttribute('data-value')) {
                if (x.getAttribute('data-value') === 'all') {
                    checkAllElement = x;
                }
                if (x.getAttribute('data-value') !== 'all' &&
                    !x.classList.contains('hidden-search') &&
                    !x.classList.contains('disabled')) {
                    nrCheckable++;
                    nrChecked += x.classList.contains('active');
                }
            }
        });

        if (checkAllElement) {
            if (nrChecked === nrCheckable) {
                // check the checkAll checkbox
                checkAllElement.classList.add("active");
                checkAllElement.innerText = self.userOptions.translations.clearAll;
                checkAllElement.setAttribute('data-selected', 'true')
            } else if (nrChecked === 0) {
                // uncheck the checkAll checkbox
                checkAllElement.classList.remove("active");
                checkAllElement.innerText = self.userOptions.translations.selectAll;
                checkAllElement.setAttribute('data-selected', 'false')
            }
        }
    }
}


vanillaSelectBox.prototype.setValue = function(values) {
    let self = this;
    if (values == null || values == undefined || values == "") {
        self.empty();
    } else {
        if (self.isMultiple) {
            if (vanillaSelectBox_type(values) == "string") {
                if (values === "all") {
                    values = [];
                    Array.prototype.slice.call(self.listElements).forEach(function(x) {
                        if (x.hasAttribute('data-value')) {
                            let value = x.getAttribute('data-value');
                            if (value !== 'all') {
                                if (!x.classList.contains('hidden-search') && !x.classList.contains('disabled')) {
                                    values.push(x.getAttribute('data-value'));
                                }
                                // already checked (but hidden by search)
                                if (x.classList.contains('active')) {
                                    if (x.classList.contains('hidden-search') || x.classList.contains('disabled')) {
                                        values.push(value);
                                    }
                                }
                            }
                        }
                    });
                } else if (values === "none") {
                    values = [];
                    Array.prototype.slice.call(self.listElements).forEach(function(x) {
                        if (x.hasAttribute('data-value')) {
                            let value = x.getAttribute('data-value');
                            if (value !== 'all') {
                                if (x.classList.contains('active')) {
                                    if (x.classList.contains('hidden-search') || x.classList.contains('disabled')) {
                                        values.push(value);
                                    }
                                }
                            }
                        }
                    });
                } else {
                    values = values.split(",");
                }
            }
            let foundValues = [];
            if (vanillaSelectBox_type(values) == "array") {
                Array.prototype.slice.call(self.options).forEach(function(x) {
                    if (values.indexOf(x.value) !== -1) {
                        x.selected = true;
                        foundValues.push(x.value);
                    } else {
                        x.selected = false;
                    }
                });
                let selectedTexts = "Tab/↵";
                let sep = "";
                let nrActives = 0;
                let nrAll = 0;
                Array.prototype.slice.call(self.listElements).forEach(function(x) {
                    nrAll++;
                    if (foundValues.indexOf(x.getAttribute("data-value")) != -1) {
                        x.classList.add("active");
                        nrActives++;
                        selectedTexts += sep + x.getAttribute("data-text");
                        sep = ",";
                    } else {
                        x.classList.remove("active");
                    }
                });
                if (nrAll == nrActives) {
                    let wordForAll = self.userOptions.translations.all || "all";
                    selectedTexts = "Tab/↵";
                } else if (self.multipleSize != -1) {
                    if (nrActives > self.multipleSize) {
                        let wordForItems = self.userOptions.translations.items || "items"
                        // selectedTexts = nrActives + " " + wordForItems;
                        selectedTexts = "Tab/↵";
                    }
                }
                self.title.textContent = selectedTexts;
                self.privateSendChange();
            }
            self.checkUncheckAll();
        } else {
            let found = false;
            let text = "";
            let classNames = ""
            Array.prototype.slice.call(self.listElements).forEach(function(x) {
                if (x.getAttribute("data-value") == values) {
                    x.classList.add("active");
                    found = true;
                    text = x.getAttribute("data-text")
                } else {
                    x.classList.remove("active");
                }
            });
            Array.prototype.slice.call(self.options).forEach(function(x) {
                if (x.value == values) {
                    x.selected = true;
                    className = x.getAttribute("class");
                    if (!className) className = "";
                } else {
                    x.selected = false;
                }
            });
            if (found) {
                self.title.textContent = text;
                if (self.userOptions.placeHolder != "" && self.title.textContent == "") {
                    self.title.textContent = self.userOptions.placeHolder;
                }
                if (className != "") {
                    self.title.setAttribute("class", className + " title");
                } else {
                    self.title.setAttribute("class", "title");
                }
            }
        }
    }
}

vanillaSelectBox.prototype.privateSendChange = function() {
    let event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, false);
    this.root.dispatchEvent(event);

}

vanillaSelectBox.prototype.empty = function() {
    Array.prototype.slice.call(this.listElements).forEach(function(x) {
        x.classList.remove("active");
    });
    Array.prototype.slice.call(this.options).forEach(function(x) {
        x.selected = false;
    });
    this.title.textContent = "";
    if (this.userOptions.placeHolder != "" && this.title.textContent == "") {
        this.title.textContent = this.userOptions.placeHolder;
    }
    this.checkUncheckAll();
    this.privateSendChange();
}

vanillaSelectBox.prototype.destroy = function() {
    let already = document.getElementById("btn-group-" + this.domSelector);
    if (already) {
        VSBoxCounter.remove(this.instanceOffset);
        already.remove();
        this.root.style.display = "inline-block";
    }
}
vanillaSelectBox.prototype.disable = function() {
    let already = document.getElementById("btn-group-" + this.domSelector);
    if (already) {
        button = already.querySelector("button")
        if (button) button.classList.add("disabled");
        this.isDisabled = true;
    }
}
vanillaSelectBox.prototype.enable = function() {
    let already = document.getElementById("btn-group-" + this.domSelector);
    if (already) {
        button = already.querySelector("button")
        if (button) button.classList.remove("disabled");
        this.isDisabled = false;
    }
}

vanillaSelectBox.prototype.showOptions = function() {}

// Polyfills for IE
if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
        if (this.parentNode) {
            this.parentNode.removeChild(this);
        }
    };
}

function vanillaSelectBox_type(target) {
    const computedType = Object.prototype.toString.call(target);
    const stripped = computedType.replace("[object ", "").replace("]", "");
    const lowercased = stripped.toLowerCase();
    return lowercased;
}