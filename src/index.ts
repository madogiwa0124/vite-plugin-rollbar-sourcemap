import type { Plugin } from "vite";
import { buildLogger } from "./logger";
import { uploadAllSourceMaps } from "./rollbar/client";
import { collectSourceMappings } from "./sourceMap";
import { setLogger } from "./state";

export type RollbarSourcemapsOptions = {
  accessToken: string;
  version: string;
  baseUrl: string;
  silent?: boolean;
  ignoreUploadErrors?: boolean;
  base?: string;
  outputDir?: string;
};

export default function vitePluginRollbarSourceMap({
  accessToken,
  version,
  baseUrl,
  silent = false,
  ignoreUploadErrors = true,
  base = "/",
  outputDir = "dist",
}: RollbarSourcemapsOptions): Plugin {
  return {
    name: "vite-plugin-rollbar-sourcemap",
    async writeBundle() {
      setLogger(buildLogger(silent, ignoreUploadErrors));
      const sourceMappings = await collectSourceMappings(base, outputDir);
      if (!sourceMappings.length) return;
      await uploadAllSourceMaps(sourceMappings, accessToken, version, baseUrl);
    },
  };
}
