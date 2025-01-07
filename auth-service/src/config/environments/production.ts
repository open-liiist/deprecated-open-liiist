// auth-service/src/config/environments/production.ts

import { configFactory } from '../factories/configFactory'

export default configFactory({
    isProduction: true, // Deve essere true in produzione
    isDevelopment: false,
    isTest: false,
    cookies: {
        access: 'grocygo-access_token',
        refresh: 'grocygo-refresh_token',
    },
})
