// TagInput.tsx
import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { foodEmojisItalian } from "../utils/foodEmojis";
import styles from "./TagInput.module.css";
import Tag from "../common/SingleTag"; // Importa il nuovo componente Tag

interface TagInputProps {
  placeholder?: string;
  onAdd: (tag: { name: string; quantity: number }) => void;
  onRemove: (index: number) => void;
  onIncreaseQuantity: (index: number) => void;
  onDecreaseQuantity: (index: number) => void;
  tags: { name: string; quantity: number }[];
  onReorder: (updatedTags: { name: string; quantity: number }[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  placeholder,
  onAdd,
  onRemove,
  onIncreaseQuantity,
  onDecreaseQuantity,
  tags,
  onReorder,
}) => {
  const [inputValue, setInputValue] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim() !== "") {
      const tagName = inputValue.trim();
      const lowerCaseName = tagName.toLowerCase();
      const tagWithEmoji = foodEmojisItalian[lowerCaseName]
        ? `${tagName}${foodEmojisItalian[lowerCaseName]}`
        : tagName;

      const existingTagIndex = tags.findIndex(
        (tag) => tag.name.toLowerCase() === tagWithEmoji.toLowerCase()
      );

      if (existingTagIndex !== -1) {
        onIncreaseQuantity(existingTagIndex);
      } else {
        onAdd({ name: tagWithEmoji, quantity: 1 });
      }

      setInputValue("");
    }
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const reorderedTags = Array.from(tags);
    const [movedItem] = reorderedTags.splice(source.index, 1);
    reorderedTags.splice(destination.index, 0, movedItem);

    onReorder(reorderedTags);
  };

  return (
    <div className="bg-white w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pr-3 pb-3 pl-0 mb-4 border-transparent text-left text-3xl placeholder-gray-600 focus:outline-none focus:ring-0"
      />
      {/* <hr className="border-dashed border-t-2 border-gray-300 my-4" /> */}

      <DragDropContext
        onDragEnd={(result: DropResult) => {
          document.querySelector(".productContainer")?.classList.remove("draggingOver");
          handleDragEnd(result);
        }}
        onDragStart={() => {
          document.querySelector(".productContainer")?.classList.add("draggingOver");
        }}
      >
        {tags.length > 0 && (
          <Droppable droppableId="tags">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`${styles.productContainer} flex flex-wrap gap-y-3 gap-x-3`}
              >
                {tags.map((tag, index) => (
                  <Draggable
                    key={tag.name} // Assicurati che `tag.name` sia unico.
                    draggableId={`${tag.name}-${index}`} // Deve essere un valore unico.
                    index={index}
                  >
                    {(provided) => (
                      <Tag
                        tag={tag}
                        index={index}
                        onRemove={onRemove}
                        onIncreaseQuantity={onIncreaseQuantity}
                        onDecreaseQuantity={onDecreaseQuantity}
                        draggableProps={provided.draggableProps}
                        dragHandleProps={provided.dragHandleProps}
                        innerRef={provided.innerRef}
                      />
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        )}
      </DragDropContext>
    </div>
  );
};
