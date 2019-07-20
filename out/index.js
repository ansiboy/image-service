"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
const maishu_node_mvc_1 = require("maishu-node-mvc");
const errors_1 = require("./errors");
function start(options) {
    if (!options.db)
        throw errors_1.errors.argumentFieldNull("db", "options");
    common_1.setDBConfig(options.db);
    //=======================
    // 用于生成数据库
    // createDataContext();
    //===========================
    maishu_node_mvc_1.startServer({
        port: options.port,
        rootPath: __dirname,
    });
}
exports.start = start;
//# sourceMappingURL=index.js.map