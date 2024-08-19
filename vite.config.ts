import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    sourcemap: true,
	outDir: path.resolve(__dirname, "lib"),
    lib: {
      entry: path.resolve(__dirname, 'src/TickerGraph.ts'),
      name: 'TickerGraph',
	  fileName: (type) => type === 'umd' ? "TickerGraph.js" : `TickerGraph.${type}.js`,
      formats: ['umd', 'es'],
    },
	minify: false,
    rollupOptions: {
      output: {
        name: 'TickerGraph'
      }
    }
  }
});