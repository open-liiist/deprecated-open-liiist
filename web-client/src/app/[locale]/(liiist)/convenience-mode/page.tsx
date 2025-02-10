"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/ui/Header";
import ItemCard from "@/components/ui/ItemCard";

export default function ConvenienceMode() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [productData, setProductData] = useState([]);
  const [matchingStore, setMatchingStore] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);
  const [position, setPosition] = useState(null);
  const [selectedMode, setSelectedMode] = useState("comodita"); // Stato per la modalità selezionata


  useEffect(() => {
    const productsParam = searchParams.get("products");
    const listTitleParam = searchParams.get("listTitle");

    try {
      const parsedProducts = JSON.parse(productsParam);
      setProducts(parsedProducts);
      setListTitle(listTitleParam || "Lista senza nome");
    } catch (error) {
      console.error("Errore nel parsing dei dati:", error);
    }
  }, [searchParams]);

  useEffect(() => {
    // Ottenere la posizione dell'utente
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("Errore nel recupero della posizione:", error);
          // Imposta una posizione di default o gestisci l'errore
          setPosition({
            latitude: 0, // Sostituisci con valori appropriati
            longitude: 0,
          });
        }
      );
    } else {
      console.error("Geolocalizzazione non supportata dal browser.");
      // Imposta una posizione di default o gestisci l'errore
      setPosition({
        latitude: 0,
        longitude: 0,
      });
    }
  }, []);

  // useEffect(() => {
  //   const fetchProductPrices = async () => {
  //     if (!position) {
  //       console.error("Posizione non disponibile.");
  //       return;
  //     }

  //     setLoadingProducts(true);
  //     //const newData = {};

  //     try {
  //       for (const product of products) {
  //         const response = await fetch(`/backend/search?query=${encodeURIComponent(product.name)}&position_latitude=${position.latitude}&position_longitude=${position.longitude}`);
  //         const data = await response.json();

  //         newData[product.id] = {
  //           mostSimilar: data.most_similar[0],
  //           lowestPrice: data.lowest_price[0],
  //         };
  //       }
  //       setProductData(newData);
  //     } catch (error) {
  //       console.error("Errore nel fetch dei prezzi:", error);
  //     } finally {
  //       setLoadingProducts(false);
  //     }
  //   };

  //   if (products.length > 0 && position) {
  //     fetchProductPrices();
  //   }
  // }, [products, position]);

  useEffect(() => {
    const fetchLowestPrice = async () => {
      if (!position) {
        console.error("Posizione non disponibile.");
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
            mode: selectedMode, // "comodità"
          }),
        });
  
        if (!response.ok) {
          console.error("Errore nella richiesta a product/lowest-price:", response.statusText);
          return;
        }
  
        const data = await response.json();
  
        // Supponiamo che data sia un array di LowestPriceResponse
        setProductData(data);
      } catch (error) {
        console.error("Errore nel fetch dei prezzi:", error);
      } finally {
        setLoadingProducts(false);
      }
    };
  
    if (products.length > 0 && position) {
      fetchLowestPrice();
    }
  }, [products, position, selectedMode]);
  

  useEffect(() => {
    const fetchMatchingStore = async () => {
      setLoadingStore(true);
      try {
        const response = await fetch(`/backend/stores`);
        const stores = await response.json();

        const firstProduct = products.find(
          (product) => productData[product.id]?.mostSimilar?.localization?.grocery
        );

        // if (firstProduct) {
        //   const groceryName =
        //     productData[firstProduct.id]?.mostSimilar?.localization?.grocery;

        //   const matching = stores.find((store) => store.grocery === groceryName);
        //   setMatchingStore(matching);
        // }
        if (productData.length > 0) {
          const firstResponse = productData[0];
          const groceryName = firstResponse.shop;

          const matching = stores.find((store) => store.grocery === groceryName);
          setMatchingStore(matching);
        }
      } catch (error) {
        console.error("Errore nel fetch dei negozi:", error);
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
      {/* Sezione Store */}
      <div id="store" className="w-full max-w-xl ml-3">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">Shop</h2>
        {loadingStore ? (
          <p>Caricamento negozio...</p>
        ) : matchingStore ? (
          <div className="">
            <strong className="text-lg font-medium text-gray-700">{matchingStore.grocery}</strong>
            <p className="text-sm text-gray-500">{matchingStore.street}, {matchingStore.city}</p>
            <p className="text-sm text-gray-500">CAP: {matchingStore.zip_code}</p>
            <p className="text-sm text-gray-500">Orario: {matchingStore.working_hours}</p>
            <p className="text-sm text-gray-500">
              {matchingStore.picks_up_in_store ? "Ritiro in negozio disponibile" : "Solo consegna a domicilio"}
            </p>
          </div>
        ) : (
          <p>Nessun negozio corrispondente trovato.</p>
        )}
      </div>

      {/* Sezione Lista */}
      <div id="list" className="flex flex-col justify-center items-center ml-3 max-w-2xl w-full">
        <header className="w-full max-w-2xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">{listTitle}</h3>
          
          {/* Sezione Selettore Modalità */}
          <div className="mb-4">
            <label htmlFor="mode" className="mr-2 text-gray-700">Modalità:</label>
            <select
              id="mode"
              value={selectedMode}
              onChange={(e) => setSelectedMode(e.target.value)}
              className="mt-2 p-2 border border-gray-300 rounded"
            >
              <option value="comodita">Comodità</option>
              <option value="risparmio">Risparmio</option>
            </select>
          </div>
        </header>
        {loadingProducts && <p>Caricamento prezzi...</p>}
        <ul className="w-full max-w-2xl divide-y divide-gray-200">
          {productData.length > 0 ? (
            productData.map((response, index) => (
              <li key={index} className="py-4">
                <div className="flex justify-between">
                  <div>
                    <strong className="text-lg font-medium text-gray-700">{response.shop}</strong>
                    <p className="text-sm text-gray-500">Prezzo Totale: {response.total_price.toFixed(2)} €</p>
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
            !loadingProducts && <p>Nessun negozio corrispondente trovato che offre tutti i prodotti richiesti.</p>
          )}
        </ul>
      </div>
    </div>
  );
}