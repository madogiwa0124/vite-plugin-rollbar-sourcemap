import type { Plugin } from "vite";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { glob } from "glob";
import { ROLLBAR_ENDPOINT } from "./constants";

type rollbarSourcemapsOptions = {
  accessToken: string;
  version: string;
  baseUrl: string;
  silent?: boolean;
  ignoreUploadErrors?: boolean;
  base?: string;
  outputDir?: string;
};
export default function rollbarSourcemaps({
  accessToken,
  version,
  baseUrl,
  silent = false,
  ignoreUploadErrors = true,
  base = "/",
  outputDir = "dist",
}: rollbarSourcemapsOptions): Plugin {
  return {
    name: "vite-plugin-rollbar-sourcemap",
    async writeBundle() {
      const files = await glob("./**/*.map", { cwd: outputDir });
      const sourcemaps: RollbarSourceMap[] = files
        .map((file) => {
          const sourcePath = calcSourcePath({ sourcemap: file, outputDir });
          if (sourcePath === null) {
            console.error(`No corresponding source found for '${file}'`, true);
            return null;
          }
          const sourcemapLocation = resolve(outputDir, file);
          const sourcemap = buildRollbarSourcemap({
            base,
            sourcePath,
            sourcemapLocation,
          });
          if (sourcemap === null)
            console.error(
              `Error reading sourcemap file ${sourcemapLocation}`,
              true
            );
          return sourcemap;
        })
        .filter((sourcemap) => sourcemap !== null);

      if (!sourcemaps.length) return;

      try {
        await Promise.all(
          sourcemaps.map((asset) => {
            const form = buildPostFormData({
              accessToken,
              version,
              baseUrl,
              asset,
            });
            return uploadSourcemap(form, {
              filename: asset.original_file,
              silent,
            });
          })
        );
      } catch (error) {
        if (ignoreUploadErrors) {
          console.error("Uploading sourcemaps to Rollbar failed: ", error);
          return;
        }
        throw error;
      }
    },
  };
}

async function postRollbarSourcemap(body: FormData): Promise<Response> {
  const res = await fetch(ROLLBAR_ENDPOINT, { method: "POST", body });
  if (!res.ok)
    throw new Error(`Failed to pots sourcemap to Rollbar: ${res.statusText}`);
  return res;
}

async function uploadSourcemap(
  form: FormData,
  { filename, silent }: { filename: string; silent: boolean }
) {
  let res: Response;
  try {
    res = await postRollbarSourcemap(form);
  } catch (err: unknown) {
    const error = err as Error;
    const errMessage = `Failed to upload ${filename} to Rollbar: ${error.message}`;
    throw new Error(errMessage);
  }

  if (res.ok || !silent) console.info(`Uploaded ${filename} to Rollbar`);
}

type RollbarSourceMap = {
  content: string;
  sourcemap_url: string;
  original_file: string;
};
function buildRollbarSourcemap({
  base,
  sourcePath,
  sourcemapLocation,
}: {
  base: string;
  sourcePath: string;
  sourcemapLocation: string;
}): RollbarSourceMap | null {
  try {
    return {
      content: readFileSync(sourcemapLocation, "utf8"),
      sourcemap_url: sourcemapLocation,
      original_file: `${base}${sourcePath}`,
    };
  } catch (_error) {
    return null;
  }
}

function buildPostFormData({
  accessToken,
  version,
  baseUrl,
  asset,
}: {
  accessToken: string;
  version: string;
  baseUrl: string;
  asset: RollbarSourceMap;
}) {
  const form = new FormData();

  form.set("access_token", accessToken);
  form.set("version", version);
  form.set("minified_url", `${baseUrl}${asset.original_file}`);
  form.set("source_map", new Blob([asset.content]), asset.original_file);
  return form;
}

function calcSourcePath({
  sourcemap,
  outputDir,
}: {
  sourcemap: string;
  outputDir: string;
}): string | null {
  const sourcePath = sourcemap.replace(/\.map$/, "");
  const sourceFilename = resolve(outputDir, sourcePath);
  if (!existsSync(sourceFilename)) return null;
  return sourcePath;
}
