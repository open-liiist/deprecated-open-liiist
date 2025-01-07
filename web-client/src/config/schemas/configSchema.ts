// web-client/src/config/schemas/configSchema.ts
import { z } from 'zod'

export const configSchema = z.object({
    appName: z.string().default("Web Client for Grocygo"),
    isProduction: z.boolean(),
    isDevelopment: z.boolean(),
    isTest: z.boolean(),
    cookies: z.object({
        access: z.string().default('grocygo-access_token'),
        refresh: z.string().default('grocygo-refresh_token'),
    }),
    appPort: z.number().min(1).max(65535),
    apiBaseUrl: z.union([
        z.string().url(),       // Permette URL assolute
        z.string().regex(/^\/.*/) // Permette URL relative che iniziano con '/'
    ]).default('http://localhost:3001'), // Valore di default per ambienti che richiedono URL assolute
    frontendUrl: z.string().url().default('http://localhost:3000'),
    jwtSecret: z.string().min(10).default('your_jwt_secret'),
    jwtExpiration: z.string().default('7d'),
})

export type Config = z.infer<typeof configSchema>

