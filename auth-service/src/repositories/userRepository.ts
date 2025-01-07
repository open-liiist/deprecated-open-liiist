// auth-service/src/repositories/userRepository.ts

import prisma from '../services/prisma';
import { Prisma, User as PrismaUser } from '@prisma/client';
import { logger } from '../utils/logger';

export class UserRepository {
    static async createUser(email: string, passwordHash: string, name: string, dateOfBirth: Date, supermarkets: string[]) {
        return await prisma.user.create({
            data: {
                email,
                passwordHash,
                name,
                dateOfBirth,
                supermarkets,
            },
        });
    }

    static async findUserByEmail(email: string) {
        return await prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    static async findUserById(id: string) {
        return await prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    static async findManyUsers() {
        return await prisma.user.findMany();
    }

    // Aggiungi il metodo updateUser corretto
    static async updateUser(
        id: string,
        data: Prisma.UserUpdateInput
    ): Promise<PrismaUser | null> {
        try {
            const updatedUser = await prisma.user.update({
                where: { id },
                data,
            });
            return updatedUser;
        } catch (error) {
            logger.error(`Failed to update user with id ${id}: ${error}`);
            return null;
        }
    }
}
