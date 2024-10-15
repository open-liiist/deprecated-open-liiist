import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { UserRepository } from '../repositories/userRepository';
import { User as PrismaUser } from '@prisma/client';
import { User } from '../config/types/api';

function sanitizeUser(user: PrismaUser): User {
	const { passwordHash, updatedAt, deletedAt, ...sanitizedUser } = user;
	return sanitizedUser;
}

export class UserController {

	static async getUser(req: Request, res: Response, next: NextFunction) {
		const { id } = req.params;

		try {
			logger.info(`Getting user with id ${id}`);
			const user = await UserRepository.findUserById(id);
			if (!user) {
				logger.error(`User with id ${id} not found`);
				next(ApiResponse.error('User not found'));
				return;
			}
			const sanitizedUser = sanitizeUser(user);
			logger.info(`Got user: ${JSON.stringify(sanitizedUser)}`);
			res.status(200).json(ApiResponse.success('Got user', sanitizedUser));
		} catch (err) {
			logger.error(err);
			next(ApiResponse.error('Could not get user'));
		}

	}
}
