import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use global to prevent connection leaks during hot reloading in dev
const globalForDb = globalThis as unknown as {
  db: ReturnType<typeof drizzle<typeof schema>> | undefined;
};

export function getDb() {
  if (!globalForDb.db) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Use prepare: false for PgBouncer transaction mode compatibility
    const client = postgres(connectionString, { prepare: false });
    globalForDb.db = drizzle(client, { schema });
  }
  return globalForDb.db;
}

// Re-export schema
export * from './schema';
export { schema };
