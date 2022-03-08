import { Settings } from './types';
import * as querystring from 'querystring';
import { IncomingMessage } from "http";
import * as url from "url";

export let settings = {} as Settings;
export function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

// export function getApplicationId(req: IncomingMessage): string {
//     let obj: any = parseQueryString(req);
//     let application_id = obj['application-id'] || req.headers['application-id'];
//     return application_id;
// }

export function parseQueryString(req: IncomingMessage): object {
    let urlInfo = url.parse(req.url || "");
    let { search } = urlInfo;
    let contentType = req.headers['content-type'] || '' as string;
    if (!search)
        return {};

    search = search[0] == '?' ? search.substr(1) : search;
    let result: object;
    if (contentType.indexOf('application/json') >= 0) {
        result = JSON.parse(search);
    }
    else {
        result = querystring.parse(search);
    }
    return result;
}