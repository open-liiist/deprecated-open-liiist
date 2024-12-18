// import { NextApiRequest, NextApiResponse } from 'next';
// import fs from 'fs';
// import path from 'path';
// import { Supermarket, Product } from '@/types'; // @ = src alias

// export default function handler(req: NextApiRequest, res: NextApiResponse) {
//     const { supermarketId } = req.query;

//     if (req.method === 'GET') {
//         try {
//             // Percorsi dei file JSON
//             const supermarketsPath = path.join(process.cwd(), 'data', 'supermarkets.json');
//             const productsPath = path.join(process.cwd(), 'data', 'products.json');

//             // Legge i file JSON
//             const supermarketsData: Omit<Supermarket, 'products'>[] = JSON.parse(fs.readFileSync(supermarketsPath, 'utf8'));
//             const productsData: Product[] = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

//             // Trova il supermercato specifico
//             const supermarket = supermarketsData.find(s => s.supermarketId === supermarketId);
//             if (!supermarket) {
//                 return res.status(404).json({ error: 'Supermercato non trovato' });
//             }

//             // Trova i prodotti associati
//             const products = productsData.filter(p => p.supermarket === supermarketId);

//             // Risposta finale
//             const response: Supermarket = {
//                 ...supermarket,
//                 products,
//             };

//             res.status(200).json(response);
//         } catch (error) {
//             console.error('Errore:', error);
//             res.status(500).json({ error: 'Errore nel recupero dei dati.' });
//         }
//     } else {
//         res.setHeader('Allow', ['GET']);
//         res.status(405).end(`Method ${req.method} Not Allowed`);
//     }
// }
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

const productSchema = z.object({
    id: z.number(),
    name_id: z.string(),
    full_name: z.string(),
    name: z.string(),
    description: z.string(),
    current_price: z.number(),
    discount: z.number().optional(),
    localizationId: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    price_for_kg: z.number().nullable(),
    image_url: z.string().optional(),
    quantity: z.string().optional(),
    localization: z.object({
        grocery: z.string(),
        lat: z.number(),
        lng: z.number(),
    })
});

const supermarketSchema = z.object({
    id: z.number(),
    grocery: z.string(),
    street: z.string().optional(),
    city: z.string().optional(),
    zip_code: z.string().optional(),
    lat: z.number(),
    lng: z.number(),
    picks_up_in_store: z.boolean(),
    working_hours: z.string().optional(),
    products: z.array(productSchema).optional(),
});

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { supermarketId } = req.query;

    if (req.method === 'GET') {
        try {
            const supermarketsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/supermarkets.json'), 'utf8'));
            const productsData = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data/products.json'), 'utf8'));

            const supermarkets = supermarketSchema.array().parse(supermarketsData);
            const products = productSchema.array().parse(productsData);

            const supermarket = supermarkets.find(s => s.id === parseInt(supermarketId as string));

            if (!supermarket) {
                return res.status(404).json({ error: 'Supermercato non trovato' });
            }

            supermarket.products = products.filter(p => p.localizationId === supermarket.id);
            res.status(200).json(supermarket);

        } catch (error) {
            console.error('Errore nella validazione dei dati:', error);
            res.status(500).json({ error: 'Errore nella validazione dei dati.' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
