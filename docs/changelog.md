# Changelog

## V13

- 网站升级为三页结构：`首页 / 行程库 / 功能页`。
- 接入品牌 Logo 与统一配色，首页与导航完成第一轮视觉收口。
- 完成基础账号体系骨架和 Supabase 接入准备。

## V14

- 完成注册、登录、邮箱确认与云端计划保存链路。
- 首页升级为概览页，增加当前计划焦点区与最近计划列表。
- 行程库升级为更完整的计划管理页，支持筛选、排序、归档与复制。

## V15

- 首页新增中国足迹地图，已归档行程会点亮省份并标记城市。
- 足迹地图支持城市悬停提示、省份点击联动和右侧城市详情面板。
- 新增旅行热力排名，并补充省份 hover 高亮动画与交互反馈。

## V16

- 云端保存链路改为通过 `save_trip_plan` RPC 执行，明确返回单条计划记录。
- 修复本地残留 `currentPlanId` 导致“新建计划误走更新”以及 `Plan not found or no permission to update` 的问题。
- 新增 [supabase-save-trip-plan.sql](/C:/Users/23326/Desktop/BaiduSyncdisk/Codex/旅行规划网页/docs/supabase-save-trip-plan.sql)，用于在 Supabase 中创建稳定的保存函数。
