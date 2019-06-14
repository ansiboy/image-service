import * as fs from 'fs'
import { errors } from './errors';

export interface Config {
    port: number,
    db: {
        host: string,
        port: number,
        database: string,
        user: string,
        password: string
    }
}

export let config_file_name = 'config.json5'

let config: Config
export function loadConfig(): Config {
    return config
}

export function setConfig(value: Config) {
    if (!value) throw errors.argumentNull('value')
    config = value
}

export function configFileExists() {
    return fs.existsSync(config_file_name)
}

export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

