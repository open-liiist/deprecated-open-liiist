import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query, position_latitude, position_longitude } = req.query;

  if (!query || !position_latitude || !position_longitude) {
    return res.status(400).json({ error: 'Parametri "query", "position_latitude" e "position_longitude" sono richiesti.' });
  }

  // Validare i parametri
  const latitude = parseFloat(position_latitude as string);
  const longitude = parseFloat(position_longitude as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Parametri "position_latitude" e "position_longitude" devono essere numeri validi.' });
  }

  try {
    const searchServiceURL = process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL || 'http://localhost:4001';
    const url = `${searchServiceURL}/search?query=${encodeURIComponent(query as string)}&position_latitude=${encodeURIComponent(latitude.toString())}&position_longitude=${encodeURIComponent(longitude.toString())}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error("Errore nella richiesta a search-service:", response.statusText);
      return res.status(response.status).json({ error: 'Errore nella richiesta a search-service' });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Errore nella richiesta a search-service:", error);
    res.status(500).json({ error: 'Errore nella richiesta' });
  }
}

// import { NextApiRequest, NextApiResponse } from 'next';

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { query, position } = req.query;

//   if (!query || !position) {
//     return res.status(400).json({ error: 'Parametri "query" e "position" sono richiesti.' });
//   }

//   const { latitude, longitude } = position as any;

//   if (typeof latitude !== 'string' || typeof longitude !== 'string') {
//     return res.status(400).json({ error: 'Parametri "latitude" e "longitude" devono essere stringhe valide.' });
//   }

//   try {
//     const searchServiceURL = process.env.NEXT_PUBLIC_SEARCH_SERVICE_URL || 'http://localhost:4001';
//     const url = `${searchServiceURL}/search?query=${encodeURIComponent(query as string)}&position.latitude=${encodeURIComponent(latitude)}&position.longitude=${encodeURIComponent(longitude)}`;
//     const response = await fetch(url);

//     if (!response.ok) {
//       console.error("Errore nella richiesta a search-service:", response.statusText);
//       return res.status(response.status).json({ error: 'Errore nella richiesta a search-service' });
//     }

//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Errore nella richiesta a search-service:", error);
//     res.status(500).json({ error: 'Errore nella richiesta' });
//   }
// }
