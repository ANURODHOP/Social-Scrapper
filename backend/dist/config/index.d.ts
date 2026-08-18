import { AppConfig } from './schema';
export declare class Config {
    private static instance;
    private config;
    private constructor();
    static getInstance(): Config;
    get<T extends keyof AppConfig>(key: T): AppConfig[T];
    private loadConfig;
    private loadYamlFile;
    private deepMerge;
    private overrideWithEnv;
}
declare const _default: Config;
export default _default;
//# sourceMappingURL=index.d.ts.map