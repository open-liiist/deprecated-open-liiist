// web-client/src/config/environments.ts
import development from './environments/development'
import production from './environments/production'
import test from './environments/test'

/*
    environment global variable that simplifies and makes secure 
    the access to the environment variables
*/

const env = process.env.NODE_ENV || 'development'

const environments = {
    development,
    production,
    test,
};

const environment = environments[env]

export default environment
