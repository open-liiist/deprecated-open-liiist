import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { UpdateUserDTO } from '../config/types/api';

const prisma = new PrismaClient();

export class UserRepository {
    /**
     * Trova un utente per ID
     * @param id - ID dell'utente
     * @returns Utente o null
     */
    static async findUserById(id: string): Promise<PrismaUser | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Aggiorna i dati di un utente
     * @param id - ID dell'utente
     * @param data - Dati da aggiornare
     * @returns Utente aggiornato o null
     */
    static async updateUser(id: string, data: UpdateUserDTO): Promise<PrismaUser | null> {
        try {
            return prisma.user.update({
                where: { id },
                data,
            });
        } catch (error) {
            console.error(`Errore durante l'aggiornamento dell'utente con id ${id}:`, error);
            return null;
        }
    }

    /**
     * Crea un nuovo utente
     * @param data - Dati dell'utente
     * @returns Utente creato
     */
    static async createUser(data: {
        email: string;
        name: string;
        dateOfBirth: Date;
        supermarkets: string[];
        passwordHash: string;
    }): Promise<PrismaUser> {
        return prisma.user.create({
            data,
        });
    }

    /**
     * Trova un utente per email
     * @param email - Email dell'utente
     * @returns Utente o null
     */
    static async findUserByEmail(email: string): Promise<PrismaUser | null> {
        return prisma.user.findUnique({
            where: { email },
        });
    }
}
