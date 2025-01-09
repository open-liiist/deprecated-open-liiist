// auth-service/src/main.ts

import express from 'express';
import { init } from './config/init'; // Importa la funzione di inizializzazione
import { logger } from './utils/logger';
import environment from './config/environment';

function main() {
    const app = express();
    const server = init(app); // Usa config/init per configurare l'app

    const port = environment.appPort || 4000;
    server.listen(port, () => {
        logger.info(`Auth Service is running on port ${port}`);
    });

    // Gestione degli errori non catturati
    process.on('uncaughtException', (error) => {
        logger.error(`Uncaught Exception: ${error}`);
        process.exit(1);
    });
    process.on('unhandledRejection', (error) => {
        logger.error(`Unhandled Rejection: ${error}`);
        process.exit(1);
    });
}

main();
