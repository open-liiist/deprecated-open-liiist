import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import environment from '../config/environment';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers['authorization'];
	logger.debug(`authHeader: <${authHeader}>`);
	let token = authHeader && authHeader.split(' ')[1];
	if (token === undefined || token === '') {
		logger.error("Token is undefined");
		res.sendStatus(401);
		return;
	}
	logger.debug(`Token: <${token}>`)
	try {
		logger.debug(`ACCESS_TOKEN_SECRET: <${environment.accessTokenSecret}>`)
		const decoded = jwt.verify(token, environment.accessTokenSecret)
		console.log({ "decoded: ": decoded });
		if (typeof decoded === 'object') {
			req.user = decoded as { userId: string };
		}
		next();
		return ;
	} catch (err) {
		logger.error(`Error verifying token: ${err}`);
		res.sendStatus(403);
		return ;
	}
}
