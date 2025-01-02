"use client";

import React from "react";
import { FaTimes } from "react-icons/fa";

// Tipo locale per i tag (UserProduct)
type UserProduct = {
  name: string;
  quantity: number;
};

interface ProductTagsProps {
  products: UserProduct[];
  onRemove: (index: number) => void;
}

const ProductTags: React.FC<ProductTagsProps> = ({ products, onRemove }) => {
  return (
    <div className="flex flex-col items-start justify-center gap-2">
      <div className="flex min-w-[280px] flex-row flex-wrap gap-2.5 rounded-md bg-white py-2 text-magnum-700 focus-within:ring focus-within:ring-magnum-400">
        {products.map((p, index) => (
        <div
        key={index}
        className="flex items-center overflow-hidden rounded-md bg-orange-100 text-black break-words"
      >
        <span className="flex items-center border-r border-white/10 px-1.5">
          {p.name} ({p.quantity})
        </span>
        <button
          onClick={() => onRemove(index)}
          className="flex h-full items-center px-1 hover:bg-orange-200"
        >
          <FaTimes className="w-3 h-3" />
        </button>
      </div>
      
        ))}
      </div>
    </div>
  );
};

export default ProductTags;
