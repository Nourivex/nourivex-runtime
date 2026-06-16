import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DocxTool {
  name: string;
  description?: string;
  inputSchema: Record<string, unknown>;
}

type ExtractResult<T> = T extends Promise<infer R> ? R : never;
type ClientCallToolResult = CallToolResult;

// ── Gateway ────────────────────────────────────────────────────────────────

export class DocxGateway {
  private client: Client | null = null;
  private transport: StdioClientTransport | null = null;
  private tools: DocxTool[] = [];
  private _available = false;
  private _error: string | null = null;

  get available(): boolean {
    return this._available;
  }

  get error(): string | null {
    return this._error;
  }

  getTools(): DocxTool[] {
    return this.tools;
  }

  async start(): Promise<boolean> {
    try {
      const command = 'uvx';
      const args = ['nourivex-docx-server'];

      this.transport = new StdioClientTransport({
        command,
        args,
        stderr: 'pipe',
      });

      this.client = new Client(
        {
          name: 'nourivex-docx-gateway',
          version: '1.0.0',
        },
        {
          capabilities: {},
        },
      );

      await this.client.connect(this.transport);

      const result = await this.client.listTools();
      this.tools = (result.tools || []).map((t: any) => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema as Record<string, unknown>,
      }));

      this._available = true;
      console.error(
        `DocxGateway: connected, ${this.tools.length} tools available`,
      );
      return true;
    } catch (err: any) {
      const msg = err?.message || String(err);
      this._error = msg;
      this._available = false;
      this.tools = [];
      console.error(`DocxGateway: unavailable — ${msg}`);
      return false;
    }
  }

  async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ClientCallToolResult> {
    if (!this._available || !this.client) {
      return {
        content: [
          { type: 'text' as const, text: `Docx server unavailable: ${this._error || 'not started'}` },
        ],
        isError: true,
      };
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args,
      });
      return result as CallToolResult;
    } catch (err: any) {
      return {
        content: [
          { type: 'text' as const, text: `Docx tool error (${name}): ${err?.message || String(err)}` },
        ],
        isError: true,
      };
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
      }
      if (this.transport) {
        await this.transport.close();
      }
    } catch {
      // best-effort cleanup
    }
    this._available = false;
    this.client = null;
    this.transport = null;
  }
}
