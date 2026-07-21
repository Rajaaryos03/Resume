-- Raja Aryos Portfolio — Supabase SQL Schema
-- Run this in Supabase SQL Editor

-- ==============================
-- PROFILE
-- ==============================
create table if not exists profile (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  professional_title text not null,
  short_bio text not null,
  long_description text not null,
  email text not null,
  location text,
  linked_in_url text,
  github_url text,
  microsoft_learn_url text,
  profile_image_url text,
  availability_status text,
  skills text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==============================
-- BLOG SERIES
-- ==============================
create table if not exists blog_series (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table blog_series enable row level security;
create policy "Public read series" on blog_series for select using (true);

-- ==============================
-- BLOG
-- ==============================
create table if not exists blog (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  category text not null,
  tags text[] default '{}',
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft','published')),
  published_at timestamptz,
  series_id uuid references blog_series(id) on delete set null,
  series_order integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists blog_status_idx on blog(status);
create index if not exists blog_slug_idx on blog(slug);
create index if not exists blog_published_at_idx on blog(published_at desc);

-- ==============================
-- VIEW COUNT (migration)
-- Run if blog table already exists:
-- alter table blog add column if not exists view_count integer default 0 not null;
-- ==============================
alter table blog add column if not exists view_count integer default 0 not null;

-- RPC: increment view count atomically
create or replace function increment_blog_views(blog_slug text)
returns void as $$
begin
  update blog set view_count = view_count + 1 where slug = blog_slug and status = 'published';
end;
$$ language plpgsql security definer;

-- ==============================
-- EXPERIENCE
-- ==============================
create table if not exists experience (
  id uuid primary key default gen_random_uuid(),
  role_title text not null,
  company text not null,
  employment_type text,
  location text,
  start_date date not null,
  end_date date,
  is_current_role boolean default false,
  description text not null,
  achievements text[] default '{}',
  technologies text[] default '{}',
  status text not null default 'published' check (status in ('published','hidden')),
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists experience_status_idx on experience(status);
create index if not exists experience_sort_idx on experience(sort_order, start_date desc);

-- ==============================
-- CERTIFICATE
-- ==============================
create table if not exists certificate (
  id uuid primary key default gen_random_uuid(),
  certificate_name text not null,
  issuer text not null,
  issue_date date not null,
  expiration_date date,
  credential_id text,
  credential_url text,
  category text,
  certificate_image_url text,
  description text,
  status text not null default 'published' check (status in ('published','hidden')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists certificate_status_idx on certificate(status);
create index if not exists certificate_category_idx on certificate(category);

-- ==============================
-- CV
-- ==============================
create table if not exists cv (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_url text not null,
  display_name text not null,
  version text,
  is_active boolean default true,
  uploaded_at timestamptz default now()
);

-- ==============================
-- PROJECT
-- ==============================
create table if not exists project (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  long_description text,
  technologies text[] default '{}',
  category text not null default 'Power Platform',
  demo_url text,
  repo_url text,
  image_url text,
  featured boolean default false,
  status text not null default 'published' check (status in ('published','hidden')),
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists project_status_idx on project(status);
create index if not exists project_sort_idx on project(sort_order, created_at desc);

-- ==============================
-- UPDATED_AT TRIGGER
-- ==============================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profile_updated_at before update on profile
  for each row execute function update_updated_at();

create trigger blog_updated_at before update on blog
  for each row execute function update_updated_at();

create trigger experience_updated_at before update on experience
  for each row execute function update_updated_at();

create trigger certificate_updated_at before update on certificate
  for each row execute function update_updated_at();

create trigger project_updated_at before update on project
  for each row execute function update_updated_at();

-- ==============================
-- ROW LEVEL SECURITY
-- ==============================
alter table profile enable row level security;
alter table blog enable row level security;
alter table experience enable row level security;
alter table certificate enable row level security;
alter table cv enable row level security;
alter table project enable row level security;

-- Public: read published/public data
create policy "Public read profile" on profile for select using (true);

create policy "Public read published blogs" on blog for select
  using (status = 'published');

create policy "Public read published experiences" on experience for select
  using (status = 'published');

create policy "Public read published certificates" on certificate for select
  using (status = 'published');

create policy "Public read active cv" on cv for select
  using (is_active = true);

create policy "Public read published projects" on project for select
  using (status = 'published');

-- Admin: full access via service role key (bypasses RLS)

-- ==============================
-- BLOG REACTIONS
-- ==============================
create table if not exists blog_reaction (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references blog(id) on delete cascade,
  emoji text not null check (emoji in ('👍','❤️','🔥','🤔','👏')),
  fingerprint text not null,
  created_at timestamptz default now(),
  unique(blog_id, emoji, fingerprint)
);

create index if not exists blog_reaction_blog_idx on blog_reaction(blog_id);

alter table blog_reaction enable row level security;
create policy "Public read reactions" on blog_reaction for select using (true);
create policy "Public insert reactions" on blog_reaction for insert with check (true);
create policy "Public delete own reaction" on blog_reaction for delete using (true);

-- ==============================
-- BLOG COMMENTS
-- ==============================
create table if not exists blog_comment (
  id uuid primary key default gen_random_uuid(),
  blog_id uuid not null references blog(id) on delete cascade,
  parent_id uuid references blog_comment(id) on delete cascade,
  author_name text not null,
  author_email text,
  content text not null,
  is_approved boolean default false,
  is_owner_reply boolean default false,
  created_at timestamptz default now()
);

-- Migration: add parent_id and is_owner_reply if table already exists
-- alter table blog_comment add column if not exists parent_id uuid references blog_comment(id) on delete cascade;
-- alter table blog_comment add column if not exists is_owner_reply boolean default false;

create index if not exists blog_comment_blog_idx on blog_comment(blog_id);
create index if not exists blog_comment_parent_idx on blog_comment(parent_id);

alter table blog_comment enable row level security;
create policy "Public read approved comments" on blog_comment for select using (is_approved = true);
create policy "Public insert comments" on blog_comment for insert with check (true);

-- ==============================
-- SEED: Default Profile
-- ==============================
insert into profile (
  full_name, professional_title, short_bio, long_description,
  email, location, linked_in_url, github_url, skills
) values (
  'Iranto Tua Raja Aryos',
  'Power Platform Developer | Business Process Automation | Microsoft Copilot & Dataverse Enthusiast',
  'I design and build business applications that help teams automate processes, manage data, and improve productivity using Microsoft Power Platform, Dataverse, SharePoint, and Copilot Studio.',
  '<p>I am a Power Platform Developer with experience in building enterprise-grade business solutions using Power Apps, Power Automate, Dataverse, SharePoint, Teams, and Microsoft Copilot Studio. My work focuses on transforming manual business processes into scalable, user-friendly, and automated digital solutions.</p><p>I am passionate about combining low-code technology, AI agents, and business process understanding to create practical solutions that are easy to use and valuable for business users.</p>',
  'rajaaryos@email.com',
  'Indonesia',
  null,
  null,
  ARRAY['Power Apps','Power Automate','Dataverse','SharePoint','Copilot Studio','Microsoft 365','Power BI','Azure']
) on conflict do nothing;
