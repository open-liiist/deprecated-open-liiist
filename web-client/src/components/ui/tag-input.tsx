import React, { useState } from "react";
import { FiPlus, FiMinus, FiX } from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { foodEmojisItalian } from "./foodEmojis";
import styles from "./TagInput.module.css";

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

  const handleDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    const reorderedTags = Array.from(tags);
    const [movedItem] = reorderedTags.splice(source.index, 1);
    reorderedTags.splice(destination.index, 0, movedItem);

    onReorder(reorderedTags);
  };

  return (
    <div className="bg-white">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full pt-3 pr-3 pb-3 pl-0 mb-4 border-transparent text-left text-3xl placeholder-gray-600 focus:outline-none focus:ring-0"
      />
        {/* <hr className="border-dashed border-t-2 border-gray-300 my-4" /> */}


<DragDropContext  onDragEnd={(result) => {
    document.querySelector(".productContainer")?.classList.remove("draggingOver");
    handleDragEnd(result);
  }}
  onDragStart={() => {
    document.querySelector(".productContainer")?.classList.add("draggingOver");
  }}>
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
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                className="flex items-center gap-5 p-2 bg-gray-100 rounded-xl"
              >
                {/* Resto del contenuto */}
                <span className="text-xl flex-grow">{tag.name}</span>
                <div className="flex items-center">
                  {tag.quantity === 1 ? (
                    <>
                      <button
                        onClick={() => onRemove(index)}
                        className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <FiX />
                      </button>
                      <span className="px-2">{tag.quantity}</span>
                      <button
                        onClick={() => onIncreaseQuantity(index)}
                        className="p-0.5 rounded-full bg-gray-200 hover:bg-gray-300"
                      >
                        <FiPlus />
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
                        <FiPlus />
                      </button>
                    </>
                  )}
                </div>
              </div>
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

// import React, { useState } from "react";
// import { FiPlus, FiMinus, FiX } from "react-icons/fi"; // react-icons
// import { foodEmojisItalian } from "./foodEmojis";
// import styles from './TagInput.module.css';



// interface TagInputProps {
//     placeholder: string;
//     onAdd: (tag: { name: string; quantity: number }) => void;
//     onRemove: (index: number) => void;
//     onIncreaseQuantity: (index: number) => void;
//     onDecreaseQuantity: (index: number) => void;
//     tags: { name: string; quantity: number }[];
// }

// export const TagInput: React.FC<TagInputProps> = ({
//     placeholder,
//     onAdd,
//     onRemove,
//     onIncreaseQuantity,
//     onDecreaseQuantity,
//     tags,
// }) => {
//     const [inputValue, setInputValue] = useState<string>("");

//     const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//         if (e.key === "Enter" && inputValue.trim() !== "") {
//             // Rendi il nome del tag in lowercase per la mappa
//             const tagName = inputValue.trim();
//             const lowerCaseName = tagName.toLowerCase();
    
//             // Aggiungi l'emoji se esiste nella mappa
//             const tagWithEmoji = foodEmojisItalian[lowerCaseName]
//                 ? `${tagName}${foodEmojisItalian[lowerCaseName]}`
//                 : tagName;
    
//             const existingTagIndex = tags.findIndex(
//                 (tag) => tag.name.toLowerCase() === tagWithEmoji.toLowerCase()
//             );
    
//             if (existingTagIndex !== -1) {
//                 // Se il tag esiste già, aumenta la quantità
//                 onIncreaseQuantity(existingTagIndex);
//             } else {
//                 // Altrimenti, aggiungi un nuovo tag
//                 onAdd({ name: tagWithEmoji, quantity: 1 });
//             }
    
//             setInputValue("");
//         }
//     };
    
    

//     return (
//         <div className="bg-white">
//             {/* Campo di Input per Aggiungere Tag */}
//             <input
//     type="text"
//     placeholder={placeholder}
//     value={inputValue}
//     onChange={(e) => setInputValue(e.target.value)}
//     onKeyDown={handleKeyDown}
//     className="w-full pt-3 pr-3 pb-3 pl-0 mb-4 border-transparent text-left text-3xl placeholder-gray-500 focus:outline-none focus:ring-0"
// />

//             {/* Contenitore dei Tag */}
//             <div
//   id="product-container"
//   className={`${styles.productContainer} flex flex-wrap gap-y-3 gap-x-3 relative`}
// >
//                 {tags.length > 0 ? (
//                     tags.map((tag, index) => (
//                         <div
//                             key={index}
//                             className="flex items-center gap-5 p-2 bg-gray-100 rounded-xl min-w-[0vh] max-h-12"
//                         >
//                             <span className="text-xl flex-grow">{tag.name}</span>
//                             <div className="flex items-center">
//                                 {/* Se la quantità è 1, solo + e x */}
//                                 {tag.quantity === 1 ? (
//                                     <>
//                                         <button
//                                             onClick={() => onRemove(index)}
//                                             className="p-0.5 rounded-full bg-gray-200 flex justify-center items-center hover:bg-gray-300"
//                                             aria-label={`Rimuovi tag ${tag.name}`}
//                                         >
//                                             <FiX style={{ fontSize: "12px" }} />
//                                         </button>
//                                         <span className="px-2">{tag.quantity}</span>
//                                         <button
//                                             onClick={() => onIncreaseQuantity(index)}
//                                             className="p-0.5 rounded-full bg-gray-200 flex justify-center items-center hover:bg-gray-300"
//                                             aria-label={`Aumenta quantità di ${tag.name}`}
//                                         >
//                                             <FiPlus />
//                                         </button>
//                                     </>
//                                 ) : (
//                                     // Se la quantità è maggiore di 1, mostra + e -
//                                     <>
//                                         <button
//                                             onClick={() => onDecreaseQuantity(index)}
//                                             className="p-0.5 rounded-full bg-gray-200 flex justify-center items-center hover:bg-gray-300"
//                                             aria-label={`Diminuisci quantità di ${tag.name}`}
//                                         >
//                                             <FiMinus />
//                                         </button>
//                                         <span className="px-2">{tag.quantity}</span>
//                                         <button
//                                             onClick={() => onIncreaseQuantity(index)}
//                                             className="p-0.5 rounded-full bg-gray-200 flex justify-center items-center hover:bg-gray-300"
//                                             aria-label={`Aumenta quantità di ${tag.name}`}
//                                         >
//                                             <FiPlus />
//                                         </button>
//                                     </>
//                                 )}
//                             </div>
//                         </div>
//                     ))
//                 ) : (
//                     <p className="text-gray-300">Nessun prodotto aggiunto.</p>
//                 )}
//             </div>
//         </div>
//     );
// };
