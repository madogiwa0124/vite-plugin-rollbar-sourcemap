export class Logger {
  silent: boolean;
  ignoreUploadErrors: boolean;
  constructor(silent: boolean, ignoreUploadErrors: boolean) {
    this.silent = silent;
    this.ignoreUploadErrors = ignoreUploadErrors;
  }

  info(message: string) {
    if (!this.silent) console.log(message);
    return null;
  }

  error(message: string, error: Error | null = null) {
    if (!this.silent) console.error(message);
    if (error && !this.ignoreUploadErrors) throw error;
    return null;
  }
}

export const buildLogger = (silent: boolean, ignoreUploadErrors: boolean) => {
  return new Logger(silent, ignoreUploadErrors);
};
