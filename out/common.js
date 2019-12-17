"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
exports.settings = {};
exports.config_file_name = 'config.json5';
// export function loadConfig() {
//     return dbConfig;
// }
// let dbConfig: mysql.ConnectionConfig = null;
// export function setDBConfig(value: mysql.ConnectionConfig) {
//     dbConfig = value;
// }
// export function setConfig(value: Settings) {
//     if (!value) throw errors.argumentNull('value')
//     dbConfig = value
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
