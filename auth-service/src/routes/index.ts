import { Router } from "express";
import { router as status } from "./status";
import { router as user } from "./user";
import { router as auth } from "./auth";
import { router as shoppingLists} from "./shoppingLists"

const router = Router();

router.use('/', status);
router.use('/auth', auth);
router.use('/users', user);
router.use('/shoppingList', shoppingLists);

export { router };
