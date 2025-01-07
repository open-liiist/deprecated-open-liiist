// auth-service/src/middleware/auth.ts

import { NextFunction, Request, Response, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import environment from '../config/environment';

// Middleware per autenticare il token
export const authenticateToken: RequestHandler = (req, res, next) => {
    const accessTokenKey = environment.cookies?.access || 'accessToken';

    // Log dei cookie ricevuti
    logger.info(`Incoming cookies: ${JSON.stringify(req.cookies)}`);

    // Estrai il token dall'header Authorization o dal cookie
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.[accessTokenKey];

    // Log del token estratto
    logger.info(`Extracted token: ${token}`);

    if (!token) {
        logger.error('Token non fornito');
        res.status(401).send('Token non fornito');
        return;
    }

    try {
        // Verifica il token usando il segreto di accesso
        const decoded = jwt.verify(token, environment.accessTokenSecret);

        if (typeof decoded === 'object' && decoded !== null && 'userId' in decoded) {
            // Aggiungi l'ID utente decodificato alla richiesta
            req.user = decoded as { userId: string };
            logger.info(`Token verificato con successo per userId: ${req.user.userId}`);
            next();
        } else {
            logger.error('Token decodificato non valido');
            res.status(403).send('Token non valido');
        }
    } catch (err) {
        logger.error(`Errore durante la verifica del token: ${(err as Error).message}`);
        res.status(403).send('Token non valido');
    }
};
