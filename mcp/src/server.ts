#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod/v3';
import { registerGoalTools } from './tools/goals.js';
import { registerMemoryTools } from './tools/memory.js';
import { registerSessionTools } from './tools/session.js';
import { registerTodoTools } from './tools/todos.js';
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';
import { DocxGateway } from './gateway.js';

const server = new McpServer({
  name: 'nourivex-runtime',
  version: '5.0.0',
});

// ── Native Nourivex tools ───────────────────────────────────────────────────

registerGoalTools(server);
registerMemoryTools(server);
registerSessionTools(server);
registerTodoTools(server);
registerPrompts(server);
registerResources(server);

// ── Docx Gateway (child Python MCP server) ──────────────────────────────────

const docxGateway = new DocxGateway();
const docxAvailable = await docxGateway.start();

if (docxAvailable) {
  for (const tool of docxGateway.getTools()) {
    server.registerTool(
      tool.name,
      {
        description: tool.description ?? '',
        inputSchema: z.any(),
      },
      async (args: Record<string, unknown>) => {
        return await docxGateway.callTool(tool.name, args);
      },
    );
  }
  console.error(
    `DocxGateway: registered ${docxGateway.getTools().length} docx tools`,
  );
} else {
  console.error('DocxGateway: not available — docx tools omitted');
}

// ── Start server ────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Nourivex MCP Server started');
