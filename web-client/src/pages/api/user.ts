// web-client/src/pages/api/user.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/services/auth/session';
import { fetchClient } from '@/lib/api';
import environment from '@/config/environment';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const accessToken = req.cookies[environment.cookies.access];
    if (!accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const session = await verifyToken(accessToken);
        if (!session) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        const userRes = await fetchClient.get(`/users/${session.user.id}`);
        if (!userRes.ok) {
            return res.status(userRes.status).json({ message: 'Failed to fetch user data' });
        }

        const user = await userRes.json();
        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
