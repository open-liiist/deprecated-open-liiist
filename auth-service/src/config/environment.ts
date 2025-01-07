// auth-service/src/config/environment.ts

import development from './environments/development';
import production from './environments/production';
import test from './environments/test';

type Environment = "development" | "production" | "test";

const env: Environment = (process.env.NODE_ENV as Environment) || "development";

const environments = {
    development,
    production,
    test,
};

const environment = environments[env];

export default environment;
