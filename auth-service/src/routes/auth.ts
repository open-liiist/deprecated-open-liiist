import { Router } from "express";
import { AuthController } from "../controllers/auth";

const router = Router();

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)
router.post('/refresh', AuthController.refreshToken)
router.post('/verify', AuthController.verifyToken)
router.post('/revoke', AuthController.revokeToken)
router.post('/logout', AuthController.logout)

export { router };
