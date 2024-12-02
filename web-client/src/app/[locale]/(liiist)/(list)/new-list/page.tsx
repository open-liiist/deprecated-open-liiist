"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input2, Input } from "@/components/ui/input";
import { ActionButton2 } from "@/components/ui/ActionButton";
import { TagInput } from "@/components/ui/tag-input";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { AiOutlinePlus } from "react-icons/ai";
import { FaMagnifyingGlassArrowRight } from "react-icons/fa6";
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
        setProducts([...products, product]);
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
                    userId: "12345",
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save the shopping list");
            }

            router.push("/home");
        } catch (err) {
            setError("Failed to save the shopping list");
        } finally {
            setIsLoading(false);
        }
    };

    
    const handleToggleMode = () => {
        setMode(mode === "convenience" ? "savings" : "convenience");
    };
    
    return (
        <div id="new-list-base" className="max-w-full w-full flex justify-center p-5 text-liiist_black">
            <div id="new-list-card" className="max-w-2xl w-full mt-5 bg-slate-50 rounded-xl shadow-md">
                <div id="new-list-form"  className="w-full  flex-col">
                    <div id="title input" className="flex bg-liiist_pink h-16 mb-4 rounded-t-xl items-center">
                        <Input2
                            id="listTitle"
                            placeholder="Enter list title"
                            value={listTitle}
                            onChange={(e) => setListTitle(e.target.value)}
                            className="w-full border-transparentc font-bold"
                        />
                        <ActionButton2
                            onClick={handleSaveList}
                            disabled={isLoading || products.length === 0 || listTitle.trim() === ""}
                            className="mr-4 border-2 rounded-lg hover:scale-105 h-min"
                        >
                            <AiOutlinePlus className="text-3xl"/>
                        </ActionButton2>
                    </div>
                    <div className="mb-5 px-2 min-h-[30vh]">
                        <TagInput
                            placeholder="Add product"
                            onAdd={handleProductAdd}
                            onRemove={handleProductRemove}
                            onIncreaseQuantity={handleIncreaseQuantity}
                            onDecreaseQuantity={handleDecreaseQuantity}
                            tags={products}
                            />
                    </div>
                </div>
                <div id="bottom_area" className="w-full flex justify-between pb-3 px-3">
                    <ToggleSwitch
                        checked={mode === "savings"}
                        onChange={handleToggleMode}
                        labels={["Convenience", "Savings"]}
                    />
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
                        <GoArrowDownRight className="text-3xl"/>
                    </ActionButton2>
                </div>
                {error && (
                    <div className="text-red-500 mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewListPage;