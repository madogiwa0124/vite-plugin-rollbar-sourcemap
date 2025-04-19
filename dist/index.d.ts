import { Plugin } from "vite";

//#region src/index.d.ts
type RollbarSourcemapsOptions = {
    accessToken: string;
    version: string;
    baseUrl: string;
    silent?: boolean;
    ignoreUploadErrors?: boolean;
    base?: string;
    outputDir?: string;
};
declare function vitePluginRollbarSourceMap({ accessToken, version, baseUrl, silent, ignoreUploadErrors, base, outputDir, }: RollbarSourcemapsOptions): Plugin;

//#endregion
export { RollbarSourcemapsOptions, vitePluginRollbarSourceMap as default };