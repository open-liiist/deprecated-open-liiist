package main

import (
	"fmt"
	"net/http"
	"strconv"
)

const threshold = 5

// ShopCounter holds the status codes.
type ShopCounter [4]int

var (
	conadCounter ShopCounter
	tigreCounter ShopCounter
	grosCounter  ShopCounter
)

// updateCounter increments the appropriate counter based on the code
// and resets it if the threshold is reached.
func updateCounter(counter *ShopCounter, code int) {
	var index int

	switch code {
	case 1:
		index = 0
	case 2:
		index = 1
	case 3:
		index = 2
	case 6:
		index = 3
	default:
		fmt.Println("Unknown code")
		return
	}

	counter[index]++
	if counter[index] == threshold {
		fmt.Printf("Count reached threshold for code %d\n", code)
		counter[index] = 0
	}
}

// handleUpdate processes the code update for the specified shop.
func handleUpdate(shop, codeStr string, w http.ResponseWriter) {
	code, err := strconv.Atoi(codeStr)
	if err != nil {
		http.Error(w, "Invalid code", http.StatusBadRequest)
		return
	}

	switch shop {
	case "conad":
		updateCounter(&conadCounter, code)
		fmt.Println("Conad status code:", conadCounter)
	case "tigre":
		updateCounter(&tigreCounter, code)
		fmt.Println("Tigre status code:", tigreCounter)
	case "gros":
		updateCounter(&grosCounter, code)
		fmt.Println("Gros status code:", grosCounter)
	default:
		http.Error(w, "Shop not found", http.StatusNotFound)
		fmt.Println("Unauthorized access attempt detected for shop:", shop)
	}
}

// handler routes incoming requests based on HTTP method.
func handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	shop := r.FormValue("shop")
	code := r.FormValue("code")
	fmt.Printf("Received code: %s for shop: %s\n", code, shop)
	handleUpdate(shop, code, w)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/", handler)

	fmt.Println("Server running on port 5000...")
	if err := http.ListenAndServe(":5000", mux); err != nil {
		fmt.Println("Server error:", err)
	}
}
