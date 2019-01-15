"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
exports.defaultServicePort = 48628;
function start() {
    var { startServer } = require('maishu-node-mvc');
    let config = common_1.loadConfig();
    startServer({
        port: config.service_port || exports.defaultServicePort,
        root_path: __dirname
    });
}
exports.start = start;
start();
