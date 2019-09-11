const {
  modifyWebpackConfig,
  checkWebpackConfig
} = require("./webpack-config-helpers");

describe("webpack-config helpers", () => {
  it("modifies an empty webpack config to have the correct systemjs stuff", () => {
    const newConfig = modifyWebpackConfig({});
    checkWebpackConfig(newConfig);
  });

  it("can modify a webpack config that is a function instead of object", () => {
    checkWebpackConfig(modifyWebpackConfig(() => ({})));
  });

  it("modifies an existing webpack config", () => {
    const newConfig = modifyWebpackConfig({
      output: {
        libraryTarget: "amd"
      },
      module: {
        rules: [
          {
            parser: {
              system: true
            }
          }
        ]
      }
    });
    checkWebpackConfig(newConfig);
  });

  it("correctly verifies a valid webpack config", () => {
    checkWebpackConfig({
      output: {
        libraryTarget: "system"
      },
      module: {
        rules: [
          {
            parser: {
              system: false
            }
          }
        ]
      }
    });
  });

  it(`correctly verifies a valid webpack config that's a function`, () => {
    checkWebpackConfig(() => ({
      output: {
        libraryTarget: "system"
      },
      module: {
        rules: [
          {
            parser: {
              system: false
            }
          }
        ]
      }
    }));
  });

  it(`throws an error if you don't have a valid output.libraryTarget`, () => {
    expect(() => {
      checkWebpackConfig({
        output: {},
        module: {
          rules: [
            {
              parser: {
                system: false
              }
            }
          ]
        }
      });
    }).toThrow();

    expect(() => {
      checkWebpackConfig({
        output: {
          libraryTarget: "var"
        },
        module: {
          rules: [
            {
              parser: {
                system: false
              }
            }
          ]
        }
      });
    }).toThrow();
  });

  it(`throws if you set output.library unnecessarily`, () => {
    expect(() => {
      checkWebpackConfig({
        output: {
          library: "MyModuleName",
          libraryTarget: "system"
        },
        module: {
          rules: [
            {
              parser: {
                system: false
              }
            }
          ]
        }
      });
    }).toThrow();
  });

  it(`throws if you haven't turned off webpack code splits for System.import()`, () => {
    expect(() => {
      checkWebpackConfig({
        output: {
          libraryTarget: "system"
        },
        module: {
          rules: []
        }
      });
    }).toThrow();

    expect(() => {
      checkWebpackConfig({
        output: {
          libraryTarget: "system"
        },
        module: {
          rules: [{}]
        }
      });
    }).toThrow();

    expect(() => {
      checkWebpackConfig({
        output: {
          libraryTarget: "system"
        },
        module: {
          rules: [
            {
              parser: {}
            }
          ]
        }
      });
    }).toThrow();

    expect(() => {
      checkWebpackConfig({
        output: {
          libraryTarget: "system"
        },
        module: {
          rules: [
            {
              parser: {
                system: true
              }
            }
          ]
        }
      });
    }).toThrow();
  });
});
