"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SupermarketCard from "@/components/ui/SupermarketCard";
import ProductTags from "@/components/ui/ProductTags";
import { Localization } from "@/types";
import { FaToggleOn, FaToggleOff } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

type UserProduct = {
  name: string;
  quantity: number;
};

const SavingsModePage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [listTitle, setListTitle] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [supermarkets, setSupermarkets] = useState<Localization[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // In savings mode we start with "risparmio"
  const [mode, setMode] = useState<"comodità" | "risparmio">("risparmio"); 
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    const listId = searchParams.get("id");
    const title = searchParams.get("listTitle") || "Shopping List";
    const budgetParam = searchParams.get("budget") || "0";

    setListTitle(title);
    setBudget(budgetParam);

    if (!listId) {
      setError("Missing list ID");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const resList = await fetch(`/api/shopping-lists/${listId}`);
        if (!resList.ok) throw new Error("Failed to fetch shopping list");
        
        const listData = await resList.json();
        const userProductsFromList: UserProduct[] = listData.products || [];
        setListTitle(listData.name);
        setBudget(listData.budget);
        setUserProducts(userProductsFromList);
        
        // Retrieve mode from the database; if mode equals "savings" then set to "risparmio", otherwise "comodità"
        const currentMode = listData.mode === "savings" ? "risparmio" : "comodità";
        setMode(currentMode);

        const resSupermarkets = await fetch(`/api/list-result?userId=${listData.userId}`);
        if (!resSupermarkets.ok) throw new Error("Failed to fetch supermarkets");
        
        const supermarketData = await resSupermarkets.json();
        if (!supermarketData.supermarkets || supermarketData.supermarkets.length < 2) {
          throw new Error("Not enough supermarkets found for savings mode");
        }

        const [market1, market2] = supermarketData.supermarkets;
        const userCount = userProductsFromList.length;
        const half = Math.ceil(userCount / 2);

        // Distribute products for the first supermarket
        market1.products = market1.products.slice(0, half);
        for (let i = 0; i < half; i++) {
          if (market1.products[i]) {
            market1.products[i].quantity = userProductsFromList[i].quantity;
          }
        }

        // Distribute products for the second supermarket
        const secondCount = userCount - half;
        market2.products = market2.products.slice(0, secondCount);
        for (let j = 0; j < secondCount; j++) {
          if (market2.products[j]) {
            market2.products[j].quantity = userProductsFromList[half + j].quantity;
          }
        }

        const finalSupermarkets = [market1, market2];
        setSupermarkets(finalSupermarkets);

        const computedTotal = calcTotalPrice(finalSupermarkets);
        setTotalPrice(computedTotal);

      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  const calcTotalPrice = (sms: Localization[]) => {
    return sms.reduce((acc, sm) => {
      return acc + sm.products.reduce((pAcc, prod) => {
        const productPrice = prod.discounted_price ?? prod.price;
        const q = prod.quantity || 1;
        return pAcc + productPrice * q;
      }, 0);
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
      setError("No list ID found for convenience mode");
      return;
    }

    // We are in savings mode. Clicking changes mode immediately to convenience for UI update.
    setMode("comodità");

    // Redirect to convenience mode after 2 seconds
    setTimeout(() => {
      router.push(`/convenience-mode?id=${listId}&listTitle=${listTitle}&budget=${budget}`);
    }, 2000);
  };

  const handleRemoveProduct = (globalIndex: number) => {
    if (supermarkets.length < 2) return;

    const userCount = userProducts.length;
    const half = Math.ceil(userCount / 2);

    let supermarketIndex = 0;
    let productIndex = globalIndex;

    if (globalIndex >= half) {
      supermarketIndex = 1;
      productIndex = globalIndex - half;
    }

    const newUserProducts = [...userProducts];
    newUserProducts.splice(globalIndex, 1);

    const newSupermarkets = [...supermarkets];
    const newProductsArray = [...newSupermarkets[supermarketIndex].products];
    newProductsArray.splice(productIndex, 1);
    newSupermarkets[supermarketIndex].products = newProductsArray;

    setUserProducts(newUserProducts);
    setSupermarkets(newSupermarkets);

    const newTotal = calcTotalPrice(newSupermarkets);
    setTotalPrice(newTotal);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-600 animate-pulse">Loading...</span>
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

        {/* Title, mode, and toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold text-gray-800">
              {listTitle} - {mode}
            </h1>
            {mode === "risparmio" ? (
              <FaToggleOn
                onClick={handleToggleMode}
                className="text-5xl text-green-600 cursor-pointer hover:text-green-700 transition-colors"
              />
            ) : (
              <FaToggleOff className="text-5xl text-blue-500" />
            )}
          </div>
          <FiEdit
            onClick={handleEditList}
            className="text-3xl text-blue-600 cursor-pointer hover:text-blue-700 transition-colors"
          />
        </div>

        {/* Budget and Total Cost */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start gap-4 mb-6">
          <span className="text-lg font-semibold text-gray-700">Budget: €{budget}</span>
          <span
            className={`text-lg font-semibold ${
              isOverBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            Total Cost: €{totalPrice.toFixed(2)}
          </span>
        </div>

        {/* Product tags */}
        <div className="mb-6 space-y-1">
          <ProductTags products={userProducts} onRemove={handleRemoveProduct} />
        </div>

        {/* Two supermarkets */}
        {supermarkets.map((sm, sIndex) => (
          <SupermarketCard
            key={sIndex}
            supermarket={sm}
            onRemoveProduct={(productIndex) => {
              // Calculate global index
              const userCount = userProducts.length;
              const half = Math.ceil(userCount / 2);

              let globalIndex = productIndex;
              if (sIndex === 1) {
                globalIndex = productIndex + half;
              }

              handleRemoveProduct(globalIndex);
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default SavingsModePage;
