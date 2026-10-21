-- Run once in Supabase SQL Editor. No passwords or API secrets belong here.
begin;
create table if not exists public.portfolio_admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.portfolio_admins enable row level security;
revoke all on public.portfolio_admins from anon, authenticated;
create or replace function public.is_portfolio_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.portfolio_admins where user_id=(select auth.uid()));
$$;
revoke all on function public.is_portfolio_admin() from public;
grant execute on function public.is_portfolio_admin() to authenticated;
create table if not exists public.portfolio_draft(id int primary key check(id=1),content jsonb not null check(jsonb_typeof(content)='object'),updated_at timestamptz not null default now());
create table if not exists public.portfolio_published(id int primary key check(id=1),content jsonb not null check(jsonb_typeof(content)='object'),updated_at timestamptz not null default now());
create table if not exists public.portfolio_history(id bigint generated always as identity primary key,content jsonb not null,created_at timestamptz not null default now());
alter table public.portfolio_draft enable row level security;
alter table public.portfolio_published enable row level security;
alter table public.portfolio_history enable row level security;
revoke all on public.portfolio_draft,public.portfolio_published,public.portfolio_history from anon,authenticated;
grant select,insert,update on public.portfolio_draft to authenticated;
grant select on public.portfolio_published to anon,authenticated;
grant select on public.portfolio_history to authenticated;
create policy "Owner manages drafts" on public.portfolio_draft for all to authenticated using((select public.is_portfolio_admin())) with check((select public.is_portfolio_admin()));
create policy "Visitors read published content" on public.portfolio_published for select to anon,authenticated using(true);
create policy "Owner reads history" on public.portfolio_history for select to authenticated using((select public.is_portfolio_admin()));
create or replace function public.publish_portfolio() returns void language plpgsql security definer set search_path='' as $$
declare draft jsonb;
begin
 if not public.is_portfolio_admin() then raise exception 'Not authorized' using errcode='42501';end if;
 select content into draft from public.portfolio_draft where id=1 for update;
 if draft is null then raise exception 'Save a draft before publishing';end if;
 insert into public.portfolio_history(content) select content from public.portfolio_published where id=1;
 insert into public.portfolio_published(id,content,updated_at) values(1,draft,now()) on conflict(id) do update set content=excluded.content,updated_at=excluded.updated_at;
end;$$;
revoke all on function public.publish_portfolio() from public;
grant execute on function public.publish_portfolio() to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('portfolio-media','portfolio-media',true,10485760,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do nothing;
create policy "Owner reads media library" on storage.objects for select to authenticated using(bucket_id='portfolio-media' and (select public.is_portfolio_admin()));
create policy "Owner uploads media" on storage.objects for insert to authenticated with check(bucket_id='portfolio-media' and (select public.is_portfolio_admin()));
create policy "Owner deletes media" on storage.objects for delete to authenticated using(bucket_id='portfolio-media' and (select public.is_portfolio_admin()));
commit;
