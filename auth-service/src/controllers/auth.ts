import { NextFunction, Request, Response } from "express";
import { loginUser, registerUser } from "../services/auth";
import { clearRefreshTokens, generateAccessToken, revokeRefreshToken, verifyAccessToken, verifyRefreshToken } from "../services/jwt";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";

export class AuthController {


	static async register(req: Request, res: Response, next: NextFunction) {
		
		const { email, password, name, dateOfBirth, supermarkets } = req.body;
	
		try {
			const newUser = await registerUser(email, password, name, dateOfBirth, supermarkets);
	
			res.status(201).json(ApiResponse.success("User registered successfully", newUser));
		} catch (err) {
			next(ApiError.internal("Error registering user :("));
		}
	}
	

	static async login(req: Request, res: Response, next: NextFunction) {
		const { email, password } = req.body;

		try {
			const tokensAndUser = await loginUser(email, password);
			res.status(200).json(ApiResponse.success('Login successful', tokensAndUser));
		} catch (err) {
			if (err instanceof ApiError) next(err);
			next(ApiError.internal("Could not log in user"));
		}
	}

	static async verifyToken(req: Request, res: Response, next: NextFunction) {
		const { token } = req.body;

		try {
			const payload = verifyAccessToken(token);
			res.status(200).json(ApiResponse.success('Token is valid', { user: { id: payload.userId }}));
		} catch (err) {
			next(ApiError.unauthorized('Invalid or expired token'));
		}
	}

	static async refreshToken(req: Request, res: Response, next: NextFunction) {
		const { token } = req.body;

		try {
			const payload = await verifyRefreshToken(token);
			const newAccessToken = generateAccessToken(payload.userId);
			res.status(200).json(ApiResponse.success('token refreshed', { accessToken: newAccessToken }));
		} catch (err) {
			if (err instanceof ApiError) next(err);
			next(ApiError.unauthorized('Invalid or expired refresh token'));
		}
	}

	static async revokeToken(req: Request, res: Response, next: NextFunction) {
		const { token } = req.body;

		try {
			await revokeRefreshToken(token);
			res.status(200).json(ApiResponse.success('Refresh token revoked'));
		} catch (err) {
			next(ApiError.internal('Could not revoke token'));
		}
	}

	static async logout(req: Request, res: Response, next: NextFunction) {
		const { token } = req.body;

		try {
			await clearRefreshTokens(token);
			res.status(200).json(ApiResponse.success('User logged out'));
		} catch (err) {
			next(ApiError.internal('Could not log out user'));
		}
	}
}
