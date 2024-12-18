import { useState } from "react";
import { Button } from "./button";
import {FaTrashAlt} from "react-icons/fa"
import { FaArrowRight } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa6";
import { GoArrowDownRight } from "react-icons/go";
import { RxCross1 } from "react-icons/rx";
import { BsTrash3Fill } from "react-icons/bs";



const ListCard = ({listId, listName, listMode, onViewList, createdAt, delateList, calculate, router }) => {

    const colors = ["#FFABAD", "#FFC576", "#B594B6" , "#7D5C65", "#6EEB83"];
    const createdDate = new Date(createdAt);
    const minute = createdDate.getMinutes();
    var lastDigit = minute % 10;
    if(lastDigit > 5){
        lastDigit = lastDigit - 5;
    }
    const backgroundColor = colors[lastDigit % colors.length];
    const [isHovered, setIsHovered] = useState(false);

    const handleEditList = () => {
        router.push(`/edit-list?id=${listId}`);
    };


    return (
        <div id="list-card" 
            className=" h-44 flex justify-between mb-6 bg-gray-50 rounded-2xl text-liiist_black  shadow-md transition-colors duration-300 hover:bg-gray-200"
            style={{ backgroundColor: isHovered ? "#e2e8f0" : backgroundColor }}
            >
            <div id="click zone" className="flex flex-col justify-between ml-5 w-full cursor-pointer"
                role="button"
                onClick={handleEditList}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="font-bold text-3xl mt-6">{listName}</div>
                <div className="text-white text-sm mb-3 bg-liiist_black w-fit rounded-lg flex gap-2 items-center px-4 py-1">
                    <FaCheck/>
                    {listMode}
                </div>
            </div>
            <div className="w-1/6 rounded-e-xl flex flex-col justify-between items-end pt-4 pb-3 px-4">
                    <div className="border-liiist_black  hover:scale-105 cursor-pointer">
                        <BsTrash3Fill 
                            className="text-3xl m-0.5"
                            role = "button"
                            onClick={delateList}
                            onKeyPress={(e) => {
                                if (
                                   e.key === "Enter" ||
                                   e.key === " "
                                ) {
                                    delateList();
                                }
                            }}
                            aria-label={`Delete shopping list ${listName}`}
                            />
                    </div>
                    <div onClick={calculate} 
                        className="rounded-lg border-2 border-liiist_black cursor-pointer hover:scale-105"
                    >
                        <GoArrowDownRight
                            className="text-4xl"
                        />
                    </div>
                </div>
        </div>
    );
};

export default ListCard;