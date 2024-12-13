import { NextApiRequest, NextApiResponse } from "next";
import environment from "@/config/environment";
import { fetchClient } from "@/lib/api"; // Assicurati che il percorso sia corretto

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Verifica che il metodo sia DELETE
    if (req.method !== "DELETE") {
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
        // Recupera l'ID della lista dal corpo della richiesta
        const { listId } = req.body;

        // Controllo se l'ID della lista è presente
        if (!listId) {
            return res.status(400).json({ error: "Bad Request. Missing shopping list ID." });
        }

        // Usa FetchClient per inviare la richiesta di DELETE al backend
        const response = await fetchClient.delete(`/shoppingList/${listId}`, sessionCookie);

        // Gestisci errori dalla risposta dell'API
        if (!response.ok) {
            console.error("Errore dall'API backend:", response.statusText); // Debug info
            return res.status(response.status).json({ error: "Failed to delete shopping list" });
        }

        // Restituisci i dati ricevuti dall'API
        const data = await response.json();
        console.log("Il return dell'API:", JSON.stringify(data, null, 2)); // Debug info
        return res.status(200).json({ message: "Shopping list deleted successfully", data });
    } catch (error) {
        // Gestisci eventuali errori durante la richiesta
        console.error("Errore durante l'eliminazione della lista:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}