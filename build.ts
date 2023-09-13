import dts from 'bun-plugin-dts';

await Bun.build({
  entrypoints: ['./lib/index.ts'],
  outdir: './dist',
  minify: true,
  plugins: [dts()],
  target: 'node',
});
