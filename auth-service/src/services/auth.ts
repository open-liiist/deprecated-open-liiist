import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { clearRefreshTokens, generateAccessToken, generateRefreshToken, saveRefreshToken, verifyAccessToken, verifyRefreshToken } from './jwt';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../config/types/api';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.AUTH_DATABASE_URL,
        },
    },
    log: ['query', 'info', 'warn', 'error'],
});

export function verifyTokenService(token: string) {
    try {
        const decoded = verifyAccessToken(token);
        return decoded;
    } catch (error) {
        throw error; // L'errore viene gestito nel controller
    }
}
// Funzione di sanitizzazione dell'utente
function sanitizeUser(user: any): User {
    const { passwordHash, updatedAt, deletedAt, ...sanitizedUser } = user;
    return {
        ...sanitizedUser,
        dateOfBirth: user.dateOfBirth.toISOString(), // Converti Date in stringa
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
    };
}

// Funzione per registrare un utente
export async function registerUser(
    email: string,
    password: string,
    name: string,
    dateOfBirth: string,
    supermarkets: string[],
) {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const dob = new Date(dateOfBirth);

        const user = await UserRepository.createUser({
            email,
            passwordHash,
            name,
            dateOfBirth: dob,
            supermarkets,
        });

        const sanitizedUser = sanitizeUser(user);
        return sanitizedUser;
    } catch (err) {
        logger.error(err);
        console.error('Error registering user:', err);  // Linea aggiunta per debug
        throw ApiError.internal('Error registering user into database');
    }
}

// Funzione per il login di un utente
export async function loginUser(email: string, password: string):
    Promise<{ accessToken: string, refreshToken: string, user: User }> {
    const user = await UserRepository.findUserByEmail(email);
    if (!user) {
        throw ApiError.unauthorized('Invalid email or password');
    }
    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
        throw ApiError.unauthorized('Invalid email or password');
    }
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    logger.info(`User ${user.id} logged in`);

    await saveRefreshToken(user.id, refreshToken);
    logger.debug(`Refresh token saved for user ${user.id}`);
    
    // Sanitizza l'utente prima di restituirlo
    const sanitizedUser = sanitizeUser(user);
    
    return { accessToken, refreshToken, user: sanitizedUser };
}

// Funzione per il logout di un utente
export async function logoutUser(refreshToken: string) {
    const userId = await clearRefreshTokens(refreshToken);
    logger.info(`User ${userId} logged out`);
}

// Funzione per aggiornare i token
export async function refreshTokens(refreshToken: string) {
    const payload = await verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(payload.userId);
    return accessToken;
}
