import autoExternal from "rollup-plugin-auto-external";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import { dts } from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
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
    plugins: [typescript(), autoExternal(), commonjs()],
  },
  {
    input: "src/index.ts",
    output: [{ format: "es", file: "dist/index.d.ts" }],
    plugins: [dts()],
  },
];
