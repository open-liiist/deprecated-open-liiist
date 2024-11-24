"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input2, Input } from "@/components/ui/input";
import { ActionButton } from "@/components/ui/ActionButton";
import { TagInput } from "@/components/ui/tag-input";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

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

    const handleCalculate = async () => {
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

            const data = await response.json();

            const route =
                mode === "savings" ? "/savings-mode" : "/convenience-mode";
            router.push(
                `${route}?id=${data.id}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
                    products,
                )}`,
            );
        } catch (err) {
            setError("Failed to save and calculate the shopping list");
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
                            <div id="title input" className="mb-4 rounded-tl-lg  bg-liiist_pink h-16">
                                <Input2
                                    id="listTitle"
                                    placeholder="Enter list title"
                                    value={listTitle}
                                    onChange={(e) => setListTitle(e.target.value)}
                                    className="w-full border-transparent"
                                />
                            </div>
                            <div className="mb-5 flex ps-2 items-center">
                                <span className=" pl-2 py-2 text-sm font-medium text-liiist_black">
                                    Budget€
                                </span>
                                <Input
                                    id="budget"
                                    type="number"
                                    placeholder="Enter budget"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className="border-transparent shadow-none font-medium"
                                    />
                            </div>
                            <div className="mb-5 pl-2">
                                <TagInput
                                    placeholder="Add product"border-t-2 border-dashed border-gray-500
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
                <div id="all-button" className="w-1/6 border-l-2 border-dashed border-gray-500">
                    <ActionButton
                        onClick={handleSaveList}
                        disabled={isLoading || products.length === 0 || listTitle.trim() === ""}
                        className="bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isLoading ? "Saving..." : "Save List"}
                    </ActionButton>
                    <ActionButton
                        onClick={handleCalculate}
                        disabled={isLoading || products.length === 0 || budget === ""}
                        className="bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                        {isLoading ? "Calculating..." : "Calculate"}
                    </ActionButton>
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


// "use client";

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { ActionButton } from "@/components/ui/ActionButton";
// import { TagInput } from "@/components/ui/tag-input";
// import { ToggleSwitch } from "@/components/ui/ToggleSwitch";
// import newListStyles from "./styles/NewList.module.css";

// const NewListPage = () => {
//     const router = useRouter();
//     const [listTitle, setListTitle] = useState("");
//     const [products, setProducts] = useState<
//         { name: string; quantity: number }[]
//     >([]);
//     const [budget, setBudget] = useState("");
//     const [mode, setMode] = useState("convenience");
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);

//     const handleProductAdd = (product: { name: string; quantity: number }) => {
//         setProducts([...products, product]);
//     };

//     const handleProductRemove = (index: number) => {
//         const updatedProducts = [...products];
//         updatedProducts.splice(index, 1);
//         setProducts(updatedProducts);
//     };

//     const handleIncreaseQuantity = (index: number) => {
//         const updatedProducts = [...products];
//         updatedProducts[index].quantity += 1;
//         setProducts(updatedProducts);
//     };

//     const handleDecreaseQuantity = (index: number) => {
//         const updatedProducts = [...products];
//         if (updatedProducts[index].quantity > 1) {
//             updatedProducts[index].quantity -= 1;
//             setProducts(updatedProducts);
//         }
//     };

//     const handleSaveList = async () => {
//         if (listTitle.trim() === "" || products.length === 0) {
//             setError("Please enter a list title and add at least one product.");
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch("/api/shopping-lists", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     name: listTitle,
//                     products,
//                     budget,
//                     mode,
//                     userId: "12345",
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to save the shopping list");
//             }

//             router.push("/home");
//         } catch (err) {
//             setError("Failed to save the shopping list");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleCalculate = async () => {
//         if (listTitle.trim() === "" || products.length === 0) {
//             setError("Please enter a list title and add at least one product.");
//             return;
//         }

//         setIsLoading(true);
//         setError(null);

//         try {
//             const response = await fetch("/api/shopping-lists", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     name: listTitle,
//                     products,
//                     budget,
//                     mode,
//                     userId: "12345",
//                 }),
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to save the shopping list");
//             }

//             const data = await response.json();

//             const route =
//                 mode === "savings" ? "/savings-mode" : "/convenience-mode";
//             router.push(
//                 `${route}?id=${data.id}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
//                     products,
//                 )}`,
//             );
//         } catch (err) {
//             setError("Failed to save and calculate the shopping list");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleToggleMode = () => {
//         setMode(mode === "convenience" ? "savings" : "convenience");
//     };

//     return (
//         <div className={newListStyles.container}>
//             <Card className={newListStyles.card}>
//                 <CardHeader>
//                     <CardTitle>Create New Shopping List</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                     <div className={newListStyles.listTitle}>
//                         <label
//                             htmlFor="listTitle"
//                             className={newListStyles.label}
//                         >
//                             List Title
//                         </label>
//                         <Input
//                             id="listTitle"
//                             placeholder="Enter list title"
//                             value={listTitle}
//                             onChange={(e) => setListTitle(e.target.value)}
//                         />
//                     </div>
//                     <div className={newListStyles.productInput}>
//                         <TagInput
//                             placeholder="Add product"
//                             onAdd={handleProductAdd}
//                             onRemove={handleProductRemove}
//                             onIncreaseQuantity={handleIncreaseQuantity}
//                             onDecreaseQuantity={handleDecreaseQuantity}
//                             tags={products}
//                         />
//                     </div>
//                     <div className={newListStyles.budget}>
//                         <label htmlFor="budget" className={newListStyles.label}>
//                             Budget (€)
//                         </label>
//                         <Input
//                             id="budget"
//                             type="number"
//                             placeholder="Enter budget"
//                             value={budget}
//                             onChange={(e) => setBudget(e.target.value)}
//                             suffix="€"
//                         />
//                     </div>
//                     <div className={newListStyles.modeToggle}>
//                         <ToggleSwitch
//                             checked={mode === "savings"}
//                             onChange={handleToggleMode}
//                             labels={["Convenience", "Savings"]}
//                         />
//                     </div>
//                     <div className={newListStyles.actions}>
//                         <ActionButton
//                             className={newListStyles.actionButton}
//                             onClick={handleSaveList}
//                             disabled={
//                                 isLoading ||
//                                 products.length === 0 ||
//                                 listTitle.trim() === ""
//                             }
//                         >
//                             {isLoading ? "Saving..." : "Save List"}
//                         </ActionButton>
//                         <ActionButton
//                             className={newListStyles.actionButton}
//                             onClick={handleCalculate}
//                             disabled={
//                                 isLoading ||
//                                 products.length === 0 ||
//                                 budget === ""
//                             }
//                         >
//                             {isLoading ? "Calculating..." : "Calculate"}
//                         </ActionButton>
//                     </div>
//                     {error && (
//                         <div className={newListStyles.error}>{error}</div>
//                     )}
//                 </CardContent>
//             </Card>
//         </div>
//     );
// };

// export default NewListPage;


