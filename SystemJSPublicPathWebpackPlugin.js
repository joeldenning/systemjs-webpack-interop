const webpack = require("webpack");

const isWebpack5 = webpack.version && webpack.version.startsWith("5.");

class SystemJSPublicPathWebpackPlugin {
  constructor(options) {
    this.options = options || {};
    if (!isWebpack5 && !this.options.systemjsModuleName) {
      throw Error(
        `SystemJSPublicPathWebpackPlugin: When using webpack@<5, you must provide 'systemjsModuleName' as an option.`
      );
    }
  }
  apply(compiler) {
    const additionalEntries = [];

    if (isWebpack5) {
      additionalEntries.push(
        `systemjs-webpack-interop/auto-public-path/${this.options
          .rootDirectoryLevel || 1}`
      );
    } else {
      additionalEntries.push(
        `systemjs-webpack-interop/resource-query-public-path?systemjsModuleName=${this.options.systemjsModuleName}`
      );
    }

    compiler.options.entry = prependEntry(
      compiler.options.entry,
      additionalEntries
    );
  }
}

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
