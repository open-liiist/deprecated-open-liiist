import { NextApiRequest, NextApiResponse } from "next";
import environment from "@/config/environment";
import { fetchClient } from "@/lib/api";

export default async function handler(req: NextApiRequest, res: NextApiResponse){

    if(req.method !== "GET"){
        return res.status(405).json({ error: "Method not allowed" });
    }
    const sessionCookie = req.cookies[environment.cookies.access];
    if (!sessionCookie) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const { listId } = req.query;

        if(!listId){
            return res.status(400).json({ error: "Bad Request. Missing shopping list ID." });
        }
        const response = await fetchClient.get(`/shoppingList/${listId}`, sessionCookie);
        if (!response.ok) {
            console.error("Backend API error:", response.statusText);
            return res.status(response.status).json({ error: "Failed to get shopping list" });
        }
        const data = await response.json();
        console.log("getAList return ", JSON.stringify(data, null, 2));
        return res.status(200).json({ message: "Shopping list retrived successfully", data });
    }
    catch (error) {
        console.error("error retriving the list:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}