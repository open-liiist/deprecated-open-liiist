// auth-service/src/controllers/auth.ts

import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, logoutUser, verifyTokenService } from '../services/auth';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        const { email, password, name, dateOfBirth, supermarkets } = req.body;
        try {
            const user = await registerUser(email, password, name, dateOfBirth, supermarkets);
            res.status(201).json(ApiResponse.success('User registered successfully', user));
        } catch (error) {
            next(error);
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;
        try {
            const { accessToken, refreshToken, user } = await loginUser(email, password);
            res.status(200).json(ApiResponse.success('User logged in successfully', { accessToken, refreshToken, user }));
        } catch (error) {
            next(error);
        }
    }

    static async verifyToken(req: Request, res: Response, next: NextFunction) {
        const { token } = req.body;
        if (!token) {
            return next(ApiResponse.error('Token non fornito', 'BAD_REQUEST'));
        }
        try {
            const decoded = verifyTokenService(token);
            logger.info(`Token verificato per l'utente: ${decoded.userId}`);
            res.status(200).json(ApiResponse.success('Token valido', { userId: decoded.userId }));
        } catch (error) {
            logger.error(`Errore durante la verifica del token: ${(error as Error).message}`);
            next(error);
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        // Implementa la logica per aggiornare i token
    }

    static async revokeToken(req: Request, res: Response, next: NextFunction) {
        // Implementa la logica per revocare i token
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        const { refreshToken } = req.body;
        try {
            await logoutUser(refreshToken);
            res.status(200).json(ApiResponse.success('User logged out successfully'));
        } catch (error) {
            next(error);
        }
    }
}
