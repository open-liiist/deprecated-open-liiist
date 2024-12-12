import React, {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { Button } from "./button"
import ListCard from "./ListCard";
import { handleCalculate2 } from "@/services/shoppingListService";
import { fetchClient } from "@/lib/api";
import { cookies } from 'next/headers';



// const ListOfListComponents = () => {
//     const router = useRouter();
//     const [shoppingLists, setShoppingLists] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         fetchShoppingLists();
//     }, []);

//     const fetchShoppingLists = async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             // Recupera il token di accesso dai cookie
//             const sessionCookie = cookies().get(environment.cookies.access);
//             const accessToken = sessionCookie?.value;
    
//             if (!accessToken) {
//                 throw new Error("Access token is missing");
//             }
    
//             // Chiamata API per recuperare le liste con il token di accesso
//             const response = await fetchClient.get("/shoppingList", accessToken);
    
//             if (!response.ok) {
//                 throw new Error("Network response was not ok");
//             }
    
//             const data = await response.json();
//             console.log("Data fetched from list", data);
//             setShoppingLists(data);
//         } catch (err) {
//             console.error("Errore durante il fetch delle liste:", err);
//             setError("Failed to fetch shopping lists");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleListClick = (listId) => {
//         router.push(`/shopping-list/${listId}`);
//     };

//     const handleDeleteList = async (listId) => {
//         if (confirm("Sei sicuro di voler eliminare questa lista?")) {
//             try {
//                 const response = await fetchClient.delete(`/shoppingList/${listId}`);

//                 if (response.ok) {
//                     setShoppingLists((prevLists) =>
//                         prevLists.filter((list) => list.id !== listId),
//                     );
//                 } else {
//                     console.error("Errore durante l'eliminazione della lista");
//                 }
//             } catch (err) {
//                 console.error("Errore nella chiamata API:", err);
//             }
//         }
//     };

//     return (
//         <div>
//             {isLoading ? (
//                 <div
//                     className="text-xl text-gray-700"
//                     role="status"
//                     aria-live="polite"
//                 >
//                     Loading...
//                 </div>
//             ) : error ? (
//                 <div className="text-red-500 text-base mt-2" role="alert">
//                     {error}
//                 </div>
//             ) : shoppingLists.length > 0 ? (
//                 <div className="relative">
//                     <div className="mt-5 max-h-[65vh] overflow-y-auto relative">
//                         {shoppingLists.map((list) => (
//                             <ListCard
//                                 key={list.id}
//                                 router={router}
//                                 listId={list.id}
//                                 listName={list.name}
//                                 listMode={list.mode}
//                                 onViewList={() => handleListClick(list.id)}
//                                 createdAt={list.createdAt}
//                                 delateList={() => handleDeleteList(list.id)}
//                                 calculate={() => handleCalculate2(
//                                     list.id,
//                                     list.name,
//                                     list.products,
//                                     list.budget,
//                                     list.mode,
//                                     router,
//                                 )}
//                             />
//                         ))}
//                     </div>
//                     <div className="w-full h-1 bg-gradient-to-t from-liiist_white to-transparent absolute bottom-0 pointer-events-none"></div>
//                 </div>
//             ) : (
//                 <div className="mt-5 text-center">
//                     <p className="text-lg text-gray-600">
//                         You don't have any shopping lists yet.
//                     </p>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ListOfListComponents;


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
                            <div className="mt-5 max-h-[65vh] overflow-y-auto relative">
                                {shoppingLists.map((list) => (
                                    <ListCard
                                        key={list.id}
                                        router={router}
                                        listId={list.id}
						    		    listName={list.name}
						    		    listMode={list.mode}
						    		    onViewList={() => handleListClick(list.id)}
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