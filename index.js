const { renderMermaid } = require('./lib/render');

module.exports = {
  hooks: {
    init: function () {
      const config = this.config.get('pluginsConfig.mermaid-configurable') || {};
      this.mermaidConfig = {
        theme: config.theme || 'default',
        securityLevel: config.securityLevel || 'strict',
        fontFamily: config.fontFamily || 'Arial, sans-serif',
        fontSize: config.fontSize || '16px',
        startOnLoad: config.startOnLoad ?? false,
      };
      this.log.info(`[honkit-mermaid-configurable] Loaded with theme=${this.mermaidConfig.theme}`);
    },
  },

  blocks: {
    mermaid: {
      process: function (block) {
        const content = block.body.trim();
        const configOverride = block.kwargs || {};
        const mergedConfig = Object.assign({}, this.mermaidConfig, configOverride);
        return renderMermaid(content, mergedConfig);
      },
    },
  },
};
