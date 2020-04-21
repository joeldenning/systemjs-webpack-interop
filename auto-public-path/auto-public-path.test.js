describe("autoPublicPath", () => {
  const originalPublicPath = "http://something-else.com/";

  beforeEach(() => {
    global.__webpack_public_path__ = originalPublicPath;
    global.__system_context__ = {
      meta: {
        url: "http://localhost:8080/dist/js/main.js"
      }
    };
  });

  it("can properly set the public path with default directory level", () => {
    expect(__webpack_public_path__).toBe(originalPublicPath);

    require("./index");

    expect(__webpack_public_path__).toBe("http://localhost:8080/dist/js/");
  });

  it("can properly set the public path with directory level 2", () => {
    expect(__webpack_public_path__).toBe(originalPublicPath);

    require("./2");

    expect(__webpack_public_path__).toBe("http://localhost:8080/dist/");
  });

  it("can properly set the public path with directory level 3", () => {
    expect(__webpack_public_path__).toBe(originalPublicPath);

    require("./3");

    expect(__webpack_public_path__).toBe("http://localhost:8080/");
  });
});
