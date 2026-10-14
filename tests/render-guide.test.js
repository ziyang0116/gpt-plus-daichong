import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { marked } from 'marked';
import { renderGuide } from '../scripts/render-guide.js';

function readableText(html) {
  return html.replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

test('the website preserves every README content block below its title', () => {
  const source = readFileSync(new URL('../README.md', import.meta.url), 'utf8');
  const page = readableText(renderGuide(source).html);
  for (const token of marked.lexer(source)) {
    if (token.type === 'space' || (token.type === 'heading' && token.depth === 1)) continue;
    const expected = readableText(marked.parser([token]));
    assert.ok(page.includes(expected), `Missing README content: ${expected}`);
  }
});

test('every navigation anchor resolves, including repeated headings', () => {
  const { html } = renderGuide('# A guide\n\nIntroduction.\n\n## Same heading\n\nFirst.\n\n## Same heading\n\nSecond.');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) {
    assert.ok(ids.includes(target) || target === 'top', `Unresolved anchor: ${target}`);
  }
});

test('FAQ introduction and all answers remain readable without JavaScript', () => {
  const { html } = renderGuide('# Guide\n\nIntro.\n\n## 常见问题\n\nFAQ introduction.\n\n**First question?**\n\nFirst answer with [a link](https://example.com).\n\n**Second question?**\n\nSecond answer.\n\n## Appendix\n\nAppendix text.');
  assert.match(html, /FAQ introduction\./);
  assert.match(html, /<summary>First question\?/);
  assert.match(html, /First answer with/);
  assert.match(html, /<summary>Second question\?/);
  assert.match(html, /Second answer\./);
  assert.match(html, /Appendix text\./);
  assert.match(html, /rel="noopener noreferrer"/);
});

test('Mermaid is escaped until the browser renders it', () => {
  const { html } = renderGuide('# Guide\n\nIntro.\n\n```mermaid\nflowchart LR\nA[<script>alert(1)</script>] --> B\n```');
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>/);
});
