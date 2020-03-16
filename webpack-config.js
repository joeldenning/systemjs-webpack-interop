exports.modifyWebpackConfig = function(config = {}) {
  if (typeof config === "function") {
    return function() {
      return makeModifications(config.apply(this, arguments));
    };
  } else {
    return makeModifications(config);
  }
};

exports.checkWebpackConfig = function(config) {
  if (typeof config === "function") {
    return function() {
      return checkConfig(config.apply(this, arguments));
    };
  } else {
    return checkConfig(config);
  }
};

function checkConfig(config) {
  if (!config.output) {
    throw Error(
      "Webpack configs for in-browser systemjs modules must have an output section. See https://webpack.js.org/configuration/output/#root."
    );
  }

  if (config.output.libraryTarget !== "system") {
    throw Error(
      "Webpack configs for in-browser systemjs modules should have output.libraryTarget set to 'system'. Current library target is " +
        config.output.libraryTarget +
        ". See https://webpack.js.org/configuration/output/#outputlibrarytarget"
    );
  }

  if (config.output.library) {
    throw Error(
      "Webpack configs for in-browser systemjs modules usually should not have output.library set. Named bundles are not needed for System.import() to work properly."
    );
  }

  if (
    !config.module ||
    !config.module.rules ||
    !config.module.rules.find(
      rule => rule.parser && rule.parser.system === false
    )
  ) {
    throw Error(
      "Webpack configs for in-browser systemjs modules should have a webpack module rule that turns of System.import() as a webpack code split. See https://github.com/systemjs/systemjs#compatibility-with-webpack"
    );
  }
}

function makeModifications(config) {
  // Change output target to system.
  config.output = config.output || {};
  config.output.libraryTarget = "system";
  delete config.output.library;

  // Make sure that System.import() is not interpreted as a webpack code split.
  config.module = config.module || {};
  config.module.rules = config.module.rules || [];
  const systemParserOff = config.module.rules.some(
    rule => rule && rule.parser && rule.parser.system === false
  );
  if (!systemParserOff) {
    config.module.rules.push({
      parser: {
        system: false
      }
    });
  }

  return config;
}
