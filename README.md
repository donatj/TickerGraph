# TickerGraph

![Ticker Image Example](https://raw.githubusercontent.com/donatj/TickerGraph/readme-images/Ticker.gif)

Simple JavaScript Real Time Ticker Graph

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
