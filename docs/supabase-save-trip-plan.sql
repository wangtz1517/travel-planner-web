create or replace function public.save_trip_plan(
  plan_id uuid default null,
  title text default null,
  status text default 'active',
  start_date date default null,
  end_date date default null,
  travelers integer default 1,
  snapshot jsonb default '{}'::jsonb,
  archived_at timestamptz default null,
  new_plan_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid;
  saved_row public.trip_plans;
begin
  current_user_id := auth.uid();

  if current_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if plan_id is null then
    insert into public.trip_plans (
      id,
      owner_id,
      title,
      status,
      start_date,
      end_date,
      travelers,
      snapshot,
      archived_at
    )
    values (
      coalesce(new_plan_id, gen_random_uuid()),
      current_user_id,
      coalesce(nullif(trim(title), ''), '未命名旅行'),
      coalesce(status, 'active'),
      start_date,
      end_date,
      greatest(coalesce(travelers, 1), 1),
      coalesce(snapshot, '{}'::jsonb),
      archived_at
    )
    returning * into saved_row;
  else
    update public.trip_plans
    set
      title = coalesce(nullif(trim(save_trip_plan.title), ''), trip_plans.title),
      status = coalesce(save_trip_plan.status, trip_plans.status),
      start_date = save_trip_plan.start_date,
      end_date = save_trip_plan.end_date,
      travelers = greatest(coalesce(save_trip_plan.travelers, 1), 1),
      snapshot = coalesce(save_trip_plan.snapshot, trip_plans.snapshot),
      archived_at = save_trip_plan.archived_at
    where trip_plans.id = plan_id
      and trip_plans.owner_id = current_user_id
    returning * into saved_row;

    if saved_row.id is null then
      raise exception 'Plan not found or no permission to update';
    end if;
  end if;

  return jsonb_build_object(
    'id', saved_row.id,
    'status', saved_row.status,
    'title', saved_row.title,
    'start_date', saved_row.start_date,
    'end_date', saved_row.end_date,
    'travelers', saved_row.travelers,
    'updated_at', saved_row.updated_at,
    'created_at', saved_row.created_at,
    'archived_at', saved_row.archived_at
  );
end;
$$;

revoke all on function public.save_trip_plan(uuid, text, text, date, date, integer, jsonb, timestamptz, uuid) from public;
grant execute on function public.save_trip_plan(uuid, text, text, date, date, integer, jsonb, timestamptz, uuid) to authenticated;
