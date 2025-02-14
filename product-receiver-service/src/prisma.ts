//src/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.REMOTE_DATABASE_URL, // Forza l'utilizzo del DB remoto
      },
    },
  });  
export default prisma;
