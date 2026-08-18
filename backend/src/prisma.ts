// src/prisma.ts
// Prisma client singleton.
// Prevents multiple PrismaClient instances during ts-node-dev hot reloads.

import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env['NODE_ENV'] === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  });
}

const prisma: PrismaClient =
  process.env['NODE_ENV'] === 'production'
    ? createPrismaClient()
    : (globalThis.__prismaClient ??= createPrismaClient());

export default prisma;