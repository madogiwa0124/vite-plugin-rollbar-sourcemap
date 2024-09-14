import { glob } from "glob";
import { resolve } from "node:path";
import { existsSync, readFileSync } from "node:fs";

export const collectSourceMapFiles = async (
  souceMapGlob: string,
  outputDir: string,
): Promise<string[]> => {
  return await glob(souceMapGlob, { cwd: outputDir });
};

export const resolveSourceMap = (outputDir: string, sourceMapFile: string): string => {
  return resolve(outputDir, sourceMapFile);
};

export const calcSourceFile = ({
  sourceMapFile,
  outputDir,
}: {
  sourceMapFile: string;
  outputDir: string;
}): string | null => {
  const sourceFile = sourceMapFile.replace(/\.map$/, "");
  const sourcePath = resolve(outputDir, sourceFile);
  if (!existsSync(sourcePath)) return null;
  return sourceFile;
};

export const readSourceMapFile = (sourceMapPath: string): string => {
  return readFileSync(sourceMapPath, "utf8");
};

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;

  describe("collectSourceMapFiles", () => {
    it("should collect source map files", async () => {
      const result = await collectSourceMapFiles("**/*.map", "test/sample");
      expect(result).toEqual(["foo.js.map", "bar.js.map"]);
    });
  });

  describe("resolveSourceMap", () => {
    it("should resolve source map file path", () => {
      const result = resolveSourceMap("test/sample", "foo.js.map");
      expect(result).toBe(resolve("test/sample/foo.js.map"));
    });
  });

  describe("calcSourcePath", () => {
    it("should calculate source path", () => {
      const result = calcSourceFile({
        sourceMapFile: "foo.js.map",
        outputDir: "test/sample",
      });
      expect(result).toBe(resolve("test/sample/foo.js"));
    });
  });
}
