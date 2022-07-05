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
    it("image", async () => {
        let ctrl = new home_1.HomeController();
        let r = await ctrl.image({ id: "https://car.gemwon.com/Content/webpic/images/pc_20220527141455.jpg", type: "webp" });
        assert.strictEqual(r.statusCode, 200);
    });
});
