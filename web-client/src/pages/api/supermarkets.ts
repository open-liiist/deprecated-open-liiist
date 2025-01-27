import { NextApiRequest, NextApiResponse } from 'next';

// Mocked supermarkets data
const supermarkets = [
  { id: '1', name: 'Conad', address: 'Via Roma 12, Torino', latitude: 45.0703, longitude: 7.6869, openingHours: '08:00 - 20:00' },
  { id: '2', name: 'Tigre', address: 'Via Milano 5, Milano', latitude: 45.4642, longitude: 9.1900, openingHours: '09:00 - 21:00' },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all supermarkets
    res.status(200).json({ supermarkets });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
