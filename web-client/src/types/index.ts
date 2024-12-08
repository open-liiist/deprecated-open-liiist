export type Product = {
    uniqueProductId: string;
    full_name: string;
    img_url: string;
    description: string;
    quantity: number;
    price: number;
    price_for_kg?: number;
    discounted_price?: number;
    supermarket: string;
    localization: {
        grocery: string;
        lat: number;
        long: number;
    };
};

export type Supermarket = {
    supermarketId: string;
    name: string;
    street: string;
    lat: number;
    long: number;
    city: string;
    working_hours: string;
    pickup_available: boolean;
    zip_code: string;
    products: Product[];
};
