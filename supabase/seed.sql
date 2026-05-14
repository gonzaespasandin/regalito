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

-- Regalitos de ejemplo (Fase 1). Marcas plausibles para poblar el listado.
insert into public.gifts
  (slug, name, business_name, description, requirements, address, city_id, category_id, source_url, status)
values
  (
    'starbucks-bebida-gratis',
    'Bebida gratis en tu cumpleaños',
    'Starbucks',
    'El día de tu cumpleaños te regalan una bebida del tamaño que quieras, sin necesidad de consumir nada antes.',
    array['Tener cuenta en Starbucks Rewards', 'Haber sumado al menos 1 estrella', 'Mostrar el cupón desde la app'],
    'Todas las sucursales',
    (select id from public.cities where slug = 'buenos-aires'),
    (select id from public.categories where slug = 'cafeteria'),
    'https://www.starbucks.com.ar/rewards',
    'active'
  ),
  (
    'havanna-cafe-alfajor',
    'Café con un alfajor de regalo',
    'Havanna',
    'En tu cumple, comprando un café te regalan un alfajor Havanna clásico.',
    array['Ser parte del Club Havanna', 'Presentar DNI con la fecha de nacimiento'],
    'Sucursales adheridas',
    (select id from public.cities where slug = 'cordoba'),
    (select id from public.categories where slug = 'cafeteria'),
    'https://www.havanna.com.ar',
    'active'
  ),
  (
    'freddo-cucurucho-gratis',
    'Cucurucho gratis el día de tu cumple',
    'Freddo',
    'Te regalan un cucurucho de un sabor a elección el día de tu cumpleaños.',
    array['Tener la app de Freddo', 'Cargar la fecha de nacimiento en el perfil'],
    'Todas las sucursales',
    (select id from public.cities where slug = 'buenos-aires'),
    (select id from public.categories where slug = 'heladeria'),
    'https://www.freddo.com.ar',
    'active'
  ),
  (
    'grido-helado-cumple',
    'Helado gratis en tu día',
    'Grido',
    'Promo de cumpleaños: un balde de helado de 1/4 kg sin cargo.',
    array['Registrarte en el Club Grido', 'Validar el cumpleaños con DNI en el local'],
    'Sucursales adheridas',
    (select id from public.cities where slug = 'rosario'),
    (select id from public.categories where slug = 'heladeria'),
    'https://www.grido.com.ar',
    'active'
  ),
  (
    'mcdonalds-postre-gratis',
    'Postre gratis con tu combo',
    'McDonald''s',
    'En tu cumpleaños, comprando un combo te regalan un sundae o un McFlurry.',
    array['Tener la app de McDonald''s', 'Canjear el cupón de cumpleaños desde la app'],
    'Todas las sucursales',
    (select id from public.cities where slug = 'buenos-aires'),
    (select id from public.categories where slug = 'restaurante'),
    'https://www.mcdonalds.com.ar',
    'active'
  ),
  (
    'mostaza-combo-descuento',
    'Combo de cumpleaños con descuento',
    'Mostaza',
    'Descuento especial en combos seleccionados durante la semana de tu cumpleaños.',
    array['Ser parte del Club Mostaza', 'Mostrar el cupón en caja'],
    'Sucursales adheridas',
    (select id from public.cities where slug = 'la-plata'),
    (select id from public.categories where slug = 'restaurante'),
    'https://www.mostaza.com.ar',
    'active'
  ),
  (
    'the-body-shop-regalo-cumple',
    'Regalo de cumpleaños en tienda',
    'The Body Shop',
    'Las socias del programa de fidelidad reciben un regalo sorpresa el mes de su cumpleaños.',
    array['Estar registrada en el Love Your Body Club', 'Tener el cumpleaños cargado en el perfil'],
    'Sucursales adheridas',
    (select id from public.cities where slug = 'buenos-aires'),
    (select id from public.categories where slug = 'belleza'),
    'https://www.thebodyshop.com.ar',
    'active'
  ),
  (
    'rapsodia-descuento-cumple',
    '15% off en tu cumpleaños',
    'Rapsodia',
    'Durante el mes de tu cumple tenés un 15% de descuento en toda la colección.',
    array['Estar registrada en Mundo Rapsodia', 'Comprar dentro del mes de cumpleaños'],
    'Locales y tienda online',
    (select id from public.cities where slug = 'mendoza'),
    (select id from public.categories where slug = 'indumentaria'),
    'https://www.rapsodia.com.ar',
    'active'
  )
on conflict (slug) do nothing;
