import environment from "@/config/environment";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { fetchPost, getSession } from "./auth/session";
import logger from "@/config/logger";

export async function getUser(): Promise<User | null> {
	const sessionCookie = cookies().get(environment.cookies.access);
	if (sessionCookie === undefined)
		return null
	const session = await getSession();
	if (!session)
		return null;
	logger.info(`===== SESSION COOKIE ===== \n ${session.user.id}`);
	const res = await fetchPost('/api/user', { 
		userId: session.user.id, 
		token: sessionCookie.value 
	});
	logger.info(`===== USER RES ===== \n ${res.ok} - ${res.status}`);
	if (!res.ok)
		return null;
	const payload = await res.json();
	return payload as User;
}
