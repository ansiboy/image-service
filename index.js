#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer = require("inquirer");
const json5 = require("json5");
const fs = require("fs");
const common_1 = require("./common");
const app_1 = require("./app");
var program = require('commander');
function main() {
    let package_text = fs.readFileSync('package.json').toString();
    let pack = json5.parse(package_text);
    program
        .version(pack.version)
        .command('config')
        .action(function () {
        if (common_1.configFileExists()) {
            inquirer.prompt([
                { type: 'confirm', name: 'reset', default: false, message: '配置文件已经存在,是否重新设置?' },
            ]).then(answers => {
                if (answers.reset == false) {
                    console.log('已取消设置');
                    return;
                }
                config();
            });
            return;
        }
        config();
    });
    program
        .command('start')
        .action(function () {
        app_1.start();
    });
    program.parse(process.argv);
}
function config() {
    inquirer
        .prompt([
        { type: 'input', name: 'service_port', default: app_1.defaultServicePort, message: '请输入服务端口' },
        { type: 'input', name: 'host', default: '127.0.0.1', message: '请输入 mysql 数据库主机地址' },
        { type: 'input', name: 'port', default: 3306, message: '请输入 mysql 数据库端口' },
        { type: 'input', name: 'database', default: 'image-service', message: '请输入 mysql 数据库名称' },
        { type: 'input', name: 'user', message: '请输入 mysql 账号名称' },
        { type: 'password', name: 'password', message: '请输入 mysql 账号密码', mask: '*' },
    ])
        .then(answers => {
        common_1.saveConfig(answers);
    });
}
// const defaultServicePort = 48628
// function start() {
//     var { startServer } = require('maishu-node-mvc')
//     let config = loadConfig()
//     startServer({
//         port: config.service_port || defaultServicePort,
//         root_path: __dirname
//     })
// }
main();
