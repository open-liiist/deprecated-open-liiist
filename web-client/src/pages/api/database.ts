// /pages/api/database.ts
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(),"src", "pages", "api", "shoppingLists.json");

// Funzione per leggere i dati dal file JSON
export const readShoppingLists = () => {
    try {
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
    } catch (err) {
        console.error("Errore nella lettura delle liste:", err);
        return [];
    }
};

// Funzione per scrivere i dati nel file JSON
export const writeShoppingLists = (data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Errore nella scrittura delle liste:", err);
    }
};
