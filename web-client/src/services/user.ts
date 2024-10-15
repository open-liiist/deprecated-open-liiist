import { User } from "@/types/user";
import { cookies } from "next/headers";

export async function getUser(): Promise<User | null> {
	const sessionCookie = cookies().get('accessToken');
	if (!sessionCookie || !sessionCookie.value) 
		return null

	// const res = await fetch('/api/auth/verify', {
	// 	method: 'POST',
	// 	headers: {
	// 		'Content-Type': 'application/json',
	// 	},
	// 	body: JSON.stringify({ token: sessionCookie.value }),
	// });
	// if (!res.ok) return null;
	// const payload = await res.json();
	const payload = {
		id: '1',
		email: 'ciao@ciao.com',
		name: 'John Doe',
	}
	return payload as User;
}
