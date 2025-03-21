"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTrashAlt } from "react-icons/fa";

const ShoppingListPage: React.FC = () => {
    const router = useRouter();
    const params = useParams(); // Get the route parameters
    const listId = params.id; // Get the list ID from the dynamic route

    const [listTitle, setListTitle] = useState<string>("");
    const [products, setProducts] = useState<string[]>([]);
    const [budget, setBudget] = useState<string>("");
    const [mode, setMode] = useState<string>("convenience");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (listId) {
            // Make API call to fetch the specific shopping list
            fetch(`/api/shopping-lists/${listId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("List not found");
                    }
                    return response.json();
                })
                .then((data) => {
                    setListTitle(data.name);
                    setProducts(data.products || []);
                    setBudget(data.budget);
                    setMode(data.mode);
                    setIsLoading(false);
                })
                .catch((err) => {
                    console.error("API error while fetching shopping list:", err);
                    setError("Failed to fetch shopping list");
                    setIsLoading(false);
                });
        }
    }, [listId]);

    // Navigate to the edit list page
    const handleEditList = () => {
        router.push(`/edit-list?id=${listId}`);
    };

    // Navigate to savings mode passing necessary parameters
    const handleNavigateToSavingsMode = () => {
        router.push(
            `/savings-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
                products
            )}`
        );
    };

    // Navigate to convenience mode passing necessary parameters
    const handleNavigateToConvenienceMode = () => {
        router.push(
            `/convenience-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
                products
            )}`
        );
    };

    // Delete the shopping list via API call
    const handleDeleteList = async () => {
        if (confirm("Do you want to permanently delete this list?")) {
            try {
                const response = await fetch(`/api/shopping-lists/${listId}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    router.push("/user");
                } else {
                    console.error("Error while deleting the list");
                }
            } catch (err) {
                console.error("Error in API call:", err);
            }
        }
    };

    return (
        <div className="flex justify-center items-center p-5 bg-liiist_white">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <Card className="w-full max-w-2xl bg-white rounded-lg shadow-md p-5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>{listTitle}</CardTitle>
                            <FaTrashAlt
                                className="text-red-500 cursor-pointer transition-transform duration-200 ml-2 hover:scale-125"
                                onClick={handleDeleteList}
                                role="button"
                                tabIndex={0}
                                // Handle key press for accessibility (Enter or Space to trigger deletion)
                                onKeyPress={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        handleDeleteList();
                                    }
                                }}
                                aria-label={`Delete shopping list ${listTitle}`}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="text-red-500 font-bold mt-4">
                                {error}
                            </div>
                        )}
                        <div className="mb-5 leading-relaxed">
                            <p>Budget: €{budget}</p>
                            <p>Products: {products.join(", ")}</p>
                            <p>Current Mode: {mode}</p>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <Button
                                onClick={handleEditList}
                                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Edit List
                            </Button>
                            <Button
                                onClick={handleNavigateToSavingsMode}
                                className="bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                                Switch to Savings Mode
                            </Button>
                            <Button
                                onClick={handleNavigateToConvenienceMode}
                                className="bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                            >
                                Switch to Convenience Mode
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ShoppingListPage;