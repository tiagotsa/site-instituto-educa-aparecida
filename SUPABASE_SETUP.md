# Integração com Supabase — Instruções rápidas

Este documento explica como configurar o Supabase para receber os formulários do site e opcionalmente enviar e-mails usando uma Function (Edge) com SendGrid.

1) Criar projeto no Supabase
- Acesse https://app.supabase.com e crie um novo projeto.

2) Criar tabela `contacts`
Execute este SQL no painel SQL do Supabase:

```sql
create table public.contacts (
  id bigserial primary key,
  name text not null,
  email text not null,
  subject text,
  message text not null,
  timestamp timestamptz default now()
);

-- (opcional) remover RLS para facilitar inserção pelo cliente durante testes
alter table public.contacts enable row level security;
-- crie uma policy de inserção pública durante testes:
create policy "public_insert" on public.contacts for insert using (true);
```

3) Obter URL e ANON KEY
- No dashboard do projeto: `Settings > API` copie a `URL` e a `anon` public key.
- No arquivo `script.js` substitua `SUPABASE_URL` e `SUPABASE_ANON_KEY` com esses valores.

4) Permissões (recomendado para produção)
- Em produção, habilite RLS e crie uma policy que permita inserts apenas com autenticação ou via Function/Server.

5) Enviar e-mail quando novo contato for criado (opcional)
- Opção A (simples): configurar um webhook externo/IFTTT/Zapier que escute inserts via Realtime ou via cron.
- Opção B (recomendada): criar uma Supabase Edge Function que envia e-mail por SendGrid/SMTP. Exemplo abaixo.

Exemplo de Edge Function (Node - JavaScript) usando SendGrid

`functions/send-contact-email/index.js`

```javascript
import fetch from 'node-fetch';
import sendgrid from '@sendgrid/mail';

sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  try {
    const payload = await req.json(); // dados do contato

    const msg = {
      to: 'contato.educaraparecida@outlook.com',
      from: 'no-reply@seusite.org',
      subject: `[Contato site] ${payload.subject || 'Sem assunto'} - ${payload.name}`,
      text: `Nome: ${payload.name}\nEmail: ${payload.email}\n\n${payload.message}`
    };

    await sendgrid.send(msg);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
};
```

Para acionar a Function automaticamente após insert você pode:
- Usar triggers na database que chamam a Function via HTTP (pg_net extension) — opções avançadas.
- Ou configurar uma integração externa (Zapier/Webhook) que consulta a tabela e envia e-mails.

6) Testes locais
- Atualize `script.js` com `SUPABASE_URL` e `SUPABASE_ANON_KEY`.
- Abra o site e preencha o formulário. Se tudo estiver configurado, você verá o registro em `Table Editor > contacts`.

Observações de segurança
- Nunca exponha chaves secretas (SERVICE_ROLE) no frontend. Use apenas a `anon` key para ações públicas permitidas.
- Em produção, prefira enviar e-mails a partir de uma Function ou servidor seguro (usando `service_role` para operações administrativas, porém guardada no backend).

Se quiser, eu já preparo a Function completa e um pequeno servidor Node para você testar localmente — diga qual opção prefere (Edge Function na Supabase ou um endpoint Node + deploy em Vercel/Render). 
