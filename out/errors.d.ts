declare class Errors {
    dataFormatError(): any;
    objectNotExists(typeName: any, name: any): any;
    argumentNull(name: string): Error;
    configFieldNull(name: string): Error;
}
export declare let errors: Errors;
export {};
