const fs = require('fs');

console.log('--- Iniciando script de build para Supabase ---');

// Pega as variáveis específicas do ambiente
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const EMAIL_ENDPOINT = process.env.EMAIL_ENDPOINT || '';

// LOGS DE DIAGNÓSTICO: Vamos ver se o Vercel está passando as variáveis
console.log(`Status de SUPABASE_URL: ${SUPABASE_URL ? '✅ Encontrada' : '❌ NÃO ENCONTRADA'}`);
console.log(`Status de SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Encontrada' : '❌ NÃO ENCONTRADA'}`);

// Verificação principal: Se as variáveis não existirem, o build falha
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('--> ERRO FATAL: Variáveis de ambiente não foram passadas para o script de build.');
  console.error('--> Verifique se SUPABASE_URL e SUPABASE_ANON_KEY existem e estão habilitadas para Production/Preview/Development no painel do Vercel.');
  
  // Força a saída com erro 1, que é o que está acontecendo
  process.exit(1);
}

console.log('Variáveis encontradas com sucesso. Gerando o arquivo de configuração...');

const content = `window.SUPABASE_CONFIG = ${JSON.stringify({ SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL_ENDPOINT })};`;

try {
  fs.writeFileSync('supabase_config.js', content, { encoding: 'utf8' });
  console.log('✅ SUCESSO: O arquivo supabase_config.js foi criado.');
} catch (error) {
  console.error('--> ERRO CRÍTICO: Falha ao tentar escrever o arquivo no disco.', error);
  process.exit(1);
}

console.log('--- Script de build finalizado com sucesso ---');