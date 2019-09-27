import { errors } from "../errors";
import { guid, loadConfig } from "../common";
import * as mysql from 'mysql';
import * as jimp from 'jimp';
import { register, ContentResult } from 'maishu-node-mvc';
import { request, routeData } from "maishu-node-mvc/decorators";
import { IncomingMessage } from "http";
import * as url from 'url';
import { Parser, ExpressionTypes } from "../expression";
import * as querystring from 'querystring';

class HomeController {
    index() {
        return "Image Service Started"
    }

    async image(@routeData { id, width, height }) {
        if (!id)
            throw errors.argumentNull('id')

        let buffer: Buffer
        let r = await getImage(id)
        buffer = r.buffer
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

        return new ContentResult(buffer, imageContextTypes.jpeg)
    }
    async upload(@routeData { image, width, height }, @request req: IncomingMessage) {
        let applicationId = getApplicationId(req);
        let result = await addImage(image, width, height, applicationId);
        return result
    }
    async remove(@routeData { id }, @request req: IncomingMessage) {
        let applicationId = getApplicationId(req);
        await removeImage(id, applicationId);
        return { id }
    }
    async list(@request req) {
        return list(req)
    }
}

register(HomeController)
    .action('index', ['/'])
    .action('image', ['/image'])
    .action('upload', ['/upload'])
    .action('remove', ['/remove'])
    .action('list', ['/list'])

const imageContextTypes = {
    gif: 'image/gif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
}

async function getImage(id) {
    type ImageData = { buffer: Buffer, width: number, height: number }
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

            let arr = (rows[0].data || '').split(',');
            if (arr.length != 2) {
                reject(errors.dataFormatError());
                return;
            }

            let buffer = new Buffer(arr[1], 'base64');
            resolve({ buffer: buffer, width: rows[0].width, height: rows[0].height })
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

// const contentTypes = {
//     application_json: 'application/json',
//     text_plain: 'text/plain',
// }

async function addImage(image: string, width: number, height: number, application_id: string): Promise<{ id: string }> {

    if (image == null) {
        throw errors.argumentNull("image");
    }

    let arr = image.split(',');
    if (arr.length != 2) {
        return Promise.reject(errors.dataFormatError());
    }

    return new Promise(async (resolve, reject) => {

        if (width == null || height == null) {
            let b = new Buffer(arr[1], 'base64')
            try {
                let image = await jimp.read(b)
                width = image.getWidth()
                height = image.getHeight()
            }
            catch (err) {
                reject(err)
                return
            }
        }

        let value = new Date(Date.now());
        let create_date_time = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()} ${value.getHours()}:${value.getMinutes()}:${value.getSeconds()}`

        let conn = createConnection();
        let sql = `insert into image set ?`;

        let item = { id: `${guid()}_${width}_${height}`, data: image, create_date_time, application_id, width, height };
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
        })

        conn.end();
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

            resolve()
        })
        conn.end()
    })
}

function createConnection() {
    let config = loadConfig()
    return mysql.createConnection(config)
}

type SelectArguments = {
    startRowIndex?: number;
    maximumRows?: number;
    sortExpression?: string;
    filter?: string;
}

function getApplicationId(req: IncomingMessage): string {
    let obj = parseQueryString(req);
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

    let config = loadConfig()
    let conn = mysql.createConnection(config);

    let p1 = new Promise((resolve, reject) => {
        let sql: string;
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
    let urlInfo = url.parse(req.url);
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
