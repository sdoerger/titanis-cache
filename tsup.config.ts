import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry file
  outDir: "dist",
  format: ["cjs", "esm"], // CommonJS + ESM
  dts: true, // Generate .d.ts types
  splitting: false,
  clean: true, // Remove old builds
  minify: false, // No minification
  sourcemap: false,
});
