-- Schema voor de showcase-site (Web / Data / AI) — voer uit in de Supabase SQL editor.

create extension if not exists pgcrypto;

-- === Publiek zichtbare content ==============================================================

create table if not exists pillars (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key in ('web', 'data', 'ai')),
  name text not null,
  tagline text not null default '',
  description text not null default '',
  order_index integer not null default 0,
  active boolean not null default true
);

alter table pillars enable row level security;
create policy "pillars zijn publiek leesbaar indien actief" on pillars
  for select using (active = true);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  pillar_id uuid not null references pillars(id) on delete cascade,
  name text not null,
  description text not null default '',
  includes text[] not null default '{}',
  price_label text not null default '',
  cta_label text not null default 'Neem contact op',
  order_index integer not null default 0,
  active boolean not null default true,
  unique (pillar_id, name)
);

alter table services enable row level security;
create policy "services zijn publiek leesbaar indien actief" on services
  for select using (active = true);

create index if not exists services_pillar_id_idx on services(pillar_id);

-- === Leads en agent-data — bevatten persoonsgegevens/kosteninfo, dus GEEN publieke policies. =
-- Alleen de service-role client (lib/supabase-admin.ts, server-only) mag deze tabellen lezen of
-- schrijven — zelfde patroon als de reservations-tabel in het bruschetta-project.

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null default '',
  company_domain text not null default '',
  message text not null,
  source text not null default 'contact-form',
  status text not null default 'new' check (status in ('new', 'researching', 'qualified', 'contacted', 'archived')),
  created_at timestamptz not null default now()
);

alter table leads enable row level security;

create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists leads_status_idx on leads(status);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text not null default '',
  sector text not null default '',
  size_estimate text not null default '',
  summary text not null default '',
  website_quality text not null default '',
  tech_signals jsonb not null default '[]',
  news jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table companies enable row level security;

create table if not exists briefings (
  id uuid primary key default gen_random_uuid(),
  -- lead_id is nullable: een standalone research-run vanuit /admin/research heeft geen lead.
  lead_id uuid references leads(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  content jsonb not null,
  angle text not null default '',
  draft_reply text not null default '',
  model_used text not null default '',
  created_at timestamptz not null default now()
);

alter table briefings enable row level security;

create index if not exists briefings_lead_id_idx on briefings(lead_id);
create index if not exists briefings_company_id_idx on briefings(company_id);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  agent text not null check (agent in ('research', 'enrichment')),
  input jsonb not null default '{}',
  status text not null check (status in ('success', 'error')),
  tokens integer,
  cost_estimate numeric,
  error text,
  created_at timestamptz not null default now()
);

alter table agent_runs enable row level security;
create index if not exists agent_runs_created_at_idx on agent_runs(created_at desc);

-- === Beheerbare site-tekst (geen gevoelige data, dus publiek leesbaar) =======================

create table if not exists site_content (
  key text primary key,
  value text not null
);

alter table site_content enable row level security;
create policy "site_content is publiek leesbaar" on site_content
  for select using (true);
