import { initDb } from '../lib/db';
import { promises as fs } from 'fs';
import * as path from 'path';

async function runMigrations() {
  const client = await initDb();
  if (!client) {
    throw new Error('DATABASE_URL not set - cannot run migrations');
  }

  try {
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files.filter(file => file.endsWith('.sql')).sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = await fs.readFile(filePath, 'utf8');
      await client.query(sql);
      console.log();
    }
    console.log('All migrations completed.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
