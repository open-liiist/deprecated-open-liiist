"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function ConvenienceMode() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [productData, setProductData] = useState([]);
  const [matchingStore, setMatchingStore] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);
  const [position, setPosition] = useState(null);
  const [selectedMode, setSelectedMode] = useState("comodita");

  // Retrieve search parameters from the URL and parse products data
  useEffect(() => {
    const productsParam = searchParams.get("products");
    const listTitleParam = searchParams.get("listTitle");

    try {
      const parsedProducts = JSON.parse(productsParam);
      setProducts(parsedProducts);
      setListTitle(listTitleParam || "Unnamed List");
    } catch (error) {
      console.error("Error parsing data:", error);
    }
  }, [searchParams]);

  // Get user's geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("Error retrieving geolocation:", error);
          // Set default position or handle the error appropriately
          setPosition({
            latitude: 0,
            longitude: 0,
          });
        }
      );
    } else {
      console.error("Geolocation not supported by this browser.");
      // Set default position or handle the error appropriately
      setPosition({
        latitude: 0,
        longitude: 0,
      });
    }
  }, []);

  // Fetch lowest price products based on current position and selected mode
  useEffect(() => {
    const fetchLowestPrice = async () => {
      if (!position) {
        console.error("Position not available.");
        return;
      }
  
      setLoadingProducts(true);
      try {
        const response = await fetch(`/backend/product/lowest-price`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            products: products.map(product => product.name),
            position: {
              latitude: position.latitude,
              longitude: position.longitude,
            },
            mode: selectedMode, // "comodita"
          }),
        });
  
        if (!response.ok) {
          console.error("Error in request to /backend/product/lowest-price:", response.statusText);
          return;
        }
  
        const data = await response.json();
        setProductData(data);
      } catch (error) {
        console.error("Error fetching prices:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
  
    if (products.length > 0 && position) {
      fetchLowestPrice();
    }
  }, [products, position, selectedMode]);
  
  // Fetch matching store based on fetched product data and available stores
  useEffect(() => {
    const fetchMatchingStore = async () => {
      setLoadingStore(true);
      try {
        const response = await fetch(`/backend/stores`);
        const stores = await response.json();

        // Find the first product that has a valid localization grocery
        const firstProduct = products.find(
          (product) => productData[product.id]?.mostSimilar?.localization?.grocery
        );
        if (productData.length > 0) {
          const firstResponse = productData[0];
          const groceryName = firstResponse.shop;

          const matching = stores.find((store) => store.grocery === groceryName);
          setMatchingStore(matching);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setLoadingStore(false);
      }
    };

    if (products.length > 0 && Object.keys(productData).length > 0) {
      fetchMatchingStore();
    }
  }, [products, productData]);

  return (
    <div className="flex flex-col md:flex-row p-5">
      {/* Store Section */}
      <div id="store" className="w-full max-w-xl ml-3">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">Shop</h2>
        {loadingStore ? (
          <p>Loading store...</p>
        ) : matchingStore ? (
          <div className="">
            <strong className="text-lg font-medium text-gray-700">{matchingStore.grocery}</strong>
            <p className="text-sm text-gray-500">{matchingStore.street}, {matchingStore.city}</p>
            <p className="text-sm text-gray-500">ZIP: {matchingStore.zip_code}</p>
            <p className="text-sm text-gray-500">Hours: {matchingStore.working_hours}</p>
            <p className="text-sm text-gray-500">
              {matchingStore.picks_up_in_store ? "In-store pickup available" : "Delivery only"}
            </p>
          </div>
        ) : (
          <p>No matching store found.</p>
        )}
      </div>

      {/* List Section */}
      <div id="list" className="flex flex-col justify-center items-center ml-3 max-w-2xl w-full">
        <header className="w-full max-w-2xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">{listTitle}</h3>
          
          {/* Mode Selector Section */}
          <div className="mb-4">
            <label htmlFor="mode" className="mr-2 text-gray-700">Mode:</label>
            <select
              id="mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded"
            >
              <option value="comodita">Comfort</option>
              <option value="risparmio">Savings</option>
            </select>
          </div>
        </header>
        {loadingProducts && <p>Loading prices...</p>}
        <ul className="w-full max-w-2xl divide-y divide-gray-200">
          {productData.length > 0 ? (
            productData.map((response, index) => (
              <li key={index} className="py-4">
                <div className="flex justify-between">
                  <div>
                    <strong className="text-lg font-medium text-gray-700">{response.shop}</strong>
                    <p className="text-sm text-gray-500">Total Price: {response.total_price.toFixed(2)} €</p>
                    <ul className="mt-2">
                      {response.products.map((product, idx) => (
                        <li key={idx} className="text-sm text-gray-600">
                          {product.name} - {product.price.toFixed(2)} €
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))
          ) : (
            !loadingProducts && <p>No store found offering all requested products.</p>
          )}
        </ul>
      </div>
    </div>
  );
}