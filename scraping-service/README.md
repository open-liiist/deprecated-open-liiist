# Scraping Service

This microservice is responsible for scraping e-commerce products and sending the data to the `product-receiver` service. The data includes product details like the full name, description, price, discount, and localization information. This service runs on Docker and communicates with other services via HTTP requests.

## Project Structure

```plaintext
/scraping-service 
├── Dockerfile # Dockerfile to containerize the scraping service 
├── scraper.py # Main scraping logic 
├── send_data.py # Handles sending scraped data to the data-receiver service 
├── requirements.txt # Python dependencies 
└── docker-compose.yml # Docker Compose configuration
```

### Prerequisites

- Docker and Docker Compose installed on your system.

### Installation and Setup

Clone the repository and navigate to the `scraping-service` directory.

```bash
git clone git@github.com:gabref/grocygo.git
cd scraping-service
```

### Running the Service

To start the scraping service and all necessary services (e.g., `product-receiver`, `db`), run:

```bash
docker compose build && docker compose up db product-receiver-service scraping-service
```

### How It Works

1. **Scraping (`scraper.py`)**:
   - Simulates scraping with hardcoded product data for now.
   - Sends each scraped product to the `product-receiver` service.

2. **Sending Data (`send_data.py`)**:
   - Uses the `requests` library to make POST requests to the `data-receiver` microservice.
   - Logs the success or failure of each sent product.


