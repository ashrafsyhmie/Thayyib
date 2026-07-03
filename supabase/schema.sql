-- Thayyib MVP schema
-- Run this in the Supabase SQL editor after creating the project.

create extension if not exists "pgcrypto";

create type public.member_role as enum (
  'admin',
  'compliance_officer',
  'manager',
  'auditor'
);

create type public.supplier_status as enum (
  'valid',
  'expiring_soon',
  'expired',
  'missing_certificate'
);

create type public.document_type as enum (
  'supplier_certificate',
  'ingredient_list',
  'sop_document',
  'audit_evidence',
  'other'
);

create type public.document_status as enum (
  'valid',
  'expiring_soon',
  'expired',
  'missing_document',
  'complete',
  'needs_review'
);

create type public.halal_certification_status as enum (
  'certified',
  'expired',
  'suspended',
  'revoked',
  'unknown',
  'sample_data'
);

create type public.halal_risk_level as enum (
  'low',
  'medium',
  'high',
  'unknown'
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  registration_number text,
  address text,
  industry_sector text default 'Food Manufacturing',
  primary_contact_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'compliance_officer',
  created_at timestamptz not null default now(),
  unique (company_id, user_id)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  category text not null,
  contact_person text,
  contact_email text,
  phone text,
  certificate_status public.supplier_status not null default 'missing_certificate',
  certificate_expiry_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  name text not null,
  document_type public.document_type not null default 'other',
  status public.document_status not null default 'needs_review',
  expiry_date date,
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  content_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_checklist_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  status public.document_status not null default 'missing_document',
  linked_document_id uuid references public.documents(id) on delete set null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  detail text not null,
  priority text not null default 'Info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

create table public.ingredient_risks (
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

create table public.halal_certifications (
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
  unique (company_id, certificate_number)
);

create table public.product_ingredients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  halal_certification_id uuid not null references public.halal_certifications(id) on delete cascade,
  ingredient_risk_id uuid not null references public.ingredient_risks(id) on delete restrict,
  created_at timestamptz not null default now(),
  unique (halal_certification_id, ingredient_risk_id)
);

create table public.halal_ai_assessments (
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

create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  document_id uuid references public.documents(id) on delete set null,
  ingredient_risk_id uuid references public.ingredient_risks(id) on delete set null,
  name text not null,
  category text not null,
  batch_number text not null,
  quantity numeric(12,2) not null default 0 check (quantity >= 0),
  unit text not null,
  received_date date,
  expiry_date date,
  halal_status public.document_status not null default 'needs_review',
  risk_level public.halal_risk_level not null default 'unknown',
  storage_location text,
  notes text,
  is_sample_data boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, batch_number, name)
);

create index suppliers_company_id_idx on public.suppliers(company_id);
create index documents_company_id_idx on public.documents(company_id);
create index documents_supplier_id_idx on public.documents(supplier_id);
create index audit_items_company_id_idx on public.audit_checklist_items(company_id);
create index notifications_company_id_idx on public.notifications(company_id);
create index halal_certifications_company_id_idx on public.halal_certifications(company_id);
create index halal_certifications_status_idx on public.halal_certifications(status);
create index product_ingredients_company_id_idx on public.product_ingredients(company_id);
create index product_ingredients_certification_id_idx on public.product_ingredients(halal_certification_id);
create index product_ingredients_ingredient_risk_id_idx on public.product_ingredients(ingredient_risk_id);
create index halal_ai_assessments_company_id_idx on public.halal_ai_assessments(company_id);
create index halal_ai_assessments_document_id_idx on public.halal_ai_assessments(document_id);
create index ingredient_risks_risk_level_idx on public.ingredient_risks(risk_level);
create index inventory_items_company_id_idx on public.inventory_items(company_id);
create index inventory_items_supplier_id_idx on public.inventory_items(supplier_id);
create index inventory_items_document_id_idx on public.inventory_items(document_id);
create index inventory_items_ingredient_risk_id_idx on public.inventory_items(ingredient_risk_id);
create index inventory_items_halal_status_idx on public.inventory_items(halal_status);
create index inventory_items_risk_level_idx on public.inventory_items(risk_level);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger suppliers_set_updated_at
before update on public.suppliers
for each row execute function public.set_updated_at();

create trigger documents_set_updated_at
before update on public.documents
for each row execute function public.set_updated_at();

create trigger audit_items_set_updated_at
before update on public.audit_checklist_items
for each row execute function public.set_updated_at();

create trigger ingredient_risks_set_updated_at
before update on public.ingredient_risks
for each row execute function public.set_updated_at();

create trigger halal_certifications_set_updated_at
before update on public.halal_certifications
for each row execute function public.set_updated_at();

create trigger inventory_items_set_updated_at
before update on public.inventory_items
for each row execute function public.set_updated_at();

create or replace function public.seed_demo_workspace(target_company_id uuid, target_user_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  global_meats_id uuid;
  crescent_dairy_id uuid;
  eastern_spices_id uuid;
  prime_ingredients_id uuid;
  pure_extracts_id uuid;
  global_certificate_id uuid;
  crescent_certificate_id uuid;
  sanitation_sop_id uuid;
  traceability_log_id uuid;
  prime_certificate_id uuid;
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

  insert into public.suppliers (
    company_id,
    name,
    category,
    contact_person,
    contact_email,
    phone,
    certificate_status,
    certificate_expiry_date,
    notes
  )
  select
    target_company_id,
    supplier_name,
    category,
    contact_person,
    contact_email,
    phone,
    certificate_status::public.supplier_status,
    certificate_expiry_date::date,
    notes
  from (
    values
      ('Global Meats Inc.', 'Poultry', 'Sarah Jenkins', 'compliance@globalmeats.example', '+60 3-5550 1201', 'valid', '2026-10-12', 'Primary poultry supplier. Certificate checked during onboarding.'),
      ('Crescent Dairy', 'Dairy Products', 'Omar Farooq', 'omar@crescentdairy.example', '+60 3-5550 1202', 'expiring_soon', '2026-07-10', 'Renewal certificate requested before the next internal audit.'),
      ('Eastern Spices Co.', 'Spices & Seasonings', 'Aisha Khan', 'qa@easternspices.example', '+60 3-5550 1203', 'valid', '2027-05-15', 'Supplier provides spice blends and annual facility evidence.'),
      ('Prime Ingredients', 'Additives', 'David Chen', 'david@primeingredients.example', '+60 3-5550 1204', 'expired', '2026-05-30', 'Certificate has expired. Follow up before accepting new shipments.'),
      ('Pure Extracts Ltd.', 'Flavorings', 'Linda Roberts', 'linda@pureextracts.example', '+60 3-5550 1205', 'missing_certificate', null, 'Flavoring supplier needs a current halal certificate uploaded.')
  ) as seed_data (
    supplier_name,
    category,
    contact_person,
    contact_email,
    phone,
    certificate_status,
    certificate_expiry_date,
    notes
  )
  where not exists (
    select 1
    from public.suppliers
    where company_id = target_company_id
      and name = seed_data.supplier_name
  );

  select id into global_meats_id
  from public.suppliers
  where company_id = target_company_id and name = 'Global Meats Inc.'
  limit 1;

  select id into crescent_dairy_id
  from public.suppliers
  where company_id = target_company_id and name = 'Crescent Dairy'
  limit 1;

  select id into eastern_spices_id
  from public.suppliers
  where company_id = target_company_id and name = 'Eastern Spices Co.'
  limit 1;

  select id into prime_ingredients_id
  from public.suppliers
  where company_id = target_company_id and name = 'Prime Ingredients'
  limit 1;

  select id into pure_extracts_id
  from public.suppliers
  where company_id = target_company_id and name = 'Pure Extracts Ltd.'
  limit 1;

  insert into public.documents (
    company_id,
    supplier_id,
    name,
    document_type,
    status,
    expiry_date,
    file_name,
    uploaded_by,
    created_at
  )
  select
    target_company_id,
    supplier_id,
    document_name,
    document_type::public.document_type,
    status::public.document_status,
    expiry_date::date,
    file_name,
    target_user_id,
    created_at::timestamptz
  from (
    values
      (global_meats_id, 'Global Meats Halal Certificate', 'supplier_certificate', 'valid', '2026-10-12', 'global-meats-halal-certificate-2026.pdf', '2026-06-18 09:00:00+00'),
      (crescent_dairy_id, 'Crescent Dairy Renewal Certificate', 'supplier_certificate', 'expiring_soon', '2026-07-10', 'crescent-dairy-renewal-certificate.pdf', '2026-05-29 09:00:00+00'),
      (null, 'Q3 Sanitation Standard Operating Procedure', 'sop_document', 'needs_review', null, 'q3-sanitation-sop.docx', '2026-06-02 09:00:00+00'),
      (pure_extracts_id, 'Ingredient Traceability Log - Batch A124', 'ingredient_list', 'complete', null, 'ingredient-traceability-batch-a124.xlsx', '2026-06-21 09:00:00+00'),
      (prime_ingredients_id, 'Prime Ingredients Certificate', 'supplier_certificate', 'expired', '2026-05-30', 'prime-ingredients-certificate.pdf', '2026-01-05 09:00:00+00')
  ) as seed_data (
    supplier_id,
    document_name,
    document_type,
    status,
    expiry_date,
    file_name,
    created_at
  )
  where not exists (
    select 1
    from public.documents
    where company_id = target_company_id
      and name = seed_data.document_name
  );

  select id into global_certificate_id
  from public.documents
  where company_id = target_company_id and name = 'Global Meats Halal Certificate'
  limit 1;

  select id into crescent_certificate_id
  from public.documents
  where company_id = target_company_id and name = 'Crescent Dairy Renewal Certificate'
  limit 1;

  select id into sanitation_sop_id
  from public.documents
  where company_id = target_company_id and name = 'Q3 Sanitation Standard Operating Procedure'
  limit 1;

  select id into traceability_log_id
  from public.documents
  where company_id = target_company_id and name = 'Ingredient Traceability Log - Batch A124'
  limit 1;

  select id into prime_certificate_id
  from public.documents
  where company_id = target_company_id and name = 'Prime Ingredients Certificate'
  limit 1;

  insert into public.inventory_items (
    company_id,
    supplier_id,
    document_id,
    ingredient_risk_id,
    name,
    category,
    batch_number,
    quantity,
    unit,
    received_date,
    expiry_date,
    halal_status,
    risk_level,
    storage_location,
    notes
  )
  select
    target_company_id,
    supplier_id,
    document_id,
    ingredient_risk_id,
    item_name,
    category,
    batch_number,
    quantity,
    unit,
    received_date::date,
    expiry_date::date,
    halal_status::public.document_status,
    risk_level::public.halal_risk_level,
    storage_location,
    notes
  from (
    values
      (global_meats_id, global_certificate_id, null, 'Chicken Filling', 'Protein', 'CHK-2026-0701-A', 125.00, 'kg', '2026-06-25', '2026-08-25', 'valid', 'low', 'Cold Room A', 'Linked to Global Meats certificate. Keep batch receiving record for audit.'),
      (eastern_spices_id, traceability_log_id, vinegar_id, 'Food Vinegar', 'Acidulant', 'VIN-2026-0619-B', 48.00, 'L', '2026-06-19', '2027-06-19', 'complete', 'low', 'Dry Store 2', 'Low risk sample item with traceability evidence.'),
      (prime_ingredients_id, prime_certificate_id, e471_id, 'Emulsifier E471', 'Additive', 'E471-2026-0530-C', 18.50, 'kg', '2026-05-30', '2027-05-30', 'expired', 'medium', 'Dry Store 3', 'Supplier certificate is expired. Request updated source declaration before use.'),
      (pure_extracts_id, traceability_log_id, vanilla_extract_id, 'Vanilla Extract', 'Flavoring', 'VAN-2026-0621-D', 12.00, 'L', '2026-06-21', '2027-01-21', 'needs_review', 'medium', 'Flavour Cabinet', 'Check alcohol carrier and supplier certificate before production release.'),
      (prime_ingredients_id, prime_certificate_id, gelatin_id, 'Gelatin Powder', 'Gelling Agent', 'GEL-2026-0528-E', 9.00, 'kg', '2026-05-28', '2027-05-28', 'missing_document', 'high', 'Quarantine Shelf', 'High risk sample item. Do not rely on it without qualified halal review.')
  ) as seed_data (
    supplier_id,
    document_id,
    ingredient_risk_id,
    item_name,
    category,
    batch_number,
    quantity,
    unit,
    received_date,
    expiry_date,
    halal_status,
    risk_level,
    storage_location,
    notes
  )
  where not exists (
    select 1
    from public.inventory_items
    where company_id = target_company_id
      and batch_number = seed_data.batch_number
      and name = seed_data.item_name
  );

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
  select
    target_company_id,
    product_name,
    brand_name,
    manufacturer_name,
    certificate_number,
    certifying_body,
    certification_country,
    category,
    status::public.halal_certification_status,
    valid_from::date,
    valid_until::date,
    source_name,
    source_url,
    confidence_score,
    notes
  from (
    values
      ('Sample Chicken Curry Puff', 'Thayyib Demo Foods', 'Thayyib Demo Foods Sdn. Bhd.', 'SAMPLE-HALAL-2026-001', 'JAKIM / JAIN placeholder', 'Malaysia', 'Produk Makanan / Minuman', 'sample_data', '2026-01-01', '2026-12-31', 'Sample Data (Not Official JAKIM Record)', 'https://myehalal.halal.gov.my/portal-halal/v1/index.php', 0.45, 'Demo record only. Verify real certificate status in MYeHALAL before operational use.'),
      ('Sample Chocolate Cookies', 'Thayyib Demo Foods', 'Thayyib Demo Foods Sdn. Bhd.', 'SAMPLE-HALAL-2026-002', 'JAKIM / JAIN placeholder', 'Malaysia', 'Produk Makanan / Minuman', 'sample_data', '2026-02-01', '2026-11-30', 'Sample Data (Not Official JAKIM Record)', 'https://myehalal.halal.gov.my/portal-halal/v1/index.php', 0.45, 'Demo record only. Ingredient risks should be reviewed by a qualified halal compliance officer.')
  ) as seed_data (
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
  where not exists (
    select 1
    from public.halal_certifications
    where company_id = target_company_id
      and certificate_number = seed_data.certificate_number
  );

  select id into sample_curry_puff_id
  from public.halal_certifications
  where company_id = target_company_id and certificate_number = 'SAMPLE-HALAL-2026-001'
  limit 1;

  select id into sample_cookies_id
  from public.halal_certifications
  where company_id = target_company_id and certificate_number = 'SAMPLE-HALAL-2026-002'
  limit 1;

  insert into public.product_ingredients (
    company_id,
    halal_certification_id,
    ingredient_risk_id
  )
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
    recommendation_text,
    sources,
    confidence_score,
    model_name
  )
  select
    target_company_id,
    document_id,
    product_name,
    brand_name,
    input_text,
    detected_ingredients::jsonb,
    risk_summary,
    risk_level::public.halal_risk_level,
    'Potential risk detected. Please verify with a qualified halal compliance officer.',
    sources::jsonb,
    confidence_score,
    model_name
  from (
    values
      (
        traceability_log_id,
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
        traceability_log_id,
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
  where not exists (
    select 1
    from public.halal_ai_assessments
    where company_id = target_company_id
      and product_name = seed_data.product_name
      and model_name = seed_data.model_name
  );

  insert into public.audit_checklist_items (
    company_id,
    category,
    title,
    description,
    status,
    linked_document_id,
    sort_order
  )
  select
    target_company_id,
    category,
    title,
    description,
    status::public.document_status,
    linked_document_id,
    sort_order
  from (
    values
      ('Supplier Certificates', 'Cross-contamination prevention agreements signed', 'Supplier agreements are collected for active suppliers.', 'complete', global_certificate_id, 5),
      ('Supplier Certificates', 'Annual facility audit reports collected', 'Missing 1 document from Prime Ingredients.', 'missing_document', null, 6),
      ('SOP Documents', 'Sanitation Standard Operating Procedure', 'Needs Q3 update.', 'needs_review', sanitation_sop_id, 7)
  ) as seed_data (
    category,
    title,
    description,
    status,
    linked_document_id,
    sort_order
  )
  where not exists (
    select 1
    from public.audit_checklist_items
    where company_id = target_company_id
      and title = seed_data.title
  );

  update public.audit_checklist_items
  set
    status = 'complete',
    linked_document_id = coalesce(linked_document_id, global_certificate_id),
    description = 'Global Meats certificate verified. Crescent Dairy renewal is being tracked.'
  where company_id = target_company_id
    and title = 'Valid halal certificates for tier 1 suppliers';

  update public.audit_checklist_items
  set
    status = 'complete',
    linked_document_id = coalesce(linked_document_id, traceability_log_id),
    description = 'Batch A124 traceability log is uploaded.'
  where company_id = target_company_id
    and title = 'Ingredient traceability logs updated';

  update public.audit_checklist_items
  set
    status = 'complete',
    description = 'HAS manual placeholder is recorded for the demo workspace.'
  where company_id = target_company_id
    and title = 'Halal Assurance System manual uploaded';

  update public.audit_checklist_items
  set
    status = 'missing_document',
    description = 'Attach evidence from recent checks and corrective actions.'
  where company_id = target_company_id
    and title = 'Recent internal audit evidence uploaded';

  insert into public.notifications (
    company_id,
    title,
    detail,
    priority,
    is_read,
    created_at
  )
  select
    target_company_id,
    title,
    detail,
    priority,
    is_read,
    created_at::timestamptz
  from (
    values
      ('Crescent Dairy certificate expires soon', 'Certificate expires on Jul 10, 2026.', 'High', false, '2026-06-28 09:00:00+00'),
      ('Prime Ingredients certificate expired', 'Please upload an updated supplier certificate.', 'High', false, '2026-06-27 09:00:00+00'),
      ('Q3 sanitation SOP needs review', 'Checklist item is waiting for updated evidence.', 'Medium', true, '2026-06-25 09:00:00+00'),
      ('Eastern Spices Co. documents updated', 'New audit evidence was linked to the supplier profile.', 'Info', true, '2026-06-22 09:00:00+00')
  ) as seed_data (
    title,
    detail,
    priority,
    is_read,
    created_at
  )
  where not exists (
    select 1
    from public.notifications
    where company_id = target_company_id
      and title = seed_data.title
  );

  insert into public.activity_logs (
    company_id,
    user_id,
    action,
    entity_type,
    entity_id,
    created_at
  )
  select
    target_company_id,
    target_user_id,
    action,
    entity_type,
    entity_id,
    created_at::timestamptz
  from (
    values
      ('Created demo supplier workspace', 'company', target_company_id, '2026-06-18 09:00:00+00'),
      ('Uploaded Global Meats certificate metadata', 'document', global_certificate_id, '2026-06-18 09:05:00+00'),
      ('Flagged Prime Ingredients expired certificate', 'supplier', prime_ingredients_id, '2026-06-27 09:00:00+00')
  ) as seed_data (
    action,
    entity_type,
    entity_id,
    created_at
  )
  where not exists (
    select 1
    from public.activity_logs
    where company_id = target_company_id
      and action = seed_data.action
  );
end;
$$;

create or replace function public.current_user_company_ids()
returns setof uuid
language sql
security definer
set search_path = public
as $$
  select company_id
  from public.company_members
  where user_id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_company_id uuid;
  company_name text;
begin
  company_name := coalesce(new.raw_user_meta_data->>'company_name', 'Thayyib Demo Foods');

  insert into public.companies (name, primary_contact_email)
  values (company_name, new.email)
  returning id into new_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (new_company_id, new.id, 'admin');

  insert into public.audit_checklist_items (company_id, category, title, description, status, sort_order)
  values
    (new_company_id, 'Supplier Certificates', 'Valid halal certificates for tier 1 suppliers', 'Upload current supplier certificates and expiry dates.', 'missing_document', 1),
    (new_company_id, 'Product Ingredients', 'Ingredient traceability logs updated', 'Keep ingredient source records organized for audit review.', 'missing_document', 2),
    (new_company_id, 'SOP Documents', 'Halal Assurance System manual uploaded', 'Store the latest approved SOP or HAS manual.', 'missing_document', 3),
    (new_company_id, 'Audit Evidence', 'Recent internal audit evidence uploaded', 'Attach evidence from recent checks and corrective actions.', 'missing_document', 4);

  perform public.seed_demo_workspace(new_company_id, new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.ensure_user_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_company_id uuid;
  new_company_id uuid;
  current_email text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select company_id
  into existing_company_id
  from public.company_members
  where user_id = auth.uid()
  limit 1;

  if existing_company_id is not null then
    perform public.seed_demo_workspace(existing_company_id, auth.uid());
    return existing_company_id;
  end if;

  select email
  into current_email
  from auth.users
  where id = auth.uid();

  insert into public.companies (name, primary_contact_email)
  values ('Thayyib Demo Foods', current_email)
  returning id into new_company_id;

  insert into public.company_members (company_id, user_id, role)
  values (new_company_id, auth.uid(), 'admin');

  insert into public.audit_checklist_items (company_id, category, title, description, status, sort_order)
  values
    (new_company_id, 'Supplier Certificates', 'Valid halal certificates for tier 1 suppliers', 'Upload current supplier certificates and expiry dates.', 'missing_document', 1),
    (new_company_id, 'Product Ingredients', 'Ingredient traceability logs updated', 'Keep ingredient source records organized for audit review.', 'missing_document', 2),
    (new_company_id, 'SOP Documents', 'Halal Assurance System manual uploaded', 'Store the latest approved SOP or HAS manual.', 'missing_document', 3),
    (new_company_id, 'Audit Evidence', 'Recent internal audit evidence uploaded', 'Attach evidence from recent checks and corrective actions.', 'missing_document', 4);

  perform public.seed_demo_workspace(new_company_id, auth.uid());

  return new_company_id;
end;
$$;

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.suppliers enable row level security;
alter table public.documents enable row level security;
alter table public.audit_checklist_items enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.ingredient_risks enable row level security;
alter table public.halal_certifications enable row level security;
alter table public.product_ingredients enable row level security;
alter table public.halal_ai_assessments enable row level security;
alter table public.inventory_items enable row level security;

create policy "members can view their companies"
on public.companies for select
using (id in (select public.current_user_company_ids()));

create policy "admins can update company"
on public.companies for update
using (
  exists (
    select 1 from public.company_members
    where company_id = companies.id
      and user_id = auth.uid()
      and role = 'admin'
  )
);

create policy "members can view company members"
on public.company_members for select
using (company_id in (select public.current_user_company_ids()));

create policy "members can read suppliers"
on public.suppliers for select
using (company_id in (select public.current_user_company_ids()));

create policy "members can write suppliers"
on public.suppliers for all
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can read documents"
on public.documents for select
using (company_id in (select public.current_user_company_ids()));

create policy "members can write documents"
on public.documents for all
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can read audit checklist"
on public.audit_checklist_items for select
using (company_id in (select public.current_user_company_ids()));

create policy "members can update audit checklist"
on public.audit_checklist_items for all
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can read notifications"
on public.notifications for select
using (company_id in (select public.current_user_company_ids()));

create policy "members can insert notifications"
on public.notifications for insert
with check (company_id in (select public.current_user_company_ids()));

create policy "members can update notifications"
on public.notifications for update
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can delete notifications"
on public.notifications for delete
using (company_id in (select public.current_user_company_ids()));

create policy "members can read activity logs"
on public.activity_logs for select
using (company_id in (select public.current_user_company_ids()));

create policy "members can insert activity logs"
on public.activity_logs for insert
with check (company_id in (select public.current_user_company_ids()));

create policy "authenticated users can read ingredient risks"
on public.ingredient_risks for select
to authenticated
using (true);

create policy "members can read halal certifications"
on public.halal_certifications for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can insert halal certifications"
on public.halal_certifications for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

create policy "members can update halal certifications"
on public.halal_certifications for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can delete halal certifications"
on public.halal_certifications for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can read product ingredients"
on public.product_ingredients for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can insert product ingredients"
on public.product_ingredients for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

create policy "members can update product ingredients"
on public.product_ingredients for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can delete product ingredients"
on public.product_ingredients for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can read halal ai assessments"
on public.halal_ai_assessments for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can insert halal ai assessments"
on public.halal_ai_assessments for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

create policy "members can update halal ai assessments"
on public.halal_ai_assessments for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can delete halal ai assessments"
on public.halal_ai_assessments for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can read inventory items"
on public.inventory_items for select
to authenticated
using (company_id in (select public.current_user_company_ids()));

create policy "members can insert inventory items"
on public.inventory_items for insert
to authenticated
with check (company_id in (select public.current_user_company_ids()));

create policy "members can update inventory items"
on public.inventory_items for update
to authenticated
using (company_id in (select public.current_user_company_ids()))
with check (company_id in (select public.current_user_company_ids()));

create policy "members can delete inventory items"
on public.inventory_items for delete
to authenticated
using (company_id in (select public.current_user_company_ids()));

grant usage on schema public to authenticated;
grant select on public.ingredient_risks to authenticated;
grant select, insert, update, delete on public.halal_certifications to authenticated;
grant select, insert, update, delete on public.product_ingredients to authenticated;
grant select, insert, update, delete on public.halal_ai_assessments to authenticated;
grant select, insert, update, delete on public.inventory_items to authenticated;

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "members can read company document files"
on storage.objects for select
using (
  bucket_id = 'documents'
  and split_part(name, '/', 1)::uuid in (select public.current_user_company_ids())
);

create policy "members can upload company document files"
on storage.objects for insert
with check (
  bucket_id = 'documents'
  and split_part(name, '/', 1)::uuid in (select public.current_user_company_ids())
);

create policy "members can update company document files"
on storage.objects for update
using (
  bucket_id = 'documents'
  and split_part(name, '/', 1)::uuid in (select public.current_user_company_ids())
)
with check (
  bucket_id = 'documents'
  and split_part(name, '/', 1)::uuid in (select public.current_user_company_ids())
);
