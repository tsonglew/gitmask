"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitUtil = void 0;
const child_process_1 = require("child_process");
const url_1 = require("url");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
class GitUtil {
    static resolveSafePath(basePath, targetPath) {
        if (!targetPath) {
            return path.resolve(basePath);
        }
        const resolved = path.resolve(basePath, targetPath);
        if (!resolved.startsWith(basePath)) {
            throw new Error('Path traversal attempt detected');
        }
        return resolved;
    }
    static getCurrentRepoPath() {
        try {
            const repoPath = (0, child_process_1.execSync)('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
            if (!fs.existsSync(repoPath)) {
                throw new Error('Invalid git repository path');
            }
            return repoPath;
        }
        catch {
            throw new Error('Not a git repository');
        }
    }
    static getRemotes(repoPath) {
        try {
            const workDir = repoPath || this.getCurrentRepoPath();
            const output = (0, child_process_1.execSync)('git remote -v', { cwd: workDir, encoding: 'utf-8' });
            const lines = output.trim().split('\n');
            const remotes = [];
            const seen = new Set();
            for (const line of lines) {
                const match = line.match(/^(\S+)\s+(.+)\s+\((fetch|push)\)$/);
                if (match) {
                    const [, name, url, type] = match;
                    const key = `${name}-${url}`;
                    if (!seen.has(key)) {
                        seen.add(key);
                        remotes.push({
                            name,
                            url,
                            domain: this.extractDomain(url)
                        });
                    }
                }
            }
            return remotes;
        }
        catch {
            return [];
        }
    }
    static extractDomain(remoteUrl) {
        try {
            let url = remoteUrl;
            if (url.startsWith('git@')) {
                const match = url.match(/^git@([^:]+):/);
                if (match) {
                    return match[1];
                }
            }
            url = url.replace('.git$', '');
            const parsed = new url_1.URL(url);
            return parsed.hostname;
        }
        catch {
            return remoteUrl;
        }
    }
    static getUserConfig(repoPath) {
        try {
            const workDir = repoPath || this.getCurrentRepoPath();
            const name = (0, child_process_1.execSync)('git config user.name', { cwd: workDir, encoding: 'utf-8' }).trim();
            const email = (0, child_process_1.execSync)('git config user.email', { cwd: workDir, encoding: 'utf-8' }).trim();
            return { name, email };
        }
        catch {
            return null;
        }
    }
    static setUserConfig(user, repoPath) {
        const workDir = this.resolveSafePath(repoPath || this.getCurrentRepoPath());
        const escapeShellArg = (arg) => {
            return arg.replace(/'/g, "'\\''");
        };
        const escapedName = escapeShellArg(user.name);
        const escapedEmail = escapeShellArg(user.email);
        (0, child_process_1.execSync)(`git config user.name '${escapedName}'`, { cwd: workDir });
        (0, child_process_1.execSync)(`git config user.email '${escapedEmail}'`, { cwd: workDir });
    }
    static isInsideGitRepo() {
        try {
            (0, child_process_1.execSync)('git rev-parse --is-inside-work-tree', { encoding: 'utf-8' });
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.GitUtil = GitUtil;
//# sourceMappingURL=git.js.map