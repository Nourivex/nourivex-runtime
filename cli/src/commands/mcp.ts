import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface McpOptions {
  projectRoot?: string;
}

export async function mcpCommand(options: McpOptions): Promise<void> {
  const serverPath = path.resolve(__dirname, '..', '..', '..', 'mcp', 'dist', 'server.js');
  const env = {
    ...process.env,
    ...(options.projectRoot ? { NOURIVEX_PROJECT_ROOT: path.resolve(options.projectRoot) } : {}),
  };

  const child = spawn(process.execPath, [serverPath], {
    stdio: 'inherit',
    env,
  });

  child.on('error', (error) => {
    console.error(`Failed to start Nourivex MCP server: ${error.message}`);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}
