class Errors {
    dataFormatError(): any {
        return new Error('Data format error.');
    }
    objectNotExists(typeName, name): any {
        return new Error(`Object ${typeName} '${name}' is not exists.`)
    }
    argumentNull(name: string) {
        return new Error(`Argument ${name} can not be null or empty.`)
    }
    argumentFieldNull(fieldName: string, objectName: string): Error {
        let msg = `The '${fieldName}' field of '${objectName}' object cannt be null.`;
        let error = new Error(msg);
        error.name = this.argumentFieldNull.name;
        return error;
    }
    configFieldNull(name: string) {
        let msg = `Config field '${name}' is null.`
        return new Error(msg)
    }
}

export let errors = new Errors()