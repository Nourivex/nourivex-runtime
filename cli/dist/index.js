#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
const program = new Command();
program
    .name('nourivex')
    .description('CLI installer for Nourivex Runtime - Install engineering discipline skills for your AI assistant')
    .version('1.0.0');
program
    .command('init')
    .description('Install Nourivex Runtime for your AI assistant')
    .option('-a, --ai <platform>', 'Target AI platform (opencode, claude, gemini, codex, cursor, windsurf, copilot)', 'opencode')
    .option('-g, --global', 'Install globally to user config directory')
    .option('-f, --force', 'Force install even if already installed')
    .action(initCommand);
program.parse();
//# sourceMappingURL=index.js.map