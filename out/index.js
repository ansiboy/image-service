"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maishu_node_mvc_1 = require("maishu-node-mvc");
const path = require("path");
function start(config) {
    // var { startServer } = require('maishu-node-mvc')
    // let config = loadConfig()
    maishu_node_mvc_1.startServer({
        port: config.port,
        rootPath: __dirname,
        controllerDirectory: path.join(__dirname, 'controllers')
    });
}
exports.start = start;
// start()
