"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AiOutlinePlus } from "react-icons/ai";
import ListOfListComponents from "@/components/ui/ListOfListComponents";

const UserHomepage = () => {
    const router = useRouter();

    const handleNewListClick = () => {
        router.push("/new-list");
    };

    return (
        <div id="home-page" className="flex flex-col min-h-screen items-center justify-between p-2 bg-liiist_white">
            <div className="p-8 w-full max-w-3xl mt-7">
                {/* Componente per visualizzare le liste */}
                <ListOfListComponents />
            </div>

            {/* Pulsante per creare una nuova lista */}
            <div className="fixed bottom-4 flex justify-center w-full">
                <button
                    onClick={handleNewListClick}
                    className="text-liiist_black h-16 w-16 shadow-none cursor-pointer bg-gray-300 rounded-full transition-all duration-700 ease-in-out hover:rounded-2xl hover:bg-gray-600 flex items-center justify-center"
                >
                    <AiOutlinePlus className="text-4xl text-white" />
                </button>
            </div>
        </div>
    );
};

export default UserHomepage;
