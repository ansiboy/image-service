declare class Errors {
    dataFormatError(): any;
    objectNotExists(typeName: any, name: any): any;
    argumentNull(name: string): Error;
    argumentFieldNull(fieldName: string, objectName: string): Error;
    configFieldNull(name: string): Error;
    parameterRequired(name: string): Error;
}
export declare let errors: Errors;
export {};
