import environment from "@/config/environment";
import { User } from "@/types/user";
import { cookies } from "next/headers";
import { getSession } from "./auth/session";
import logger from "@/config/logger";
import { fetchClient } from "@/lib/api";

export async function getUser(): Promise<User | null> {
	const sessionCookie = cookies().get(environment.cookies.access);
	if (sessionCookie === undefined)
		return null
	const session = await getSession();
	if (!session)
		return null;
	logger.info(`===== SESSION COOKIE ===== \n ${session.user.id}`);
	const res = await fetchClient.get(
		`/users/${session.user.id}`, 
		sessionCookie.value
	);
	logger.info(`===== USER RES ===== \n ${res.ok} - ${res.status}`);
	if (!res.ok)
		return null;
	const payload = (await res.json()).data;
	return payload as User;
}
