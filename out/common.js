"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const config = require('../config.json');
exports.config_file_name = 'config.json5';
function loadConfig() {
    // let text = fs.readFileSync(config_file_name).toString()
    // let obj = json5.parse(text)
    // return obj
    return config;
}
exports.loadConfig = loadConfig;
// export function saveConfig(config: Config) {
//     fs.writeFileSync(config_file_name, json5.stringify(config, {}))
// }
function configFileExists() {
    return fs.existsSync(exports.config_file_name);
}
exports.configFileExists = configFileExists;
function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
exports.guid = guid;
