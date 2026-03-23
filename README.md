# Travel Planner Web

一个基于原生 HTML、CSS、JavaScript 的静态旅行规划网页，用于整理多日行程、候选地点、地图路线预览和 PDF 导出。

## 本地运行

推荐使用 Node 启动本地静态服务器。

PowerShell:

```powershell
npm.cmd run dev
```

CMD:

```bat
npm run dev
```

默认访问地址：

```text
http://127.0.0.1:8080
```

其他常用命令：

```powershell
npm.cmd run start
npm.cmd run dev:lan
npm.cmd run dev:8081
```

## 目录结构

```text
.
├─ index.html
├─ package.json
├─ README.md
├─ assets/
│  ├─ css/main.css
│  ├─ icons/favicon.svg
│  └─ js/
│     ├─ app.js
│     ├─ config.js
│     └─ config.example.js
├─ docs/
│  ├─ deploy-github-pages.md
│  ├─ requirements.md
│  └─ setup.md
└─ scripts/
   ├─ server.js
   ├─ serve.cmd
   └─ serve.ps1
```

## 配置说明

- `assets/js/config.js`：默认公开配置文件，仓库中只保留占位值
- `assets/js/config.example.js`：配置示例
- 发布到 GitHub Pages 时，工作流会根据仓库 Secrets 生成线上使用的 `config.js`

当前项目的地图能力依赖高德 Web 端 JS API。站点一旦公开，前端配置天然可被访问者看到，所以请务必在高德后台配置域名白名单，不要使用无限制 Key。

## GitHub Pages 发布

仓库已支持使用 GitHub Actions 自动发布到 GitHub Pages。

你需要在 GitHub 仓库设置中添加这些 Secrets / Variables：

- Secret: `AMAP_KEY`
- Secret: `AMAP_SECURITY_JS_CODE`
- Variable: `AMAP_DEFAULT_CITY`，例如 `上海`

更完整的发布步骤见 [docs/deploy-github-pages.md](/C:/Users/23326/Desktop/BaiduSyncdisk/Codex/旅行规划网页/docs/deploy-github-pages.md)。
