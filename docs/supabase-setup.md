# 行旅派 GoPace：Supabase 接入方案

## 1. 推荐后端架构

结合当前项目现状：

- 前端是静态页面
- 当前部署在 GitHub Pages
- 现阶段优先目标是注册、登录、云端保存旅行计划

推荐第一阶段采用“前端直连 Supabase”的轻后端架构：

- 前端：GitHub Pages 静态站点
- 认证：Supabase Auth
- 数据库：Supabase Postgres
- 文件：Supabase Storage
- 后续协作：Supabase Realtime
- 后续复杂服务端逻辑：Supabase Edge Functions

这意味着第一阶段暂时不需要自建 Node.js 后端服务。

## 2. 为什么这套方案适合当前项目

- 你现在的站点本身就是纯静态网页，接入 Supabase 成本最低
- 注册、登录、会话管理可以直接用官方能力
- 数据库存储和权限控制可以通过 RLS 直接完成
- 更适合先快速完成“个人账号 + 云端保存旅行计划”
- 后续多人协作变复杂后，再增加 Edge Functions

## 3. 首版数据模型

为兼容当前前端 `localStorage` 中的整份规划数据，首版建议使用“主表元数据 + snapshot 快照 JSON”的模式。

### 3.1 表结构概览

- `profiles`
  - 用户资料表
- `trip_plans`
  - 旅行计划主表
- `plan_members`
  - 协作成员表，先建表，后续启用

### 3.2 设计原则

- `trip_plans.snapshot` 用 `jsonb` 保存当前整份前端规划数据
- 这样可以最快把现有页面保存到云端
- 后续再逐步拆分成更细的表结构

## 4. Supabase 控制台操作步骤

### 4.1 创建项目

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建一个新的 Project
3. 记录项目所在区域、项目 URL、`anon key`

后面前端只会用到：

- `Project URL`
- `anon/public key`

不要把 `service_role key` 放到前端。

### 4.2 开启邮箱密码登录

在 Supabase 控制台中：

1. 打开 `Authentication`
2. 找到 `Providers`
3. 确认 `Email` 已启用
4. 保持 `Email + Password` 登录方式可用

建议：

- 开发阶段可以先保留邮箱确认
- 如果你想更快测试，也可以临时关闭邮箱确认
- 正式环境建议开启邮箱确认

### 4.3 配置站点地址与跳转地址

在 `Authentication` 的 URL 配置里，建议先配置这些地址：

`Site URL`

- 开发阶段先填：`http://travel-planner.localhost:8080`

`Redirect URLs`

- `http://travel-planner.localhost:8080`
- `http://travel-planner.localhost:8080/`
- `https://wangtz1517.github.io/travel-planner-web`
- `https://wangtz1517.github.io/travel-planner-web/`
- `https://gopace.cn`
- `https://gopace.cn/`
- `https://www.gopace.cn`
- `https://www.gopace.cn/`

建议：

- 正式环境的 `Site URL` 建议设置为 `https://www.gopace.cn`
- 本地调试不要删掉 `http://travel-planner.localhost:8080` 和 `http://travel-planner.localhost:8080/`
- 如果后续给裸域 `gopace.cn` 做了跳转，可以继续把它保留在 `Redirect URLs`

### 4.4 配置发信

Supabase 官方文档说明，平台自带默认发信服务更适合试用，正式环境建议配置自定义 SMTP。

建议分两步：

- 现在先用默认邮件服务把功能跑通
- 正式上线前再接企业邮箱或第三方 SMTP

## 5. SQL 初始化脚本

在 Supabase 的 SQL Editor 中执行以下脚本。

```sql
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trip_plans (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  title text not null default '未命名旅行',
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  start_date date,
  end_date date,
  travelers integer not null default 1 check (travelers > 0),
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table if not exists public.plan_members (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.trip_plans (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'editor' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  unique (plan_id, user_id)
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

drop trigger if exists set_trip_plans_updated_at on public.trip_plans;
create trigger set_trip_plans_updated_at
before update on public.trip_plans
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.trip_plans enable row level security;
alter table public.plan_members enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "trip_plans_select_own" on public.trip_plans;
drop policy if exists "trip_plans_select_own_or_member" on public.trip_plans;
create policy "trip_plans_select_own"
on public.trip_plans
for select
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "trip_plans_insert_own" on public.trip_plans;
create policy "trip_plans_insert_own"
on public.trip_plans
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

drop policy if exists "trip_plans_update_owner" on public.trip_plans;
create policy "trip_plans_update_owner"
on public.trip_plans
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

drop policy if exists "trip_plans_delete_owner" on public.trip_plans;
create policy "trip_plans_delete_owner"
on public.trip_plans
for delete
to authenticated
using ((select auth.uid()) = owner_id);

drop policy if exists "plan_members_select_related" on public.plan_members;
drop policy if exists "plan_members_select_own" on public.plan_members;
create policy "plan_members_select_related"
on public.plan_members
for select
to authenticated
using (user_id = (select auth.uid()));
```

## 6. 前端配置建议

你当前项目已经有 `assets/js/config.js` 机制，所以后面接 Supabase 时建议直接扩展这个配置对象。

建议新增字段：

```js
window.APP_CONFIG = {
  amapKey: "",
  amapSecurityJsCode: "",
  defaultCity: "全国",
  supabaseUrl: "https://YOUR_PROJECT.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

## 7. 前端接入顺序建议

### 第一步

先把 Supabase JS 客户端接进项目。

如果继续保持纯静态页面，可以先走 CDN 方式。

### 第二步

完成这些认证动作：

- 注册
- 登录
- 退出登录
- 获取当前用户
- 监听登录态变化

### 第三步

完成这些计划管理动作：

- 新建旅行计划
- 保存当前规划到 `trip_plans`
- 获取我的旅行计划列表
- 打开某个计划并恢复到页面 state
- 归档计划

## 8. 当前阶段的落地建议

第一阶段先做到这些就够：

1. 用户注册
2. 用户登录
3. 首页显示当前用户信息
4. 当前规划保存到云端
5. 我的计划列表
6. 点击计划恢复编辑

这些能力跑通后，再做：

- 菜单栏切页
- 分享
- 协作成员
- Realtime
- Edge Functions

## 9. 后续什么时候需要自建服务端

当你开始做下面这些能力时，再考虑额外的服务端层会更合适：

- 更复杂的权限体系
- 审计日志
- 分享口令与更细粒度的访问控制
- 后台管理
- 对第三方服务做私密签名
- 复杂聚合统计

在那之前，Supabase 本身就足够支撑当前阶段产品。
