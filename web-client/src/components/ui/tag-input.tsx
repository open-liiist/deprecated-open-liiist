import React, { useState } from "react";
import { FiPlus, FiMinus} from "react-icons/fi"; // react-icons
import { FaTimes } from "react-icons/fa"; // react-icons

interface TagInputProps {
    placeholder: string;
    onAdd: (tag: { name: string; quantity: number }) => void;
    onRemove: (index: number) => void;
    onIncreaseQuantity: (index: number) => void;
    onDecreaseQuantity: (index: number) => void;
    tags: { name: string; quantity: number }[];
}

export const TagInput: React.FC<TagInputProps> = ({
    placeholder,
    onAdd,
    onRemove,
    onIncreaseQuantity,
    onDecreaseQuantity,
    tags,
}) => {
    const [inputValue, setInputValue] = useState<string>("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim() !== "") {
            onAdd({ name: inputValue.trim(), quantity: 1 });
            setInputValue("");
        }
    };

    return (
        <div>
            {/* Input per l'aggiunta dei tag */}
            <input
                type="text"
                placeholder={placeholder}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full p-3 mb-4 border-transparent rounded-full"
            />
            {/* Contenitore dei tag */}
            <div
                id="product-container"
                className="flex flex-wrap gap-y-3 gap-x-3 max-h-[60vh] overflow-y-auto relative"
            >
                {tags.length > 0 ? (
                    tags.map((tag, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-5 p-2 bg-gray-100 rounded-xl min-w-[0vh] max-h-12"
                        >
                            <span className=" text-xl flex-grow">{tag.name}</span>
                            <div className="flex items-center">
                                {/* Se la quantità è 1, solo + e x */}
                                {tag.quantity === 1 ? (
                                    <>
                                        <button
                                            onClick={() => onRemove(index)}
                                            className="p-0.5 rounded-full border border-gray-300 flex justify-center items-center hover:bg-gray-200"
                                        >
                                            <FaTimes style={{ fontSize: "12px" }}/>
                                        </button>
                                        <span className="px-2">{tag.quantity}</span>
                                        <button
                                            onClick={() => onIncreaseQuantity(index)}
                                            className="p-0.5 rounded-full border border-gray-300 flex justify-center items-center hover:bg-gray-200"
                                        >
                                            <FiPlus />
                                        </button>
                                    </>
                                ) : (
                                    // Se la quantità è maggiore di 1, mostra + e -
                                    <>
                                        <button
                                            onClick={() => onDecreaseQuantity(index)}
                                            className="p-0.5 rounded-full border border-gray-300 flex justify-center items-center hover:bg-gray-100"
                                        >
                                            <FiMinus />
                                        </button>
                                        <span className="px-2">{tag.quantity}</span>
                                        <button
                                            onClick={() => onIncreaseQuantity(index)}
                                            className="p-0.5 rounded-full border border-gray-300 flex justify-center items-center hover:bg-gray-200"
                                        >
                                            <FiPlus />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>Nessun tag aggiunto.</p>
                )}
            </div>
        </div>
    );
};
