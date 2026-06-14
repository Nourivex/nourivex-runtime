import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
const NOURIVEX_DIR = '.nourivex';
const MEMORY_DIR = path.join(NOURIVEX_DIR, 'memory');
const INDEX_FILE = path.join(MEMORY_DIR, '_index.json');
export async function memoryCommand(options) {
    const cwd = process.cwd();
    const indexPath = path.join(cwd, INDEX_FILE);
    if (!(await fs.pathExists(indexPath))) {
        console.log(chalk.yellow('⚠️  No memory storage found.'));
        console.log(chalk.gray('Run any agent task first to initialize .nourivex/memory/'));
        return;
    }
    const index = await fs.readJson(indexPath);
    if (options.list || (!options.search && !options.show && !options.prune)) {
        await listMemory(index);
        return;
    }
    if (options.search) {
        await searchMemory(index, options.search, cwd);
        return;
    }
    if (options.show) {
        await showMemory(index, options.show, cwd);
        return;
    }
    if (options.prune) {
        await pruneMemory(index, indexPath, cwd);
        return;
    }
}
async function listMemory(index) {
    console.log(chalk.blue.bold('\n🧠 Nourivex Memory Vault\n'));
    if (index.entries.length === 0) {
        console.log(chalk.gray('No memory entries yet.'));
        console.log(chalk.gray('Agents will store patterns and lessons here automatically.'));
        return;
    }
    const patterns = index.entries.filter(e => e.type === 'pattern');
    const lessons = index.entries.filter(e => e.type === 'lesson');
    const preferences = index.entries.filter(e => e.type === 'preference');
    const rules = index.entries.filter(e => e.type === 'domain-rule');
    if (patterns.length > 0) {
        console.log(chalk.cyan(`📦 Patterns (${patterns.length})`));
        patterns.forEach(e => {
            console.log(chalk.white(`  ${e.id}`));
            console.log(chalk.gray(`  └─ ${e.title} [${e.tags.join(', ')}]`));
        });
        console.log('');
    }
    if (lessons.length > 0) {
        console.log(chalk.red(`🐛 Lessons (${lessons.length})`));
        lessons.forEach(e => {
            console.log(chalk.white(`  ${e.id}`));
            console.log(chalk.gray(`  └─ ${e.title} [${e.tags.join(', ')}]`));
        });
        console.log('');
    }
    if (preferences.length > 0) {
        console.log(chalk.yellow(`⚙️  Preferences (${preferences.length})`));
        preferences.forEach(e => {
            console.log(chalk.white(`  ${e.id}`));
            console.log(chalk.gray(`  └─ ${e.title}`));
        });
        console.log('');
    }
    if (rules.length > 0) {
        console.log(chalk.magenta(`📋 Domain Rules (${rules.length})`));
        rules.forEach(e => {
            console.log(chalk.white(`  ${e.id}`));
            console.log(chalk.gray(`  └─ ${e.title}`));
        });
        console.log('');
    }
    console.log(chalk.gray(`Last updated: ${index.lastUpdated || 'never'}`));
}
async function searchMemory(index, query, cwd) {
    console.log(chalk.blue.bold(`\n🔍 Memory Search: "${query}"\n`));
    const queryLower = query.toLowerCase();
    const matches = index.entries.filter(e => e.title.toLowerCase().includes(queryLower) ||
        e.tags.some(t => t.toLowerCase().includes(queryLower)) ||
        e.type.toLowerCase().includes(queryLower));
    if (matches.length === 0) {
        console.log(chalk.gray(`No entries matching "${query}".`));
        return;
    }
    console.log(chalk.white(`Found ${matches.length} match(es):\n`));
    for (const entry of matches) {
        const icon = entry.type === 'pattern' ? '📦' : entry.type === 'lesson' ? '🐛' : '📋';
        console.log(`${icon} ${chalk.cyan(entry.id)}`);
        console.log(`   ${chalk.white(entry.title)}`);
        console.log(`   ${chalk.gray('Tags: ' + entry.tags.join(', '))}`);
        const entryPath = path.join(cwd, MEMORY_DIR, entry.path);
        if (await fs.pathExists(entryPath)) {
            const data = await fs.readJson(entryPath);
            if (data.content) {
                const preview = data.content.substring(0, 120);
                console.log(`   ${chalk.gray(preview + (data.content.length > 120 ? '...' : ''))}`);
            }
        }
        console.log('');
    }
}
async function showMemory(index, id, cwd) {
    const entry = index.entries.find(e => e.id === id);
    if (!entry) {
        console.log(chalk.red(`❌ Entry not found: ${id}`));
        return;
    }
    const entryPath = path.join(cwd, MEMORY_DIR, entry.path);
    if (!(await fs.pathExists(entryPath))) {
        console.log(chalk.red(`❌ Entry file missing: ${entryPath}`));
        return;
    }
    const data = await fs.readJson(entryPath);
    console.log(chalk.blue.bold(`\n🧠 ${data.title}\n`));
    console.log(chalk.gray(`Type: ${data.type} | Created: ${data.created}`));
    console.log(chalk.gray(`Tags: ${data.tags?.join(', ') || 'none'}`));
    console.log(chalk.gray(`Access count: ${data.accessCount || 0}`));
    console.log('');
    console.log(chalk.white(data.content));
    if (data.code) {
        console.log('\n' + chalk.cyan('Code:'));
        console.log(chalk.gray(data.code));
    }
}
async function pruneMemory(index, indexPath, cwd) {
    console.log(chalk.blue.bold('\n🗑️  Memory Prune\n'));
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const candidates = index.entries.filter(e => {
        const created = new Date(e.path.split('/')[1]?.split('-').slice(0, 3).join('-') || '');
        return (!e || created < thirtyDaysAgo);
    });
    if (candidates.length === 0) {
        console.log(chalk.green('✅ No stale entries found. Memory vault is healthy.'));
        return;
    }
    console.log(chalk.yellow(`Found ${candidates.length} candidate(s) for pruning:`));
    candidates.forEach(e => {
        console.log(chalk.gray(`  - ${e.id}: ${e.title}`));
    });
    console.log(chalk.yellow('\n⚠️  Review these entries and delete manually if needed.'));
    console.log(chalk.gray('Automatic pruning requires explicit confirmation — edit .nourivex/memory/ directly.'));
}
//# sourceMappingURL=memory.js.map