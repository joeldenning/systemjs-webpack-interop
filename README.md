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

Pending work that will make this even better:

[This webpack PR](https://github.com/webpack/webpack/pull/9119) will make it so that you won't even have to create a `set-public-path` file. You'll just be able to do the following:
```js
// in your webpack entry file
import 'systemjs-webpack-interop/set-public-path'
```

## Installation

Note that systemjs-webpack-interop requires systemjs@>=6 and webpack@>=4.30.0

```sh
npm install --save systemjs-webpack-interop

# Or
yarn add systemjs-webpack-interop
```

## API

systemjs-webpack-interop exports the following functions

### setPublicPath

```js
/* In your webpack entry file, add the following import as the very very first import. It is important that it is first.
 * Here's a link to learn about entry files: https://webpack.js.org/configuration/entry-context/#entry
 */
import "./set-public-path.js";
```

```js
/* set-public-path.js */
import { setPublicPath } from "systemjs-webpack-interop";

/* Make sure your import map has foo in it. Example:
{
  "imports": {
    "foo": "https://example.com/dist/js/foo.js"
  }
}
 */

// __webpack_public_path__ will be set to https://example.com/dist/js/
setPublicPath(“foo");

// If the URL in the import map has multiple directories in the pathname, you can specify which directory
// to use by passing in a second argument.
// __webpack_public_path__ will be set to https://example.com/dist/
setPublicPath(“foo", 2);
```

#### Arguments

`setPublicPath(systemjsModuleName, rootDirectoryLevel = 1)`

1. systemjsModuleName (required): The string name of your systemjs module. This name should exist in your import map.
2. rootDirectoryLevel (optional). An integer that defaults to 1, indicating which directory to use as the public path. The public path is
   calculated using [System.resolve](https://github.com/systemjs/systemjs/blob/master/docs/api.md#systemresolveid--parenturl---promisestring),
   which returns a full url for the module. The `rootDirectoryLevel` indicates which `/` character in the full url string to use as the directory,
   scanning the url from right-to-left.

#### Return value

`undefined`

### modifyWebpackConfig

```js
// webpack.config.js
const systemjsInterop = require("systemjs-webpack-interop");

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
const systemjsInterop = require("systemjs-webpack-interop");

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
