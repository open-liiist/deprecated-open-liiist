import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});


export default prisma;
