"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AiOutlinePlus } from "react-icons/ai";
import ListOfListComponents from "@/components/ui/ListOfListComponents";

const UserHomepage = () => {
    const router = useRouter();

    // Navigates to the "Create New List" page
    const handleNewListClick = () => {
        router.push("/new-list");
    };

    return (
        <main
            id="home-page"
            className="flex flex-col items-center justify-start min-h-screen max-w-full w-full p-5 bg-white"
        >
            {/* Header Section */}
            <header className="w-full max-w-xl">
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-liiist_black mb-4">
                    Le Tue Liste
                </h3>
            </header>

            {/* Contenitore della lista */}
            <section 
                className="w-full max-w-xl mb-20" 
                aria-label="Lista delle tue liste"
            >
                <ListOfListComponents />
            </section>

            {/* Pulsante per creare una nuova lista */}
            <button
                onClick={handleNewListClick}
                aria-label="Crea una nuova lista"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center justify-center w-16 h-16 bg-liiist_green text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:ring-4 focus:ring-liiist_green/50"
            >
                <AiOutlinePlus className="text-3xl sm:text-4xl" />
            </button>
        </main>
    );
};

export default UserHomepage;

/*
<button
    onClick={handleNewListClick}
    aria-label="Crea una nuova lista"
    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center justify-center w-16 h-16 bg-liiist_green text-white rounded-full shadow-lg transition-all duration-700 ease-in-out hover:scale-110 hover:rounded-lg hover:border hover:border-liiist_green focus:ring-4 focus:ring-liiist_green/50"
>
    <AiOutlinePlus className="text-3xl sm:text-4xl" />
</button>
*/