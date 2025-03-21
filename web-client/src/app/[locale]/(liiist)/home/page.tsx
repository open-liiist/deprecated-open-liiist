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
                    Your Lists
                </h3>
            </header>

            {/* List container */}
            <section 
                className="w-full max-w-xl mb-20" 
                aria-label="Your lists"
            >
                <ListOfListComponents />
            </section>

            {/* Button to create a new list */}
            <button
                onClick={handleNewListClick}
                aria-label="Create a new list"
                className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center justify-center w-16 h-16 bg-liiist_green text-white rounded-full shadow-lg transition-transform duration-300 hover:scale-110 focus:ring-4 focus:ring-liiist_green/50"
            >
                <AiOutlinePlus className="text-3xl sm:text-4xl" />
            </button>
        </main>
    );
};

export default UserHomepage;