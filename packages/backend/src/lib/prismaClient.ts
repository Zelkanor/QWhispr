/**
 * @copyright 2025 Zelkanor
 * @license Apache-2.0
 */


import {PrismaClient} from '../../generated/prisma';


// Declare a global variable to hold the Prisma Client instance.
// This is done to ensure that in a development environment where the module cache is cleared,
// we don't end up creating new connections on every hot reload.
declare global {
  var prisma: PrismaClient | undefined;
}

// Instantiate a single instance of PrismaClient.
// If 'globalThis.prisma' is already defined, reuse it; otherwise, create a new instance.
// This approach prevents the creation of multiple PrismaClient instances in development.
const prisma = globalThis.prisma || new PrismaClient({
  log: [ 'warn', 'error'], 
});

// In a non-production environment, assign the PrismaClient instance to the global variable.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// Export the single, shared instance of PrismaClient.
export default prisma;
