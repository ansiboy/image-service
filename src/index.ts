import { startServer } from 'maishu-node-mvc'
import path = require('path')
import { errors } from './errors';
import { Config, setConfig } from './common';


export function start(config: Config) {
    if (!config.port) {
        throw errors.configFieldNull('port')
    }
    if (!config.db) {
        throw errors.configFieldNull('db')
    }

    setConfig(config)
    startServer({
        port: config.port,
        rootPath: __dirname,
        controllerDirectory: path.join(__dirname, 'controllers')
    })
}


