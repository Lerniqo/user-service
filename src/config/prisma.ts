import { PrismaClient } from '@prisma/client';
import { config } from './env';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma; 