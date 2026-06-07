/**
 * Nourivex Runtime - OpenCode Plugin
 *
 * This plugin registers the Nourivex Engineering Runtime with OpenCode.
 * It provides hooks for tool definitions and system prompt enrichment.
 *
 * Usage:
 *   Add to opencode.json:
 *     "plugin": ["nourivex-runtime/opencode-plugin.mjs"]
 *
 * @param {import('@opencode-ai/plugin').PluginInput} input
 * @param {import('@opencode-ai/plugin').PluginOptions} options
 * @returns {Promise<import('@opencode-ai/plugin').Hooks>}
 */
export default async function nourivexRuntimePlugin(input, options) {
  const { project, client, $ } = input;

  return {
    /**
     * Cleanup on plugin dispose
     */
    dispose: async () => {
      // No resources to clean up
    },

    /**
     * Provide custom tool definitions
     */
    tool: {
      // Tools will be added in future versions
    },
  };
}
