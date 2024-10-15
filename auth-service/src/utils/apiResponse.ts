import { ApiErrorCodes } from "../config/types/api";

export class ApiResponse {
	public status: string;
	public message: string;
	public data?: any;
	public errorCode?: string;

	constructor(status: string, message: string, data?: any, errorCode?: string) {
		this.status = status;
		this.message = message;
		this.data = data;
		this.errorCode = errorCode;
	}

	static success(message: string, data: any = null) {
		return new ApiResponse('success', message, data);
	}

	static error(message: string, errorCode: ApiErrorCodes = 'GENERIC_ERROR', data: any = null) {
		return new ApiResponse('error', message, data, errorCode);
	}
}
