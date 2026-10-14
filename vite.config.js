import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { renderGuide } from './scripts/render-guide.js';
import { renderSeoTags } from './scripts/seo.js';
import { siteConfig } from './site.config.js';

const readmePath = fileURLToPath(new URL('./README.md', import.meta.url));

export default defineConfig({
  // Relative assets work on both a repository Pages URL and a custom domain.
  base: './',
  plugins: [{
    name: 'readme-guide',
    transformIndexHtml: {
      order: 'pre',
      handler(html) {
        const guide = renderGuide(readFileSync(readmePath, 'utf8'), undefined, {
          title: siteConfig.title,
          description: siteConfig.description,
        });
        return html
          .replace('<!-- GUIDE_TITLE -->', () => guide.title)
          .replace('<!-- GUIDE_DESCRIPTION -->', () => guide.description)
          .replace('<!-- GUIDE_SEO -->', () => renderSeoTags(siteConfig))
          .replace('<!-- GUIDE_PAGE -->', () => guide.html);
      },
    },
    configureServer(server) {
      server.watcher.add(readmePath);
      server.watcher.on('change', (path) => {
        if (path === readmePath) server.ws.send({ type: 'full-reload' });
      });
    },
  }],
});
