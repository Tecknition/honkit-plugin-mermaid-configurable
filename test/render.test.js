const test = require('node:test');
const assert = require('node:assert/strict');
const { renderMermaid } = require('../lib/render');
const plugin = require('../index');

test('renderMermaid produces SVG output', async () => {
  const svgHtml = await renderMermaid('graph TD; A-->B;', {
    theme: 'default',
    securityLevel: 'strict',
    startOnLoad: false,
  });

  assert.match(svgHtml, /<svg[^>]*>/);
  assert.ok(svgHtml.includes('mermaid-diagram'));
});

test('renderMermaid handles empty diagram code', async () => {
  const result = await renderMermaid('', {});
  assert.strictEqual(result, '');
});

test('renderMermaid handles null diagram code', async () => {
  const result = await renderMermaid(null, {});
  assert.strictEqual(result, '');
});

test('renderMermaid handles undefined config', async () => {
  const result = await renderMermaid('graph TD; X-->Y;', undefined);
  assert.ok(result.includes('svg'));
});

test('renderMermaid handles invalid diagram gracefully', async () => {
  const result = await renderMermaid('invalid mermaid syntax!!!', {});
  assert.ok(result.includes('mermaid-error') || result.includes('Syntax error'));
});

test('plugin init hook sets default config', () => {
  const context = {
    config: {
      get: () => null,
    },
    log: {
      info: () => {},
    },
    mermaidConfig: null,
  };

  plugin.hooks.init.call(context);

  assert.ok(context.mermaidConfig);
  assert.strictEqual(context.mermaidConfig.theme, 'default');
  assert.strictEqual(context.mermaidConfig.securityLevel, 'strict');
  assert.strictEqual(context.mermaidConfig.fontFamily, 'Arial, sans-serif');
});

test('plugin init hook uses custom config', () => {
  const context = {
    config: {
      get: (key) => {
        if (key === 'pluginsConfig.mermaid-configurable') {
          return {
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Courier',
            fontSize: '14px',
            startOnLoad: true,
          };
        }
        return null;
      },
    },
    log: {
      info: () => {},
    },
    mermaidConfig: null,
  };

  plugin.hooks.init.call(context);

  assert.strictEqual(context.mermaidConfig.theme, 'dark');
  assert.strictEqual(context.mermaidConfig.securityLevel, 'loose');
  assert.strictEqual(context.mermaidConfig.fontFamily, 'Courier');
  assert.strictEqual(context.mermaidConfig.fontSize, '14px');
  assert.strictEqual(context.mermaidConfig.startOnLoad, true);
});

test('plugin block process merges configs correctly', async () => {
  const context = {
    mermaidConfig: {
      theme: 'default',
      securityLevel: 'strict',
    },
  };

  const block = {
    body: 'graph TD; A-->B;',
    kwargs: {
      theme: 'dark',
    },
  };

  const result = await plugin.blocks.mermaid.process.call(context, block);
  assert.ok(result.includes('svg'));
});

test('plugin block process handles empty body', async () => {
  const context = {
    mermaidConfig: { theme: 'default' },
  };

  const block = {
    body: '',
    kwargs: {},
  };

  const result = await plugin.blocks.mermaid.process.call(context, block);
  assert.strictEqual(result, '');
});

test('renderMermaid generates unique IDs for multiple diagrams', async () => {
  const diagram1 = await renderMermaid('graph TD; A-->B;', {});
  const diagram2 = await renderMermaid('graph TD; C-->D;', {});

  assert.notStrictEqual(diagram1, diagram2);
  assert.ok(diagram1.includes('svg'));
  assert.ok(diagram2.includes('svg'));
});

test('renderMermaid handles sequenceDiagram syntax', async () => {
  const diagram = await renderMermaid(
    'sequenceDiagram\nAlice->>Bob: Hello Bob!\nBob->>Alice: Hi Alice!',
    {}
  );
  assert.ok(diagram.includes('svg') || diagram.includes('mermaid'));
});
