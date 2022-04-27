const { formData, contentType, formData1, contentType1 } = require("./data");
const assert = require("assert");
const { read } = require("jimp");
const querystring = require("querystring");
const fs = require("fs");
const path = require("path");
const { ImageDataContext, createDataContext } = require("../out/data-context");
const { HomeController } = require("../out/controllers/home");


describe("insert", function () {

    it("test insert", async () => {
        let config = require("../config.json");
        var ctrl = new HomeController();
        var dc = await createDataContext();
        await ctrl.upload(dc, "7bbfa36c-8115-47ad-8d47-9e52b58e7efd", "", { image: formData1, category: "test" });

    })
})