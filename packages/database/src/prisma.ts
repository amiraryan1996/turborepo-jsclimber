import { PrismaClient } from "@prisma/client";

// Use globalThis for accessing global properties (avoids TypeScript error about global)
const prisma = (globalThis as any).prisma || new PrismaClient();

// Cache Prisma client only in development environment
if (process.env.NODE_ENV !== "production") {
  (globalThis as any).prisma = prisma;
}

export default prisma;
