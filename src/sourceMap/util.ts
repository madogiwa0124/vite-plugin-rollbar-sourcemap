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

export const calcSourcePath = ({
  sourceMapFile,
  outputDir,
}: {
  sourceMapFile: string;
  outputDir: string;
}): string | null => {
  const sourcePath = sourceMapFile.replace(/\.map$/, "");
  const sourceFilename = resolve(outputDir, sourcePath);
  if (!existsSync(sourceFilename)) return null;
  return sourcePath;
};

export const readSourceMapFile = (sourceMapPath: string): string => {
  return readFileSync(sourceMapPath, "utf8");
};
