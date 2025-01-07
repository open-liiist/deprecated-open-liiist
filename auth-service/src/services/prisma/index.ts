import { PrismaClient } from "@prisma/client";

declare global {
	var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
	log: ['query', 'info', 'warn', 'error'], // Abilita i log
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

console.log('Prisma connecting to database with URL:', process.env.AUTH_DATABASE_URL);
console.log('AUTH_DATABASE_URL:', process.env.AUTH_DATABASE_URL);


export default prisma;
