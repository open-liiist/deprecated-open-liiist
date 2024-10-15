import logger from "@/config/logger";
import { fetchClient } from "@/lib/api";

export async function POST(req: Request) {
	const body = await req.json();
	const { userId, token } = body;

	if (!userId)
		return Response.json({ error: 'Empty body' }, { status: 404 });

	if (!token)
		return Response.json({ error: 'Unauthorized' }, { status: 401 });

	logger.debug(`Fetching user with id: ${userId} and token: ${token}`);
	const res = await fetchClient.get(`/users/${userId}`, token);
	if (res.status >= 400)
		return Response.json({ error: 'Invalid user' }, { status: 404 });
	const payload = (await res.json()).data;
	return Response.json(payload);
}
