"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const maishu_node_mvc_1 = require("maishu-node-mvc");
const path = require("path");
const errors_1 = require("./errors");
const common_1 = require("./common");
function start(config) {
    if (!config.port) {
        throw errors_1.errors.configFieldNull('port');
    }
    if (!config.db) {
        throw errors_1.errors.configFieldNull('db');
    }
    common_1.setConfig(config);
    maishu_node_mvc_1.startServer({
        port: config.port,
        rootPath: __dirname,
        controllerDirectory: path.join(__dirname, 'controllers')
    });
}
exports.start = start;
