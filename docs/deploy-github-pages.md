# GitHub Pages 发布说明

这份项目可以直接作为静态站点发布到 GitHub Pages。

## 1. 推送代码到 GitHub 仓库

推荐仓库名示例：

- `travel-planner-web`

分支建议使用：

- `main`

项目里已经包含 GitHub Pages 的工作流文件：

- `.github/workflows/deploy-pages.yml`

## 2. 在 GitHub 仓库中配置高德参数

打开仓库页面后，进入：

- `Settings` -> `Secrets and variables` -> `Actions`

添加以下内容：

### Secrets

- `AMAP_KEY`
- `AMAP_SECURITY_JS_CODE`

### Variables

- `AMAP_DEFAULT_CITY`

变量示例：

```text
上海
```

说明：

- `AMAP_KEY` 和 `AMAP_SECURITY_JS_CODE` 会在部署时写入发布包里的 `assets/js/config.js`
- 仓库里的 `assets/js/config.js` 只保留空占位，不再保存真实值

## 3. 开启 GitHub Pages

进入：

- `Settings` -> `Pages`

在 `Build and deployment` 中选择：

- `Source`: `GitHub Actions`

## 4. 触发部署

满足以下任一条件就会自动部署：

- 向 `main` 分支推送代码
- 手动运行 `Deploy to GitHub Pages` 工作流

首次部署成功后，GitHub 会生成站点地址，常见形式是：

```text
https://<你的用户名>.github.io/<仓库名>/
```

## 5. 高德 Key 的注意事项

即使通过 GitHub Secrets 注入，最终生成的前端 `config.js` 仍然会出现在公开网页里，所以这不是“隐藏密钥”，只是避免把真实值直接提交进仓库历史。

你还需要在高德开放平台做两件事：

1. 给 Key 配置允许访问的域名白名单
2. 不要把无限制 Key 用在公开网站上

如果你的 Pages 域名是：

```text
https://yourname.github.io/travel-planner-web/
```

通常需要把类似下面的域名加入白名单：

```text
yourname.github.io
```

具体以高德控制台要求为准。

## 6. 当前项目上线后的行为

- 网站是公开可访问的
- 每个用户的数据保存在各自浏览器的 `localStorage`
- 你和朋友之间不会自动共享同一份旅行数据
- 如果清浏览器缓存，本地保存的数据可能丢失

## 7. 后续如果要升级

如果后面你想做这些能力：

- 多人共享同一份行程
- 登录账号
- 云端保存
- 更安全地管理地图接口

那就需要再加后端，不再只是静态托管。
