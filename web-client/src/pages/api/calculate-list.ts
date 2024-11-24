// /pages/api/calculate-list.ts

import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
        // Simulazione della risposta
        const { products, budget, mode } = req.body;

        // Logica semplificata per simulare la risposta
        const withinBudget = parseFloat(budget) >= 50; // Supponiamo che il costo totale dei prodotti sia 50
        const response = {
            withinBudget,
            recommendedProducts: products, // In una logica reale, qui ci sarebbe il calcolo dei prodotti consigliati
        };

        res.status(200).json(response);
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
