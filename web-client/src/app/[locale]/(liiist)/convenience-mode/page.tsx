"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import convenienceStyles from "./styles/ConvenienceMode.module.css";

type Supermarket = {
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

type Product = {
    full_name: string;
    img_url: string;
    description: string;
    quantity: number;
    price: number;
    price_for_kg?: number;
    discounted_price?: number;
    localization: {
        grocery: string;
        lat: number;
        long: number;
    };
};

const ConvenienceModePage: React.FC = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [listTitle, setListTitle] = useState<string>("");
    const [budget, setBudget] = useState<string>("");
    const [products, setProducts] = useState<string[]>([]);
    const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        // Estrazione dei parametri dalla query string
        const listId = searchParams.get("id");
        const title = searchParams.get("listTitle") || "Shopping List";
        const budgetParam = searchParams.get("budget") || "0";

        setListTitle(title);
        setBudget(budgetParam);

        if (listId) {
            // Recupera i dati della lista tramite API
            const fetchList = async () => {
                try {
                    const response = await fetch(
                        `/api/shopping-lists/${listId}`,
                    );
                    if (!response.ok) {
                        throw new Error("Failed to fetch shopping list");
                    }
                    const listData = await response.json();

                    // Popola i dati della lista
                    setListTitle(listData.name);
                    setBudget(listData.budget);
                    setProducts(listData.products);

                    // Simula una chiamata API per ottenere i supermercati
                    const responseSupermarkets = await fetch(
                        `/api/list-result?userId=${listData.userId}`,
                    );
                    if (!responseSupermarkets.ok) {
                        throw new Error("Failed to fetch supermarkets");
                    }
                    const supermarketData = await responseSupermarkets.json();
                    if (
                        supermarketData.supermarkets &&
                        supermarketData.supermarkets.length > 0
                    ) {
                        setSupermarket(supermarketData.supermarkets[0]); // Seleziona il primo supermercato per comodità
                    } else {
                        throw new Error(
                            "No supermarkets found for convenience mode",
                        );
                    }
                } catch (err) {
                    setError((err as Error).message);
                } finally {
                    setIsLoading(false);
                }
            };

            fetchList();
        } else {
            setError("Missing list ID");
            setIsLoading(false);
        }
    }, [searchParams]);

    const handleEditList = () => {
        const listId = searchParams.get("id");
        if (listId) {
            router.push(`/edit-list?id=${listId}`);
        } else {
            setError("No list ID found to edit");
        }
    };

    if (isLoading) {
        return <div className={convenienceStyles.loading}>Loading...</div>;
    }

    if (error) {
        return <div className={convenienceStyles.error}>{error}</div>;
    }

    return (
        <div className={convenienceStyles.container}>
            <Card className={convenienceStyles.card}>
                <CardHeader>
                    <CardTitle>Modalità Comodità - {listTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <p>Budget: €{budget}</p>
                        <p>Prodotti: {products.join(", ")}</p>
                    </div>
                    <button
                        onClick={handleEditList}
                        className={convenienceStyles.editButton}
                    >
                        Modifica Lista
                    </button>
                    {supermarket ? (
                        <div className={convenienceStyles.supermarketSection}>
                            <h3>{supermarket.name}</h3>
                            <p>
                                {supermarket.street}, {supermarket.city} -{" "}
                                {supermarket.zip_code}
                            </p>
                            <p>
                                Orari di apertura: {supermarket.working_hours}
                            </p>
                            <ul className={convenienceStyles.productList}>
                                {supermarket.products.map((product, index) => (
                                    <li
                                        key={index}
                                        className={
                                            convenienceStyles.productItem
                                        }
                                    >
                                        <img
                                            src={product.img_url}
                                            alt={product.full_name}
                                            className={
                                                convenienceStyles.productImage
                                            }
                                        />
                                        <div>
                                            {product.full_name} - €
                                            {product.price.toFixed(2)} -{" "}
                                            {product.description}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div>No supermarket data available</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ConvenienceModePage;
