/**
 * Integration Tests for Nourivex Runtime - OpenCode Plugin
 * 
 * Tests cover:
 * - Plugin loading and initialization
 * - Agent registration from opencode.agents.json
 * - Skill loading from .agents/skills/ directory
 * - Error handling for missing files
 * - Plugin dispose/cleanup
 * - Real project integration
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Track original fs methods for cleanup
const originalReadFile = fs.readFile;
const originalReaddir = fs.readdir;

describe('opencode-plugin.mjs', () => {
  describe('Plugin Loading', () => {
    it('should export a default async function', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      expect(typeof pluginModule.default).toBe('function');
    });

    it('should return object with agent, skill, dispose, tool hooks', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      const plugin = await pluginModule.default(
        { project: {}, client: {}, $: {} },
        {}
      );

      expect(plugin).toBeDefined();
      expect(plugin.agent).toBeDefined();
      expect(typeof plugin.agent.register).toBe('function');
      expect(plugin.skill).toBeDefined();
      expect(typeof plugin.skill.register).toBe('function');
      expect(typeof plugin.dispose).toBe('function');
      expect(plugin.tool).toBeDefined();
    });
  });

  describe('Agent Registration', () => {
    it('should return all 5 Nourivex agents from real config', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      const plugin = await pluginModule.default(
        { project: {}, client: {}, $: {} },
        {}
      );

      const agents = await plugin.agent.register();
      
      expect(agents).toBeDefined();
      expect(agents).toHaveProperty('nvx-researcher');
      expect(agents).toHaveProperty('nvx-architect');
      expect(agents).toHaveProperty('nvx-planner');
      expect(agents).toHaveProperty('nvx-implementer');
      expect(agents).toHaveProperty('nvx-reviewer');
    });

    it('should have correct structure for each agent', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      const plugin = await pluginModule.default(
        { project: {}, client: {}, $: {} },
        {}
      );

      const agents = await plugin.agent.register();
      
      for (const [name, agent] of Object.entries(agents)) {
        const a = agent as any;
        expect(a).toHaveProperty('description');
        expect(a).toHaveProperty('prompt');
        expect(a).toHaveProperty('mode', 'subagent');
        expect(a).toHaveProperty('color');
        expect(a).toHaveProperty('maxSteps');
        expect(typeof a.description).toBe('string');
        expect(typeof a.prompt).toBe('string');
        expect(typeof a.maxSteps).toBe('number');
      }
    });

    it('should have valid color hex codes', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      const plugin = await pluginModule.default(
        { project: {}, client: {}, $: {} },
        {}
      );

      const agents = await plugin.agent.register();
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      
      for (const [name, agent] of Object.entries(agents)) {
        const a = agent as any;
        expect(a.color).toMatch(hexColorRegex);
      }
    });

    it('should handle missing config file gracefully (mocked fs)', async () => {
      // Mock fs to simulate missing config
      const readFileSpy = vi.spyOn(fs, 'readFile').mockImplementation(
        async (p: any, encoding?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('opencode.agents.json')) {
            throw new Error('ENOENT: no such file');
          }
          return originalReadFile(p, encoding);
        }
      );

      try {
        vi.resetModules();
        const pluginModule = await import('../../opencode-plugin.mjs');
        const plugin = await pluginModule.default(
          { project: {}, client: {}, $: {} },
          {}
        );

        const agents = await plugin.agent.register();
        expect(agents).toBeDefined();
        expect(Object.keys(agents)).toHaveLength(0);
      } finally {
        readFileSpy.mockRestore();
      }
    });

    it('should handle malformed config JSON gracefully (mocked fs)', async () => {
      const readFileSpy = vi.spyOn(fs, 'readFile').mockImplementation(
        async (p: any, encoding?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('opencode.agents.json')) {
            return 'invalid json{broken';
          }
          return originalReadFile(p, encoding);
        }
      );

      try {
        vi.resetModules();
        const pluginModule = await import('../../opencode-plugin.mjs');
        const plugin = await pluginModule.default(
          { project: {}, client: {}, $: {} },
          {}
        );

        const agents = await plugin.agent.register();
        expect(agents).toBeDefined();
        expect(Object.keys(agents)).toHaveLength(0);
      } finally {
        readFileSpy.mockRestore();
      }
    });
  });

  describe('Skill Loading', () => {
    it('should handle missing skills directory gracefully (mocked fs)', async () => {
      const readdirSpy = vi.spyOn(fs, 'readdir').mockImplementation(
        async (p: any, options?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('.agents/skills') || pathStr.endsWith('skills')) {
            throw new Error('ENOENT: no such directory');
          }
          return originalReaddir(p, options);
        }
      );

      try {
        vi.resetModules();
        const pluginModule = await import('../../opencode-plugin.mjs');
        const plugin = await pluginModule.default(
          { project: {}, client: {}, $: {} },
          {}
        );

        const skills = await plugin.skill.register();
        expect(skills).toBeDefined();
        expect(Object.keys(skills)).toHaveLength(0);
      } finally {
        readdirSpy.mockRestore();
      }
    });

    it('should handle skills directory with no SKILL.md files (mocked fs)', async () => {
      // Mock readdir to return directory entries, but readFile to fail for SKILL.md
      const readdirSpy = vi.spyOn(fs, 'readdir').mockImplementation(
        async (p: any, options?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('.agents/skills') || (pathStr.endsWith('skills') && options?.withFileTypes)) {
            return [{ name: 'empty-skill', isDirectory: () => true, isFile: () => false }] as any[];
          }
          return originalReaddir(p, options);
        }
      );

      const readFileSpy = vi.spyOn(fs, 'readFile').mockImplementation(
        async (p: any, encoding?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('empty-skill') && pathStr.includes('SKILL.md')) {
            throw new Error('ENOENT: no such file');
          }
          return originalReadFile(p, encoding);
        }
      );

      try {
        vi.resetModules();
        const pluginModule = await import('../../opencode-plugin.mjs');
        const plugin = await pluginModule.default(
          { project: {}, client: {}, $: {} },
          {}
        );

        const skills = await plugin.skill.register();
        expect(skills).toBeDefined();
        expect(Object.keys(skills)).toHaveLength(0);
      } finally {
        readdirSpy.mockRestore();
        readFileSpy.mockRestore();
      }
    });

    it('should skip skill files without valid frontmatter (mocked fs)', async () => {
      const readdirSpy = vi.spyOn(fs, 'readdir').mockImplementation(
        async (p: any, options?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('.agents/skills') || (pathStr.endsWith('skills') && options?.withFileTypes)) {
            return [{ name: 'bad-skill', isDirectory: () => true, isFile: () => false }] as any[];
          }
          return originalReaddir(p, options);
        }
      );

      const readFileSpy = vi.spyOn(fs, 'readFile').mockImplementation(
        async (p: any, encoding?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('bad-skill') && pathStr.includes('SKILL.md')) {
            return '# No frontmatter here\nJust some content';
          }
          return originalReadFile(p, encoding);
        }
      );

      try {
        vi.resetModules();
        const pluginModule = await import('../../opencode-plugin.mjs');
        const plugin = await pluginModule.default(
          { project: {}, client: {}, $: {} },
          {}
        );

        const skills = await plugin.skill.register();
        expect(skills).toBeDefined();
        expect(Object.keys(skills)).toHaveLength(0);
      } finally {
        readdirSpy.mockRestore();
        readFileSpy.mockRestore();
      }
    });

    it('should extract name and description from frontmatter (mocked fs)', async () => {
      const readdirSpy = vi.spyOn(fs, 'readdir').mockImplementation(
        async (p: any, options?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('.agents/skills') || (pathStr.endsWith('skills') && options?.withFileTypes)) {
            return [{ name: 'test-skill', isDirectory: () => true, isFile: () => false }] as any[];
          }
          return originalReaddir(p, options);
        }
      );

      const readFileSpy = vi.spyOn(fs, 'readFile').mockImplementation(
        async (p: any, encoding?: any) => {
          const pathStr = p.toString();
          if (pathStr.includes('test-skill') && pathStr.includes('SKILL.md')) {
            return `---
name: test-skill
description: "A test skill for unit testing"
---
# Test Skill Content`;
          }
          return originalReadFile(p, encoding);
        }
      );

      try {
        vi.resetModules();
        const pluginModule = await import('../../opencode-plugin.mjs');
        const plugin = await pluginModule.default(
          { project: {}, client: {}, $: {} },
          {}
        );

        const skills = await plugin.skill.register();
        expect(skills).toHaveProperty('test-skill');
        expect(skills['test-skill'].name).toBe('test-skill');
        expect(skills['test-skill'].description).toBe('A test skill for unit testing');
        expect(skills['test-skill'].path).toContain('SKILL.md');
      } finally {
        readdirSpy.mockRestore();
        readFileSpy.mockRestore();
      }
    });
  });

  describe('Plugin Lifecycle', () => {
    it('should have dispose function that resolves', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      const plugin = await pluginModule.default(
        { project: {}, client: {}, $: {} },
        {}
      );

      await expect(plugin.dispose()).resolves.toBeUndefined();
    });

    it('should have empty tool object', async () => {
      const pluginModule = await import('../../opencode-plugin.mjs');
      const plugin = await pluginModule.default(
        { project: {}, client: {}, $: {} },
        {}
      );

      expect(plugin.tool).toBeDefined();
      expect(typeof plugin.tool).toBe('object');
    });
  });
});
