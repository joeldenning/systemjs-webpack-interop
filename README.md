# systemjs-webpack-interop

An npm package for [webpack](https://webpack.js.org) bundles that are used as [systemjs](https://github.com/systemjs/systemjs) modules.

## What is this?

systemjs-webpack-interop is an npm package that exports functions that help you create a webpack bundle that
is consumable by SystemJS as an in-browser module.

Specifically, the library does two things:

1. Help you set the [webpack public path "on the fly"](https://webpack.js.org/guides/public-path/#on-the-fly)
   to work with the dynamic url for the bundle in SystemJS' import map.
2. Help you create or verify a [webpack config](https://webpack.js.org/configuration) to ensure proper interop
   with SystemJS.

## Background / other work

Webpack has several features that are geared towards better interop with SystemJS. Here are relevant links:

- https://github.com/systemjs/systemjs#compatibility-with-webpack
- https://webpack.js.org/configuration/output/#outputlibrarytarget (search for `libraryTarget: 'system'` on that page)
- https://webpack.js.org/configuration/module/#ruleparser (search for `SystemJS` on that page)

## Installation

Note that systemjs-webpack-interop requires systemjs@>=6.

```sh
npm install --save systemjs-webpack-interop

# Or
yarn add systemjs-webpack-interop
```

## Setting Public Path

systemjs-webpack-interop will [dynamically set the webpack public path](https://webpack.js.org/guides/public-path/#on-the-fly) based on the URL that a SystemJS module was downloaded from.

### As a Webpack Plugin

You can set the public path by adding the SystemJSPublicPathWebpackPlugin.

```js
// webpack.config.js
const SystemJSPublicPathWebpackPlugin = require("systemjs-webpack-interop/SystemJSPublicPathWebpackPlugin");

module.exports = {
  plugins: [
    new SystemJSPublicPathWebpackPlugin({
      // optional: defaults to 1
      // If you need the webpack public path to "chop off" some of the directories in the current module's url, you can specify a "root directory level". Note that the root directory level is read from right-to-left, with `1` indicating "current directory" and `2` indicating "up one directory":
      rootDirectoryLevel: 1,

      // ONLY NEEDED FOR WEBPACK 1-4. Not necessary for webpack@5
      systemjsModuleName: "@org-name/project-name"
    })
  ]
};
```

### With Code

You can also set the public path with code inside of your webpack project.

#### Newer versions of webpack

If you're using at least webpack 5.0.0-beta.15, simply add the following **to the very top** of your [webpack entry file](https://webpack.js.org/configuration/entry-context/#entry):

```js
/* For a module at http://localhost:8080/dist/js/main.js,
 * this will set the webpack public path to be
 * http://localhost:8080/dist/js/
 */
import "systemjs-webpack-interop/auto-public-path";
```

If you need the webpack public path to "chop off" some of the directories in the current module's url, you can specify a "root directory level". Note that the root directory level is read from right-to-left, with `1` indicating "current directory" and `2` indicating "up one directory":

```js
/* For a module at http://localhost:8080/dist/js/main.js,
 * this will set the webpack public path to be
 * http://localhost:8080/js/
 */
import "systemjs-webpack-interop/auto-public-path/2";
```

```js
/* For a module at http://localhost:8080/dist/js/main.js,
 * this will set the webpack public path to be
 * http://localhost:8080/
 */
import "systemjs-webpack-interop/auto-public-path/3";
```

#### Older versions of webpack

##### Resource Query approach

To set the webpack public path in older versions of webpack, add the following to the very top of your webpack entry file:

```js
import "systemjs-webpack-interop/resource-query-public-path?systemjsModuleName=@org-name/project-name";
```

To set the root directory level:

```js
import "systemjs-webpack-interop/resource-query-public-path?systemjsModuleName=@org-name/project-name&rootDirectoryLevel=2";
```

##### Old approach

To set the webpack public path in older versions of webpack, you'll need to do two things:

1. Create a file called `set-public-path.js`
2. Import that file at the very top of your [webpack entry file](https://webpack.js.org/configuration/entry-context/#entry)

```js
/* In your webpack entry file, add the following import as the very very first import. It is important that it is first.
 * Here's a link to learn about entry files: https://webpack.js.org/configuration/entry-context/#entry
 */
import "./set-public-path.js";
```

```js
/* set-public-path.js */
import { setPublicPath } from "systemjs-webpack-interop";

/* Make sure your import map has the name of your module in it. Example:
{
  "imports": {
    "@org-name/my-module": "https://example.com/dist/js/main.js"
  }
}
 */

// __webpack_public_path__ will be set to https://example.com/dist/js/
setPublicPath("foo");
```

If you need the webpack public path to "chop off" some of the directories in the current module's url, you can specify a "root directory level". Note that the root directory level is read from right-to-left, with `1` indicating "current directory" and `2` indicating "up one directory":

```js
/* For a module at http://localhost:8080/dist/js/main.js,
 * this will set the webpack public path to be
 * http://localhost:8080/dist/
 */
setPublicPath("foo", 2);
```

## API

### setPublicPath

#### Arguments

`setPublicPath(systemjsModuleName, rootDirectoryLevel = 1)`

1. systemjsModuleName (required): The string name of your systemjs module. This name should exist in your import map.
2. rootDirectoryLevel (optional). An integer that defaults to 1, indicating which directory to use as the public path. The public path is
   calculated using [System.resolve](https://github.com/systemjs/systemjs/blob/master/docs/api.md#systemresolveid--parenturl---promisestring),
   which returns a full url for the module. The `rootDirectoryLevel` indicates which `/` character in the full url string to use as the directory,
   scanning the url from right-to-left.

#### Return value

`undefined`

## Webpack config helpers

systemjs-webpack-interop exports NodeJS functions for helping you set up and verify a webpack config so that it works well with SystemJS.

Note that these functions only work if you're using webpack@>=4.30.0. Before that version of webpack, `output.libraryTarget` of `"system"` did not exist.

### modifyWebpackConfig

```js
// webpack.config.js
const systemjsInterop = require("systemjs-webpack-interop/webpack-config");

// Pass in your webpack config, and systemjs-webpack-interop will make it
// work better with SystemJS
module.exports = systemjsInterop.modifyWebpackConfig({
  output: {
    filename: "bundle.js"
  },
  module: {
    rules: []
  },
  devtool: "sourcemap"
});
```

#### Arguments

`modifyWebpackConfig(config)`

1. `config` (optional): A [webpack config object](https://webpack.js.org/configuration/#root). If not provided, a default one will be created for you.

#### Return value

A new, modified webpack config object.

### checkWebpackConfig

```js
// webpack.config.js
const systemjsInterop = require("systemjs-webpack-interop/webpack-config");

// Pass in your webpack config, and systemjs-webpack-interop will make it
// work better with SystemJS
module.exports = {
  output: {
    libraryTarget: "system"
  },
  module: {
    rules: [{ parser: { system: false } }]
  }
};

// Throws errors if your webpack config won't interop well with SystemJS
systemjsInterop.checkWebpackConfig(module.exports);
```

#### Arguments

`checkWebpackConfig(config)`

1. `config` (required): A webpack config object to be verified. If the config object isn't following best practices for interop with systemjs, and error will be thrown.

#### Return value

`undefined` if the webpack config is valid, and an Error will be thrown otherwise.
