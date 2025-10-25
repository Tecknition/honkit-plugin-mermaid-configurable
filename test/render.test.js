const test = require('node:test');
const assert = require('node:assert/strict');

let renderMermaid;
let hasDependencies = true;

try {
  require.resolve('jsdom');
  require.resolve('mermaid');
  ({ renderMermaid } = require('../lib/render'));
} catch (err) {
  hasDependencies = false;
}

test('renderMermaid produces SVG output', hasDependencies ? {} : { skip: true }, async () => {
  const svgHtml = await renderMermaid('graph TD; A-->B;', {
    theme: 'default',
    securityLevel: 'strict',
    startOnLoad: false,
  });

  assert.match(svgHtml, /<svg[^>]*>/);
  assert.ok(svgHtml.includes('mermaid')); // sanity check for rendered diagram content
});
