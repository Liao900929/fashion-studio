-- ============================================================
-- Fashion Studio - Supabase Schema
-- ============================================================

-- =============== TABLES ===============

-- 品牌（系統預設 + 使用者自訂）
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,  -- NULL = 系統內建
  name text not null,
  logo_url text,
  created_at timestamptz default now()
);

create index if not exists brands_user_id_idx on brands(user_id);

-- 衣櫥單品
create table if not exists clothing_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  primary_image_url text not null,
  angle_image_urls text[] default '{}',
  category text not null,             -- hat|top|bottom|skirt|shoes|jacket|shirt|accessory|bag
  material text,                       -- cotton|denim|leather|knit|silk|wool|synthetic|other
  brand_id uuid references brands(id) on delete set null,
  color_hex text,                      -- 主色
  color_name text,
  palette jsonb,                       -- 多色調色盤 (top 5)
  season text[] default '{}',          -- ['spring','summer','fall','winter']
  ai_tags jsonb,                       -- 完整 AI 回應快取
  notes text,
  times_worn integer default 0,
  last_worn_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists clothing_items_user_id_idx on clothing_items(user_id);
create index if not exists clothing_items_category_idx on clothing_items(user_id, category);

-- 搭配組合
create table if not exists outfits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  cover_image_url text,
  style_tags text[] default '{}',       -- ['street','minimal','old-money','y2k',...]
  item_ids uuid[] default '{}',
  occasion text,                        -- 日常|約會|上班|派對|運動|...
  ai_advice text,
  worn_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists outfits_user_id_idx on outfits(user_id);

-- 流行趨勢快取
create table if not exists trend_cache (
  id uuid primary key default gen_random_uuid(),
  season_key text not null unique,      -- '2026-spring'
  source text not null,                  -- 'milan-fw'|'paris-fw'|'claude-generated'
  trends jsonb not null,                 -- {key_styles, colors, silhouettes, key_pieces, ...}
  refreshed_at timestamptz default now()
);

-- =============== STORAGE ===============

-- 衣物圖片儲存桶（在 Supabase Dashboard 手動建立 'clothing' bucket，設 Public）
-- 公開桶只開放「讀」，「寫」需要下列政策，否則上傳會報 RLS error

drop policy if exists "clothing read" on storage.objects;
create policy "clothing read" on storage.objects for select
  using (bucket_id = 'clothing');

drop policy if exists "clothing insert" on storage.objects;
create policy "clothing insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'clothing');

drop policy if exists "clothing update" on storage.objects;
create policy "clothing update" on storage.objects for update to authenticated
  using (bucket_id = 'clothing');

drop policy if exists "clothing delete" on storage.objects;
create policy "clothing delete" on storage.objects for delete to authenticated
  using (bucket_id = 'clothing');

-- =============== RLS POLICIES ===============

alter table brands enable row level security;
alter table clothing_items enable row level security;
alter table outfits enable row level security;
alter table trend_cache enable row level security;

-- brands: 自己看自己 + 系統內建
drop policy if exists "brands read" on brands;
create policy "brands read" on brands for select
  using (user_id is null or user_id = auth.uid());

drop policy if exists "brands write own" on brands;
create policy "brands write own" on brands for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- clothing_items: 只能操作自己的
drop policy if exists "items rw own" on clothing_items;
create policy "items rw own" on clothing_items for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- outfits: 只能操作自己的
drop policy if exists "outfits rw own" on outfits;
create policy "outfits rw own" on outfits for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- trend_cache: 所有登入使用者可讀
drop policy if exists "trends read" on trend_cache;
create policy "trends read" on trend_cache for select
  using (auth.role() = 'authenticated');

-- =============== SEED BRANDS ===============

insert into brands (name, user_id) values
  ('Uniqlo', null), ('Zara', null), ('H&M', null), ('GU', null), ('Muji', null),
  ('Nike', null), ('Adidas', null), ('New Balance', null), ('Converse', null), ('Vans', null),
  ('A.P.C.', null), ('Acne Studios', null), ('COS', null), ('Arket', null), ('Lemaire', null),
  ('Comme des Garçons', null), ('Issey Miyake', null), ('Yohji Yamamoto', null),
  ('Maison Margiela', null), ('Loewe', null), ('The Row', null), ('Prada', null),
  ('Gucci', null), ('Saint Laurent', null), ('Bottega Veneta', null), ('Celine', null),
  ('Hermès', null), ('Chanel', null), ('Louis Vuitton', null), ('Dior', null),
  ('Carhartt', null), ('Patagonia', null), ('The North Face', null), ('Arcteryx', null),
  ('Stussy', null), ('Supreme', null), ('Palace', null), ('Off-White', null),
  ('Balenciaga', null), ('Rick Owens', null), ('Y-3', null), ('Ami Paris', null),
  ('Polo Ralph Lauren', null), ('Tommy Hilfiger', null), ('Levi''s', null),
  ('Champion', null), ('Fila', null), ('Puma', null), ('Asics', null), ('Salomon', null),
  -- 日系大眾 / 百貨品牌
  ('niko and...', null), ('nano universe', null), ('BEAMS', null), ('UNITED ARROWS', null),
  ('SHIPS', null), ('URBAN RESEARCH', null), ('JOURNAL STANDARD', null), ('GLOBAL WORK', null),
  ('earth music&ecology', null), ('LOWRYS FARM', null), ('WEGO', null), ('studio CLIP', null),
  ('COMME CA', null), ('snidel', null), ('GELATO PIQUE', null), ('archives', null),
  ('Right-on', null), ('coen', null), ('HARE', null), ('STUDIOUS', null), ('GU', null),
  ('sacai', null), ('Kapital', null), ('visvim', null), ('WTAPS', null), ('NEIGHBORHOOD', null),
  ('HUMAN MADE', null), ('A BATHING APE', null), ('UNDERCOVER', null), ('mont-bell', null),
  ('and wander', null), ('BEAUTY&YOUTH', null), ('FREAK''S STORE', null), ('niko', null)
on conflict do nothing;
