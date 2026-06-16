import * as fs from 'node:fs/promises';
import * as path from 'node:path';

/**
 * Safely read a JSON file and parse it.
 * Returns null data with error message on failure.
 */
export async function readJsonSafe<T>(filePath: string): Promise<{ data: T | null; error?: string }> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content) as T;
    return { data: parsed };
  } catch (err: unknown) {
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { data: null, error: `File not found: ${filePath}` };
    }
    const message = err instanceof Error ? err.message : String(err);
    return { data: null, error: `Failed to read ${filePath}: ${message}` };
  }
}

/**
 * Atomically write JSON data to a file.
 * Writes to a temp file first, then renames for atomicity.
 */
export async function writeJsonAtomic(filePath: string, data: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const dir = path.dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    const tmpPath = `${filePath}.tmp.${Date.now()}`;
    await fs.writeFile(tmpPath, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tmpPath, filePath);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to write ${filePath}: ${message}` };
  }
}

/**
 * Ensure a directory exists, creating it recursively if needed.
 */
export async function ensureDirExists(dirPath: string): Promise<{ success: boolean; error?: string }> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: `Failed to create directory ${dirPath}: ${message}` };
  }
}

/**
 * Check if a file or directory exists.
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
