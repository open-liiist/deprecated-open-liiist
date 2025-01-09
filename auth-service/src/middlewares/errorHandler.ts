//auth-service/src/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/apiResponse';

export function errorHandler(
	err: ApiError | Error,
	_req: Request,
	res: Response,
	_next: NextFunction
) {
	logger.error(err);

	if (err instanceof ApiError) {
		res
			.status(err.statusCode)
			.json(ApiResponse.error(err.message, err.errorCode));
		return
	}

	res
		.status(500)
		.json(ApiResponse.error('Internal Server Error', 'INTERNAL_ERROR'));
	return
}
