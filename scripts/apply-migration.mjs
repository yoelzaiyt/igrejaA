import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

const projectRef = 'tyekzbzzqkykwlcfzlve';
const migrationFile = path.join(
  rootDir,
  'supabase',
  'migrations',
  '20260616174500_initial_schema.sql',
);
const sql = fs.readFileSync(migrationFile, 'utf8');

async function applyWithAccessToken() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) return false;

  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    },
  );

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase API error (${response.status}): ${body}`);
  }

  console.log('Migration applied via Supabase Management API.');
  return true;
}

async function applyWithDatabaseUrl() {
  const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
  if (!databaseUrl) return false;

  const { Client } = await import('pg');
  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration applied via direct database connection.');
    return true;
  } finally {
    await client.end();
  }
}

async function main() {
  if (await applyWithAccessToken()) return;
  if (await applyWithDatabaseUrl()) return;

  console.error(
    [
      'Could not apply migration automatically.',
      'Provide one of:',
      '  - SUPABASE_ACCESS_TOKEN (from `supabase login` or dashboard access tokens)',
      '  - SUPABASE_DB_URL / DATABASE_URL (postgres connection string)',
      'Or run: npm run db:push (after `npx supabase login` and `npx supabase link`).',
    ].join('\n'),
  );
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
