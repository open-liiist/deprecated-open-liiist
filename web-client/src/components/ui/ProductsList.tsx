"use client";

import React from "react";
import { Product } from "@/types";
import ProductItem from "./ProductItem";

interface ProductsListProps {
  products: Product[];
}

const ProductsList: React.FC<ProductsListProps> = ({ products }) => {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {products.map((prod) => (
        <ProductItem key={prod.uniqueProductId} product={prod} />
      ))}
    </ul>
  );
};

export default ProductsList;
