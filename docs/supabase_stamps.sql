-- 알바가드 기록 등록(타임스탬프) 표. Supabase SQL Editor에 붙여 넣고 Run.
-- 저장되는 것: 폰 번호(무작위), 기록 번호, 지문(SHA-256), 서버가 찍은 등록 시각. 근무 내용은 없다.

create table if not exists public.stamps (
  id uuid primary key default gen_random_uuid(),
  device text not null,
  record_id text not null,
  hash text not null unique check (hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now()
);

-- 등록 시각은 항상 서버 시각. 앱이 보내는 값은 무시한다
create or replace function public.stamps_force_now()
returns trigger language plpgsql as $$
begin
  new.created_at := now();
  return new;
end $$;

drop trigger if exists stamps_force_now on public.stamps;
create trigger stamps_force_now before insert on public.stamps
  for each row execute function public.stamps_force_now();

-- 누구나 넣고 읽을 수는 있지만, 고치거나 지울 수는 없다 (update/delete 정책 없음)
alter table public.stamps enable row level security;

drop policy if exists "stamps insert" on public.stamps;
create policy "stamps insert" on public.stamps for insert to anon with check (true);

drop policy if exists "stamps read" on public.stamps;
create policy "stamps read" on public.stamps for select to anon using (true);

grant usage on schema public to anon;
grant select, insert on public.stamps to anon;
revoke update, delete, truncate on public.stamps from anon;

create index if not exists stamps_hash_prefix on public.stamps (hash text_pattern_ops);
