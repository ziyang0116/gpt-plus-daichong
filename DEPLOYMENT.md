# 网站开发与 GitHub Pages 部署

README.md 保持原样，并作为网站正文的唯一内容来源。Vite 在开发和构建时将它生成完整 HTML；表格、链接、流程图和常见问题都会保留。

## 本地开发

使用 Node.js 22.12 或以上版本：

```bash
npm ci
npm run dev
```

打开终端显示的地址。修改 README.md 会刷新网页；网页标题在 `vite.config.js` 中单独配置，README 标题保持原样。页面样式在 `src/style.css`，交互在 `src/main.js`，内容生成在 `scripts/render-guide.js`。

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
