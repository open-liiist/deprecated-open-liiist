import { z } from 'zod'

export const configSchema = z.object({
	appName: z.string().default("Auth Micro Service"),
	isProduction: z.boolean(),
	isDevelopment: z.boolean(),
	isTest: z.boolean(),
	appPort: z.number().min(1).max(65535).default(4000),
	databaseURL: z.string().min(10),
	accessTokenSecret: z.string().min(10).default('accessTokenSecret'),
	refreshTokenSecret: z.string().min(10).default('refreshTokenSecret'),
})

export type Config = z.infer<typeof configSchema>
