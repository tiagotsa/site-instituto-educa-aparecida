# Educar Aparecida - Landing Page

> **Status**: Production-Ready | **Version**: 1.0.0

Landing page profissional e responsiva para a instituição Educar Aparecida.

## 🚀 Início Rápido

### 1. Servir Localmente
```bash
# Com Python 3
python -m http.server 8000

# Com Node.js
npx http-server
```

### 2. Acessar
```
http://localhost:8000
```

## 📋 Seções

- **Hero** - Apresentação com call-to-action
- **Marca** - Identidade visual e missão da ONG
- **Quem Somos** - Missão, visão e valores
- **Projetos** - Educação Digital Básica
- **Voluntariado** - Como participar
- **Parcerias** - Oportunidades de colaboração
- **Transparência** - Compromisso institucional
- **Contato** - Formulário de contato
- **Footer** - Links e informações

## ✨ Características

- ✅ HTML5 Semântico
- ✅ Design Responsivo (Mobile-first)
- ✅ CSS Moderno com Variáveis
- ✅ JavaScript Vanilla (sem dependências)
- ✅ Formulário com Validação
- ✅ Animações Suaves
- ✅ Acessível (WCAG 2.1 AA)
- ✅ Modo Escuro Automático
- ✅ Performance Otimizada

## 🎨 Personalização

### Alterar Cores
Edite as variáveis CSS em `styles.css`:
```css
:root {
    --primary: #1b4d7c;      /* Azul principal */
    --accent: #4a90e2;       /* Azul accent */
    --success: #27ae60;      /* Verde */
    --danger: #e74c3c;       /* Vermelho */
}
```

### Editar Conteúdo
Abra `index.html` e edite o texto conforme necessário.

## 📧 Configurar Email

Para ativar o formulário de contato, configure um serviço de email:

**Opção 1: Formspree** (mais fácil)
1. Acesse https://formspree.io
2. Crie um novo form
3. Substitua em `script.js` no método `simulateSendEmail()`

**Opção 2: Backend próprio**
Implementar endpoint `/api/contact` que receba:
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "message": "string"
}
```

## 🌐 Deploy

### GitHub Pages
```bash
git add .
git commit -m "Initial commit"
git push origin main
# Ativar em Settings > Pages
```

### Netlify
```bash
npx netlify-cli deploy
```

### Vercel
```bash
npx vercel
```

#### Vercel: como fornecer chaves com segurança

1. No painel do projeto Vercel → Settings → Environment Variables, adicione as variáveis:
- `SUPABASE_URL` = sua URL do Supabase (ex: https://xyz.supabase.co)
- `SUPABASE_ANON_KEY` = sua anon public key do Supabase
- `EMAIL_ENDPOINT` = (opcional) endpoint Formspree

2. Configure o Build Command no Vercel para gerar o arquivo `supabase_config.js` antes do deploy. Em `Project Settings > General > Build & Development Settings` coloque como *Build Command*:

```
node create-supabase-config.js
```

Isso criará `supabase_config.js` no diretório de saída antes do deploy. O arquivo está listado em `.gitignore` para não ser comitado.

Observação: a `anon` key é pública por natureza e pode ser exposta no frontend; o importante é não commitar chaves administrativas (`service_role`).

## 📱 Suporte

- **E-mail**: contato.educaraparecida@outlook.com

---

Desenvolvido para Educar Aparecida | 2026
