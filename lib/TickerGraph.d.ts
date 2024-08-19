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
    protected canvas: HTMLCanvasElement;
    protected context: CanvasRenderingContext2D | null;
    protected stack: number[];
    protected lastPush: number | null;
    protected options: TickerGraphOptions;
    /**
     * @param {Node} tickerCanvas The canvas element to draw to
     * @param {Object} options The optional settings.
     * @constructor
     */
    constructor(canvas: HTMLCanvasElement, options?: Partial<TickerGraphOptions>);
    /**
     * Push a number value into the display stack and trigger a redraw
     *
     * @param {number} val The number to push
     */
    push(val: number): void;
    private stackLength;
    private getContext;
    /**
     * @access private
     */
    private draw;
    /**
     * @access private
     * @returns {number}
     */
    protected max(): number;
    /**
     * @access private
     * @returns {number}
     */
    protected min(): number;
    /**
     * Set the color either as a string (eg "#333" or "rgba(0,0,0,50)")
     * or pass a ColorCallback which is called per line
     *
     * @param {string|ColorCallback} color
     */
    setColor(color: string | ColorCallback): void;
    /**
     * Change the canvas element
     *
     * @param {Object} tickerCanvas The canvas element to draw to
     */
    setCanvas(tickerCanvas: HTMLCanvasElement): void;
}
export {};
