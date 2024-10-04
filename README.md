# Vite Plugin Rollbar Sourcemap

This is a Vite plugin for uploading Vite-generated Sourcemaps to Rolbar.

This plugin is inspired by [clinggroup/vite-plugin-rollbar](https://github.com/clinggroup/vite-plugin-rollbar).

## Motivation

- Implementation with TypeScript.
- Ensuring code quality through test codes.
- Supports the latest Vite.

## Installation

```sh
npm install -D madogiwa0124/vite-plugin-rollbar-sourcemap
```

## Usage

```js
// vite.config.ts
import viteRollbar from "vite-plugin-rollbar-sourcemaop";

const rollbarConfig = {
  accessToken: "<ROLLBAR_POST_SERVER_ITEM_ACCESS_TOKEN>",
  version: "<SOURCE_VERSION>",
  baseUrl: "yourwebsite.example.com",
  ignoreUploadErrors: true, // Suppresses throw exception.
  silent: false, // Suppresses log output.
};

export default defineConfig({
  plugins: [viteRollbar(rollbarConfig)],
  build: {
    sourcemap: true, // or "hidden"
  },
});
```
