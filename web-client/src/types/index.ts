// export type Product = {
//     uniqueProductId: string;
//     full_name: string;
//     img_url: string;
//     description: string;
//     quantity: number;
//     price: number;
//     price_for_kg?: number;
//     discounted_price?: number;
//     supermarket: string;
//     localization: {
//         grocery: string;
//         lat: number;
//         long: number;
//     };
// };

// export type Supermarket = {
//     supermarketId: string;
//     name: string;
//     street: string;
//     lat: number;
//     long: number;
//     city: string;
//     working_hours: string;
//     pickup_available: boolean;
//     zip_code: string;
//     products: Product[];
// };

// export type Product = {
//     id: number; // Prisma usa `id` come PK
//     name_id: string; // Corrisponde a `name_id` in Prisma
//     full_name: string; // Nome completo (es. "Pasta Barilla 500g")
//     name: string; // Nome breve (es. "Pasta")
//     description: string; // Descrizione del prodotto
//     current_price: number; // Prezzo attuale
//     discount: number; // Sconto applicato
//     localizationId: number; // ID della localizzazione (negozio) collegato
//     created_at: string; // Data di creazione
//     updated_at: string; // Data di aggiornamento automatico
//     price_for_kg?: number; // Prezzo per kg (facoltativo)
//     image_url?: string; // URL dell'immagine (facoltativo)
//     quantity?: string; // Quantità come stringa (es. "2 packs")
//     localization: Localization; // Collegamento al negozio
//     history?: ProductHistory[]; // Storico dei prezzi
// };

// export type ProductHistory = {
//     id: number; // PK della tabella ProductHistory
//     productId: number; // FK che collega a Product
//     price: number; // Prezzo registrato
//     discount: number; // Sconto applicato
//     recorded_at: string; // Data di registrazione del prezzo
// };

// export type Localization = {
//     id: number; // PK della tabella Localization
//     grocery: string; // Nome del negozio (es. "Esselunga", "Coop")
//     lat: number; // Latitudine
//     lng: number; // Longitudine
//     street?: string; // Via
//     city?: string; // Città
//     zip_code?: string; // CAP
//     working_hours?: string; // Orari di apertura
//     picks_up_in_store?: boolean; // Se il negozio supporta il ritiro in negozio
//     products?: Product[]; // Relazione 1:N con i prodotti
// };

export type Product = {
    id: number;
    name_id: string;
    full_name: string;
    name: string;
    description: string;
    current_price: number;
    discount: number;
    localizationId: number;
    created_at: string;
    updated_at: string;
    price_for_kg?: number;
    image_url?: string;
    quantity?: string;
    localization: Localization;
    history?: ProductHistory[];
};

export type ProductHistory = {
    id: number;
    productId: number;
    price: number;
    discount: number;
    recorded_at: string;
};

export type Localization = {
    id: number;
    grocery: string;
    lat: number;
    lng: number;
    street?: string;
    city?: string;
    zip_code?: string;
    working_hours?: string;
    picks_up_in_store?: boolean;
    products?: Product[];
};
