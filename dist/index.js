#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const git_1 = require("./git");
const config_1 = require("./config");
const hooks_1 = require("./hooks");
const shell_1 = require("./shell");
const program = new commander_1.Command();
program
    .name('gitmask')
    .description('No more wrong emails in your commits - automatically set git user info based on remote')
    .version('1.0.0');
program
    .command('check')
    .description('Check and set git user info based on remote')
    .option('-v, --verbose', 'Show detailed information')
    .action((options) => {
    if (!git_1.GitUtil.isInsideGitRepo()) {
        console.error('Error: Not inside a git repository');
        process.exit(1);
    }
    const remotes = git_1.GitUtil.getRemotes();
    if (remotes.length === 0) {
        console.warn('No git remotes found');
        process.exit(0);
    }
    const remote = remotes[0];
    if (options.verbose) {
        console.log(`Found remote: ${remote.name} -> ${remote.url}`);
        console.log(`Domain: ${remote.domain}`);
    }
    const user = config_1.ConfigManager.findUserByDomain(remote.domain);
    if (!user) {
        console.warn(`No mapping found for domain: ${remote.domain}`);
        console.log('Use "gitmask add" to add a mapping or "gitmask set-default" to set default user');
        process.exit(0);
    }
    if (options.verbose) {
        const defaultUser = config_1.ConfigManager.getDefault();
        if (defaultUser && user.name === defaultUser.name && user.email === defaultUser.email) {
            console.log(`Using default user: ${user.name} <${user.email}>`);
        }
        else {
            console.log(`Matched user: ${user.name} <${user.email}>`);
        }
    }
    const current = git_1.GitUtil.getUserConfig();
    if (current && current.name === user.name && current.email === user.email) {
        if (options.verbose) {
            console.log('Git user config is already correct');
        }
        process.exit(0);
    }
    git_1.GitUtil.setUserConfig(user);
    console.log(`✓ Git user config updated: ${user.name} <${user.email}>`);
});
program
    .command('run-hook')
    .description('Run as a git hook')
    .action(() => {
    if (!git_1.GitUtil.isInsideGitRepo()) {
        process.exit(0);
    }
    const remotes = git_1.GitUtil.getRemotes();
    if (remotes.length === 0) {
        process.exit(0);
    }
    const remote = remotes[0];
    const user = config_1.ConfigManager.findUserByDomain(remote.domain);
    if (!user) {
        process.exit(0);
    }
    const current = git_1.GitUtil.getUserConfig();
    if (current && current.name === user.name && current.email === user.email) {
        process.exit(0);
    }
    git_1.GitUtil.setUserConfig(user);
});
program
    .command('add <domain> <name> <email>')
    .description('Add a domain to user mapping')
    .action((domain, name, email) => {
    try {
        config_1.ConfigManager.addMapping(domain, name, email);
        console.log(`✓ Added mapping: ${domain} -> ${name} <${email}>`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`✗ Error: ${error.message}`);
        }
        process.exit(1);
    }
});
program
    .command('remove <domain>')
    .description('Remove a domain mapping')
    .action((domain) => {
    const removed = config_1.ConfigManager.removeMapping(domain);
    if (removed) {
        console.log(`✓ Removed mapping for domain: ${domain}`);
    }
    else {
        console.log(`No mapping found for domain: ${domain}`);
    }
});
program
    .command('set-default <name> <email>')
    .description('Set default user info (used when no domain matches)')
    .action((name, email) => {
    try {
        config_1.ConfigManager.setDefault(name, email);
        console.log(`✓ Set default user: ${name} <${email}>`);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`✗ Error: ${error.message}`);
        }
        process.exit(1);
    }
});
program
    .command('clear-default')
    .description('Clear default user info')
    .action(() => {
    const cleared = config_1.ConfigManager.clearDefault();
    if (cleared) {
        console.log('✓ Default user cleared');
    }
    else {
        console.log('No default user configured');
    }
});
program
    .command('list')
    .description('List all domain mappings')
    .action(() => {
    const defaultUser = config_1.ConfigManager.getDefault();
    const mappings = config_1.ConfigManager.listMappings();
    if (defaultUser) {
        console.log('Default user:');
        console.log(`  Name: ${defaultUser.name}`);
        console.log(`  Email: ${defaultUser.email}`);
        console.log('');
    }
    if (mappings.length === 0) {
        console.log('No mappings configured');
        console.log('Use "gitmask add <domain> <name> <email>" to add a mapping');
        return;
    }
    console.log('Configured mappings:');
    console.log('');
    for (const mapping of mappings) {
        console.log(`  ${mapping.domain}`);
        console.log(`    Name: ${mapping.user.name}`);
        console.log(`    Email: ${mapping.user.email}`);
        console.log('');
    }
});
program
    .command('install-hook')
    .description('Install pre-commit git hook')
    .action(() => {
    if (!git_1.GitUtil.isInsideGitRepo()) {
        console.error('Error: Not inside a git repository');
        process.exit(1);
    }
    hooks_1.HookManager.installHook();
});
program
    .command('uninstall-hook')
    .description('Uninstall pre-commit git hook')
    .action(() => {
    if (!git_1.GitUtil.isInsideGitRepo()) {
        console.error('Error: Not inside a git repository');
        process.exit(1);
    }
    hooks_1.HookManager.uninstallHook();
});
program
    .command('install-shell')
    .description('Install shell integration for automatic config on directory change')
    .action(() => {
    shell_1.ShellManager.installShellIntegration();
});
program
    .command('uninstall-shell')
    .description('Uninstall shell integration')
    .action(() => {
    shell_1.ShellManager.uninstallShellIntegration();
});
program
    .command('init')
    .description('Initialize gitmask config file')
    .action(() => {
    config_1.ConfigManager.ensureConfigExists();
    console.log('✓ Initialized gitmask config');
    const configPath = config_1.ConfigManager['getConfigPath']();
    console.log(`  Config file: ${configPath}`);
});
program.parse();
//# sourceMappingURL=index.js.map