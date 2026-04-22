-- Migration: setup inicial Perfumes do Gian
-- Created: 2026-04-20

-- ── 1. Categorias ──────────────────────────────────────────────────────────────
create table if not exists public.categorias (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  nome       text not null,
  descricao  text,
  icone      text,
  criado_em  timestamptz not null default now()
);

alter table public.categorias enable row level security;

create policy "select_own_categorias" on public.categorias
  for select using (auth.uid() = user_id);
create policy "insert_own_categorias" on public.categorias
  for insert with check (auth.uid() = user_id);
create policy "update_own_categorias" on public.categorias
  for update using (auth.uid() = user_id);
create policy "delete_own_categorias" on public.categorias
  for delete using (auth.uid() = user_id);

-- ── 2. Perfumes ────────────────────────────────────────────────────────────────
create table if not exists public.perfumes (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  categoria_id     uuid references public.categorias(id) on delete set null,
  nome             text not null,
  marca            text,
  tipo             text not null check (tipo in ('arabe', 'importado')),
  concentracao     text,
  familia_olfativa text,
  descricao        text,
  volume_ml        integer,
  preco            numeric(10, 2),
  criado_em        timestamptz not null default now()
);

alter table public.perfumes enable row level security;

create policy "select_own_perfumes" on public.perfumes
  for select using (auth.uid() = user_id);
create policy "insert_own_perfumes" on public.perfumes
  for insert with check (auth.uid() = user_id);
create policy "update_own_perfumes" on public.perfumes
  for update using (auth.uid() = user_id);
create policy "delete_own_perfumes" on public.perfumes
  for delete using (auth.uid() = user_id);

-- ── 3. Usos por ambiente ───────────────────────────────────────────────────────
create table if not exists public.usos_perfume (
  id          uuid primary key default gen_random_uuid(),
  perfume_id  uuid not null references public.perfumes(id) on delete cascade,
  ambiente    text not null check (ambiente in ('trabalho','casual','noite','eventos','verao','inverno')),
  percentual  numeric(5, 2) not null check (percentual >= 0 and percentual <= 100),
  unique (perfume_id, ambiente)
);

-- usos_perfume herda segurança via join com perfumes (sem RLS própria)
-- Opcional: adicionar RLS com join se necessário
alter table public.usos_perfume enable row level security;

create policy "select_usos_via_perfume" on public.usos_perfume
  for select using (
    exists (
      select 1 from public.perfumes p
      where p.id = usos_perfume.perfume_id
        and p.user_id = auth.uid()
    )
  );
create policy "insert_usos_via_perfume" on public.usos_perfume
  for insert with check (
    exists (
      select 1 from public.perfumes p
      where p.id = usos_perfume.perfume_id
        and p.user_id = auth.uid()
    )
  );
create policy "update_usos_via_perfume" on public.usos_perfume
  for update using (
    exists (
      select 1 from public.perfumes p
      where p.id = usos_perfume.perfume_id
        and p.user_id = auth.uid()
    )
  );
create policy "delete_usos_via_perfume" on public.usos_perfume
  for delete using (
    exists (
      select 1 from public.perfumes p
      where p.id = usos_perfume.perfume_id
        and p.user_id = auth.uid()
    )
  );

-- ── 4. Coleção pessoal ─────────────────────────────────────────────────────────
create table if not exists public.colecao (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  perfume_id  uuid not null references public.perfumes(id) on delete cascade,
  quantidade  integer not null default 1,
  notas       text,
  na_colecao  boolean not null default true,
  criado_em   timestamptz not null default now(),
  unique (user_id, perfume_id)
);

alter table public.colecao enable row level security;

create policy "select_own_colecao" on public.colecao
  for select using (auth.uid() = user_id);
create policy "insert_own_colecao" on public.colecao
  for insert with check (auth.uid() = user_id);
create policy "update_own_colecao" on public.colecao
  for update using (auth.uid() = user_id);
create policy "delete_own_colecao" on public.colecao
  for delete using (auth.uid() = user_id);
