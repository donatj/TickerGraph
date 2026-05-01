# TickerGraph

[![npm version](https://badge.fury.io/js/ticker-graph.svg)](https://badge.fury.io/js/ticker-graph)

<img src="https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/Ticker.gif" width="100%">

Simple JavaScript Real Time "Ticker Graph"

Dead simple, should work in any browser that supports the `<canvas>` tag.

Here are [some more examples](https://raw.githack.com/donatj/TickerGraph/master/example.html).

## Features

- Auto Scales to **min** and **max** values.
- Color set-able per column via callback.

## Dead Simple Example

To output a simple sine wave like so: ![Small Ticker Sine Wave Example](https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/SmallSineWave.gif)

```js
import { TickerGraph } from 'ticker-graph';

const t = new TickerGraph(document.getElementById('cv'));
let i = 0;
setInterval(() => t.push(Math.sin(i++ / 10)), 20);
```
