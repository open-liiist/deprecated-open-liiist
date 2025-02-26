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
  
  static async getShoppingLists(req: Request, res: Response, next: NextFunction) {
    logger.info(`Getting shopping lists for this user`);
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
        console.error("Error retrieving shopping lists:", error);
        next(ApiResponse.error("Error retrieving shopping lists."));
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

      // Validate required fields
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

      res.status(201).json(ApiResponse.success("Shopping list created successfully", newList));
    } catch (error) {
      console.error("Error creating shopping list:", error);
      next(ApiResponse.error("Error creating shopping list."));
      return;
    }
  }

  // Get a specific shopping list
  static async getShoppingList(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const shoppingList = await prisma.shoppingList.findUnique({
        where: { id },
        include: { products: true },
      });

      if (!shoppingList) {
        next(ApiResponse.error("Shopping list not found"));
        return;
      }
      res.status(200).json(ApiResponse.success("Shopping list found", shoppingList));
    } catch (error) {
      console.error("Error retrieving shopping list:", error);
      next(ApiResponse.error("Error retrieving shopping list"));
      return;
    }
  }

  // Update a shopping list
  static async updateShoppingList(req: Request<{ id: string }, {}, CreateShoppingListRequest>, res: Response, next: NextFunction) {
    try {
      // Check if the user is authenticated
      if (!req.user || !req.user.userId) {
        next(ApiResponse.error("User ID is missing"));
        return; 
      }
  
      const userId = req.user.userId;
      const { id } = req.params; // ID of the shopping list to update
      const { name, budget, mode, products } = req.body;
  
      // Validate required fields
      if (!name || !budget || !mode) {
        next(ApiResponse.error("All fields (name, budget, mode) are required."));
        return;
      }
  
      if (!Array.isArray(products) || !products.every(product => product.name && typeof product.quantity === 'number')) {
        next(ApiResponse.error("Invalid products format. Each product must have 'name' and 'quantity' of type number."));
        return;
      }
  
      // Check if the shopping list exists
      const existingList = await prisma.shoppingList.findUnique({
        where: { id }
      });
  
      if (!existingList) {
        next(ApiResponse.error("Shopping list not found."));
        return;
      }
  
      // Update the shopping list and products
      const updatedList = await prisma.shoppingList.update({
        where: { id },
        data: {
          name,
          budget,
          mode,
          products: {
            deleteMany: {}, // Delete existing products to completely overwrite them
            create: products.map(product => ({
              name: product.name,
              quantity: product.quantity,
            })),
          },
        },
        include: { products: true }, // Include updated products
      });
  
      res.status(200).json(ApiResponse.success("Shopping list updated successfully", updatedList));
    } catch (error) {
      console.error("Error updating shopping list:", error);
      next(ApiResponse.error("Error updating shopping list."));
      return;
    }
  }
  
  // Delete a shopping list
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
      console.error("Error deleting shopping list:", error);
      res.status(500).json({ error: "Error deleting shopping list." });
    }
  }
}
