import { Router } from 'express';
import { authenticateToken } from "../middlewares/auth";
import { ShoppingListController } from "../controllers/shoppingList";

const router = Router();

// Get all shopping lists for a user
router.get("/", authenticateToken, ShoppingListController.getShoppingLists);

// Create a new shopping list
router.post("/", authenticateToken, ShoppingListController.createShoppingList);

// Get a specific shopping list
router.get("/:id", authenticateToken, ShoppingListController.getShoppingList);

// Update a shopping list
router.put("/:id", authenticateToken, ShoppingListController.updateShoppingList);

// Delete a shopping list
router.delete("/:id", authenticateToken, ShoppingListController.deleteShoppingList);

export { router };