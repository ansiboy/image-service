/// <reference types="node" />
import { ContentResult } from 'maishu-node-mvc';
import { IncomingMessage } from "http";
export declare class HomeController {
    index(): string;
    image({ id, width, height }: {
        id: any;
        width: any;
        height: any;
    }): Promise<ContentResult>;
    upload({ image, width, height }: {
        image: any;
        width: any;
        height: any;
    }, req: IncomingMessage): Promise<{
        id: string;
    }>;
    remove({ id }: {
        id: any;
    }, req: IncomingMessage): Promise<{
        id: any;
    }>;
    list(req: any): Promise<{
        dataItems: {};
        totalRowCount: number;
    }>;
}
