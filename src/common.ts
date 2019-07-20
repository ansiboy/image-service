import * as fs from 'fs'
import * as mysql from 'mysql';
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

export function loadConfig() {
    return dbConfig;
}

let dbConfig: mysql.ConnectionConfig = null;
export function setDBConfig(value: mysql.ConnectionConfig) {
    dbConfig = value;
}

export function setConfig(value: Config) {
    if (!value) throw errors.argumentNull('value')
    dbConfig = value
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

