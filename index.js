const { start } = require("./out/index")

start({
    port: 4010,
    db: {
        host: "127.0.0.1",
        database: "shop_image",
        port: 3306,
        user: "root",
        password: "81263"
    }
})
