create table if not exists public.early_access_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  normalized_email text not null unique,
  early_access_consent boolean not null default false,
  source text not null default 'unknown',
  status text not null default 'early_access',
  locale text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint early_access_leads_status_check check (
    status in ('early_access', 'contacted', 'design_partner', 'converted', 'removed')
  )
);

create index if not exists early_access_leads_created_at_idx
  on public.early_access_leads (created_at desc);
create index if not exists early_access_leads_status_idx
  on public.early_access_leads (status);
create index if not exists early_access_leads_source_idx
  on public.early_access_leads (source);
create index if not exists early_access_leads_consent_idx
  on public.early_access_leads (early_access_consent);

create or replace function public.set_early_access_leads_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_early_access_leads_updated_at on public.early_access_leads;
create trigger set_early_access_leads_updated_at
before update on public.early_access_leads
for each row execute function public.set_early_access_leads_updated_at();

alter table public.early_access_leads enable row level security;

revoke all on table public.early_access_leads from anon, authenticated;

