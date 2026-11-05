const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const TickerGraph = require('../lib/TickerGraph.cjs');

function makeCanvas(width = 2, height = 10, offsetWidth = 0, offsetHeight = 0) {
	const events = [];
	const context = {
		set strokeStyle(value) { events.push(['color', value]); },
		beginPath() { events.push(['begin']); },
		moveTo(x, y) { events.push(['move', x, y]); },
		lineTo(x, y) { events.push(['line', x, y]); },
		closePath() { events.push(['close']); },
		stroke() { events.push(['stroke']); },
	};
	let canvasWidth = width;
	return {
		events,
		get width() { return canvasWidth; },
		set width(value) { canvasWidth = value; events.push(['clear', value]); },
		height,
		offsetWidth,
		offsetHeight,
		getContext(type) { events.push(['context', type]); return context; },
	};
}

test('draws and scales the latest values with the default color', () => {
	const canvas = makeCanvas();
	const graph = new TickerGraph(canvas);
	graph.push(1);
	assert.deepEqual(canvas.events, [
		['clear', 2], ['context', '2d'], ['color', '#7c0'],
		['begin'], ['move', 1, 10], ['line', 1, 10], ['close'], ['stroke'],
		['begin'], ['move', 2, 10], ['line', 2, 10], ['close'], ['stroke'],
	]);
	canvas.events.length = 0;
	graph.push(3);
	graph.push(2);
	assert.deepEqual(canvas.events.slice(-17), [
		['clear', 2], ['color', '#7c0'],
		['begin'], ['move', 0, 10], ['line', 0, 0], ['close'], ['stroke'],
		['begin'], ['move', 1, 10], ['line', 1, 10], ['close'], ['stroke'],
		['begin'], ['move', 2, 10], ['line', 2, 10], ['close'], ['stroke'],
	]);
});

test('passes callback data for every column and honors drawing options', () => {
	const canvas = makeCanvas(0, 0, 3, 20);
	const data = [];
	const graph = new TickerGraph(canvas, {
		bottomOffsetPx: 2,
		clearOnDraw: false,
		color: (column) => { data.push(column); return `color-${column.increment}`; },
	});
	graph.push(2);
	data.length = 0;
	canvas.events.length = 0;
	graph.push(6);
	assert.deepEqual(data, [
		{ increment: 0, curMaxIncrement: 2, maxIncrement: 3, prevRatio: null, ratio: 0, maxValue: 6, minValue: 2 },
		{ increment: 1, curMaxIncrement: 2, maxIncrement: 3, prevRatio: 0, ratio: 1, maxValue: 6, minValue: 2 },
		{ increment: 2, curMaxIncrement: 2, maxIncrement: 3, prevRatio: 1, ratio: 0, maxValue: 6, minValue: 2 },
	]);
	assert.deepEqual(canvas.events, [
		['color', 'color-0'], ['begin'], ['move', 1, 20], ['line', 1, 18], ['close'], ['stroke'],
		['color', 'color-1'], ['begin'], ['move', 2, 20], ['line', 2, -2], ['close'], ['stroke'],
		['color', 'color-2'], ['begin'], ['move', 3, 20], ['line', 3, 18], ['close'], ['stroke'],
	]);
});

test('changes color and canvas while retaining values and acquiring the new context', () => {
	const first = makeCanvas();
	const second = makeCanvas();
	const graph = new TickerGraph(first);
	graph.push(1);
	graph.setColor('red');
	graph.setCanvas(second);
	graph.push(2);
	assert.deepEqual(second.events.slice(0, 3), [['clear', 2], ['context', '2d'], ['color', 'red']]);
	assert.deepEqual(second.events.filter((event) => event[0] === 'line'), [
		['line', 0, 10], ['line', 1, 0], ['line', 2, 10],
	]);
});

test('uses option changes made by a color callback on later columns', () => {
	const canvas = makeCanvas();
	let graph;
	graph = new TickerGraph(canvas, {
		color: () => { graph.setColor('red'); return 'blue'; },
	});
	graph.push(1);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [['color', 'blue']]);
	canvas.events.length = 0;
	graph.push(2);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [['color', 'red']]);
});

test('uses per-value colors across redraws and restores the graph color', () => {
	class InspectableGraph extends TickerGraph {
		getStack() { return this.stack.slice(); }
	}
	const canvas = makeCanvas(3);
	const graph = new InspectableGraph(canvas, { color: 'green' });
	graph.push(2);
	graph.push(6, { color: 'red' });
	canvas.events.length = 0;
	graph.push(4);
	assert.deepEqual(graph.getStack(), [
		{ n: 2, options: undefined }, { n: 6, options: { color: 'red' } }, { n: 4, options: undefined },
	]);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [
		['color', 'green'], ['color', 'red'], ['color', 'green'],
	]);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'line'), [
		['line', 0, 10], ['line', 1, 0], ['line', 2, 5], ['line', 3, 10],
	]);
	graph.setColor('blue');
	canvas.events.length = 0;
	graph.push(8);
	assert.deepEqual(graph.getStack(), [
		{ n: 6, options: { color: 'red' } }, { n: 4, options: undefined }, { n: 8, options: undefined },
	]);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [
		['color', 'blue'], ['color', 'red'], ['color', 'blue'],
	]);
	canvas.events.length = 0;
	graph.push(10);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [['color', 'blue']]);
});

test('skips the color callback for overridden values while preserving ratios', () => {
	const canvas = makeCanvas(3);
	const data = [];
	const graph = new TickerGraph(canvas, {
		color: (column) => { data.push(column); return `color-${column.increment}`; },
	});
	graph.push(2);
	graph.push(6, { color: 'red' });
	data.length = 0;
	canvas.events.length = 0;
	graph.push(4);
	assert.deepEqual(data, [
		{ increment: 0, curMaxIncrement: 3, maxIncrement: 3, prevRatio: null, ratio: 0, maxValue: 6, minValue: 2 },
		{ increment: 2, curMaxIncrement: 3, maxIncrement: 3, prevRatio: 1, ratio: 0.5, maxValue: 6, minValue: 2 },
		{ increment: 3, curMaxIncrement: 3, maxIncrement: 3, prevRatio: 0.5, ratio: 0, maxValue: 6, minValue: 2 },
	]);
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [
		['color', 'color-0'], ['color', 'red'], ['color', 'color-2'], ['color', 'color-3'],
	]);
});

test('preserves protected state and custom bounds in subclasses', () => {
	class CustomGraph extends TickerGraph {
		max() { return 10; }
		min() { return 0; }
		getState() { return { stack: this.stack.slice(), lastPush: this.lastPush }; }
	}
	const canvas = makeCanvas();
	const graph = new CustomGraph(canvas);
	graph.push(5);
	assert.deepEqual(graph.getState(), { stack: [{ n: 5, options: undefined }], lastPush: 5 });
	assert.deepEqual(canvas.events.filter((event) => event[0] === 'line'), [
		['line', 1, 5], ['line', 2, 10],
	]);
});

test('reports invalid canvas dimensions and missing contexts', () => {
	assert.throws(() => new TickerGraph(makeCanvas(0)).push(1), /Invalid stack length: 0/);
	assert.throws(() => new TickerGraph(makeCanvas(2, 0)).push(1), /Invalid canvas height: 0/);
	const canvas = makeCanvas();
	canvas.getContext = () => null;
	assert.throws(() => new TickerGraph(canvas).push(1), /Failed to get 2d context/);
});

test('each package entry point exposes a working graph constructor', async () => {
	const module = await import('../lib/TickerGraph.mjs');
	const constructors = [TickerGraph, module.default];
	for (const file of ['TickerGraph.js', 'TickerGraph.min.js']) {
		const sandbox = {};
		vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../lib', file), 'utf8'), sandbox);
		constructors.push(sandbox.TickerGraph);
	}
	for (const Graph of constructors) {
		const canvas = makeCanvas();
		const graph = new Graph(canvas);
		graph.push(1);
		assert.deepEqual(canvas.events.filter((event) => event[0] === 'line'), [
			['line', 1, 10], ['line', 2, 10],
		]);
		canvas.events.length = 0;
		graph.push(2, { color: 'red' });
		assert.deepEqual(canvas.events.filter((event) => event[0] === 'color'), [
			['color', '#7c0'], ['color', 'red'], ['color', '#7c0'],
		]);
	}
});
