alter table public.profiles
  add column if not exists place_library_snapshot jsonb not null default '[]'::jsonb;

comment on column public.profiles.place_library_snapshot is
  '账号级地点库云端快照，用于地点库登录后自动回读与同步';

update public.profiles
set place_library_snapshot = '[]'::jsonb
where place_library_snapshot is null;
