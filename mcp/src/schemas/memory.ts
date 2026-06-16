import { z } from 'zod/v3';

export const MemoryEntryTypeSchema = z.enum(['pattern', 'lesson', 'preference', 'domain-rule']);
export type MemoryEntryType = z.infer<typeof MemoryEntryTypeSchema>;

export const MemoryEntrySchema = z.object({
  id: z.string(),
  type: MemoryEntryTypeSchema,
  title: z.string(),
  content: z.string(),
  code: z.string().optional(),
  tags: z.array(z.string()),
  project: z.string().optional(),
  created: z.string(),
  lastAccessed: z.string(),
  accessCount: z.number().int().nonnegative(),
  source: z.string(),
});
export type MemoryEntry = z.infer<typeof MemoryEntrySchema>;

export const MemoryIndexEntrySchema = z.object({
  id: z.string(),
  type: MemoryEntryTypeSchema,
  title: z.string(),
  tags: z.array(z.string()),
  path: z.string(),
});
export type MemoryIndexEntry = z.infer<typeof MemoryIndexEntrySchema>;

export const MemoryIndexSchema = z.object({
  version: z.string(),
  lastUpdated: z.string(),
  entries: z.array(MemoryIndexEntrySchema),
});
export type MemoryIndex = z.infer<typeof MemoryIndexSchema>;

export const UserDnaSchema = z.object({
  codingStyle: z.string(),
  preferences: z.array(z.string()),
  antiPatterns: z.array(z.string()),
  tools: z.array(z.string()),
});
export type UserDna = z.infer<typeof UserDnaSchema>;

export const DomainRuleSeveritySchema = z.enum(['critical', 'warning', 'info']);
export type DomainRuleSeverity = z.infer<typeof DomainRuleSeveritySchema>;

export const DomainRuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  severity: DomainRuleSeveritySchema,
  created: z.string(),
});
export type DomainRule = z.infer<typeof DomainRuleSchema>;
