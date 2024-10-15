import { configSchema, Config } from '../schemas/configSchema'

export const configFactory = (overrides: Partial<Config>): Config => {
	const envConfig = {
		appName: process.env.APP_NAME,
		isProduction: process.env.NODE_ENV === 'production',
		isDevelopment: process.env.NODE_ENV === 'development',
		isTest: process.env.NODE_ENV === 'test',
		appPort: process.env.AUTH_SERVICE_PORT ? parseInt(process.env.AUTH_SERVICE_PORT, 10) : 4000,
		databaseURL: process.env.AUTH_DATABASE_URL,
		accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
		refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
	}

	const mergedConfig = { ...envConfig, ...overrides }

	const validatedConfig = configSchema.safeParse(mergedConfig)

	if (!validatedConfig.success) {
		throw new Error(
			'Invalid configuration: ' + JSON.stringify(validatedConfig.error.format())
		)
	}

	return validatedConfig.data
}
