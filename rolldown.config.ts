import { defineConfig } from "rolldown";
import { dts } from "rolldown-plugin-dts";

export default defineConfig([
  {
    input: "src/index.ts",
    external: ["node:fs", "node:path"],
    define: {
      "import.meta.vitest": "undefined",
    },
    output: [
      {
        format: "es",
        sourcemap: true,
        file: "dist/index.esm.js",
        exports: "auto",
      },
      {
        format: "cjs",
        sourcemap: true,
        file: "dist/index.umd.cjs",
        exports: "auto",
      },
    ],
  },
  {
    input: "src/index.ts",
    external: ["node:fs", "node:path"],
    output: [{ format: "es", dir: "dist" }],
    plugins: [dts({ emitDtsOnly: true })],
  },
]);
