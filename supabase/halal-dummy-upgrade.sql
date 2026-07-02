-- Adds dummy halal intelligence tables and sample data to an existing Thayyib Supabase project.
-- Run after supabase/schema.sql if your project was created before the halal tables existed.

do $$
begin
  create type public.halal_certification_status as enum (
    'certified',
    'expired',
    'suspended',
    'revoked',
    'unknown',
    'sample_data'
  );
exception
  when duplicate_object then null;
end;
$$;

do $$
begin
  create type public.halal_risk_level as enum (
    'low',
    'medium',
    'high',
    'unknown'
  );
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.ingredient_risks (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  common_names text[] not null default '{}',
  e_code text,
  risk_level public.halal_risk_level not null default 'unknown',
  risk_reason text not null,
  source_name text not null default 'Thayyib sample knowledge base',
  source_url text,
  confidence_score numeric(3,2) not null default 0.50 check (confidence_score >= 0 and confidence_score <= 1),
  is_sample_data boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.halal_certifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  product_name text not null,
  brand_name text,
  manufacturer_name text not null,
  certificate_number text,
  certifying_body text not null,
  certification_country text not null default 'Malaysia',
  category text not null,
  status public.halal_certification_status not null default 'sample_data',
  valid_from date,
  valid_until date,
  source_name text not null,
  source_url text,
  confidence_score numeric(3,2) not null default 0.50 check (confidence_score >= 0 and confidence_score <= 1),
  is_sample_data boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint halal_certifications_company_certificate_number_key unique (company_id, certificate_number)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.halal_certifications'::regclass
      and contype = 'u'
      and pg_get_constraintdef(oid) = 'UNIQUE (company_id, certificate_number)'
  ) then
    alter table public.halal_certifications
      add constraint halal_certifications_company_certificate_number_key
      unique (company_id, certificate_number);
  end if;
exception
  when duplicate_object then null;
end;
$$;

create table if not exists public.product_ingredients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  halal_certification_id uuid not null references public.halal_certifications(id) on delete cascade,
  ingredient_risk_id uuid not null references public.ingredient_risks(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (halal_certification_id, ingredient_risk_id)
);

create table if not exists public.halal_ai_assessments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  product_name text,
  brand_name text,
  input_text text not null,
  detected_ingredients jsonb not null default '[]'::jsonb,
  risk_summary text not null,
  risk_level public.halal_risk_level not null default 'unknown',
  recommendation_text text not null default 'Potential risk detected. Please verify with a qualified halal compliance officer.',
  sources jsonb not null default '[]'::jsonb,
  confidence_score numeric(3,2) not null default 0.50 check (confidence_score >= 0 and confidence_score <= 1),
  model_name text,
  is_sample_data boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists halal_certifications_company_id_idx on public.halal_certifications(company_id);
create index if not exists halal_certifications_status_idx on public.halal_certifications(status);
create index if not exists product_ingredients_company_id_idx on public.product_ingredients(company_id);
create index if not exists product_ingredients_certification_id_idx on public.product_ingredients(halal_certification_id);
create index if not exists product_ingredients_ingredient_risk_id_idx on public.product_ingredients(ingredient_risk_id);
create index if not exists halal_ai_assessments_company_id_idx on public.halal_ai_assessments(company_id);
create index if not exists halal_ai_assessments_document_id_idx on public.halal_ai_assessments(document_id);
create index if not exists ingredient_risks_risk_level_idx on public.ingredient_risks(risk_level);

drop trigger if exists ingredient_risks_set_updated_at on public.ingredient_risks;
create trigger ingredient_risks_set_updated_at
before update on public.ingredient_risks
for each row execute function public.set_updated_at();

drop trigger if exists halal_certifications_set_updated_at on public.halal_certifications;
create trigger halal_certifications_set_updated_at
before update on public.halal_certifications
for each row execute function public.set_updated_at();

alter table public.ingredient_risks enable row level security;
alter table public.halal_certifications enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.halal_ai_assessments enable row level security;

drop policy if exists "authenticated users can read ingredient risks" on public.ingredient_risks;
create policy "authenticated users can read ingredient risks"
on public.ingredient_risks for select
to authenticated
using (true);

drop policy if exists "members can read halal certifications" on public.halal_certifications;
create policy "members can read halal certifications"
on public.halal_certifications for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can write halal certifications" on public.halal_certifications;
drop policy if exists "members can insert halal certifications" on public.halal_certifications;
create policy "members can insert halal certifications"
on public.halal_certifications for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can update halal certifications" on public.halal_certifications;
create policy "members can update halal certifications"
on public.halal_certifications for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can delete halal certifications" on public.halal_certifications;
create policy "members can delete halal certifications"
on public.halal_certifications for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can read product ingredients" on public.product_ingredients;
create policy "members can read product ingredients"
on public.product_ingredients for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can write product ingredients" on public.product_ingredients;
drop policy if exists "members can insert product ingredients" on public.product_ingredients;
create policy "members can insert product ingredients"
on public.product_ingredients for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can update product ingredients" on public.product_ingredients;
create policy "members can update product ingredients"
on public.product_ingredients for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can delete product ingredients" on public.product_ingredients;
create policy "members can delete product ingredients"
on public.product_ingredients for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can read halal ai assessments" on public.halal_ai_assessments;
create policy "members can read halal ai assessments"
on public.halal_ai_assessments for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can write halal ai assessments" on public.halal_ai_assessments;
drop policy if exists "members can insert halal ai assessments" on public.halal_ai_assessments;
create policy "members can insert halal ai assessments"
on public.halal_ai_assessments for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can update halal ai assessments" on public.halal_ai_assessments;
create policy "members can update halal ai assessments"
on public.halal_ai_assessments for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

drop policy if exists "members can delete halal ai assessments" on public.halal_ai_assessments;
create policy "members can delete halal ai assessments"
on public.halal_ai_assessments for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

grant usage on schema public to authenticated;
grant select on public.ingredient_risks to authenticated;
grant select, insert, update, delete on public.halal_certifications to authenticated;
grant select, insert, update, delete on public.product_ingredients to authenticated;
grant select, insert, update, delete on public.halal_ai_assessments to authenticated;

create or replace function public.seed_demo_halal_data(target_company_id uuid, target_document_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  sample_curry_puff_id uuid;
  sample_cookies_id uuid;
  gelatin_id uuid;
  e471_id uuid;
  vinegar_id uuid;
  vanilla_extract_id uuid;
  e120_id uuid;
begin
  if auth.uid() is not null and not exists (
    select 1
    from public.company_members
    where company_id = target_company_id
      and user_id = auth.uid()
  ) then
    raise exception 'Not authorized to seed this workspace';
  end if;

  insert into public.ingredient_risks (
    name,
    common_names,
    e_code,
    risk_level,
    risk_reason,
    source_name,
    source_url,
    confidence_score
  )
  values
    ('Gelatin', array['gelatine', 'hydrolyzed gelatin'], 'E441', 'high', 'Animal-derived ingredient that requires source and halal certificate verification.', 'Thayyib sample knowledge base', 'context/research/ingredient-risk.md', 0.80),
    ('Mono- and diglycerides of fatty acids', array['emulsifier', 'mono-diglycerides', 'E471'], 'E471', 'medium', 'May be plant-based or animal-derived, so supplier source evidence is needed.', 'Thayyib sample knowledge base', 'context/research/ingredient-risk.md', 0.72),
    ('Vinegar', array['acetic acid vinegar'], null, 'low', 'Common food ingredient, but production process and source should still be documented.', 'Thayyib sample knowledge base', 'context/research/ingredient-risk.md', 0.65),
    ('Vanilla extract', array['vanilla flavouring', 'natural vanilla extract'], null, 'medium', 'May contain alcohol as a carrier, so formulation and certificate evidence should be checked.', 'Thayyib sample knowledge base', 'context/research/ingredient-risk.md', 0.70),
    ('Carmine', array['cochineal', 'natural red 4'], 'E120', 'high', 'Animal/insect-derived colourant that should be escalated for qualified halal review.', 'Thayyib sample knowledge base', 'context/research/ingredient-risk.md', 0.78)
  on conflict (name) do update
  set
    common_names = excluded.common_names,
    e_code = excluded.e_code,
    risk_level = excluded.risk_level,
    risk_reason = excluded.risk_reason,
    source_name = excluded.source_name,
    source_url = excluded.source_url,
    confidence_score = excluded.confidence_score;

  select id into gelatin_id from public.ingredient_risks where name = 'Gelatin' limit 1;
  select id into e471_id from public.ingredient_risks where name = 'Mono- and diglycerides of fatty acids' limit 1;
  select id into vinegar_id from public.ingredient_risks where name = 'Vinegar' limit 1;
  select id into vanilla_extract_id from public.ingredient_risks where name = 'Vanilla extract' limit 1;
  select id into e120_id from public.ingredient_risks where name = 'Carmine' limit 1;

  insert into public.halal_certifications (
    company_id,
    product_name,
    brand_name,
    manufacturer_name,
    certificate_number,
    certifying_body,
    certification_country,
    category,
    status,
    valid_from,
    valid_until,
    source_name,
    source_url,
    confidence_score,
    notes
  )
  values
    (target_company_id, 'Sample Chicken Curry Puff', 'Thayyib Demo Foods', 'Thayyib Demo Foods Sdn. Bhd.', 'SAMPLE-HALAL-2026-001', 'JAKIM / JAIN placeholder', 'Malaysia', 'Produk Makanan / Minuman', 'sample_data', '2026-01-01', '2026-12-31', 'Sample Data (Not Official JAKIM Record)', 'https://myehalal.halal.gov.my/portal-halal/v1/index.php', 0.45, 'Demo record only. Verify real certificate status in MYeHALAL before operational use.'),
    (target_company_id, 'Sample Chocolate Cookies', 'Thayyib Demo Foods', 'Thayyib Demo Foods Sdn. Bhd.', 'SAMPLE-HALAL-2026-002', 'JAKIM / JAIN placeholder', 'Malaysia', 'Produk Makanan / Minuman', 'sample_data', '2026-02-01', '2026-11-30', 'Sample Data (Not Official JAKIM Record)', 'https://myehalal.halal.gov.my/portal-halal/v1/index.php', 0.45, 'Demo record only. Ingredient risks should be reviewed by a qualified halal compliance officer.')
  on conflict do nothing;

  select id into sample_curry_puff_id
  from public.halal_certifications
  where company_id = target_company_id and certificate_number = 'SAMPLE-HALAL-2026-001'
  limit 1;

  select id into sample_cookies_id
  from public.halal_certifications
  where company_id = target_company_id and certificate_number = 'SAMPLE-HALAL-2026-002'
  limit 1;

  insert into public.product_ingredients (company_id, halal_certification_id, ingredient_risk_id)
  values
    (target_company_id, sample_curry_puff_id, vinegar_id),
    (target_company_id, sample_curry_puff_id, e471_id),
    (target_company_id, sample_cookies_id, vanilla_extract_id),
    (target_company_id, sample_cookies_id, gelatin_id),
    (target_company_id, sample_cookies_id, e120_id)
  on conflict (halal_certification_id, ingredient_risk_id) do nothing;

  insert into public.halal_ai_assessments (
    company_id,
    document_id,
    product_name,
    brand_name,
    input_text,
    detected_ingredients,
    risk_summary,
    risk_level,
    sources,
    confidence_score,
    model_name
  )
  select
    target_company_id,
    target_document_id,
    product_name,
    brand_name,
    input_text,
    detected_ingredients::jsonb,
    risk_summary,
    risk_level::public.halal_risk_level,
    sources::jsonb,
    confidence_score,
    model_name
  from (
    values
      (
        'Sample Chicken Curry Puff',
        'Thayyib Demo Foods',
        'Ingredients: wheat flour, chicken, curry powder, vinegar, emulsifier E471.',
        '[{"name":"Vinegar","risk_level":"low"},{"name":"E471","risk_level":"medium"}]',
        'E471 requires supplier source evidence because it can be plant-based or animal-derived.',
        'medium',
        '[{"title":"Ingredient Risk Research Notes","url":"context/research/ingredient-risk.md"},{"title":"MYeHALAL Status Check","url":"https://myehalal.halal.gov.my/portal-halal/v1/index.php"}]',
        0.72,
        'sample-assessment-v1'
      ),
      (
        'Sample Chocolate Cookies',
        'Thayyib Demo Foods',
        'Ingredients: wheat flour, cocoa powder, vanilla extract, gelatin, colour E120.',
        '[{"name":"Vanilla extract","risk_level":"medium"},{"name":"Gelatin","risk_level":"high"},{"name":"E120","risk_level":"high"}]',
        'Gelatin and E120 should be escalated because their source can create halal compliance risk.',
        'high',
        '[{"title":"Ingredient Risk Research Notes","url":"context/research/ingredient-risk.md"},{"title":"MYeHALAL Status Check","url":"https://myehalal.halal.gov.my/portal-halal/v1/index.php"}]',
        0.78,
        'sample-assessment-v1'
      )
  ) as seed_data (
    product_name,
    brand_name,
    input_text,
    detected_ingredients,
    risk_summary,
    risk_level,
    sources,
    confidence_score,
    model_name
  )
  where not exists (
    select 1
    from public.halal_ai_assessments
    where company_id = target_company_id
      and product_name = seed_data.product_name
      and model_name = seed_data.model_name
  );
end;
$$;

revoke all on function public.seed_demo_halal_data(uuid, uuid) from public;
revoke all on function public.seed_demo_halal_data(uuid, uuid) from anon;
revoke all on function public.seed_demo_halal_data(uuid, uuid) from authenticated;

do $$
declare
  workspace record;
  sample_document_id uuid;
begin
  for workspace in select id from public.companies loop
    select id into sample_document_id
    from public.documents
    where company_id = workspace.id
      and document_type = 'ingredient_list'
    order by created_at desc
    limit 1;

    perform public.seed_demo_halal_data(workspace.id, sample_document_id);
  end loop;
end;
$$;
