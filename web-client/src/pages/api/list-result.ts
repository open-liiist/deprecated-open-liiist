import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            // Percorsi aggiornati per la cartella data nella root
            const supermarketsPath = path.join(process.cwd(), 'data', 'supermarkets.json');
            const productsPath = path.join(process.cwd(), 'data', 'products.json');

            // Legge i file JSON
            const supermarketsData = JSON.parse(fs.readFileSync(supermarketsPath, 'utf8'));
            const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

            // Combina i dati dei supermercati con i loro prodotti
            const supermarketsWithProducts = supermarketsData.map(supermarket => ({
                ...supermarket,
                products: productsData.filter(product => product.supermarket === supermarket.supermarketId),
            }));

            // Crea la risposta
            const response = {
                supermarkets: supermarketsWithProducts,
                total_price: 0,
                user_budget: 45.00,
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Errore:', error);
            res.status(500).json({ error: 'Errore nel recupero dei dati.' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
