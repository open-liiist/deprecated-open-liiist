import { Router } from "express";
import { router as status } from "./status";
import { router as user } from "./user";
import { router as auth } from "./auth";

const router = Router();

router.use('/', status);
router.use('/auth', auth);
router.use('/users', user);

export { router };
