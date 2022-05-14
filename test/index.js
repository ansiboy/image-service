const { formData1 } = require("./data");
const { read } = require("jimp");
const { createDataContext } = require("../out/data-context");
const { HomeController } = require("../out/controllers/home");
const fs = require("fs");
const path = require("path");

describe("insert", function () {

    it("test insert", async () => {
        var ctrl = new HomeController();
        var dc = await createDataContext();
        var r = fs.readFileSync(path.join(__dirname, "./test.png"));
        await ctrl.upload(dc, "7bbfa36c-8115-47ad-8d47-9e52b58e7efd", "", { image: r, category: "test" });

    })
})