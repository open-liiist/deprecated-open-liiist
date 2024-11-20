import { useState } from "react";
import { Button } from "./button";
import {FaTrashAlt} from "react-icons/fa"
import { FaArrowRight } from "react-icons/fa6";


const ListCard = ({listName, listBudget, onViewList, listIndex }) => {

    const colors = ["#FFABAD", "#FFC576", "#B4B1B1" , "#7D5C65", "#6EEB83"];
    const backgroundColor = colors[listIndex % colors.length];
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className="flex justify-between mb-6 bg-gray-50 rounded-xl text-liiist_black " >
            <div
                className="mb-4 w-full rounded-s-xl  cursor-pointer transition-colors duration-300 hover:bg-gray-200"
                style={{ backgroundColor: isHovered ? "#e2e8f0" : backgroundColor }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                role="button"
                tabIndex={0}
                onClick={onViewList}
                onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onViewList();
                    }
                }}
                aria-label={`Open shopping list ${listName}`}
                >
                <div className="font-bold text-lg p-3">{listName}</div>
                <div className="bg-gray-50 text-gray-600 text-sm pl-3 border-t-2 border-dashed border-gray-500 pt-2">
                    <div>Budget: {listBudget}€</div>
                </div>
            </div>
            <div className="w-1/6 bg-gray-50 rounded-e-xl border-l-2 border-dashed border-gray-500 flex flex-col justify-evenly items-center">
                    <div>
                        <FaTrashAlt className="hover:scale-125 flex justify-center items-center w-full" />
                    </div>
                    <div onClick={onViewList} className="bg-gray-50 flex justify-center items-center w-full">
                        <FaArrowRight className="hover:scale-125"/>
                    </div>
                </div>
        </div>
    );
};

export default ListCard;