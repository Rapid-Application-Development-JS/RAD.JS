"use strict";

var RAD = require('RAD');

/**
 * Converts integer to a hexidecimal code, prepad's single
 * digit hex codes with 0 to always return a two digit code.
 *
 * @param {Integer} i Integer to convert
 * @returns {String} The hexidecimal code
 */
function intToHex(i) {
    var hex = i.toString(16);
    hex = (hex.length < 2) ? "0" + hex : hex;
    return hex;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h [0, 360], s [0, 100], and l[0, 100] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  String           The RGB representation
 */
function hslToRgb(h, s, l) {
    // Make sure our arguments stay in-range
    h = Math.max(0, Math.min(360, h));
    s = Math.max(0, Math.min(100, s));
    l = Math.max(0, Math.min(100, l));

    // We accept saturation and value arguments from 0 to 100 because that's
    // how Photoshop represents those values. Internally, however, the
    // saturation and value are calculated from a range of 0 to 1. We make
    // That conversion here.
    h /= 360;
    s /= 100;
    l /= 100;

    var r, g, b;

    if (s == 0) {
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }
    return "#" + intToHex(Math.round(r * 255)) + intToHex(Math.round(g * 255)) + intToHex(Math.round(b * 255));
}

function drawChart(canvasEl, percent, color) {
    var context = canvasEl.getContext('2d');
    var x = canvasEl.width / 2;
    var y = canvasEl.height / 2;

    // draw arc
    var radius = x - 4;
    var quart = Math.PI / 2;
    context.lineWidth = 8;
    context.strokeStyle = color;
    context.clearRect(0, 0, canvasEl.width, canvasEl.height);
    context.beginPath();
    context.arc(x, y, radius, -(quart), ((Math.PI * 2) * percent) / 100 - quart, false);
    context.stroke();

    // draw percent
    context.fillStyle = color;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = 'italic ' + Math.round(canvasEl.height / 5) + 'pt Arial';
    context.fillText(percent + ' %', x, y);
}

var ChartView = RAD.View.extend({

    className: 'block',

    template: '<canvas ref="canvas">test</canvas>',

    onRender: function () {
        var value = parseInt(this.props.get('value'));
        var canvas = this.refs['canvas'];

        canvas.width = parseInt(this.props.get('width'));
        canvas.height = parseInt(this.props.get('height'));

        drawChart(canvas, value, hslToRgb((150 - value / 100 * 150), 100, 50));
    }
});

module.exports = ChartView;