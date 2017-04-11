interface CallbackData {
	increment: number,
	maxIncrement: number,
	curMaxIncrement: number,
	ratio: number,
	prevRatio: number | null,
	maxValue: number,
	minValue: number
}

/**
 * Callback used for setting per-line color
 *
 * @callback ColorCallback
 * @param {Object} increment, maxIncrement, ratio, prevRatio, maxValue, minValue
 */

interface ColorCallback {
	(data: CallbackData): string;
}

interface TickerGraphOptions {
	color: string | ColorCallback;
	bottomOffsetPx: number;

	[propName: string]: any;
}

class TickerGraph {

	protected context: CanvasRenderingContext2D;

	protected stackLength: number;
	protected stack: number[];

	protected lastPush: number | null;

	protected options: TickerGraphOptions = {
		color: "#7c0",
		bottomOffsetPx: 0
	};

	protected canvas: HTMLCanvasElement;

	/**
	 * @param {Node} tickerCanvas The canvas element to draw to
	 * @param {Object} options The optional settings.
	 * @constructor
	 */
	constructor(canvas: HTMLCanvasElement, options: TickerGraphOptions | null = null) {
		this.setCanvas(canvas);

		this.stackLength = canvas.offsetWidth;
		this.stack = [];

		this.lastPush = null;

		if (options) {
			for (let optName in options) {
				if (options.hasOwnProperty(optName)) {
					this.options[optName] = options[optName];
				}
			}
		}
	}

	/**
	 * Push a number value into the display stack and trigger a redraw
	 *
	 * @param {number} val The number to push
	 */
	public push(val: number) {
		this.lastPush = val;
		this.stack.push(val);
		if (this.stack.length > this.stackLength) {
			this.stack.shift();
		}
		this.draw();
	}

	/**
	 * @access private
	 */
	private draw() {
		this.canvas.width = this.canvas.width + 0;

		let c = this.context,
			h = this.canvas.offsetHeight,
			xOffset = this.stackLength - this.stack.length;

		let max = this.max(),
			min = this.min();

		if (typeof this.options.color == "string") {
			c.strokeStyle = this.options.color;
		}

		let lastRatio = null;
		for (let i = 0; i <= this.stack.length; i++) {

			let val = this.stack[i],
				ratio = ((val - min) / (max - min));

			if (isNaN(ratio)) {
				ratio = 0;
			}

			let scaled = ratio * h;

			if (typeof this.options.color === "function") {
				// @todo update this to be pretty scaled.
				let data: CallbackData = {
					increment: i,
					maxIncrement: this.stackLength,
					curMaxIncrement: this.stack.length,
					ratio: ratio,
					prevRatio: lastRatio,
					maxValue: max,
					minValue: min
				}
				c.strokeStyle = this.options.color(data);
			}

			c.beginPath();
			c.moveTo(xOffset + i, h);

			c.lineTo(xOffset + i, (h - this.options.bottomOffsetPx) - scaled);
			c.closePath();
			c.stroke();

			lastRatio = ratio;
		}
	}

	/**
	 * @access private
	 * @returns {number}
	 */
	protected max(): number {
		return Math.max.apply(Math, this.stack)
	}

	/**
	 * @access private
	 * @returns {number}
	 */
	protected min(): number {
		return Math.min.apply(Math, this.stack)
	}

	/**
	 * Set the color either as a string (eg "#333" or "rgba(0,0,0,50)")
	 * or pass a ColorCallback which is called per line
	 *
	 * @param {string|ColorCallback} color
	 */
	public setColor(color: string | ColorCallback) {
		this.options.color = color;
	}

	/**
	 * Change the canvas element
	 *
	 * @param {Object} tickerCanvas The canvas element to draw to
	 */
	public setCanvas(tickerCanvas: HTMLCanvasElement) {
		let ctx = tickerCanvas.getContext("2d");
		if (!ctx) {
			throw "Failed to get 2d context";
		}
		this.canvas = tickerCanvas;
		this.context = ctx;
		this.stackLength = tickerCanvas.offsetWidth;
	}
}

if (typeof define == "function") {
	define([], function () {
		return TickerGraph;
	});
} else if (typeof module !== "undefined" && module.exports) {
	module.exports = TickerGraph;
}
