import { EntityManager, Repository, createConnection, Connection, getConnection, getConnectionManager } from "maishu-node-data"
import { Image, Video } from "./entities";
import { parseQueryString, settings } from "./common";
import path = require("path");
import { errors } from "./errors";
import { createParameterDecorator } from "maishu-node-mvc";

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
    console.assert(config != null, "config is null");
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
            synchronize: false,
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

export let dataContext = createParameterDecorator(async (ctx) => {
    let dc = await createDataContext();
    return dc;
})

export let appId = createParameterDecorator(async (ctx) => {
    let obj: any = parseQueryString(ctx.req);
    let application_id = obj['application-id'] || ctx.req.headers['application-id'];
    if (application_id == null)
        throw errors.parameterRequired('application-id');

    return application_id;
})

export let userId = createParameterDecorator(async (ctx) => {
    let userId = ctx.req.headers['user-id'];
    return userId;
})

export let ControllerRoots = {
    AdminApi: "/admin-api"
}

