import environment from '../config/environment';
import { ApiError } from '../utils/apiError';
import prisma from './prisma';
import jwt from 'jsonwebtoken';

export function generateAccessToken(userId: string) {
	const token = jwt.sign(
		{ userId },
		environment.accessTokenSecret,
		{ expiresIn: '1d' }
	);
	console.log('Access Token Generated:', token); // Aggiungi questo log
    return token;
}

export function generateRefreshToken(userId: string) {
	return jwt.sign(
		{ userId },
		environment.refreshTokenSecret,
		{ expiresIn: '30d' }
	);
}

export async function saveRefreshToken(userId: string, refreshToken: string) {
	const expiryDate = new Date();
	expiryDate.setDate(expiryDate.getDate() + 7);

	await prisma.refreshToken.create({
		data: {
			userId,
			token: refreshToken,
			expiryDate
		}
	});
}

// export function verifyAccessToken(token: string) {
// 	return jwt.verify(token, environment.accessTokenSecret) as { userId: string };
// }
export function verifyAccessToken(token: string) {
    try {
        const decoded = jwt.verify(token, environment.accessTokenSecret) as { userId: string };
        console.log('Access Token Verified:', decoded); // Aggiungi questo log
        return decoded;
    } catch (err) {
        console.error('Access Token Verification Failed:', err); // Log errori
        throw ApiError.unauthorized('Invalid access token');
    }
}

export async function verifyRefreshToken(token: string) {
	try {
		const payload = jwt.verify(token, environment.refreshTokenSecret) as { userId: string };
		const storedToken = await prisma.refreshToken.findFirst({
			where: {
				token,
				userId: payload.userId
			}
		});
		if (!storedToken)
			throw ApiError.unauthorized('Invalid refresh token - not found');
		if (new Date(storedToken.expiryDate) < new Date())
			throw ApiError.unauthorized('Refresh token expired');

		return payload;
	} catch (err) {
		throw ApiError.unauthorized('Invalid refresh token');
	}
}

export async function revokeRefreshToken(token: string) {
	const payload = jwt.verify(token, environment.refreshTokenSecret) as { userId: string };
	await prisma.refreshToken.deleteMany({
		where: {
			token,
			userId: payload.userId
		}
	});
}

export async function clearRefreshTokens(token: string) {
	const payload = jwt.verify(token, environment.refreshTokenSecret) as { userId: string };
	await prisma.refreshToken.deleteMany({
		where: {
			userId: payload.userId
		}
	});
	return payload.userId;
}
