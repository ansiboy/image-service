import { errors } from "../errors";
import { Config, guid, loadConfig } from "../common";
import * as mysql from 'mysql';
import * as jimp from 'jimp';
import { register, ContentResult } from 'maishu-node-mvc'
import { IncomingMessage } from "http";

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
    async upload({ image, width, height }, request: IncomingMessage) {
        let userId = request.headers['user_id'] || ''
        let result = await addImage(image, width, height, userId);
        return result
    }
    async remove({ id }, request: IncomingMessage) {
        let userId = request.headers['user_id'] as string || ''
        await removeImage(id, userId);
        return {}
    }
}

register(HomeController)
    .action('index', ['/'])
    .action('image', ['/image'])
    .action('upload', ['/upload'])
    .action('remove', ['/remove'])

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

const contentTypes = {
    application_json: 'application/json',
    text_plain: 'text/plain',
}

async function addImage(image: string, width: number, height: number, application_id) {

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

