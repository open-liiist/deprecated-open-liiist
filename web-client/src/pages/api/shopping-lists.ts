// /pages/api/shopping-lists.ts
import { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { readShoppingLists, writeShoppingLists } from "@/pages/api/database";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    let shoppingLists = readShoppingLists();

    if (req.method === "POST") {
        const { name, products, budget, mode, userId } = req.body;

        // Assicurati che i prodotti siano in un formato corretto
        const formattedProducts = products.map((product: any) => ({
            name: product.name,
            quantity: product.quantity,
        }));

        const newList = {
            id: uuidv4(),
            name,
            products: formattedProducts,
            budget,
            mode,
            userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        shoppingLists.push(newList);
        writeShoppingLists(shoppingLists); // Salva i dati nel file JSON
        res.status(201).json(newList);
    } else if (req.method === "GET") {
        // Recupera le liste per un utente specifico
        const { userId } = req.query;
        const userLists = shoppingLists.filter(
            (list) => list.userId === userId,
        );
        res.status(200).json(userLists);
    } else if (req.method === "DELETE") {
        // Cancella una lista specifica per ID
        const { listId } = req.query;
        shoppingLists = shoppingLists.filter((list) => list.id !== listId);
        writeShoppingLists(shoppingLists);
        res.status(200).json({ message: "List deleted successfully" });
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
