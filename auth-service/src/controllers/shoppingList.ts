import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import prisma from '../services/prisma'

interface Product {
  name: string;
  quantity: number;
}

interface CreateShoppingListRequest {
  name: string;
  budget: string;
  mode: string;
  products: Product[];
}

export class ShoppingListController {
  // Ottieni tutte le liste della spesa per un utente
  static async getShoppingLists(req: Request, res: Response, next: NextFunction) {
    logger.info(`getting list for this user`);
    try {
        if (!req.user || !req.user.userId) {
          next(ApiResponse.error("User ID is missing"));
          return;
        }

        const userId = req.user.userId;
        const shoppingLists = await prisma.shoppingList.findMany({
            where: { userId },
            include: { products: true }, 
        });

        if (!shoppingLists || shoppingLists.length === 0) {
            res.status(200).json(ApiResponse.success("No shopping lists found", []));
            return;
        }
        res.status(200).json(ApiResponse.success("Shopping lists retrieved successfully", shoppingLists));
    } catch (error) {
        console.error("Errore nel recupero delle liste della spesa:", error);
        next(ApiResponse.error("Errore nel recupero delle liste."));
    }
}


static async createShoppingList(req: Request<{}, {}, CreateShoppingListRequest>, res: Response, next: NextFunction) {
  try {
    if (!req.user || !req.user.userId) {
        next(ApiResponse.error("User ID is missing"));
        return; 
    }
    
    const userId = req.user.userId;
    const { name, budget, mode, products } = req.body;

    // Validazione dei campi obbligatori
    if (!name || !budget || !mode) {
      next(ApiResponse.error("All fields (name, budget, mode) are required."));
      return;
    }
    if (!Array.isArray(products) || !products.every(product => product.name && product.quantity)) {
      next(ApiResponse.error("Invalid products format. Each product must have name, quantity"));
      return;
    }

    const newList = await prisma.shoppingList.create({
      data: {
        name,
        budget,
        mode,
        userId,
        products: {
          create: products.map(product => ({
            name: product.name,
            quantity: product.quantity,
          })),
        },
      },
    });

    res.status(201).json(ApiResponse.success("list created successfully", newList));
  } catch (error) {
    console.error("Errore nella creazione della lista:", error);
    next(ApiResponse.error("Errore nella creazione della lista."));
    return;
  }
}

  // Ottieni una lista della spesa specifica
  static async getShoppingList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shoppingList = await prisma.shoppingList.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!shoppingList) {
        next(ApiResponse.error("list not found"));
        return;
      }
      res.status(200).json(ApiResponse.success("list found", shoppingList));
    } catch (error) {
      console.error("Errore nel recupero della lista della spesa:", error);
      next(ApiResponse.error("error getting list"));
      return;
    }
  }

  // Aggiorna una lista della spesa
  static async updateShoppingList(req: Request<{ id: string }, {}, CreateShoppingListRequest>, res: Response, next: NextFunction) {
    try {
      // 1. Verifica se l'utente è autenticato
      if (!req.user || !req.user.userId) {
        next(ApiResponse.error("User ID is missing"));
        return; 
      }
  
      const userId = req.user.userId;
      const { id } = req.params; // ID della lista da modificare
      const { name, budget, mode, products } = req.body;
  
      // 2. Validazione dei campi obbligatori
      if (!name || !budget || !mode) {
        next(ApiResponse.error("All fields (name, budget, mode) are required."));
        return;
      }
  
      if (!Array.isArray(products) || !products.every(product => product.name && typeof product.quantity === 'number')) {
        next(ApiResponse.error("Invalid products format. Each product must have 'name' and 'quantity' of type number."));
        return;
      }
  
      // 3. Controlla se la lista esiste
      const existingList = await prisma.shoppingList.findUnique({
        where: { id }
      });
  
      if (!existingList) {
        next(ApiResponse.error("Shopping list not found."));
        return;
      }
  
      // 4. Aggiorna la lista e i prodotti
      const updatedList = await prisma.shoppingList.update({
        where: { id },
        data: {
          name,
          budget,
          mode,
          products: {
            deleteMany: {}, // Elimina i prodotti esistenti (se vuoi sovrascriverli completamente)
            create: products.map(product => ({
              name: product.name,
              quantity: product.quantity,
            })),
          },
        },
        include: { products: true }, // Include i prodotti aggiornati
      });
  
      res.status(200).json(ApiResponse.success("List updated successfully", updatedList));
    } catch (error) {
      console.error("Errore nell'aggiornamento della lista:", error);
      next(ApiResponse.error("Errore nell'aggiornamento della lista."));
      return;
    }
  }
  

  // Elimina una lista della spesa
  static async deleteShoppingList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.product.deleteMany({
        where: { shoppingListId: id }
      });
      const deletedList = await prisma.shoppingList.delete({
        where: { id },
      });

      res.json(deletedList);
    } catch (error) {
      console.error("Errore nell'eliminazione della lista della spesa:", error);
      res.status(500).json({ error: "Errore nell'eliminazione della lista." });
    }
  }
}
