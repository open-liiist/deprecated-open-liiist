"use client";

// app/edit-list/page.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input2 } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { ActionButton2 } from "@/components/ui/ActionButton";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { handleCalculate2 } from "@/services/shoppingListService";
import { GoArrowDownRight } from "react-icons/go";

const EditListPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const listId = searchParams.get("id");
    const colors = ["#FFABAD", "#FFC576", "#B4B1B1", "#7D5C65", "#6EEB83"];
    const [listTitle, setListTitle] = useState<string>("");
    const [products, setProducts] = useState([]);
    const [budget, setBudget] = useState<string>("");
    const [mode, setMode] = useState<string>("convenience");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff");

    // Fetch the shopping list using the list id from the search params
    useEffect(() => {
        if (listId) {
            fetch(`/api/getAList?listId=${listId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
            })
            .then((response) => {
                if (!response.ok) {
                    // Log fetch error message
                    console.error("Error: Failed to retrieve the list data");
                    throw new Error("Failed to fetch list data");
                }
                return response.json();
            })
            .then((data) => {
                if (!data.data) {
                    console.error("Error: List data not available");
                    throw new Error("List data not found");
                }
                const listData = data.data.data;
                setListTitle(listData.name || "");
                setProducts(
                    Array.isArray(listData.products)
                        ? listData.products.map(product => ({
                              name: product.name,
                              quantity: Number(product.quantity)
                          }))
                        : []
                );
                setBudget(listData.budget || "");
                setMode(listData.mode || "convenience");
                setIsLoading(false);

                // Determine background color based on list creation time
                const createdDate = new Date(listData.createdAt);
                const minute = createdDate.getMinutes();
                let lastDigit = minute % 10;

                if (lastDigit > 5) {
                    lastDigit = lastDigit - 5;
                }

                const chosenColor = colors[lastDigit % colors.length];
                setBackgroundColor(chosenColor);

                // Log successful fetch
                console.log("List data retrieved successfully");
            })
            .catch((err) => {
                console.error("Fetch error: ", err);
                setError(err.message);
                setIsLoading(false);
            });
        }
    }, [listId]);

    // Save changes to the shopping list
    const handleSaveChanges = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`/api/uploadShoppingList?listId=${listId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({
                    name: listTitle,
                    products,
                    budget,
                    mode,
                }),
                credentials: "include"
            });
            if (!response.ok) {
                console.error("Error: Failed to update the shopping list");
                throw new Error("Failed to update the shopping list");
            }
            console.log("Shopping list updated successfully");
            router.push("/home");
        } catch (err) {
            console.error("Update error: ", err);
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // Increase the quantity of a product at the given index
    const handleIncreaseQuantity = (index: number) => {
        const updatedProducts = [...products];
        updatedProducts[index].quantity += 1;
        setProducts(updatedProducts);
        console.log(`Increased quantity for product at index ${index}`);
    };

    // Decrease the quantity of a product at the given index (minimum quantity is 1)
    const handleDecreaseQuantity = (index: number) => {
        const updatedProducts = [...products];
        if (updatedProducts[index].quantity > 1) {
            updatedProducts[index].quantity -= 1;
            setProducts(updatedProducts);
            console.log(`Decreased quantity for product at index ${index}`);
        }
    };

    // Toggle between convenience and savings mode
    const handleToggleMode = () => {
        const newMode = mode === "convenience" ? "savings" : "convenience";
        setMode(newMode);
        console.log(`Mode toggled to ${newMode}`);
    };

    return (
        <div className="mt-navbar max-w-full w-full flex justify-center p-5 text-liiist_black">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div id="edit-list-card" className="max-w-2xl w-full mt-5 flex bg-slate-50 rounded-xl shadow-md">
                    <div className="w-full flex-col flex">
                        {/* Top bar with list title input and save button */}
                        <div className="rounded-t-lg h-16 flex items-center mb-4" style={{ backgroundColor }}>
                            <Input2
                                placeholder="List Title"
                                value={listTitle || ""}
                                onChange={(e) => setListTitle(e.target.value)}
                                className="w-full border-transparentc font-bold"
                            />
                            <ActionButton2
                                onClick={handleSaveChanges}
                                disabled={isLoading}
                                className={"text-center hover:scale-105 w-auto mr-4"}
                            >
                                {isLoading ? "Saving..." : "Save"}
                            </ActionButton2>
                        </div>
                        {/* Tag input for products */}
                        <div className="mb-5 px-2 min-h-[30vh]">
                            <TagInput
                                placeholder="Add product"
                                onAdd={(product) => {
                                    console.log("Added product:", product);
                                    setProducts([...products, product]);
                                }}
                                onRemove={(index) => {
                                    const updatedProducts = [...products];
                                    updatedProducts.splice(index, 1);
                                    console.log(`Removed product at index ${index}`);
                                    setProducts(updatedProducts);
                                }}
                                onIncreaseQuantity={handleIncreaseQuantity}
                                onDecreaseQuantity={handleDecreaseQuantity}
                                tags={products || []}
                            />
                        </div>
                        {/* Toggle for mode and calculate button */}
                        <div className="w-full flex justify-between pb-3 px-3">
                            <ToggleSwitch
                                checked={mode === "savings"}
                                onChange={handleToggleMode}
                                labels={["Convenience", "Savings"]}
                            />
                            <ActionButton2
                                onClick={async () => {
                                    setIsLoading(true);
                                    try {
                                        // Update list data before calculation
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
                                            console.error("Error: Failed to save the shopping list prior to calculation");
                                            throw new Error("Failed to save the shopping list");
                                        }

                                        console.log("Shopping list saved successfully before calculation");
                                        // Proceed with calculation after successful save
                                        await handleCalculate2(
                                            listId,
                                            listTitle,
                                            products,
                                            budget,
                                            mode,
                                            "12345", // Replace with a valid user ID if necessary
                                            router
                                        );
                                    } catch (err) {
                                        console.error("Calculation error: ", err);
                                        setError((err as Error).message);
                                    } finally {
                                        setIsLoading(false);
                                    }
                                }}
                                disabled={isLoading || products.length === 0 || budget === ""}
                                className="border-2 rounded-lg hover:scale-105 h-min"
                            >
                                <GoArrowDownRight className="text-3xl" />
                            </ActionButton2>
                        </div>
                    </div>
                    {error && (
                        <div className="text-red-500 mb-4">{error}</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditListPage;