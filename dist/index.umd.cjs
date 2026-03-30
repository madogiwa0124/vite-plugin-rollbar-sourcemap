let node_fs = require("node:fs");
let node_path = require("node:path");
//#region src/logger.ts
var Logger = class {
	constructor(silent, ignoreUploadErrors) {
		this.silent = silent;
		this.ignoreUploadErrors = ignoreUploadErrors;
	}
	info(message) {
		if (!this.silent) console.log(message);
		return null;
	}
	error(message, error = null) {
		if (!this.silent) console.error(message);
		if (error && !this.ignoreUploadErrors) throw error;
		return null;
	}
};
const buildLogger = (silent, ignoreUploadErrors) => {
	return new Logger(silent, ignoreUploadErrors);
};
//#endregion
//#region src/state.ts
const state = { logger: new Logger(false, true) };
const setLogger = (value) => {
	state.logger = value;
};
//#endregion
//#region src/rollbar/errors.ts
var FailedUploadError = class extends Error {
	constructor(message, filename) {
		super(message);
		this.message = `Failed to upload ${filename} to Rollbar: ${message}.`;
		this.name = "FailedUploadError";
	}
};
var FailedPostError = class extends Error {
	constructor(message, statusText) {
		super(message);
		this.message = `Failed to post sourcemap to Rollbar with ${statusText}: ${message}.`;
		this.name = "FaildPostError";
	}
};
//#endregion
//#region src/rollbar/service.ts
const ROLLBAR_ENDPOINT = "https://api.rollbar.com/api/1/sourcemap";
const postRollbarSourcemap = async (body) => {
	return await fetch(ROLLBAR_ENDPOINT, {
		method: "POST",
		body
	});
};
//#endregion
//#region src/rollbar/client.ts
const uploadAllSourceMaps = async (sourceMappings, accessToken, version, baseUrl) => {
	try {
		await Promise.all(sourceMappings.map((mapping) => {
			const { sourceMapContent, sourceMapFilePath, originalFileUrl } = mapping;
			return uploadSourcemap(buildPostFormData({
				accessToken,
				version,
				minifiedUrl: `${baseUrl}${originalFileUrl}`,
				sourceMapContent,
				sourceMapFilePath
			}), originalFileUrl);
		}));
	} catch (error) {
		state.logger.error(`Failed to upload sourcemap: ${error}.`, error);
	}
};
const uploadSourcemap = async (form, fileName) => {
	try {
		const res = await postRollbarSourcemap(form);
		if (!res.ok) throw new FailedPostError(await res.text(), res.statusText);
		state.logger.info(`Uploaded ${fileName} to Rollbar.`);
	} catch (error) {
		throw new FailedUploadError(error.message, fileName);
	}
};
const buildPostFormData = ({ accessToken, version, minifiedUrl, sourceMapContent, sourceMapFilePath }) => {
	const form = new FormData();
	form.set("access_token", accessToken);
	form.set("version", version);
	form.set("minified_url", minifiedUrl);
	form.set("source_map", new Blob([sourceMapContent]), sourceMapFilePath);
	return form;
};
//#endregion
//#region src/sourceMap/util.ts
const collectSourceMapFiles = (souceMapGlob, outputDir) => {
	return (0, node_fs.globSync)(souceMapGlob, { cwd: outputDir });
};
const resolveSourceMapFile = (outputDir, sourceMapFile) => {
	return (0, node_path.resolve)(outputDir, sourceMapFile);
};
const calcSourceFile = ({ sourceMapFile, outputDir }) => {
	const sourceFile = sourceMapFile.replace(/\.map$/, "");
	if (!(0, node_fs.existsSync)((0, node_path.resolve)(outputDir, sourceFile))) return null;
	return sourceFile;
};
const readSourceMapFile = (sourceMapPath) => {
	return (0, node_fs.readFileSync)(sourceMapPath, "utf8");
};
//#endregion
//#region src/sourceMap/index.ts
const SOURCE_MAP_GLOB = "./**/*.map";
const collectSourceMappings = async (base, outputDir, sourceMapGlob = SOURCE_MAP_GLOB) => {
	return collectSourceMapFiles(sourceMapGlob, outputDir).map((sourceMapFile) => {
		const sourcePath = calcSourceFile({
			sourceMapFile,
			outputDir
		});
		if (sourcePath === null) return state.logger.error(`No source found for '${sourceMapFile}'.`);
		return buildSourceMapping({
			base,
			sourcePath,
			sourceMapFilePath: resolveSourceMapFile(outputDir, sourceMapFile)
		});
	}).filter((mapping) => mapping !== null);
};
const buildSourceMapping = ({ base, sourcePath, sourceMapFilePath }) => {
	const originalFileUrl = `${base}${sourcePath}`;
	try {
		return {
			sourceMapContent: readSourceMapFile(sourceMapFilePath),
			sourceMapFilePath,
			originalFileUrl
		};
	} catch (_error) {
		state.logger.error(`Error reading sourcemap file: ${sourceMapFilePath}`);
		return null;
	}
};
//#endregion
//#region src/index.ts
function vitePluginRollbarSourceMap({ accessToken, version, baseUrl, silent = false, ignoreUploadErrors = true, base = "/", outputDir = "dist" }) {
	return {
		name: "vite-plugin-rollbar-sourcemap",
		async writeBundle() {
			setLogger(buildLogger(silent, ignoreUploadErrors));
			const sourceMappings = await collectSourceMappings(base, outputDir);
			if (!sourceMappings.length) return;
			await uploadAllSourceMaps(sourceMappings, accessToken, version, baseUrl);
		}
	};
}
//#endregion
module.exports = vitePluginRollbarSourceMap;

//# sourceMappingURL=index.umd.cjs.map