/**
 * Vercel/Neon suelen inyectar POSTGRES_* pero Prisma espera DATABASE_URL.
 * Llamar antes de instanciar PrismaClient (también en serverless).
 */
export function ensureDatabaseEnv(): void {
  if (!process.env.DATABASE_URL && process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  }
  if (!process.env.DATABASE_URL && process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }

  if (!process.env.DIRECT_URL && process.env.POSTGRES_URL_NON_POOLING) {
    process.env.DIRECT_URL = process.env.POSTGRES_URL_NON_POOLING;
  }
  if (!process.env.DIRECT_URL && process.env.DATABASE_URL_UNPOOLED) {
    process.env.DIRECT_URL = process.env.DATABASE_URL_UNPOOLED;
  }

  const url = process.env.DATABASE_URL;
  if (!url) return;

  // Neon pooler + Prisma: requiere pgbouncer=true
  if (url.includes("pooler") && !url.includes("pgbouncer=true")) {
    const parsed = new URL(url);
    parsed.searchParams.set("pgbouncer", "true");
    process.env.DATABASE_URL = parsed.toString();
  }
}

export function hasDatabaseConfig(): boolean {
  ensureDatabaseEnv();
  return Boolean(process.env.DATABASE_URL);
}
