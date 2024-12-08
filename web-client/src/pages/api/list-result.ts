// /pages/api/list-result.ts

import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        // Simulazione dei dati dei supermercati con prodotti
        const data = {
            supermarkets: [
                {
                    supermarketId: "uniquemarketId-store01",
                    name: "Conad Milano Centro",
                    street: "Via Roma 1",
                    city: "Milano",
                    zip_code: "20121",
                    lat: 45.4642,     // Latitudine fittizia Milano centro
                    long: 9.19,       // Longitudine fittizia Milano centro
                    pickup_available: true,
                    working_hours: "8:00 - 20:00",
                    products: [
                        {
                            uniquepProductId: "product-001",
                            full_name: "Pasta Spaghetti Barilla 500g",
                            img_url: "https://example.com/images/spaghetti.jpg",
                            description: "Pasta di semola di grano duro.",
                            quantity: 1,
                            price: 1.50,
                            discounted_price: null,
                            price_for_kg: null,
                            external_url: "https://www.conad.it/spaghetti",
                            supermarket: "uniquemarketId-store01",
                            localization: {
                                grocery: "Pasta e cereali",
                                lat: 45.4643,
                                long: 9.1901
                            }
                        },
                        {
                            uniquepProductId: "product-002",
                            full_name: "Olio Extra Vergine 1L",
                            img_url: "https://example.com/images/olio.jpg",
                            description: "Olio extravergine di oliva di alta qualità.",
                            quantity: 1,
                            price: 5.00,
                            discounted_price: 4.50,
                            price_for_kg: null,
                            external_url: "https://www.conad.it/olio-extravergine",
                            supermarket: "uniquemarketId-store01",
                            localization: {
                                grocery: "Oli e condimenti",
                                lat: 45.4643,
                                long: 9.1902
                            }
                        },
                        {
                            uniquepProductId: "product-003",
                            full_name: "Passata di Pomodoro 700g",
                            img_url: "https://example.com/images/passata.jpg",
                            description: "Passata di pomodoro 100% italiana.",
                            quantity: 2,
                            price: 2.50,
                            discounted_price: 2.20,
                            price_for_kg: null,
                            external_url: "https://www.conad.it/passata",
                            supermarket: "uniquemarketId-store01",
                            localization: {
                                grocery: "Salse e sughi",
                                lat: 45.4643,
                                long: 9.1903
                            }
                        },
                        {
                            uniquepProductId: "product-004",
                            full_name: "Biscotti Integrali 350g",
                            img_url: "https://example.com/images/biscotti.jpg",
                            description: "Biscotti integrali ricchi di fibre.",
                            quantity: 1,
                            price: 3.00,
                            discounted_price: null,
                            price_for_kg: 8.57,
                            external_url: "https://www.conad.it/biscotti-integrali",
                            supermarket: "uniquemarketId-store01",
                            localization: {
                                grocery: "Dolci e snack",
                                lat: 45.4643,
                                long: 9.1904
                            }
                        },
                        {
                            uniquepProductId: "product-005",
                            full_name: "Mela Golden kg",
                            img_url: "https://example.com/images/mela.jpg",
                            description: "Mele Golden del Trentino.",
                            quantity: 3,
                            price: 1.80,
                            discounted_price: null,
                            price_for_kg: 1.80,
                            external_url: "https://www.conad.it/mela-golden",
                            supermarket: "uniquemarketId-store01",
                            localization: {
                                grocery: "Frutta e verdura",
                                lat: 45.4643,
                                long: 9.1905
                            }
                        },
                    ],
                },
                {
                    supermarketId: "uniquemarketId-store02",
                    name: "Supermercato2 Milano",
                    street: "Corso Venezia 10",
                    city: "Milano",
                    zip_code: "20121",
                    lat: 45.4672,
                    long: 9.2010,
                    pickup_available: false,
                    working_hours: "9:00 - 21:00",
                    products: [
                        {
                            uniquepProductId: "product-010",
                            full_name: "Tonno in scatola 3x80g",
                            img_url: "https://example.com/images/tonno.jpg",
                            description: "Tonno al naturale in tranci.",
                            quantity: 1,
                            price: 2.00,
                            discounted_price: 1.80,
                            price_for_kg: null,
                            external_url: "https://www.supermercato2.it/tonno",
                            supermarket: "uniquemarketId-store02",
                            localization: {
                                grocery: "Pesce in scatola",
                                lat: 45.4673,
                                long: 9.2011
                            }
                        },
                        {
                            uniquepProductId: "product-011",
                            full_name: "Latte Intero 1L",
                            img_url: "https://example.com/images/latte.jpg",
                            description: "Latte intero a lunga conservazione.",
                            quantity: 1,
                            price: 1.20,
                            discounted_price: null,
                            price_for_kg: null,
                            external_url: "https://www.supermercato2.it/latte-intero",
                            supermarket: "uniquemarketId-store02",
                            localization: {
                                grocery: "Latticini",
                                lat: 45.4673,
                                long: 9.2012
                            }
                        },
                        {
                            uniquepProductId: "product-012",
                            full_name: "Pane Integrale 500g",
                            img_url: "https://example.com/images/pane_integrale.jpg",
                            description: "Pane integrale fresco di giornata.",
                            quantity: 2,
                            price: 2.50,
                            discounted_price: 2.20,
                            price_for_kg: 5.00,
                            external_url: "https://www.supermercato2.it/pane-integrale",
                            supermarket: "uniquemarketId-store02",
                            localization: {
                                grocery: "Panetteria",
                                lat: 45.4673,
                                long: 9.2013
                            }
                        },
                    ],
                },
            ],
            total_price: 0,
            user_budget: 45.00,
        };

        res.status(200).json(data);
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
