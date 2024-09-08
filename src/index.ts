import type { Plugin } from "vite";
import { collectSourceMappings } from "./sourceMap";
import { uploadAllSourceMaps } from "./rollbar/client";

type RollbarSourcemapsOptions = {
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
      const sourceMappings = await collectSourceMappings(base, outputDir);
      if (!sourceMappings.length) return;
      await uploadAllSourceMaps(
        sourceMappings,
        accessToken,
        version,
        baseUrl,
        silent,
        ignoreUploadErrors,
      );
    },
  };
}
