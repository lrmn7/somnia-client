import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
    "discord/index": "src/discord/index.ts",
  },
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "node22",
  outDir: "dist",
  splitting: true,
  treeshake: true,
  external: ["discord.js"],
});
