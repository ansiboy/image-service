import * as fs from 'fs'
import * as json5 from 'json5'

export interface Config {
    host: string, port: number, database: string,
    user: string, password: string, service_port: number
}

export let config_file_name = 'config.json5'

export function loadConfig(): Config {
    let text = fs.readFileSync(config_file_name).toString()
    let obj = json5.parse(text)
    return obj
}

export function saveConfig(config: Config) {
    fs.writeFileSync(config_file_name, json5.stringify(config, {}))
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

