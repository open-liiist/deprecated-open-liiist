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
        <div id="home-page" className="flex flex-col items-center justify-center p-2 bg-liiist_white ">
            <div className="w-full max-w-2xl mt-5">
                {/* Componente per visualizzare le liste */}
                <ListOfListComponents />
                {/* Pulsante per creare una nuova lista */}
                <div className="mt-16 flex justify-center">
                    <button
                        onClick={handleNewListClick}
                        className="text-liiist_black h-16 w-16 shadow-none cursor-pointer bg-gray-300 rounded-full transition-all duration-700 ease-in-out hover:rounded-2xl hover:bg-gray-600 flex items-center justify-center"
                    >
                        <AiOutlinePlus className="text-4xl text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserHomepage;
