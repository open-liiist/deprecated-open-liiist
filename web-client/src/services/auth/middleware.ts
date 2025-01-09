//web-client/src/services/auth/middleware.ts
import { User } from '@/types/user';
import { z } from 'zod';
import { getUser } from '../user';
import logger from '@/config/logger';

export type ActionState = {
	error?: string,
	success?: string,
	[key: string]: any;
}

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
	data: z.infer<S>,
	formData: FormData
) => Promise<T>;

export function validatedAction<S extends z.ZodType<any, any>, T>(
	schema: S,
	action: ValidatedActionFunction<S, T>
) {
	return async (_prevState: ActionState, formData: FormData): Promise<T> => {
		const result = schema.safeParse(Object.fromEntries(formData));
		if (!result.success) {
			return { error: result.error.errors[0].message } as T;
		}
		return action(result.data, formData);
	};
}

type ValidatedActionWithUserFunction<S extends z.ZodType<any, any>, T> = (
	data: z.infer<S>,
	formData: FormData,
	user: User
) => Promise<T>;

export function validatedActionWithUser<S extends z.ZodType<any, any>, T>(
	schema: S,
	action: ValidatedActionWithUserFunction<S, T>
) {
	return async (_prevState: ActionState, formData: FormData): Promise<T> => {
		const user = await getUser();
		if (!user) {
			throw new Error('User is not authenticated');
		}
		logger.info(`====== USER AUTHENTICATED ===== ${user.email}`)

		const result = schema.safeParse(Object.fromEntries(formData));
		if (!result.success) {
			return { error: result.error.errors[0].message } as T;
		}
		return action(result.data, formData, user);
	};
}
