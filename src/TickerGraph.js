"use strict";

/**
 * Callback used for setting per-line color
 *
 * @callback setColorCallback
 * @param {Object} increment, maxIncrement, ratio, prevRatio, maxValue, minValue
 */

/**
 * @param {Object} tickerCanvas The canvas element to draw to
 * @constructor
 */
var TickerGraph = function( tickerCanvas ) {
	this.canvas = tickerCanvas;
	this.context = this.canvas.getContext("2d");

	this.stackLength = this.canvas.offsetWidth;
	this.stack = [0];

	this.color = "#0F0";
};

TickerGraph.prototype = {
	/**
	 * Push a number value into the display stack and trigger a redraw
	 *
	 * @param {number} val The number to push
	 */
	push: function( val ) {
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
			h = this.canvas.offsetHeight;

		var max = this.max(),
			min = this.min();

		if( typeof this.color == "string" ) {
			c.strokeStyle = this.color;
		}

		var lastRatio = null;
		for( var i = 0; i <= this.stack.length; i++ ) {
			var val = this.stack[i],
				ratio = ((val - min) / (max - min)),
				scaled = ratio * h;

			if( typeof this.color == "function" ) {
				// @todo update this to be pretty scaled.
				c.strokeStyle = this.color({
					increment   : i,
					maxIncrement: this.stack.length,
					ratio       : ratio,
					prevRatio   : lastRatio,
					maxValue    : max,
					minValue    : min
				});
			}

			c.beginPath();
			c.moveTo(i, h);

			c.lineTo(i, h - scaled);
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
		this.color = color;
	},

	/**
	 * Change the canvas element
	 *
	 * @param {Object} tickerCanvas The canvas element to draw to
	 */
	setCanvas: function( tickerCanvas ) {
		this.canvas = tickerCanvas;
	}
};

if( typeof define == "function" ) {
	define([], function() {
		return TickerGraph;
	});
}