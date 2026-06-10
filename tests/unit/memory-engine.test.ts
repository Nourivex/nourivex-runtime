/**
 * Unit Tests: Memory Engine (nvx-superpower-memory)
 *
 * Tests verify the storage structure, index operations, and schema
 * conformance for the .nourivex/memory/ system.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import path from 'path';
import fs from 'fs-extra';
import os from 'os';

// --- Helpers (mirror what agents do manually per SKILL.md) ---

interface MemoryEntry {
  id: string;
  type: 'pattern' | 'lesson' | 'preference' | 'domain-rule';
  title: string;
  content: string;
  code?: string;
  tags: string[];
  project?: string;
  created: string;
  lastAccessed?: string;
  accessCount: number;
  source: 'agent' | 'user';
}

interface MemoryIndex {
  version: string;
  lastUpdated: string;
  entries: {
    id: string;
    type: string;
    title: string;
    tags: string[];
    path: string;
  }[];
}

async function initMemoryStorage(baseDir: string): Promise<void> {
  const memDir = path.join(baseDir, '.nourivex', 'memory');
  await fs.ensureDir(path.join(memDir, 'knowledge-vault', 'patterns'));
  await fs.ensureDir(path.join(memDir, 'knowledge-vault', 'lessons'));
  await fs.ensureDir(path.join(memDir, 'user-dna'));
  await fs.ensureDir(path.join(memDir, 'project-map'));
  await fs.writeJson(path.join(memDir, '_index.json'), {
    version: '1.0.0',
    lastUpdated: '',
    entries: []
  }, { spaces: 2 });
}

async function storePattern(baseDir: string, entry: MemoryEntry): Promise<void> {
  const memDir = path.join(baseDir, '.nourivex', 'memory');
  const filename = `${entry.id}.json`;
  const relPath = `knowledge-vault/patterns/${filename}`;
  const fullPath = path.join(memDir, relPath);

  await fs.writeJson(fullPath, entry, { spaces: 2 });

  const indexPath = path.join(memDir, '_index.json');
  const index: MemoryIndex = await fs.readJson(indexPath);
  index.entries.push({ id: entry.id, type: entry.type, title: entry.title, tags: entry.tags, path: relPath });
  index.lastUpdated = new Date().toISOString();
  await fs.writeJson(indexPath, index, { spaces: 2 });
}

async function readIndex(baseDir: string): Promise<MemoryIndex> {
  return fs.readJson(path.join(baseDir, '.nourivex', 'memory', '_index.json'));
}

// --- Tests ---

describe('Memory Engine — Storage Structure', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'nvx-memory-test-'));
    await initMemoryStorage(tempDir);
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Initialization', () => {
    it('creates required directory structure', async () => {
      const memDir = path.join(tempDir, '.nourivex', 'memory');
      expect(await fs.pathExists(path.join(memDir, 'knowledge-vault', 'patterns'))).toBe(true);
      expect(await fs.pathExists(path.join(memDir, 'knowledge-vault', 'lessons'))).toBe(true);
      expect(await fs.pathExists(path.join(memDir, 'user-dna'))).toBe(true);
      expect(await fs.pathExists(path.join(memDir, 'project-map'))).toBe(true);
    });

    it('creates empty index with correct schema', async () => {
      const index = await readIndex(tempDir);
      expect(index.version).toBe('1.0.0');
      expect(Array.isArray(index.entries)).toBe(true);
      expect(index.entries).toHaveLength(0);
    });
  });

  describe('STORE Protocol', () => {
    it('writes entry file to correct path', async () => {
      const entry: MemoryEntry = {
        id: '2026-06-10-test-pattern',
        type: 'pattern',
        title: 'Test Pattern',
        content: 'This is a test pattern.',
        tags: ['test', 'pattern'],
        created: new Date().toISOString(),
        accessCount: 1,
        source: 'agent'
      };

      await storePattern(tempDir, entry);

      const filePath = path.join(tempDir, '.nourivex', 'memory', 'knowledge-vault', 'patterns', `${entry.id}.json`);
      expect(await fs.pathExists(filePath)).toBe(true);
    });

    it('updates index after storing pattern', async () => {
      const entry: MemoryEntry = {
        id: '2026-06-10-express-middleware',
        type: 'pattern',
        title: 'Express Middleware Chain',
        content: 'Auth before validation.',
        tags: ['express', 'middleware', 'auth'],
        created: new Date().toISOString(),
        accessCount: 1,
        source: 'agent'
      };

      await storePattern(tempDir, entry);
      const index = await readIndex(tempDir);

      expect(index.entries).toHaveLength(1);
      expect(index.entries[0].id).toBe(entry.id);
      expect(index.entries[0].type).toBe('pattern');
      expect(index.entries[0].tags).toContain('express');
    });

    it('accumulates multiple entries in index', async () => {
      for (let i = 1; i <= 3; i++) {
        await storePattern(tempDir, {
          id: `2026-06-10-entry-${i}`,
          type: 'pattern',
          title: `Pattern ${i}`,
          content: `Content ${i}`,
          tags: [`tag${i}`],
          created: new Date().toISOString(),
          accessCount: 0,
          source: 'agent'
        });
      }

      const index = await readIndex(tempDir);
      expect(index.entries).toHaveLength(3);
    });

    it('updates lastUpdated timestamp on each store', async () => {
      await storePattern(tempDir, {
        id: '2026-06-10-timestamped',
        type: 'pattern',
        title: 'Timestamped Entry',
        content: 'Content',
        tags: [],
        created: new Date().toISOString(),
        accessCount: 0,
        source: 'agent'
      });

      const index = await readIndex(tempDir);
      expect(index.lastUpdated).not.toBe('');
      expect(new Date(index.lastUpdated).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Entry Schema Compliance', () => {
    it('stored entry preserves all required fields', async () => {
      const entry: MemoryEntry = {
        id: '2026-06-10-full-schema',
        type: 'pattern',
        title: 'Full Schema Test',
        content: 'Full content here.',
        code: 'const x = 1;',
        tags: ['schema', 'test'],
        project: 'nourivex-runtime',
        created: '2026-06-10T00:00:00Z',
        lastAccessed: '2026-06-10T01:00:00Z',
        accessCount: 5,
        source: 'agent'
      };

      await storePattern(tempDir, entry);

      const filePath = path.join(tempDir, '.nourivex', 'memory', 'knowledge-vault', 'patterns', `${entry.id}.json`);
      const stored: MemoryEntry = await fs.readJson(filePath);

      expect(stored.id).toBe(entry.id);
      expect(stored.type).toBe('pattern');
      expect(stored.title).toBe(entry.title);
      expect(stored.content).toBe(entry.content);
      expect(stored.code).toBe(entry.code);
      expect(stored.tags).toEqual(entry.tags);
      expect(stored.project).toBe(entry.project);
      expect(stored.accessCount).toBe(5);
      expect(stored.source).toBe('agent');
    });
  });

  describe('RECALL Protocol', () => {
    it('returns empty entries when no memory exists', async () => {
      const index = await readIndex(tempDir);
      const results = index.entries.filter(e => e.tags.includes('express'));
      expect(results).toHaveLength(0);
    });

    it('can filter by tag from index', async () => {
      await storePattern(tempDir, {
        id: '2026-06-10-express-pattern',
        type: 'pattern',
        title: 'Express Route',
        content: 'Route content.',
        tags: ['express', 'routes'],
        created: new Date().toISOString(),
        accessCount: 0,
        source: 'agent'
      });
      await storePattern(tempDir, {
        id: '2026-06-10-vitest-lesson',
        type: 'lesson',
        title: 'Vitest ESM Mock',
        content: 'Lesson content.',
        tags: ['vitest', 'testing'],
        created: new Date().toISOString(),
        accessCount: 0,
        source: 'agent'
      });

      const index = await readIndex(tempDir);
      const expressResults = index.entries.filter(e => e.tags.includes('express'));
      const vitestResults = index.entries.filter(e => e.tags.includes('vitest'));

      expect(expressResults).toHaveLength(1);
      expect(expressResults[0].id).toBe('2026-06-10-express-pattern');
      expect(vitestResults).toHaveLength(1);
      expect(vitestResults[0].id).toBe('2026-06-10-vitest-lesson');
    });
  });
});
