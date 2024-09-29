import * as logger from "../src/logger";
import * as client from "../src/rollbar/client";
import * as sourceMap from "../src/sourceMap";
import vitePluginRollbarSourceMap, { type RollbarSourcemapsOptions } from "../src";
import type { SourceMapping } from "../src/sourceMap";
import type { Plugin } from "vite";

const mockSouceMappings: SourceMapping[] = [
  {
    originalFileUrl: "https://example.com/foo.js",
    sourceMapContent: "// source map for foo.js\n",
    sourceMapFilePath: "test/sample/foo.js.map",
  },
  {
    originalFileUrl: "https://example.com/bar.js",
    sourceMapContent: "// source map for bar.js\n",
    sourceMapFilePath: "test/sample/bar.js.map",
  },
];

const options = {
  accessToken: "test-token",
  version: "1.0.0",
  baseUrl: "https://example.com",
  base: "/base",
  outputDir: "dist",
} satisfies RollbarSourcemapsOptions;

const pluginWriteBundle = async (plugin: Plugin) => {
  // @ts-expect-error
  plugin.writeBundle();
};

describe("RollbarSourcemapsOptions", () => {
  beforeEach(() => {
    vi.spyOn(client, "uploadAllSourceMaps");
    vi.resetAllMocks();
  });

  it("should create a plugin with the options", () => {
    const plugin = vitePluginRollbarSourceMap(options);
    expect(plugin.name).toBe("vite-plugin-rollbar-sourcemap");
    expect(plugin.writeBundle).toBeInstanceOf(Function);
  });

  it("should create a logger with default options", async () => {
    vi.spyOn(logger, "buildLogger");
    vi.spyOn(sourceMap, "collectSourceMappings").mockResolvedValue(mockSouceMappings);
    await pluginWriteBundle(vitePluginRollbarSourceMap(options));
    expect(logger.buildLogger).toHaveBeenLastCalledWith(false, true);
  });

  it("should create a logger with options", async () => {
    vi.spyOn(sourceMap, "collectSourceMappings").mockResolvedValue(mockSouceMappings);
    const overrideOptions = {
      ...options,
      silent: true,
      ignoreUploadErrors: false,
    };
    await pluginWriteBundle(vitePluginRollbarSourceMap(overrideOptions));
    expect(logger.buildLogger).toHaveBeenLastCalledWith(true, false);
  });

  it("should upload sourcemaps with collected sourocemaps.", async () => {
    vi.spyOn(sourceMap, "collectSourceMappings").mockResolvedValue(mockSouceMappings);
    await pluginWriteBundle(vitePluginRollbarSourceMap(options));
    expect(sourceMap.collectSourceMappings).toHaveBeenCalledWith(options.base, options.outputDir);
    expect(client.uploadAllSourceMaps).toHaveBeenCalledWith(
      mockSouceMappings,
      options.accessToken,
      options.version,
      options.baseUrl,
    );
  });

  it("should not upload sourcemaps with empty sourocemaps.", async () => {
    vi.spyOn(sourceMap, "collectSourceMappings").mockResolvedValue([]);
    await pluginWriteBundle(vitePluginRollbarSourceMap(options));
    expect(sourceMap.collectSourceMappings).toHaveBeenCalledWith(options.base, options.outputDir);
    expect(client.uploadAllSourceMaps).toHaveBeenCalledTimes(0);
  });
});
