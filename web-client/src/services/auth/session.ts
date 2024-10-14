import { User } from "@/types/user";
import { cookies } from "next/headers";

type SessionData = {
	user: { id: number },
	expires: string,
}

export async function verifyToken(input: string): Promise<SessionData | null> {
	const res = await fetch('/api/auth/verify', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ token: input }),
	});
	if (!res.ok) return null;
	const payload = await res.json();
	return payload as SessionData;
}

export async function getSession() {
	const session = cookies().get('session')?.value;
	if (!session) return null;
	return await verifyToken(session);
}

export async function setSession(user: User) {
	// TODO: make axios call to set session
	// const res = await fetch('/api/auth/login', {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify(user),
	// });
	// if (!res.ok) return null;
	// const payload = await res.json();
	// const jwt = payload.token;
	const jwt = 'jwt';
	const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
	cookies().set('session', jwt, {
		expires: expiresInOneDay,
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	});

}
