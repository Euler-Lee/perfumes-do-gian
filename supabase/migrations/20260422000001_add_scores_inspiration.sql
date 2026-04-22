-- =============================================================================
-- Migration: Occasion scores, olfactory inspiration, bottle photos
-- Adds score_casual, score_formal, score_aberto, score_fechado to perfumes
-- Adds inspiracao (famous perfume reference) and foto_url to perfumes
-- Adds imagem_url to categorias
-- Updates all prices to R$ 150–700 range (contratipo pricing)
-- =============================================================================

-- New columns on perfumes
ALTER TABLE public.perfumes
  ADD COLUMN IF NOT EXISTS score_casual  SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS score_formal  SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS score_aberto  SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS score_fechado SMALLINT NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS inspiracao    TEXT,
  ADD COLUMN IF NOT EXISTS foto_url      TEXT;

-- New column on categorias
ALTER TABLE public.categorias
  ADD COLUMN IF NOT EXISTS imagem_url TEXT;

-- ─── Category background images (Unsplash) ───────────────────────────────────
UPDATE public.categorias SET imagem_url = 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&auto=format&fit=crop'
  WHERE id = 'c0000001-0000-0000-0000-000000000001'; -- Árabes & Orientais

UPDATE public.categorias SET imagem_url = 'https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=600&auto=format&fit=crop'
  WHERE id = 'c0000001-0000-0000-0000-000000000002'; -- Frescos & Cítricos

UPDATE public.categorias SET imagem_url = 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&auto=format&fit=crop'
  WHERE id = 'c0000001-0000-0000-0000-000000000003'; -- Madeirosos & Ambarados

UPDATE public.categorias SET imagem_url = 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop'
  WHERE id = 'c0000001-0000-0000-0000-000000000004'; -- Especiados & Exóticos

UPDATE public.categorias SET imagem_url = 'https://images.unsplash.com/photo-1490750967868-88df5691cc9f?w=600&auto=format&fit=crop'
  WHERE id = 'c0000001-0000-0000-0000-000000000005'; -- Florais & Românticos

-- ─── Perfume data: scores + inspiração + foto + preço ─────────────────────────

-- Oud Wood (Tom Ford) — árabe intenso
UPDATE public.perfumes SET
  score_casual = 40, score_formal = 92, score_aberto = 28, score_fechado = 97,
  inspiracao = 'Tom Ford Oud Wood (Original)',
  foto_url   = 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop',
  preco      = 559.00
WHERE id = 'b0000001-0000-0000-0000-000000000001';

-- Amber Oud Gold (Al Haramain)
UPDATE public.perfumes SET
  score_casual = 55, score_formal = 82, score_aberto = 32, score_fechado = 90,
  foto_url   = 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=400&auto=format&fit=crop',
  preco      = 329.00
WHERE id = 'b0000001-0000-0000-0000-000000000002';

-- Oud Ispahan (Dior) — oriental profundo
UPDATE public.perfumes SET
  score_casual = 35, score_formal = 95, score_aberto = 22, score_fechado = 98,
  inspiracao = 'Christian Dior Oud Ispahan (Original)',
  foto_url   = 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&auto=format&fit=crop',
  preco      = 649.00
WHERE id = 'b0000001-0000-0000-0000-000000000003';

-- Interlude Man (Amouage)
UPDATE public.perfumes SET
  score_casual = 42, score_formal = 88, score_aberto = 38, score_fechado = 88,
  inspiracao = 'Amouage Interlude Man (Original)',
  foto_url   = 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400&auto=format&fit=crop',
  preco      = 589.00
WHERE id = 'b0000001-0000-0000-0000-000000000004';

-- Acqua di Giò (Armani)
UPDATE public.perfumes SET
  score_casual = 92, score_formal = 58, score_aberto = 88, score_fechado = 60,
  foto_url   = 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop',
  preco      = 389.00
WHERE id = 'b0000001-0000-0000-0000-000000000005';

-- Bleu de Chanel
UPDATE public.perfumes SET
  score_casual = 75, score_formal = 85, score_aberto = 65, score_fechado = 78,
  foto_url   = 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=400&auto=format&fit=crop',
  preco      = 459.00
WHERE id = 'b0000001-0000-0000-0000-000000000006';

-- Light Blue (D&G)
UPDATE public.perfumes SET
  score_casual = 88, score_formal = 45, score_aberto = 92, score_fechado = 52,
  foto_url   = 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&auto=format&fit=crop',
  preco      = 299.00
WHERE id = 'b0000001-0000-0000-0000-000000000007';

-- Sauvage (Dior)
UPDATE public.perfumes SET
  score_casual = 72, score_formal = 80, score_aberto = 68, score_fechado = 75,
  foto_url   = 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400&auto=format&fit=crop',
  preco      = 499.00
WHERE id = 'b0000001-0000-0000-0000-000000000008';

-- Aventus (Creed)
UPDATE public.perfumes SET
  score_casual = 60, score_formal = 90, score_aberto = 55, score_fechado = 82,
  inspiracao = 'Creed Aventus (Original)',
  foto_url   = 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop',
  preco      = 699.00
WHERE id = 'b0000001-0000-0000-0000-000000000009';

-- Baccarat Rouge 540 (MFK)
UPDATE public.perfumes SET
  score_casual = 55, score_formal = 88, score_aberto = 42, score_fechado = 95,
  inspiracao = 'Maison Francis Kurkdjian Baccarat Rouge 540 (Original)',
  foto_url   = 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=400&auto=format&fit=crop',
  preco      = 699.00
WHERE id = 'b0000001-0000-0000-0000-000000000010';

-- 1 Million (Paco Rabanne)
UPDATE public.perfumes SET
  score_casual = 70, score_formal = 78, score_aberto = 58, score_fechado = 80,
  foto_url   = 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&auto=format&fit=crop',
  preco      = 349.00
WHERE id = 'b0000001-0000-0000-0000-000000000011';

-- Tobacco Vanille (Tom Ford)
UPDATE public.perfumes SET
  score_casual = 45, score_formal = 85, score_aberto = 30, score_fechado = 92,
  inspiracao = 'Tom Ford Tobacco Vanille (Original)',
  foto_url   = 'https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=400&auto=format&fit=crop',
  preco      = 579.00
WHERE id = 'b0000001-0000-0000-0000-000000000012';

-- Spicebomb (Viktor&Rolf)
UPDATE public.perfumes SET
  score_casual = 65, score_formal = 75, score_aberto = 50, score_fechado = 82,
  foto_url   = 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&auto=format&fit=crop',
  preco      = 379.00
WHERE id = 'b0000001-0000-0000-0000-000000000013';

-- La Nuit de l'Homme (YSL)
UPDATE public.perfumes SET
  score_casual = 62, score_formal = 82, score_aberto = 48, score_fechado = 88,
  foto_url   = 'https://images.unsplash.com/photo-1557170334-a9632e77c6e4?w=400&auto=format&fit=crop',
  preco      = 329.00
WHERE id = 'b0000001-0000-0000-0000-000000000014';

-- A*Men (Mugler)
UPDATE public.perfumes SET
  score_casual = 58, score_formal = 70, score_aberto = 42, score_fechado = 85,
  foto_url   = 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400&auto=format&fit=crop',
  preco      = 249.00
WHERE id = 'b0000001-0000-0000-0000-000000000015';
