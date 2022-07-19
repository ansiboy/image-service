import * as log4js from "log4js";

log4js.configure({
    appenders: {
        file: {
            type: "dateFile",
            filename: "./log/image",
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: { appenders: ["file"], level: "all" }
    }
})

export let logger = log4js.getLogger();