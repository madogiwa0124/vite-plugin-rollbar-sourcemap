import type { Logger } from "../src/logger";

export class MockLogger implements Logger {
  silent: boolean;
  ignoreUploadErrors: boolean;

  constructor(silent: boolean, ignoreUploadErrors: boolean) {
    this.silent = silent;
    this.ignoreUploadErrors = ignoreUploadErrors;
  }
  info = vi.fn().mockImplementation(() => null);
  error = vi.fn().mockImplementation(() => null);
}
