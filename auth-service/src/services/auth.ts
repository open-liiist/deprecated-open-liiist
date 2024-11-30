import bcrypt from 'bcrypt';
import { clearRefreshTokens, generateAccessToken, generateRefreshToken, saveRefreshToken, verifyRefreshToken } from './jwt';
import { ApiError } from '../utils/apiError';
import { logger } from '../utils/logger';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../config/types/api';

// export async function registerUser(
// 	email: string,
// 	password: string,
// ) {
// 	try {
// 		const passwordHash = await bcrypt.hash(password, 10);
// 		const user = await UserRepository.createUser(email, passwordHash);
// 		return user;
// 	} catch (err) {
// 		logger.error(err);
// 		throw ApiError.internal('Error registering user into database');
// 	}
// }

export async function registerUser(
	email: string,
	password: string,
	name: string,
	dateOfBirth: string,
	supermarkets: string[],
) {
	try {
		const passwordHash = await bcrypt.hash(password, 10);
		const user = await UserRepository.createUser(
			email,
			passwordHash,
			name,
			new Date(dateOfBirth),
			supermarkets,
		);
		return user;
	} catch (err) {
		logger.error(err);
		throw ApiError.internal('Error registering user into database');
	}
}

export async function loginUser(email: string, password: string):
	Promise<{ accessToken: string, refreshToken: string, user: User }> {
	const user = await UserRepository.findUserByEmail(email);
	if (!user) {
		throw ApiError.unauthorized('Invalid email or password');
	}
	const passwordValid = await bcrypt.compare(password, user.passwordHash);
	if (!passwordValid) {
		throw ApiError.unauthorized('Invalid email or password');
	}
	const accessToken = generateAccessToken(user.id);
	const refreshToken = generateRefreshToken(user.id);

	logger.info(`User ${user.id} logged in`)

	await saveRefreshToken(user.id, refreshToken);
	logger.debug(`Refresh token saved for user ${user.id}`)
	return { accessToken, refreshToken, user };
}

export async function logoutUser(refreshToken: string) {
	const userId = await clearRefreshTokens(refreshToken);
	logger.info(`User ${userId} logged out`);
}

export async function refreshTokens(refreshToken: string) {
	const payload = await verifyRefreshToken(refreshToken);
	const accessToken = generateAccessToken(payload.userId);
	return accessToken;
}
