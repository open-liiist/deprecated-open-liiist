// web-client/src/config/environments/test.ts

import { configFactory } from '../factories/configFactory'

export default configFactory({
    isTest: true,
    apiBaseUrl: 'http://localhost:4000', // URL del back-end per i test
    frontendUrl: 'http://localhost:3000' // URL del front-end per i test (opzionale)
})
