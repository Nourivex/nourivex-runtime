import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { generateSkillContent, generateAgentConfig } from '../utils/template.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
  ai: string;
  global?: boolean;
  force?: boolean;
}

const PLATFORM_CONFIGS: Record<string, { configPath: string; skillPath: string; configName: string }> = {
  opencode: {
    configPath: '.opencode',
    skillPath: '.opencode/skills/nourivex-runtime',
    configName: 'opencode.json'
  },
  claude: {
    configPath: '.claude',
    skillPath: '.claude/skills/nourivex-runtime',
    configName: 'CLAUDE.md'
  },
  gemini: {
    configPath: '.gemini',
    skillPath: '.gemini/skills/nourivex-runtime',
    configName: 'GEMINI.md'
  },
  codex: {
    configPath: '.codex',
    skillPath: '.codex/skills/nourivex-runtime',
    configName: 'CODEX.md'
  },
  cursor: {
    configPath: '.cursor',
    skillPath: '.cursor/skills/nourivex-runtime',
    configName: 'cursor.json'
  },
  windsurf: {
    configPath: '.windsurf',
    skillPath: '.windsurf/skills/nourivex-runtime',
    configName: 'windsurf.json'
  },
  copilot: {
    configPath: '.github',
    skillPath: '.github/skills/nourivex-runtime',
    configName: 'copilot-instructions.md'
  },
  continue: {
    configPath: '.continue',
    skillPath: '.continue/skills/nourivex-runtime',
    configName: 'config.json'
  }
};

export async function initCommand(options: InitOptions) {
  const { ai, global: isGlobal, force } = options;
  
  console.log(chalk.blue.bold('\n🚀 Nourivex Runtime Installer\n'));
  console.log(chalk.gray('Installing engineering discipline skills for your AI assistant...\n'));

  // Validate platform
  const platformConfig = PLATFORM_CONFIGS[ai];
  if (!platformConfig) {
    console.error(chalk.red(`❌ Unsupported platform: ${ai}`));
    console.log(chalk.yellow('\nSupported platforms:'));
    Object.keys(PLATFORM_CONFIGS).forEach(p => {
      console.log(chalk.gray(`  - ${p}`));
    });
    process.exit(1);
  }

  // Determine target directory
  let targetDir: string;
  if (isGlobal) {
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    targetDir = path.join(homeDir, platformConfig.configPath);
  } else {
    targetDir = process.cwd();
  }

  const skillDir = path.join(targetDir, platformConfig.skillPath);

  // Check if already installed
  if (await fs.pathExists(skillDir) && !force) {
    console.log(chalk.yellow(`⚠️  Nourivex Runtime already installed at: ${skillDir}`));
    console.log(chalk.gray('Use --force to reinstall'));
    process.exit(0);
  }

  try {
    // Create directories
    await fs.ensureDir(skillDir);
    await fs.ensureDir(path.join(skillDir, 'references'));

    // Copy SKILL.md
    const skillContent = generateSkillContent(ai);
    await fs.writeFile(path.join(skillDir, 'SKILL.md'), skillContent);
    console.log(chalk.green('✅ Created SKILL.md'));

    // Copy references
    const referencesDir = path.join(__dirname, '..', 'assets', 'templates', 'references');
    if (await fs.pathExists(referencesDir)) {
      await fs.copy(referencesDir, path.join(skillDir, 'references'));
      console.log(chalk.green('✅ Created references/'));
    }

    // Copy agents
    const agentsSourceDir = path.join(__dirname, '..', '..', '.opencode', 'agents');
    const agentsTargetDir = path.join(targetDir, platformConfig.configPath, 'agents');
    if (await fs.pathExists(agentsSourceDir)) {
      await fs.copy(agentsSourceDir, agentsTargetDir);
      console.log(chalk.green('✅ Created agents/'));
    }

    // Generate agent config
    const agentConfig = generateAgentConfig(ai);
    const agentConfigPath = path.join(skillDir, 'references', 'agents.json');
    await fs.writeFile(agentConfigPath, agentConfig);
    console.log(chalk.green('✅ Created agent config'));

    // Update platform config if needed
    if (ai === 'opencode') {
      const configPath = path.join(targetDir, 'opencode.json');
      let config: any = {};
      
      if (await fs.pathExists(configPath)) {
        config = await fs.readJson(configPath);
      }
      
      if (!config.plugin) {
        config.plugin = [];
      }
      
      const pluginEntry = isGlobal ? 'nourivex-runtime' : `./${platformConfig.skillPath}/SKILL.md`;
      if (!config.plugin.includes(pluginEntry)) {
        config.plugin.push(pluginEntry);
        await fs.writeJson(configPath, config, { spaces: 2 });
        console.log(chalk.green('✅ Updated opencode.json'));
      }
    }

    console.log(chalk.blue.bold('\n✨ Installation complete!\n'));
    console.log(chalk.white('Next steps:'));
    console.log(chalk.gray(`1. Load the skill in your AI assistant:`));
    console.log(chalk.cyan(`   skill(name="nourivex-runtime")`));
    console.log(chalk.gray(`2. Load individual skills:`));
    console.log(chalk.cyan(`   skill(name="nvx-watchdog")`));
    console.log(chalk.cyan(`   skill(name="nvx-tdd-enforcer")`));
    console.log(chalk.gray(`3. Delegate to agents:`));
    console.log(chalk.cyan(`   task(category="deep", load_skills=["nvx-researcher"], prompt="...")`));
    console.log('');

  } catch (error) {
    console.error(chalk.red('❌ Installation failed:'), error);
    process.exit(1);
  }
}
