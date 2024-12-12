import { NextApiRequest, NextApiResponse } from "next";
import environment from "@/config/environment";
import { cookies } from "next/headers";
import { fetchClient } from "@/lib/api"; // Assicurati che il percorso sia corretto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Recupera il cookie della sessione
    const sessionCookie = req.cookies[environment.cookies.access];
    console.log(`chiamata api del front ${sessionCookie}`);

    // Se il token di accesso è assente, restituisci un errore 401
    if (sessionCookie === undefined) {
        return res.status(401).json({ error: "Unauthorized" }); //debug infos
    }

    try {
        // Usa FetchClient per ottenere le liste della spesa
        const response = await fetchClient.get(`/shoppingList`, sessionCookie);

        // Gestisci errori dalla risposta dell'API
        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch shopping lists" });
        }

        // Restituisci i dati ricevuti dall'API
        const data = await response.json();
        console.log("Il return dell'API:", JSON.stringify(data, null, 2)) //debug info
        return res.status(200).json(data);
    } catch (error) {
        // Gestisci eventuali errori durante la richiesta
        console.error("Errore durante il recupero delle liste:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

