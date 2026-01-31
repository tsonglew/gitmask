export interface GitRemote {
    name: string;
    url: string;
    domain: string;
}
export interface UserInfo {
    name: string;
    email: string;
}
export declare class GitUtil {
    private static resolveSafePath;
    static getCurrentRepoPath(): string;
    static getRemotes(repoPath?: string): GitRemote[];
    static extractDomain(remoteUrl: string): string;
    static getUserConfig(repoPath?: string): UserInfo | null;
    static setUserConfig(user: UserInfo, repoPath?: string): void;
    static isInsideGitRepo(): boolean;
}
//# sourceMappingURL=git.d.ts.map