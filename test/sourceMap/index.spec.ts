import { resolve } from "node:path";
import { collectSourceMappings } from "../../src/sourceMap";
import * as util from "../../src/sourceMap/util";

describe("collectSourceMappings", () => {
  it("should collect source mappings", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await collectSourceMappings("https://example.com/", "test/sample/");
    expect(result).toEqual([
      {
        originalFileUrl: "https://example.com/foo.js",
        sourceMapContent: "// source map for foo.js\n",
        sourceMapFilePath: resolve("test/sample/foo.js.map"),
      },
      {
        originalFileUrl: "https://example.com/bar.js",
        sourceMapContent: "// source map for bar.js\n",
        sourceMapFilePath: resolve("test/sample/bar.js.map"),
      },
    ]);
  });

  it("should log no source found", async () => {
    vi.spyOn(util, "calcSourceFile").mockReturnValue(null);
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await collectSourceMappings("https://example.com/", "test/sample/");
    expect(console.error).toBeCalledWith("No source found for 'foo.js.map'.");
    expect(console.error).toBeCalledWith("No source found for 'bar.js.map'.");
    expect(result).toEqual([]);
    vi.resetAllMocks();
  });

  it("should log read error source map", async () => {
    vi.spyOn(util, "readSourceMapFile").mockImplementation(() => {
      throw new Error("Test error");
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const result = await collectSourceMappings("https://example.com/", "test/sample");
    expect(console.error).toBeCalledWith(
      `Error reading sourcemap file: ${resolve("test/sample/foo.js.map")}`,
    );
    expect(console.error).toBeCalledWith(
      `Error reading sourcemap file: ${resolve("test/sample/bar.js.map")}`,
    );
    expect(result).toEqual([]);
  });
});