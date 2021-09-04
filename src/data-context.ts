import { EntityManager, Repository, createConnection, Connection, getConnection, getConnectionManager } from "maishu-node-data"
import { Image, Video } from "./entities";
import { settings } from "./common";
import path = require("path");
import { errors } from "./errors";

export class ImageDataContext {
    private entityManager: EntityManager;

    image: Repository<Image>;
    video: Repository<Video>;

    constructor(connection: Connection) {
        if (!connection)
            throw errors.argumentNull("connection");

        this.entityManager = connection.manager;
        this.image = this.entityManager.getRepository(Image);
        this.video = this.entityManager.getRepository(Video);
    }
}

export async function createDataContext() {
    let config = settings.db;
    console.assert(config != null);
    let connectionManager = getConnectionManager();

    let connection: Connection;
    if (connectionManager.has("shop-image")) {
        connection = getConnection("shop-image");
    }
    else {
        connection = await createConnection({
            type: "mysql",
            host: config.host,
            port: config.port,
            username: config.user,
            password: config.password,
            database: config.database,
            synchronize: true,
            logging: true,
            connectTimeout: 1000,
            name: "shop-image",
            entities: [
                path.join(__dirname, "entities.js")
            ]
        })
    }

    let dc = new ImageDataContext(connection);
    return dc;
}

