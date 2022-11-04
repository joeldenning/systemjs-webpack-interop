const webpack = require("webpack");
const path = require("path");

const isWebpack5 = webpack.version && webpack.version.startsWith("5.");

const PUBLIC_PATH_ALGORITHM = {
  AUTO: "auto",
  RESOURCE_QUERY: "resource-query"
};

class SystemJSPublicPathWebpackPlugin {
  /**
   * makes a SystemJSPublicPathWebpackPlugin instance
   * @param {Object} options - Options to use when constructing the SystemJSPublicPathWebpackPlugin instance.
   * @param {string} options.publicPathAlgorithm - The algorithm used to determine the public path. Can be either 'auto' or 'resource-query'. Defaults to auto in webpack 5 and is always resource query for lower versions of webpack. You might only need to set this to 'resource-query' if you want to use webpack 5 and 'amd'.
   * @param {string} options.rootDirectoryLevel - Used to instruct webpack public path to "chop off" some of the directories in the current module's url. Defaults to 1.
   * @param {string} options.systemjsModuleName - The name of the project in the system js registry e.g @org-name/project-name. Only needed for webpack 1-4 or when using the resource-query public path algorithm.
   */
  constructor(options) {
    this.options = options || {};
    if (!isWebpack5 && !this.options.systemjsModuleName) {
      throw Error(
        `SystemJSPublicPathWebpackPlugin: When using webpack@<5, you must provide 'systemjsModuleName' as an option.`
      );
    }
    this.options.publicPathAlgorithm =
      options.publicPathAlgorithm || PUBLIC_PATH_ALGORITHM.AUTO;
  }
  apply(compiler) {
    const additionalEntries = [];

    const rootDirectoryLevel = this.options.rootDirectoryLevel || 1;
    const useAutoPublicPath =
      this.options.publicPathAlgorithm === PUBLIC_PATH_ALGORITHM.AUTO;

    if (isWebpack5 && useAutoPublicPath) {
      additionalEntries.push(
        path.resolve(__dirname, `auto-public-path/${rootDirectoryLevel}`)
      );
    } else {
      additionalEntries.push(
        path.resolve(
          __dirname,
          `resource-query-public-path?systemjsModuleName=${encodeURIComponent(
            this.options.systemjsModuleName
          )}&rootDirectoryLevel=${rootDirectoryLevel}`
        )
      );
    }

    compiler.options.entry = prependEntry(
      compiler.options.entry,
      additionalEntries
    );
  }
}

// This function was copied from https://github.com/webpack/webpack-dev-server/blob/b0161e9852cdf41730e82aa43efe7e88f44a4f9d/lib/utils/DevServerPlugin.js#L72
function prependEntry(originalEntry, additionalEntries) {
  if (typeof originalEntry === "function") {
    return () =>
      Promise.resolve(originalEntry()).then(entry =>
        prependEntry(entry, additionalEntries)
      );
  }

  if (typeof originalEntry === "object" && !Array.isArray(originalEntry)) {
    /** @type {Object<string,string>} */
    const clone = {};

    Object.keys(originalEntry).forEach(key => {
      // entry[key] should be a string here
      const entryDescription = originalEntry[key];
      clone[key] = prependEntry(entryDescription, additionalEntries);
    });

    return clone;
  }

  // in this case, entry is a string or an array.
  // make sure that we do not add duplicates.
  /** @type {Entry} */
  const entriesClone = additionalEntries.slice(0);
  [].concat(originalEntry).forEach(newEntry => {
    if (!entriesClone.includes(newEntry)) {
      entriesClone.push(newEntry);
    }
  });
  return entriesClone;
}

module.exports = SystemJSPublicPathWebpackPlugin;
