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
exports.DirenvManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const git_1 = require("./git");
class DirenvManager {
    static getEnvrcPath() {
        const repoPath = git_1.GitUtil.getCurrentRepoPath();
        return path.join(repoPath, '.envrc');
    }
    static installEnvrc() {
        try {
            const envrcPath = this.getEnvrcPath();
            if (fs.existsSync(envrcPath)) {
                console.log('.envrc already exists');
                return false;
            }
            const envrcContent = `# gitmask - automatically set git user info
gitmask check
`;
            fs.writeFileSync(envrcPath, envrcContent, 'utf-8');
            console.log('.envrc created successfully');
            console.log('Run: direnv allow');
            return true;
        }
        catch (error) {
            console.error('Failed to create .envrc:', error);
            return false;
        }
    }
    static uninstallEnvrc() {
        try {
            const envrcPath = this.getEnvrcPath();
            if (!fs.existsSync(envrcPath)) {
                console.log('.envrc does not exist');
                return false;
            }
            const content = fs.readFileSync(envrcPath, 'utf-8');
            if (!content.includes('gitmask check')) {
                console.log('.envrc exists but does not contain gitmask check');
                return false;
            }
            fs.unlinkSync(envrcPath);
            console.log('.envrc removed successfully');
            return true;
        }
        catch (error) {
            console.error('Failed to remove .envrc:', error);
            return false;
        }
    }
    static isEnvrcInstalled() {
        try {
            const envrcPath = this.getEnvrcPath();
            if (!fs.existsSync(envrcPath)) {
                return false;
            }
            const content = fs.readFileSync(envrcPath, 'utf-8');
            return content.includes('gitmask check');
        }
        catch {
            return false;
        }
    }
}
exports.DirenvManager = DirenvManager;
//# sourceMappingURL=direnv.js.map