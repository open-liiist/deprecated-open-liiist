import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ListCard from "./ListCard";
import { handleCalculate2 } from "@/services/shoppingListService";

const ListOfListComponents = () => {
    const router = useRouter();
    const [shoppingLists, setShoppingLists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch shopping lists from the API
    useEffect(() => {
        const fetchShoppingLists = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch("/api/getShoppingLists");
                if (!response.ok) {
                    throw new Error("Failed to fetch shopping lists");
                }
                const data = await response.json();
                setShoppingLists(data.data);
                console.log(`Shopping lists:, ${shoppingLists}`);
            } catch (err) {
                console.error("Errore:", err);
                setError("Impossibile recuperare le liste della spesa");
            } finally {
                setIsLoading(false);
            }
        };

        fetchShoppingLists();
    }, []);

    // Handle deletion of a shopping list
    const handleDeleteList = async (listId) => {
        if (!listId) {
            console.error("ID della lista mancante");
            return;
        }

        const confirmDelete = confirm("Sei sicuro di voler eliminare questa lista?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`/api/deleteShoppingList`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listId }),
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Errore durante l'eliminazione della lista:", errorData?.error || "Errore sconosciuto");
                alert(`Errore: ${errorData?.error || "Impossibile eliminare la lista"}`);
                return;
            }

            setShoppingLists((prevLists) => prevLists.filter((list) => list.id !== listId));
        } catch (err) {
            console.error("Errore nella chiamata API:", err);
            alert("Errore durante la comunicazione con il server. Riprova più tardi.");
        }
    };

    // Render component
    return (
        <div className="relative">
            {isLoading ? (
                <div className="text-xl text-gray-700" role="status" aria-live="polite">
                    Loading...
                </div>
            ) : error ? (
                <div className="text-red-500 text-base mt-2" role="alert">
                    {error}
                </div>
            ) : shoppingLists.length > 0 ? (
                <div className="relative">
                    {/* Contenitore per le liste */}
                    <div className="mt-3 relative mx-auto w-full max-w-2xl gap-1 max-h-[65vh] overflow-y-auto">
                        {shoppingLists.map((list) => (
                            <ListCard
                                key={list.id}
                                router={router}
                                listId={list.id}
                                listName={list.name}
                                listMode={list.mode}
                                createdAt={list.createdAt}
                                delateList={() => handleDeleteList(list.id)}
                                calculate={() =>
                                    handleCalculate2(
                                        list.id,
                                        list.name,
                                        list.products,
                                        list.budget,
                                        list.mode,
                                        "12345",
                                        router
                                    )
                                }
                            />
                        ))}
                    </div>
                    {/* Effetto sfumato per lo scrolling */}
                    <div className="w-full h-1 bg-gradient-to-t from-liiist_white to-transparent absolute bottom-0 pointer-events-none"></div>
                </div>
            ) : (
                <div className="mt-5 text-left">
                    <p className="text-lg text-gray-600">
                        You don't have any shopping lists yet.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ListOfListComponents;
