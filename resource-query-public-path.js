import { setPublicPath } from "./public-path";

const queryParts = __resourceQuery.replace(/\?/g, "").split("&");
const queryObj = queryParts.reduce((result, queryPart) => {
  const split = queryPart.split("=");
  result[split[0]] = split[1];
  return result;
}, {});

setPublicPath(queryObj.systemjsModuleName, Number(queryObj.rootDirectoryLevel));
