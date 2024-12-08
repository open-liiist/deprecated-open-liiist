"use client";

import React from "react";
import { Supermarket } from "@/types";
import ProductsList from "./ProductsList";

interface SupermarketCardProps {
  supermarket: Supermarket;
}

const SupermarketCard: React.FC<SupermarketCardProps> = ({ supermarket }) => {
  return (
    <div className="mt-6">
      <h3 className="text-xl font-medium text-gray-800">{supermarket.name}</h3>
      <p className="text-gray-600 mb-2">
        {supermarket.street}, {supermarket.city} - {supermarket.zip_code}
      </p>
      <p className="text-sm text-gray-600 mb-4">
        Orari di apertura: {supermarket.working_hours}
      </p>

      <ProductsList products={supermarket.products} />
    </div>
  );
};

export default SupermarketCard;
