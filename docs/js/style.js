////////////////////////////
//Style
//
/////////////////////////////

// Colors: should be the same as in main.css
const Color = {
    BLACK: "#000000",
    BLUE: "#0000ff",
    BLUE_DARK_VERY: "#00008b",
    BLUE_LIGHT: "#187bcd",
    BLUE_LIGHT_VERY: "#c0e0ff",
    BLUE_SKY: "#3085d6",
    BROWN_LIGHT: "#eecab1",
    GREEN: "#208020",
    GREEN_LIGHT: "#4c9900",
    GREEN_LIGHT_VERY: "#b3ffb3",
    GREY: "#999999",
    GREY_DARK: "#777777",
    GREY_DARK_LIGHT: "#b3b3b3",
    GREY_DARK_VERY: "#444444",
    GREY_LIGHT: "#cccccc",
    GREY_LIGHT_VERY: "#f0f0f0",
    ORANGE_LIGHT: "#ffcc80",
    ORANGE_TRANSPARENT: "rgba(255, 103, 0, 0.6)",
    PINK_LIGHT: "#ffb3ff",
    PURPLE_LIGHT: "#cc99ff",
    RED: "#ff0000",
    RED_LIGHT: "#ffa3a3",
    RED_TRANSPARENT: "rgba(255, 0, 0, 0.7)",
    TRANSPARENTBLACK: "rgba(0, 0, 0, 0)",
    TRANSPARENTWHITE: "rgba(255, 255, 255, 0)",
    WHITE: "#ffffff",
    YELLOW: "#ffffa3"
};

function set_surface_style(ctx, type) {
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = "square";
    ctx.lineWidth = 0.5;
    switch (type) {
        case 0:
            ctx.fillStyle = Color.TRANSPARENTWHITE;
            break;
        case 1:
            ctx.fillStyle = Color.GREY_DARK_VERY;
            break;
        case 2:
            ctx.fillStyle = Color.GREEN_LIGHT_VERY;
            break;
        case 3:
            ctx.fillStyle = Color.GREY_LIGHT;
            break;
        case 4:
            ctx.fillStyle = Color.BLACK;
            break;
        case 5:
            ctx.fillStyle = Color.BLUE_LIGHT_VERY;
            break;
        case 6:
            ctx.fillStyle = Color.RED_LIGHT;
            break;
        case 7:
            ctx.fillStyle = Color.YELLOW;
            break;
        case 8:
            ctx.fillStyle = Color.GREY;
            break;
        case 9:
            ctx.fillStyle = Color.PINK_LIGHT;
            break;
        case 10:
            ctx.fillStyle = Color.ORANGE_LIGHT;
            break;
        case 11:
            ctx.fillStyle = Color.PURPLE_LIGHT;
            break;
        case 12:
            ctx.fillStyle = Color.BROWN_LIGHT;
            break;
        case 13:
            ctx.fillStyle = Color.ORANGE_TRANSPARENT;
            break;
        case 99:
            ctx.fillStyle = Color.GREY_LIGHT_VERY;
            break;
    }
    ctx.strokeStyle = ctx.fillStyle;
}

function set_line_style(ctx, type) {
    //Initialization
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = "square";
    ctx.strokeStyle = Color.BLACK;
    ctx.lineWidth = 2;
    switch (type) {
        case 0:
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            ctx.lineWidth = 0;
            break;
        case 1: //grid
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 0.8;
            break;
        case 2:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 3;
            break;
        case 21:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 5;
            break;
        case 3:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.GREEN;
            ctx.lineWidth = 3;
            break;
        case 4:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 2;
            break;
        case 5:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.GREY;
            ctx.lineWidth = 3;
            break;
        case 6:
            ctx.strokeStyle = Color.GREY;
            ctx.lineWidth = 12;
            break;
        case 7: // cage
        case 107:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.GREY_DARK;
            ctx.lineWidth = 1;
            break;
        case 8:
            ctx.strokeStyle = Color.RED;
            ctx.lineWidth = 3;
            break;
        case 9:
            ctx.strokeStyle = Color.BLUE_LIGHT;
            ctx.lineWidth = 3;
            break;
        case 10: //cage
            var b = pu.size * 0.1;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 110: //cage
            var b = pu.size * 0.08;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 11: //grid dash
            var b = pu.size * 0.06;
            var w = pu.size * 0.14;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 12: //dash line
            var b = pu.size * 0.06;
            var w = pu.size * 0.14;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = Color.GREY_DARK_VERY;
            ctx.lineWidth = 1;
            break;
        case 13: //bold dash
            var b = pu.size * 0.04;
            var w = pu.size * 0.21;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = (pu.size * 0.1) | 0;
            break;
        case 14: //dash
            var b = pu.size * 0.11;
            var w = pu.size * 0.14;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = Color.GREY_DARK;
            ctx.lineWidth = 2;
            break;
        case 15: //cage dash
            var b = pu.size * 0.1;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.GREY_DARK;
            ctx.lineWidth = 1;
            break;
        case 115: //cage dash
            var b = pu.size * 0.08;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.GREY_DARK;
            ctx.lineWidth = 1;
            break;
        case 16: // cage
        case 116:
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 17: //bold dash for wall
            var b = pu.size * 0.12;
            var w = pu.size * 0.13;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = (pu.size * 0.1) | 0;
            break;
        case 20:
            ctx.strokeStyle = Color.WHITE;
            ctx.lineWidth = 1;
            break;
        case 30: //double line
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.GREEN;
            ctx.lineWidth = 3;
            break;
        case 40: //short line
            ctx.strokeStyle = Color.GREY;
            ctx.lineWidth = 2;
            break;
        case 80: //grid-like line
            ctx.lineCap = "round";
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 98: //x-mark
            ctx.strokeStyle = Color.GREEN;
            ctx.lineWidth = 1;
            break;
        case 99: //cursor
            ctx.strokeStyle = Color.RED;
            ctx.lineWidth = 2;
            break;
        case 100: //cursor_panel
            ctx.strokeStyle = Color.RED;
            ctx.lineWidth = 2.5;
            break;
        case 101: // Sudoku cursor
            ctx.strokeStyle = Color.RED_TRANSPARENT;
            ctx.lineWidth = 2;
            break;
    }
}

function set_font_style(ctx, size, type) {
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.setLineDash([]);
    var fontfamily = "Helvetica,Arial";
    ctx.font = size + "px " + fontfamily;
    switch (type) {
        case 0:
            ctx.fillStyle = Color.TRANSPARENTWHITE;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 0.5;
            break;
        case 1:
            ctx.fillStyle = Color.BLACK;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 2:
            ctx.fillStyle = Color.GREEN_LIGHT;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 3:
            ctx.fillStyle = Color.GREY;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 4:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 5:
            ctx.fillStyle = Color.BLACK;
            ctx.strokeStyle = Color.WHITE;
            ctx.lineWidth = 2;
            break;
        case 6:
            ctx.fillStyle = Color.BLACK;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            ctx.lineWidth = 2;
            break;
        case 7:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 8:
            ctx.fillStyle = Color.BLUE_LIGHT;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 9:
            ctx.fillStyle = Color.BLUE;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 10:
            ctx.fillStyle = Color.RED;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
        case 11:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            break;
    }
}

function set_circle_style(ctx, num) {
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = "butt";
    ctx.strokeStyle = Color.BLACK;
    ctx.lineWidth = 1;
    switch (num) {
        case 1:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 2:
            ctx.fillStyle = Color.BLACK;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 3:
            ctx.fillStyle = Color.GREY_LIGHT;
            ctx.strokeStyle = Color.TRANSPARENTBLACK;
            ctx.lineWidth = 1;
            break;
        case 4:
            ctx.setLineDash([4, 4]);
            ctx.fillStyle = Color.TRANSPARENTWHITE;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 5:
            ctx.fillStyle = Color.GREY_LIGHT;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        case 6:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.GREY;
            ctx.lineWidth = 2;
            break;
        case 7:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            ctx.lineWidth = 1;
            break;
        case 8:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 2;
            break;
        case 9:
            ctx.fillStyle = Color.GREY_LIGHT;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 2;
            break;
        case 10:
            ctx.fillStyle = Color.WHITE;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 2;
            break;
        case 11:
            ctx.fillStyle = Color.RED;
            ctx.strokeStyle = Color.RED;
            ctx.lineWidth = 1;
            break;
        case 12:
            ctx.fillStyle = Color.GREEN;
            ctx.strokeStyle = Color.GREEN;
            ctx.lineWidth = 1;
            break;
        case 13:
            ctx.fillStyle = Color.TRANSPARENTWHITE;
            ctx.strokeStyle = Color.BLACK;
            ctx.lineWidth = 1;
            break;
        default:
            ctx.fillStyle = Color.TRANSPARENTWHITE;
            ctx.strokeStyle = Color.TRANSPARENTWHITE;
            ctx.lineWidth = 1;
            break;
    }
}