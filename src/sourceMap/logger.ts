export const loggedNoSourceFound = (sourceMapPath: string): null => {
  console.error(`No source found for '${sourceMapPath}'`, true);
  return null;
};

export const loggedReadErrorSourceMap = (sourceMapPath: string): null => {
  console.error(`Error reading sourcemap file: ${sourceMapPath}`, true);
  return null;
};
