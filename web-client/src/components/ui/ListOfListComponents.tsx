import React, {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import ListCard from "./ListCard";
import { handleCalculate2 } from "@/services/shoppingListService";

const ListOfListComponents = () => {
	const router = useRouter();
	const [shoppingLists, setShoppingLists] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
    
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

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }


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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ listId }), // Passa l'ID nel body
                credentials: 'include', // Include i cookie di autenticazione
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error("Errore durante l'eliminazione della lista:", errorData?.error || "Errore sconosciuto");
                alert(`Errore: ${errorData?.error || "Impossibile eliminare la lista"}`);
                return;
            }
    
            const result = await response.json();
            console.log("Lista eliminata con successo:", result);
    
            // Aggiorna l'elenco delle liste, rimuovendo la lista eliminata
            setShoppingLists((prevLists) => prevLists.filter((list) => list.id !== listId));
        } catch (err) {
            console.error("Errore nella chiamata API:", err);
            alert("Errore durante la comunicazione con il server. Riprova più tardi.");
        }
    };

	return (
		<div>
			{isLoading ? (
                        <div
                            className="text-xl text-gray-700"
                            role="status"
                            aria-live="polite"
                        >
                            Loading...
                        </div>
                    ) : error ? (
                        <div className="text-red-500 text-base mt-2" role="alert">
                            {error}
                        </div>
                    ) : shoppingLists.length > 0 ? (
                        <div className="relative">
                            <div className="mt-5 max-h-[65vh] overflow-y-auto relative">
                                {shoppingLists.map((list) => (
                                    <ListCard
                                        key={list.id}
                                        router={router}
                                        listId={list.id}
						    		    listName={list.name}
						    		    listMode={list.mode}
                                        createdAt={list.createdAt}
                                        delateList={() => handleDeleteList(list.id)}
                                        calculate={() => handleCalculate2(
                                            list.id,
                                            list.name,
                                            list.products,
                                            list.budget,
                                            list.mode,
                                            "12345",
                                            router,
                                        )}
                                    />
                                ))}
                            </div>
                            <div className="w-full h-1 bg-gradient-to-t from-liiist_white to-transparent absolute bottom-0 pointer-events-none"></div>
                        </div>
                    ) : (
                        <div className="mt-5 text-center">
                            <p className="text-lg text-gray-600">
                                You don't have any shopping lists yet.
                            </p>
                        </div>
                    )}
		</div>
	);
};

export default ListOfListComponents;