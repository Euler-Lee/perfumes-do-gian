-- Add forma_pagamento to pedidos
alter table public.pedidos
  add column if not exists forma_pagamento text
    check (forma_pagamento in ('debito','credito','credito_2x','credito_3x','credito_4x'));
