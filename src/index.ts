import { setDBConfig } from './common'
import { startServer } from 'maishu-node-mvc';
import { ConnectionConfig } from 'mysql';
import { errors } from './errors';
import path = require("path");

export function start(options: { port: number, db: ConnectionConfig }) {

    if (!options.db)
        throw errors.argumentFieldNull("db", "options");

    setDBConfig(options.db);
    //=======================
    // 用于生成数据库
    // createDataContext();
    //===========================

    startServer({
        port: options.port,
        controllerDirectory: path.join(__dirname, "controllers")
    })
}


