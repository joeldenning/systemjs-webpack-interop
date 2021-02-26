const resolveDirectory = require("../public-path").resolveDirectory;

exports.autoPublicPath = function autoPublicPath(rootDirLevel) {
  if (!rootDirLevel) {
    rootDirLevel = 1;
  }

  if (typeof __webpack_public_path__ !== "undefined") {
    if (typeof __system_context__ === "undefined") {
      throw Error(
        "systemjs-webpack-interop requires webpack@>=5.0.0-beta.15 and output.libraryTarget set to 'system'"
      );
    }

    if (!__system_context__.meta || !__system_context__.meta.url) {
      console.error("__system_context__", __system_context__);
      throw Error(
        "systemjs-webpack-interop was provided an unknown SystemJS context. Expected context.meta.url, but none was provided"
      );
    }

    __webpack_public_path__ = resolveDirectory(
      __system_context__.meta.url,
      rootDirLevel
    );
  }
};
