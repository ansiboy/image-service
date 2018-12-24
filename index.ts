#!/usr/bin/env node
import * as inquirer from 'inquirer';
import * as json5 from 'json5'
import * as fs from 'fs'

import { saveConfig, configFileExists, loadConfig } from './common'

var program = require('commander');

function main() {

    let package_text = fs.readFileSync('package.json').toString()
    let pack = json5.parse(package_text)

    program
        .version(pack.version)
        .command('init')
        .action(function () {
            if (configFileExists()) {
                inquirer.prompt([
                    { type: 'confirm', name: 'reset', default: false, message: '配置文件已经存在,是否重新设置?' },
                ]).then(answers => {
                    if (answers.reset == false) {
                        console.log('已取消设置')
                        return
                    }

                    init()
                });


                return
            }

            init()
        })

    program
        .command('start')
        .action(function () {
            start()
        })

    program.parse(process.argv)
}

function init() {
    inquirer
        .prompt([
            { type: 'input', name: 'service_port', default: defaultServicePort, message: '请输入服务端口' },
            { type: 'input', name: 'host', default: '127.0.0.1', message: '请输入 mysql 数据库主机地址' },
            { type: 'input', name: 'port', default: 3306, message: '请输入 mysql 数据库端口' },
            { type: 'input', name: 'database', default: 'image-service', message: '请输入 mysql 数据库名称' },
            { type: 'input', name: 'user', message: '请输入 mysql 账号名称' },
            { type: 'password', name: 'password', message: '请输入 mysql 账号密码', mask: '*' },
        ])
        .then(answers => {
            saveConfig(answers)
        });


}

const defaultServicePort = 48628
function start() {
    var { startServer } = require('maishu-node-mvc')
    let config = loadConfig()
    startServer({
        port: config.service_port || defaultServicePort,
        root_path: __dirname
    })
}

main()

