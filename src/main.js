import './style.css';

const diagrams = [...document.querySelectorAll('.mermaid')];
if (diagrams.length) {
  const sources = diagrams.map((node) => node.textContent);
  import('@mermaid-js/tiny/dist/mermaid.tiny.js?url').then(async ({ default: sourceUrl }) => {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = sourceUrl;
      script.onload = resolve;
      script.onerror = reject;
      document.head.append(script);
    });
    const mermaid = globalThis.mermaid;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      layout: 'dagre',
      theme: 'base',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      themeVariables: {
        primaryColor: '#eef2ff',
        primaryTextColor: '#243454',
        primaryBorderColor: '#a3b3d9',
        lineColor: '#7c8caf',
        secondaryColor: '#f3f5fa',
        tertiaryColor: '#f3f5fa',
        edgeLabelBackground: '#ffffff',
        fontSize: '14px',
      },
      flowchart: { curve: 'basis', padding: 18, useMaxWidth: true },
    });
    await mermaid.run({ nodes: diagrams });
    diagrams.forEach((node) => node.classList.add('is-rendered'));
  }).catch((error) => {
    diagrams.forEach((node, index) => { node.textContent = sources[index]; });
    console.error('流程图加载失败，已保留文字内容。', error);
  });
}

const links = [...document.querySelectorAll('.sidebar .toc a')];
const sections = [...document.querySelectorAll('.guide-section')];
const progress = document.querySelector('.reading-progress');
let scheduled = false;

function updateReadingPosition() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${scrollableHeight > 0 ? Math.min(1, window.scrollY / scrollableHeight) : 0})`;
  const activeSection = sections.findLast((section) => section.getBoundingClientRect().top <= 150);
  for (const link of links) {
    const active = activeSection && link.getAttribute('href') === `#${activeSection.id}`;
    if (active) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  scheduled = false;
}

function scheduleUpdate() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(updateReadingPosition);
}

window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
updateReadingPosition();

document.querySelectorAll('.mobile-toc a').forEach((link) => {
  link.addEventListener('click', () => { link.closest('details').open = false; });
});
