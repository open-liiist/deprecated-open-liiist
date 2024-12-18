"use client";

// app/edit-list/page.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input, Input2 } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { ActionButton2 } from "@/components/ui/ActionButton";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { handleCalculate2 } from "@/services/shoppingListService";
import { GoArrowDownRight } from "react-icons/go";

const EditListPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const listId = searchParams.get("id");
    const colors = ["#FFABAD", "#FFC576", "#B4B1B1" , "#7D5C65", "#6EEB83"];
    const [listTitle, setListTitle] = useState<string>("");
    const [products, setProducts] = useState([]);
    const [budget, setBudget] = useState<string>("");
    const [mode, setMode] = useState<string>("convenience");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff")
    

    useEffect(() => {
        // Recuperare la lista da modificare usando l'ID della lista
        if (listId) {
            fetch(`/api/getAList?listId=${listId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
            })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to fetch list data");
                }
                return response.json();
            })
            .then((data) => {
                if (!data.data) {
                    throw new Error("List data not found");
                }
                const listData = data.data.data;
                setListTitle(listData.name || "");
                setProducts(Array.isArray(listData.products) 
                    ? listData.products.map(product => ({
                        name: product.name,
                        quantity: Number(product.quantity)
                        })) 
                    : []
                );
                setBudget(listData.budget || "");
                setMode(listData.mode || "convenience");
                setIsLoading(false);
    
                const createdDate = new Date(listData.createdAt);
                const minute = createdDate.getMinutes();
                let lastDigit = minute % 10;
    
                if(lastDigit > 5){
                    lastDigit = lastDigit - 5;
                }
    
                const chooseColor = colors[lastDigit % colors.length];
                setBackgroundColor(chooseColor);
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
            const response = await fetch(`/api/uploadShoppingList?listId=${listId}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    name: listTitle,
                    products,
                    budget,
                    mode,
                }),
                credentials: 'include', 
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

    const handleIncreaseQuantity = (index: number) => {
        const updatedProducts = [...products];
        updatedProducts[index].quantity += 1;
        setProducts(updatedProducts);
    };

    const handleDecreaseQuantity = (index: number) => {
        const updatedProducts = [...products];
        if (updatedProducts[index].quantity > 1) {
            updatedProducts[index].quantity -= 1;
            setProducts(updatedProducts);
        }
    };

    const handleToggleMode = () => {
        setMode(mode === "convenience" ? "savings" : "convenience");
    };

    return (
        <div className="max-w-full w-full flex justify-center p-5 text-liiist_black">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div id="edit-list-card" className="max-w-2xl w-full mt-5 flex bg-slate-50 rounded-xl shadow-md">
                    <div className="w-full flex-col flex">
                        <div className="rounded-t-lg h-16 flex items-center mb-4" style={{backgroundColor}}>
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
                        <div className="mb-5 px-2 min-h-[30vh]">
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
                                onIncreaseQuantity={handleIncreaseQuantity}
                                onDecreaseQuantity={handleDecreaseQuantity}
                                tags={products || []}
                            />
                        </div>
                        <div className="w-full flex justify-between pb-3 px-3">
                            <ToggleSwitch
                                checked={mode === "savings"}
                                onChange={handleToggleMode}
                                labels={["Convenience", "Savings"]}
                                />
                            <ActionButton2
                                onClick={() =>
                                    handleCalculate2(
                                        listId,
                                        listTitle,
                                        products,
                                        budget,
                                        mode,
                                        "12345",
                                        router
                                    )
                                }
                                disabled={isLoading || products.length === 0 || budget === ""}
                                className="border-2 rounded-lg hover:scale-105 h-min"
                                >
                                <GoArrowDownRight className="text-3xl"/>
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