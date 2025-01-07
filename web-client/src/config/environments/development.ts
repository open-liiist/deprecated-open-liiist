// web-client/src/config/environments/development.ts

import { configFactory } from '../factories/configFactory';

export default configFactory({
  isDevelopment: true,
  apiBaseUrl: '/api', // Utilizza il proxy configurato
  frontendUrl: 'http://localhost:3000', // URL del front-end in sviluppo (opzionale)
});
