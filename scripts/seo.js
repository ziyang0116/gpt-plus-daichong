import { escapeHtml } from './render-guide.js';

export function renderSeoTags(site) {
  const page = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${site.url}#webpage`,
    url: site.url,
    name: site.title,
    description: site.description,
    inLanguage: site.language,
  };
  const structuredData = JSON.stringify(page).replace(/</g, '\\u003c');
  const url = escapeHtml(site.url);
  const title = escapeHtml(site.title);
  const description = escapeHtml(site.description);

  return `
    <link rel="canonical" href="${url}" />
    <link rel="sitemap" type="application/xml" href="${escapeHtml(new URL('sitemap.xml', site.url).href)}" />
    <meta name="robots" content="index, follow" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:locale" content="${escapeHtml(site.locale)}" />
    <meta property="og:site_name" content="${title}" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <script type="application/ld+json">${structuredData}</script>`;
}
