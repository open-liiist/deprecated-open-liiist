import { fetchClient } from "@/lib/api";

export async function POST(req: Request, { params }: { params: { auth: string }}) {
	const { auth } = params;
	const body = await req.json();

	if (auth === 'verify') {
		const res = await fetchClient.post(`/auth/${auth}`, { token: body.token });
		if (res.status >= 400)
			return Response.json({ error: 'Invalid token' }, { status: 401 });
		const payload = (await res.json()).data;
		return Response.json(payload);
	} else if (auth === 'register' || auth === 'login') {

		const res = await fetchClient.post(`/auth/${auth}`, {
			email: body.email,
			password: body.password
		});
		if (res.status >= 400)
			return Response.json({ error: 'Invalid credentials' }, { status: 401 });
		const data = (await res.json()).data;
		return Response.json(data);
	} else if (auth === 'logout') {
		const res = await fetchClient.post(`/auth/${auth}`, { token: body.token });
		if (res.status >= 400)
			return Response.json({ error: 'Invalid token' }, { status: 401 });
		return Response.json({ message: 'Logged out' });
	}

	Response.json({ error: 'Invalid endpoint' }, { status: 400 });
}
