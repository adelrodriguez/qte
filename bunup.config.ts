import { defineConfig } from "bunup"

export default defineConfig({
  dts: true,
  entry: ["src/index.ts"],
  format: "esm",
  minify: true,
  outDir: "dist",
  sourcemap: false,
  target: "node",
})
