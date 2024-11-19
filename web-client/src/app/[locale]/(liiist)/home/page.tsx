"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AiOutlinePlus } from "react-icons/ai";
import ListOfListComponents from "@/components/ui/ListOfListComponents";


const UserHomepage = () => {
    const router = useRouter();

    const handleNewListClick = async () => {
        router.push("/new-list");
    };

    const handleProfileClick = () => {
        router.push("/profile");
    };

    return (
        <div className="flex flex-col items-center justify-center p-5 bg-liiist_white">
            <div className="w-full max-w-4xl mt-5">
                    <ListOfListComponents/>
                    <div className="mt-5 flex justify-center">
                        <Button onClick={handleNewListClick} className="bg-liiist_green text-white border-none p-3 rounded-full cursor-pointer hover:bg-green-600">
                            <AiOutlinePlus />
                        </Button>
                    </div>
            </div>
        </div>
    );
};

export default UserHomepage;


// const UserHomepage = () => {
//     const router = useRouter();
//     const [userLocation, setUserLocation] = useState("");
//     const [shoppingLists, setShoppingLists] = useState([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchShoppingLists();
//     }, []);

//     const fetchShoppingLists = async () => {
//         setIsLoading(true);
//         setError(null);
//         try {
//             // Chiamata API per recuperare le liste di spesa dell'utente
//             const response = await fetch("/api/shopping-lists");
//             if (!response.ok) {
//                 throw new Error("Network response was not ok");
//             }
//             const data = await response.json();
//             setShoppingLists(data.lists);
//         } catch (err) {
//             setError("Failed to fetch shopping lists");
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleListClick = (listId) => {
//         router.push(`/supermarket/${listId}`);
//     };

//     const handleNewListClick = async () => {
//         // Naviga alla pagina per creare una nuova lista
//         router.push("/new-list");
//     };

//     const handleProfileClick = () => {
//         router.push("/profile");
//     };

//     return (
//         <div className="flex flex-col items-center justify-center p-5">
//             <div className="w-full max-w-3xl mt-5">
//                 <CardContent>
//                     {isLoading ? (
//                         <div
//                             className="text-xl text-gray-700"
//                             role="status"
//                             aria-live="polite"
//                         >
//                             Loading...
//                         </div>
//                     ) : error ? (
//                         <div className="text-red-500 text-base mt-2" role="alert">
//                             {error}
//                         </div>
//                     ) : shoppingLists.length > 0 ? (
//                         <div className="mt-5">
//                             {shoppingLists.map((list) => (
//                                 <div
//                                     key={list.id}
//                                     className="bg-gray-100 p-4 mb-2 rounded cursor-pointer transition-colors duration-300 hover:bg-gray-200"
//                                     onClick={() => handleListClick(list.id)}
//                                     role="button"
//                                     tabIndex={0}
//                                     onKeyPress={(e) => {
//                                         if (
//                                             e.key === "Enter" ||
//                                             e.key === " "
//                                         ) {
//                                             handleListClick(list.id);
//                                         }
//                                     }}
//                                     aria-label={`Open shopping list ${list.name}`}
//                                 >
//                                     <div className="font-bold text-lg">
//                                         {list.name}
//                                     </div>
//                                     <div className="mt-1 text-gray-600 text-sm">
//                                         <div>
//                                             Budget: {list.budget}€
//                                         </div>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     ) : (
//                         <div className="mt-5 text-center">
//                             <p className="text-lg text-gray-600">
//                                 You don't have any shopping lists yet.
//                             </p>
//                         </div>
//                     )}
//                     <div className="mt-5 flex justify-center">
//                         <Button onClick={handleNewListClick} className="bg-liiist_green text-white border-none p-3 rounded-full cursor-pointer hover:bg-green-600">
//                             <AiOutlinePlus />
//                         </Button>
//                     </div>
//                 </CardContent>
//             </div>
//         </div>
//     );
// };

// export default UserHomepage;
