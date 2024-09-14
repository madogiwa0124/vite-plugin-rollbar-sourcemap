export class FailedUploadError extends Error {
  constructor(message: string, filename: string) {
    super(message);
    this.message = `Failed to upload ${filename} to Rollbar: ${message}.`;
    this.name = "FailedUploadError";
  }
}

export class FailedPostError extends Error {
  constructor(message: string, statusText: string) {
    super(message);
    this.message = `Failed to post sourcemap to Rollbar with ${statusText}: ${message}.`;
    this.name = "FaildPostError";
  }
}
