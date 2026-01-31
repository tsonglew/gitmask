# gitmask

No more wrong emails in your commits - automatically set git user info based on git remote domain.

## Features

- Automatically detect git remote domain and set corresponding `user.name` and `user.email`
- Support multiple git remotes (GitHub, GitLab, self-hosted, etc.)
- Default user configuration for unmapped domains
- Git hook integration (pre-commit)
- Shell integration (fish, bash, zsh) for automatic config on directory change
- CLI for manual control
- JSON configuration file

## Installation

### Install from GitHub

```bash
npm install -g tsonglew/gitmask
```

### Verify Installation

After installation, check if gitmask is available:

```bash
gitmask --version
# Should output: 1.0.0
```

If `gitmask` command is not found, continue with the troubleshooting steps below.

### Troubleshooting

#### Step 1: Check npm global bin location

```bash
npm bin -g
# Example output: /usr/local/lib/node_modules/.bin
# or: /Users/yourname/.npm-global/bin
```

#### Step 2: Check if gitmask binary exists

```bash
# Replace with your npm global bin path from Step 1
ls $(npm bin -g)/gitmask
# Should show: gitmask
```

If the file doesn't exist, the installation failed. Try reinstalling:

```bash
npm uninstall -g gitmask
npm install -g tsonglew/gitmask
```

#### Step 3: Add npm global bin to your PATH

If the binary exists but `gitmask` command is not found, your shell doesn't know where to find it. Add npm global bin to your PATH:

**For fish:**
```bash
fish_add_path (npm bin -g)
```

**For zsh:**
```bash
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.zshrc
source ~/.zshrc
```

**For bash:**
```bash
echo 'export PATH="$(npm bin -g):$PATH"' >> ~/.bashrc
source ~/.bashrc
```

#### Step 4: Verify again

```bash
gitmask --version
```

### Build from source

```bash
git clone https://github.com/tsonglew/gitmask.git
cd gitmask
npm install
npm run build
npm link
```

### Verify installation

```bash
gitmask --version
# Should output: 1.0.0
```

### Quick start

After installation, follow these quick steps to get started:

```bash
# 1. Initialize the config
gitmask init

# 2. Add your GitHub account
gitmask add github.com "Your GitHub Name" "your-github-email@example.com"

# 3. Install shell integration (recommended)
gitmask install-shell

# 4. Restart your shell or reload config
# For fish: source ~/.config/fish/config.fish
# For zsh: source ~/.zshrc
# For bash: source ~/.bash_profile or source ~/.bashrc
```

Now whenever you `cd` into a git repository, gitmask will automatically set the correct git user info!

## Usage

### 1. Initialize config

```bash
gitmask init
```

This creates `~/.config/gitmask/config.json` configuration file.

### 2. Add domain mappings

```bash
gitmask add github.com "Your Name" "your-github-email@example.com"
gitmask add gitlab.com "Your Name" "your-gitlab-email@example.com"
gitmask add github.company.com "Work Name" "work@company.com"
```

### 3. List all mappings

```bash
gitmask list
```

### 4. Check and set git user info

```bash
gitmask check
```

This command:
- Detects the current git remote
- Finds the matching user mapping
- Updates `git config user.name` and `git config user.email` if needed

### 5. Install git hook (optional)

```bash
gitmask install-hook
```

This installs a pre-commit hook that automatically checks and sets user info before each commit.

### 6. Install shell integration (optional, recommended)

```bash
gitmask install-shell
```

This installs shell integration that automatically checks and sets git user info when you enter a git repository. Supports fish, bash, and zsh.

After installation, restart your shell or run:
- fish: `source ~/.config/fish/config.fish`
- bash: `source ~/.bash_profile` or `source ~/.bashrc`
- zsh: `source ~/.zshrc`

### 7. Set default user (optional)

```bash
gitmask set-default "Default Name" "default@example.com"
```

This sets a default user that will be used when no domain mapping matches.

### 8. Clear default user

```bash
gitmask clear-default
```

### 9. Remove a mapping

```bash
gitmask remove github.com
```

### 10. Uninstall git hook

```bash
gitmask uninstall-hook
```

### 11. Uninstall shell integration

```bash
gitmask uninstall-shell
```

## Configuration

The configuration file is stored at `~/.config/gitmask/config.json`:

```json
{
  "mappings": [
    {
      "domain": "github.com",
      "user": {
        "name": "Your GitHub Name",
        "email": "your-github-email@example.com"
      }
    },
    {
      "domain": "gitlab.com",
      "user": {
        "name": "Your GitLab Name",
        "email": "your-gitlab-email@example.com"
      }
    }
  ],
  "default": {
    "name": "Default Name",
    "email": "default@example.com"
  }
}
```

The `default` field is optional. When specified, it will be used when no domain mapping matches the current git remote.

## How it works

1. Gitmask reads the current git repository's remote URL
2. Extracts the domain from the remote URL
3. Looks up the domain in the configuration file
4. If a matching domain is found, uses its user info; otherwise, falls back to the default user (if configured)
5. Sets `user.name` and `user.email` for the current repository

## Supported remote formats

- HTTPS: `https://github.com/user/repo.git`
- SSH: `git@github.com:user/repo.git`
- Custom domains: `https://github.company.com/user/repo.git`

## License

MIT
