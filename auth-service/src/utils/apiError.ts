//auth-service/src/utils/apiError.ts
import { ApiErrorCodes } from "../config/types/api";

export class ApiError extends Error {
	statusCode: number;
	errorCode: ApiErrorCodes;

	constructor(
		message: string, 
		statusCode: number = 500,
		errorCode: ApiErrorCodes = 'GENERIC_ERROR') {
			super(message);
			this.statusCode = statusCode;
			this.errorCode = errorCode;
		}

	static badRequest(message: string, errorCode: ApiErrorCodes = 'BAD_REQUEST') {
		return new ApiError(message, 400, errorCode)
	}

	static unauthorized(message: string, errorCode: ApiErrorCodes = 'UNAUTHORIZED') {
		return new ApiError(message, 401, errorCode)
	}

	static forbidden(message: string, errorCode: ApiErrorCodes = 'FORBIDDEN') {
		return new ApiError(message, 403, errorCode)
	}

	static notFound(message: string, errorCode: ApiErrorCodes = 'NOT_FOUND') {
		return new ApiError(message, 404, errorCode)
	}

	static conflict(message: string, errorCode: ApiErrorCodes = 'CONFLICT') {
		return new ApiError(message, 409, errorCode)
	}

	static internal(message: string, errorCode: ApiErrorCodes = 'INTERNAL_ERROR') {
		return new ApiError(message, 500, errorCode)
	}

	static fromError(error: Error) {
		return new ApiError(error.message, 500, 'INTERNAL_ERROR');
	}

	static fromValidationError(error: Error) {
		return new ApiError(error.message, 400, 'VALIDATION_ERROR');
	}
}
