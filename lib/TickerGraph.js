"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var TickerGraph = /** @class */ (function () {
    /**
     * @param {Node} tickerCanvas The canvas element to draw to
     * @param {Object} options The optional settings.
     * @constructor
     */
    function TickerGraph(canvas, options) {
        if (options === void 0) { options = {}; }
        this.canvas = canvas;
        this.context = null;
        this.options = {
            color: "#7c0",
            bottomOffsetPx: 0
        };
        this.setCanvas(canvas);
        this.stackLength = canvas.offsetWidth;
        this.stack = [];
        this.lastPush = null;
        this.options = __assign(__assign({}, this.options), options);
    }
    /**
     * Push a number value into the display stack and trigger a redraw
     *
     * @param {number} val The number to push
     */
    TickerGraph.prototype.push = function (val) {
        this.lastPush = val;
        this.stack.push(val);
        if (this.stack.length > this.stackLength) {
            this.stack.shift();
        }
        this.draw();
    };
    TickerGraph.prototype.getContext = function () {
        if (this.context) {
            return this.context;
        }
        this.context = this.canvas.getContext("2d");
        if (!this.context) {
            throw "Failed to get 2d context";
        }
        return this.context;
    };
    /**
     * @access private
     */
    TickerGraph.prototype.draw = function () {
        this.canvas.width = this.canvas.width + 0;
        var c = this.getContext(), h = this.canvas.offsetHeight, xOffset = this.stackLength - this.stack.length;
        var max = this.max(), min = this.min();
        if (typeof this.options.color == "string") {
            c.strokeStyle = this.options.color;
        }
        var lastRatio = null;
        for (var i = 0; i <= this.stack.length; i++) {
            var val = this.stack[i], ratio = ((val - min) / (max - min));
            if (isNaN(ratio)) {
                ratio = 0;
            }
            var scaled = ratio * h;
            if (typeof this.options.color === "function") {
                // @todo update this to be pretty scaled.
                var data = {
                    increment: i,
                    maxIncrement: this.stackLength,
                    curMaxIncrement: this.stack.length,
                    ratio: ratio,
                    prevRatio: lastRatio,
                    maxValue: max,
                    minValue: min
                };
                c.strokeStyle = this.options.color(data);
            }
            c.beginPath();
            c.moveTo(xOffset + i, h);
            c.lineTo(xOffset + i, (h - this.options.bottomOffsetPx) - scaled);
            c.closePath();
            c.stroke();
            lastRatio = ratio;
        }
    };
    /**
     * @access private
     * @returns {number}
     */
    TickerGraph.prototype.max = function () {
        return Math.max.apply(Math, this.stack);
    };
    /**
     * @access private
     * @returns {number}
     */
    TickerGraph.prototype.min = function () {
        return Math.min.apply(Math, this.stack);
    };
    /**
     * Set the color either as a string (eg "#333" or "rgba(0,0,0,50)")
     * or pass a ColorCallback which is called per line
     *
     * @param {string|ColorCallback} color
     */
    TickerGraph.prototype.setColor = function (color) {
        this.options.color = color;
    };
    /**
     * Change the canvas element
     *
     * @param {Object} tickerCanvas The canvas element to draw to
     */
    TickerGraph.prototype.setCanvas = function (tickerCanvas) {
        this.canvas = tickerCanvas;
        this.stackLength = tickerCanvas.offsetWidth;
    };
    return TickerGraph;
}());
if (typeof module !== "undefined" && module.exports) {
    module.exports = TickerGraph;
}
if (typeof define === "function") {
    define([], function () {
        return TickerGraph;
    });
}
//# sourceMappingURL=TickerGraph.js.map