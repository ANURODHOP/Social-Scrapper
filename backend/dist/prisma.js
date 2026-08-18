"use strict";
// src/prisma.ts
// Prisma client singleton.
// Prevents multiple PrismaClient instances during ts-node-dev hot reloads.
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
function createPrismaClient() {
    return new client_1.PrismaClient({
        log: process.env['NODE_ENV'] === 'development'
            ? ['query', 'warn', 'error']
            : ['warn', 'error'],
    });
}
const prisma = process.env['NODE_ENV'] === 'production'
    ? createPrismaClient()
    : (globalThis.__prismaClient ?? (globalThis.__prismaClient = createPrismaClient()));
exports.default = prisma;
//# sourceMappingURL=prisma.js.map