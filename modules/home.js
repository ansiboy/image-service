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
const jimp = require("jimp");
const maishu_node_mvc_1 = require("maishu-node-mvc");
class HomeController {
    index({ id }) {
        return "Image Service Started";
    }
    image({ id, width, height }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id)
                throw errors_1.errors.argumentNull('id');
            let buffer;
            let r = yield getImage(id);
            buffer = r.buffer;
            if (width != null || height != null) {
                if (height == null) {
                    height = width / r.width * r.height;
                }
                if (width == null) {
                    width = height / r.height * r.width;
                }
                width = typeof width == 'number' ? width : parseInt(width);
                height = typeof height == 'number' ? height : parseInt(height);
                buffer = yield resizeImage(buffer, width, height);
            }
            return new maishu_node_mvc_1.ContentResult(buffer, imageContextTypes.jpeg);
        });
    }
    upload({ image, width, height }, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = request.headers['user_id'] || '';
            let result = yield addImage(image, width, height, userId);
            return result;
        });
    }
    remove({ id }, request) {
        return __awaiter(this, void 0, void 0, function* () {
            let userId = request.headers['user_id'] || '';
            let result = yield removeImage(id, userId);
            return result;
        });
    }
}
maishu_node_mvc_1.register(HomeController)
    .action('index', '/')
    .action('image', '/image')
    .action('upload', '/upload');
exports.default = HomeController;
const imageContextTypes = {
    gif: 'image/gif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
};
function getImage(id) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let conn = createConnection();
            let sql = `select id, data, width, height from image where id = ?`;
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
                resolve({ buffer: buffer, width: rows[0].width, height: rows[0].height });
                return;
            });
            conn.end();
        });
    });
}
function resizeImage(buffer, width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        height = height || width;
        let image = yield jimp.read(buffer);
        image.resize(width, height);
        return image.getBufferAsync(jimp.MIME_JPEG);
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
        let arr = image.split(',');
        if (arr.length != 2) {
            return Promise.reject(errors_1.errors.dataFormatError());
        }
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (width == null || height == null) {
                let b = new Buffer(arr[1], 'base64');
                try {
                    let image = yield jimp.read(b);
                    width = image.getWidth();
                    height = image.getHeight();
                }
                catch (err) {
                    reject(err);
                    return;
                }
            }
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
        }));
    });
}
function removeImage(id, application_id) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            let conn = createConnection();
            let sql = `delete from image where id = ? and application_id = ?`;
            conn.query(sql, [id, application_id], (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
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
