import { describe, expect, it, vi } from "vitest";
import { uploadAllSourceMaps } from "../../src/rollbar/client";
import { FailedUploadError } from "../../src/rollbar/errors";
import * as logger from "../../src/rollbar/logger";
import * as service from "../../src/rollbar/service";

const mockPostRollbarSourcemap = ({ ok }: { ok: boolean }) => {
  const status = ok ? { status: 200, statusText: "OK" } : { status: 500, statusText: "Error" };
  vi.spyOn(service, "postRollbarSourcemap").mockImplementation(
    async () => new Response('{ "key": "value" }', status),
  );
};

const mockUploadLogger = ({ success }: { success: boolean }) => {
  if (success) {
    vi.spyOn(logger, "loggedUploadSuccess").mockImplementation(() => {});
  } else {
    vi.spyOn(logger, "loggedFaildUpload").mockImplementation(() => {});
  }
};

const sourceMappings = [
  {
    sourceMapContent: "content",
    sourceMapFilePath: "path",
    originalFileUrl: "/file1.js",
  },
  {
    sourceMapContent: "content",
    sourceMapFilePath: "path",
    originalFileUrl: "/file2.js",
  },
];

describe("uploadAllSourceMaps", () => {
  it("should upload all source maps successfully", async () => {
    mockPostRollbarSourcemap({ ok: true });
    mockUploadLogger({ success: true });

    const silent = false;
    await uploadAllSourceMaps(
      sourceMappings,
      "test-token",
      "1.0.0",
      "http://example.com",
      silent,
      false,
    );

    expect(service.postRollbarSourcemap).toHaveBeenCalledTimes(2);
    expect(logger.loggedUploadSuccess).toHaveBeenCalledWith("/file1.js");
    expect(logger.loggedUploadSuccess).toHaveBeenCalledWith("/file2.js");
    vi.clearAllMocks();
  });

  it("should not log success upload if silent is true", async () => {
    mockPostRollbarSourcemap({ ok: true });
    mockUploadLogger({ success: true });

    const silent = true;
    await uploadAllSourceMaps(
      sourceMappings,
      "test-token",
      "1.0.0",
      "http://example.com",
      silent,
      false,
    );

    expect(service.postRollbarSourcemap).toHaveBeenCalledTimes(2);
    expect(logger.loggedUploadSuccess).toHaveBeenCalledTimes(0);
    vi.clearAllMocks();
  });

  it("should log failed upload if ignoreUploadErrors is true", async () => {
    mockPostRollbarSourcemap({ ok: false });
    mockUploadLogger({ success: false });

    const ignoreUploadErrors = true;
    await uploadAllSourceMaps(
      sourceMappings,
      "test-token",
      "1.0.0",
      "http://example.com",
      false,
      ignoreUploadErrors,
    );

    expect(service.postRollbarSourcemap).toHaveBeenCalledTimes(2);
    expect(logger.loggedFaildUpload).toBeCalledTimes(1);
  });

  it("should throw error if upload fails and ignoreUploadErrors is false", async () => {
    mockPostRollbarSourcemap({ ok: false });

    const ignoreUploadErrors = false;
    await expect(
      uploadAllSourceMaps(
        sourceMappings,
        "test-token",
        "1.0.0",
        "http://example.com",
        false,
        ignoreUploadErrors,
      ),
    ).rejects.toThrow(FailedUploadError);
  });
});
