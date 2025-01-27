// Tag.tsx
import React from "react";
import { FiPlus, FiMinus, FiX } from "react-icons/fi";
import styles from "./TagInput.module.css";

interface TagProps {
  tag: { name: string; quantity: number };
  index: number;
  onRemove: (index: number) => void;
  onIncreaseQuantity: (index: number) => void;
  onDecreaseQuantity: (index: number) => void;
  draggableProps: any;
  dragHandleProps: any;
  innerRef: any;
}

const Tag: React.FC<TagProps> = ({
  tag,
  index,
  onRemove,
  onIncreaseQuantity,
  onDecreaseQuantity,
  draggableProps,
  dragHandleProps,
  innerRef,
}) => {
  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...dragHandleProps}
      className="flex items-center gap-7 p-3 bg-gray-100 rounded-3xl"
    >
      <span className="text-2xl text-liiist_black flex-grow">{tag.name}</span>
      <div className="flex items-center">
        {tag.quantity === 1 ? (
          <>
            <button
              onClick={() => onRemove(index)}
              className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <FiX />
            </button>
            <span className="px-3 text-2xl">{tag.quantity}</span>
            <button
              onClick={() => onIncreaseQuantity(index)}
              className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <FiPlus size={20}/>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onDecreaseQuantity(index)}
              className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <FiMinus />
            </button>
            <span className="px-2">{tag.quantity}</span>
            <button
              onClick={() => onIncreaseQuantity(index)}
              className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
            >
              <FiPlus size={20}/>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Tag;
