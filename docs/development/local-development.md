# 本地开发与维护指南

这份说明主要用于以后继续维护这个网页时快速查看，避免忘记本地启动和预览方式。

## 1. 本地维护的正确流程

以后如果要在本地修改这个网站，请按下面顺序操作：

1. 在项目目录打开终端
2. 启动本地静态服务器
3. 用浏览器访问本地地址
4. 修改代码并刷新页面查看效果
5. 确认没问题后，再决定是否提交和发布

项目目录：

```text
C:\Users\23326\Desktop\BaiduSyncdisk\Codex\旅行规划网页
```

## 2. 启动本地服务器

在项目根目录执行：

```powershell
npm.cmd run dev
```

如果启动成功，终端通常会显示类似内容：

```text
Static server running at http://127.0.0.1:8080
Project root: C:\Users\23326\Desktop\BaiduSyncdisk\Codex\旅行规划网页
```

注意：

- 这个终端窗口不要关闭
- 关闭后，本地网页就无法访问了

## 3. 本地预览地址

本地维护时，推荐在浏览器打开：

```text
http://travel-planner.localhost:8080
```

这是当前高德白名单允许的本地访问地址。

线上正式地址是：

```text
https://www.gopace.cn/
```

## 4. 不要直接打开 index.html

不要再直接双击 `index.html`，也不要使用这种地址：

```text
file:///C:/.../index.html
```

原因：

- 直接打开本地文件只能看部分静态界面
- 高德地图、地点搜索、路线服务等功能可能失效
- 白名单校验也不会按正常网页域名工作

也就是说：

- 直接打开 `index.html` 只能勉强看 UI
- 真正测试功能，必须先启动本地服务器

## 5. 常用维护文件

### 页面结构

- `index.html`

### 样式

- `assets/css/main.css`

### 交互逻辑

- `assets/js/app.js`

### 本地高德配置

- `assets/js/config.js`

### 文档入口

- `docs/README.md`
- `docs/product/requirements.md`
- `docs/product/changelog.md`
- `docs/product/release-notes.md`
- `docs/development/local-development.md`
- `docs/deployment/github-pages.md`
- `docs/backend/supabase.md`

## 6. 如果本地地图或搜索失效

优先检查下面几项：

1. 是否已经执行了：

```powershell
npm.cmd run dev
```

2. 浏览器访问的是否是：

```text
http://travel-planner.localhost:8080
```

3. 是否误用了直接打开 `index.html`

4. `assets/js/config.js` 里的高德 Key 和 `securityJsCode` 是否存在

## 7. 停止本地服务器

回到启动服务器的终端窗口，按：

```text
Ctrl + C
```

即可停止本地服务。

## 8. 修改完成后如果要发布

如果本地修改确认没问题，需要发布到线上，一般流程是：

```powershell
& 'C:\Program Files\Git\cmd\git.exe' add .
& 'C:\Program Files\Git\cmd\git.exe' commit -m "你的更新说明"
& 'C:\Program Files\Git\cmd\git.exe' push
```

推送后，GitHub Pages 会自动重新部署。
