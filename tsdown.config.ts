import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  outExtensions: (ctx) =>
    ctx.format === "es" ? { js: ".mjs", dts: ".d.mts" } : { js: ".cjs", dts: ".d.cts" },
});
