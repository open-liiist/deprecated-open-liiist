// SavingsModePage.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import savingsStyles from "./styles/SavingsMode.module.css";

type Supermarket = {
    name: string;
    street: string;
    city: string;
    working_hours: string;
    pickup_available: boolean;
    products: Product[];
};

type Product = {
    full_name: string;
    img_url: string;
    description: string;
    quantity: number;
    price: number;
    discounted_price?: number;
};

const SavingsModePage: React.FC = () => {
    const searchParams = useSearchParams();
    const [listTitle, setListTitle] = useState<string>("");
    const [budget, setBudget] = useState<string>("");
    const [products, setProducts] = useState<string[]>([]);
    const [supermarkets, setSupermarkets] = useState<Supermarket[]>([]);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Recuperare l'ID della lista dalla query string
        const listId = searchParams.get("id");

        if (listId) {
            // Recupera la lista specifica dal backend
            fetch(`/api/shopping-lists/${listId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch list data");
                    }
                    return response.json();
                })
                .then((data) => {
                    setListTitle(data.name || "Shopping List");
                    setBudget(data.budget || "0");
                    setProducts(data.products || []);
                })
                .catch((err) => {
                    setError(err.message);
                });

            // Simulare una chiamata API per recuperare supermercati e prodotti correlati
            fetch("/api/list-result?userId=12345")
                .then((response) => response.json())
                .then((data) => {
                    if (data.supermarkets && data.supermarkets.length > 0) {
                        setSupermarkets(data.supermarkets);
                    } else {
                        throw new Error(
                            "No supermarkets found for savings mode",
                        );
                    }
                })
                .catch((err) => {
                    setError(err.message);
                });
        }
    }, [searchParams]);

    const handleEditList = () => {
        // Reindirizzare l'utente alla pagina di modifica con l'ID della lista
        const listId = searchParams.get("id");
        if (listId) {
            router.push(`/edit-list?id=${listId}`);
        }
    };

    return (
        <div className={savingsStyles.container}>
            <Card className={savingsStyles.card}>
                <CardHeader>
                    <CardTitle>Modalità Risparmio - {listTitle}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div>
                        <p>Budget: €{budget}</p>
                        <p>Prodotti: {products.join(", ")}</p>
                    </div>
                    <button
                        onClick={handleEditList}
                        className={savingsStyles.editButton}
                    >
                        Modifica Lista
                    </button>
                    {error && (
                        <div className={savingsStyles.error}>{error}</div>
                    )}
                    {supermarkets.length > 0 ? (
                        supermarkets.map((supermarket, index) => (
                            <div
                                key={index}
                                className={savingsStyles.supermarketSection}
                            >
                                <h3>{supermarket.name}</h3>
                                <p>
                                    {supermarket.street}, {supermarket.city}
                                </p>
                                <p>
                                    Orari di apertura:{" "}
                                    {supermarket.working_hours}
                                </p>
                                <p>
                                    Ritiro in negozio:{" "}
                                    {supermarket.pickup_available
                                        ? "Disponibile"
                                        : "Non disponibile"}
                                </p>
                                <ul className={savingsStyles.productList}>
                                    {supermarket.products.map(
                                        (product, pIndex) => (
                                            <li
                                                key={pIndex}
                                                className={
                                                    savingsStyles.productItem
                                                }
                                            >
                                                <img
                                                    src={product.img_url}
                                                    alt={product.full_name}
                                                    className={
                                                        savingsStyles.productImage
                                                    }
                                                />
                                                <div>
                                                    <p>{product.full_name}</p>
                                                    <p>{product.description}</p>
                                                    <p>
                                                        Prezzo: €{product.price}
                                                    </p>
                                                    {product.discounted_price && (
                                                        <p>
                                                            Prezzo scontato: €
                                                            {
                                                                product.discounted_price
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ),
                                    )}
                                </ul>
                            </div>
                        ))
                    ) : (
                        <p>Caricamento prodotti...</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default SavingsModePage;
