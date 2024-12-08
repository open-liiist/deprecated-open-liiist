"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SupermarketCard from "@/components/ui/SupermarketCard";
import ProductTags from "@/components/ui/ProductTags";
import { Supermarket, Product } from "@/types";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";

type UserProduct = {
  name: string;
  quantity: number;
};

const ConvenienceModePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [listTitle, setListTitle] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [supermarket, setSupermarket] = useState<Supermarket | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [mode, setMode] = useState<"comodità" | "risparmio">("comodità");

  useEffect(() => {
    const listId = searchParams.get("id");
    const title = searchParams.get("listTitle") || "Shopping List";
    const budgetParam = searchParams.get("budget") || "0";

    setListTitle(title);
    setBudget(budgetParam);

    if (listId) {
      const fetchList = async () => {
        try {
          // Fetch dei dati della lista utente
          const response = await fetch(`/api/shopping-lists/${listId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch shopping list");
          }
          const listData = await response.json();

          const userProductsFromList: UserProduct[] = listData.products; 
          // Ci aspettiamo che listData.products sia [{name: string, quantity: number}, ...]
          setListTitle(listData.name);
          setBudget(listData.budget);
          setUserProducts(userProductsFromList);

          // Fetch dei dati del supermercato
          const responseSupermarkets = await fetch(
            `/api/list-result?userId=${listData.userId}`
          );
          if (!responseSupermarkets.ok) {
            throw new Error("Failed to fetch supermarkets");
          }
          const supermarketData = await responseSupermarkets.json();

          if (
            supermarketData.supermarkets &&
            supermarketData.supermarkets.length > 0
          ) {
            let selectedSupermarket: Supermarket = supermarketData.supermarkets[0];

            // Allineiamo il numero di prodotti a quelli dell'utente
            const userCount = userProductsFromList.length;
            selectedSupermarket.products = selectedSupermarket.products.slice(0, userCount);

            // Allineiamo le quantità del supermercato alle quantità dell'utente
            // Ora ogni supermarket.product[i].quantity = userProductsFromList[i].quantity
            for (let i = 0; i < userCount; i++) {
              if (selectedSupermarket.products[i]) {
                selectedSupermarket.products[i].quantity = userProductsFromList[i].quantity;
              }
            }

            setSupermarket(selectedSupermarket);

            // Calcoliamo il total price
            const computedTotal = calcTotalPrice(selectedSupermarket.products);
            setTotalPrice(computedTotal);
          } else {
            throw new Error("No supermarkets found for convenience mode");
          }
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setIsLoading(false);
        }
      };

      fetchList();
    } else {
      setError("Missing list ID");
      setIsLoading(false);
    }
  }, [searchParams]);

  // Calcola il total price usando solo supermarket.products
  // Ora che quantity è allineato, basta moltiplicare price * quantity
  const calcTotalPrice = (products: Product[]) => {
    return products.reduce((acc, prod) => {
      const productPrice = prod.discounted_price ?? prod.price;
      const q = prod.quantity || 1;
      return acc + productPrice * q;
    }, 0);
  };

  const handleEditList = () => {
    const listId = searchParams.get("id");
    if (listId) {
      router.push(`/edit-list?id=${listId}`);
    } else {
      setError("No list ID found to edit");
    }
  };

  const handleToggleMode = () => {
    const listId = searchParams.get("id");
    if (!listId) {
      setError("No list ID found for savings mode");
      return;
    }

    setMode("risparmio");
    setTimeout(() => {
      router.push(`/savings-mode?id=${listId}`);
    }, 2000);
  };

  const handleRemoveProduct = (index: number) => {
    if (!supermarket) return;

    // Rimuoviamo il prodotto da userProducts
    const newUserProducts = [...userProducts];
    newUserProducts.splice(index, 1);

    // Rimuoviamo il prodotto corrispondente da supermarket.products
    const newSupermarket = { ...supermarket };
    newSupermarket.products = [...newSupermarket.products];
    newSupermarket.products.splice(index, 1);

    setUserProducts(newUserProducts);
    setSupermarket(newSupermarket);

    const newTotal = calcTotalPrice(newSupermarket.products);
    setTotalPrice(newTotal);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-600 animate-pulse">Caricamento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-100 text-red-700 p-4 rounded shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  const userBudgetNum = parseFloat(budget);
  const isOverBudget = totalPrice > userBudgetNum;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-800">
              {listTitle} - {mode}
            </h1>
            {mode === "comodità" ? (
              <FaToggleOff
                onClick={handleToggleMode}
                className="text-5xl text-blue-500 cursor-pointer hover:text-blue-600 transition-colors"
              />
            ) : (
              <FaToggleOn className="text-5xl text-blue-600" />
            )}
          </div>
          <div className="text-right">
            <p className="text-gray-700 text-sm">Budget: €{budget}</p>
            <p
              className={`text-lg font-semibold ${
                isOverBudget ? "text-red-600" : "text-green-600"
              }`}
            >
              Costo totale: €{totalPrice.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mb-6 space-y-1">
          <ProductTags products={userProducts} onRemove={handleRemoveProduct} />
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={handleEditList}
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Modifica Lista
          </button>
        </div>

        {supermarket ? (
          <SupermarketCard supermarket={supermarket} />
        ) : (
          <div className="text-center text-gray-500 mt-6">
            Nessun dato del supermercato disponibile
          </div>
        )}
      </div>
    </div>
  );
};

export default ConvenienceModePage;
