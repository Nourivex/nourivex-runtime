import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
const NOURIVEX_DIR = '.nourivex';
const TODOS_DIR = path.join(NOURIVEX_DIR, 'todos');
export async function todosCommand(options) {
    const cwd = process.cwd();
    const activePath = path.join(cwd, TODOS_DIR, '_active.json');
    if (options.progress) {
        await showProgress(activePath, cwd);
        return;
    }
    if (options.show) {
        await showTodoList(cwd, options.show);
        return;
    }
    // Default: list
    await listTodos(activePath, cwd);
}
async function listTodos(activePath, cwd) {
    console.log(chalk.blue.bold('\n📝 Nourivex Todos\n'));
    if (!(await fs.pathExists(activePath))) {
        console.log(chalk.gray('No todos storage found.'));
        console.log(chalk.gray('Initialize with: nourivex init --ai <platform>'));
        return;
    }
    const active = await fs.readJson(activePath);
    if (!active.activeTodoId) {
        console.log(chalk.gray('No active todo list.'));
        console.log(chalk.gray('Approve a plan in your agent to create a todo list.'));
        return;
    }
    const todoPath = path.join(cwd, TODOS_DIR, 'lists', `${active.activeTodoId}.json`);
    if (!(await fs.pathExists(todoPath))) {
        console.log(chalk.red(`⚠️ Todo file missing: ${active.activeTodoPath}`));
        return;
    }
    const todo = await fs.readJson(todoPath);
    displayTodoList(todo, false);
}
async function showTodoList(cwd, id) {
    const todoPath = path.join(cwd, TODOS_DIR, 'lists', `${id}.json`);
    if (!(await fs.pathExists(todoPath))) {
        console.log(chalk.red(`❌ Todo list not found: ${id}`));
        return;
    }
    const todo = await fs.readJson(todoPath);
    displayTodoList(todo, true);
}
function displayTodoList(todo, verbose) {
    const pct = todo.progress?.percentage || 0;
    const bar = buildProgressBar(pct, 30);
    console.log(chalk.blue.bold(`\n📝 ${todo.title}\n`));
    console.log(`${bar} ${chalk.white(`${pct}%`)} (${todo.progress?.completed || 0}/${todo.progress?.total || 0})`);
    console.log('');
    if (todo.goalId) {
        console.log(chalk.gray(`🎯 Goal: ${todo.goalId}`));
    }
    if (todo.planPath) {
        console.log(chalk.gray(`📄 Plan: ${todo.planPath}`));
    }
    console.log('');
    // Group by status
    const items = todo.items || [];
    const completed = items.filter((i) => i.status === 'completed');
    const inProgress = items.filter((i) => i.status === 'in-progress');
    const pending = items.filter((i) => i.status === 'pending');
    const blocked = items.filter((i) => i.status === 'blocked');
    if (inProgress.length > 0) {
        console.log(chalk.yellow('🔄 In Progress:'));
        inProgress.forEach((item) => {
            console.log(`  ${chalk.yellow('→')} ${chalk.white(item.title)}`);
            if (verbose && item.verificationCommand) {
                console.log(chalk.gray(`     Verify: ${item.verificationCommand}`));
            }
        });
        console.log('');
    }
    if (pending.length > 0) {
        const showCount = verbose ? pending.length : Math.min(5, pending.length);
        console.log(chalk.gray(`⏳ Pending (${pending.length}):`));
        pending.slice(0, showCount).forEach((item) => {
            const priority = item.priority === 'high' ? chalk.red('!') : item.priority === 'medium' ? chalk.yellow('·') : chalk.gray('·');
            console.log(`  ${priority} ${chalk.gray(item.title)}`);
        });
        if (!verbose && pending.length > showCount) {
            console.log(chalk.gray(`  ... and ${pending.length - showCount} more`));
        }
        console.log('');
    }
    if (blocked.length > 0) {
        console.log(chalk.red(`🚫 Blocked (${blocked.length}):`));
        blocked.forEach((item) => {
            console.log(`  ${chalk.red('✗')} ${chalk.white(item.title)}`);
        });
        console.log('');
    }
    if (completed.length > 0) {
        console.log(chalk.green(`✅ Completed (${completed.length}):`));
        if (verbose) {
            completed.forEach((item) => {
                console.log(`  ${chalk.green('✓')} ${chalk.gray(item.title)}`);
            });
        }
        else {
            console.log(chalk.gray(`  ${completed.length} task(s) done`));
        }
    }
}
async function showProgress(activePath, cwd) {
    const active = await fs.readJson(activePath).catch(() => null);
    console.log(chalk.blue.bold('\n📊 Progress Overview\n'));
    if (!active?.activeTodoId) {
        console.log(chalk.gray('No active todo list.'));
        return;
    }
    const todoPath = path.join(cwd, TODOS_DIR, 'lists', `${active.activeTodoId}.json`);
    if (!(await fs.pathExists(todoPath))) {
        console.log(chalk.red('⚠️ Active todo file missing.'));
        return;
    }
    const todo = await fs.readJson(todoPath);
    const pct = todo.progress?.percentage || 0;
    const bar = buildProgressBar(pct, 40);
    console.log(`${chalk.white.bold(todo.title)}`);
    console.log(`${bar} ${chalk.white.bold(`${pct}%`)}`);
    console.log('');
    console.log(chalk.green(`  ✅ Completed:   ${todo.progress?.completed || 0}`));
    console.log(chalk.yellow(`  🔄 In Progress: ${todo.progress?.inProgress || 0}`));
    console.log(chalk.gray(`  ⏳ Pending:     ${(todo.progress?.total || 0) - (todo.progress?.completed || 0) - (todo.progress?.inProgress || 0)}`));
    // Check completed todos
    const completedPath = path.join(cwd, TODOS_DIR, '_completed.json');
    if (await fs.pathExists(completedPath)) {
        const completed = await fs.readJson(completedPath);
        if (completed.completedLists?.length > 0) {
            console.log('');
            console.log(chalk.gray(`  Previously completed: ${completed.completedLists.length} todo list(s)`));
        }
    }
}
function buildProgressBar(pct, width) {
    const filled = Math.round((pct / 100) * width);
    const empty = width - filled;
    const color = pct === 100 ? chalk.green : pct > 50 ? chalk.cyan : chalk.yellow;
    return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
}
//# sourceMappingURL=todos.js.map