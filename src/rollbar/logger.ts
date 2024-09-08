export const loggedUploadSuccess = (filename: string) => {
  console.info(`Uploaded ${filename} to Rollbar`);
};

export const loggedFaildUpload = (error: Error) => {
  console.error(`Failed to upload sourcemap: ${error}`);
};
