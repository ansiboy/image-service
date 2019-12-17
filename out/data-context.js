"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const entities_1 = require("./entities");
const common_1 = require("./common");
const path = require("path");
const errors_1 = require("./errors");
class ImageDataContext {
    constructor(connection) {
        if (!connection)
            throw errors_1.errors.argumentNull("connection");
        this.entityManager = connection.manager;
        this.image = this.entityManager.getRepository(entities_1.Image);
    }
}
exports.ImageDataContext = ImageDataContext;
function createDataContext() {
    return __awaiter(this, void 0, void 0, function* () {
        let config = common_1.settings.db;
        console.assert(config != null);
        let connection = yield typeorm_1.createConnection({
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
        });
        let dc = new ImageDataContext(connection);
        return dc;
    });
}
exports.createDataContext = createDataContext;
