import { errors } from "../errors";
import { guid, parseQueryString, settings } from "../common";
import * as mysql from 'mysql';
import jimp = require("jimp");
import { controller, action, serverContext, ServerContext, RequestResult, request, routeData } from 'maishu-node-mvc';
import { IncomingMessage } from "http";
import { Parser, ExpressionTypes } from "../expression";
import * as querystring from 'querystring';
import { ServerContextData } from "../types";
import path = require("path");
import fs = require("fs");
import { createCanvas, Image } from "canvas";
import * as NodeCache from "node-cache";
import { DataSourceSelectArguments } from "maishu-toolkit";
import { appId, dataContext, ImageDataContext, userId } from "../data-context";
import { ImageController, UploadOptions } from "./admin-api/image-controller";

const SECONDS = 1;
const MINUTE = 60 * SECONDS;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const imageCache = new NodeCache();
const imageContentCache = new NodeCache({ stdTTL: DAY });


@controller("/")
export class HomeController {

    private adminController = new ImageController();

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
    async image(@dataContext dc: ImageDataContext, @routeData d: { id: string, width: string | number, height: string | number }) {
        if (!d.id)
            throw errors.argumentNull('id')

        let key = `${d.id}_${d.width || ""}_${d.height || ""}`;
        let cr: RequestResult | undefined = imageContentCache.get(key);
        if (cr) {
            return cr;
        }

        // let width = typeof d.width == "string" ? Number.parseInt(d.width) : d.width;
        // let height = typeof d.height == "string" ? Number.parseInt(d.height) : d.height;

        let imageEntity = await dc.image.findOne(d.id);
        let imageData: { base64: string, width: number, height: number };
        if (imageEntity == null) {
            const DEFAULT_WIDTH = 200;
            const DEFAULT_HEIGHT = 200;
            let { base64, mimeType } = await createNotExistsImage(DEFAULT_WIDTH, DEFAULT_HEIGHT);
            imageData = { base64, width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT };
            let buffer = Buffer.from(base64, "base64");
            cr = { content: buffer, headers: { "content-type": mimeType } };
            return cr;
        }
        else {
            imageData = { base64: imageEntity.data, width: imageEntity.width, height: imageEntity.height }
        }


        let arr = imageData.base64.split(",");
        if (arr.length != 2) {
            throw errors.dataFormatError();
        }

        let buffer = Buffer.from(arr[1], 'base64');
        if (d.width != null || d.height != null) {

            let width = typeof d.width == "string" ? Number.parseInt(d.width) : d.width;
            let height = typeof d.height == "string" ? Number.parseInt(d.height) : d.height;

            if (height == null) {
                height = width / imageData.width * imageData.height
            }
            if (width == null) {
                width = height / imageData.height * imageData.width
            }
            width = typeof width == 'number' ? width : parseInt(width)
            height = typeof height == 'number' ? height : parseInt(height)
            let obj = await resizeImage(buffer, width, height);

            cr = { content: obj.buffer, headers: { "content-type": obj.mine } };
            imageContentCache.set(key, cr);
            return cr;
        }

        let j = await jimp.read(buffer);
        var mimeType = j.getMIME();

        cr = { content: buffer, headers: { "content-type": mimeType } };
        imageContentCache.set(key, cr);
        return cr;
    }

    /** 获取与图片编号对应图片的 Base64 */
    @action()
    async base64(@dataContext dc: ImageDataContext, @routeData d: { id: string, width: string | number, height: string | number }) {
        return this.adminController.base64(dc, d);
    }

    /** @deprecated 使用 AdminApiController.upload */
    @action()
    async upload(@dataContext dc: ImageDataContext, @appId appId: string, @userId userId: string,
        @routeData d: { image: string | Buffer, width: string | number, height: string | number, category: string, remark: string }) {
        return this.adminController.upload(appId, userId, dc, d);
    }

    /** @deprecated 使用 AdminApiController.remove */
    @action()
    async remove(@dataContext dc: ImageDataContext, @appId appId: string, @routeData d: { id: string, ids: string[] }, @request req: IncomingMessage) {
        return this.adminController.remove(dc, appId, d);
    }

    /** @deprecated 使用 AdminApiController.list */
    @action()
    async list(@dataContext dc: ImageDataContext, @appId appId: string, @routeData d: { args: DataSourceSelectArguments }) {
        return this.adminController.list(dc, appId, d);
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
    let r: ImageData | undefined = imageCache.get(id);
    if (!r) {
        r = await new Promise<ImageData | undefined>((resolve, reject) => {

            let conn = createConnection();

            let sql = `select id, data, width, height from image where id = ?`;
            conn.query(sql, id, (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }

                if (!rows[0]) {
                    resolve(undefined);
                    return;
                }

                resolve({ base64: rows[0].data, width: rows[0].width, height: rows[0].height })
                return;
            });


            conn.end();
        })

        imageCache.set(id, r);
    }


    return r;
}

async function createNotExistsImage(width: number, height: number) {
    var canvas = createCanvas(width, height);
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, width, height);

    const mimeType = "image/png";
    const base64 = canvas.toDataURL(mimeType);
    return { base64, mimeType };
}

async function resizeImage(buffer: Buffer, width: number, height: number): Promise<{ buffer: Buffer, mine: string }> {
    height = height || width;
    let image = await jimp.read(buffer)
    image.resize(width, height);
    let mine = image.getMIME();
    buffer = await image.getBufferAsync(mine)
    return { buffer, mine };

}

async function addImage(image: string | Buffer, width: number, height: number, application_id: string, category?: string): Promise<{ id: string }> {
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
            let base64 = b.toString("base64");
            var image = new Image();
            image.src = `data:image;base64,${base64}`;
            resolve({ width: image.width, height: image.height });
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
                application_id, width: size.width, height: size.height, category
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
    console.assert(config != null, "config is null");
    return mysql.createConnection(config)
}

type SelectArguments = {
    startRowIndex?: number;
    maximumRows?: number;
    sortExpression?: string;
    filter?: string;
}



async function list(req: IncomingMessage, application_id: string) {

    let postData = await parsePostData(req);
    let obj = parseQueryString(req);
    let args: SelectArguments = Object.assign({}, obj, postData);
    // let application_id = getApplicationId(req);
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
    console.assert(config != null, "config is null");
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
