import { settings as commonSettings } from './common'
import { startServer } from 'maishu-node-mvc';
import { errors } from './errors';
import path = require("path");
import { ServerContextData, Settings } from './types';


export function start(settings: Settings) {
    if (!settings)
        throw errors.argumentNull("settings");

    if (!settings.db)
        throw errors.argumentFieldNull("db", "options");

    Object.assign(commonSettings, settings);

    //=======================
    // 用于生成数据库
    // createDataContext();
    //===========================
    let contextData: ServerContextData = { imagesPhysicalPath: settings.imagesPhysicalPath };
    startServer({
        port: settings.port,
        controllerDirectory: path.join(__dirname, "controllers"),
        serverContextData: contextData,
    })
}


