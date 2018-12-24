import { errors } from "../errors";
import { Config, guid, loadConfig } from "../common";
import * as mysql from 'mysql';
import * as jimp from 'jimp';
import { register, ContentResult } from 'maishu-node-mvc'
class HomeController {
    index({ id }) {
        return "Image Service Started"
    }
    async image({ id, width, height }) {
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
    upload({ image, width, height }) {
        return addImage(image, width, height, '000-000')
    }
}

register(HomeController)
    .action('index', '/')
    .action('image', '/image')
    .action('upload', '/upload')

exports.default = HomeController

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
        conn.query(sql, id, (err, rows, fields) => {
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
            // resolve({ data: buffer, contentType: imageContextTypes.jpeg })
            resolve({ buffer: buffer, width: rows[0].width, height: rows[0].height })
            return;
        });


        conn.end();
    })
}

async function resizeImage(buffer: Buffer, width: number, height: number): Promise<Buffer> {
    height = height || width;
    // return new Promise<Buffer>((resolve, reject) => {
    let image = await jimp.read(buffer)
    image.resize(width, height)
    return image.getBufferAsync(jimp.MIME_JPEG)
    // var sharpInstance = sharp(buffer).resize(width, height);
    // var typeMethod = (sharpInstance[type] as Function || sharpInstance.webp).bind(sharpInstance);
    // typeMethod().toBuffer((err, data) => {
    //     if (err) reject(err);

    //     resolve(data);
    // });
    // })
}

const contentTypes = {
    application_json: 'application/json',
    text_plain: 'text/plain',
}

async function addImage(image, width, height, application_id) {

    if (image == null) {
        throw errors.argumentNull("image");
    }

    return new Promise((resolve, reject) => {
        let value = new Date(Date.now());
        let create_date_time = `${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()} ${value.getHours()}:${value.getMinutes()}:${value.getSeconds()}`

        let conn = createConnection();
        let sql = `insert into image set ?`;

        let item = { id: guid(), data: image, create_date_time, application_id, width, height };
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
        })

        conn.end();
    })
}

function createConnection() {
    let config: Config = loadConfig()
    let mysql_setting: mysql.ConnectionConfig = {
        host: config.host, database: config.database, port: config.port,
        password: config.password, user: config.user
    };
    return mysql.createConnection(mysql_setting)
}

