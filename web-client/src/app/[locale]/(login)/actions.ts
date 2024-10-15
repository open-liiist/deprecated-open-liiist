'use server'

import { ActionState, validatedAction, validatedActionWithUser } from "@/services/auth/middleware";
import { clearSessionUser, login, register, setSession } from "@/services/auth/session";
import { getUser } from "@/services/user";
import { User } from "@/types/user";
import { redirect } from "next/navigation";
import { z } from "zod";

const signInSchema = z.object({
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
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

	redirect("/app");
});

const signUpSchema = z.object({
	name: z.string().min(3).max(100),
	email: z.string().email().min(3).max(255),
	password: z.string().min(8).max(100),
});

export const signUp = validatedAction(signUpSchema, async (data) => {
	const { email, password } = data;

	const newUser = await register(email, password);

	if (!newUser) {
		return { error: "Failed to create user. Please try again." } as ActionState;
	}

	await setSession(newUser, null);

	redirect("/profile");
});

export async function signOut() {
	const user = (await getUser()) as User;
	if (!user) {
		return;
	}
	clearSessionUser();
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

		// make axios call to update password

		return { success: "Password updated successfully" };
	}
)
