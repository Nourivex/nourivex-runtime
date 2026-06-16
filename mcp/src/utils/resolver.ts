import * as path from 'node:path';

/**
 * Resolve the project root directory.
 * Uses NOURIVEX_PROJECT_ROOT env var if set, otherwise process.cwd().
 */
export function resolveProjectRoot(): string {
  return process.env['NOURIVEX_PROJECT_ROOT'] ?? process.cwd();
}

/**
 * Resolve the .nourivex/ directory path.
 */
export function resolveNourivexDir(): string {
  return path.join(resolveProjectRoot(), '.nourivex');
}

/**
 * Resolve the .nourivex/goals/ directory path.
 */
export function resolveGoalsDir(): string {
  return path.join(resolveNourivexDir(), 'goals');
}

/**
 * Resolve the .nourivex/memory/ directory path.
 */
export function resolveMemoryDir(): string {
  return path.join(resolveNourivexDir(), 'memory');
}

/**
 * Resolve the .nourivex/todos/ directory path.
 */
export function resolveTodosDir(): string {
  return path.join(resolveNourivexDir(), 'todos');
}

/**
 * Resolve the .nourivex/sessions/ directory path.
 */
export function resolveSessionsDir(): string {
  return path.join(resolveNourivexDir(), 'sessions');
}
