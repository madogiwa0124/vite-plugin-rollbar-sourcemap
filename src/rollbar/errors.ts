export class FaildUploadError extends Error {
  constructor(message: string, filename: string) {
    super(message);
    this.message = `Failed to upload ${filename} to Rollbar: ${message}`;
    this.name = "FailedUploadError";
  }
}

export class FaildPostError extends Error {
  constructor(statusText: string) {
    super();
    this.message = `Failed to pots sourcemap to Rollbar: ${statusText}`;
    this.name = "FaildPostError";
  }
}
