# TickerGraph

[![npm version](https://badge.fury.io/js/ticker-graph.svg)](https://badge.fury.io/js/ticker-graph)

<img src="https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/Ticker.gif" width="100%">

Simple JavaScript Real Time "Ticker Graph"

Requires **no external libraries**.

Here are [some more examples](https://raw.githack.com/donatj/TickerGraph/master/example.html).

## Install

```
npm install ticker-graph
```

## Features

- Auto Scales to **min** and **max** values.
- Color set-able per column via callback.
- Set a color for an individual value when calling `push`.

## Example

To output a simple sine wave like so: ![Small Ticker Sine Wave Example](https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/SmallSineWave.gif)

```html
<script src="src/TickerGraph.js"></script>
<canvas id="cv" width="100" height="40"></canvas>
<script>
	const t = new TickerGraph( document.getElementById("cv") );
	let i = 0;
	setInterval(function(){
		t.push( Math.sin(i++ / 10) );
	}, 20);
</script>
```

Pass a color for a single value with `push`:

```js
t.push(42, { color: "#f00" });
```

This color takes precedence over the graph's color or color callback for that
value. Other values continue to use the graph's color or callback.

Get the current values from oldest to newest with `getValues`. It returns a new
array, so changes to the array do not affect the graph.

```js
const values = t.getValues();
```
