"use client";

import React from "react";
import { Product } from "@/types";

interface ProductItemProps {
  product: Product;
}

const ProductItem: React.FC<ProductItemProps> = ({ product }) => {
  const {
    full_name,
    img_url,
    description,
    price,
    discounted_price,
    quantity,
    external_url,
  } = product;

  return (
    <li className="flex bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <img
        src={img_url}
        alt={full_name}
        className="w-16 h-16 object-cover rounded mr-4"
      />
      <div className="flex flex-col justify-center flex-1">
        <span className="font-semibold text-gray-800">{full_name}</span>
        <span className="text-sm text-gray-600">{description}</span>

        <div className="mt-2">
          {discounted_price ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 line-through">
                €{price.toFixed(2)}
              </span>
              <span className="text-blue-700 font-semibold">
                €{discounted_price.toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-blue-700 font-semibold">
              €{price.toFixed(2)}
            </span>
          )}
        </div>

        {typeof quantity === "number" && (
          <span className="text-sm text-gray-700 mt-1">
            Quantità: {quantity}
          </span>
        )}

        {external_url && (
          <a
            href={external_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded mt-3 hover:bg-blue-600 transition-colors w-fit"
          >
            Vedi Prodotto
          </a>
        )}
      </div>
    </li>
  );
};

export default ProductItem;
