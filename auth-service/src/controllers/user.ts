import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import { UserRepository } from '../repositories/userRepository';

export class UserController {
	static async getUser(req: Request, res: Response, next: NextFunction) {
		const { id } = req.params;

		try {
			const user = await UserRepository.findUserById(id);
			res.status(200).json(ApiResponse.success('Got user', user));
		} catch (err) {
			logger.error(err);
			next(ApiResponse.error('Could not get user'));
		}
	
	}
}
