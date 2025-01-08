'use server'

import logger from "@/config/logger";
import { ActionState, validatedAction, validatedActionWithUser } from "@/services/auth/middleware";
import { clearSessionUser, login, register } from "@/services/auth/session";
import { getUser } from "@/services/user";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { z } from "zod";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api"; // Corretto

// Schema per il login
const signInSchema = z.object({
    email: z.string({ required_error: "Email is required" })
        .min(1, "Email is required")
        .email("Invalid email"),
    password: z.string({ required_error: "Password is required" })
        .min(1, "Password is required")
        .min(8, "Password must be at least 8 characters long")
        .max(32, "Password must be less than 32 characters long"),
});

export const signIn = validatedAction(signInSchema, async (data, formData) => {
    const { email, password } = data;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
            credentials: "include", // Necessario per inviare e ricevere cookie
        });

        if (!response.ok) {
            throw new Error("Failed to log in");
        }

        const result = await response.json();
        console.log("Login successful:", result);
        
        // Salva i token nel localStorage
        //localStorage.setItem('accessToken', result.data.accessToken);
        //localStorage.setItem('refreshToken', result.data.refreshToken);

        // Redirect dopo il login
        const redirectTo = formData.get("redirect") as string | null;
        if (redirectTo) {
            redirect(redirectTo);
        }

        redirect("/home");
    } catch (error: unknown) {
        // Riconosci se l'errore è un redirect e rilancialo
        if (error instanceof Error && error.message.startsWith('NEXT_REDIRECT')) {
            throw error;
        }

        console.error("Error during login:", error);
        if (error instanceof Error) {
            return { error: error.message || "An unexpected error occurred." } as ActionState;
        } else {
            return { error: "An unexpected error occurred." } as ActionState;
        }
    }
});

// Schema per la registrazione
const signUpSchema = z.object({
    email: z.string().email().min(3).max(255),
    password: z.string().min(8).max(100),
    name: z.string().min(2).max(100),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: "Invalid date",
    }),
    supermarkets: z
        .string()
        .transform((data) => JSON.parse(data))
        .pipe(z.array(z.string()).min(1).max(5)),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
    const { email, password, name, dateOfBirth, supermarkets } = data;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, name, dateOfBirth, supermarkets }),
            credentials: "include", // Necessario per inviare i cookie
        });

        if (!response.ok) {
            throw new Error("Failed to create user");
        }

        const newUser = await response.json();
        console.log("newUser:", newUser);

        return { success: true };
    } catch (error: unknown) {
        console.error("Error during registration:", error);
        if (error instanceof Error) {
            return { error: error.message || "An unexpected error occurred." };
        } else {
            return { error: "An unexpected error occurred." };
        }
    }
});

export async function signOut() {
    const user = (await getUser()) as User;
    if (!user) {
        return;
    }
    await clearSessionUser();
}

// Schema per aggiornare la password
const updatePasswordSchema = z.object({
    currentPassword: z.string().min(8).max(100),
    newPassword: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const updatePassword = validatedActionWithUser(
    updatePasswordSchema,
    async (data, _, user) => {
        const { currentPassword, newPassword } = data;

        if (currentPassword === "") {
            return { error: "Current password is incorrect" };
        }

        if (currentPassword === newPassword) {
            return { error: "New password must be different from current password" };
        }

        // make axios call to update password
        return { success: "Password updated successfully" };
    }
);
