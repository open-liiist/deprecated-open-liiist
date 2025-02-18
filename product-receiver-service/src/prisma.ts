//src/prisma.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.REMOTE_DATABASE_URL,
      },
    },
  });  
export default prisma;
