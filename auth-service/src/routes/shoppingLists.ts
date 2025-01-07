import { Router } from 'express';
import { authenticateToken } from "../middlewares/auth";
import { ShoppingListController } from "../controllers/shoppingList";

const router = Router();

// Applica il middleware a tutte le rotte di questo router
router.use(authenticateToken);

// Rotte protette
router.get("/", ShoppingListController.getShoppingLists);
router.post("/", ShoppingListController.createShoppingList);
router.get("/:id", ShoppingListController.getShoppingList);
router.put("/:id", ShoppingListController.updateShoppingList);
router.delete("/:id", ShoppingListController.deleteShoppingList);

export { router };