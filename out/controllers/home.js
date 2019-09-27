"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
const decorators_1 = require("maishu-node-mvc/decorators");
const http_1 = require("http");
const url = require("url");
const expression_1 = require("../expression");
const querystring = require("querystring");
class HomeController {
    index() {
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
    upload({ image, width, height }, req) {
        return __awaiter(this, void 0, void 0, function* () {
            let applicationId = getApplicationId(req);
            let result = yield addImage(image, width, height, applicationId);
            return result;
        });
    }
    remove({ id }, req) {
        return __awaiter(this, void 0, void 0, function* () {
            let applicationId = getApplicationId(req);
            yield removeImage(id, applicationId);
            return { id };
        });
    }
    list(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return list(req);
        });
    }
}
__decorate([
    __param(0, decorators_1.routeData),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "image", null);
__decorate([
    __param(0, decorators_1.routeData), __param(1, decorators_1.request),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, http_1.IncomingMessage]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "upload", null);
__decorate([
    __param(0, decorators_1.routeData), __param(1, decorators_1.request),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, http_1.IncomingMessage]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "remove", null);
__decorate([
    __param(0, decorators_1.request),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "list", null);
maishu_node_mvc_1.register(HomeController)
    .action('index', ['/'])
    .action('image', ['/image'])
    .action('upload', ['/upload'])
    .action('remove', ['/remove'])
    .action('list', ['/list']);
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
            conn.query(sql, id, (err, rows) => {
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
// const contentTypes = {
//     application_json: 'application/json',
//     text_plain: 'text/plain',
// }
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
            let item = { id: `${common_1.guid()}_${width}_${height}`, data: image, create_date_time, application_id, width, height };
            conn.query(sql, item, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                // let result = {
                //     data: JSON.stringify({ id: item.id }),
                //     contentType: contentTypes.application_json
                // };
                resolve({ id: item.id });
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
    return mysql.createConnection(config);
}
function getApplicationId(req) {
    let obj = parseQueryString(req);
    let application_id = obj['application-id'] || req.headers['application-id'];
    return application_id;
}
function list(req) {
    return __awaiter(this, void 0, void 0, function* () {
        let postData = yield parsePostData(req);
        let obj = parseQueryString(req);
        let args = Object.assign({}, obj, postData);
        let application_id = getApplicationId(req);
        if (application_id == null)
            throw errors_1.errors.parameterRequired('application-id');
        if (args.filter) {
            let expr = expression_1.Parser.parseExpression(args.filter);
            if (expr.type != expression_1.ExpressionTypes.Binary) {
                return Promise.reject(new Error(`Parser filter fail, filter is '${args.filter}'`));
            }
        }
        if (args.sortExpression) {
            let expr = expression_1.Parser.parseOrderExpression(args.sortExpression);
            if (expr.type != expression_1.ExpressionTypes.Order) {
                return Promise.reject(new Error(`Parser sort expression fail, sort expression is '${args.filter}'`));
            }
        }
        let defaults = {
            startRowIndex: 0,
            maximumRows: 10,
            sortExpression: 'create_date_time desc',
            filter: 'true'
        };
        args = Object.assign(defaults, args);
        let config = common_1.loadConfig();
        let conn = mysql.createConnection(config);
        let p1 = new Promise((resolve, reject) => {
            let sql;
            if (application_id) {
                args.filter = args.filter ?
                    `${args.filter} and application_id = '${application_id}'` :
                    `application_id = '${application_id}'`;
            }
            if (args.filter) {
                sql = `select id, width, height from image 
                   where ${args.filter}
                   order by create_date_time desc
                   limit ${args.startRowIndex}, ${args.maximumRows}`;
            }
            else {
                sql = `select id, width, height from image 
                   order by create_date_time desc
                   limit ${args.startRowIndex}, ${args.maximumRows}`;
            }
            conn.query(sql, args, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
        let p2 = new Promise((resolve, reject) => {
            let sql = `select count(*) as count from image where ${args.filter} and application_id = '${application_id}' order by create_date_time desc`;
            conn.query(sql, args, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows[0].count);
            });
        });
        conn.end();
        let r = yield Promise.all([p1, p2]);
        let dataItems = r[0];
        let totalRowCount = r[1];
        return { dataItems, totalRowCount };
    });
}
function parseQueryString(req) {
    let urlInfo = url.parse(req.url);
    let { search } = urlInfo;
    let contentType = req.headers['content-type'] || '';
    if (!search)
        return {};
    search = search[0] == '?' ? search.substr(1) : search;
    let result;
    if (contentType.indexOf('application/json') >= 0) {
        result = JSON.parse(search);
    }
    else {
        result = querystring.parse(search);
    }
    return result;
}
function parsePostData(request) {
    let length = request.headers['content-length'] || 0;
    let contentType = request.headers['content-type'];
    if (length <= 0)
        return Promise.resolve({});
    return new Promise((reslove, reject) => {
        var text = "";
        request.on('data', (data) => {
            text = text + data.toString();
        });
        request.on('end', () => {
            let obj;
            try {
                if (contentType.indexOf('application/json') >= 0) {
                    obj = JSON.parse(text);
                }
                else {
                    obj = querystring.parse(text);
                }
                reslove(obj);
            }
            catch (err) {
                reject(err);
            }
        });
    });
}
