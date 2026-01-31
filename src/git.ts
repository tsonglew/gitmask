import { execSync } from 'child_process';
import { URL } from 'url';
import * as path from 'path';
import * as fs from 'fs';

export interface GitRemote {
  name: string;
  url: string;
  domain: string;
}

export interface UserInfo {
  name: string;
  email: string;
}

export class GitUtil {
  private static resolveSafePath(basePath: string, targetPath?: string): string {
    if (!targetPath) {
      return path.resolve(basePath);
    }

    const resolved = path.resolve(basePath, targetPath);

    if (!resolved.startsWith(basePath)) {
      throw new Error('Path traversal attempt detected');
    }

    return resolved;
  }

  static getCurrentRepoPath(): string {
    try {
      const repoPath = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
      if (!fs.existsSync(repoPath)) {
        throw new Error('Invalid git repository path');
      }
      return repoPath;
    } catch {
      throw new Error('Not a git repository');
    }
  }

  static getRemotes(repoPath?: string): GitRemote[] {
    try {
      const workDir = repoPath || this.getCurrentRepoPath();
      const output = execSync('git remote -v', { cwd: workDir, encoding: 'utf-8' });
      const lines = output.trim().split('\n');
      const remotes: GitRemote[] = [];
      const seen = new Set<string>();

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
    } catch {
      return [];
    }
  }

  static extractDomain(remoteUrl: string): string {
    try {
      let url = remoteUrl;

      if (url.startsWith('git@')) {
        const match = url.match(/^git@([^:]+):/);
        if (match) {
          return match[1];
        }
      }

      url = url.replace('.git$', '');

      const parsed = new URL(url);
      return parsed.hostname;
    } catch {
      return remoteUrl;
    }
  }

  static getUserConfig(repoPath?: string): UserInfo | null {
    try {
      const workDir = repoPath || this.getCurrentRepoPath();
      const name = execSync('git config user.name', { cwd: workDir, encoding: 'utf-8' }).trim();
      const email = execSync('git config user.email', { cwd: workDir, encoding: 'utf-8' }).trim();
      return { name, email };
    } catch {
      return null;
    }
  }

  static setUserConfig(user: UserInfo, repoPath?: string): void {
    const workDir = this.resolveSafePath(repoPath || this.getCurrentRepoPath());
    const escapeShellArg = (arg: string): string => {
      return arg.replace(/'/g, "'\\''");
    };
    const escapedName = escapeShellArg(user.name);
    const escapedEmail = escapeShellArg(user.email);
    execSync(`git config user.name '${escapedName}'`, { cwd: workDir });
    execSync(`git config user.email '${escapedEmail}'`, { cwd: workDir });
  }

  static isInsideGitRepo(): boolean {
    try {
      execSync('git rev-parse --is-inside-work-tree', { encoding: 'utf-8' });
      return true;
    } catch {
      return false;
    }
  }
}
