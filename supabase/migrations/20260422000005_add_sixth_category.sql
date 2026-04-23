-- Add 6th category: Notas Exclusivas
INSERT INTO public.categorias (id, nome, descricao, ordem, imagem_url)
VALUES (
  'c0000001-0000-0000-0000-000000000006',
  'Notas Exclusivas',
  'Criações raras de alta perfumaria, seleção especial do Gian',
  6,
  'https://images.unsplash.com/photo-1581803118522-7b72a50f7e9f?w=600&auto=format&fit=crop'
)
ON CONFLICT (id) DO NOTHING;
