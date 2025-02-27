"use client";

import React from "react";
import { Localization } from "@/types";
import { FaTimes, FaDirections } from "react-icons/fa";

interface SupermarketCardProps {
  supermarket: Localization;
  onRemoveProduct: (index: number) => void;
}

const SupermarketCard: React.FC<SupermarketCardProps> = ({ supermarket, onRemoveProduct }) => {
  const { grocery, street, city, zip_code, working_hours, picks_up_in_store, lat, lng, products } = supermarket;

  // Link direzioni Google Maps se lat/lng validi
  const latitude = typeof lat === "number" && !isNaN(lat) ? lat : null;
  const longitude = typeof lng === "number" && !isNaN(lng) ? lng : null;
  const hasValidCoordinates = latitude !== null && longitude !== null;
  const directionsUrl = hasValidCoordinates
    ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
    : null;

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-800">{grocery}</h3>
        {hasValidCoordinates && (
          <a
            href={directionsUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 transition-colors"
            title="Ottieni indicazioni"
          >
            <FaDirections className="text-2xl" />
          </a>
        )}
      </div>
      <p className="text-gray-600 mb-2">
        {street ?? 'Non disponibile'}, {city ?? 'Non disponibile'} - {zip_code ?? 'Non disponibile'}
      </p>
      <p className="text-sm text-gray-600 mb-2">Orari di apertura: {working_hours ?? 'Non disponibile'}</p>
      <p className="text-sm text-gray-600 mb-4">
        {picks_up_in_store ? "Ritiro in negozio disponibile" : "Ritiro in negozio non disponibile"}
      </p>

      {products && products.length > 0 && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {products.map((prod, index) => {
            const productPrice = prod.discounted_price ?? prod.current_price;
            const isDiscounted = prod.discounted_price !== undefined && prod.discounted_price < prod.current_price;

            return (
              <li
                key={prod.id}
                className="flex bg-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative"
              >
                <img
                  src={prod.image_url ?? '/placeholder.jpg'}
                  alt={prod.full_name}
                  className="w-16 h-16 object-cover rounded mr-4"
                />
                <div className="flex flex-col justify-center flex-1">
                  <span className="font-semibold text-gray-800">{prod.full_name}</span>
                  <span className="text-sm text-gray-600">{prod.description}</span>
                  <div className="mt-2 flex items-center space-x-2">
                    {isDiscounted && (
                      <span className="text-sm text-gray-500 line-through">
                        €{prod.current_price.toFixed(2)}
                      </span>
                    )}
                    <span className="text-blue-700 font-semibold">
                      €{productPrice.toFixed(2)}
                    </span>
                    {prod.quantity && (
                      <span className="text-sm text-gray-700">x {prod.quantity}</span>
                    )}
                  </div>

                  {prod.external_url && (
                    <a
                      href={prod.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-500 text-white text-sm px-3 py-1 rounded mt-3 hover:bg-blue-600 transition-colors w-fit"
                    >
                      Vedi Prodotto
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onRemoveProduct(index)}
                  className="ml-2 text-red-500 hover:text-red-600 font-bold absolute top-2 right-2"
                  title="Rimuovi prodotto"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SupermarketCard;
