-- 알바가드 설문 응답 표. Supabase SQL Editor에 붙여 넣고 Run.
-- 저장되는 것: 알바 여부(now/past/never), 답 묶음(JSON), 서버가 찍은 시각. 이름·연락처는 받지 않는다.

create table if not exists public.survey (
  id uuid primary key default gen_random_uuid(),
  status text not null check (status in ('now', 'past', 'never')),
  answers jsonb not null check (length(answers::text) < 4000),
  created_at timestamptz not null default now()
);

create or replace function public.survey_force_now()
returns trigger language plpgsql as $$
begin
  new.created_at := now();
  return new;
end $$;

drop trigger if exists survey_force_now on public.survey;
create trigger survey_force_now before insert on public.survey
  for each row execute function public.survey_force_now();

-- 누구나 답을 넣고(설문 페이지), 결과 페이지가 읽을 수 있다. 고치거나 지우는 건 안 된다
alter table public.survey enable row level security;

drop policy if exists "survey insert" on public.survey;
create policy "survey insert" on public.survey for insert to anon with check (true);

drop policy if exists "survey read" on public.survey;
create policy "survey read" on public.survey for select to anon using (true);

grant select, insert on public.survey to anon;
revoke update, delete, truncate on public.survey from anon;
