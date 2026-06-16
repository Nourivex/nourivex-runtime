import { z } from 'zod/v3';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { resolveMemoryDir } from '../utils/resolver.js';
import { readJsonSafe, writeJsonAtomic, ensureDirExists, fileExists } from '../utils/fs-ops.js';
import type {
  MemoryEntry,
  MemoryIndex,
  MemoryIndexEntry,
  UserDna,
  DomainRule,
} from '../schemas/memory.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function generateId(title: string): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  return `${date}-${slugify(title)}`;
}

function now(): string {
  return new Date().toISOString();
}

function memoryDir(): string {
  return resolveMemoryDir();
}

function indexPath(): string {
  return `${memoryDir()}/_index.json`;
}

function entryPath(type: string, id: string): string {
  if (type === 'pattern' || type === 'lesson') {
    return `${memoryDir()}/knowledge-vault/${type === 'pattern' ? 'patterns' : 'lessons'}/${id}.json`;
  }
  return `${memoryDir()}/knowledge-vault/${type}s/${id}.json`;
}

function dnaPath(): string {
  return `${memoryDir()}/user-dna/profile.json`;
}

function domainRulesPath(): string {
  return `${memoryDir()}/project-map/domain-rules.json`;
}

async function readIndex(): Promise<MemoryIndex> {
  const { data } = await readJsonSafe<MemoryIndex>(indexPath());
  return data ?? { version: '1.0', lastUpdated: now(), entries: [] };
}

async function writeIndex(index: MemoryIndex): Promise<void> {
  index.lastUpdated = now();
  const result = await writeJsonAtomic(indexPath(), index);
  if (!result.success) {
    throw new Error(result.error ?? 'Failed to write index');
  }
}

// ---------------------------------------------------------------------------
// Tool registration
// ---------------------------------------------------------------------------

export function registerMemoryTools(server: McpServer): void {
  // ── memory_store ─────────────────────────────────────────────────────────
  server.registerTool(
    'memory_store',
    {
      description: 'Store a pattern, lesson, preference, or domain rule in the knowledge vault',
      inputSchema: z.object({
        type: z.enum(['pattern', 'lesson', 'preference', 'domain-rule']),
        title: z.string(),
        content: z.string(),
        code: z.string().optional(),
        tags: z.array(z.string()),
        project: z.string().optional(),
      }),
    },
    async (input) => {
      const id = generateId(input.title);
      const ts = now();

      const entry: MemoryEntry = {
        id,
        type: input.type,
        title: input.title,
        content: input.content,
        code: input.code,
        tags: input.tags,
        project: input.project,
        created: ts,
        lastAccessed: ts,
        accessCount: 0,
        source: 'mcp',
      };

      const filePath = entryPath(input.type, id);
      const result = await writeJsonAtomic(filePath, entry);
      if (!result.success) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] };
      }

      const index = await readIndex();
      const relPath = filePath.replace(`${memoryDir()}/`, '');
      const indexEntry: MemoryIndexEntry = {
        id,
        type: input.type,
        title: input.title,
        tags: input.tags,
        path: relPath,
      };
      index.entries.push(indexEntry);
      await writeIndex(index);

      return { content: [{ type: 'text' as const, text: JSON.stringify(entry) }] };
    },
  );

  // ── memory_recall ────────────────────────────────────────────────────────
  server.registerTool(
    'memory_recall',
    {
      description: 'Search and recall memory entries by query, tags, or type',
      inputSchema: z.object({
        query: z.string().optional(),
        tags: z.array(z.string()).optional(),
        type: z.string().optional(),
        limit: z.number().int().positive().optional().default(10),
      }),
    },
    async (input) => {
      const index = await readIndex();
      const queryLower = input.query?.toLowerCase();
      const limit = input.limit ?? 10;

      let matches = index.entries;

      if (queryLower) {
        matches = matches.filter(
          (e: MemoryIndexEntry) =>
            e.title.toLowerCase().includes(queryLower) ||
            e.tags.some((t: string) => t.toLowerCase().includes(queryLower)),
        );
      }

      if (input.tags && input.tags.length > 0) {
        matches = matches.filter((e: MemoryIndexEntry) => input.tags!.some((t: string) => e.tags.includes(t)));
      }

      if (input.type) {
        matches = matches.filter((e: MemoryIndexEntry) => e.type === input.type);
      }

      matches.sort((a: MemoryIndexEntry, b: MemoryIndexEntry) => b.id.localeCompare(a.id));
      matches = matches.slice(0, limit);

      const results: MemoryEntry[] = [];
      for (const idx of matches) {
        const fp = `${memoryDir()}/${idx.path}`;
        const { data } = await readJsonSafe<MemoryEntry>(fp);
        if (data) {
          data.accessCount += 1;
          data.lastAccessed = now();
          await writeJsonAtomic(fp, data);
          results.push(data);
        }
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(results) }] };
    },
  );

  // ── memory_get ───────────────────────────────────────────────────────────
  server.registerTool(
    'memory_get',
    {
      description: 'Get a single memory entry by ID',
      inputSchema: z.object({
        id: z.string(),
      }),
    },
    async (input) => {
      const index = await readIndex();
      const idx = index.entries.find((e: MemoryIndexEntry) => e.id === input.id);
      if (!idx) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: `Entry not found: ${input.id}` }) }] };
      }

      const fp = `${memoryDir()}/${idx.path}`;
      const { data, error } = await readJsonSafe<MemoryEntry>(fp);
      if (!data) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error }) }] };
      }

      data.accessCount += 1;
      data.lastAccessed = now();
      await writeJsonAtomic(fp, data);

      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // ── memory_list ──────────────────────────────────────────────────────────
  server.registerTool(
    'memory_list',
    {
      description: 'List all memory entries, optionally filtered by type',
      inputSchema: z.object({
        type: z.string().optional(),
      }),
    },
    async (input) => {
      const index = await readIndex();
      let entries = index.entries;
      if (input.type) {
        entries = entries.filter((e: MemoryIndexEntry) => e.type === input.type);
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify(entries) }] };
    },
  );

  // ── memory_update_user_dna ───────────────────────────────────────────────
  server.registerTool(
    'memory_update_user_dna',
    {
      description: 'Update a field on the user DNA profile (preferences, coding style, etc.)',
      inputSchema: z.object({
        field: z.string(),
        value: z.any(),
      }),
    },
    async (input) => {
      const fp = dnaPath();
      const { data: existing } = await readJsonSafe<UserDna>(fp);

      const profile: UserDna = existing ?? {
        codingStyle: '',
        preferences: [],
        antiPatterns: [],
        tools: [],
      };

      const fieldName = input.field as string;
      (profile as Record<string, unknown>)[fieldName] = input.value as unknown;

      const result = await writeJsonAtomic(fp, profile);
      if (!result.success) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] };
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(profile) }] };
    },
  );

  // ── memory_get_user_dna ──────────────────────────────────────────────────
  server.registerTool(
    'memory_get_user_dna',
    {
      description: 'Get the user DNA profile (coding style, preferences, anti-patterns)',
    },
    async () => {
      const fp = dnaPath();
      if (!(await fileExists(fp))) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: 'User DNA profile not found' }) }] };
      }
      const { data, error } = await readJsonSafe<UserDna>(fp);
      if (!data) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error }) }] };
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // ── memory_get_domain_rules ──────────────────────────────────────────────
  server.registerTool(
    'memory_get_domain_rules',
    {
      description: 'Get all domain rules (business invariants that must never be violated)',
    },
    async () => {
      const fp = domainRulesPath();
      if (!(await fileExists(fp))) {
        return { content: [{ type: 'text' as const, text: JSON.stringify([]) }] };
      }
      const { data, error } = await readJsonSafe<DomainRule[]>(fp);
      if (!data) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error }) }] };
      }
      return { content: [{ type: 'text' as const, text: JSON.stringify(data) }] };
    },
  );

  // ── memory_add_domain_rule ───────────────────────────────────────────────
  server.registerTool(
    'memory_add_domain_rule',
    {
      description: 'Add a new domain rule (critical/warning/info)',
      inputSchema: z.object({
        title: z.string(),
        description: z.string(),
        severity: z.enum(['critical', 'warning', 'info']),
      }),
    },
    async (input) => {
      const fp = domainRulesPath();
      await ensureDirExists(memoryDir());

      let rules: DomainRule[] = [];
      if (await fileExists(fp)) {
        const { data } = await readJsonSafe<DomainRule[]>(fp);
        if (data) rules = data;
      }

      const rule: DomainRule = {
        id: generateId(input.title),
        title: input.title,
        description: input.description,
        severity: input.severity,
        created: now(),
      };

      rules.push(rule);

      const result = await writeJsonAtomic(fp, rules);
      if (!result.success) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ error: result.error }) }] };
      }

      return { content: [{ type: 'text' as const, text: JSON.stringify(rules) }] };
    },
  );
}
