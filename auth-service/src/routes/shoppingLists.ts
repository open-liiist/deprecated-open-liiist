import { Router } from 'express';
import { authenticateToken } from "../middlewares/auth";
import { ShoppingListController } from "../controllers/shoppingList";

const router = Router();

// Ottieni tutte le liste della spesa per un utente
router.get("/", authenticateToken, ShoppingListController.getShoppingLists);

// Crea una nuova lista della spesa
router.post("/", authenticateToken, ShoppingListController.createShoppingList);

// Ottieni una lista della spesa specifica
router.get("/:id", authenticateToken, ShoppingListController.getShoppingList);

// Aggiorna una lista della spesa
router.put("/:id", authenticateToken, ShoppingListController.updateShoppingList);

// Elimina una lista della spesa
router.delete("/:id", authenticateToken, ShoppingListController.deleteShoppingList);

export { router };