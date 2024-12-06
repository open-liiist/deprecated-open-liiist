// "use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import { AiOutlinePlus } from "react-icons/ai";
// import ListOfListComponents from "@/components/ui/ListOfListComponents";

// const UserHomepage = () => {
//     const router = useRouter();

//     const handleNewListClick = () => {
//         router.push("/new-list");
//     };

//     return (
//         <div id="home-page" className="mt-navbar flex flex-col min-h-screen items-center justify-between bg-liiist_white">
//             <div className="w-full max-w-xl">
//                 {/* Componente per visualizzare le liste */}
//                 <ListOfListComponents />
//             </div>

//             {/* Pulsante per creare una nuova lista */}
//             <div className="fixed bottom-4 flex justify-center w-full">
//                 <button
//                     onClick={handleNewListClick}
//                     className="text-liiist_black h-16 w-16 shadow-none cursor-pointer bg-gray-300 rounded-full transition-all duration-700 ease-in-out hover:rounded-2xl hover:bg-gray-600 flex items-center justify-center"
//                 >
//                     <AiOutlinePlus className="text-4xl text-white" />
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default UserHomepage;
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
        <main
            id="home-page"
            className="mt-navbar flex flex-col items-center min-h-screen bg-liiist_white"
        >
            {/* Contenitore della lista */}
            <section className="fidex w-full max-w-xl mt-4 px-4">
                <h1 className="text-2xl font-semibold text-liiist_black mb-2">
                    Le Tue Liste
                </h1>
                <ListOfListComponents/>
            </section>

            {/* Pulsante per creare una nuova lista */}
            <button
                onClick={handleNewListClick}
                aria-label="Crea una nuova lista"
                className="fixed bottom-4 flex items-center justify-center w-16 h-16 bg-liiist_green text-white rounded-full shadow-md transition-transform duration-300 hover:scale-110"
            >
                <AiOutlinePlus className="text-3xl" />
            </button>
        </main>
    );
};

export default UserHomepage;
