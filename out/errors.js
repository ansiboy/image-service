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
    argumentFieldNull(fieldName, objectName) {
        let msg = `The '${fieldName}' field of '${objectName}' object cannt be null.`;
        let error = new Error(msg);
        error.name = this.argumentFieldNull.name;
        return error;
    }
    configFieldNull(name) {
        let msg = `Config field '${name}' is null.`;
        return new Error(msg);
    }
    parameterRequired(name) {
        return new Error(`Parameter '${name}' is required.`);
    }
}
exports.errors = new Errors();
//# sourceMappingURL=errors.js.map