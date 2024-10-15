import { Router } from "express";
import { StatusController } from "../controllers/status";

const router = Router();

router.get('/ping', (_, res) => {
	res.status(200).json({ message: 'pong' });
});

router.get('/status', StatusController.getStatus);

export { router };
