import { NextApiRequest, NextApiResponse } from "next";
import environment from "@/config/environment";
import { fetchClient } from "@/lib/api";

export default async function handler(req: NextApiRequest, res: NextApiRequest){
    if(req.method !== "PUT"){
        return res.status(405).json({error: "method not allowed"});
    }
    const sessionCookie = req.cookies[environment.cookies.access];
    if(!sessionCookie){
        return res.status(401).json({error: "Unauthorized"});
    }
    console.log("upload called");
    try {
        const {listId} = req.query;
        const body = req.body;
        if(!listId){
            return res.status(400).json({error: "bad request Missing list id"})
        }
        const response = await fetchClient.put(`/shoppingList/${listId}`, body, sessionCookie);
        if (!response.ok){
            console.error("Backend API error:", response.statusText);
            return res.status(response.status).json({ error: "Failed to upload shopping list" });
        }
        const data = await response.json();
        console.log("uplaoded list: ", JSON.stringify(data, null, 2));
        return res.status(200).json({ message: "Shopping list uploaded successfully", data });
    }
    catch (error) {
        console.error("error uploading the list:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}