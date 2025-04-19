import commonjs from "@rollup/plugin-commonjs";
import replace from "@rollup/plugin-replace";
import typescript from "@rollup/plugin-typescript";
import { dts } from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    external: ["node:fs", "node:path"],
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
    plugins: [
      replace({
        "import.meta.vitest": "undefined",
        preventAssignment: true,
      }),
      typescript(),
      commonjs(),
    ],
  },
  {
    input: "src/index.ts",
    output: [{ format: "es", file: "dist/index.d.ts" }],
    plugins: [dts()],
  },
];
