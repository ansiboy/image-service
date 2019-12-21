export interface ServerContextData {
    /** 图片文件存放路径 */
    imagesPhysicalPath?: string
}

export interface Settings {
    port: number,
    db: {
        host: string,
        port: number,
        database: string,
        user: string,
        password: string
    },
    /** 图片保存路径，用于读取图片文件 */
    imagesPhysicalPath?: string
}
