import { z } from 'zod/v3';

export const ScopeAlarmStatusSchema = z.enum(['pending', 'approved', 'skipped', 'escalated']);
export type ScopeAlarmStatus = z.infer<typeof ScopeAlarmStatusSchema>;

export const ScopeAlarmSchema = z.object({
  timestamp: z.string(),
  driftType: z.string(),
  description: z.string(),
  resolution: ScopeAlarmStatusSchema,
});
export type ScopeAlarm = z.infer<typeof ScopeAlarmSchema>;

export const GoalUpdateSchema = z.object({
  timestamp: z.string(),
  field: z.string(),
  oldValue: z.string(),
  newValue: z.string(),
  reason: z.string(),
});
export type GoalUpdate = z.infer<typeof GoalUpdateSchema>;

export const GoalStatusSchema = z.enum(['active', 'completed', 'abandoned', 'paused']);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

export const GoalSchema = z.object({
  id: z.string(),
  status: GoalStatusSchema,
  title: z.string(),
  objective: z.string(),
  successCriteria: z.array(z.string()),
  outOfScope: z.array(z.string()),
  context: z.string().optional(),
  created: z.string(),
  lastUpdated: z.string(),
  linkedPlan: z.string().optional(),
  linkedTodos: z.array(z.string()),
  scopeAlarms: z.array(ScopeAlarmSchema),
  updates: z.array(GoalUpdateSchema),
});
export type Goal = z.infer<typeof GoalSchema>;

export const GoalCreateInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  objective: z.string().min(1, 'Objective is required'),
  successCriteria: z.array(z.string()).min(1, 'At least one success criterion required'),
  outOfScope: z.array(z.string()),
});
export type GoalCreateInput = z.infer<typeof GoalCreateInputSchema>;
