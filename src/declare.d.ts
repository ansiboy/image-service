declare module "webp-converter" {
    interface Webp {
        buffer2webpbuffer: (data: Buffer, sourceType: string, args: string) => Promise<Buffer>;
        grant_permission: () => void;
        cwebp: (source: string, target: string, args: string) => Promise<any>;
    }

    let webp: Webp;
    export = webp;
}