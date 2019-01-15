import { loadConfig } from "./common";

export const defaultServicePort = 48628
export function start() {
    var { startServer } = require('maishu-node-mvc')
    let config = loadConfig()
    startServer({
        port: config.service_port || defaultServicePort,
        root_path: __dirname
    })
}

start()