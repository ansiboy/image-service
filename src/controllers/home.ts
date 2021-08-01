import { errors } from "../errors";
import { guid, settings } from "../common";
import * as mysql from 'mysql';
import jimp = require("jimp");
import { controller, action, serverContext, ServerContext, RequestResult } from 'maishu-node-mvc';
import { request, routeData } from "maishu-node-mvc";
import { IncomingMessage } from "http";
import * as url from 'url';
import { Parser, ExpressionTypes } from "../expression";
import * as querystring from 'querystring';
import { ServerContextData } from "../types";
import path = require("path");
import fs = require("fs");
import http = require("http");

@controller("/")
export class HomeController {
    @action("/")
    index() {
        return "Image Service Started"
    }

    @action("/Images/*")
    async Image(@routeData routeData: any, @serverContext context: ServerContext<ServerContextData>) {
        if (!context.data?.imagesPhysicalPath)
            throw errors.configFieldNull("imagesPhysicalPath");

        let fileVirtaulPath = routeData["*"];
        let filePhysicalPath = path.join(context.data.imagesPhysicalPath, fileVirtaulPath);
        if (fs.existsSync(filePhysicalPath) == false)
            throw errors.fileNotExist(filePhysicalPath);

        let buffer: Buffer = fs.readFileSync(filePhysicalPath);
        let r: RequestResult = { content: buffer, headers: { "content-type": imageContextTypes.jpeg } };
        return r;
    }

    @action()
    async image(@routeData d: { id: string, width: string | number, height: string | number }) {
        if (!d.id)
            throw errors.argumentNull('id')

        let r = await getImage(d.id);
        let arr = r.base64.split(",");
        if (arr.length != 2) {
            throw errors.dataFormatError();
        }

        let buffer = Buffer.from(arr[1], 'base64');
        let width = typeof d.width == "string" ? Number.parseInt(d.width) : d.width;
        let height = typeof d.height == "string" ? Number.parseInt(d.height) : d.height;

        if (width != null || height != null) {
            if (height == null) {
                height = width / r.width * r.height
            }
            if (width == null) {
                width = height / r.height * r.width
            }
            width = typeof width == 'number' ? width : parseInt(width)
            height = typeof height == 'number' ? height : parseInt(height)
            buffer = await resizeImage(buffer, width, height)
        }

        let cr: RequestResult = { content: buffer, headers: { "content-type": imageContextTypes.jpeg } };
        return cr;
    }

    @action()
    async base64(@routeData d: { id: string, width: string | number, height: string | number }) {
        if (!d.id)
            throw errors.argumentNull('id');

        let r = await getImage(d.id);
        if (r == null)
            throw errors.objectNotExists("image", d.id);

        return r.base64;
    }

    @action()
    async upload(@routeData d: { image: string | Buffer, width: string | number, height: string | number }, @request req: IncomingMessage) {


        let image = d.image;
        let width = typeof d.width == "string" ? Number.parseInt(d.width) : d.width;
        let height = typeof d.height == "string" ? Number.parseInt(d.height) : d.height;

        let applicationId = getApplicationId(req);
        let result = await addImage(image, width, height, applicationId);
        return result
    }

    @action()
    async remove(@routeData d: { id: string }, @request req: IncomingMessage) {
        if (!d.id)
            throw errors.argumentNull('id');

        let applicationId = getApplicationId(req);
        await removeImage(d.id, applicationId);
        return { id: d.id }
    }

    @action()
    async list(@request req: http.IncomingMessage) {
        return list(req);
    }
}

const imageContextTypes = {
    gif: 'image/gif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
}

async function getImage(id: string) {
    type ImageData = { base64: string, width: number, height: number }
    return new Promise<ImageData>((resolve, reject) => {

        let conn = createConnection();

        let sql = `select id, data, width, height from image where id = ?`;
        conn.query(sql, id, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            if (!rows[0]) {
                let err = errors.objectNotExists('image', id);
                reject(err);
                return;
            }



            resolve({ base64: rows[0].data, width: rows[0].width, height: rows[0].height })
            return;
        });


        conn.end();
    })
}

async function resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    height = height || width;
    let image = await jimp.read(buffer)
    image.resize(width, height)
    return image.getBufferAsync(jimp.MIME_JPEG)
}

async function addImage(image: string | Buffer, width: number, height: number, application_id: string): Promise<{ id: string }> {
    if (image == null) {
        throw errors.argumentNull("image");
    }

    var b: Buffer;
    if (typeof image == "string") {
        let arr = image.split(',');
        if (arr.length != 2) {
            return Promise.reject(errors.dataFormatError());
        }

        b = Buffer.from(arr[1], "base64");
    }
    else {
        b = image;
    }

    let getSize: Promise<{ width: number, height: number }> = (width == null || height == null) ?
        new Promise((resolve, reject) => {
            jimp.read(b).then(pic => {
                width = pic.getWidth();
                height = pic.getHeight();
                resolve({ width, height });
            }).catch(err => {
                reject(err);
            })
        }) :
        Promise.resolve({ width, height });


    return getSize.then(size => {
        return new Promise<{ id: string, width: number, height: number, create_date_time: string }>((resolve, reject) => {
            let value = new Date(Date.now());
            let create_date_time = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()} ${value.getHours()}:${value.getMinutes()}:${value.getSeconds()}`
            let conn = createConnection();
            let sql = `insert into image set ?`;
            if (typeof image != "string")
                image = `data:image;base64,${image.toString("base64")}`;

            let item = {
                id: `${guid()}_${size.width}_${size.height}`, data: image, create_date_time,
                application_id, width: size.width, height: size.height
            };
            conn.query(sql, item, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({ id: item.id, width: size.width, height: size.height, create_date_time });
            })

            conn.end();
        })
    })
}

async function removeImage(id: string, application_id: string) {
    return new Promise((resolve, reject) => {
        let conn = createConnection();
        let sql = `delete from image where id = ? and application_id = ?`;
        conn.query(sql, [id, application_id], (err) => {
            if (err) {
                reject(err)
                return
            }

            resolve({})
        })
        conn.end()
    })
}

function createConnection() {
    let config = settings.db;
    console.assert(config != null);
    return mysql.createConnection(config)
}

type SelectArguments = {
    startRowIndex?: number;
    maximumRows?: number;
    sortExpression?: string;
    filter?: string;
}

function getApplicationId(req: IncomingMessage): string {
    let obj: any = parseQueryString(req);
    let application_id = obj['application-id'] || req.headers['application-id'];
    return application_id;
}

async function list(req: IncomingMessage) {

    let postData = await parsePostData(req);
    let obj = parseQueryString(req);
    let args: SelectArguments = Object.assign({}, obj, postData);
    let application_id = getApplicationId(req);
    if (application_id == null)
        throw errors.parameterRequired('application-id');


    if (args.filter) {
        let expr = Parser.parseExpression(args.filter);
        if (expr.type != ExpressionTypes.Binary) {
            return Promise.reject(new Error(`Parser filter fail, filter is '${args.filter}'`));
        }
    }
    if (args.sortExpression) {
        let expr = Parser.parseOrderExpression(args.sortExpression);
        if (expr.type != ExpressionTypes.Order) {
            return Promise.reject(new Error(`Parser sort expression fail, sort expression is '${args.filter}'`));
        }
    }

    let defaults: SelectArguments = {
        startRowIndex: 0,
        maximumRows: 10,
        sortExpression: 'create_date_time desc',
        filter: 'true'
    }

    args = Object.assign(defaults, args)

    let config = settings.db;
    console.assert(config != null);
    let conn = mysql.createConnection(config);

    let p1 = new Promise<{ id: string, width: number, height: number }>((resolve, reject) => {
        let sql: string;
        if (application_id) {
            args.filter = args.filter ?
                `${args.filter} and application_id = '${application_id}'` :
                `application_id = '${application_id}'`;
        }

        if (args.filter) {
            sql = `select id, width, height, create_date_time from image 
                   where ${args.filter}
                   order by create_date_time desc
                   limit ${args.startRowIndex}, ${args.maximumRows}`;
        }
        else {
            sql = `select id, width, height, create_date_time from image 
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
    })

    let p2 = new Promise<number>((resolve, reject) => {
        let sql = `select count(*) as count from image where ${args.filter} and application_id = '${application_id}' order by create_date_time desc`;
        conn.query(sql, args, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(rows[0].count);
        });
    })

    conn.end();

    let r = await Promise.all([p1, p2]);
    let dataItems = r[0];
    let totalRowCount = r[1];

    return { dataItems, totalRowCount };

}

function parseQueryString(req: IncomingMessage): object {
    let urlInfo = url.parse(req.url || "");
    let { search } = urlInfo;
    let contentType = req.headers['content-type'] || '' as string;
    if (!search)
        return {};

    search = search[0] == '?' ? search.substr(1) : search;
    let result: object;
    if (contentType.indexOf('application/json') >= 0) {
        result = JSON.parse(search);
    }
    else {
        result = querystring.parse(search);
    }
    return result;
}

function parsePostData(request: IncomingMessage): Promise<object> {
    let length = request.headers['content-length'] || 0;
    let contentType = request.headers['content-type'] as string;
    if (length <= 0)
        return Promise.resolve({});

    return new Promise((reslove, reject) => {
        var text = "";
        request.on('data', (data: { toString: () => string }) => {
            text = text + data.toString();
        });

        request.on('end', () => {
            let obj;
            try {
                if (contentType.indexOf('application/json') >= 0) {
                    obj = JSON.parse(text)
                }
                else {
                    obj = querystring.parse(text);
                }
                reslove(obj);
            }
            catch (err) {
                reject(err);
            }
        })
    });
}
