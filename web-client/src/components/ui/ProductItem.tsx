"use client";

import React from "react";
import { Product } from "@/types";

interface ProductItemProps {
  product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  return (
    <li className="flex bg-gray-100 rounded-lg p-4">
      <img
        src={product.img_url}
        alt={product.full_name}
        className="w-16 h-16 object-cover rounded mr-4"
      />
      <div className="flex flex-col justify-center">
        <span className="font-semibold text-gray-800">{product.full_name}</span>
        <span className="text-sm text-gray-600">{product.description}</span>
        <span className="text-blue-700 font-medium">
          €{product.price.toFixed(2)}
        </span>
      </div>
    </li>
  );
};

export default ProductItem;
