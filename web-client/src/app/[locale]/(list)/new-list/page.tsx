"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Usa 'next/navigation' invece di 'next/router'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ActionButton } from "@/components/ui/ActionButton"; // Usa ActionButton al posto di Button per evitare conflitti
import { TagInput } from "@/components/ui/tag-input";
import { ProductList } from "@/components/ui/ProductList"; // Import del componente appena creato
import { ToggleSwitch } from "@/components/ui/ToggleSwitch"; // Import del ToggleSwitch
import newListStyles from "./styles/NewList.module.css"; // Import del file CSS creato

const NewListPage = () => {
    const router = useRouter();
    const [listTitle, setListTitle] = useState("");
    const [products, setProducts] = useState([]);
    const [budget, setBudget] = useState("");
    const [mode, setMode] = useState("convenience");
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleProductAdd = (product) => {
        setProducts([...products, product]);
    };

    const handleProductRemove = (index) => {
        const updatedProducts = [...products];
        updatedProducts.splice(index, 1);
        setProducts(updatedProducts);
    };

    const handleCalculate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/calculate-list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ products, budget, mode }),
            });
            if (!response.ok) {
                throw new Error("Failed to calculate the list");
            }
            const data = await response.json();

            // Verifica se il budget è sufficiente e gestisci la risposta di conseguenza
            if (data.withinBudget) {
                setRecommendedProducts(data.recommendedProducts);
            } else {
                setError(data.message); // Mostra l'errore se il budget non è sufficiente
                setRecommendedProducts(data.recommendedProducts);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMode = () => {
        setMode(mode === "convenience" ? "savings" : "convenience");
    };
    const handleCreateList = async () => {
        if (listTitle.trim() === "" || products.length === 0) {
            setError("Please enter a list title and add at least one product.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            console.log("Attempting to create list...");

            // Chiamata API per creare la nuova lista
            const response = await fetch("/api/shopping-lists", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: listTitle,
                    products,
                    budget,
                    mode,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to create the shopping list");
            }

            const data = await response.json();

            // Reindirizza alla homepage dell'utente per vedere la lista appena creata
            console.log("List created successfully, redirecting...");
            router.push("/home");
        } catch (err) {
            console.error("Error during list creation:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className={newListStyles.container}>
            <Card className={newListStyles.card}>
                <CardHeader>
                    <CardTitle>Create New Shopping List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className={newListStyles.listTitle}>
                        <Input
                            placeholder="List Title"
                            value={listTitle}
                            onChange={(e) => setListTitle(e.target.value)}
                        />
                    </div>
                    <div className={newListStyles.productInput}>
                        <TagInput
                            placeholder="Add product"
                            onAdd={handleProductAdd}
                            onRemove={handleProductRemove}
                            tags={products}
                        />
                    </div>
                    <div className={newListStyles.budget}>
                        <Input
                            type="number"
                            placeholder="Budget"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            suffix="€"
                        />
                    </div>
                    <div className={newListStyles.modeToggle}>
                        <ToggleSwitch
                            checked={mode === "savings"}
                            onChange={handleToggleMode}
                            labels={["Convenience", "Savings"]}
                        />
                    </div>
                    <div className={newListStyles.actions}>
                        <ActionButton
                            onClick={handleCalculate}
                            disabled={
                                isLoading ||
                                products.length === 0 ||
                                budget === ""
                            }
                        >
                            {isLoading ? "Calculating..." : "Calculate"}
                        </ActionButton>
                        <ActionButton
                            onClick={handleCreateList} // Usa la funzione handleCreateList
                            disabled={
                                isLoading ||
                                products.length === 0 ||
                                listTitle.trim() === ""
                            }
                        >
                            Create List
                        </ActionButton>
                    </div>
                    {recommendedProducts.length > 0 && (
                        <div className={newListStyles.recommendedProducts}>
                            <h3>Recommended Products</h3>
                            <ProductList products={recommendedProducts} />
                        </div>
                    )}
                    {error && (
                        <div className={newListStyles.error}>{error}</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NewListPage;
