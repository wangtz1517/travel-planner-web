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

### 5.0 2026-03-27 追加说明：地点库改为登录后云端权威模式

- 当前实现已从“本地与云端混合同步”调整为“游客模式本地、登录模式云端权威”。
- 游客模式下，地点库仍保存在当前浏览器，用于未登录时的临时收藏和体验。
- 登录后，前端会先读取 `profiles.place_library_snapshot`，并将其作为当前账号地点库的主数据源。
- 当前浏览器里的游客地点库只会对同一账号做一次性并入，避免每次登录都再次拿游客缓存覆盖云端。
- 登录后的地点新增、删除、改分类会直接写回 `profiles.place_library_snapshot`，并同步更新 `profiles.place_library_synced_at`，用于前端展示最近一次云端写入时间。
- 数据库需要依次执行：
  - `docs/backend/sql/002-profile-place-library.sql`
  - `docs/backend/sql/003-profile-place-library-sync.sql`

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

补充说明：

- 旅行计划云端保存的 RPC 脚本单独维护在 `docs/backend/sql/001-save-trip-plan.sql`
- 后续如果新增数据库函数或迁移脚本，也统一放到 `docs/backend/sql/` 目录下

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

## 10. 地点库云端同步补充（2026-03-27）

- `profiles.place_library_snapshot` 用于存放账号级地点库云端快照，字段类型为 `jsonb`，默认值为空数组。
- 前端登录后会先读取当前账号的 `place_library_snapshot`，再与本地地点库合并，避免覆盖用户已收藏的地点。
- 登录前已在本地加入的地点，会在登录后自动并入当前账号的云端地点库，后续在同一账号下重新登录仍可直接看到。
- 地点库中的新增、删除和分类调整会直接回写到 `profiles.place_library_snapshot`，不再只停留在本地 `localStorage`。
- 上线前需要先在 Supabase SQL Editor 执行 `docs/backend/sql/002-profile-place-library.sql`。

## 11. 好友中心后端预留（2026-03-27）

当前好友能力首轮先以前端本地持久化验证加好友、私信和行程分享链路，后续如果要升级为跨设备可用的正式能力，建议在 Supabase 中拆成下面几组表，而不是继续塞进 `profiles` 的大字段快照里。

### 11.1 建议表结构

#### A. `friend_requests`

- 用途：
  - 存放好友申请
- 核心字段建议：
  - `id uuid primary key`
  - `sender_id uuid not null references public.profiles(id)`
  - `receiver_id uuid not null references public.profiles(id)`
  - `message text default ''`
  - `status text not null default 'pending'`
  - `created_at timestamptz not null default now()`
  - `updated_at timestamptz not null default now()`
- 约束建议：
  - 同一对用户在 `pending` 状态下只允许一条有效申请

#### B. `friendships`

- 用途：
  - 存放已经建立的好友关系
- 核心字段建议：
  - `id uuid primary key`
  - `user_a uuid not null references public.profiles(id)`
  - `user_b uuid not null references public.profiles(id)`
  - `created_at timestamptz not null default now()`
- 约束建议：
  - `user_a <> user_b`
  - 通过排序后的唯一索引保证一对好友只存在一条关系记录

#### C. `direct_threads`

- 用途：
  - 存放一对一私信会话
- 核心字段建议：
  - `id uuid primary key`
  - `user_a uuid not null references public.profiles(id)`
  - `user_b uuid not null references public.profiles(id)`
  - `last_message_at timestamptz`
  - `created_at timestamptz not null default now()`
- 约束建议：
  - 使用排序后的唯一索引防止同一对用户重复建线程

#### D. `direct_messages`

- 用途：
  - 存放私信消息
- 核心字段建议：
  - `id uuid primary key`
  - `thread_id uuid not null references public.direct_threads(id) on delete cascade`
  - `sender_id uuid references public.profiles(id)`
  - `message_type text not null default 'text'`
  - `body text default ''`
  - `plan_id uuid references public.trip_plans(id)`
  - `plan_title_snapshot text default ''`
  - `created_at timestamptz not null default now()`
- 说明：
  - `message_type` 首轮至少支持 `text / system / share`
  - `plan_title_snapshot` 用于保存分享当时的标题，避免后续计划改名影响历史消息

#### E. `plan_shares`

- 用途：
  - 单独沉淀分享动态，便于个人页直接汇总展示
- 核心字段建议：
  - `id uuid primary key`
  - `sender_id uuid not null references public.profiles(id)`
  - `receiver_id uuid not null references public.profiles(id)`
  - `plan_id uuid references public.trip_plans(id)`
  - `plan_title_snapshot text not null`
  - `note text default ''`
  - `created_at timestamptz not null default now()`

### 11.2 RLS 建议

- `friend_requests`
  - 只有发送方和接收方可以读取
  - 只有发送方可以创建
  - 只有接收方可以把状态改为 `accepted / declined`
- `friendships`
  - 只有关系双方可以读取
  - 只允许通过受控函数或服务端逻辑创建，不建议前端直接 `insert`
- `direct_threads`
  - 只有线程双方可以读取
- `direct_messages`
  - 只有线程双方可以读取
  - 只有线程参与者可以发送消息
- `plan_shares`
  - 只有发送方和接收方可以读取

### 11.3 建议落地顺序

1. 先落 `friend_requests` 和 `friendships`，打通正式好友关系。
2. 再落 `direct_threads` 和 `direct_messages`，把本地私信升级成账号级云端会话。
3. 最后落 `plan_shares`，用于个人页分享动态和后续分享通知。

### 11.4 与现有 `trip_plans` 的关系

- 好友分享默认只引用已有 `trip_plans.id`，不复制完整计划内容。
- 如果后续需要“对方可查看但不可编辑”的分享页，再额外补公开分享令牌或只读快照表。
- 如果后续需要协作编辑，应继续复用现有 `plan_members` 方向，而不是把私信分享直接升级成协作关系。
