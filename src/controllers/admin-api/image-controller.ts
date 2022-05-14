import { DataHelper, In } from "maishu-node-data";
import { action, controller, routeData } from "maishu-node-mvc";
import { DataSourceSelectArguments, guid } from "maishu-toolkit";
import { appId, ControllerRoots, dataContext, ImageDataContext, userId } from "../../data-context";
import { Image as ImageEntity } from "../../entities";
import { errors } from "../../errors";
import Jimp = require("jimp");
import { logger } from "../../logger";
import { saveImageFile } from "../home";

export interface UploadOptions {
    category?: string,
    remark?: string,
}

@controller(`${ControllerRoots.AdminApi}/image`)
export class ImageController {

    @action()
    async list(@dataContext dc: ImageDataContext, @appId appId: string, d: { args: DataSourceSelectArguments }) {
        if (!appId) throw errors.argumentNull("appId");

        d.args = d.args || {};

        if (d.args.filter == null)
            d.args.filter = {};

        if (typeof d.args.filter == "object") {
            (d.args.filter as ImageEntity).application_id = appId;
        }
        else {
            const APP_ID: keyof ImageEntity = "application_id";
            d.args.filter = `(${d.args.filter}) and (${APP_ID} = '${appId}')`;
        }

        if (!d.args.maximumRows) {
            d.args.maximumRows = 10;
        }

        let r = await DataHelper.list(dc.image, { selectArguments: d.args, fields: ["id", "create_date_time", "category", "remark"] });
        return r;
    }

    @action()
    async upload(@appId appId: string, @userId userId: string | undefined, @dataContext dc: ImageDataContext,
        @routeData d: { image: string | Buffer, width: string | number, height: string | number, category: string, remark: string }) {

        let actionId = Date.now();
        logger.info(`${actionId} 上传图片, appId:${appId} userId:${userId} category:${d.category}`);

        let image = d.image;
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


        let result = await this.addImage(dc, b, appId, userId, { category: d.category, remark: d.remark });
        logger.info(`${actionId} 上传图片成功, id:${result.id} userId:${userId}`)
        saveImageFile(b, result.id);

        return result
    }

    @action()
    async base64(@dataContext dc: ImageDataContext, @routeData d: { id: string, width: string | number, height: string | number }) {
        if (!d.id)
            throw errors.argumentNull('id');

        let r = await dc.image.findOne(d.id);
        if (r == null)
            throw errors.objectNotExists("image", d.id);

        if (r.data)
            return r.data;

        var bin = r.bin;
        if (!bin)
            throw new Error(`Image ${d.id} data and bin both null.`);

        return "data:image;base64," + bin.toString("base64");
    }

    @action()
    async remove(@dataContext dc: ImageDataContext, @appId appId: string, @userId userId: string | undefined, @routeData d: { id: string, ids: string[] }) {
        if (!d.id && !d.ids)
            throw errors.argumentNull('id');

        if (!userId)
            throw errors.argumentNull("userId");

        if (!appId)
            throw errors.argumentNull("appId");

        let ids = [];
        if (d.id) {
            ids.push(d.id);
        }

        if (d.ids) {
            ids.push(...d.ids);
        }

        logger.info(`删除图片 id:${d.id} userId:${userId} appId:${appId}`)
        await dc.image.delete({ id: In(ids), application_id: appId });
        return { id: d.id }
    }

    private async addImage(dc: ImageDataContext, image: Buffer, application_id: string,
        userId: string | undefined, options: UploadOptions): Promise<{ id: string }> {

        if (image == null) {
            throw errors.argumentNull("image");
        }

        let getSize = new Promise<{ width: number, height: number, ext: string }>(async function (resolve, reject) {
            Jimp.read(image)
                .then(j => {
                    resolve({ width: j.getWidth(), height: j.getHeight(), ext: j.getExtension() })
                })
                .catch(err => {
                    reject(err);
                })
        })

        let size = await getSize;
        let id = `${guid()}_${size.width}_${size.height}`;
        let item: ImageEntity = {
            id, bin: image, create_date_time: new Date(), application_id,
            width: size.width, height: size.height, category: options.category, user_id: userId,
            remark: options.remark, ext: size.ext,
        }

        var r = await dc.image.insert(item);
        if (r.raw.affectedRows != 1)
            throw errors.inserImageFail();

        return { id: item.id };
    }

}

