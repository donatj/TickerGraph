interface CallbackData {
	increment: number;
	maxIncrement: number;
	curMaxIncrement: number;
	ratio: number;
	prevRatio: number | null;
	maxValue: number;
	minValue: number;
}

/**
 * Callback used for setting per-line color
 *
 * @callback ColorCallback
 * @param {Object} increment, maxIncrement, ratio, prevRatio, maxValue, minValue
 */

type ColorCallback = (data: CallbackData) => string;

interface TickerGraphOptions {
	color: string | ColorCallback;
	bottomOffsetPx: number;
	clearOnDraw: boolean;
}

export default class TickerGraph {

	protected context: CanvasRenderingContext2D | null = null;
	protected stack: number[] = [];

	protected lastPush: number | null = null;

	protected options: TickerGraphOptions = {
		bottomOffsetPx: 0,
		color:          "#7c0",
		clearOnDraw:    true,
	};

	/**
	 * @param {Node} tickerCanvas The canvas element to draw to
	 * @param {Object} options The optional settings.
	 * @constructor
	 */
	constructor(protected canvas: HTMLCanvasElement, options: Partial<TickerGraphOptions> = {}) {
		this.setCanvas(canvas);
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
		if (this.stack.length > this.stackLength()) {
			this.stack.shift();
		}
		this.draw();
	}

	private stackLength(): number {
		const l = this.canvas.width || this.canvas.offsetWidth;
		if (l <= 0) {
			throw new Error(`Invalid stack length: ${l}`);
		}

		return l;
	}

	private getContext(): CanvasRenderingContext2D {
		if (this.context) {
			return this.context;
		}

		this.context = this.canvas.getContext("2d");
		if (!this.context) {
			throw new Error("Failed to get 2d context");
		}

		return this.context;
	}

	/**
	 * @access private
	 */
	private draw() {
		const stackLength = this.stackLength();

		if (this.options.clearOnDraw) {
			this.canvas.width = this.canvas.width + 0;
		}

		const c = this.getContext();
		const h = this.canvas.height || this.canvas.offsetHeight;
		if (!h) {
			throw new Error(`Invalid canvas height: ${h}`);
		}

		const xOffset = stackLength - this.stack.length;

		const max = this.max();
		const min = this.min();

		if (typeof this.options.color == "string") {
			c.strokeStyle = this.options.color;
		}

		let lastRatio = null;
		for (let i = 0; i <= this.stack.length; i++) {

			const val = this.stack[i];
			let ratio = ((val - min) / (max - min));

			if (isNaN(ratio)) {
				ratio = 0;
			}

			const scaled = ratio * h;

			if (typeof this.options.color === "function") {
				// @todo update this to be pretty scaled.
				const data: CallbackData = {
					increment: i,

					curMaxIncrement: this.stack.length,
					maxIncrement:    stackLength,

					prevRatio: lastRatio,
					ratio,

					maxValue: max,
					minValue: min,
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
	}

	/**
	 * @access private
	 * @returns {number}
	 */
	protected max(): number {
		return Math.max(...this.stack);
	}

	/**
	 * @access private
	 * @returns {number}
	 */
	protected min(): number {
		return Math.min(...this.stack);
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
	}
}
