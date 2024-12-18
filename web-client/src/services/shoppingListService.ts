export const handleCalculate = async (
	listTitle: string,
	products: { name: string; quantity: number }[],
	budget: string,
	mode: string,
	userId: string,
	router: any,  // Puoi specificare un tipo più preciso se lo desideri
	setIsLoading: (value: boolean) => void,
	setError: (value: string | null) => void
  ) => {
	if (listTitle.trim() === "" || products.length === 0) {
	  setError("Please enter a list title and add at least one product.");
	  return;
	}
  
	setIsLoading(true);
	setError(null);
  
	try {
	  const response = await fetch("/api/shopping-lists", {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		},
		body: JSON.stringify({
		  name: listTitle,
		  products,
		  budget,
		  mode,
		  userId,
		}),
	  });
  
	  if (!response.ok) {
		throw new Error("Failed to save the shopping list");
	  }
  
	  const data = await response.json();
	  const route = mode === "savings" ? "/savings-mode" : "/convenience-mode";
	  router.push(
		`${route}?id=${data.id}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
		  products,
		)}`
	  );
	} catch (err) {
	  setError("Failed to save and calculate the shopping list");
	} finally {
	  setIsLoading(false);
	}
  };

  export const handleCalculate2 = async (
	listId: string | null,
	listTitle: string,
	products: { name: string; quantity: number }[],
	budget: string,
	mode: string,
	userId: string,
	router: any,  // Puoi specificare un tipo più preciso se lo desideri
  ) => {
  
	  const route = mode === "savings" ? "/savings-mode" : "/convenience-mode";
	  router.push(
		`${route}?id=${listId}&listTitle=${listTitle}&budget=${budget}&products=${JSON.stringify(
		  products,
		)}`
	  );
  };