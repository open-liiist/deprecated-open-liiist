'use server'

import logger from "@/config/logger";
import { ActionState, validatedAction, validatedActionWithUser } from "@/services/auth/middleware";
import { clearSessionUser, login, register, setSession } from "@/services/auth/session";
import { getUser } from "@/services/user";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { z } from "zod";

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
	const foundUser = await login(email, password);

	if (!foundUser) {
		return { error: "Invalid email or password. Please try again." } as ActionState;
	}

	await setSession(foundUser.user, {
		accessToken: foundUser.accessToken,
		refreshToken: foundUser.refreshToken
	});

	const redirectTo = formData.get('redirect') as string | null;
	if (redirectTo) {
		redirect(redirectTo);
	}

	redirect("/home");
});

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
	
	const newUser = await register(email, password, name, dateOfBirth, supermarkets);
	console.log('newUser:', newUser);

	if (!newUser) {
		return { error: "Failed to create user. Please try again." } as ActionState;
	}
	const foundUser = await login(email, password);

	// Check if login was successful
	if (!foundUser) {
		return { error: "Invalid email or password. Please try again." } as ActionState;
	}
	await setSession(foundUser.user, {
		accessToken: foundUser.accessToken,
		refreshToken: foundUser.refreshToken
	});
	redirect("/home");
	// Manual redirection is not necessary here because signIn will handle redirection
	return { success: true };
});

export async function signOut() {
	const user = (await getUser()) as User;
	if (!user) {
		return;
	}
	await clearSessionUser();
}

const updatePasswordSchema = z.object({
	currentPassword: z.string().min(8).max(100),
	newPassword: z.string().min(8).max(100),
	confirmPassword: z.string().min(8).max(100),
}).refine((data) => data.newPassword === data.confirmPassword, {
	message: "Passwords do not match",
	path: ['confirmPassword']
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

		// Make API call to update the password

		return { success: "Password updated successfully" };
	}
)
