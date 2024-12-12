import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { logger } from '../utils/logger';
import prisma from '../services/prisma' // Assicurati che Prisma sia correttamente importato

export class ShoppingListController {
  // Ottieni tutte le liste della spesa per un utente
  static async getShoppingLists(req: Request, res: Response, next: NextFunction) {
    logger.info(`getting list for this user`);
    try {
        // Controllo se l'utente è autenticato
        if (!req.user || !req.user.userId) {
          next(ApiResponse.error("User ID is missing"));
          return;
        }

        const userId = req.user.userId;

        // Recupera le liste della spesa
        const shoppingLists = await prisma.shoppingList.findMany({
            where: { userId },
            include: { products: true }, // Include i prodotti associati alla lista
        });

        if (!shoppingLists || shoppingLists.length === 0) {
            next(ApiResponse.error("No shopping lists found"));
            return;
        }

        // Invia la risposta al client
        res.status(200).json(ApiResponse.success("Shopping lists retrieved successfully", shoppingLists));
    } catch (error) {
        console.error("Errore nel recupero delle liste della spesa:", error);
        next(ApiResponse.error("Errore nel recupero delle liste."));
    }
}

  // Crea una nuova lista della spesa
  static async createShoppingList(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.userId) {
          next(ApiResponse.error("User ID is missing"));
          return; 
      }
      
      const userId = req.user.userId; // L'utente è autenticato, quindi possiamo prendere l'id
      const { name, budget, mode } = req.body;

      // Validazione dei campi obbligatori
      if (!name || !budget || !mode) {
        next(ApiResponse.error("All fields (name, budget, mode) are required." ));
        return;
      }

      const newList = await prisma.shoppingList.create({
        data: {
          name,
          budget,
          mode,
          userId,
          products: {
            create: [], // Inizialmente senza prodotti
          },
        },
      });

      res.status(201).json(ApiResponse.success("list created successfully", newList));
     // res.status(201).json(newList);
    } catch (error) {
      console.error("Errore nella creazione della lista:", error);
      next(ApiResponse.error("Errore nella creazione della lista." ));
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
       // return res.status(404).json({ error: "Lista della spesa non trovata." });
      }
      res.status(200).json(ApiResponse.success("list found", shoppingList));
      //res.json(shoppingList);
    } catch (error) {
      console.error("Errore nel recupero della lista della spesa:", error);
      next(ApiResponse.error("error getting list"));
      return;
      //res.status(500).json({ error: "Errore nel recupero della lista." });
    }
  }

  // Aggiorna una lista della spesa
  static async updateShoppingList(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, budget, mode, products } = req.body;

      const updatedList = await prisma.shoppingList.update({
        where: { id },
        data: {
          name,
          budget,
          mode,
          products: {
            // Aggiungi la logica per aggiornare i prodotti se necessario
            update: products,
          },
        },
      });
      res.json(updatedList);
    } catch (error) {
      console.error("Errore nell'aggiornamento della lista della spesa:", error);
      res.status(500).json({ error: "Errore nell'aggiornamento della lista." });
    }
  }

  // Elimina una lista della spesa
  static async deleteShoppingList(req: Request, res: Response) {
    try {
      const { id } = req.params;
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
