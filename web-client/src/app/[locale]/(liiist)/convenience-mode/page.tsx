"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/ui/Header";
import ItemCard from "@/components/ui/ItemCard";


export default function ConvenienceMode() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [listTitle, setListTitle] = useState("");
  const [productData, setProductData] = useState({});
  const [matchingStore, setMatchingStore] = useState(null);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingStore, setLoadingStore] = useState(false);

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
    const fetchProductPrices = async () => {
      setLoadingProducts(true);
      const newData = {};

      try {
        for (const product of products) {
          const response = await fetch(`/backend/search?query=${product.name}`);
          const data = await response.json();

          newData[product.id] = {
            mostSimilar: data.most_similar[0],
            lowestPrice: data.lowest_price[0],
          };
        }
        setProductData(newData);
      } catch (error) {
        console.error("Errore nel fetch dei prezzi:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (products.length > 0) {
      fetchProductPrices();
    }
  }, [products]);

  useEffect(() => {
    const fetchMatchingStore = async () => {
      setLoadingStore(true);
      try {
        const response = await fetch(`/backend/stores`);
        const stores = await response.json();

        const firstProduct = products.find(
          (product) => productData[product.id]?.mostSimilar?.localization?.grocery
        );

        if (firstProduct) {
          const groceryName =
            productData[firstProduct.id]?.mostSimilar?.localization?.grocery;

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
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-4">shop</h2>
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
        </header>
        {loadingProducts && <p>Caricamento prezzi...</p>}
        <ul className="w-full max-w-2xl divide-y divide-gray-200">
          {products.map((product) => (
            <ItemCard
              key={product.id}
              product={product}
              data={productData[product.id]}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}