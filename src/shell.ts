import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export class ShellManager {
  private static getShellType(): string {
    const shell = process.env.SHELL;
    if (shell) {
      if (shell.includes('fish')) return 'fish';
      if (shell.includes('zsh')) return 'zsh';
      if (shell.includes('bash')) return 'bash';
    }
    return 'unknown';
  }

  private static getConfigPath(shellType: string): string | null {
    const homeDir = os.homedir();

    switch (shellType) {
      case 'fish':
        return path.join(homeDir, '.config', 'fish', 'config.fish');
      case 'zsh':
        return path.join(homeDir, '.zshrc');
      case 'bash':
        const bashProfile = path.join(homeDir, '.bash_profile');
        const bashrc = path.join(homeDir, '.bashrc');
        if (fs.existsSync(bashrc)) return bashrc;
        if (fs.existsSync(bashProfile)) return bashProfile;
        return bashrc;
      default:
        return null;
    }
  }

  private static getFishIntegrationCode(): string {
    return `
# gitmask - automatically set git user info
function __gitmask_check --on-variable PWD
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1
        command gitmask check >/dev/null 2>&1 &
    end
end
`;
  }

  private static getBashIntegrationCode(): string {
    return `
# gitmask - automatically set git user info
__gitmask_check() {
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        command gitmask check >/dev/null 2>&1 &
    fi
}

if [[ "$PROMPT_COMMAND" != *"__gitmask_check"* ]]; then
    PROMPT_COMMAND="__gitmask_check;$PROMPT_COMMAND"
fi
`;
  }

  private static getZshIntegrationCode(): string {
    return `
# gitmask - automatically set git user info
__gitmask_check() {
    if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        command gitmask check >/dev/null 2>&1 &
    fi
}

typeset -a precmd_functions
if [[ $precmd_functions[(i)__gitmask_check] -gt $(( \\$#precmd_functions + 1 )) ]]; then
    precmd_functions+=(__gitmask_check)
fi
`;
  }

  private static getIntegrationCode(shellType: string): string {
    switch (shellType) {
      case 'fish':
        return this.getFishIntegrationCode();
      case 'zsh':
        return this.getZshIntegrationCode();
      case 'bash':
        return this.getBashIntegrationCode();
      default:
        return '';
    }
  }

  private static markStart(shellType: string): string {
    return `# >>> gitmask ${shellType} >>>`;
  }

  private static markEnd(shellType: string): string {
    return `# <<< gitmask ${shellType} <<<`;
  }

  private static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static installShellIntegration(): boolean {
    try {
      const shellType = this.getShellType();
      if (shellType === 'unknown') {
        console.error('Unsupported shell');
        return false;
      }

      const configPath = this.getConfigPath(shellType);
      if (!configPath) {
        console.error(`Could not find ${shellType} config file`);
        return false;
      }

      if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '', 'utf-8');
      }

      const content = fs.readFileSync(configPath, 'utf-8');
      const markStart = this.markStart(shellType);
      const markEnd = this.markEnd(shellType);

      if (content.includes(markStart)) {
        console.log(`Gitmask ${shellType} integration already installed`);
        return false;
      }

      const integrationCode = this.getIntegrationCode(shellType);
      const newContent = content + `\n${markStart}\n${integrationCode}${markEnd}\n`;
      fs.writeFileSync(configPath, newContent, 'utf-8');

      console.log(`✓ Gitmask ${shellType} integration installed`);
      console.log(`  Config file: ${configPath}`);
      console.log(`  Restart your shell or run: source ${configPath}`);
      return true;
    } catch (error) {
      console.error('Failed to install shell integration:', error);
      return false;
    }
  }

  static uninstallShellIntegration(): boolean {
    try {
      const shellType = this.getShellType();
      if (shellType === 'unknown') {
        console.error('Unsupported shell');
        return false;
      }

      const configPath = this.getConfigPath(shellType);
      if (!configPath || !fs.existsSync(configPath)) {
        console.log('Shell config file not found');
        return false;
      }

      const content = fs.readFileSync(configPath, 'utf-8');
      const markStart = this.markStart(shellType);
      const markEnd = this.markEnd(shellType);

      if (!content.includes(markStart)) {
        console.log(`Gitmask ${shellType} integration not found`);
        return false;
      }

      const escapedMarkStart = this.escapeRegex(markStart);
      const escapedMarkEnd = this.escapeRegex(markEnd);
      const regex = new RegExp(`\\s*${escapedMarkStart}[\\s\\S]*?${escapedMarkEnd}\\s*`, 'g');
      const newContent = content.replace(regex, '\n');
      fs.writeFileSync(configPath, newContent.trim() + '\n', 'utf-8');

      console.log(`✓ Gitmask ${shellType} integration uninstalled`);
      console.log(`  Restart your shell or run: source ${configPath}`);
      return true;
    } catch (error) {
      console.error('Failed to uninstall shell integration:', error);
      return false;
    }
  }

  static isShellIntegrationInstalled(): boolean {
    try {
      const shellType = this.getShellType();
      if (shellType === 'unknown') return false;

      const configPath = this.getConfigPath(shellType);
      if (!configPath || !fs.existsSync(configPath)) return false;

      const content = fs.readFileSync(configPath, 'utf-8');
      return content.includes(this.markStart(shellType));
    } catch {
      return false;
    }
  }
}
