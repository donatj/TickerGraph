"use strict";

/**
 * Callback used for setting per-line color
 *
 * @callback setColorCallback
 * @param {Object} increment, maxIncrement, ratio, prevRatio, maxValue, minValue
 */

/**
 * @param {Object} tickerCanvas The canvas element to draw to
 * @param {Object} options The optional settings.
 * @constructor
 */
var TickerGraph = function( tickerCanvas, options ) {
	this.canvas = tickerCanvas;
	this.context = this.canvas.getContext("2d");

	this.stackLength = this.canvas.offsetWidth;
	this.stack = [];

	this.lastPush = null;

	this.options = {
		color         : "#7c0",
		bottomOffsetPx: 0
	};

	if( typeof options == "object" ) {
		for( var optName in options ) {
			if( options.hasOwnProperty(optName) ) {
				this.options[optName] = options[optName];
			}
		}
	}
};

TickerGraph.prototype = {
	/**
	 * Push a number value into the display stack and trigger a redraw
	 *
	 * @param {number} val The number to push
	 */
	push: function( val ) {
		this.lastPush = val;
		this.stack.push(val);
		if( this.stack.length > this.stackLength ) {
			this.stack.shift();
		}
		this.draw();
	},

	/**
	 * @access private
	 */
	draw: function() {
		this.canvas.width = this.canvas.width + 0;

		var c = this.context,
			h = this.canvas.offsetHeight,
			xOffset = this.stackLength - this.stack.length;

		var max = this.max(),
			min = this.min();

		if( typeof this.options.color == "string" ) {
			c.strokeStyle = this.options.color;
		}

		var lastRatio = null;
		for( var i = 0; i <= this.stack.length; i++ ) {

			var val = this.stack[i],
				ratio = ((val - min) / (max - min));

			if( isNaN(ratio) ) {
				ratio = 0;
			}

			var scaled = ratio * h;

			if( typeof this.options.color == "function" ) {
				// @todo update this to be pretty scaled.
				c.strokeStyle = this.options.color({
					increment      : i,
					maxIncrement   : this.stackLength,
					curMaxIncrement: this.stack.length,
					ratio          : ratio,
					prevRatio      : lastRatio,
					maxValue       : max,
					minValue       : min
				});
			}

			c.beginPath();
			c.moveTo(xOffset + i, h);

			c.lineTo(xOffset + i, (h - this.options.bottomOffsetPx) - scaled);
			c.closePath();
			c.stroke();

			lastRatio = ratio;
		}
	},

	/**
	 * @access private
	 * @returns {number}
	 */
	max: function() {
		return Math.max.apply(Math, this.stack)
	},

	/**
	 * @access private
	 * @returns {number}
	 */
	min: function() {
		return Math.min.apply(Math, this.stack)
	},

	/**
	 * Set the color either as a string (eg "#333" or "rgba(0,0,0,50)")
	 * or pass a setColorCallback which is called per line
	 *
	 * @param {string|setColorCallback} color
	 */
	setColor: function( color ) {
		this.options.color = color;
	},

	/**
	 * Change the canvas element
	 *
	 * @param {Object} tickerCanvas The canvas element to draw to
	 */
	setCanvas: function( tickerCanvas ) {
		this.canvas = tickerCanvas;
		this.context = this.canvas.getContext("2d");
		this.stackLength = this.canvas.offsetWidth;
	}
};

if( typeof define == "function" ) {
	define([], function() {
		return TickerGraph;
	});
}