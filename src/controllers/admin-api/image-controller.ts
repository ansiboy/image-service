import { DataHelper, In } from "maishu-node-data";
import { action, controller, routeData } from "maishu-node-mvc";
import { DataSourceSelectArguments, guid } from "maishu-toolkit";
import { appId, ControllerRoots, dataContext, ImageDataContext, userId } from "../../data-context";
import { Image as ImageEntity } from "../../entities";
import { errors } from "../../errors";
import { Image } from "canvas";

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
        let image = d.image;
        let width = typeof d.width == "string" ? Number.parseInt(d.width) : d.width;
        let height = typeof d.height == "string" ? Number.parseInt(d.height) : d.height;


        let result = await this.addImage(dc, image, width, height, appId, userId, { category: d.category, remark: d.remark });
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
    async remove(@dataContext dc: ImageDataContext, @appId appId: string, @routeData d: { id: string, ids: string[] }) {
        if (!d.id && !d.ids)
            throw errors.argumentNull('id');

        let ids = [];
        if (d.id) {
            ids.push(d.id);
        }

        if (d.ids) {
            ids.push(...d.ids);
        }

        await dc.image.delete({ id: In(ids), application_id: appId });
        return { id: d.id }
    }

    private async addImage(dc: ImageDataContext, image: string | Buffer, width: number, height: number, application_id: string,
        userId: string | undefined, options: UploadOptions): Promise<{ id: string }> {

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


        if (typeof image != "string")
            image = `data:image;base64,${image.toString("base64")}`;

        let size = await getSize;
        let item: ImageEntity = {
            id: guid(), data: image, bin: b, create_date_time: new Date(), application_id,
            width: size.width, height: size.height, category: options.category, user_id: userId,
            remark: options.remark,
        }

        var r = await dc.image.insert(item);
        if (r.raw.affectedRows != 1)
            throw errors.inserImageFail();

        return { id: item.id };
    }

}

