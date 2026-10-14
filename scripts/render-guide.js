import { Marked, Renderer } from 'marked';

export function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

const renderer = new Renderer();
renderer.code = function (token) {
  if (token.lang?.trim() === 'mermaid') {
    return `<div class="diagram-scroll"><pre class="mermaid">${escapeHtml(token.text)}</pre></div>`;
  }
  return Renderer.prototype.code.call(this, token);
};
renderer.table = function (token) {
  return `<div class="table-scroll" role="region" aria-label="表格，可横向滚动" tabindex="0">${Renderer.prototype.table.call(this, token)}</div>`;
};
renderer.link = function (token) {
  const html = Renderer.prototype.link.call(this, token);
  return /^https?:\/\//i.test(token.href)
    ? html.replace('<a ', '<a target="_blank" rel="noopener noreferrer" ')
    : html;
};
const markdown = new Marked({ gfm: true, renderer });

function faqHtml(tokens) {
  const introduction = [];
  const questions = [];
  let current;
  for (const token of tokens) {
    const question = token.type === 'paragraph'
      && token.tokens?.length === 1
      && token.tokens[0].type === 'strong'
      && /[？?]$/.test(token.tokens[0].text);
    if (question) {
      current = { title: token.tokens[0].text, tokens: [] };
      questions.push(current);
    } else {
      (current ? current.tokens : introduction).push(token);
    }
  }
  return markdown.parser(introduction) + questions.map((item, index) => `
    <details class="faq-item"${index === 0 ? ' open' : ''}>
      <summary>${escapeHtml(item.title)}<span class="faq-icon" aria-hidden="true">+</span></summary>
      <div class="faq-answer">${markdown.parser(item.tokens)}</div>
    </details>`).join('');
}

export function renderGuide(source, repositoryUrl = 'https://github.com/ziyang0116/gpt-plus-daichong', { title: pageTitle } = {}) {
  const tokens = markdown.lexer(source);
  const titleIndex = tokens.findIndex((token) => token.type === 'heading' && token.depth === 1);
  const sourceTitle = titleIndex >= 0 ? tokens[titleIndex].text : 'ChatGPT 充值指南';
  const title = pageTitle ?? sourceTitle;
  const introIndex = tokens.findIndex((token, index) => index > titleIndex && token.type !== 'space');
  const introduction = tokens[introIndex]?.type === 'paragraph' ? tokens[introIndex] : null;
  const description = introduction?.text.replace(/\*\*|[*`]/g, '') ?? title;
  const sections = [];
  const preamble = [];
  const usedIds = new Set();
  let current;

  for (const [index, token] of tokens.entries()) {
    if (index === titleIndex || (introduction && index === introIndex)) continue;
    if (token.type === 'heading' && token.depth === 2) {
      const slug = token.text.normalize('NFKC').toLowerCase()
        .replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '') || 'section';
      let id = slug;
      let suffix = 2;
      while (usedIds.has(id)) id = `${slug}-${suffix++}`;
      usedIds.add(id);
      current = { id, title: token.text, tokens: [] };
      sections.push(current);
    } else {
      (current ? current.tokens : preamble).push(token);
    }
  }

  const methods = sections.filter((section) => /^方式[一二三四五六七八九十]+[：:]/.test(section.title));
  const comparison = sections.find((section) => section.title.includes('对比'));
  const faq = sections.find((section) => section.title.includes('常见问题'));
  const recommendation = sections.find((section) => section.title.includes('如何选择'));
  const year = sourceTitle.match(/20\d{2}/)?.[0];
  const displayTitle = escapeHtml(title.replace(/（20\d{2}）$/, ''))
    .replace(/ChatGPT(?: Plus)?/, (text) => `<span class="title-accent">${text}</span>`)
    .replace('充值指南', '<span class="title-phrase">充值指南</span>')
    .replace('：', '<br /><span class="title-subtitle">')
    + (title.includes('：') ? '</span>' : '');
  const anchor = (section, label, className = '') => section
    ? `<a class="${className}" href="#${escapeHtml(section.id)}">${escapeHtml(label)}</a>` : '';
  const toc = sections.map((section, index) => `
    <a href="#${escapeHtml(section.id)}"><span class="toc-index">${String(index + 1).padStart(2, '0')}</span><span>${escapeHtml(section.title)}</span></a>`).join('');
  const article = sections.map((section) => {
    const methodIndex = methods.indexOf(section);
    const isFaq = section === faq;
    return `<section id="${escapeHtml(section.id)}" class="guide-section${methodIndex >= 0 ? ' method-section' : ''}${isFaq ? ' faq-section' : ''}">
      ${methodIndex >= 0 ? `<div class="section-eyebrow">开通方式 <span>${String(methodIndex + 1).padStart(2, '0')} / ${String(methods.length).padStart(2, '0')}</span></div>` : ''}
      <h2>${escapeHtml(section.title)}</h2>
      <div class="prose">${isFaq ? faqHtml(section.tokens) : markdown.parser(section.tokens)}</div>
    </section>`;
  }).join('');

  return {
    title: escapeHtml(title),
    description: escapeHtml(description),
    html: `
      <a class="skip-link" href="#guide">跳到正文</a>
      <div class="reading-progress" aria-hidden="true"></div>
      <header class="site-header">
        <div class="header-inner">
          <a href="#top" class="brand"><span class="brand-mark" aria-hidden="true">+</span><span>ChatGPT<span class="brand-divider">/</span>充值指南</span></a>
          <nav class="header-nav" aria-label="快捷导航">
            ${anchor(comparison, '方式对比')}${anchor(faq, '常见问题')}
            <a href="${escapeHtml(repositoryUrl)}" class="github-link" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a>
          </nav>
        </div>
      </header>
      <main>
        <div class="hero page-width">
          <div class="hero-copy">
            <div class="eyebrow"><span class="status-dot" aria-hidden="true"></span>实用指南${year ? `<span class="year-tag">${year}</span>` : ''}</div>
            <h1>${displayTitle}</h1>
            ${pageTitle && comparison ? `<p class="hero-subtitle">${escapeHtml(comparison.title)}</p>` : ''}
            <div class="hero-description">${introduction ? markdown.parser([introduction]) : ''}</div>
            <div class="hero-actions">${anchor(comparison, '查看方式对比 ↗', 'button button-primary')}${anchor(recommendation, '找到适合我的方式 →', 'button button-secondary')}</div>
          </div>
          <nav class="route-card" aria-label="四种开通方式">
            <div class="route-card-heading"><span>从你的情况开始</span><span class="route-count">${String(methods.length).padStart(2, '0')} 种方式</span></div>
            ${methods.map((section, index) => `<a href="#${escapeHtml(section.id)}" class="route-link"><span class="route-number">0${index + 1}</span><span>${escapeHtml(section.title.replace(/^方式[一二三四五六七八九十]+[：:](通过)?/, ''))}</span><span class="route-arrow" aria-hidden="true">↗</span></a>`).join('')}
            <div class="route-card-footer">对比成本 · 了解步骤 · 按需选择</div>
          </nav>
        </div>
        <div class="content-layout page-width">
          <aside class="sidebar">
            <div class="sidebar-inner"><div class="toc-heading">本页目录 <span>CONTENTS</span></div><nav class="toc" aria-label="本页目录">${toc}</nav><a class="original-link" href="${escapeHtml(repositoryUrl)}/blob/main/README.md" target="_blank" rel="noopener noreferrer">在 GitHub 查看原文 ↗</a></div>
          </aside>
          <div class="article-column" id="guide">
            <details class="mobile-toc"><summary>浏览本页目录<span aria-hidden="true">↓</span></summary><nav class="toc" aria-label="移动端目录">${toc}</nav></details>
            <div class="decision-panel"><div class="decision-heading"><span class="eyebrow">选择路径</span><span>先看看哪种方式适合你</span></div>${markdown.parser(preamble)}</div>
            <article>${article}</article>
          </div>
        </div>
      </main>
      <footer class="site-footer page-width"><span>ChatGPT / 充值指南</span><span>按需选择，从容开始。</span><a href="#top">回到顶部 ↑</a></footer>`,
  };
}
