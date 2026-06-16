import { z } from 'zod/v3';
import { GoalStatusSchema } from './goal.js';

export const SessionGoalSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: GoalStatusSchema,
});
export type SessionGoalSummary = z.infer<typeof SessionGoalSummarySchema>;

export const SessionTodoProgressSchema = z.object({
  id: z.string(),
  completed: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  percentage: z.number().min(0).max(100),
  lastCompletedTask: z.string().optional(),
});
export type SessionTodoProgress = z.infer<typeof SessionTodoProgressSchema>;

export const SessionSummarySchema = z.object({
  version: z.string(),
  sessionEnd: z.string(),
  duration: z.string(),
  goal: SessionGoalSummarySchema.nullable(),
  todoProgress: SessionTodoProgressSchema,
  memoryStored: z.array(z.string()),
  scopeAlerts: z.number().int().nonnegative(),
  nextSteps: z.array(z.string()),
});
export type SessionSummary = z.infer<typeof SessionSummarySchema>;
