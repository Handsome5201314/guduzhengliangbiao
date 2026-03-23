import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const getDbUrl = () => {
  let url = process.env.SQLITE_URL || "file:./dev.db";
  if (url.startsWith('"') && url.endsWith('"')) {
    url = url.slice(1, -1);
  }
  if (url.startsWith("'") && url.endsWith("'")) {
    url = url.slice(1, -1);
  }
  if (!url.startsWith("file:")) {
    console.warn(`Invalid SQLITE_URL environment variable: ${url}. Falling back to file:./dev.db`);
    return "file:./dev.db";
  }
  return url;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasourceUrl: getDbUrl(),
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
