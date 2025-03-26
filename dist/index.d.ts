import { Plugin } from 'vite';

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

export { vitePluginRollbarSourceMap as default };
export type { RollbarSourcemapsOptions };
