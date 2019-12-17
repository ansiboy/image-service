export interface Settings {
    port: number;
    db: {
        host: string;
        port: number;
        database: string;
        user: string;
        password: string;
    };
}
export declare let settings: Settings;
export declare let config_file_name: string;
export declare function configFileExists(): boolean;
export declare function guid(): string;
