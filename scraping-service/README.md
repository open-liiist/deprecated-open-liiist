**IN PROGRESS: The scraping-service is currently a work in progress to automate the scraping process, optimizing it for each specific case. It will autonomously send products and stores to the product-receiver, which will then forward them to the database.**
---
Below is an **updated** documentation for the **Scraping Service**, including some **temporary scripts** (`send_*_products_*.py` and `send_*_shop_*.py`) that send scraped data to the **product-receiver** service. It also preserves the original Docker-based (**Status: to change**) instructions and clarifies how the various supermarket/groups scrapers are laid out.


---

# Scraping Service

This microservice is responsible for **scraping e-commerce products** from various supermarkets (e.g. Tigre, Gros, Conad, etc.) and **sending** the resulting data to the **Product Receiver Service** (running on `http://localhost:3002/api` by default). The data includes products (price, discount, localization, etc.) and stores (name, lat, lng, street, etc.). Some scripts read from **CSV**, others from **JSON**.

---

## Table of Contents

1. [Introduction](#introduction)  
2. [Project Structure](#project-structure)  
3. [Prerequisites](#prerequisites)  
4. [Installation and Setup](#installation-and-setup)  
5. [Running with Docker](#running-with-docker)  
6. [Core Scripts for Sending Data](#core-scripts-for-sending-data)  
   - [send_gros_products_json.py](#send_gros_products_jsonpy)  
   - [send_gros_shop_json.py](#send_gros_shop_jsonpy)  
   - [send_oasi_tigre_products_csv.py](#send_oasi_tigre_products_csvpy)  
   - [send_oasi_tigre_products_json.py](#send_oasi_tigre_products_jsonpy)  
   - [send_oasi_tigre_shop_json.py](#send_oasi_tigre_shop_jsonpy)  
7. [Other Scraping Scripts](#other-scraping-scripts)  
8. [Examples of Valid/Invalid Data](#examples-of-validinvalid-data)  
9. [Troubleshooting](#troubleshooting)  

---

## Introduction

The **Scraping Service** runs a variety of **scrapers** (one per supermarket/group) to gather product and store data. Once scraped, these scripts **normalize** or **clean** the data, then **send** it to the [Product Receiver Service](https://github.com/your-org/product-receiver-service) via simple **HTTP POST** to `/api/product` or `/api/store`.

Key tasks:

- Scrape data → e.g., price, discount, lat/lng, store name, etc.  
- Format/validate/clean → rename `long`→`lng`, (**IT NEEDS TO BE RESOLVE URGENTLY**) handle float conversions, clamp discount, etc.  
- Call `POST http://localhost:3002/api/product` or `POST http://localhost:3002/api/store` with **retry** logic.  

---

## Project Structure

Your repository includes:

```
scraping-service
├── Dockerfile
├── README.md
├── requirements.txt
├── send_gros_products_json.py
├── send_gros_shop_json.py
├── send_oasi_tigre_products_csv.py
├── send_oasi_tigre_products_json.py
├── send_oasi_tigre_shop_json.py
├── scraping_services
│   ├── Dockerfile
│   ├── ...
│   └── scraping
│       ├── gros_group
│       │   ├── cts
│       │   ├── dem
│       │   └── ...
│       └── oasi_tigre
│           ├── ...
├── path
│   └── to
│       └── venv
└── ...
```

- **`send_gros_products_json.py`** and **`send_gros_shop_json.py`**: Scripts sending scraped data for the Gros chain (products/stores) to the product-receiver.  
- **`send_oasi_tigre_products_csv.py`**, **`send_oasi_tigre_products_json.py`**, and **`send_oasi_tigre_shop_json.py`**: Scripts for the Oasi/Tigre chain, reading CSV or JSON data, then posting it.  
- **`scraping_services/`**: Various subfolders with actual scrapers for each brand (e.g. `scraping_cts.py`, `scraping_dem.py`, etc.). Those produce or store data that is eventually fed to the send_* scripts above.  

---

## Prerequisites

- **Docker** and **Docker Compose** installed.  
- Python 3.x if you run scripts locally (not strictly required if you only use Docker).  

---

## Installation and Setup

1. **Clone** the repository and navigate into `scraping-service`:
   ```bash
   git clone git@github.com:open-liiist/open-liiist.git
   cd scraping-service
   ```

2. **Install Python dependencies** (if running locally, outside of Docker):
   ```bash
   pip install -r requirements.txt
   ```

3. **(Optional)** Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

---

## Running with Docker

### 1. Build the Docker Image

Example:

```bash
docker build -f Dockerfile -t scraping_service .
```

*(Or you can build specialized Dockerfiles in `scraping_services/` for specific scrapers.)*

### 2. Launch the Container Using Docker Compose

If your `docker-compose.yml` is set up to define a `scraping` service:

```bash
docker-compose up -d scraping
```

*(Make sure your Product Receiver Service (+logstash:5000) is also up and running at `http://localhost:3002/api` or the correct host/port as per your environment.)*

---

## Core Scripts for Sending Data

These scripts are the final step in your pipeline: they read **JSON or CSV** outputs from your scrapers and **POST** to the product-receiver endpoints.

### 1. **send_gros_products_json.py**

- **Usage**: Reads a (potentially large) JSON file with product data from the Gros chain, normalizes fields (`price`, `discount`, `localization`) and sends each item to `POST /api/product`.  
- **Key Features**:
  - Uses **ijson** for streaming large JSON.  
  - **Retry** logic on network/5xx errors.  
  - If data looks like a store (has `street` + `picks_up_in_shop`), it posts to `/api/store` instead.

### 2. **send_gros_shop_json.py**

- **Usage**: Sends **store** data (for Gros chain) to `POST /api/store`.  
- **Key Features**:
  - Renames `long` → `lng`.  
  - Converts `picks_up_in_shop` from string → bool.  
  - If `zip_code` is `null`, converts to `""`.  

### 3. **send_oasi_tigre_products_csv.py**

- **Usage**: Reads a **CSV** file with Oasi/Tigre products. Each row maps to columns like `name,full_name,img_url,price,discount,localization.grocery, ...`.  
- **Key Features**:
  - Converts discount > 1.0 to 1.0 to meet Zod’s `0..1` requirement.  
  - Skips rows missing essential fields like `full_name`.  
  - Posts to `/api/product`.

### 4. **send_oasi_tigre_products_json.py**

- **Usage**: Reads a **JSON** array of product data from Oasi/Tigre.  
- **Key Features**:
  - Clamps `discount` to <= 1.0.  
  - Renames `long` → `lng`.  
  - Sends data to `POST /api/product`.

### 5. **send_oasi_tigre_shop_json.py**

- **Usage**: Sends **store** data for Oasi/Tigre to `POST /api/store`.  
- **Key Features**:
  - Normalizes lat/lng, converts `working_hours` from string → JSON, `picks_up_in_shop` from string → boolean.  

---

## Other Scraping Scripts

Inside `scraping_services/` you have a variety of brand-specific scrapers (e.g. `scraping_cts.py`, `scraping_pim.py`, etc.). These scripts usually:

1. **Crawl** or **scrape** data from the target website.  
2. Generate **JSON or CSV** outputs.  
3. You can then **run** the `send_*.py` scripts to push the scraped data to the product-receiver.

**Example** workflow:

1. Run `scraping_cts.py` to produce a JSON of products.  
2. Run `send_gros_products_json.py` or `send_oasi_tigre_products_json.py` (depending on brand) to actually push them upstream.

---

## Examples of Valid/Invalid Data

### 1. Product Example (Valid)
```json
{
  "full_name": "Treccine patate e rosmarino 400 gr",
  "img_url": "https://www.oasitigre.it/content/.../main-360x360.jpeg",
  "price": 2.35,
  "discount": 0.95,
  "localization": {
    "grocery": "Supermercato Tigre",
    "lat": 41.959978,
    "lng": 12.5351033
  }
}
```

### 2. Product Example (Invalid discount)
```json
{
  "full_name": "Treccine patate e rosmarino 400 gr",
  "img_url": "https://www.oasitigre.it/content/.../main-360x360.jpeg",
  "price": 2.35,
  "discount": 1.89,     // > 1.0
  "localization": {
    "grocery": "Supermercato Tigre",
    "lat": 41.959978,
    "lng": 12.5351033
  }
}
```
*(Will be clamped or cause a 400 Bad Request if not handled in your script.)*

### 3. Store Example (Valid)
```json
{
  "name": "Supermercato Tigre",
  "lat": 41.8015413,
  "lng": 12.5980664,
  "street": "Piazza Trento e Trieste, 11",
  "city": "Ciampino",
  "picks_up_in_shop": true,
  "zip_code": "00043"
}
```

### 4. Store Example (Invalid)
```json
{
  "name": "Supermercato Tigre",
  "lat": 41.8015413,
  "long": 12.5980664,   // Must rename to 'lng'
  "picks_up_in_shop": "True",   // Must convert string->bool
  "zip_code": null     //  Also might need to handle null => ""
}
```
*(Handled automatically by your Python scripts if correctly configured.)*

---

## Troubleshooting

- **Validation errors** (`discount: Number must be less or equal to 1`):  
  Make sure to clamp or convert `discount` if it’s meant to be a fraction (0..1).  
- **Connection errors**:  
  If the product-receiver is not running at `localhost:3002`, set the `PRODUCT_RECEIVER_BASE_URL` environment variable to the correct host.  
- **Docker issues**:  
  Ensure your Docker Compose file is up to date and that all containers (`scraping`, `product-receiver`, etc.) are properly networked.

---

**Happy Scraping!**  

If you have any questions or find issues, please open an issue in this repository or contact the team.