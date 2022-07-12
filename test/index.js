"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const data_context_1 = require("../out/data-context");
const home_1 = require("../out/controllers/home");
const assert = require("assert");
describe("insert", function () {
    it("test insert", async () => {
        var ctrl = new home_1.HomeController();
        var dc = await (0, data_context_1.createDataContext)();
        var r = fs.readFileSync(path.join(__dirname, "./test.png"));
        await ctrl.upload(dc, "7bbfa36c-8115-47ad-8d47-9e52b58e7efd", "", { image: r, category: "test" });
    });
    it("fetch image by url", async () => {
        let ctrl = new home_1.HomeController();
        let imageData = await ctrl.fetchImage("http://shop-image.gemwon.com/image?id=2e161ac8-d6d5-01f8-0b4e-556516663b14_2250_2250&width=270&height=270");
        assert.notStrictEqual(imageData, null, "image data is null");
    });
    it("fetch image by url", async () => {
        let ctrl = new home_1.HomeController();
        let imageData = await ctrl.fetchImage("http://shop-image.gemwon.com/image?id=2e161ac8-d6d5-01f8-0b4e-556516663b14_2250_2250&width=270&height=270");
        assert.notStrictEqual(imageData, null, "image data is null");
    });
    it("jpg image to webp", async function () {
        this.timeout(0);
        let ctrl = new home_1.HomeController();
        let r = await ctrl.image({ id: "https://car.gemwon.com/Content/file/202/samll_20220706170512.jpg", type: "webp" });
        let statusCode = r.statusCode || 200;
        assert.strictEqual(statusCode, 200);
    });
    it("gif image to webp", async function () {
        this.timeout(0);
        let ctrl = new home_1.HomeController();
        let r = await ctrl.image({ id: "http://car.gemwon.com/Content/webpic/20220629/20220629170255_601.gif", type: "webp" });
        let statusCode = r.statusCode || 200;
        assert.strictEqual(statusCode, 200);
    });
});
