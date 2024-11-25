"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input2, Input } from "@/components/ui/input";
import { ActionButton2 } from "@/components/ui/ActionButton";
import { TagInput } from "@/components/ui/tag-input";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
import { AiOutlinePlus } from "react-icons/ai";
import { FaMagnifyingGlassArrowRight } from "react-icons/fa6";
import { handleCalculate } from "@/services/shoppingListService";

const NewListPage = () => {
    const router = useRouter();
    const [listTitle, setListTitle] = useState("");
    const [products, setProducts] = useState<
        { name: string; quantity: number }[]
    >([]);
    const [budget, setBudget] = useState("");
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
            <div id="new-list-card" className="max-w-4xl w-full mt-5 flex bg-slate-50 rounded-xl">
                <div id="new-list-form"  className="w-full  flex-col">
                            <div id="title input" className=" rounded-tl-lg  bg-liiist_pink h-16 ">
                                <Input2
                                    id="listTitle"
                                    placeholder="Enter list title"
                                    value={listTitle}
                                    onChange={(e) => setListTitle(e.target.value)}
                                    className="w-full border-transparentc"
                                    />
                            </div>
                            <div className="mb-5 pt-4 gap-2 flex px-2 items-center border-t-2 border-dashed border-gray-500">
                                <span className="py-2  text-liiist_black">
                                    Budget€
                                </span>
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder="insert here"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="border-transparent shadow-none font-medium w-1/6"
                                    />
                            </div>
                            <div className="mb-5 px-2">
                                <TagInput
                                    placeholder="Add product"
                                    onAdd={handleProductAdd}
                                    onRemove={handleProductRemove}
                                    onIncreaseQuantity={handleIncreaseQuantity}
                                    onDecreaseQuantity={handleDecreaseQuantity}
                                    tags={products}
                                    />
                            </div>
                            <div className="mb-5 pl-2">
                                <ToggleSwitch
                                    checked={mode === "savings"}
                                    onChange={handleToggleMode}
                                    labels={["Convenience", "Savings"]}
                                    />
                            </div>
                </div>
                <div id="all-button" className="w-1/6 h-full border-l-2 border-dashed border-gray-500 flex flex-col justify-between">
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
                        className=" rounded-full flex justify-center"
                        >
                        <FaMagnifyingGlassArrowRight className="text-3xl hover:scale-125"/>
                    </ActionButton2>
                    <ActionButton2
                        onClick={handleSaveList}
                        disabled={isLoading || products.length === 0 || listTitle.trim() === ""}
                        className="rounded-full flex justify-center"
                        >
                        <AiOutlinePlus className="text-3xl hover:scale-125"/>
                    </ActionButton2>
                    
                    {error && (
                        <div className="text-red-500 mt-4">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewListPage;



// const handleCalculate = async () => {
//     if (listTitle.trim() === "" || products.length === 0) {
//         setError("Please enter a list title and add at least one product.");
//         return;
//     }

//     setIsLoading(true);
//     setError(null);

//     try {
//         const response = await fetch("/api/shopping-lists", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//                 name: listTitle,
//                 products,
//                 budget,
//                 mode,
//                 userId: "12345",
//             }),
//         });

//         if (!response.ok) {
//             throw new Error("Failed to save the shopping list");
//         }

//         const data = await response.json();

//         const route =
//             mode === "savings" ? "/savings-mode" : "/convenience-mode";
//         router.push(
//             `${route}?id=${data.id}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
//                 products,
//             )}`,
//         );
//     } catch (err) {
//         setError("Failed to save and calculate the shopping list");
//     } finally {
//         setIsLoading(false);
//     }
// };