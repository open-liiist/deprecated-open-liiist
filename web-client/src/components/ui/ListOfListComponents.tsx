import React, {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { Button } from "./button"
import ListCard from "./ListCard";

const ListOfListComponents = () => {
	const router = useRouter();
	const [shoppingLists, setShoppingLists] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

    // Simuliamo l'ID dell'utente per ora.
    const userId = "12345";

	useEffect(() => {
        fetchShoppingLists();
    }, []);

    const fetchShoppingLists = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Chiamata API per recuperare le liste di spesa dell'utente
            const response = await fetch(`/api/shopping-lists?userId=${userId}&t=${new Date().getTime()}`, {
                headers: {
                    "Cache-Control": "no-cache"
                }});
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log("data fetched from list", data);
            setShoppingLists(data);
        } catch (err) {
            setError("Failed to fetch shopping lists");
        } finally {
            setIsLoading(false);
        }
    };

	const handleListClick = (listId) => {
        router.push(`/shopping-list/${listId}`);
	}

    const handleDeleteList = async (listId) => {
        if (confirm("Sei sicuro di voler eliminare questa lista?")) {
            try {
                const response = await fetch(`/api/shopping-lists/${listId}`, {
                    method: "DELETE",
                });
                if (response.ok) {
                    setShoppingLists((prevLists) =>
                        prevLists.filter((list) => list.id !== listId),
                    );
                } else {
                    console.error("Errore durante l'eliminazione della lista");
                }
            } catch (err) {
                console.error("Errore nella chiamata API:", err);
            }
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
                            <div className="mt-5 max-h-[55vh] overflow-y-auto relative">
                                {shoppingLists.map((list, index) => (
                                    <ListCard
                                        key={list.id}
						    		    listName={list.name}
						    		    listBudget={list.budget}
						    		    onViewList={() => handleListClick(list.id)}
                                        listIndex={index}
                                        delateList={() => handleDeleteList(list.id)}
                                    />
                                ))}
                            </div>
                            <div className="w-full h-10 bg-gradient-to-t from-liiist_white to-transparent absolute bottom-0 pointer-events-none"></div>
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