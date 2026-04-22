-- =============================================================================
-- Migration: Store schema + seed data — Perfumes do Gian
-- Drops old user-specific catalog, creates public store catalog
-- + cart, orders tables + seed data (5 categories, 15 perfumes)
-- =============================================================================

-- Drop old tables (cascade handles FK deps)
drop table if exists public.colecao       cascade;
drop table if exists public.usos_perfume  cascade;
drop table if exists public.perfumes      cascade;
drop table if exists public.categorias    cascade;

-- ── Categorias (catálogo público) ────────────────────────────────────────────
create table public.categorias (
  id        uuid primary key default gen_random_uuid(),
  nome      text not null,
  descricao text,
  ordem     integer not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.categorias enable row level security;
create policy "public_read_categorias" on public.categorias for select using (true);

-- ── Perfumes (catálogo público) ───────────────────────────────────────────────
create table public.perfumes (
  id               uuid primary key default gen_random_uuid(),
  categoria_id     uuid references public.categorias(id) on delete set null,
  nome             text not null,
  marca            text not null,
  tipo             text not null check (tipo in ('arabe','importado')),
  concentracao     text,
  familia_olfativa text,
  descricao        text,
  volume_ml        integer,
  preco            numeric(10,2) not null,
  estoque          integer not null default 0,
  destaque         boolean not null default false,
  criado_em        timestamptz not null default now()
);
alter table public.perfumes enable row level security;
create policy "public_read_perfumes" on public.perfumes for select using (true);

-- ── Usos por ambiente (catálogo público) ─────────────────────────────────────
create table public.usos_perfume (
  id         uuid primary key default gen_random_uuid(),
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  ambiente   text not null check (ambiente in ('trabalho','casual','noite','eventos','verao','inverno')),
  percentual numeric(5,2) not null check (percentual >= 0 and percentual <= 100),
  unique (perfume_id, ambiente)
);
alter table public.usos_perfume enable row level security;
create policy "public_read_usos" on public.usos_perfume for select using (true);

-- ── Carrinho (por usuário) ────────────────────────────────────────────────────
create table public.carrinho (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  quantidade integer not null default 1 check (quantidade > 0),
  criado_em  timestamptz not null default now(),
  unique (user_id, perfume_id)
);
alter table public.carrinho enable row level security;
create policy "select_carrinho" on public.carrinho for select using (auth.uid() = user_id);
create policy "insert_carrinho" on public.carrinho for insert with check (auth.uid() = user_id);
create policy "update_carrinho" on public.carrinho for update using (auth.uid() = user_id);
create policy "delete_carrinho" on public.carrinho for delete using (auth.uid() = user_id);

-- ── Pedidos ───────────────────────────────────────────────────────────────────
create table public.pedidos (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  status            text not null default 'pendente'
                    check (status in ('pendente','confirmado','enviado','entregue','cancelado')),
  total             numeric(10,2) not null,
  nome_destinatario text,
  telefone          text,
  endereco          text,
  cidade            text,
  cep               text,
  observacoes       text,
  criado_em         timestamptz not null default now()
);
alter table public.pedidos enable row level security;
create policy "select_pedidos" on public.pedidos for select using (auth.uid() = user_id);
create policy "insert_pedidos" on public.pedidos for insert with check (auth.uid() = user_id);
create policy "update_pedidos" on public.pedidos for update using (auth.uid() = user_id);

-- ── Itens do pedido ───────────────────────────────────────────────────────────
create table public.pedido_itens (
  id             uuid primary key default gen_random_uuid(),
  pedido_id      uuid not null references public.pedidos(id) on delete cascade,
  perfume_id     uuid not null references public.perfumes(id),
  quantidade     integer not null,
  preco_unitario numeric(10,2) not null
);
alter table public.pedido_itens enable row level security;
create policy "select_pedido_itens" on public.pedido_itens
  for select using (
    exists (select 1 from public.pedidos p where p.id = pedido_itens.pedido_id and p.user_id = auth.uid())
  );
create policy "insert_pedido_itens" on public.pedido_itens
  for insert with check (
    exists (select 1 from public.pedidos p where p.id = pedido_itens.pedido_id and p.user_id = auth.uid())
  );

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Categorias
insert into public.categorias (id, nome, descricao, ordem) values
  ('c0000001-0000-0000-0000-000000000001', 'Árabes & Orientais',   'Fragrâncias do oriente com notas de oud, âmbar e especiarias. Intensas, longevas e marcantes.',    1),
  ('c0000001-0000-0000-0000-000000000002', 'Frescos & Cítricos',   'Perfumes leves e sofisticados com notas aquáticas, cítricas e herbais. Ideais para o dia a dia.', 2),
  ('c0000001-0000-0000-0000-000000000003', 'Madeirosos & Ambarados','Composições ricas em sândalo, cedro e âmbar. Elegantes, profundos e com longa fixação.',          3),
  ('c0000001-0000-0000-0000-000000000004', 'Especiados & Exóticos', 'Fragrâncias ousadas com pimenta, tabaco e notas gourmand. Para quem quer ser notado.',             4),
  ('c0000001-0000-0000-0000-000000000005', 'Florais & Românticos',  'Composições sensuais com lavanda, baunilha e almíscar. Sofisticados para todas as ocasiões.',       5);

-- Perfumes
insert into public.perfumes (id, categoria_id, nome, marca, tipo, concentracao, familia_olfativa, descricao, volume_ml, preco, estoque, destaque) values

-- Árabes & Orientais
('b0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001',
 'Oud Wood', 'Tom Ford', 'arabe', 'EDP', 'Oriental Amadeirado',
 'Uma ode sofisticada à madeira de oud. Notas de madeira de oud rara, sândalo rosado e vetiver criam uma composição densa e envolvente. De longa duração e sillage imponente, é um dos ícones da perfumaria árabe contemporânea.',
 50, 2890.00, 5, true),

('b0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001',
 'Amber Oud Gold', 'Al Haramain', 'arabe', 'EDP', 'Oriental Âmbarado',
 'Composição oriental de luxo que combina notas de âmbar quente, oud purificado e baunilha rica. Envolvente desde a primeira aplicação, projeta sofisticação árabe com um toque moderno irresistível.',
 120, 340.00, 20, false),

('b0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001',
 'Oud Ispahan', 'Christian Dior', 'arabe', 'EDP', 'Oriental Floral',
 'Criado pela Maison Dior em homenagem à cidade persa de Isfahan. Notas de oud damasceno, rosa e labdano formam uma composição majestosa e refinada. Presença marcante com uma elegância inconfundível.',
 125, 3200.00, 3, true),

('b0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000001',
 'Interlude Man', 'Amouage', 'arabe', 'EDP', 'Oriental Amadeirado',
 'Uma das fragrâncias mais aclamadas da marca omanense Amouage. Nota de abertura incenso e pimenta, coração floral e fundo de âmbar e oud. Complexo, nobre e de longa duração — para os que apreciam o extraordinário.',
 100, 2100.00, 6, false),

-- Frescos & Cítricos
('b0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002',
 'Acqua di Giò', 'Giorgio Armani', 'importado', 'EDT', 'Aquático Aromático',
 'Clássico atemporal inspirado nas águas do Mediterrâneo. Notas de bergamota, neroli e madeira de cedro criam uma composição fresca e elegante. Um dos perfumes masculinos mais vendidos no mundo por décadas.',
 100, 620.00, 18, false),

('b0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000002',
 'Bleu de Chanel', 'Chanel', 'importado', 'EDP', 'Aromático Amadeirado',
 'Liberdade e determinação capturadas em um frasco icônico. Notas de limão, menta, incenso e sândalo formam uma composição versátil que transita entre o casual refinado e o formal. O perfume do homem moderno.',
 100, 850.00, 15, true),

('b0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000002',
 'Light Blue', 'Dolce & Gabbana', 'importado', 'EDT', 'Aquático Aromático',
 'A leveza do verão siciliano em um frasco. Notas de bergamota, toranja e maçã siciliana com fundo de musgo e âmbar. Fresco, descontraído e sofisticado — perfeito para o dia a dia.',
 125, 480.00, 22, false),

-- Madeirosos & Ambarados
('b0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000003',
 'Sauvage', 'Christian Dior', 'importado', 'EDP', 'Aromático Amadeirado',
 'A fragrância selvagem e elegante que redefiniu a perfumaria masculina contemporânea. Notas de bergamota de Calábria, pimenta Sichuan e âmbar. Versátil e marcante, é referência de sofisticação.',
 100, 750.00, 14, true),

('b0000001-0000-0000-0000-000000000009', 'c0000001-0000-0000-0000-000000000003',
 'Aventus', 'Creed', 'importado', 'EDP', 'Frutal Amadeirado',
 'O perfume do sucesso e do poder. Criado pela família Creed em 2010, com notas de abacaxi, groselha preta, bétula e almíscar. Referência absoluta em perfumaria de luxo, cobiçado por colecionadores do mundo todo.',
 100, 4500.00, 4, true),

('b0000001-0000-0000-0000-000000000010', 'c0000001-0000-0000-0000-000000000003',
 'Baccarat Rouge 540', 'Maison Francis Kurkdjian', 'importado', 'EDP', 'Floral Amadeirado',
 'Criado em homenagem à cristaleria Baccarat, é considerado um dos perfumes mais exclusivos e desejados do mundo. Notas de açafrão, jasmim, âmbar e madeira de cedro. Icônico, sensual e absolutamente luxuoso.',
 70, 5800.00, 2, true),

-- Especiados & Exóticos
('b0000001-0000-0000-0000-000000000011', 'c0000001-0000-0000-0000-000000000004',
 '1 Million', 'Paco Rabanne', 'importado', 'EDT', 'Oriental Especiado',
 'Um aroma que exala poder, sedução e extravagância. Notas de toranja vermelha, menta, canela, rosa e couro criam uma composição ousada e inesquecível. Para os que não passam despercebidos.',
 100, 490.00, 25, false),

('b0000001-0000-0000-0000-000000000012', 'c0000001-0000-0000-0000-000000000004',
 'Tobacco Vanille', 'Tom Ford', 'importado', 'EDP', 'Oriental Gourmand',
 'Uma celebração de ingredientes ricos e sensuais. Tabaco curado, especiarias suaves, baunilha e cacau se unem em uma composição quente e acolhedora. Um dos perfumes unissex mais icônicos da história.',
 50, 2650.00, 7, false),

('b0000001-0000-0000-0000-000000000013', 'c0000001-0000-0000-0000-000000000004',
 'Spicebomb', 'Viktor & Rolf', 'importado', 'EDT', 'Aromático Especiado',
 'Uma explosão de especiarias calibrada com precisão. Pimenta, bergamota, tabaco e couro criam uma fragrância masculina ousada e memorável. Frasco inspirado em uma granada — impactante em cada detalhe.',
 90, 520.00, 11, false),

-- Florais & Românticos
('b0000001-0000-0000-0000-000000000014', 'c0000001-0000-0000-0000-000000000005',
 'La Nuit de l''Homme', 'Yves Saint Laurent', 'importado', 'EDT', 'Oriental Aromático',
 'Um convite irresistível para a noite. Cardamomo, lavanda e cedro formam uma composição sedutora e sofisticada. Confiante, sensual e elegante — o perfume ideal para ocasiões especiais e encontros marcantes.',
 100, 480.00, 16, false),

('b0000001-0000-0000-0000-000000000015', 'c0000001-0000-0000-0000-000000000005',
 'A*Men', 'Thierry Mugler', 'importado', 'EDT', 'Oriental Gourmand',
 'Um clássico ousado que une o masculino e o gourmand de forma inédita. Notas de café expresso, alcaçuz, caramelo e patchouli. Intenso, marcante e único — para homens que não seguem regras.',
 100, 320.00, 22, false);

-- Usos por ambiente — seleção para perfumes destaque
insert into public.usos_perfume (perfume_id, ambiente, percentual) values
-- Oud Wood
('b0000001-0000-0000-0000-000000000001','noite',95),('b0000001-0000-0000-0000-000000000001','eventos',90),('b0000001-0000-0000-0000-000000000001','inverno',85),('b0000001-0000-0000-0000-000000000001','casual',50),('b0000001-0000-0000-0000-000000000001','trabalho',40),('b0000001-0000-0000-0000-000000000001','verao',20),
-- Oud Ispahan
('b0000001-0000-0000-0000-000000000003','eventos',95),('b0000001-0000-0000-0000-000000000003','noite',90),('b0000001-0000-0000-0000-000000000003','inverno',85),('b0000001-0000-0000-0000-000000000003','trabalho',55),('b0000001-0000-0000-0000-000000000003','casual',45),('b0000001-0000-0000-0000-000000000003','verao',15),
-- Bleu de Chanel
('b0000001-0000-0000-0000-000000000006','trabalho',95),('b0000001-0000-0000-0000-000000000006','casual',90),('b0000001-0000-0000-0000-000000000006','eventos',80),('b0000001-0000-0000-0000-000000000006','verao',70),('b0000001-0000-0000-0000-000000000006','noite',65),('b0000001-0000-0000-0000-000000000006','inverno',60),
-- Sauvage
('b0000001-0000-0000-0000-000000000008','casual',90),('b0000001-0000-0000-0000-000000000008','trabalho',85),('b0000001-0000-0000-0000-000000000008','eventos',75),('b0000001-0000-0000-0000-000000000008','noite',70),('b0000001-0000-0000-0000-000000000008','verao',65),('b0000001-0000-0000-0000-000000000008','inverno',55),
-- Aventus
('b0000001-0000-0000-0000-000000000009','trabalho',95),('b0000001-0000-0000-0000-000000000009','eventos',90),('b0000001-0000-0000-0000-000000000009','casual',85),('b0000001-0000-0000-0000-000000000009','noite',75),('b0000001-0000-0000-0000-000000000009','verao',60),('b0000001-0000-0000-0000-000000000009','inverno',55),
-- Baccarat Rouge 540
('b0000001-0000-0000-0000-000000000010','eventos',98),('b0000001-0000-0000-0000-000000000010','noite',95),('b0000001-0000-0000-0000-000000000010','inverno',80),('b0000001-0000-0000-0000-000000000010','trabalho',60),('b0000001-0000-0000-0000-000000000010','casual',50),('b0000001-0000-0000-0000-000000000010','verao',25);
