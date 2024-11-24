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

    return (
        <div id="home-page" className="flex flex-col items-center justify-center p-5 bg-liiist_white">
            <div className="w-full max-w-4xl mt-5">
                    <ListOfListComponents/>
                    <div className="mt-16 flex justify-center">
                        <Button onClick={handleNewListClick} className=" bg-liiist_green text-white border-none h-15 w-15 rounded-full cursor-pointer hover:bg-green-600">
                            <AiOutlinePlus className="text-3xl"/>
                        </Button>
                    </div>
            </div>
        </div>
    );
};

export default UserHomepage;


