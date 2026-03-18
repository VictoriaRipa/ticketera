-- Seed categories for EventAccess
INSERT INTO public.categories (name, slug, icon) VALUES
  ('Conciertos', 'conciertos', 'music'),
  ('Festivales', 'festivales', 'sparkles'),
  ('Teatro', 'teatro', 'drama'),
  ('Deportes', 'deportes', 'trophy'),
  ('Conferencias', 'conferencias', 'presentation'),
  ('Fiestas', 'fiestas', 'party-popper'),
  ('Arte & Cultura', 'arte-cultura', 'palette'),
  ('Gastronomía', 'gastronomia', 'utensils'),
  ('Tecnología', 'tecnologia', 'cpu'),
  ('Familia', 'familia', 'users')
ON CONFLICT (slug) DO NOTHING;
