/*Copyright (c) 2017 Yuzo Matsuzawa*/

(function(target) {
    if (!target || !target.prototype)
        return;
    target.prototype.text = function(text, x, y, width = 1e4) {
        var fontsize = parseFloat(this.font.split("px")[0]);
        this.strokeText(text, x, y + 0.28 * fontsize, width);
        this.fillText(text, x, y + 0.28 * fontsize, width);
    };
    target.prototype.arrow = function(startX, startY, endX, endY, controlPoints) {
        var dx = endX - startX;
        var dy = endY - startY;
        var len = Math.sqrt(dx * dx + dy * dy);
        var sin = dy / len;
        var cos = dx / len;
        var a = [];
        a.push(0, 0);
        for (var i = 0; i < controlPoints.length; i += 2) {
            var x = controlPoints[i];
            var y = controlPoints[i + 1];
            a.push(x < 0 ? len + x : x, y);
        }
        a.push(len, 0);
        for (var i = controlPoints.length; i > 0; i -= 2) {
            var x = controlPoints[i - 2];
            var y = controlPoints[i - 1];
            a.push(x < 0 ? len + x : x, -y);
        }
        a.push(0, 0);
        for (var i = 0; i < a.length; i += 2) {
            var x = a[i] * cos - a[i + 1] * sin + startX;
            var y = a[i] * sin + a[i + 1] * cos + startY;
            if (i === 0) this.moveTo(x, y);
            else this.lineTo(x, y);
        }
    };
})(CanvasRenderingContext2D);
