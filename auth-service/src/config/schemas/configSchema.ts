// auth-service/src/schemas/configSchema.ts

import { z } from 'zod';

export const configSchema = z.object({
    appName: z.string().optional(),
    isProduction: z.boolean(),
    isDevelopment: z.boolean(),
    isTest: z.boolean(),
    appPort: z.number(),
    databaseURL: z.string().url(),
    accessTokenSecret: z.string(),
    refreshTokenSecret: z.string(),
    cookies: z.object({
        access: z.string(),
        refresh: z.string(),
    }),
    apiBaseUrl: z.string().optional(),
    frontendUrl: z.string().optional(),
});

export type Config = z.infer<typeof configSchema>;
