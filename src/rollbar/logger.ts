export const loggedUploadSuccess = (filename: string) => {
  console.info(`Uploaded ${filename} to Rollbar.`);
};

export const loggedFaildUpload = (error: Error) => {
  console.error(`Failed to upload sourcemap: ${error}.`);
};

if (import.meta.vitest) {
  const { describe, it, expect, vi } = import.meta.vitest;

  describe("loggedUploadSuccess", () => {
    it("should log upload success", () => {
      vi.spyOn(console, "info").mockImplementation(() => {});
      loggedUploadSuccess("foo.js.map");
      expect(console.info).toBeCalledWith("Uploaded foo.js.map to Rollbar.");
    });
  });

  describe("loggedFaildUpload", () => {
    it("should log faild upload", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      loggedFaildUpload(new Error());
      expect(console.error).toBeCalledWith("Failed to upload sourcemap: Error.");
    });
  });
}
