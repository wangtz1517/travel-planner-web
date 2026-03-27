alter table public.profiles
  add column if not exists place_library_synced_at timestamptz not null default now();

comment on column public.profiles.place_library_synced_at is
  '账号级地点库最近一次成功写入云端的时间';

update public.profiles
set place_library_synced_at = coalesce(place_library_synced_at, updated_at, now())
where place_library_synced_at is null;
