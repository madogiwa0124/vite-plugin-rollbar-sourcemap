import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    includeSource: ["src/**/*.{js,ts}"],
    coverage: {
      reporter: ["text"],
    },
  },
  define: {
    "import.meta.vitest": "undefined",
  },
});
