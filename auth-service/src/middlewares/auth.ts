import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1];
	if (!token) {
		res.sendStatus(401);
		return ;
	}
	jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			console.log("Gone wrong", err);
			return res.sendStatus(403);
		}
		console.log({"decoded: ": decoded });
		// req.user = decoded;
		if (typeof decoded === 'object') {
			req.user = decoded as { userId: string, roleId: string };
		}
		next();
	});
}
