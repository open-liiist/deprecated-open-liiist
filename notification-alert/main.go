package main

import (
	"fmt"
	"net/http"
	"strconv"
)

var conad_counter [4]int
var tigre_counter [4]int
var gros_counter [4]int

var cod_counter int = 0

func updateCounter(counter *[4]int, code int) {
	if code == 1 {
		counter[0]++
	} else if code == 2 {
		counter[1]++
	} else if code == 3 {
		counter[2]++
	} else if code == 6 {
		counter[3]++
	} else {
		fmt.Println("Unknown code")
	}
	if (counter[0] == 5) {
		fmt.Println("Sto a 5")
		counter[0] = 0
	} else if counter[1] == 5{
		fmt.Println("Sto a 5")
		counter[1] = 0
	} else if counter[2] == 5{
		fmt.Println("Sto a 5")
		counter[2] = 0
	} else if counter[3] == 5{
		fmt.Println("Sto a 5")
		counter[3] = 0
	}
}

func handler_conad(code string, w http.ResponseWriter) {
	
	intCode, err := strconv.ParseInt(code, 10, 64)
	if err != nil {
		fmt.Println("Error converting code to integer:", err)
		panic(err)
		return
	}

	updateCounter(&conad_counter, int(intCode))
	fmt.Println("Status code:", conad_counter)
}

func handler_tigre(code string, w http.ResponseWriter) {
	
	intCode, err := strconv.ParseInt(code, 10, 64)
	if err != nil {
		fmt.Println("Error converting code to integer:", err)
		panic(err)
		return
	}

	updateCounter(&tigre_counter, int(intCode))
	fmt.Println("Status code:", tigre_counter)
}

func handler_gros(code string, w http.ResponseWriter) {
	
	intCode, err := strconv.ParseInt(code, 10, 64)
	if err != nil {
		fmt.Println("Error converting code to integer:", err)
		panic(err)
		return
	}

	updateCounter(&gros_counter, int(intCode))
	fmt.Println("Status code:", gros_counter)
}

func handler(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {
		code := r.FormValue("code")
		shop := r.FormValue("shop")
		fmt.Println("code ricevuto:", code)
		if (shop == "conad") {
			handler_conad(code, w)
		} else if shop == "tigre" {
			handler_tigre(code, w)
		} else if shop == "gros" {
			handler_gros(code, w)
		} else {
			fmt.Fprintf(w, "404")
			fmt.Println("Someone try to access our server\n")
		}
	} else {
		http.Error(w, "Metodo non consentito", http.StatusMethodNotAllowed)
	}
}

func main() {
	
	mux := http.NewServeMux()
	mux.HandleFunc("/", handler)
	fmt.Println("Server On")
	http.ListenAndServe(":5000", mux)
}
