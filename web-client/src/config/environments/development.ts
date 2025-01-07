// web-client/src/config/environments/development.ts

import { configFactory } from '../factories/configFactory'

export default configFactory({
    isDevelopment: true,
    apiBaseUrl: 'http://auth-service:4000', // URL corretto del back-end all'interno della rete Docker
    frontendUrl: 'http://localhost:3000' // URL del front-end in sviluppo (opzionale)
})
