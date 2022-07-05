import { startServer } from 'maishu-node-mvc';
import { errors } from './errors';
import { ServerContextData, Settings } from './types';

export { Settings } from './types';

export function start(settings: Settings) {
    if (!settings)
        throw errors.argumentNull("settings");

    if (!settings.db)
        throw errors.argumentFieldNull("db", "options");

    // Object.assign(commonSettings, settings);

    //=======================
    // 用于生成数据库
    // createDataContext();
    //===========================
    let contextData: ServerContextData = { imagesPhysicalPath: settings.imagesPhysicalPath };
    startServer({
        port: settings.port,
        // controllerDirectory: root.getDirectory("controllers"),
        websiteDirectory: __dirname,
        serverContextData: contextData,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*"
        }
    })
}





