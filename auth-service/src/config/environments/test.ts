// auth-service/src/config/environments/test.ts

import { configFactory } from '../factories/configFactory';

export default configFactory({
    isProduction: false,
    cookies: {
        access: 'grocygo-access_token',
        refresh: 'grocygo-refresh_token',
    },
});
