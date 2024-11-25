"use client";

// app/edit-list/page.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input, Input2 } from "@/components/ui/input";
import { TagInput } from "@/components/ui/tag-input";
import { ActionButton2 } from "@/components/ui/ActionButton";

const EditListPage: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const listId = searchParams.get("id");
    const colors = ["#FFABAD", "#FFC576", "#B4B1B1" , "#7D5C65", "#6EEB83"];
    const [listTitle, setListTitle] = useState<string>("");
    const [products, setProducts] = useState<string[]>([]);
    const [budget, setBudget] = useState<string>("");
    const [mode, setMode] = useState<string>("convenience");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [backgroundColor, setBackgroundColor] = useState("#ffffff")
    
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
                const createdDate = new Date(data.createdAt);
                const minute = createdDate.getMinutes();
                var lastDigit = minute % 10;
                if(lastDigit > 5){
                    lastDigit = lastDigit - 5;
                }
                const choosecolor = colors[lastDigit % colors.length];
                setBackgroundColor(choosecolor);
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
        <div className="max-w-full w-full flex justify-center p-5 text-liiist_black">
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <div id="new-list-card" className="max-w-4xl w-full mt-5 flex bg-slate-50 rounded-xl">
                    <div className="w-full flex-col flex">
                        {error && (
                            <div className="text-red-500 mb-4">{error}</div>
                        )}
                        <div className="rounded-tl-lg h-16 " style={{backgroundColor}}>
                            <Input2
                                placeholder="List Title"
                                value={listTitle || ""}
                                onChange={(e) => setListTitle(e.target.value)}
                                className="rounded-tl-lg"
                            />
                        </div>
                        <div className="mb-5 pt-4 gap-2 flex px-2 items-center border-t-2 border-dashed border-gray-500">
                            <span className="py-2 ">
                                Budget€
                            </span>
                            <Input
                                type="number"
                                placeholder="Budget"
                                value={budget || ""}
                                onChange={(e) => setBudget(e.target.value)}
                                className="border-transparent shadow-none font-medium w-1/6"
                            />
                        </div>
                        <div className="mb-5 px-2">
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
                    </div>
                    <div className="w-1/6 h-full border-l-2 border-dashed border-gray-500 flex flex-col justify-end items-center">
                        <ActionButton2
                            onClick={handleSaveChanges}
                            disabled={isLoading}
                            className={"rounded-full text-center hover:scale-125 w-full h-1/6 mb-4"}
                        >
                        {isLoading ? "Saving..." : "Save"}
                        </ActionButton2>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EditListPage;


// "use client";

// // app/edit-list/page.tsx
// import React, { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { TagInput } from "@/components/ui/tag-input";
// import editListStyles from "./styles/EditList.module.css";

// const EditListPage: React.FC = () => {
//     const searchParams = useSearchParams();
//     const router = useRouter();
//     const listId = searchParams.get("id");

//     const [listTitle, setListTitle] = useState<string>("");
//     const [products, setProducts] = useState<string[]>([]);
//     const [budget, setBudget] = useState<string>("");
//     const [mode, setMode] = useState<string>("convenience");
//     const [isLoading, setIsLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         // Recuperare la lista da modificare usando l'ID della lista
//         if (listId) {
//             fetch(`/api/shopping-lists/${listId}`)
//                 .then((response) => {
//                     if (!response.ok) {
//                         throw new Error("Failed to fetch list data");
//                     }
//                     return response.json();
//                 })
//                 .then((data) => {
//                     setListTitle(data.name || "");
//                     setProducts(data.products || []);
//                     setBudget(data.budget || "");
//                     setMode(data.mode || "convenience");
//                     setIsLoading(false);
//                 })
//                 .catch((err) => {
//                     setError(err.message);
//                     setIsLoading(false);
//                 });
//         }
//     }, [listId]);

//     const handleSaveChanges = async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             // Modificare la lista tramite una richiesta PUT all'endpoint API
//             const response = await fetch(`/api/shopping-lists/${listId}`, {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                 },
//                 body: JSON.stringify({
//                     name: listTitle,
//                     products,
//                     budget,
//                     mode,
//                 }),
//             });
//             if (!response.ok) {
//                 throw new Error("Failed to update the shopping list");
//             }
//             router.push("/home");
//         } catch (err) {
//             setError((err as Error).message);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     return (
//         <div className={editListStyles.container}>
//             {isLoading ? (
//                 <p>Loading...</p>
//             ) : (
//                 <Card className={editListStyles.card}>
//                     <CardHeader>
//                         <CardTitle>Edit Shopping List</CardTitle>
//                     </CardHeader>
//                     <CardContent>
//                         {error && (
//                             <div className={editListStyles.error}>{error}</div>
//                         )}
//                         <div className={editListStyles.listTitle}>
//                             <Input
//                                 placeholder="List Title"
//                                 value={listTitle || ""}
//                                 onChange={(e) => setListTitle(e.target.value)}
//                             />
//                         </div>
//                         <div className={editListStyles.productInput}>
//                             <TagInput
//                                 placeholder="Add product"
//                                 onAdd={(product) =>
//                                     setProducts([...products, product])
//                                 }
//                                 onRemove={(index) => {
//                                     const updatedProducts = [...products];
//                                     updatedProducts.splice(index, 1);
//                                     setProducts(updatedProducts);
//                                 }}
//                                 tags={products || []}
//                             />
//                         </div>
//                         <div className={editListStyles.budget}>
//                             <Input
//                                 type="number"
//                                 placeholder="Budget"
//                                 value={budget || ""}
//                                 onChange={(e) => setBudget(e.target.value)}
//                                 suffix="€"
//                             />
//                         </div>
//                         <div className={editListStyles.actions}>
//                             <button
//                                 onClick={handleSaveChanges}
//                                 disabled={isLoading}
//                             >
//                                 {isLoading ? "Saving..." : "Save Changes"}
//                             </button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             )}
//         </div>
//     );
// };

// export default EditListPage;
