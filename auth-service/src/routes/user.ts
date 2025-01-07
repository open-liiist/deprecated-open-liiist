import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import { UserController } from "../controllers/user";

const router = Router();

// Applica il middleware a tutte le rotte di questo router
router.use(authenticateToken);

// Definisci le rotte protette
router.get('/:id', UserController.getUser);
router.put('/:id', UserController.updateUser);

export { router };