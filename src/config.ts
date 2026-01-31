import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { UserInfo } from './git';

export interface UserMapping {
  domain: string;
  user: UserInfo;
}

export interface Config {
  mappings: UserMapping[];
  default?: UserInfo;
}

export class ConfigManager {
  private static getConfigPath(): string {
    const homeDir = os.homedir();
    const configDir = path.join(homeDir, '.config', 'gitmask');
    return path.join(configDir, 'config.json');
  }

  private static getConfigDir(): string {
    const homeDir = os.homedir();
    return path.join(homeDir, '.config', 'gitmask');
  }

  static load(): Config {
    const configPath = this.getConfigPath();

    if (!fs.existsSync(configPath)) {
      return { mappings: [] };
    }

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content) as Config;

      if (!config.mappings || !Array.isArray(config.mappings)) {
        throw new Error('Invalid config format: mappings must be an array');
      }

      return config;
    } catch (error) {
      console.error(`Failed to load config from ${configPath}:`, error);
      return { mappings: [] };
    }
  }

  static findUserByDomain(domain: string): UserInfo | null {
    const config = this.load();

    for (const mapping of config.mappings) {
      if (domain === mapping.domain) {
        return mapping.user;
      }
    }

    return config.default || null;
  }

  static save(config: Config): void {
    const configPath = this.getConfigPath();
    const configDir = this.getConfigDir();

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const content = JSON.stringify(config, null, 2);
    fs.writeFileSync(configPath, content, 'utf-8');
  }

  private static validateDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9.-]*[a-zA-Z0-9]$/;
    return domainRegex.test(domain);
  }

  private static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static addMapping(domain: string, name: string, email: string): void {
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
    } else {
      config.mappings.push({ domain, user: { name, email } });
    }

    this.save(config);
  }

  static removeMapping(domain: string): boolean {
    const config = this.load();
    const initialLength = config.mappings.length;
    config.mappings = config.mappings.filter(m => m.domain !== domain);

    if (config.mappings.length < initialLength) {
      this.save(config);
      return true;
    }

    return false;
  }

  static listMappings(): UserMapping[] {
    return this.load().mappings;
  }

  static ensureConfigExists(): void {
    const configPath = this.getConfigPath();
    const configDir = this.getConfigDir();

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    if (!fs.existsSync(configPath)) {
      this.save({ mappings: [] });
    }
  }

  static setDefault(name: string, email: string): void {
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

  static getDefault(): UserInfo | null {
    const config = this.load();
    return config.default || null;
  }

  static clearDefault(): boolean {
    const config = this.load();
    if (config.default) {
      config.default = undefined;
      this.save(config);
      return true;
    }
    return false;
  }
}
