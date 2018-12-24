import { errors } from "../errors";
import { Config, guid, loadConfig } from "../common";
import * as mysql from 'mysql';

import { register, ContentResult } from 'maishu-node-mvc'
class HomeController {
    index({ id }) {
        if (!id)
            throw errors.argumentNull('id')

        return imageFromMysql(id)
    }
    upload({ image, width, height }) {
        return addImage(image, width, height, '000-000')
    }
}

register(HomeController)
    .action('index', '/')
    .action('upload', '/upload')

exports.default = HomeController

const imageContextTypes = {
    gif: 'image/gif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
}

async function imageFromMysql(id) {

    return new Promise((resolve, reject) => {

        let conn = createConnection();

        let sql = `select id, data from image where id = ?`;
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
            let result = new ContentResult(buffer, imageContextTypes.jpeg)
            // resolve({ data: buffer, contentType: imageContextTypes.jpeg })
            resolve(result)
            return;
        });


        conn.end();
    })
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

