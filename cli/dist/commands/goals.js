import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
const NOURIVEX_DIR = '.nourivex';
const GOALS_DIR = path.join(NOURIVEX_DIR, 'goals');
export async function goalsCommand(options) {
    const cwd = process.cwd();
    const activePath = path.join(cwd, GOALS_DIR, '_active.json');
    const historyPath = path.join(cwd, GOALS_DIR, '_history.json');
    if (options.history) {
        await showHistory(historyPath);
        return;
    }
    if (options.complete) {
        await completeGoal(activePath, historyPath, cwd, options.complete);
        return;
    }
    if (options.show) {
        await showGoal(activePath, cwd, options.show);
        return;
    }
    // Default: list active goal
    await listActiveGoal(activePath);
}
async function listActiveGoal(activePath) {
    console.log(chalk.blue.bold('\n🎯 Nourivex Goals\n'));
    if (!(await fs.pathExists(activePath))) {
        console.log(chalk.gray('No goals storage found.'));
        console.log(chalk.gray('Initialize with: nourivex init --ai <platform>'));
        return;
    }
    const active = await fs.readJson(activePath);
    if (!active.activeGoal) {
        console.log(chalk.gray('No active goal.'));
        console.log(chalk.gray('Start a new session and set an objective to create a goal.'));
        return;
    }
    const g = active.activeGoal;
    const statusColor = g.status === 'active' ? chalk.green : chalk.yellow;
    console.log(`${statusColor('●')} ${chalk.white.bold(g.title)}`);
    console.log(chalk.gray(`  ID: ${g.id}`));
    console.log(chalk.gray(`  Status: ${g.status}`));
    console.log(chalk.gray(`  Created: ${g.created}`));
    console.log(chalk.gray(`  Last updated: ${g.lastUpdated}`));
    console.log('');
    console.log(chalk.cyan('  Objective:'));
    console.log(chalk.white(`  ${g.objective}`));
    console.log('');
    if (g.successCriteria?.length > 0) {
        console.log(chalk.cyan('  Success Criteria:'));
        g.successCriteria.forEach((c) => {
            console.log(chalk.gray(`  ✓ ${c}`));
        });
        console.log('');
    }
    if (g.outOfScope?.length > 0) {
        console.log(chalk.cyan('  Out of Scope:'));
        g.outOfScope.forEach((o) => {
            console.log(chalk.gray(`  ✗ ${o}`));
        });
        console.log('');
    }
    if (g.scopeAlarms?.length > 0) {
        console.log(chalk.yellow(`  Scope Alarms: ${g.scopeAlarms.length}`));
        g.scopeAlarms.slice(-3).forEach((alarm) => {
            const icon = alarm.resolution === 'skipped' ? '⏭️' : alarm.resolution === 'approved' ? '✅' : '⬆️';
            console.log(chalk.gray(`  ${icon} [${alarm.timestamp}] ${alarm.driftType}: ${alarm.description}`));
        });
    }
    if (g.linkedPlan) {
        console.log('');
        console.log(chalk.cyan(`  Linked Plan: ${g.linkedPlan}`));
    }
}
async function showGoal(activePath, cwd, id) {
    const archivePath = path.join(cwd, GOALS_DIR, 'archive', `${id}.json`);
    let goalData = null;
    if (await fs.pathExists(archivePath)) {
        goalData = await fs.readJson(archivePath);
    }
    else {
        // Check active
        const active = await fs.readJson(activePath);
        if (active.activeGoal?.id === id) {
            goalData = active.activeGoal;
        }
    }
    if (!goalData) {
        console.log(chalk.red(`❌ Goal not found: ${id}`));
        return;
    }
    console.log(chalk.blue.bold(`\n🎯 Goal: ${goalData.title}\n`));
    console.log(JSON.stringify(goalData, null, 2));
}
async function completeGoal(activePath, historyPath, cwd, id) {
    const active = await fs.readJson(activePath);
    if (!active.activeGoal || active.activeGoal.id !== id) {
        console.log(chalk.red(`❌ Active goal with ID "${id}" not found.`));
        return;
    }
    const goal = { ...active.activeGoal, status: 'completed', completedAt: new Date().toISOString() };
    // Archive
    const archivePath = path.join(cwd, GOALS_DIR, 'archive');
    await fs.ensureDir(archivePath);
    await fs.writeJson(path.join(archivePath, `${id}.json`), goal, { spaces: 2 });
    // Update history
    let history = { version: '1.0.0', lastUpdated: '', goals: [] };
    if (await fs.pathExists(historyPath)) {
        history = await fs.readJson(historyPath);
    }
    history.goals.push({
        id: goal.id,
        title: goal.title,
        status: 'completed',
        created: goal.created,
        completedAt: goal.completedAt,
        archivePath: `archive/${id}.json`
    });
    history.lastUpdated = new Date().toISOString();
    await fs.writeJson(historyPath, history, { spaces: 2 });
    // Clear active
    active.activeGoal = null;
    active.lastUpdated = new Date().toISOString();
    await fs.writeJson(activePath, active, { spaces: 2 });
    console.log(chalk.green(`\n✅ Goal completed: ${goal.title}`));
    console.log(chalk.gray(`Archived to: .nourivex/goals/archive/${id}.json`));
}
async function showHistory(historyPath) {
    console.log(chalk.blue.bold('\n📜 Goal History\n'));
    if (!(await fs.pathExists(historyPath))) {
        console.log(chalk.gray('No completed goals yet.'));
        return;
    }
    const history = await fs.readJson(historyPath);
    if (history.goals.length === 0) {
        console.log(chalk.gray('No completed goals yet.'));
        return;
    }
    history.goals.forEach((g) => {
        const statusIcon = g.status === 'completed' ? '✅' : g.status === 'abandoned' ? '❌' : '⏸️';
        console.log(`${statusIcon} ${chalk.white.bold(g.title)}`);
        console.log(chalk.gray(`   ID: ${g.id}`));
        console.log(chalk.gray(`   ${g.status === 'completed' ? 'Completed' : 'Ended'}: ${g.completedAt || 'unknown'}`));
        console.log('');
    });
}
//# sourceMappingURL=goals.js.map