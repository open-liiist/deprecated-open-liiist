// auth-service/src/config/init/routes.ts

import { Router } from "express";
import { router } from "../../routes";

const appRouter = Router();

appRouter.use(router); // Usa il router combinato

export { appRouter };
