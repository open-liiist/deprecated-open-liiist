import express, { Application } from "express";
import cors from 'cors';
import { logger } from "../../utils/logger";

export default (app: Application): void => {
	app.use(cors())

	app.use(express.json())

	/** Log the request */
	app.use((req, res, next) => {
		if (req.url === '/') {
			next()
			return
		}

		logger.info(`METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`)

		res.on('finish', () => {
			logger.info(`METHOD: [${req.method}] - URL: [${req.url}] STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`)
		})


		next()
	});

	/** Rules of use */
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
		if (req.method == 'OPTIONS') {
			res.header('Access-Control-Allow-Methods', 'PUT, POST, PATH, DELETE, GET');
			res.status(200).json({});
		}
		next()
	});
}
