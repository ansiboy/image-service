import { errors } from "../errors";
import jimp = require("jimp");
import { controller, action, serverContext, ServerContext, RequestResult, request, routeData } from 'maishu-node-mvc';
import { IncomingMessage } from "http";
import { ServerContextData } from "../types";
import path = require("path");
import fs = require("fs");
import { createCanvas } from "canvas";
import * as NodeCache from "node-cache";
import { DataSourceSelectArguments } from "maishu-toolkit";
import { appId, createDataContext, dataContext, ImageDataContext, userId } from "../data-context";
import { ImageController } from "./admin-api/image-controller";
import { logger } from "../logger";
import * as webp from "webp-converter";

webp.grant_permission();

const SECONDS = 1;
const MINUTE = 60 * SECONDS;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const imageContentCache = new NodeCache({ stdTTL: DAY });

const imageLatestView: { [key: string]: Date } = {};

@controller("/")
export class HomeController {

    private adminController = new ImageController();

    @action("/")
    index() {
        return "Image Service Started"
    }

    @action()
    temp() {

        webp.cwebp("D:/projects/image-service/out/temp.png", "D:/projects/image-service/out/temp.webp", "-q 50");

        return "";
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
    async image(@dataContext dc: ImageDataContext, @routeData d: { id: string, width: string | number, height: string | number, type: "webp", q?: number }) {
        if (!d.id)
            throw errors.argumentNull('id');

        if (d.type && d.type != "webp")
            throw new Error(`Image format ${d.type} is not supported.`);

        imageLatestView[d.id] = new Date();
        let key = `${d.id}_${d.width || ""}_${d.height || ""}_${d.type || ""}_${d.q || ""}`;
        let cr: RequestResult | undefined = imageContentCache.get(key);
        if (cr) {
            return cr;
        }

        let imageData = await dc.image.findOne({ where: { id: d.id }, select: ["id", "bin", "width", "height", "ext"] });
        if (imageData == null) {
            const DEFAULT_WIDTH = 200;
            const DEFAULT_HEIGHT = 200;
            let { base64, mimeType } = await createNotExistsImage(DEFAULT_WIDTH, DEFAULT_HEIGHT);
            let buffer = Buffer.from(base64, "base64");
            cr = { content: buffer, headers: { "content-type": mimeType } };
            return cr;
        }

        let buffer = imageData.bin;



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

        let ext = imageData.ext;
        if (!ext) {
            ext = (await jimp.read(buffer)).getExtension();
        }

        if (d.type == "webp") {
            ext = "webp";
            let q = d.q || 70;

            let tempDirectory = path.join(__dirname, "../temp");
            if (!fs.existsSync(tempDirectory)) {
                fs.mkdirSync(tempDirectory);
            }

            let sourcePath = path.join(tempDirectory, imageData.id);
            let targetPath = path.join(tempDirectory, imageData.id + ".webp");

            fs.writeFileSync(sourcePath, buffer, { flag: "w" });
            let r = await webp.cwebp(sourcePath, targetPath, `-q ${q}`);
            if (!r)
                buffer = fs.readFileSync(targetPath);
        }

        cr = { content: buffer, headers: { "content-type": `image/${ext}` } };
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
    async remove(@dataContext dc: ImageDataContext, @appId appId: string, @userId userId: string,
        @routeData d: { id: string, ids: string[] }, @request req: IncomingMessage) {
        return this.adminController.remove(dc, appId, userId, d);
    }

    /** @deprecated 使用 AdminApiController.list */
    @action()
    async list(@dataContext dc: ImageDataContext, @appId appId: string, @routeData d: { args: DataSourceSelectArguments }) {
        return this.adminController.list(dc, appId, d);
    }
}

export async function saveImageFile(bin: Buffer, imageId: string) {
    if (!bin) throw errors.argumentNull("bin");
    if (!imageId) throw errors.argumentNull("imageId");

    let j = await jimp.read(bin);
    let dir = path.join(__dirname, `../../log/`);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let imagePath = path.join(dir, `${imageId}.${j.getExtension()}`);
    logger.info(`${imageId} 保存图片到 ${imagePath}`)

    j.write(imagePath)
}

const imageContextTypes = {
    gif: 'image/gif',
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp'
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


let isRuning = false;
setInterval(async () => {

    if (isRuning)
        return;

    isRuning = true;

    try {
        let dc = await createDataContext();
        let keys = Object.keys(imageLatestView);
        for (let i = 0; i < keys.length; i++) {
            let id = keys[i];
            await dc.image.update(id, { latest_view: imageLatestView[id] });
            logger.info(`更新图片 ${id} 浏览时间为 ${imageLatestView[id]}`);
            delete imageLatestView[id];
        }
    }
    finally {
        isRuning = false;
    }

}, 1000 * 60 * 60 * 2);









