import { state } from "../state";
import {
  calcSourceFile,
  collectSourceMapFiles,
  readSourceMapFile,
  resolveSourceMapFile,
} from "./util";

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
    const sourcePath = calcSourceFile({ sourceMapFile, outputDir });
    if (sourcePath === null) return state.logger.error(`No source found for '${sourceMapFile}'.`);

    const sourceMapFilePath = resolveSourceMapFile(outputDir, sourceMapFile);
    return buildSourceMapping({ base, sourcePath, sourceMapFilePath });
  });
  return sourceMappings.filter((mapping) => mapping !== null);
};

const buildSourceMapping = ({
  base,
  sourcePath,
  sourceMapFilePath,
}: {
  base: string;
  sourcePath: string;
  sourceMapFilePath: string;
}): SourceMapping | null => {
  const originalFileUrl = `${base}${sourcePath}`;
  try {
    const sourceMapContent = readSourceMapFile(sourceMapFilePath);
    return { sourceMapContent, sourceMapFilePath, originalFileUrl };
  } catch (_error) {
    state.logger.error(`Error reading sourcemap file: ${sourceMapFilePath}`);
    return null;
  }
};
