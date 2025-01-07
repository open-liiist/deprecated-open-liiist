'use server'

// auth-service/src/controllers/auth.ts

import { NextFunction, Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth';
import { clearRefreshTokens, generateAccessToken, revokeRefreshToken, verifyAccessToken, verifyRefreshToken } from '../services/jwt';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import environment from '../config/environment';
import { logger } from '../utils/logger'; // Importa logger

export class AuthController {
    static async register(req: Request, res: Response, next: NextFunction) {
        const { email, password, name, dateOfBirth, supermarkets } = req.body;

        try {
            const newUser = await registerUser(email, password, name, dateOfBirth, supermarkets);
            res.status(201).json(ApiResponse.success('User registered successfully', newUser));
        } catch (err) {
            logger.error(err);
            next(ApiError.internal('Error registering user :('));
        }
    }

    static async login(req: Request, res: Response, next: NextFunction) {
        const { email, password } = req.body;

        try {
            const { accessToken, refreshToken, user } = await loginUser(email, password);

            logger.info(`Setting access token cookie: ${environment.cookies.access}`);
            res.cookie(environment.cookies.access, accessToken, {
                httpOnly: true,
                secure: environment.isProduction, // true per produzione, false per sviluppo
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000, // 1 giorno
                path: '/',
            });

            logger.info(`Setting refresh token cookie: ${environment.cookies.refresh}`);
            res.cookie(environment.cookies.refresh, refreshToken, {
                httpOnly: true,
                secure: environment.isProduction, // true per produzione, false per sviluppo
                sameSite: 'lax',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 giorni
                path: '/',
            });

            logger.info(`User ${user.id} logged in`);
            logger.info(`Set-Cookie headers: ${res.get('Set-Cookie')}`);


            res.status(200).json(ApiResponse.success('Login successful', { user, accessToken, refreshToken }));
        } catch (err) {
            logger.error(err);
            if (err instanceof ApiError) {
                next(err);
            } else {
                next(ApiError.internal('Errore durante il login'));
            }
        }
    }

    static async verifyToken(req: Request, res: Response, next: NextFunction) {
        const token = req.body.token || req.cookies[environment.cookies.access];

        if (!token) {
            return next(ApiError.unauthorized('Token non fornito'));
        }

        try {
            const payload = verifyAccessToken(token);
            res.status(200).json(ApiResponse.success('Token is valid', { user: { id: payload.userId } }));
        } catch (err) {
            next(ApiError.unauthorized('Invalid or expired token'));
        }
    }

    static async refreshToken(req: Request, res: Response, next: NextFunction) {
        const { token } = req.body;

        try {
            const payload = await verifyRefreshToken(token);
            const newAccessToken = generateAccessToken(payload.userId);
            res.status(200).json(ApiResponse.success('Token refreshed', { accessToken: newAccessToken }));
        } catch (err) {
            if (err instanceof ApiError) next(err);
            else next(ApiError.unauthorized('Invalid or expired refresh token'));
        }
    }

    static async revokeToken(req: Request, res: Response, next: NextFunction) {
        const { token } = req.body;

        try {
            await revokeRefreshToken(token);
            res.status(200).json(ApiResponse.success('Refresh token revoked'));
        } catch (err) {
            next(ApiError.internal('Could not revoke token'));
        }
    }

    static async logout(req: Request, res: Response, next: NextFunction) {
        const { token } = req.body;

        try {
            await clearRefreshTokens(token);
            // Rimuovi i cookie
            res.clearCookie(environment.cookies.access, { path: '/' });
            res.clearCookie(environment.cookies.refresh, { path: '/' });

            logger.info(`Cookies rimossi: ${environment.cookies.access}, ${environment.cookies.refresh}`);

            res.status(200).json(ApiResponse.success('User logged out'));
        } catch (err) {
            next(ApiError.internal('Could not log out user'));
        }
    }
}
