declare var module: { exports: any };

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
}

class TickerGraph {

	protected context: CanvasRenderingContext2D | null = null;

	protected stackLength: number;
	protected stack: number[];

	protected lastPush: number | null;

	protected options: TickerGraphOptions = {
		color: "#7c0",
		bottomOffsetPx: 0
	};

	/**
	 * @param {Node} tickerCanvas The canvas element to draw to
	 * @param {Object} options The optional settings.
	 * @constructor
	 */
	constructor(protected canvas: HTMLCanvasElement, options: Partial<TickerGraphOptions> = {}) {
		this.setCanvas(canvas);

		this.stackLength = canvas.offsetWidth;
		this.stack = [];

		this.lastPush = null;

		this.options = { ...this.options, ...options };
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

	private getContext(): CanvasRenderingContext2D {
		if (this.context) {
			return this.context;
		}

		this.context = this.canvas.getContext("2d");
		if (!this.context) {
			throw "Failed to get 2d context";
		}

		return this.context;
	}

	/**
	 * @access private
	 */
	private draw() {
		this.canvas.width = this.canvas.width + 0;

		let c = this.getContext(),
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
		this.canvas = tickerCanvas;
		this.context = null;
		this.stackLength = tickerCanvas.offsetWidth;
	}
}

if (typeof module !== "undefined" && module.exports) {
	module.exports = TickerGraph;
}

if (typeof define === "function") {
	define([], () => {
		return TickerGraph;
	});
}