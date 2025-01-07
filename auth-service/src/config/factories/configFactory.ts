// auth-service/src/config/factories/configFactory.ts

import { configSchema, Config } from '../schemas/configSchema';
import dotenv from 'dotenv';

dotenv.config(); // Carica le variabili d'ambiente

export const configFactory = (overrides: Partial<Config>): Config => {
    const envConfig: Partial<Config> = {
        appName: process.env.APP_NAME,
        isProduction: process.env.NODE_ENV === 'production',
        isDevelopment: process.env.NODE_ENV === 'development',
        isTest: process.env.NODE_ENV === 'test',
        appPort: process.env.AUTH_SERVICE_PORT ? parseInt(process.env.AUTH_SERVICE_PORT, 10) : 4000,
        databaseURL: process.env.AUTH_DATABASE_URL,
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
        cookies: {
            access: process.env.ACCESS_TOKEN_COOKIE || 'accessToken',
            refresh: process.env.REFRESH_TOKEN_COOKIE || 'refreshToken',
        },
        apiBaseUrl: process.env.API_BASE_URL,
        frontendUrl: process.env.NEXT_PUBLIC_API_URL,
    };

    const mergedConfig = { ...envConfig, ...overrides };

    console.log('Merged Config:', mergedConfig); // log


    const validatedConfig = configSchema.safeParse(mergedConfig);

    if (!validatedConfig.success) {
        throw new Error(
            'Invalid configuration: ' + JSON.stringify(validatedConfig.error.format())
        );
    }

    return validatedConfig.data;
};
