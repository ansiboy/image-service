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
}

export let errors = new Errors()