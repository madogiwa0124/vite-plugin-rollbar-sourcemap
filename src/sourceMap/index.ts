import { loggedNoSourceFound, loggedReadErrorSourceMap } from "./logger";
import { calcSourcePath, collectSourceMapFiles, readSourceMapFile, resolveSourceMap } from "./util";

export type SourceMapping = {
  sourceMapContent: string;
  sourceMapFilePath: string;
  originalFileUrl: string;
};

const SOURCE_MAP_GLOB = "./**/*.map";
export const collectSourceMappings = async (
  base: string,
  outputDir: string,
  sourceMapGlob = SOURCE_MAP_GLOB,
): Promise<SourceMapping[]> => {
  const sourceMapFiles = await collectSourceMapFiles(sourceMapGlob, outputDir);
  const sourceMappings = sourceMapFiles.map((sourceMapFile) => {
    const sourcePath = calcSourcePath({ sourceMapFile, outputDir });
    if (sourcePath === null) return loggedNoSourceFound(sourceMapFile);

    const sourceMapFilePath = resolveSourceMap(outputDir, sourceMapFile);
    return buildSourceMapping({ base, sourcePath, sourceMapFilePath });
  });
  return sourceMappings.filter((mapping) => mapping !== null);
};

const buildSourceMapping = ({
  base,
  sourcePath,
  sourceMapFilePath,
  ignoreErrorLogging = false,
}: {
  base: string;
  sourcePath: string;
  sourceMapFilePath: string;
  ignoreErrorLogging?: boolean;
}): SourceMapping | null => {
  const originalFileUrl = `${base}${sourcePath}`;
  try {
    const sourceMapContent = readSourceMapFile(sourceMapFilePath);
    return { sourceMapContent, sourceMapFilePath, originalFileUrl };
  } catch (_error) {
    if (!ignoreErrorLogging) loggedReadErrorSourceMap(sourceMapFilePath);
    return null;
  }
};
