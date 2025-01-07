// auth-service/src/routes/auth.ts

import { Router } from 'express';
import { AuthController } from '../controllers/auth';

const router = Router();

// Rotte di Autenticazione
router.post('/login', (req, res, next) => {
    console.log('Received POST /auth/login');
    AuthController.login(req, res, next);
});
router.post('/register', (req, res, next) => {
    console.log('Received POST /auth/register');
    AuthController.register(req, res, next);
});
router.post('/verify-token', (req, res, next) => {
    console.log('Received POST /auth/verify-token');
    AuthController.verifyToken(req, res, next);
});
router.post('/refresh-token', (req, res, next) => {
    console.log('Received POST /auth/refresh-token');
    AuthController.refreshToken(req, res, next);
});
router.post('/revoke-token', (req, res, next) => {
    console.log('Received POST /auth/revoke-token');
    AuthController.revokeToken(req, res, next);
});
router.post('/logout', (req, res, next) => {
    console.log('Received POST /auth/logout');
    AuthController.logout(req, res, next);
});

// Rotta di Test
router.get('/', (req, res) => {
    console.log('Received GET /auth');
    res.send('Auth Service is up');
});

export { router };


// Default code
// ---

// import { Router } from 'express';
// import { AuthController } from '../controllers/auth';

// const router = Router();

// router.post('/login', AuthController.login);
// router.post('/register', AuthController.register);
// router.post('/verify-token', AuthController.verifyToken);
// router.post('/refresh-token', AuthController.refreshToken);
// router.post('/revoke-token', AuthController.revokeToken);
// router.post('/logout', AuthController.logout);

// router.get('/', (req, res) => {
//     res.send('Auth Service is up');
// });

// export { router };
// ---
