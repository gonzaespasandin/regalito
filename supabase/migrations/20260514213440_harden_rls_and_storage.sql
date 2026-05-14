-- Endurece la policy de submissions: el payload debe ser un objeto JSON.
-- Evita el WARN "RLS Policy Always True" y descarta inserts basura.
drop policy "cualquiera puede sumar un regalito" on public.submissions;
create policy "cualquiera puede sumar un regalito"
  on public.submissions for insert
  to anon, authenticated
  with check (jsonb_typeof(payload) = 'object');

-- El bucket gift-images es público: los objetos ya se sirven por URL sin
-- policy. La policy amplia de SELECT permitía listar TODO el bucket, así
-- que la quitamos (evita el WARN "Public Bucket Allows Listing").
drop policy "gift-images lectura pública" on storage.objects;
