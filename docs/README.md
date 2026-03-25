# 文档索引

本目录用于统一存放项目的产品、开发、部署与后端集成文档。后续新增文档请优先归类到现有目录，避免继续把不同主题平铺在 `docs/` 根目录。

## 目录结构

- `docs/product/requirements.md`
  产品目标、需求范围、功能规划与阶段路线图；其中 1-13 为基线需求 `需求V1`，第 14 章用于持续追加后续需求版本
- `docs/product/changelog.md`
  按版本记录功能迭代、修复与重要调整
- `docs/product/release-notes.md`
  面向发布的版本说明、上线摘要与版本重点
- `docs/development/local-development.md`
  本地开发、启动、维护与常见排查
- `docs/development/project-architecture.md`
  当前版本的代码结构、模块边界、文件关系图与系统关系图
- `docs/deployment/github-pages.md`
  GitHub Pages、域名、自定义域名与上线流程
- `docs/deployment/release-workflow.md`
  发布前检查项、版本文档更新规则与半自动发布流程
- `docs/backend/supabase.md`
  Supabase 架构、Auth、数据库初始化与接入说明
- `docs/backend/sql/001-save-trip-plan.sql`
  云端保存旅行计划所需的 Supabase RPC SQL 脚本

## 命名规范

- Markdown 文档统一使用英文 `kebab-case` 命名
- SQL 文件统一放在 `docs/backend/sql/` 下，并使用数字前缀排序，例如 `001-save-trip-plan.sql`
- 一份文档只负责一个主题，避免把“需求、部署、运维、数据库”写在同一个文件里
- 目录名统一使用英文小写单词，必要时使用复数或语义明确的分类名

## 维护规则

- 需求、产品方向、阶段规划变化：写入 `docs/product/requirements.md`
- 已完成功能与版本变更：写入 `docs/product/changelog.md`
- 只要当前工作实际产生改动，就同步更新 `docs/product/changelog.md`
- 正式发布摘要：写入 `docs/product/release-notes.md`
- 本地开发流程或排查说明变化：写入 `docs/development/local-development.md`
- 项目架构、文件职责、模块边界变化：写入 `docs/development/project-architecture.md`
- GitHub Pages、域名、部署流程变化：写入 `docs/deployment/github-pages.md`
- 发布清单、发布步骤与版本文档流程变化：写入 `docs/deployment/release-workflow.md`
- Supabase、数据库结构、SQL 变更：写入 `docs/backend/supabase.md` 或 `docs/backend/sql/`

## 新增文档的处理方式

- 优先判断它属于 `product`、`development`、`deployment`、`backend` 中的哪一类
- 如果属于现有分类，直接放入对应目录，不要新增同义文档
- 原则上不再新增新的同级分类目录，后续新增内容只允许归入现有四类中的某一类
- 只有当项目出现完全独立且长期存在的新领域时，才允许新增同级分类，并且需要同步更新 `AGENTS.md` 与本文件
- 每新增一份长期有效的文档，都同步补充到本文件，保证这里始终是唯一入口

## 分类冻结规则

- 当前 `docs/` 的顶层分类固定为：`product`、`development`、`deployment`、`backend`
- 不要再随意新增与现有分类语义重叠的新目录，例如 `guide`、`manual`、`notes`、`release`、`ops`
- 如果只是新增某一类内容，请直接在对应目录下新增文件，或优先补充已有文档
- 如果一份内容只是临时记录，不适合作为长期文档，应先整理后再决定是否纳入 `docs/`

## 发布文档规则

- 只要当前一轮工作实际产生改动，就先更新 `docs/product/changelog.md`
- 每次正式版本发布时，在更新 `docs/product/changelog.md` 的基础上，再更新 `docs/product/release-notes.md`
- 需要对外整理版本摘要时，再同步更新 `docs/product/release-notes.md`
- `docs/product/release-notes.md` 当前不是自动生成文件，而是手工维护文档
- 当前仓库只有页面部署工作流，不包含“发布后自动更新 Release Notes”的独立 CI 机制

## 当前正式地址

- `https://www.gopace.cn/`
