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
        <div id="home-page" className="flex flex-col items-center justify-center p-2 bg-liiist_white">
            <div className="w-full max-w-2xl mt-5">
                    <ListOfListComponents/>
                    <div className="mt-16 flex justify-center">
                        <Button onClick={handleNewListClick} className=" text-liiist_black h-15 w-15  shadow-none cursor-pointer hover:scale-125">
                            <AiOutlinePlus className="text-4xl hover:shadow-inherit"/>
                        </Button>
                    </div>
            </div>
        </div>
    );
};

export default UserHomepage;


