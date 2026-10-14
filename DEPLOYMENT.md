# 网站开发与 GitHub Pages 部署

README.md 保持原样，并作为网站正文的唯一内容来源。Vite 在开发和构建时将它生成完整 HTML；表格、链接、流程图和常见问题都会保留。

## 本地开发

使用 Node.js 22.12 或以上版本：

```bash
npm ci
npm run dev
```

打开终端显示的地址。修改 README.md 会刷新网页；网页标题、SEO 描述和正式网址在 `site.config.js` 中配置，README 标题保持原样。页面样式在 `src/style.css`，交互在 `src/main.js`，内容生成在 `scripts/render-guide.js`。

## 构建与预览

```bash
npm test
npm run build
npm run preview
```

网站产物位于 `dist/`。正文在构建时生成，JavaScript 用于流程图、目录状态和阅读进度。资源使用相对路径，可部署到 GitHub Pages 的仓库子路径或自定义域名。

## 发布到 GitHub Pages

1. 将新增文件提交并推送到 GitHub 仓库的 `main` 分支。
2. 打开仓库 **Settings → Pages → Build and deployment**，将 **Source** 设为 **GitHub Actions**。
3. 打开 **Actions → Deploy to GitHub Pages**，点击 **Run workflow** 启动首次部署。如果推送时已启用 Pages，则工作流会自动运行。
4. 工作流成功后，访问：

   <https://ziyang0116.github.io/gpt-plus-daichong/>

此后每次推送到 `main` 都会自动重新发布。Pull request 只运行内容测试和构建。工作流使用 GitHub 自动提供的 `GITHUB_TOKEN`，无需额外配置部署密钥。

若首次部署提示 Pages 未启用，先完成第 2 步，再重新运行工作流。Fork 到其他仓库后，站点地址改为 `https://<用户名>.github.io/<仓库名>/`；仓库原文链接可通过 `renderGuide` 的第二个参数调整。

配置依据：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[Vite 静态部署指南](https://vite.dev/guide/static-deploy.html#github-pages)。

## SEO 与 Google Search Console

构建产物包含 canonical、搜索描述、Open Graph / Twitter 分享元信息和 WebPage JSON-LD。正文仍在构建时生成，无需运行 JavaScript 即可读取。

`public/sitemap.xml` 只列出正式首页，不包含章节锚点、Google 验证文件或静态资源。发布后，在 Search Console 中选择本网站的网址前缀资源，在「站点地图」提交 `sitemap.xml`，完整地址为：

<https://ziyang0116.github.io/gpt-plus-daichong/sitemap.xml>

`public/robots.txt` 会原样发布。Google 只读取域名根目录的 `https://ziyang0116.github.io/robots.txt`，不会读取项目子目录的 `/gpt-plus-daichong/robots.txt`。要让 robots 规则生效，需将这个文件部署到 `ziyang0116.github.io` 用户站点仓库的发布根目录，或将当前网站部署到独立域名的根目录。根目录 robots 返回 404 时，Google 默认没有抓取限制；当前项目可直接通过 Search Console 提交 sitemap。

更换域名或 Fork 后，应同时更新 `site.config.js`、`public/sitemap.xml` 和 `public/robots.txt` 中的正式地址。新增独立页面时将其正式地址加入 sitemap；不要把每次构建时间当作内容更新时间。

Google 验证文件放在 `public/` 中，保留原始文件名和内容，随每次部署发布。

依据：[Google robots.txt 规则与位置](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec)、[构建及提交 sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)、[canonical 配置](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)。
