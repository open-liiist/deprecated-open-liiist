import React, { useState } from "react";

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
                className="w-full p-2 mb-2 border border-gray-300 rounded-lg"
            />
            {/* Contenitore dei tag */}
            <div className="flex flex-wrap gap-2">
                {tags.length > 0 ? (
                    tags.map((tag, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-gray-100 rounded-xl w-1/3"
                        >
                            <span className="font-bold flex-grow">
                                {tag.name}
                            </span>
                            <div className="flex items-center gap-2">
                                {/* Bottone per diminuire la quantità o rimuovere il tag */}
                                {tag.quantity > 1 ? (
                                    <button
                                        onClick={() => onDecreaseQuantity(index)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border-none bg-gray-300 text-lg font-bold cursor-pointer"
                                    >
                                        -
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onRemove(index)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border-none bg-red-400 text-white text-lg font-bold cursor-pointer"
                                    >
                                        x
                                    </button>
                                )}
                                {/* Cerchio per visualizzare la quantità */}
                                <span className="w-8 h-8 flex items-center justify-center font-bold">
                                    {tag.quantity}
                                </span>
                                {/* Bottone per aumentare la quantità */}
                                <button
                                    onClick={() => onIncreaseQuantity(index)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full border-none bg-gray-300 text-lg font-bold cursor-pointer"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 pl-2">No tags added yet.</p>
                )}
            </div>
        </div>
    );
};
