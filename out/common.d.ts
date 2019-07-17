import * as mysql from 'mysql';
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
export declare function loadConfig(): mysql.ConnectionConfig;
export declare let config: mysql.ConnectionConfig;
export declare function setDBConfig(value: mysql.ConnectionConfig): void;
export declare function setConfig(value: Config): void;
export declare function configFileExists(): boolean;
export declare function guid(): string;
