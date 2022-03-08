import { action, controller, request, response, routeData } from "maishu-nws-mvc";
import { guid } from "../../common";
import { errors } from "../../errors";
import { IncomingMessage, ServerResponse } from "http";
import { RequestResult } from "maishu-node-mvc";
import * as fs from "fs";
import * as path from "path";
import { DataSourceSelectArguments } from "maishu-toolkit";
import { appId, ControllerRoots } from "../../data-context";

@controller(`${ControllerRoots.AdminApi}/video`)
export class AdminVideoController {
    @action()
    async upload(@routeData d: { video: Buffer, name?: string }, @request req: IncomingMessage, @appId applicationId: string) {
        if (!d.video) throw errors.argumentNull("video");
        if (!d.name) d.name = guid();

        // let applicationId = getApplicationId(req);
        let videoPath = AdminVideoController.getVideoPaths(applicationId);

        let filePath = path.join(videoPath, d.name);
        if (fs.existsSync(d.name))
            throw errors.fileExist(d.name);

        fs.writeFileSync(filePath, d.video);
        return { name: d.name, filePath };
    }

    @action("remove/:id")
    async remove(@routeData d: { id: string }, @request req: IncomingMessage, @appId applicationId: string) {
        if (!d.id) throw errors.argumentNull("id");

        // let applicationId = getApplicationId(req);
        let videoPath = AdminVideoController.getVideoPaths(applicationId);
        let filePath = path.join(videoPath, d.id);
        if (fs.existsSync(filePath))
            fs.unlinkSync(filePath);

        return { id: d.id };
    }

    @action()
    async list(@routeData d: { args: DataSourceSelectArguments }, @request req: IncomingMessage, @appId applicationId: string) {

        let args = d.args || {};
        let maximumRows = args.maximumRows || 10;
        let startRowIndex = args.startRowIndex || 0;

        // let applicationId = getApplicationId(req);
        let videoPath = AdminVideoController.getVideoPaths(applicationId);
        let fileNames = fs.readdirSync(videoPath);
        let r = fileNames.map(fileName => {
            let filePath = path.join(videoPath, fileName);
            let stat = fs.statSync(filePath);
            if (stat.isFile() == false)
                return null;

            return { id: fileName, createDateTime: stat.ctime, size: stat.size };

        }).filter(o => o).filter((o, i) => i >= startRowIndex && i <= startRowIndex + maximumRows);

        return r;
    }

    @action(":fileName")
    async view(@routeData d: { fileName: string }, @request req: IncomingMessage, @response res: ServerResponse, @appId applicationId: string): Promise<RequestResult> {
        if (!d.fileName) throw errors.argumentNull("fileName");

        d.fileName = decodeURI(d.fileName);
        // let applicationId = getApplicationId(req);
        let videoPath = AdminVideoController.getVideoPaths(applicationId);

        let filePath = path.join(videoPath, d.fileName);//
        if (!fs.existsSync(filePath)) {
            throw errors.fileNotExist(d.fileName);
        }

        const range = req.headers.range;
        let stream = fs.createReadStream(filePath);
        let stat = fs.statSync(filePath);
        let fileSize = stat.size;

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1]
                ? parseInt(parts[1], 10)
                : fileSize - 1

            if (start >= fileSize) {
                return {
                    content: `Requested range not satisfiable\n start ${start} >= ${fileSize}.`,
                    statusCode: 416,
                }
            }

            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            return {
                content: file,
                statusCode: 206,
                headers: {
                    "content-range": `bytes ${start}-${end}/${fileSize}`,
                    "accept-ranges": "bytes",
                    "content-length": `${chunksize}`,
                    "content-type": "video/mp4"
                }
            }
        }

        return {
            content: stream,
            headers: {
                "content-length": `${fileSize}`,
                "content-type": "video/mp4"
            }
        }

    }

    static getVideoPaths(applicationId?: string) {
        let videoRootPath = path.join(__dirname, "../../videos");
        if (!fs.existsSync(videoRootPath)) {
            fs.mkdirSync(videoRootPath);
        }

        if (applicationId) {
            let videoPath = path.join(videoRootPath, applicationId);
            if (!fs.existsSync(videoPath))
                fs.mkdirSync(videoPath);

            return videoPath;
        }

        return videoRootPath;
    }
}