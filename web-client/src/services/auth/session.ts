import logger from "@/config/logger";
import { axiosInstance } from "@/lib/api";
import { User } from "@/types/user";
import { cookies } from "next/headers";

type SessionData = {
	user: { id: number },
	expires: string,
}

export async function verifyToken(input: string): Promise<SessionData | null> {
	const res = await axiosInstance.post('/auth/verify', { token: input });
	if (res.status >= 400)
		return null;
	const payload = await res.data;
	return payload as SessionData;
}

export async function getSession() {
	const session = cookies().get('accessToken')?.value;
	if (!session) return null;
	return await verifyToken(session);
}

export async function register(email: string, password: string) {
	try {
		const res = await axiosInstance.post('/auth/register', { email, password });
		if (res.status >= 400)
			return null;
		const user = await res.data as User;
		return user;
	} catch (error) {
		logger.error(error);
		return null;
	}
}

export async function login(email: string, password: string) {
	try {
		const res = await axiosInstance.post('/auth/login', { email, password });
		if (res.status >= 400)
			return null;
		const { accessToken, refreshToken, user } = await res.data;
		return {
			accessToken,
			refreshToken,
			user
		} as {
			accessToken: string,
			refreshToken: string,
			user: User
		};
	} catch (error) {
		logger.error(error);
		return null;
	}
}

export async function setSession(_user: User, tokens: {
	accessToken: string, refreshToken: string
} | null) {
	try {
		if (!tokens)
			return false;
		const { accessToken, refreshToken } = tokens;
		const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
		const expiresInOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		cookies().set('accessToken', accessToken, {
			expires: expiresInOneDay,
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		});
		cookies().set('refreshToken', refreshToken, {
			expires: expiresInOneMonth,
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		});
		return true
	} catch (error) {
		logger.error(error);
		return false;
	}
}

export async function clearSessionUser() {
	const refresh_token = cookies().get('refreshToken')?.value;
	if (!refresh_token)
		return;
	const res = await axiosInstance.post('/auth/logout', { token: refresh_token });
	if (res.status >= 400)
		return null;
	cookies().delete('accessToken');
	cookies().delete('refreshToken');
}
