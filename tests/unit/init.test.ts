/**
 * Unit Tests for Nourivex Runtime CLI - Init Command
 * 
 * Uses real filesystem with temp directories for reliable testing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';
import { initCommand } from '../../cli/src/commands/init';

vi.mock('chalk', () => ({
  default: {
    blue: { bold: vi.fn((t: string) => t) },
    gray: vi.fn((t: string) => t),
    red: vi.fn((t: string) => t),
    yellow: vi.fn((t: string) => t),
    green: vi.fn((t: string) => t),
    white: vi.fn((t: string) => t),
    cyan: vi.fn((t: string) => t),
  },
}));

vi.mock('../../cli/src/utils/template.js', () => ({
  generateSkillContent: vi.fn(() => 'mocked-skill-content'),
  generateAgentConfig: vi.fn(() => JSON.stringify({ agents: {} })),
}));

describe('initCommand', () => {
  let tempDir: string;
  let savedExit: typeof process.exit;
  let savedLog: typeof console.log;
  let savedError: typeof console.error;
  let savedCwd: typeof process.cwd;
  let savedHome: string | undefined;
  let savedProfile: string | undefined;
  let exitSpy: ReturnType<typeof vi.fn>;
  let logSpy: ReturnType<typeof vi.fn>;
  let errorSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nourivex-test-'));

    savedExit = process.exit;
    savedLog = console.log;
    savedError = console.error;
    savedCwd = process.cwd;
    savedHome = process.env.HOME;
    savedProfile = process.env.USERPROFILE;

    exitSpy = vi.fn(() => { throw new Error('process.exit called'); });
    logSpy = vi.fn();
    errorSpy = vi.fn();

    Object.defineProperty(process, 'exit', { value: exitSpy, writable: true, configurable: true });
    Object.defineProperty(console, 'log', { value: logSpy, writable: true, configurable: true });
    Object.defineProperty(console, 'error', { value: errorSpy, writable: true, configurable: true });
    Object.defineProperty(process, 'cwd', { value: () => tempDir, writable: true, configurable: true });
  });

  afterEach(async () => {
    Object.defineProperty(process, 'exit', { value: savedExit, writable: true, configurable: true });
    Object.defineProperty(console, 'log', { value: savedLog, writable: true, configurable: true });
    Object.defineProperty(console, 'error', { value: savedError, writable: true, configurable: true });
    Object.defineProperty(process, 'cwd', { value: savedCwd, writable: true, configurable: true });

    process.env.HOME = savedHome;
    process.env.USERPROFILE = savedProfile;

    await fs.remove(tempDir);
  });

  describe('Platform Validation', () => {
    it('should accept opencode platform', async () => {
      await initCommand({ ai: 'opencode', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept claude platform', async () => {
      await initCommand({ ai: 'claude', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept gemini platform', async () => {
      await initCommand({ ai: 'gemini', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept codex platform', async () => {
      await initCommand({ ai: 'codex', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept cursor platform', async () => {
      await initCommand({ ai: 'cursor', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept windsurf platform', async () => {
      await initCommand({ ai: 'windsurf', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept copilot platform', async () => {
      await initCommand({ ai: 'copilot', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should accept continue platform', async () => {
      await initCommand({ ai: 'continue', global: false });
      expect(exitSpy).not.toHaveBeenCalledWith(1);
    });

    it('should reject unsupported platform', async () => {
      await expect(
        initCommand({ ai: 'unsupported', global: false })
      ).rejects.toThrow('process.exit called');

      expect(exitSpy).toHaveBeenCalledWith(1);
      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unsupported platform')
      );
    });
  });

  describe('Global vs Local Installation', () => {
    it('should use HOME directory for global install', async () => {
      process.env.HOME = tempDir;

      await initCommand({ ai: 'opencode', global: true });

      const targetDir = path.join(tempDir, '.opencode');
      const skillDir = path.join(targetDir, '.opencode', 'skills', 'nourivex-runtime');
      expect(await fs.pathExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });

    it('should use USERPROFILE for global install on Windows', async () => {
      delete process.env.HOME;
      process.env.USERPROFILE = tempDir;

      await initCommand({ ai: 'opencode', global: true });

      const targetDir = path.join(tempDir, '.opencode');
      const skillDir = path.join(targetDir, '.opencode', 'skills', 'nourivex-runtime');
      expect(await fs.pathExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });

    it('should use current working directory for local install', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const skillDir = path.join(tempDir, '.opencode', 'skills', 'nourivex-runtime');
      expect(await fs.pathExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });
  });

  describe('Force Reinstall', () => {
    it('should exit early if already installed without force', async () => {
      await initCommand({ ai: 'opencode', global: false, force: true });

      await expect(
        initCommand({ ai: 'opencode', global: false })
      ).rejects.toThrow('process.exit called');

      expect(exitSpy).toHaveBeenCalledWith(0);
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('already installed')
      );
    });

    it('should reinstall if force flag is set', async () => {
      await initCommand({ ai: 'opencode', global: false, force: true });

      const skillDir = path.join(tempDir, '.opencode', 'skills', 'nourivex-runtime');
      expect(await fs.pathExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });

    it('should install if not already installed', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const skillDir = path.join(tempDir, '.opencode', 'skills', 'nourivex-runtime');
      expect(await fs.pathExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });
  });

  describe('File Creation', () => {
    it('should create SKILL.md with generated content', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const skillDir = path.join(tempDir, '.opencode', 'skills', 'nourivex-runtime');
      const content = await fs.readFile(path.join(skillDir, 'SKILL.md'), 'utf8');
      expect(content).toBe('mocked-skill-content');
    });

    it('should create references directory', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const referencesDir = path.join(tempDir, '.opencode', 'skills', 'nourivex-runtime', 'references');
      expect(await fs.pathExists(referencesDir)).toBe(true);
    });

    it('should create agent config', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const agentConfigPath = path.join(tempDir, '.opencode', 'skills', 'nourivex-runtime', 'references', 'agents.json');
      expect(await fs.pathExists(agentConfigPath)).toBe(true);
      const content = await fs.readJson(agentConfigPath);
      expect(content).toHaveProperty('agents');
    });

    it('should create platform-specific directories for claude', async () => {
      await initCommand({ ai: 'claude', global: false });

      const skillDir = path.join(tempDir, '.claude', 'skills', 'nourivex-runtime');
      expect(await fs.pathExists(path.join(skillDir, 'SKILL.md'))).toBe(true);
    });
  });

  describe('OpenCode Config Update', () => {
    it('should update opencode.json for opencode platform', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const configPath = path.join(tempDir, 'opencode.json');
      expect(await fs.pathExists(configPath)).toBe(true);
      const config = await fs.readJson(configPath);
      expect(config.plugin).toContain('./.opencode/skills/nourivex-runtime/SKILL.md');
    });

    it('should not create opencode.json for other platforms', async () => {
      await initCommand({ ai: 'claude', global: false });

      const configPath = path.join(tempDir, 'opencode.json');
      expect(await fs.pathExists(configPath)).toBe(false);
    });

    it('should add plugin entry if opencode.json already exists', async () => {
      await fs.writeJson(path.join(tempDir, 'opencode.json'), { plugin: ['existing-plugin'] });

      await initCommand({ ai: 'opencode', global: false });

      const config = await fs.readJson(path.join(tempDir, 'opencode.json'));
      expect(config.plugin).toContain('existing-plugin');
      expect(config.plugin).toContain('./.opencode/skills/nourivex-runtime/SKILL.md');
    });

    it('should not add duplicate plugin entry', async () => {
      await fs.writeJson(path.join(tempDir, 'opencode.json'), {
        plugin: ['./.opencode/skills/nourivex-runtime/SKILL.md']
      });

      await initCommand({ ai: 'opencode', global: false });

      const config = await fs.readJson(path.join(tempDir, 'opencode.json'));
      expect(config.plugin.filter((p: string) => p.includes('nourivex-runtime'))).toHaveLength(1);
    });
  });

  describe('Output Messages', () => {
    it('should print installation header', async () => {
      await initCommand({ ai: 'opencode', global: false });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Nourivex Runtime Installer')
      );
    });

    it('should print success messages for each created file', async () => {
      await initCommand({ ai: 'opencode', global: false });

      const calls = logSpy.mock.calls.map((c: any[]) => c[0]);
      expect(calls).toContainEqual(expect.stringContaining('Created SKILL.md'));
    });

    it('should print completion message', async () => {
      await initCommand({ ai: 'opencode', global: false });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('Installation complete')
      );
    });
  });
});
