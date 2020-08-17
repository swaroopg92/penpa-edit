////////////////////////////
//Style
//
/////////////////////////////

function set_surface_style(ctx, type) {
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = "square";
    ctx.lineWidth = 0.5;
    switch (type) {
        case 0:
            ctx.fillStyle = "rgba(255,255,255,0)";
            break;
        case 1:
            ctx.fillStyle = "#444"; // dark grey
            break;
        case 2:
            ctx.fillStyle = "#b3ffb3"; // Green
            break;
        case 3:
            ctx.fillStyle = "#ccc"; // light grey
            break;
        case 4:
            ctx.fillStyle = "#000"; // black
            break;
        case 5:
            ctx.fillStyle = "#c0e0ff"; // very pale blue (water)
            break;
        case 6:
            ctx.fillStyle = "#ffa3a3"; // Red
            break;
        case 7:
            ctx.fillStyle = "#ffffa3"; // Yellow
            break;
        case 8:
            ctx.fillStyle = "#999"; // between light and dark grey
            break;
        case 99:
            ctx.fillStyle = "#f0f0f0"; // very light grey
            break;
    }
    ctx.strokeStyle = ctx.fillStyle;
}

function set_line_style(ctx, type) {
    //Initialization
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = "square";
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    switch (type) {
        case 0:
            ctx.strokeStyle = "rgba(255,255,255,0)";
            ctx.lineWidth = 0;
            break;
        case 1: //grid
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 0.8;
            break;
        case 2:
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            break;
        case 21:
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 5;
            break;
        case 3:
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(32,128,32,1)";
            ctx.lineWidth = 3;
            break;
        case 4:
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            break;
        case 5:
            ctx.lineCap = "round";
            ctx.strokeStyle = "#999";
            ctx.lineWidth = 3;
            break;
        case 6:
            ctx.strokeStyle = "#999";
            ctx.lineWidth = 12;
            break;
        case 7: // cage gray
        case 107:
            ctx.lineCap = "round";
            ctx.strokeStyle = "#777";
            ctx.lineWidth = 1;
            break;
        case 8: // Red
            ctx.strokeStyle = "red";
            ctx.lineWidth = 3;
            break;
        case 9: // Blue
            ctx.strokeStyle = "#187bcd";
            ctx.lineWidth = 3;
            break;
        case 10: //cage
            var b = pu.size * 0.1;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 110: //cage
            var b = pu.size * 0.08;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 11: //grid dash
            var b = pu.size * 0.06;
            var w = pu.size * 0.14;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 12: //dash line
            var b = pu.size * 0.06;
            var w = pu.size * 0.14;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = "#333";
            ctx.lineWidth = 1;
            break;
        case 13: //bold dash
            var b = pu.size * 0.04;
            var w = pu.size * 0.21;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = (pu.size * 0.1) | 0;
            break;
        case 14: //gray dash
            var b = pu.size * 0.08;
            var w = pu.size * 0.17;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = "#777";
            ctx.lineWidth = 2;
            break;
        case 15: //cage gray dash
            var b = pu.size * 0.1;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#777";
            ctx.lineWidth = 1;
            break;
        case 115: //cage gray dash
            var b = pu.size * 0.08;
            var w = pu.size * 0.1;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.lineCap = "round";
            ctx.strokeStyle = "#666";
            ctx.lineWidth = 1;
            break;
        case 16: // cage black
        case 116:
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 17: //bold dash for wall
            var b = pu.size * 0.12;
            var w = pu.size * 0.13;
            ctx.setLineDash([b, w]);
            ctx.lineDashOffset = b * 0.5;
            ctx.strokeStyle = "#000";
            ctx.lineWidth = (pu.size * 0.1) | 0;
            break;
        case 20: //white
            ctx.strokeStyle = "#fff";
            ctx.lineWidth = 1;
            break;
        case 30: //double line
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(32,128,32,1)";
            ctx.lineWidth = 3;
            break;
        case 40: //short line
            ctx.strokeStyle = "#999";
            ctx.lineWidth = 2;
            break;
        case 80: //grid-likeline
            ctx.lineCap = "round";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 98: //x-mark
            ctx.strokeStyle = "rgba(32,128,32,1)";
            ctx.lineWidth = 1;
            break;
        case 99: //cursol
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            break;
        case 100: //cursol_panel
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2.5;
            break;
    }
}

function set_font_style(ctx, size, type) {
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.setLineDash([]);
    var fontfamily = "Helvetica,Arial";
    ctx.font = size + "px " + fontfamily;
    //var size = 0.8*pu.size.toString(10);
    switch (type) {
        case 0:
            ctx.fillStyle = "rgba(255,255,255,0)";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 0.5;
            break;
        case 1:
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
        case 2:
            ctx.fillStyle = "#4C9900"; // green
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
        case 3:
            ctx.fillStyle = "#999999"; // grey
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
        case 4:
            ctx.fillStyle = "#fff"; // white
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
        case 5:
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "rgba(255,255,255,1)";
            ctx.lineWidth = 2;
            break;
        case 6:
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "rgba(255,255,255,0)";
            ctx.lineWidth = 2;
            break;
        case 7:
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
        case 8:
            ctx.fillStyle = "#187bcd"; // light blue
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
        case 9:
            ctx.fillStyle = "#0000FF"; // dark blue
            ctx.strokeStyle = "rgba(255,255,255,0)";
            break;
    }
}

function set_circle_style(ctx, num) {
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.lineCap = "butt";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    switch (num) {
        case 1:
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 2:
            ctx.fillStyle = "#000";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 3:
            ctx.fillStyle = "#ccc";
            ctx.strokeStyle = "rgba(0,0,0,0)";
            ctx.lineWidth = 1;
            break;
        case 4:
            ctx.setLineDash([4, 4]);
            ctx.fillStyle = "rgba(255,255,255,0)";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            break;
        case 5:
            ctx.fillStyle = "#ccc";
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.lineWidth = 1;
            break;
        case 6:
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "rgba(153,153,153,1)";
            ctx.lineWidth = 2;
            break;
        case 7:
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "rgba(255,255,255,0)";
            ctx.lineWidth = 1;
            break;
        case 8:
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            break;
        case 9:
            ctx.fillStyle = "#ccc";
            ctx.strokeStyle = "rgba(0,0,0,1)";
            ctx.lineWidth = 2;
            break;
        case 10:
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 2;
            break;
        default:
            ctx.fillStyle = "rgba(255,255,255,0)";
            ctx.strokeStyle = "rgba(255,255,255,0)";
            ctx.lineWidth = 1;
            break;
    }
}