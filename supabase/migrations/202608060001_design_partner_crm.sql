alter table public.early_access_leads drop constraint if exists early_access_leads_status_check;
alter table public.early_access_leads
  alter column status set default 'new',
  add column if not exists country text,
  add column if not exists device text not null default 'Unknown',
  add column if not exists notes text not null default '';

update public.early_access_leads set status = case status
  when 'early_access' then 'new'
  when 'converted' then 'design_partner'
  when 'removed' then 'rejected'
  else status end;

alter table public.early_access_leads add constraint early_access_leads_status_check
  check (status in ('new','contacted','interview_scheduled','design_partner','rejected'));

create index if not exists early_access_leads_email_search_idx
  on public.early_access_leads (normalized_email text_pattern_ops);
create index if not exists early_access_leads_country_idx on public.early_access_leads (country);
create index if not exists early_access_leads_campaign_idx on public.early_access_leads (utm_campaign);
