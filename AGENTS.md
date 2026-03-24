# 项目协作协议

本文件是当前仓库的长期协作约定，用于统一后续与 Codex 或其他协作者配合时的工作方式、文档规则与发布流程。

目标：

- 让协作规则有固定载体，而不是只存在于聊天上下文中
- 让新开的工作窗口也能通过读取仓库文件，快速理解本项目的工作方式
- 让后续新增的规则和工作流可以继续沉淀，而不是反复口头约定

## 1. 优先级说明

规则冲突时，按以下优先级理解：

1. 用户当前轮次的明确要求
2. 本文件 `AGENTS.md`
3. `docs/` 目录中的详细文档
4. 仓库中更旧的零散说明

说明：

- `AGENTS.md` 负责收敛项目级工作约定
- `docs/` 负责展开说明具体主题
- 如果某项规则被重新约定，应优先更新本文件，再按需同步到对应文档

## 2. 当前项目目标

当前项目是“行旅派 | GoPace”的旅行规划网页，已经从单页静态工具演进为：

- 支持账号体系
- 支持 Supabase 云端保存旅行计划
- 支持行程库与归档管理
- 使用 GitHub Pages 部署
- 使用正式域名 `https://www.gopace.cn/`

当前协作重点：

- 保持功能持续迭代
- 保持 UI、信息架构和品牌风格统一
- 保持文档分类稳定、更新及时、记录准确

## 3. 文档治理规则

### 3.1 顶层分类固定

`docs/` 顶层分类固定为以下四类：

- `product`
- `development`
- `deployment`
- `backend`

原则：

- 不要再随意新增新的同级分类目录
- 不要再创建语义重叠的目录，例如 `guide`、`manual`、`notes`、`release`、`ops`
- 新增文档只能归入现有四类中的某一类
- 只有项目真的出现完全独立且长期存在的新领域时，才允许新增同级分类

如果确实需要新增同级分类，必须同时更新：

- `AGENTS.md`
- `docs/README.md`

### 3.2 当前文档职责

#### Product

- `docs/product/requirements.md`
  采用“双层结构”维护：1-13 为基线需求 `需求V1`，第 14 章用于持续追加 `需求V2 / V3 / V4 ...`
- `docs/product/changelog.md`
  统一记录所有版本变更，从 `V1` 开始持续追加
- `docs/product/release-notes.md`
  只记录正式发布版本的摘要说明

#### Development

- `docs/development/local-development.md`
  本地开发、启动、联调、排查与维护说明

#### Deployment

- `docs/deployment/github-pages.md`
  GitHub Pages、域名、HTTPS、自定义域名与部署说明
- `docs/deployment/release-workflow.md`
  发布前检查项、版本文档更新规则与半自动发布流程

#### Backend

- `docs/backend/supabase.md`
  Supabase 架构、认证、数据库初始化与配置说明
- `docs/backend/sql/001-save-trip-plan.sql`
  当前已落地的 Supabase RPC SQL 脚本

### 3.3 文档维护原则

- 文档记录必须及时、准确
- 一份文档只负责一个主题，不要把需求、部署、数据库写进同一个文件
- 需求变动要更新 `requirements.md`
- 新一轮需求沟通形成新增方向时，统一追加到 `requirements.md` 的第 14 章，不要打散到其他位置
- 只要当前这轮工作实际产生了代码、文档、配置或结构改动，就要同步更新 `changelog.md`
- 不需要用户额外提醒，更新 `changelog.md` 应视为默认动作
- 正式发布摘要才更新 `release-notes.md`
- 部署和域名变化要更新 `github-pages.md`
- Supabase 或 SQL 变化要更新 `supabase.md` 或 `docs/backend/sql/`

### 3.4 新增文档的命名规则

- Markdown 文档统一使用英文 `kebab-case` 命名
- SQL 文件统一放在 `docs/backend/sql/` 下，并使用数字前缀排序
- 如果只是补充现有主题，优先更新现有文件，而不是新增同义文档

## 4. 发布规则

### 4.1 发布前必须检查

每次准备发布时，至少检查：

1. 功能已完成并且核心流程可用
2. 页面没有明显布局错乱或关键报错
3. 本次改动没有破坏域名、Supabase、地图或部署配置
4. 需要同步的文档已经更新
5. `docs/product/changelog.md` 已记录本次变化
6. 如果属于正式发布，`docs/product/release-notes.md` 也已更新

### 4.2 版本文档边界

- `changelog.md`
  用于持续记录所有版本变化
- `release-notes.md`
  用于正式发布的摘要与整理

规则：

- 不要再把版本记录写回 `requirements.md`
- 只要这一轮工作形成了实际改动，无论大小，都要更新 `changelog.md`
- 日常小修复通常只更新 `changelog.md`
- 正式上线版本应同时更新 `changelog.md` 和 `release-notes.md`

### 4.3 半自动发布流程

以后当用户说：

```text
发布当前版本
```

默认执行流程：

1. 盘点当前代码和文档改动
2. 提炼本次版本主题与核心变化
3. 无论是否发布，都先更新 `docs/product/changelog.md`
4. 如果属于正式发布，再更新 `docs/product/release-notes.md`
5. 检查是否需要同步更新部署、后端或需求文档
6. 按要求提交 commit
7. 经确认后推送到远端并触发部署

说明：

- 当前仓库只有 GitHub Pages 部署工作流
- 当前没有“自动生成 changelog / release notes”的 GitHub Action
- 因此发布文档维护方式仍然是“人工触发 + Codex 协助整理”
- 当前仓库新增了可执行脚本 `scripts/release-workflow.js`
- 日常校验可使用 `npm run docs:guard`
- 正式发布校验可使用 `npm run release:guard`
- 创建新的发布模板可使用 `npm run release:prepare -- --version Vxx --date YYYY-MM-DD --commit <hash>`

## 5. 协作执行规则

### 5.1 处理改动前

- 先查看相关文件和上下文，不要凭印象直接改
- 如果是较大改动，先明确受影响的页面、配置和文档
- 改动涉及产品结构时，同时考虑文档是否需要同步更新

### 5.2 处理改动时

- 尽量复用现有结构、现有命名和现有视觉风格
- 不要为了“看起来整洁”随意重命名大量文件，除非这是明确任务目标
- 不要新增重复能力、重复文档或重复配置入口

### 5.3 处理改动后

- 说明这次改了什么
- 说明是否做了检查
- 说明是否还未提交或未推送
- 如果改动影响文档规则、发布流程或协作方式，要同步更新本文件

## 6. 后续新增规则的写法

以后如果你又形成了新的习惯、规范或工作流，直接继续追加到本文件即可。

建议新增时使用下面的格式：

```md
## X. 新规则名称

适用范围：

- 

规则内容：

- 

执行方式：

1. 
2. 

需要同步更新的文档：

- 
```

如果是新增“固定工作流”，建议写成：

```md
## X. 某某工作流

触发口令：

一句你常用的话

默认执行步骤：

1. 
2. 
3. 
```
## 7. 当前推荐入口

协作者进入项目后，建议优先查看：

1. `AGENTS.md`
2. `docs/README.md`
3. 与当前任务最相关的专项文档

这三层组合的作用分别是：

- `AGENTS.md`
  负责理解项目级规则
- `docs/README.md`
  负责理解文档结构
- 具体专项文档
  负责执行某类工作时的细节
