import * as React from "react";
import { ImageService, ImageUpload } from "maishu-image-components";
import "https://cdn.bootcdn.net/ajax/libs/twitter-bootstrap/3.4.1/css/bootstrap.css";
import "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css";
import { PageProps } from "maishu-chitu-react";

export default function (props: PageProps) {
    return <div className="container">
        <ImageUpload saveImage={async (r) => {
            let imageService = props.app.createService(ImageService);
            // ImageService.serviceHost = "http://127.0.0.1:48628";
            ImageService.serviceHost = "http://image1.finememo.com/";
            let obj = await imageService.upload(r.base64);
        }} />

    </div>
}