// /pages/api/list-result.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Simulazione dei dati dei supermercati con prodotti
        const data = {
            supermarkets: [
                {
                    name: "Supermercato1",
                    street: "Via Roma 1",
                    city: "Milano",
                    pickup_available: true,
                    working_hours: "8:00 - 20:00",
                    products: [
                        {
                            full_name: "Pasta Spaghetti Barilla 500g",
                            img_url: "http://esempio.com/img/pasta.jpg",
                            description: "Pasta di semola di grano duro.",
                            quantity: 1,
                            price: 1.50,
                            discounted_price: null,
                        },
                        {
                            full_name: "Olio Extra Vergine 1L",
                            img_url: "http://esempio.com/img/olio.jpg",
                            description: "Olio extravergine di oliva.",
                            quantity: 1,
                            price: 5.00,
                            discounted_price: 4.50,
                        },
                    ],
                },
                {
                    name: "Supermercato2",
                    street: "Corso Venezia 10",
                    city: "Milano",
                    pickup_available: false,
                    working_hours: "9:00 - 21:00",
                    products: [
                        {
                            full_name: "Tonno in scatola 3x80g",
                            img_url: "http://esempio.com/img/tonno.jpg",
                            description: "Tonno al naturale.",
                            quantity: 1,
                            price: 2.00,
                            discounted_price: 1.80,
                        },
                        {
                            full_name: "Latte Intero 1L",
                            img_url: "http://esempio.com/img/latte.jpg",
                            description: "Latte intero a lunga conservazione.",
                            quantity: 1,
                            price: 1.20,
                            discounted_price: null,
                        },
                    ],
                },
            ],
            total_price: 50.00,
            user_budget: 45.00,
        };

        res.status(200).json(data);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
