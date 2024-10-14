import { z } from 'zod'

export const configSchema = z.object({
	appName: z.string().default("Web Client for Grocygo"),
	isProduction: z.boolean(),
	isDevelopment: z.boolean(),
	isTest: z.boolean(),
	appPort: z.number().min(1).max(65535),
	apiBaseUrl: z.string().url().default('http://localhost:3001'),
	frontendUrl: z.string().url().default('http://localhost:3000'),
	jwtSecret: z.string().min(10).default('your_jwt_secret'),
	jwtExpiration: z.string().default('7d'),
})

export type Config = z.infer<typeof configSchema>
