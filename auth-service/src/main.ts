import { Server } from 'node:http';
import express from 'express';
import { init } from './config/init';
import { logger } from './utils/logger';
import environment from './config/environment';

function onListening(server: Server) {
	const addr = server.address();
	const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr?.port}`;
	logger.info(`Listening on ${bind}`);
}

function exitHandler (server?: Server) {
    if (server) {
        server.close(() => {
            console.info("Server closed");
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};

function unexpectedErrorHandler (error: unknown) {
    console.error(error);
    exitHandler();
};

function main() {
	const port = environment.appPort;
	const server = init(express());
	server.listen(port);
	server.on('listening', () => onListening(server));
	process.on('uncaughtException', unexpectedErrorHandler);
	process.on('unhandledRejection', unexpectedErrorHandler);
}

main();
