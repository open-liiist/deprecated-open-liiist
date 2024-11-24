"use client";

// app/edit-list/page.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import editListStyles from "./styles/EditList.module.css";

const EditListPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const listId = searchParams.get("id");

    const [listTitle, setListTitle] = useState<string>("");
    const [products, setProducts] = useState<string[]>([]);
    const [budget, setBudget] = useState<string>("");
    const [mode, setMode] = useState<string>("convenience");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Recuperare la lista da modificare usando l'ID della lista
        if (listId) {
            fetch(`/api/shopping-lists/${listId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch list data");
                    }
                    return response.json();
                })
                .then((data) => {
                    setListTitle(data.name || "");
                    setProducts(data.products || []);
                    setBudget(data.budget || "");
                    setMode(data.mode || "convenience");
                    setIsLoading(false);
                })
                .catch((err) => {
                    setError(err.message);
                    setIsLoading(false);
                });
        }
    }, [listId]);

    const handleSaveChanges = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Modificare la lista tramite una richiesta PUT all'endpoint API
            const response = await fetch(`/api/shopping-lists/${listId}`, {
                method: "PUT",
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
                throw new Error("Failed to update the shopping list");
            }
            router.push("/home");
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={editListStyles.container}>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <Card className={editListStyles.card}>
                    <CardHeader>
                        <CardTitle>Edit Shopping List</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className={editListStyles.error}>{error}</div>
                        )}
                        <div className={editListStyles.listTitle}>
                            <Input
                                placeholder="List Title"
                                value={listTitle || ""}
                                onChange={(e) => setListTitle(e.target.value)}
                            />
                        </div>
                        <div className={editListStyles.productInput}>
                            <TagInput
                                placeholder="Add product"
                                onAdd={(product) =>
                                    setProducts([...products, product])
                                }
                                onRemove={(index) => {
                                    const updatedProducts = [...products];
                                    updatedProducts.splice(index, 1);
                                    setProducts(updatedProducts);
                                }}
                                tags={products || []}
                            />
                        </div>
                        <div className={editListStyles.budget}>
                            <Input
                                type="number"
                                placeholder="Budget"
                                value={budget || ""}
                                onChange={(e) => setBudget(e.target.value)}
                                suffix="€"
                            />
                        </div>
                        <div className={editListStyles.actions}>
                            <button
                                onClick={handleSaveChanges}
                                disabled={isLoading}
                            >
                                {isLoading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EditListPage;
