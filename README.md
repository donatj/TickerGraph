# TickerGraph

[![npm version](https://badge.fury.io/js/ticker-graph.svg)](https://badge.fury.io/js/ticker-graph)

![Ticker Image Example](https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/Ticker.gif)

Simple JavaScript Real Time "Ticker Graph"

Requires **no external libraries**. It is **require-able** with RequireJS but RequireJS is by no means *required*.

Dead simple, should work in any browser that supports the `<canvas>` tag.

Here are [some more examples](https://raw.githack.com/donatj/TickerGraph/master/example.html).

## Features

- Auto Scales to **min** and **max** values.
- Color set-able per column via callback.

## Dead Simple Example

To output a simple sine wave like so: ![Small Ticker Sine Wave Example](https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/SmallSineWave.gif)

```html
<script src="src/TickerGraph.js"></script>
<canvas id="cv" width="100" height="40"></canvas>
<script>
	var t = new TickerGraph( document.getElementById("cv") );
	var i = 0;
	setInterval(function(){
		t.push( Math.sin(i++ / 10) );
	}, 20);
</script>
```
