import { NextApiRequest, NextApiResponse } from "next";
import environment from "@/config/environment";
import { cookies } from "next/headers";
import { fetchClient } from "@/lib/api"; // Assicurati che il percorso sia corretto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verifica che il metodo sia POST
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    // Recupera il cookie della sessione
    const sessionCookie = req.cookies[environment.cookies.access];
    console.log(`Chiamata API del front ${sessionCookie}`); // Debug info

    // Se il token di accesso è assente, restituisci un errore 401
    if (!sessionCookie) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        // Recupera il corpo della richiesta dalla richiesta POST
        const body = req.body;

        // Verifica che il corpo contenga i dati necessari per creare la lista della spesa
        if (!body || Object.keys(body).length === 0) {
            return res.status(400).json({ error: "Bad Request. Missing request body." });
        }

        // Usa FetchClient per creare la nuova lista della spesa nel backend
        const response = await fetchClient.post(`/shoppingList`, body, sessionCookie);

        // Gestisci errori dalla risposta dell'API
        if (!response.ok) {
            console.error("Errore dall'API backend:", response.statusText); // Debug info
            return res.status(response.status).json({ error: "Failed to create shopping list" });
        }

        // Restituisci i dati ricevuti dall'API
        const data = await response.json();
        console.log("Il return dell'API:", JSON.stringify(data, null, 2)); // Debug info
        return res.status(201).json(data); // 201 = Created
    } catch (error) {
        // Gestisci eventuali errori durante la richiesta
        console.error("Errore durante la creazione della lista:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}
