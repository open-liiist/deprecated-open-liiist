import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Supermarket, Product } from '@/types'; // @ = src alias

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { supermarketId } = req.query;

    if (req.method === 'GET') {
        try {
            // Percorsi dei file JSON
            const supermarketsPath = path.join(process.cwd(), 'data', 'supermarkets.json');
            const productsPath = path.join(process.cwd(), 'data', 'products.json');

            // Legge i file JSON
            const supermarketsData: Omit<Supermarket, 'products'>[] = JSON.parse(fs.readFileSync(supermarketsPath, 'utf8'));
            const productsData: Product[] = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

            // Trova il supermercato specifico
            const supermarket = supermarketsData.find(s => s.supermarketId === supermarketId);
            if (!supermarket) {
                return res.status(404).json({ error: 'Supermercato non trovato' });
            }

            // Trova i prodotti associati
            const products = productsData.filter(p => p.supermarket === supermarketId);

            // Risposta finale
            const response: Supermarket = {
                ...supermarket,
                products,
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
