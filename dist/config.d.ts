import { UserInfo } from './git';
export interface UserMapping {
    domain: string;
    user: UserInfo;
}
export interface Config {
    mappings: UserMapping[];
    default?: UserInfo;
}
export declare class ConfigManager {
    private static getConfigPath;
    private static getConfigDir;
    static load(): Config;
    static findUserByDomain(domain: string): UserInfo | null;
    static save(config: Config): void;
    private static validateDomain;
    private static validateEmail;
    static addMapping(domain: string, name: string, email: string): void;
    static removeMapping(domain: string): boolean;
    static listMappings(): UserMapping[];
    static ensureConfigExists(): void;
    static setDefault(name: string, email: string): void;
    static getDefault(): UserInfo | null;
    static clearDefault(): boolean;
}
//# sourceMappingURL=config.d.ts.map