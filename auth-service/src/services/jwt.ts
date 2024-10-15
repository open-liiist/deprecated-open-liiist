import { ApiError } from '../utils/apiError';
import prisma from './prisma';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

export function generateAccessToken(userId: string) {
	return jwt.sign(
		{ userId },
		ACCESS_TOKEN_SECRET,
		{ expiresIn: '1d' }
	);
}

export function generateRefreshToken(userId: string) {
	return jwt.sign(
		{ userId },
		REFRESH_TOKEN_SECRET,
		{ expiresIn: '1m' }
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

export async function verifyAccessToken(token: string) {
	return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

export async function verifyRefreshToken(token: string) {
	try {
		const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
		const storedToken = await prisma.refreshToken.findFirst({
			where: {
				token,
				userId: payload.userId
			}
		});
		if (!storedToken)
			throw ApiError.unauthorized('Invalid refresh token');
		if (new Date(storedToken.expiryDate) < new Date())
			throw ApiError.unauthorized('Refresh token expired');

		return payload;
	} catch (err) {
		throw ApiError.unauthorized('Invalid refresh token');
	}
}

export async function revokeRefreshToken(token: string) {
	const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
	await prisma.refreshToken.deleteMany({
		where: {
			token,
			userId: payload.userId
		}
	});
}

export async function clearRefreshTokens(token: string) {
	const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
	await prisma.refreshToken.deleteMany({
		where: {
			userId: payload.userId
		}
	});
	return payload.userId;
}
