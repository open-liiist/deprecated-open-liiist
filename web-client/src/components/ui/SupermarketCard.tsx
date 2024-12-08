"use client";

import React from "react";
import { Supermarket } from "@/types";
import ProductsList from "./ProductsList";

interface SupermarketCardProps {
  supermarket: Supermarket;
}

const SupermarketCard: React.FC<SupermarketCardProps> = ({ supermarket }) => {
  const {
    name,
    street,
    city,
    zip_code,
    working_hours,
    pickup_available,
    lat,
    long,
  } = supermarket;

  const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
  const longitude = typeof long === "string" ? parseFloat(long) : long;

  const hasValidCoordinates =
    typeof latitude === "number" &&
    !isNaN(latitude) &&
    typeof longitude === "number" &&
    !isNaN(longitude);

  const googleMapsDirectionsUrl = hasValidCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : null;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{name}</h3>
      <p className="text-gray-600">
        {street}, {city} - {zip_code}
      </p>
      <p className="text-sm text-gray-600 mt-1">Orari: {working_hours}</p>
      <p className="text-sm text-gray-600 mt-1">
        {pickup_available
          ? "Ritiro in negozio disponibile"
          : "Ritiro in negozio non disponibile"}
      </p>

      {hasValidCoordinates && (
        <a
          href={googleMapsDirectionsUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors mt-4"
        >
          Ottieni indicazioni
        </a>
      )}

      <ProductsList products={supermarket.products} />
    </div>
  );
};

export default SupermarketCard;
