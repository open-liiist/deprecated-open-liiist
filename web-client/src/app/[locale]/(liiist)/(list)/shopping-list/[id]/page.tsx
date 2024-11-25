"use client";

// app/shopping-list/page.tsx
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaTrashAlt } from "react-icons/fa"; // Importa l'icona del cestino

const ShoppingListPage: React.FC = () => {
    const router = useRouter();
    const params = useParams(); // Usa useParams per ottenere l'ID dalla rotta dinamica
    const listId = params.id; // Ottieni l'ID dalla rotta dinamica

    const [listTitle, setListTitle] = useState<string>("");
    const [products, setProducts] = useState<string[]>([]);
    const [budget, setBudget] = useState<string>("");
    const [mode, setMode] = useState<string>("convenience");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (listId) {
            // Effettua la chiamata API per recuperare la lista specifica
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
                    setError("Failed to fetch shopping list");
                    setIsLoading(false);
                });
        }
    }, [listId]);

    const handleEditList = () => {
        router.push(`/edit-list?id=${listId}`);
    };

    const handleNavigateToSavingsMode = () => {
        router.push(
            `/savings-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
                products
            )}`
        );
    };

    const handleNavigateToConvenienceMode = () => {
        router.push(
            `/convenience-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
                products
            )}`
        );
    };

    const handleDeleteList = async () => {
        if (confirm("Vuoi eliminare definitivamente questa lista?")) {
            try {
                const response = await fetch(`/api/shopping-lists/${listId}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    router.push("/user");
                } else {
                    console.error("Errore durante l'eliminazione della lista");
                }
            } catch (err) {
                console.error("Errore nella chiamata API:", err);
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
                            <p>Prodotti: {products.join(", ")}</p>
                            <p>Modalità Corrente: {mode}</p>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <Button
                                onClick={handleEditList}
                                className="bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                Modifica Lista
                            </Button>
                            <Button
                                onClick={handleNavigateToSavingsMode}
                                className="bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                                Vai a Modalità Risparmio
                            </Button>
                            <Button
                                onClick={handleNavigateToConvenienceMode}
                                className="bg-yellow-600 text-white hover:bg-yellow-700 transition-colors"
                            >
                                Vai a Modalità Comodità
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ShoppingListPage;


// "use client";

// import React, { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import shoppingListStyles from "./styles/ShoppingList.module.css";
// import { Button } from "@/components/ui/button";
// import { FaTrashAlt } from "react-icons/fa"; // Importa l'icona del cestino

// const ShoppingListPage: React.FC = () => {
//     const router = useRouter();
//     const params = useParams(); // Usa useParams per ottenere l'ID dalla rotta dinamica
//     const listId = params.id; // Ottieni l'ID dalla rotta dinamica

//     const [listTitle, setListTitle] = useState<string>("");
//     const [products, setProducts] = useState<string[]>([]);
//     const [budget, setBudget] = useState<string>("");
//     const [mode, setMode] = useState<string>("convenience");
//     const [isLoading, setIsLoading] = useState<boolean>(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         if (listId) {
//             // Effettua la chiamata API per recuperare la lista specifica
//             fetch(`/api/shopping-lists/${listId}`)
//                 .then((response) => {
//                     if (!response.ok) {
//                         throw new Error("List not found");
//                     }
//                     return response.json();
//                 })
//                 .then((data) => {
//                     setListTitle(data.name);
//                     setProducts(data.products || []);
//                     setBudget(data.budget);
//                     setMode(data.mode);
//                     setIsLoading(false);
//                 })
//                 .catch((err) => {
//                     setError("Failed to fetch shopping list");
//                     setIsLoading(false);
//                 });
//         }
//     }, [listId]);

//     const handleEditList = () => {
//         router.push(`/edit-list?id=${listId}`);
//     };

//     const handleNavigateToSavingsMode = () => {
//         router.push(
//             `/savings-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
//                 products,
//             )}`,
//         );
//     };

//     const handleNavigateToConvenienceMode = () => {
//         router.push(
//             `/convenience-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
//                 products,
//             )}`,
//         );
//     };

//     const handleDeleteList = async () => {
//         if (confirm("Vuoi eliminare definitivamente questa lista?")) {
//             try {
//                 const response = await fetch(`/api/shopping-lists/${listId}`, {
//                     method: "DELETE",
//                 });
//                 if (response.ok) {
//                     router.push("/user");
//                 } else {
//                     console.error("Errore durante l'eliminazione della lista");
//                 }
//             } catch (err) {
//                 console.error("Errore nella chiamata API:", err);
//             }
//         }
//     };

//     return (
//         <div className={shoppingListStyles.container}>
//             {isLoading ? (
//                 <p>Loading...</p>
//             ) : (
//                 <Card className={shoppingListStyles.card}>
//                     <CardHeader>
//                         <div className={shoppingListStyles.cardHeader}>
//                             <CardTitle>{listTitle}</CardTitle>
//                             {/* Aggiungi il pulsante di eliminazione */}
//                             <FaTrashAlt
//                                 className={shoppingListStyles.deleteIcon}
//                                 onClick={handleDeleteList}
//                                 role="button"
//                                 tabIndex={0}
//                                 onKeyPress={(e) => {
//                                     if (e.key === "Enter" || e.key === " ") {
//                                         handleDeleteList();
//                                     }
//                                 }}
//                                 aria-label={`Delete shopping list ${listTitle}`}
//                             />
//                         </div>
//                     </CardHeader>
//                     <CardContent>
//                         {error && (
//                             <div className={shoppingListStyles.error}>
//                                 {error}
//                             </div>
//                         )}
//                         <div className={shoppingListStyles.details}>
//                             <p>Budget: €{budget}</p>
//                             <p>Prodotti: {products.join(", ")}</p>
//                             <p>Modalità Corrente: {mode}</p>
//                         </div>
//                         <div className={shoppingListStyles.actions}>
//                             <Button onClick={handleEditList}>
//                                 Modifica Lista
//                             </Button>
//                             <Button onClick={handleNavigateToSavingsMode}>
//                                 Vai a Modalità Risparmio
//                             </Button>
//                             <Button onClick={handleNavigateToConvenienceMode}>
//                                 Vai a Modalità Comodità
//                             </Button>
//                         </div>
//                     </CardContent>
//                 </Card>
//             )}
//         </div>
//     );
// };

// export default ShoppingListPage;
