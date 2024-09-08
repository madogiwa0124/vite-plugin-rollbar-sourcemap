import type { SourceMapping } from "../sourceMap";
import { FaildPostError, FaildUploadError } from "./errors";
import { loggedFaildUpload, loggedUploadSuccess } from "./logger";

export const uploadAllSourceMaps = async (
  sourceMappings: SourceMapping[],
  accessToken: string,
  version: string,
  baseUrl: string,
  silent: boolean,
  ignoreUploadErrors: boolean,
): Promise<void> => {
  try {
    await Promise.all(
      sourceMappings.map((mapping): Promise<void> => {
        const { sourceMapContent, sourceMapFilePath, originalFileUrl } = mapping;
        const minifiedUrl = `${baseUrl}${originalFileUrl}`;
        const form = buildPostFormData({
          accessToken,
          version,
          minifiedUrl,
          sourceMapContent,
          sourceMapFilePath,
        });
        return uploadSourcemap(form, originalFileUrl, silent);
      }),
    );
  } catch (error: unknown) {
    if (ignoreUploadErrors) return loggedFaildUpload(error as Error);
    throw error;
  }
};

const ROLLBAR_ENDPOINT = "https://api.rollbar.com/api/1/sourcemap";
const postRollbarSourcemap = async (body: FormData): Promise<Response> => {
  const res = await fetch(ROLLBAR_ENDPOINT, { method: "POST", body });
  if (!res.ok) throw new FaildPostError(res.statusText);
  return res;
};

const uploadSourcemap = async (
  form: FormData,
  fileName: string,
  silent: boolean,
): Promise<void> => {
  try {
    const res = await postRollbarSourcemap(form);
    if (res.ok && !silent) loggedUploadSuccess(fileName);
  } catch (error: unknown) {
    throw new FaildUploadError((error as Error).message, fileName);
  }
};

const buildPostFormData = ({
  accessToken,
  version,
  minifiedUrl,
  sourceMapContent,
  sourceMapFilePath,
}: {
  accessToken: string;
  version: string;
  minifiedUrl: string;
  sourceMapContent: string;
  sourceMapFilePath: string;
}): FormData => {
  const form = new FormData();
  form.set("access_token", accessToken);
  form.set("version", version);
  form.set("minified_url", minifiedUrl);
  form.set("source_map", new Blob([sourceMapContent]), sourceMapFilePath);
  return form;
};
