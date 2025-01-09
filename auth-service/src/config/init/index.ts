// auth-service/src/config/init/index.ts

import express from 'express';
import dotenv from 'dotenv';
import { createServer, Server } from 'node:http';
import { logger } from '../../utils/logger';

import useMiddlewares from './middlewares';
import { router } from '../../routes'; // Import corretto del router
import { errorHandler } from '../../middlewares/errorHandler';

function init(app?: express.Application): Server {
    logger.info('Initializing server');
    dotenv.config();

    if (!app) throw new Error('No express server app provided, could not start');

    useMiddlewares(app);
    app.use('/api/auth', router); // Applica il router sotto /api/auth
    app.use(errorHandler); // Applica il middleware di gestione degli errori

    const server = createServer(app);
    return server;
}

export { init };
