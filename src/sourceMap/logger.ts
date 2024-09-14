export const loggedNoSourceFound = (sourceMapPath: string): null => {
  console.error(`No source found for '${sourceMapPath}'.`);
  return null;
};

export const loggedReadErrorSourceMap = (sourceMapPath: string): null => {
  console.error(`Error reading sourcemap file: ${sourceMapPath}`);
  return null;
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;

  describe("loggedNoSourceFound", () => {
    it("should log no source found", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      loggedNoSourceFound("foo.js.map");
      expect(console.error).toBeCalledWith("No source found for 'foo.js.map'.");
    });
  });

  describe("loggedReadErrorSourceMap", () => {
    it("should log read error source map", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      loggedReadErrorSourceMap("foo.js.map");
      expect(console.error).toBeCalledWith("Error reading sourcemap file: foo.js.map");
    });
  });
}
