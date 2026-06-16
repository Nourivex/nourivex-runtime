import { z } from 'zod/v3';

export const TodoItemStatusSchema = z.enum(['pending', 'in-progress', 'completed', 'blocked']);
export type TodoItemStatus = z.infer<typeof TodoItemStatusSchema>;

export const TodoPrioritySchema = z.enum(['high', 'medium', 'low']);
export type TodoPriority = z.infer<typeof TodoPrioritySchema>;

export const TodoItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: TodoItemStatusSchema,
  priority: TodoPrioritySchema,
  verificationCommand: z.string().optional(),
  blockedBy: z.string().optional(),
  completedAt: z.string().optional(),
});
export type TodoItem = z.infer<typeof TodoItemSchema>;

export const TodoProgressSchema = z.object({
  completed: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  inProgress: z.number().int().nonnegative(),
  percentage: z.number().min(0).max(100),
});
export type TodoProgress = z.infer<typeof TodoProgressSchema>;

export const TodoListSchema = z.object({
  id: z.string(),
  title: z.string(),
  goalId: z.string().optional(),
  planPath: z.string().optional(),
  items: z.array(TodoItemSchema),
  progress: TodoProgressSchema,
});
export type TodoList = z.infer<typeof TodoListSchema>;

export const TodoActiveSchema = z.object({
  activeTodoId: z.string(),
  activeTodoPath: z.string(),
});
export type TodoActive = z.infer<typeof TodoActiveSchema>;
