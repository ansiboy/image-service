export interface Config {
    port: number;
    db: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
}
export declare let config_file_name: string;
export declare function loadConfig(): Config;
export declare function setConfig(value: Config): void;
export declare function configFileExists(): boolean;
export declare function guid(): string;
