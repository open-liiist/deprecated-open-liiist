// web-client/src/services/auth/session.ts

import environment from "@/config/environment";
import logger from "@/config/logger";
import { fetchClient } from "@/lib/api";
import { User } from "@/types/user";
// Rimuovi l'importazione di `cookies` da "next/headers" poiché non puoi gestire i cookie httpOnly dal client-side

type SessionData = {
    user: { id: number },
}
const API_BASE_URL = process.env.API_BASE_URL || "/api"; // Usa localhost se non definito

export async function verifyToken(input: string): Promise<SessionData | null> {
    try {
        const res = await fetchClient.post('/auth/verify-token', {token: input});
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
    // Le cookie httpOnly non sono accessibili dal client-side
    // Questa funzione dovrebbe essere gestita lato server (Server Components)
    return null;
}

// Rimuovi completamente la funzione setSession

export async function register(email: string, password: string, name: string, dateOfBirth: string, supermarkets: string[]) {
    console.log("register user log", email, password, name, dateOfBirth, supermarkets);
    try {
        const res = await fetchClient.post('/auth/register', {
            email,
            password,
            name,
            dateOfBirth,
            supermarkets,
        }, { credentials: 'include' }); // Includi le credenziali
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
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
            credentials: "include", // Necessario per inviare i cookie
        });

        if (!response.ok) {
            logger.warn(`Could not log user, statusCode: ${response.status}`);
            return null;
        }

        const data = await response.json();
        const { accessToken, refreshToken, user } = data.data;

        return {
            accessToken,
            refreshToken,
            user,
        } as {
            accessToken: string;
            refreshToken: string;
            user: User;
        };
    } catch (error: unknown) {
        logger.error("Error during login:", error);
        if (error instanceof Error) {
            return { error: error.message || "An unexpected error occurred." };
        } else {
            return { error: "An unexpected error occurred." };
        }
    }
}

export async function clearSessionUser() {
    try {
        const res = await fetchClient.post('/auth/logout', {}, { credentials: 'include' }); // Includi le credenziali
        if (res.status >= 400) {
            logger.warn(`Could not log out user, statusCode: ${res.status}`);
            return null;
        }
        logger.info('----- LOGGED OUT -----');
        return true;
    } catch (error) {
        logger.error(error);
        return null;
    }
}
