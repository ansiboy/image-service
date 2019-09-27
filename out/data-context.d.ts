import { Repository, Connection } from "typeorm";
import { Image } from "./entities";
export declare class ImageDataContext {
    private entityManager;
    image: Repository<Image>;
    constructor(connection: Connection);
}
export declare function createDataContext(): Promise<ImageDataContext>;
