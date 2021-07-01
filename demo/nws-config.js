const { getVirtualPaths } = require("maishu-chitu-scaffold");
const path = require("path");

let virtualPaths = getVirtualPaths("", __dirname);
virtualPaths["node_modules"] = path.join(__dirname, "../node_modules");
/** @type {import("maishu-node-mvc").Settings} */
let settings = {
    port: 6738,
    virtualPaths,
    proxy: {
        "upload": `http://image.finememo.com/upload`
    }
}

exports.default = settings;