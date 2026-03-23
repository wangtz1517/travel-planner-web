# 本地开发与维护说明

## 1. 推荐启动方式

在项目根目录执行：

```powershell
npm.cmd run dev
```

默认地址：

```text
http://127.0.0.1:8080
```

如果你希望局域网内其他设备访问：

```powershell
npm.cmd run dev:lan
```

如果 `8080` 端口被占用：

```powershell
npm.cmd run dev:8081
```

## 2. 备用启动方式

如果不想通过 npm，也可以直接运行：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1
```

或：

```bat
.\scripts\serve.cmd
```

## 3. 如何停止本地服务器

本地服务器启动后会持续占用当前终端。

停止方式：

1. 回到启动服务器的终端窗口
2. 按 `Ctrl + C`
3. 看到停止提示后即可关闭窗口

## 4. 日常维护方式

### 修改页面结构

编辑：

- `index.html`

### 修改样式

编辑：

- `assets/css/main.css`

### 修改交互逻辑

编辑：

- `assets/js/app.js`

### 修改地图配置

编辑：

- `assets/js/config.js`

建议保留一份示例模板：

- `assets/js/config.example.js`

## 5. 常见维护操作

### 修改默认端口

临时修改：

```powershell
node .\scripts\server.js --port 8090
```

### 修改监听地址

仅本机访问：

```powershell
node .\scripts\server.js --host 127.0.0.1
```

局域网访问：

```powershell
node .\scripts\server.js --host 0.0.0.0
```

### 检查 Node 是否可用

```powershell
node -v
npm -v
```

## 6. 常见问题

### 端口占用

现象：

- 启动时报端口被占用

处理：

- 换端口启动，例如 `npm run dev:8081`

### PowerShell 无法直接运行 npm

现象：

- 报错 `npm.ps1` 被系统执行策略阻止

处理：

- 改用 `npm.cmd run dev`
- 或改用 `powershell -ExecutionPolicy Bypass -File .\scripts\serve.ps1`

### 修改后页面没变化

处理：

- 强制刷新浏览器
- 确认编辑的是当前项目目录下的文件

### 地图不显示

处理：

- 检查 `assets/js/config.js` 中的高德 Key 和安全密钥
- 确认当前访问域名或本地环境符合高德配置要求

## 7. 建议的维护习惯

- 每次较大改动前先备份或提交一次版本
- 尽量把样式、交互、配置分别维护在不同文件
- 新增资源统一放到 `assets/` 目录下
- 新增说明文档统一放到 `docs/` 目录下
