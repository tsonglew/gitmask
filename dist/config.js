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
exports.ConfigManager = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
class ConfigManager {
    static getConfigPath() {
        const homeDir = os.homedir();
        const configDir = path.join(homeDir, '.config', 'gitmask');
        return path.join(configDir, 'config.json');
    }
    static getConfigDir() {
        const homeDir = os.homedir();
        return path.join(homeDir, '.config', 'gitmask');
    }
    static load() {
        const configPath = this.getConfigPath();
        if (!fs.existsSync(configPath)) {
            return { mappings: [] };
        }
        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(content);
            if (!config.mappings || !Array.isArray(config.mappings)) {
                throw new Error('Invalid config format: mappings must be an array');
            }
            return config;
        }
        catch (error) {
            console.error(`Failed to load config from ${configPath}:`, error);
            return { mappings: [] };
        }
    }
    static findUserByDomain(domain) {
        const config = this.load();
        for (const mapping of config.mappings) {
            if (domain === mapping.domain) {
                return mapping.user;
            }
        }
        return config.default || null;
    }
    static save(config) {
        const configPath = this.getConfigPath();
        const configDir = this.getConfigDir();
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        const content = JSON.stringify(config, null, 2);
        fs.writeFileSync(configPath, content, 'utf-8');
    }
    static validateDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/;
        return domainRegex.test(domain);
    }
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static addMapping(domain, name, email) {
        if (!this.validateDomain(domain)) {
            throw new Error('Invalid domain format');
        }
        if (!name || name.trim() === '') {
            throw new Error('Name cannot be empty');
        }
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }
        const config = this.load();
        const existingIndex = config.mappings.findIndex(m => m.domain === domain);
        if (existingIndex >= 0) {
            config.mappings[existingIndex] = { domain, user: { name, email } };
        }
        else {
            config.mappings.push({ domain, user: { name, email } });
        }
        this.save(config);
    }
    static removeMapping(domain) {
        const config = this.load();
        const initialLength = config.mappings.length;
        config.mappings = config.mappings.filter(m => m.domain !== domain);
        if (config.mappings.length < initialLength) {
            this.save(config);
            return true;
        }
        return false;
    }
    static listMappings() {
        return this.load().mappings;
    }
    static ensureConfigExists() {
        const configPath = this.getConfigPath();
        const configDir = this.getConfigDir();
        if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true });
        }
        if (!fs.existsSync(configPath)) {
            this.save({ mappings: [] });
        }
    }
    static setDefault(name, email) {
        if (!name || name.trim() === '') {
            throw new Error('Name cannot be empty');
        }
        if (!this.validateEmail(email)) {
            throw new Error('Invalid email format');
        }
        const config = this.load();
        config.default = { name, email };
        this.save(config);
    }
    static getDefault() {
        const config = this.load();
        return config.default || null;
    }
    static clearDefault() {
        const config = this.load();
        if (config.default) {
            config.default = undefined;
            this.save(config);
            return true;
        }
        return false;
    }
}
exports.ConfigManager = ConfigManager;
//# sourceMappingURL=config.js.map