import { describe, expect, it, vi } from "vitest";
import { uploadAllSourceMaps } from "../../src/rollbar/client";
import * as service from "../../src/rollbar/service";
import { state } from "../../src/state";
import { MockLogger } from "../util";

const mockPostRollbarSourcemap = ({ ok }: { ok: boolean }) => {
  const status = ok ? { status: 200, statusText: "OK" } : { status: 500, statusText: "Error" };
  vi.spyOn(service, "postRollbarSourcemap").mockImplementation(
    async () => new Response('{ "key": "value" }', status),
  );
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

    const silent = false;
    state.logger = new MockLogger(silent, false);

    await uploadAllSourceMaps(sourceMappings, "test-token", "1.0.0", "http://example.com");

    expect(service.postRollbarSourcemap).toHaveBeenCalledTimes(2);
    expect(state.logger.info).toHaveBeenCalledWith("Uploaded /file1.js to Rollbar.");
    expect(state.logger.info).toHaveBeenCalledWith("Uploaded /file2.js to Rollbar.");
    vi.clearAllMocks();
  });

  it("should log failed upload", async () => {
    mockPostRollbarSourcemap({ ok: false });

    const ignoreUploadErrors = true;
    state.logger = new MockLogger(false, ignoreUploadErrors);
    await uploadAllSourceMaps(sourceMappings, "test-token", "1.0.0", "http://example.com");

    expect(service.postRollbarSourcemap).toHaveBeenCalledTimes(2);
    expect(state.logger.error).toBeCalledTimes(1);
  });
});
