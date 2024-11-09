'use strict';

var node_fs = require('node:fs');
var node_path = require('node:path');
var glob = require('glob');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

class Logger {
    constructor(silent, ignoreUploadErrors) {
        this.silent = silent;
        this.ignoreUploadErrors = ignoreUploadErrors;
    }
    info(message) {
        if (!this.silent)
            console.log(message);
        return null;
    }
    error(message, error = null) {
        if (!this.silent)
            console.error(message);
        if (error && !this.ignoreUploadErrors)
            throw error;
        return null;
    }
}
const buildLogger = (silent, ignoreUploadErrors) => {
    return new Logger(silent, ignoreUploadErrors);
};

const state = {
    logger: new Logger(false, true),
};
const setLogger = (value) => {
    state.logger = value;
};

class FailedUploadError extends Error {
    constructor(message, filename) {
        super(message);
        this.message = `Failed to upload ${filename} to Rollbar: ${message}.`;
        this.name = "FailedUploadError";
    }
}
class FailedPostError extends Error {
    constructor(message, statusText) {
        super(message);
        this.message = `Failed to post sourcemap to Rollbar with ${statusText}: ${message}.`;
        this.name = "FaildPostError";
    }
}

const ROLLBAR_ENDPOINT = "https://api.rollbar.com/api/1/sourcemap";
const postRollbarSourcemap = (body) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(ROLLBAR_ENDPOINT, { method: "POST", body });
    return res;
});

const uploadAllSourceMaps = (sourceMappings, accessToken, version, baseUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Promise.all(sourceMappings.map((mapping) => {
            const { sourceMapContent, sourceMapFilePath, originalFileUrl } = mapping;
            const minifiedUrl = `${baseUrl}${originalFileUrl}`;
            const form = buildPostFormData({
                accessToken,
                version,
                minifiedUrl,
                sourceMapContent,
                sourceMapFilePath,
            });
            return uploadSourcemap(form, originalFileUrl);
        }));
    }
    catch (error) {
        state.logger.error(`Failed to upload sourcemap: ${error}.`, error);
    }
});
const uploadSourcemap = (form, fileName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield postRollbarSourcemap(form);
        if (!res.ok)
            throw new FailedPostError(yield res.text(), res.statusText);
        state.logger.info(`Uploaded ${fileName} to Rollbar.`);
    }
    catch (error) {
        throw new FailedUploadError(error.message, fileName);
    }
});
const buildPostFormData = ({ accessToken, version, minifiedUrl, sourceMapContent, sourceMapFilePath, }) => {
    const form = new FormData();
    form.set("access_token", accessToken);
    form.set("version", version);
    form.set("minified_url", minifiedUrl);
    form.set("source_map", new Blob([sourceMapContent]), sourceMapFilePath);
    return form;
};

const collectSourceMapFiles = (souceMapGlob, outputDir) => __awaiter(void 0, void 0, void 0, function* () {
    return yield glob.glob(souceMapGlob, { cwd: outputDir });
});
const resolveSourceMapFile = (outputDir, sourceMapFile) => {
    return node_path.resolve(outputDir, sourceMapFile);
};
const calcSourceFile = ({ sourceMapFile, outputDir, }) => {
    const sourceFile = sourceMapFile.replace(/\.map$/, "");
    const sourcePath = node_path.resolve(outputDir, sourceFile);
    if (!node_fs.existsSync(sourcePath))
        return null;
    return sourceFile;
};
const readSourceMapFile = (sourceMapPath) => {
    return node_fs.readFileSync(sourceMapPath, "utf8");
};

const SOURCE_MAP_GLOB = "./**/*.map";
const collectSourceMappings = (base_1, outputDir_1, ...args_1) => __awaiter(void 0, [base_1, outputDir_1, ...args_1], void 0, function* (base, outputDir, sourceMapGlob = SOURCE_MAP_GLOB) {
    const sourceMapFiles = yield collectSourceMapFiles(sourceMapGlob, outputDir);
    const sourceMappings = sourceMapFiles.map((sourceMapFile) => {
        const sourcePath = calcSourceFile({ sourceMapFile, outputDir });
        if (sourcePath === null)
            return state.logger.error(`No source found for '${sourceMapFile}'.`);
        const sourceMapFilePath = resolveSourceMapFile(outputDir, sourceMapFile);
        return buildSourceMapping({ base, sourcePath, sourceMapFilePath });
    });
    return sourceMappings.filter((mapping) => mapping !== null);
});
const buildSourceMapping = ({ base, sourcePath, sourceMapFilePath, }) => {
    const originalFileUrl = `${base}${sourcePath}`;
    try {
        const sourceMapContent = readSourceMapFile(sourceMapFilePath);
        return { sourceMapContent, sourceMapFilePath, originalFileUrl };
    }
    catch (_error) {
        state.logger.error(`Error reading sourcemap file: ${sourceMapFilePath}`);
        return null;
    }
};

function vitePluginRollbarSourceMap({ accessToken, version, baseUrl, silent = false, ignoreUploadErrors = true, base = "/", outputDir = "dist", }) {
    return {
        name: "vite-plugin-rollbar-sourcemap",
        writeBundle() {
            return __awaiter(this, void 0, void 0, function* () {
                setLogger(buildLogger(silent, ignoreUploadErrors));
                const sourceMappings = yield collectSourceMappings(base, outputDir);
                if (!sourceMappings.length)
                    return;
                yield uploadAllSourceMaps(sourceMappings, accessToken, version, baseUrl);
            });
        },
    };
}

module.exports = vitePluginRollbarSourceMap;
//# sourceMappingURL=index.umd.cjs.map
