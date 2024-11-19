import { NextApiRequest, NextApiResponse } from 'next';

// Mocked shopping lists data
const shoppingLists = [
  { id: '1', name: 'Lista di Pasqua', createdAt: '2024-10-10', updatedAt: '2024-10-11', budget: 100 },
  { id: '2', name: 'Lista di Spesa Weekend', createdAt: '2024-10-12', updatedAt: '2024-10-13', budget: 50 },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all shopping lists
    res.status(200).json({ lists: shoppingLists });
  } else if (req.method === 'POST') {
    // Add a new shopping list (for simplicity, no actual persistence is done here)
    const { name, budget } = req.body;
    const newList = {
      id: (shoppingLists.length + 1).toString(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      budget,
    };
    shoppingLists.push(newList);
    res.status(201).json({ list: newList });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
