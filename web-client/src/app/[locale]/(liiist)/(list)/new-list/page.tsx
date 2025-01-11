"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input2, Input } from "@/components/ui/input";
import { ActionButton2 } from "@/components/ui/ActionButton";
import { TagInput } from "@/components/ui/tag-input";
import { AiOutlinePlus } from "react-icons/ai";
import { handleCalculate } from "@/services/shoppingListService";
import { GoArrowDownRight } from "react-icons/go";

const NewListPage = () => {
    const router = useRouter();
    const [listTitle, setListTitle] = useState("");
    const [products, setProducts] = useState<
        { name: string; quantity: number }[]
    >([]);
    const [budget, setBudget] = useState("0");
    const [mode, setMode] = useState("convenience");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleProductAdd = (product: { name: string; quantity: number }) => {
        setProducts([product, ...products]);
    };

    const handleProductRemove = (index: number) => {
        const updatedProducts = [...products];
        updatedProducts.splice(index, 1);
        setProducts(updatedProducts);
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

    const handleSaveList = async () => {
        if (listTitle.trim() === "" || products.length === 0) {
            setError("Please enter a list title and add at least one product.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/postShoppingList", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: listTitle,
                    products,
                    budget,
                    mode
                }),
                credentials: 'include', 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.error || "Failed to save the shopping list");
            }

            const result = await response.json();
            console.log("Lista creata con successo:", result);
            router.push("/home");
        } catch (err) {
            setError(err.message || "Failed to save the shopping list");
            console.error("Errore durante il salvataggio della lista:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleModeChange = (selectedMode: string) => {
        setMode(selectedMode);
    };

    return (
        <div id="new-list-base" className=" flex p-5 absolute max-w-full w-full justify-center text-liiist_black">
            <div id="new-list-card" className="max-w-2xl w-full">
                <div id="new-list-form"  className="w-full flex-col">
                    <div id="title input" className="flex mb-10 items-center">
                        <Input2
                        autoComplete="off"
                            id="listTitle"
                            placeholder="Enter list title"
                            value={listTitle}
                            onChange={(e) => setListTitle(e.target.value)}
                            className="w-full border-transparent text-5xl"
                        />
                        <ActionButton2
                            onClick={handleSaveList}
                            disabled={isLoading || products.length === 0 || listTitle.trim() === ""}
                            className="border-2 rounded-lg hover:scale-105 h-min"
                        >
                            <AiOutlinePlus className="text-3xl"/>
                        </ActionButton2>
                    </div>
                    <div className="border-transparent min-h-[30vh]">
                        <TagInput
                            placeholder="Add a product"
                            onAdd={handleProductAdd}
                            onRemove={handleProductRemove}
                            onIncreaseQuantity={handleIncreaseQuantity}
                            onDecreaseQuantity={handleDecreaseQuantity}
                            tags={products}
                            />
                    </div>
                </div>
                <div id="bottom_area" className="w-full flex flex-row justify-between">
                    <div className="flex flex-col items-start">
                        {mode === "convenience" ? (
                            <>
                                <div 
                                    className="font-bold cursor-pointer"
                                    onClick={() => handleModeChange("convenience")}
                                >
                                    Comodità
                                </div>
                                <div 
                                    className="cursor-pointer"
                                    onClick={() => handleModeChange("savings")}
                                >
                                    Risparmio
                                </div>
                            </>
                        ) : (
                            <>
                                <div 
                                    className="font-bold cursor-pointer"
                                    onClick={() => handleModeChange("savings")}
                                >
                                    Risparmio
                                </div>
                                <div 
                                    className="cursor-pointer"
                                    onClick={() => handleModeChange("convenience")}
                                >
                                    Comodità
                                </div>
                            </>
                        )}
                    </div>
                    <ActionButton2
                        onClick={() =>
                            handleCalculate(
                                listTitle,
                                products,
                                budget,
                                mode,
                                "12345",
                                router,
                                setIsLoading,
                                setError
                            )
                        }
                        disabled={isLoading || products.length === 0 || budget === ""}
                        className="border-2 rounded-lg hover:scale-105 h-min"
                        >
                        <GoArrowDownRight className="text-5xl"/>
                    </ActionButton2>
                </div>
                {error && (
                    <div className="text-red-500 w-full flex justify-between">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewListPage;
