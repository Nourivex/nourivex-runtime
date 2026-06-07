import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Nourivex Runtime - OpenCode Plugin
 * Otomatisasi pendaftaran sub-agents Nourivex langsung ke dalam runtime eksekusi OpenCode.
 *
 * @param {import('@opencode-ai/plugin').PluginInput} input
 * @param {import('@opencode-ai/plugin').PluginOptions} options
 */
export default async function nourivexRuntimePlugin(input, options) {
  const { project, client, $ } = input;

  let agentConfig = {};
  try {
    // Membaca manifest agen bawaan dari package runtime
    const configPath = path.join(__dirname, 'opencode.agents.json');
    const rawData = await fs.readFile(configPath, 'utf8');
    const parsedData = JSON.parse(rawData);
    agentConfig = parsedData.agents || parsedData.agent || {};
  } catch (error) {
    console.error('[Nourivex Runtime] Gagal memuat definisi konfigurasi agen:', error);
  }

  return {
    /**
     * Hook ekosistem untuk menyuntikkan sub-agents secara dinamis
     */
    agent: {
      register: async () => {
        return agentConfig; 
        // Mengembalikan nvx-researcher, nvx-architect, nvx-planner, dll.
      }
    },

    /**
     * Cleanup on plugin dispose
     */
    dispose: async () => {
      // Membersihkan state resource jika diperlukan
    },

    tool: {}
  };
}