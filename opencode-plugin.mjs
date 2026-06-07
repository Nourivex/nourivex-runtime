import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Nourivex Runtime - OpenCode Plugin
 * Otomatisasi pendaftaran sub-agents dan skills Nourivex langsung ke dalam runtime eksekusi OpenCode.
 *
 * @param {import('@opencode-ai/plugin').PluginInput} input
 * @param {import('@opencode-ai/plugin').PluginOptions} options
 */
export default async function nourivexRuntimePlugin(input, options) {
  const { project, client, $ } = input;

  let agentConfig = {};
  let skills = {};

  try {
    // Membaca manifest agen bawaan dari package runtime
    const configPath = path.join(__dirname, 'opencode.agents.json');
    const rawData = await fs.readFile(configPath, 'utf8');
    const parsedData = JSON.parse(rawData);
    agentConfig = parsedData.agents || parsedData.agent || {};
  } catch (error) {
    console.error('[Nourivex Runtime] Gagal memuat definisi konfigurasi agen:', error);
  }

  try {
    // Load skills from .opencode/skills/ directory
    const skillsDir = path.join(__dirname, '.opencode', 'skills');
    const skillEntries = await fs.readdir(skillsDir, { withFileTypes: true });
    
    for (const entry of skillEntries) {
      if (entry.isDirectory()) {
        const skillPath = path.join(skillsDir, entry.name, 'SKILL.md');
        try {
          const skillContent = await fs.readFile(skillPath, 'utf8');
          // Extract frontmatter
          const frontmatterMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);
          if (frontmatterMatch) {
            const frontmatter = frontmatterMatch[1];
            const nameMatch = frontmatter.match(/name:\s*(.+)/);
            const descMatch = frontmatter.match(/description:\s*["']?(.+?)["']?\s*$/m);
            
            if (nameMatch) {
              skills[nameMatch[1].trim()] = {
                name: nameMatch[1].trim(),
                description: descMatch ? descMatch[1].trim() : '',
                path: skillPath
              };
            }
          }
        } catch (e) {
          // Skill file not found, skip
        }
      }
    }
  } catch (error) {
    console.error('[Nourivex Runtime] Gagal memuat skills:', error);
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
     * Hook untuk mendaftarkan skills
     */
    skill: {
      register: async () => {
        return skills;
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
