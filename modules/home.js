"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const common_1 = require("../common");
const mysql = require("mysql");
const maishu_node_mvc_1 = require("maishu-node-mvc");
class HomeController {
    index({ id }) {
        if (!id)
            throw errors_1.errors.argumentNull('id');
        return imageFromMysql(id);
    }
    upload({ image, width, height }) {
        return addImage(image, width, height, '000-000');
    }
}
maishu_node_mvc_1.register(HomeController)
    .action('index', '/')
    .action('upload', '/upload');
exports.default = HomeController;
const imageContextTypes = {
    gif: 'image/gif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
};
function imageFromMysql(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let conn = createConnection();
            let sql = `select id, data from image where id = ?`;
            conn.query(sql, id, (err, rows, fields) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (!rows[0]) {
                    let err = errors_1.errors.objectNotExists('image', id);
                    reject(err);
                    return;
                }
                let arr = (rows[0].data || '').split(',');
                if (arr.length != 2) {
                    reject(errors_1.errors.dataFormatError());
                    return;
                }
                let buffer = new Buffer(arr[1], 'base64');
                let result = new maishu_node_mvc_1.ContentResult(buffer, imageContextTypes.jpeg);
                // resolve({ data: buffer, contentType: imageContextTypes.jpeg })
                resolve(result);
                return;
            });
            conn.end();
        });
    });
}
const contentTypes = {
    application_json: 'application/json',
    text_plain: 'text/plain',
};
function addImage(image, width, height, application_id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (image == null) {
            throw errors_1.errors.argumentNull("image");
        }
        return new Promise((resolve, reject) => {
            let value = new Date(Date.now());
            let create_date_time = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()} ${value.getHours()}:${value.getMinutes()}:${value.getSeconds()}`;
            let conn = createConnection();
            let sql = `insert into image set ?`;
            let item = { id: common_1.guid(), data: image, create_date_time, application_id, width, height };
            conn.query(sql, item, (err, rows, fields) => {
                if (err) {
                    reject(err);
                    return;
                }
                let result = {
                    data: JSON.stringify({ id: item.id }),
                    contentType: contentTypes.application_json
                };
                resolve(result);
            });
            conn.end();
        });
    });
}
function createConnection() {
    let config = common_1.loadConfig();
    let mysql_setting = {
        host: config.host, database: config.database, port: config.port,
        password: config.password, user: config.user
    };
    return mysql.createConnection(mysql_setting);
}
