"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SupermarketCard from "@/components/ui/SupermarketCard";
import ProductTags from "@/components/ui/ProductTags";
import { Supermarket, Product } from "@/types";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

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
          // Fetch della lista
          const response = await fetch(`/api/shopping-lists/${listId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch shopping list");
          }
          const listData = await response.json();

          const userProductsFromList: UserProduct[] = listData.products; 
          setListTitle(listData.name);
          setBudget(listData.budget);
          setUserProducts(userProductsFromList);
          const currentMode = listData.mode === "savings" ? "risparmio" : "comodità";
          setMode(currentMode);

          // Fetch dei supermercati
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

            const userCount = userProductsFromList.length;
            selectedSupermarket.products = selectedSupermarket.products.slice(0, userCount);

            for (let i = 0; i < userCount; i++) {
              if (selectedSupermarket.products[i]) {
                selectedSupermarket.products[i].quantity = userProductsFromList[i].quantity;
              }
            }

            setSupermarket(selectedSupermarket);
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

    const newUserProducts = [...userProducts];
    newUserProducts.splice(index, 1);

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

        {/* Riga con titolo e toggle a sx, edit a dx */}
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
              <FaToggleOn className="text-5xl text-green-600" />
            )}
          </div>
          <FiEdit
            onClick={handleEditList}
            className="text-3xl text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
          />
        </div>

        {/* Budget e Costo Totale sotto il titolo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4 mb-6">
          <span className="text-lg font-semibold text-gray-700">Budget: €{budget}</span>
          <span
            className={`text-lg font-semibold ${
              isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            Costo totale: €{totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Tag dei prodotti */}
        <div className="mb-6 space-y-1">
          <ProductTags products={userProducts} onRemove={handleRemoveProduct} />
        </div>

        {supermarket ? (
          <SupermarketCard supermarket={supermarket} onRemoveProduct={handleRemoveProduct} />
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
