import { start } from "./out/index";

start({
    port: 4010,
    db: {
        database: "shop_image",
        port: 3306,
        user: "root",
        password: "81263"
    }
})
