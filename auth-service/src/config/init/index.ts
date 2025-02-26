import express from 'express';
import dotenv from 'dotenv';
import { createServer, Server } from 'node:http';
import { logger } from '../../utils/logger';

import useMiddlewares from './middlewares';
import useRoutes from './routes';
import { errorHandler } from '../../middlewares/errorHandler';

function init (app?: express.Application): Server {
	logger.info('Initializing server...');
	dotenv.config();

	if (!app) throw new Error('No express server app provided, could not start');

	useMiddlewares(app);
	useRoutes(app);
	app.use(errorHandler);

	const server = createServer(app);
	return server;
}

export { init };
