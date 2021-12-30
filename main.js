const { start } = require("./out/index");
let config = require("./config.json");
start(config);

process.on("uncaughtException", function(err) {
    console.error(err);
})