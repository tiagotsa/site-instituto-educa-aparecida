const fs = require('fs');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VERCEL_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VERCEL_SUPABASE_ANON_KEY;
const EMAIL_ENDPOINT = process.env.EMAIL_ENDPOINT || process.env.NEXT_PUBLIC_EMAIL_ENDPOINT || process.env.VERCEL_EMAIL_ENDPOINT || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Warning: SUPABASE_URL or SUPABASE_ANON_KEY are missing. supabase_config.js will not be created.');
  process.exit(0);
}

const content = `window.SUPABASE_CONFIG = ${JSON.stringify({ SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL_ENDPOINT })};`;

fs.writeFileSync('supabase_config.js', content, { encoding: 'utf8' });
console.log('supabase_config.js created');
