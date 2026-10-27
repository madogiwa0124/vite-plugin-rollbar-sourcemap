import { Plugin } from "vite";
export type RollbarSourcemapsOptions = {
  accessToken: string;
  version: string;
  baseUrl: string;
  silent?: boolean;
  ignoreUploadErrors?: boolean;
  base?: string;
  outputDir?: string;
};
export default function vitePluginRollbarSourceMap({ accessToken, version, baseUrl, silent, ignoreUploadErrors, base, outputDir }: RollbarSourcemapsOptions): Plugin;