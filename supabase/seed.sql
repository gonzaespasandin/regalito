-- Datos seed: ciudades y categorías base de Fase 1.
-- Idempotente: se puede correr varias veces sin duplicar.

insert into public.cities (name, province, slug) values
  ('Buenos Aires', 'CABA', 'buenos-aires'),
  ('Córdoba', 'Córdoba', 'cordoba'),
  ('Rosario', 'Santa Fe', 'rosario'),
  ('Mendoza', 'Mendoza', 'mendoza'),
  ('La Plata', 'Buenos Aires', 'la-plata')
on conflict (slug) do nothing;

insert into public.categories (name, slug, icon) values
  ('Cafetería', 'cafeteria', 'Coffee'),
  ('Heladería', 'heladeria', 'IceCream'),
  ('Restaurante', 'restaurante', 'UtensilsCrossed'),
  ('Indumentaria', 'indumentaria', 'Shirt'),
  ('Belleza', 'belleza', 'Sparkles'),
  ('Postres', 'postres', 'CakeSlice')
on conflict (slug) do nothing;
