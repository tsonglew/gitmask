import * as fs from 'fs';
import * as path from 'path';
import { GitUtil } from './git';

export class HookManager {
  private static getHooksDir(): string {
    const repoPath = GitUtil.getCurrentRepoPath();
    return path.join(repoPath, '.git', 'hooks');
  }

  static installHook(): boolean {
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
    } catch (error) {
      console.error('Failed to install pre-commit hook:', error);
      return false;
    }
  }

  static uninstallHook(): boolean {
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
    } catch (error) {
      console.error('Failed to uninstall pre-commit hook:', error);
      return false;
    }
  }

  static isHookInstalled(): boolean {
    try {
      const hooksDir = this.getHooksDir();
      const preCommitPath = path.join(hooksDir, 'pre-commit');
      return fs.existsSync(preCommitPath);
    } catch {
      return false;
    }
  }
}
