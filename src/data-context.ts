import { EntityManager, Repository, createConnection, Connection } from "typeorm"
import { Image } from "./entities";
import { loadConfig } from "./common";
import path = require("path");
import { errors } from "./errors";

export class ImageDataContext {
    private entityManager: EntityManager;

    image: Repository<Image>;

    constructor(connection: Connection) {
        if (!connection)
            throw errors.argumentNull("connection");

        this.entityManager = connection.manager;
        this.image = this.entityManager.getRepository(Image);
    }
}

export async function createDataContext() {
    let config = loadConfig();
    let connection = await createConnection({
        type: "mysql",
        host: config.host,
        port: config.port,
        username: config.user,
        password: config.password,
        database: config.database,
        synchronize: true,
        logging: true,
        connectTimeout: 1000,
        entities: [
            path.join(__dirname, "entities.js")
        ]
    })

    let dc = new ImageDataContext(connection);
    return dc;
}

