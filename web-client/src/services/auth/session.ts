import environment from "@/config/environment";
import logger from "@/config/logger";
import { fetchClient } from "@/lib/api";
import { User } from "@/types/user";
import { cookies } from "next/headers";

type SessionData = {
	user: { id: number },
}

export async function verifyToken(input: string): Promise<SessionData | null> {
	try {
		const res = await fetchClient.post('/auth/verify', { token: input });
		if (res.status >= 400)
			return null;
		const payload = (await res.json()).data;
		return payload as SessionData;
	} catch (error) {
		logger.error(error);
		return null;
	}
}

export async function getSession() {
	const session = cookies().get(environment.cookies.access)?.value;
	if (!session) return null;
	return await verifyToken(session);
}

//vecchia versione di register 
// export async function register(email: string, password: string) {
// 	try {
// 		const res = await fetchClient.post('/auth/register', { email, password });
// 		if (res.status >= 400)
// 			return null;
// 		const user = (await res.json()).data as User;
// 		return user;
// 	} catch (error) {
// 		logger.error(error);
// 		return null;
// 	}
// }

export async function register(email: string, password: string, name: string, dateOfBirth: string, supermarkets: string[]) {
	
	console.log("register user log", email, password, name, dateOfBirth, supermarkets);
	try {
		const res = await fetchClient.post('/auth/register', {
			email,
			password,
			name,
			dateOfBirth,
			supermarkets,
		});
		if (res.status >= 400) {
			return null;
		}
		const user = (await res.json()).data as User;
		return user;
	} catch (error) {
		logger.error(error);
		return null;
	}
}


export async function login(email: string, password: string) {
	try {
		const res = await fetchClient.post('/auth/login', { email, password });
		if (res.status >= 400) {
			logger.warn(`could not log user, statusCode: ${res.status}`)
			return null;
		}
		const { accessToken, refreshToken, user } = (await res.json()).data;
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
		if (!tokens){
            console.error("No tokens provided to setSession.");
            return false;
        }
        console.log("Tokens received for session:", tokens);
		const { accessToken, refreshToken } = tokens;
		const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
		const expiresInOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
		cookies().set(environment.cookies.access, accessToken, {
			expires: expiresInOneDay,
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		});
		cookies().set(environment.cookies.refresh, refreshToken, {
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
	const refresh_token = cookies().get(environment.cookies.refresh)?.value;
	if (!refresh_token)
		return;
	const res = await fetchClient.post('/auth/logout', { token: refresh_token });
	if (res.status >= 400)
		return null;
	cookies().delete(environment.cookies.access);
	cookies().delete(environment.cookies.refresh);
	logger.info('----- LOGGED OUT -----')
}
