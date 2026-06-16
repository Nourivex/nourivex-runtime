#!/usr/bin/env node

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { memoryCommand } from './commands/memory.js';
import { goalsCommand } from './commands/goals.js';
import { todosCommand } from './commands/todos.js';
import { mcpCommand } from './commands/mcp.js';

const program = new Command();

program
  .name('nourivex')
  .description('CLI for Nourivex Runtime — Engineering discipline skills + persistent memory for AI assistants')
  .version('4.1.2');

program
  .command('init')
  .description('Install Nourivex Runtime for your AI assistant')
  .option('-a, --ai <platform>', 'Target AI platform (opencode, claude, gemini, codex, cursor, windsurf, copilot)', 'opencode')
  .option('-g, --global', 'Install globally to user config directory')
  .option('-f, --force', 'Force install even if already installed')
  .action(initCommand);

program
  .command('memory')
  .description('Manage the Nourivex knowledge vault (.nourivex/memory/)')
  .option('-l, --list', 'List all memory entries')
  .option('-s, --search <query>', 'Search memory by keyword or tag')
  .option('--show <id>', 'Show full details of a memory entry')
  .option('--prune', 'List stale entries that could be pruned')
  .action(memoryCommand);

program
  .command('goals')
  .description('Manage persistent goals (.nourivex/goals/)')
  .option('-l, --list', 'Show active goal and scope alarms')
  .option('--show <id>', 'Show full goal detail')
  .option('--complete <id>', 'Mark active goal as completed and archive it')
  .option('--history', 'Show completed and abandoned goals')
  .action(goalsCommand);

program
  .command('todos')
  .description('Manage todo lists and track progress (.nourivex/todos/)')
  .option('-l, --list', 'Show active todo list')
  .option('--show <id>', 'Show full todo list with all items')
  .option('--progress', 'Show visual progress bar and stats')
  .action(todosCommand);

program
  .command('mcp')
  .description('Start the Nourivex MCP server')
  .option('--project-root <path>', 'Project root for .nourivex storage (default: cwd)')
  .action(mcpCommand);

program.parse();
