const CustomColor = (() => {
    "use strict";

    function default_symbol_color(name) {
        switch (name) {
            case "circle_L":
            case "circle_M":
            case "circle_S":
            case "circle_SS":
            case "square_LL":
            case "square_L":
            case "square_M":
            case "square_S":
            case "square_SS":
            case "triup_L":
            case "triup_M":
            case "triup_S":
            case "triup_SS":
            case "tridown_L":
            case "tridown_M":
            case "tridown_S":
            case "tridown_SS":
            case "triright_L":
            case "triright_M":
            case "triright_S":
            case "triright_SS":
            case "trileft_L":
            case "trileft_M":
            case "trileft_S":
            case "trileft_SS":
            case "diamond_L":
            case "diamond_M":
            case "diamond_S":
            case "diamond_SS":
            case "hexpoint_LL":
            case "hexpoint_L":
            case "hexpoint_M":
            case "hexpoint_S":
            case "hexpoint_SS":
            case "hexflat_LL":
            case "hexflat_L":
            case "hexflat_M":
            case "hexflat_S":
            case "hexflat_SS":
            case "star":
            case "firefly":
            case "sun_moon":
            case "slovak":
                return Color.WHITE;
            case "frameline":
                return Color.GREY_DARK;
            case "pills":
            case "tents":
                return Color.GREY;
            case "sudokuetc":
            case "polyomino":
            case "polyhex":
            case "neighbors":
                return Color.GREY_LIGHT;
        }
        return Color.BLACK;
    }

    function default_combimode_color(mode) {
        // switch (mode) {
        //     case "linex":
        //     case "lineox":
        //     case "edgex":
        //     case "edgexoi":
        //     case "yajilin":
        //     case "hashi":
        //         return Color.GREEN;
        //     case "edgesub":
        //         return Color.GREY;
        // }
        return null; // Don't use custom color
    }

    function default_specialmode_color(name) {
        if (name.substring(0, 11) === "sub_special") {
            return this.default_special_style_color(name.substring(11));
        }
        return undefined;
    }

    function default_special_style_color(name) {
        switch (name) {
            case "thermo": return Color.GREY_LIGHT;
            case "nobulbthermo": return Color.GREY_LIGHT;
            case "arrows": return Color.GREY_DARK_LIGHT;
            case "direction": return Color.GREY_DARK_LIGHT;
            case "squareframe": return Color.GREY_LIGHT;
            case "polygon": return Color.BLACK;
        }
        return undefined;
    }

    function default_stylemode_color(name) {
        // name = "st_" + mode + stylenumber
        const [_, mode, style] = name.match(/^st_([^\d]+)(.*)/) || [];
        switch (mode) {
            case "surface": return this.default_surface_style_color(style);
            case "lineE":
            case "line":
            case "wall":
            case "cage": return this.default_line_style_color(style);
        }
        return undefined;
    }

    function default_surface_style_color(style) {
        switch (String(style)) {
            case "1": return Color.GREY_DARK_VERY;
            case "8": return Color.GREY;
            case "3": return Color.GREY_LIGHT;
            case "4": return Color.BLACK;
            case "2": return Color.GREEN_LIGHT_VERY;
            case "5": return Color.BLUE_LIGHT_VERY;
            case "6": return Color.RED_LIGHT;
            case "7": return Color.YELLOW;
            case "9": return Color.PINK_LIGHT;
            case "10": return Color.ORANGE_LIGHT;
            case "11": return Color.PURPLE_LIGHT;
            case "12": return Color.BROWN_LIGHT;
        }        
        return undefined;
    }

    function default_line_style_color(style) {
        switch (String(style)) {
            case "1": return Color.BLACK;
            case "2": return Color.BLACK;
            case "3": return Color.GREEN;
            case "5": return Color.GREY;
            case "7": return Color.GREY_DARK;
            case "8": return Color.RED;
            case "9": return Color.BLUE_LIGHT;
            case "10": return Color.BLACK;
            case "12": return Color.GREY_DARK_VERY;
            case "13": return Color.BLACK;
            case "14": return Color.GREY_DARK;
            case "15": return Color.GREY_DARK;
            case "16": return Color.BLACK;
            case "17": return Color.BLACK;
            case "21": return Color.BLACK;
            case "30": return Color.GREEN;
            case "40": return Color.GREY;
            case "80": return Color.BLACK;
            case "98": return Color.GREEN;
        }
        return undefined;
    }

    return {
        default_symbol_color,
        default_combimode_color,
        default_specialmode_color,
        default_special_style_color,
        default_stylemode_color,
        default_surface_style_color,
        default_line_style_color,
    };

})();