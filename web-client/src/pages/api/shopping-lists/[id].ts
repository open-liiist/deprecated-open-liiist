// /pages/api/shopping-lists/[id].ts
import { NextApiRequest, NextApiResponse } from "next";
import { readShoppingLists, writeShoppingLists } from "../database";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    let shoppingLists = readShoppingLists();
    const { id } = req.query;

    if (req.method === "DELETE") {
        shoppingLists = shoppingLists.filter((list) => list.id !== id);
        writeShoppingLists(shoppingLists);
        res.status(200).json({ message: "Lista eliminata con successo" });
    } else if (req.method === "GET") {
        const list = shoppingLists.find((list) => list.id === id);
        if (list) {
            res.status(200).json(list);
        } else {
            res.status(404).json({ message: "List not found" });
        }
    } else if (req.method === "PUT") {
        const { name, products, budget, mode } = req.body;
        let listIndex = shoppingLists.findIndex((list) => list.id === id);

        if (listIndex !== -1) {
            shoppingLists[listIndex] = {
                ...shoppingLists[listIndex],
                name,
                products,
                budget,
                mode,
            };
            writeShoppingLists(shoppingLists); // Salva i dati aggiornati nel file JSON
            res.status(200).json(shoppingLists[listIndex]);
        } else {
            res.status(404).json({ message: "List not found" });
        }
    } else {
        res.status(405).json({ message: "Method Not Allowed" });
    }
}
