// auth-service/src/config/environments/development.ts

import { configFactory } from '../factories/configFactory'

export default configFactory({
    isProduction: false,
    isDevelopment: true,
    isTest: false,
    cookies: {
        access: 'grocygo-access_token',
        refresh: 'grocygo-refresh_token',
    },
})
