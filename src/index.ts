import { setDBConfig } from './common'
import { startServer } from 'maishu-node-mvc';
import { ConnectionConfig } from 'mysql';
import { errors } from './errors';
export function start(options: { port: number, db: ConnectionConfig }) {

    if (!options.db)
        throw errors.argumentFieldNull("db", "options");

    setDBConfig(options.db);
    startServer({
        port: options.port,
        rootPath: __dirname,
    })
}


