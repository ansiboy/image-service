import { setDBConfig } from './common'
import { startServer } from 'maishu-node-mvc';
import { ConnectionConfig } from 'mysql';
import { errors } from './errors';
import { createDataContext } from './data-context';
export function start(options: { port: number, db: ConnectionConfig }) {

    if (!options.db)
        throw errors.argumentFieldNull("db", "options");

    setDBConfig(options.db);
    //=======================
    // 用于生成数据库
    createDataContext();
    //===========================

    startServer({
        port: options.port,
        rootPath: __dirname,
    })
}


