import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import { UserController } from "../controllers/user";

const router = Router();

router.get('/:id', authenticateToken, UserController.getUser);

export { router };
