// auth-service/src/routes/index.ts

import { Router } from "express";
import { router as authRouter } from "./auth";
import { router as userRouter } from "./user";
import { router as shoppingListRouter } from "./shoppingLists"; // Aggiungi se esiste


const router = Router();

// Usa i router importati
router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/shoppingList', shoppingListRouter); // Aggiungi se esiste


export { router };
