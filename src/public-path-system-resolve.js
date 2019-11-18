export function setPublicPath(systemjsModuleName, rootDirectoryLevel) {
  if (!rootDirectoryLevel) {
    rootDirectoryLevel = 1;
  }
  if (
    typeof systemjsModuleName !== "string" ||
    systemjsModuleName.trim().length === 0
  ) {
    throw Error(
      "systemjs-webpack-interop: setPublicPath(systemjsModuleName) must be called with a non-empty string 'systemjsModuleName'"
    );
  }

  if (
    typeof rootDirectoryLevel !== "number" ||
    rootDirectoryLevel <= 0 ||
    !Number.isInteger(rootDirectoryLevel)
  ) {
    throw Error(
      "systemjs-webpack-interop: setPublicPath(systemjsModuleName, rootDirectoryLevel) must be called with a positive integer 'rootDirectoryLevel'"
    );
  }

  let moduleUrl;
  try {
    moduleUrl = window.System.resolve(systemjsModuleName);
    if (!moduleUrl) {
      throw Error();
    }
  } catch (err) {
    throw Error(
      "systemjs-webpack-interop: There is no such module '" +
        systemjsModuleName +
        "' in the SystemJS registry. Did you misspell the name of your module?"
    );
  }

  __webpack_public_path__ = resolveDirectory(moduleUrl, rootDirectoryLevel);
}

function resolveDirectory(urlString, rootDirectoryLevel) {
  const url = new URL(urlString);
  const pathname = new URL(urlString).pathname;
  let numDirsProcessed = 0,
    index = pathname.length;
  while (numDirsProcessed !== rootDirectoryLevel && index >= 0) {
    const char = pathname[--index];
    if (char === "/") {
      numDirsProcessed++;
    }
  }

  if (numDirsProcessed !== rootDirectoryLevel) {
    throw Error(
      "systemjs-webpack-interop: rootDirectoryLevel (" +
        rootDirectoryLevel +
        ") is greater than the number of directories (" +
        numDirsProcessed +
        ") in the URL path " +
        fullUrl
    );
  }

  url.pathname = url.pathname.slice(0, index + 1);

  return url.href;
}
