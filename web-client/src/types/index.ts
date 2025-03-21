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
