// pages/api/nearby-supermarkets.ts

import { NextApiRequest, NextApiResponse } from "next";

// Mock dataset of supermarkets in Rome
const supermarkets = [
    {
        id: 1,
        name: "Supermercato Roma Nord",
        latitude: 41.934,
        longitude: 12.462,
        address: "Via Roma Nord, 123",
    },
    {
        id: 2,
        name: "Supermercato Roma Sud",
        latitude: 41.842,
        longitude: 12.482,
        address: "Via Roma Sud, 45",
    },
    {
        id: 3,
        name: "Supermercato Centro",
        latitude: 41.89,
        longitude: 12.492,
        address: "Via del Corso, 22",
    },
    // add other markets here
];

// Funzione per calcolare la distanza tra due punti usando la formula dell'haversine
const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Raggio della Terra in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distanza in km
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    // Trova supermercati entro un raggio di 5 km
    const nearbySupers = supermarkets.filter((supermarket) => {
        const distance = calculateDistance(
            latitude,
            longitude,
            supermarket.latitude,
            supermarket.longitude,
        );
        return distance <= 5; // Filtra supermercati entro 5 km
    });

    res.status(200).json({ supermarkets: nearbySupers });
}
