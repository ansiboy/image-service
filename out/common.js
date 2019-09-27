"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const errors_1 = require("./errors");
exports.config_file_name = 'config.json5';
function loadConfig() {
    return dbConfig;
}
exports.loadConfig = loadConfig;
let dbConfig = null;
function setDBConfig(value) {
    dbConfig = value;
}
exports.setDBConfig = setDBConfig;
function setConfig(value) {
    if (!value)
        throw errors_1.errors.argumentNull('value');
    dbConfig = value;
}
exports.setConfig = setConfig;
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
