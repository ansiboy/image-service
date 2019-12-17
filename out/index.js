"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const maishu_node_mvc_1 = require("maishu-node-mvc");
const errors_1 = require("./errors");
const path = require("path");
function start(settings) {
    if (!settings)
        throw errors_1.errors.argumentNull("settings");
    if (!settings.db)
        throw errors_1.errors.argumentFieldNull("db", "options");
    Object.assign(common_1.settings, settings);
    //=======================
    // 用于生成数据库
    // createDataContext();
    //===========================
    maishu_node_mvc_1.startServer({
        port: settings.port,
        controllerDirectory: path.join(__dirname, "controllers")
    });
}
exports.start = start;
