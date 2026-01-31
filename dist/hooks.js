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
exports.HookManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const git_1 = require("./git");
class HookManager {
    static getHooksDir() {
        const repoPath = git_1.GitUtil.getCurrentRepoPath();
        return path.join(repoPath, '.git', 'hooks');
    }
    static installHook() {
        try {
            const hooksDir = this.getHooksDir();
            const preCommitPath = path.join(hooksDir, 'pre-commit');
            if (fs.existsSync(preCommitPath)) {
                console.log('pre-commit hook already exists');
                return false;
            }
            const hookContent = `#!/bin/sh
# gitmask pre-commit hook
exec gitmask run-hook
`;
            fs.writeFileSync(preCommitPath, hookContent, { mode: 0o755 });
            console.log('pre-commit hook installed successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to install pre-commit hook:', error);
            return false;
        }
    }
    static uninstallHook() {
        try {
            const hooksDir = this.getHooksDir();
            const preCommitPath = path.join(hooksDir, 'pre-commit');
            if (!fs.existsSync(preCommitPath)) {
                console.log('pre-commit hook does not exist');
                return false;
            }
            fs.unlinkSync(preCommitPath);
            console.log('pre-commit hook uninstalled successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to uninstall pre-commit hook:', error);
            return false;
        }
    }
    static isHookInstalled() {
        try {
            const hooksDir = this.getHooksDir();
            const preCommitPath = path.join(hooksDir, 'pre-commit');
            return fs.existsSync(preCommitPath);
        }
        catch {
            return false;
        }
    }
}
exports.HookManager = HookManager;
//# sourceMappingURL=hooks.js.map