import { ConnectionOptions } from "maishu-node-data"

export interface ServerContextData {
    /** 图片文件存放路径 */
    imagesPhysicalPath?: string
}

export interface Settings {
    port: number,
    db: ConnectionOptions,
    /** 图片保存路径，用于读取图片文件 */
    imagesPhysicalPath?: string
}
