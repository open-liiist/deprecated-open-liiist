// auth-service/src/main.ts

import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { Server } from 'node:http';
import environment from './config/environment';
import { logger } from './utils/logger';
import { router as authRouter } from './routes/auth'; // Import del router principale

// Funzione per configurare l'applicazione Express
function configureApp(app: Express): Express {
    // Log delle richieste
    app.use((req, res, next) => {
        logger.info(`Request: ${req.method} ${req.url}`);
        next();
    });

    // Middleware per gestire i cookie
    app.use(cookieParser());

    // Configura CORS
    app.use(cors({
        origin: 'http://localhost:3000', // URL del front-end
        credentials: true,              // Necessario per inviare e ricevere cookie
    }));

    // Middleware per parsare JSON e URL-encoded
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Aggiungi il router principale su /auth
    app.use('/auth', authRouter);

    return app;
}

// Gestione degli eventi quando il server è in ascolto
function onListening(server: Server) {
    const addr = server.address();
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
    logger.info(`Listening on ${bind}`);
}

// Gestione degli errori inattesi
function unexpectedErrorHandler(error: unknown) {
    logger.error(`Unexpected Error: ${error}`);
    process.exit(1);
}

// Funzione principale per avviare l'applicazione
function main() {
    const app = express();
    configureApp(app);

    const port = environment.appPort || 4000;
    const server = app.listen(port, () => onListening(server));

    // Gestione degli errori non catturati
    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);
}

main();
