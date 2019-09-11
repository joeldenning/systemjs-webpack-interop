import { setPublicPath } from "./public-path-system-resolve";

describe("setPublicPath", () => {
  beforeEach(() => {
    window.System = {
      resolve: jest.fn()
    };

    global.__webpack_public_path__ = undefined;
  });

  it("can properly set the public path with default directory level", () => {
    expect(__webpack_public_path__).toBe(undefined);

    window.System.resolve.mockReturnValue("http://localhost:8080/foo.js");
    setPublicPath("foo");

    expect(__webpack_public_path__).toBe("http://localhost:8080/");
  });

  it("can properly set public path for urls with multiple directories in the path", () => {
    expect(__webpack_public_path__).toBe(undefined);

    window.System.resolve.mockReturnValueOnce(
      "http://localhost:8080/some-dir/foo.js"
    );
    setPublicPath("foo");
    expect(__webpack_public_path__).toBe("http://localhost:8080/some-dir/");

    window.System.resolve.mockReturnValueOnce(
      "http://localhost:8080/some-dir/sub-dir/foo.js"
    );
    setPublicPath("foo");
    expect(__webpack_public_path__).toBe(
      "http://localhost:8080/some-dir/sub-dir/"
    );

    window.System.resolve.mockReturnValueOnce(
      "http://localhost:8080/some-dir/sub-dir/final-dir/foo.js"
    );
    setPublicPath("foo");
    expect(__webpack_public_path__).toBe(
      "http://localhost:8080/some-dir/sub-dir/final-dir/"
    );
  });

  it("can properly set public path two directories up", () => {
    expect(__webpack_public_path__).toBe(undefined);
    const rootDirLevel = 2;

    window.System.resolve.mockReturnValueOnce(
      "http://localhost:8080/some-dir/sub-dir/foo.js"
    );
    setPublicPath("foo", rootDirLevel);
    expect(__webpack_public_path__).toBe("http://localhost:8080/some-dir/");

    window.System.resolve.mockReturnValueOnce(
      "http://localhost:8080/some-dir/sub-dir/final-dir/foo.js"
    );
    setPublicPath("foo", rootDirLevel);
    expect(__webpack_public_path__).toBe(
      "http://localhost:8080/some-dir/sub-dir/"
    );
  });

  it("throws if given a bad module name", () => {
    expect(() => {
      setPublicPath();
    }).toThrowError(`must be called with a non-empty string`);
  });

  it(`throws if you provide a bogus rootDirectoryLevel`, () => {
    expect(() => {
      setPublicPath("foo", "not a number");
    }).toThrowError(`positive integer`);
  });

  it("throws if System.resolve throws", () => {
    window.System.resolve.mockImplementation(name => {
      throw Error(`SystemJS can't resolve ${name}`);
    });

    expect(() => {
      setPublicPath("foo");
    }).toThrowError(`There is no such module`);
  });

  it(`throws if System.resolve returns a falsy value`, () => {
    window.System.resolve.mockReturnValue(undefined);
    expect(() => {
      setPublicPath("foo");
    }).toThrowError(`There is no such module`);
  });
});
