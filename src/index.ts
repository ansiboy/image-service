import { startServer } from 'maishu-node-mvc'
import path = require('path')

interface Config {
    port: number,
}

export function start(config: Config) {
    // var { startServer } = require('maishu-node-mvc')
    // let config = loadConfig()
    startServer({
        port: config.port,
        rootPath: __dirname,
        controllerDirectory: path.join(__dirname, 'controllers')
    })
}

// start()

