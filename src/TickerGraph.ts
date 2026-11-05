/*!
 * Copyright (c) Jesse G. Donat and contributors.
 * Licensed under the MIT License.
 *
 * This notice may not be removed or altered from any source distribution.
 */

export interface CallbackData {
	increment: number;
	maxIncrement: number;
	curMaxIncrement: number;
	ratio: number;
	prevRatio: number|null;
	maxValue: number;
	minValue: number;
}

/**
 * Callback used for setting per-line color
 *
 * @callback ColorCallback
 * @param {Object} increment, maxIncrement, ratio, prevRatio, maxValue, minValue
 */

export type ColorCallback = (data: CallbackData) => string;

export interface TickerGraphOptions {
	color: string|ColorCallback;
	bottomOffsetPx: number;
	clearOnDraw: boolean;
}

export interface TickerGraphPushOptions {
	color?: string;
}

type StackEntry = { n: number; options?: TickerGraphPushOptions };

function validateStackLength(length: number): number {
	if (length <= 0) {
		throw new Error(`Invalid stack length: ${length}`);
	}

	return length;
}

function calculateColumn(value: number|undefined, min: number, max: number, height: number): { ratio: number; scaled: number } {
	const rawRatio = value === undefined ? NaN : (value - min) / (max - min);
	const ratio = isNaN(rawRatio) ? 0 : rawRatio;

	return { ratio, scaled: ratio * height };
}

export default class TickerGraph {

	protected context: CanvasRenderingContext2D|null = null;
	protected stack: StackEntry[] = [];

	protected lastPush: number|null = null;

	protected options: TickerGraphOptions = {
		bottomOffsetPx: 0,
		color: "#7c0",
		clearOnDraw: true,
	};

	/**
	 * @param {Node} tickerCanvas The canvas element to draw to
	 * @param {Object} options The optional settings.
	 * @constructor
	 */
	constructor(
		protected canvas: HTMLCanvasElement,
		options: Partial<TickerGraphOptions> = {}
	) {
		this.setCanvas(canvas);
		this.options = { ...this.options, ...options };
	}

	/**
	 * Push a number value into the display stack and trigger a redraw
	 *
	 * @param {number} val The number to push
	 * @param {TickerGraphPushOptions} options Optional color for this value
	 */
	public push(val: number, options?: TickerGraphPushOptions): void {
		this.lastPush = val;
		this.stack.push({ n: val, options });
		if (this.stack.length > this.stackLength()) {
			this.stack.shift();
		}
		this.draw();
	}

	private stackLength(): number {
		return validateStackLength(this.canvas.width || this.canvas.offsetWidth);
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

	private draw(): void {
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

		if (typeof this.options.color === "string") {
			c.strokeStyle = this.options.color;
		}

		let lastRatio: number|null = null;
		let lastColorWasOverride = false;
		for (let i = 0; i <= this.stack.length; i++) {

			const entry: StackEntry|undefined = this.stack[i];
			const { ratio, scaled } = calculateColumn(entry?.n, min, max, h);

			const color = entry?.options?.color;
			if (color !== undefined) {
				c.strokeStyle = color;
				lastColorWasOverride = true;
			} else if (typeof this.options.color === "function") {
				// @todo update this to be pretty scaled.
				const data: CallbackData = {
					increment: i,

					curMaxIncrement: this.stack.length,
					maxIncrement: stackLength,

					prevRatio: lastRatio,
					ratio,

					maxValue: max,
					minValue: min,
				};
				c.strokeStyle = this.options.color(data);
				lastColorWasOverride = false;
			} else if (lastColorWasOverride) {
				c.strokeStyle = this.options.color;
				lastColorWasOverride = false;
			}

			c.beginPath();
			c.moveTo(xOffset + i, h);

			c.lineTo(xOffset + i, (h - this.options.bottomOffsetPx) - scaled);
			c.closePath();
			c.stroke();

			lastRatio = ratio;
		}
	}

	protected max(): number {
		return Math.max(...this.stack.map((entry) => entry.n));
	}

	protected min(): number {
		return Math.min(...this.stack.map((entry) => entry.n));
	}

	/**
	 * Set the color either as a string (eg "#333" or "rgba(0,0,0,50)")
	 * or pass a ColorCallback which is called per line
	 *
	 * @param {string|ColorCallback} color
	 */
	public setColor(color: string|ColorCallback): void {
		this.options.color = color;
	}

	/**
	 * Change the canvas element
	 *
	 * @param {Object} tickerCanvas The canvas element to draw to
	 */
	public setCanvas(tickerCanvas: HTMLCanvasElement): void {
		this.canvas = tickerCanvas;
		this.context = null;
	}
}
