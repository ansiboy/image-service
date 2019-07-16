"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Errors {
    dataFormatError() {
        return new Error('Data format error.');
    }
    objectNotExists(typeName, name) {
        return new Error(`Object ${typeName} '${name}' is not exists.`);
    }
    argumentNull(name) {
        return new Error(`Argument ${name} can not be null or empty.`);
    }
    configFieldNull(name) {
        let msg = `Config field '${name}' is null.`;
        return new Error(msg);
    }
}
exports.errors = new Errors();
